/**
 * Git History Indexer
 *
 * Indexes git commits, branches, and history for semantic search.
 */
import { DatabaseClient, type GitCommit } from '../db/client.js';
import { EmbeddingsManager } from '../db/embeddings.js';
/**
 * Git indexing result
 */
export interface GitIndexResult {
    commits: number;
    errors: string[];
}
/**
 * Git history indexer
 */
export declare class GitIndexer {
    private db;
    private embeddings;
    private projectRoot;
    private git;
    constructor(db: DatabaseClient, embeddings: EmbeddingsManager, projectRoot: string);
    /**
     * Check if project is a git repository
     */
    isGitRepo(): Promise<boolean>;
    /**
     * Index git history
     */
    indexHistory(options?: {
        maxCommits?: number;
        since?: string;
        branch?: string;
    }): Promise<GitIndexResult>;
    /**
     * Index a single commit
     */
    private indexCommit;
    /**
     * Create a summary of a commit for embedding
     */
    private createCommitSummary;
    /**
     * Get recent commits (from database)
     */
    getRecentCommits(limit?: number): GitCommit[];
    /**
     * Index commits since last indexed
     */
    indexNewCommits(): Promise<GitIndexResult>;
    /**
     * Get commit by SHA
     */
    getCommit(sha: string): Promise<GitCommit | null>;
    /**
     * Get current branch name
     */
    getCurrentBranch(): Promise<string | null>;
    /**
     * Get list of branches
     */
    getBranches(): Promise<string[]>;
    /**
     * Remove all indexed commits
     */
    removeAllCommits(): number;
}
//# sourceMappingURL=git.d.ts.map