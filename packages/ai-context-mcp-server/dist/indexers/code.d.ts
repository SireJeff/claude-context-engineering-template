/**
 * Code Indexer
 *
 * Indexes source code files for semantic search.
 */
import { DatabaseClient } from '../db/client.js';
import { EmbeddingsManager } from '../db/embeddings.js';
/**
 * Indexing result
 */
export interface CodeIndexResult {
    files: number;
    chunks: number;
    errors: string[];
}
/**
 * Source code indexer
 */
export declare class CodeIndexer {
    private db;
    private embeddings;
    private projectRoot;
    private maxChunkSize;
    constructor(db: DatabaseClient, embeddings: EmbeddingsManager, projectRoot: string, maxChunkSize?: number);
    /**
     * Index all source code
     */
    indexAll(languages?: string[]): Promise<CodeIndexResult>;
    /**
     * Index files for a specific language
     */
    private indexLanguage;
    /**
     * Index a single source file
     */
    indexFile(filePath: string, language: string): Promise<number>;
    /**
     * Split code into manageable chunks
     */
    private chunkCode;
    /**
     * Extract semantic chunks (functions, classes) from code
     */
    private extractSemanticChunks;
    /**
     * Create a summary for embedding (file context + content)
     */
    private createCodeSummary;
    /**
     * Extract imports from code
     */
    private extractImports;
    /**
     * Extract exports from code
     */
    private extractExports;
    /**
     * Remove indexed code files
     */
    removeCodeFiles(): number;
}
//# sourceMappingURL=code.d.ts.map