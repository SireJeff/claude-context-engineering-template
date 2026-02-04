/**
 * Context Indexer
 *
 * Indexes existing AI context documents (workflows, agents, commands).
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
/**
 * Context document patterns
 */
const CONTEXT_PATTERNS = {
    workflow: {
        patterns: ['**/context/workflows/*.md', '**/workflows/*.md'],
        type: 'workflow'
    },
    agent: {
        patterns: ['**/agents/*.md', '**/.claude/agents/*.md'],
        type: 'agent'
    },
    command: {
        patterns: ['**/commands/*.md', '**/.claude/commands/*.md'],
        type: 'command'
    },
    config: {
        patterns: ['**/AI_CONTEXT.md', '**/CLAUDE.md', '**/.clinerules', '**/.github/copilot-instructions.md'],
        type: 'config'
    }
};
/**
 * Context document indexer
 */
export class ContextIndexer {
    db;
    embeddings;
    projectRoot;
    constructor(db, embeddings, projectRoot) {
        this.db = db;
        this.embeddings = embeddings;
        this.projectRoot = projectRoot;
    }
    /**
     * Index all context documents
     */
    async indexAll() {
        const result = {
            indexed: 0,
            skipped: 0,
            errors: []
        };
        for (const [category, config] of Object.entries(CONTEXT_PATTERNS)) {
            try {
                const categoryResult = await this.indexCategory(config.patterns, config.type);
                result.indexed += categoryResult.indexed;
                result.skipped += categoryResult.skipped;
                result.errors.push(...categoryResult.errors);
            }
            catch (error) {
                result.errors.push(`Error indexing ${category}: ${error}`);
            }
        }
        return result;
    }
    /**
     * Index a specific category of documents
     */
    async indexCategory(patterns, type) {
        const result = {
            indexed: 0,
            skipped: 0,
            errors: []
        };
        for (const pattern of patterns) {
            const files = await glob(pattern, {
                cwd: this.projectRoot,
                ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
                absolute: true
            });
            for (const filePath of files) {
                try {
                    const indexed = await this.indexFile(filePath, type);
                    if (indexed) {
                        result.indexed++;
                    }
                    else {
                        result.skipped++;
                    }
                }
                catch (error) {
                    result.errors.push(`Error indexing ${filePath}: ${error}`);
                }
            }
        }
        return result;
    }
    /**
     * Index a single file
     */
    async indexFile(filePath, type) {
        if (!fs.existsSync(filePath)) {
            return false;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const name = this.extractName(filePath, content);
        const relativePath = path.relative(this.projectRoot, filePath);
        // Extract metadata from content
        const metadata = this.extractMetadata(content, type);
        // Upsert to database
        const item = this.db.upsertItem({
            type,
            name,
            content,
            filePath: relativePath,
            metadata
        });
        // Queue for embedding
        this.embeddings.queueForEmbedding(item.id);
        return true;
    }
    /**
     * Extract document name from path or content
     */
    extractName(filePath, content) {
        // Try to extract from markdown heading
        const headingMatch = content.match(/^#\s+(.+)$/m);
        if (headingMatch) {
            return headingMatch[1].trim();
        }
        // Fall back to filename
        return path.basename(filePath, path.extname(filePath));
    }
    /**
     * Extract metadata from document content
     */
    extractMetadata(content, type) {
        const metadata = {};
        // Extract YAML frontmatter if present
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
            // Simple key-value extraction (not full YAML parsing)
            const lines = frontmatterMatch[1].split('\n');
            for (const line of lines) {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    metadata[key.trim()] = valueParts.join(':').trim();
                }
            }
        }
        // Extract sections
        const sections = content.match(/^##\s+(.+)$/gm);
        if (sections) {
            metadata.sections = sections.map(s => s.replace(/^##\s+/, ''));
        }
        // Count lines and characters
        metadata.lineCount = content.split('\n').length;
        metadata.charCount = content.length;
        return metadata;
    }
    /**
     * Re-index a specific file
     */
    async reindexFile(filePath) {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.join(this.projectRoot, filePath);
        // Determine type from path
        let type = 'config';
        if (filePath.includes('/workflows/')) {
            type = 'workflow';
        }
        else if (filePath.includes('/agents/')) {
            type = 'agent';
        }
        else if (filePath.includes('/commands/')) {
            type = 'command';
        }
        return this.indexFile(absolutePath, type);
    }
    /**
     * Remove indexed file
     */
    removeFile(filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        // Find item by file path
        const items = this.db.getAllItems().filter(item => item.filePath === relativePath);
        for (const item of items) {
            this.db.deleteItem(item.id);
            this.embeddings.deleteEmbedding(item.id);
        }
        return items.length > 0;
    }
}
//# sourceMappingURL=context.js.map