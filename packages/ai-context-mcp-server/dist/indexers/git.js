/**
 * Git History Indexer
 *
 * Indexes git commits, branches, and history for semantic search.
 */
import { simpleGit } from 'simple-git';
/**
 * Git history indexer
 */
export class GitIndexer {
    db;
    embeddings;
    projectRoot;
    git;
    constructor(db, embeddings, projectRoot) {
        this.db = db;
        this.embeddings = embeddings;
        this.projectRoot = projectRoot;
        this.git = simpleGit(projectRoot);
    }
    /**
     * Check if project is a git repository
     */
    async isGitRepo() {
        try {
            await this.git.status();
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Index git history
     */
    async indexHistory(options = {}) {
        const result = {
            commits: 0,
            errors: []
        };
        if (!await this.isGitRepo()) {
            result.errors.push('Not a git repository');
            return result;
        }
        try {
            // Get commit log
            const logOptions = {};
            if (options.maxCommits) {
                logOptions.maxCount = options.maxCommits;
            }
            else {
                logOptions.maxCount = 500; // Default limit
            }
            if (options.since) {
                logOptions.from = options.since;
            }
            const log = await this.git.log(logOptions);
            for (const commit of log.all) {
                try {
                    await this.indexCommit(commit);
                    result.commits++;
                }
                catch (error) {
                    result.errors.push(`Error indexing commit ${commit.hash}: ${error}`);
                }
            }
        }
        catch (error) {
            result.errors.push(`Error fetching git log: ${error}`);
        }
        return result;
    }
    /**
     * Index a single commit
     */
    async indexCommit(commit) {
        // Get files changed in this commit
        let filesChanged = [];
        let stats = { additions: 0, deletions: 0 };
        try {
            const diff = await this.git.diffSummary([`${commit.hash}^..${commit.hash}`]);
            filesChanged = diff.files.map(f => f.file);
            stats = {
                additions: diff.insertions,
                deletions: diff.deletions
            };
        }
        catch {
            // First commit or other issues - skip file details
        }
        // Store in database
        const gitCommit = {
            sha: commit.hash,
            message: commit.message,
            authorName: commit.author_name,
            authorEmail: commit.author_email,
            timestamp: commit.date,
            filesChanged,
            stats
        };
        this.db.upsertCommit(gitCommit);
        // Also create a context item for semantic search
        const content = this.createCommitSummary(gitCommit);
        const item = this.db.upsertItem({
            type: 'commit',
            name: `commit-${commit.hash.slice(0, 7)}`,
            content,
            metadata: {
                sha: commit.hash,
                author: commit.author_email,
                timestamp: commit.date,
                filesChanged: filesChanged.length,
                additions: stats.additions,
                deletions: stats.deletions
            }
        });
        // Queue for embedding
        this.embeddings.queueForEmbedding(item.id);
    }
    /**
     * Create a summary of a commit for embedding
     */
    createCommitSummary(commit) {
        const parts = [
            `Commit: ${commit.sha.slice(0, 7)}`,
            `Author: ${commit.authorName} <${commit.authorEmail}>`,
            `Date: ${commit.timestamp}`,
            '',
            commit.message
        ];
        if (commit.filesChanged && commit.filesChanged.length > 0) {
            parts.push('');
            parts.push(`Files changed (${commit.filesChanged.length}):`);
            // Limit to first 20 files
            const filesToShow = commit.filesChanged.slice(0, 20);
            for (const file of filesToShow) {
                parts.push(`  - ${file}`);
            }
            if (commit.filesChanged.length > 20) {
                parts.push(`  ... and ${commit.filesChanged.length - 20} more`);
            }
        }
        if (commit.stats) {
            parts.push('');
            parts.push(`Changes: +${commit.stats.additions} -${commit.stats.deletions}`);
        }
        return parts.join('\n');
    }
    /**
     * Get recent commits (from database)
     */
    getRecentCommits(limit = 50) {
        return this.db.getRecentCommits(limit);
    }
    /**
     * Index commits since last indexed
     */
    async indexNewCommits() {
        const recentCommits = this.db.getRecentCommits(1);
        if (recentCommits.length === 0) {
            // No commits indexed yet, index all
            return this.indexHistory();
        }
        const lastCommit = recentCommits[0];
        // Index commits since last indexed commit
        return this.indexHistory({
            since: lastCommit.sha
        });
    }
    /**
     * Get commit by SHA
     */
    async getCommit(sha) {
        // Check database first
        const commits = this.db.getRecentCommits(1000); // This is not ideal, but simple
        const dbCommit = commits.find(c => c.sha.startsWith(sha));
        if (dbCommit) {
            return dbCommit;
        }
        // Fetch from git if not in database
        try {
            const log = await this.git.log({ maxCount: 1, from: sha, to: sha });
            if (log.all.length > 0) {
                const commit = log.all[0];
                return {
                    sha: commit.hash,
                    message: commit.message,
                    authorName: commit.author_name,
                    authorEmail: commit.author_email,
                    timestamp: commit.date
                };
            }
        }
        catch {
            return null;
        }
        return null;
    }
    /**
     * Get current branch name
     */
    async getCurrentBranch() {
        try {
            const status = await this.git.status();
            return status.current;
        }
        catch {
            return null;
        }
    }
    /**
     * Get list of branches
     */
    async getBranches() {
        try {
            const branches = await this.git.branchLocal();
            return branches.all;
        }
        catch {
            return [];
        }
    }
    /**
     * Remove all indexed commits
     */
    removeAllCommits() {
        const items = this.db.getItemsByType('commit');
        let removed = 0;
        for (const item of items) {
            if (this.db.deleteItem(item.id)) {
                this.embeddings.deleteEmbedding(item.id);
                removed++;
            }
        }
        return removed;
    }
}
//# sourceMappingURL=git.js.map