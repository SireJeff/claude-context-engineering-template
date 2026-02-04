/**
 * Context Indexer
 *
 * Indexes existing AI context documents (workflows, agents, commands).
 */
import { DatabaseClient } from '../db/client.js';
import { EmbeddingsManager } from '../db/embeddings.js';
import type { ContextType } from '../db/schema.js';
/**
 * Indexing result
 */
export interface IndexResult {
    indexed: number;
    skipped: number;
    errors: string[];
}
/**
 * Context document indexer
 */
export declare class ContextIndexer {
    private db;
    private embeddings;
    private projectRoot;
    constructor(db: DatabaseClient, embeddings: EmbeddingsManager, projectRoot: string);
    /**
     * Index all context documents
     */
    indexAll(): Promise<IndexResult>;
    /**
     * Index a specific category of documents
     */
    private indexCategory;
    /**
     * Index a single file
     */
    indexFile(filePath: string, type: ContextType): Promise<boolean>;
    /**
     * Extract document name from path or content
     */
    private extractName;
    /**
     * Extract metadata from document content
     */
    private extractMetadata;
    /**
     * Re-index a specific file
     */
    reindexFile(filePath: string): Promise<boolean>;
    /**
     * Remove indexed file
     */
    removeFile(filePath: string): boolean;
}
//# sourceMappingURL=context.d.ts.map