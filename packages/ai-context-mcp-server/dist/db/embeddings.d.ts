/**
 * Vector Embeddings Database Operations
 *
 * Handles storing and querying embeddings in SQLite using sqlite-vec.
 */
import Database from 'better-sqlite3';
import { OpenRouterEmbeddings } from '../embeddings/openrouter.js';
/**
 * Embedding record
 */
export interface EmbeddingRecord {
    contextId: string;
    embedding: number[];
}
/**
 * Semantic search result
 */
export interface SemanticSearchResult {
    contextId: string;
    distance: number;
    similarity: number;
}
/**
 * Vector embeddings manager
 */
export declare class EmbeddingsManager {
    private db;
    private client;
    private dimension;
    constructor(db: Database.Database, client?: OpenRouterEmbeddings);
    /**
     * Store embedding for a context item
     */
    storeEmbedding(contextId: string, content: string): Promise<void>;
    /**
     * Store embeddings for multiple items (batch)
     */
    storeEmbeddingsBatch(items: Array<{
        contextId: string;
        content: string;
    }>): Promise<void>;
    /**
     * Semantic search for similar items
     */
    search(query: string, limit?: number, minSimilarity?: number): Promise<SemanticSearchResult[]>;
    /**
     * Find similar items to a given context ID
     */
    findSimilar(contextId: string, limit?: number): Promise<SemanticSearchResult[]>;
    /**
     * Delete embedding for a context item
     */
    deleteEmbedding(contextId: string): boolean;
    /**
     * Check if embedding exists for a context item
     */
    hasEmbedding(contextId: string): boolean;
    /**
     * Get count of stored embeddings
     */
    getCount(): number;
    /**
     * Queue an item for embedding generation
     */
    queueForEmbedding(contextId: string): void;
    /**
     * Process embedding queue
     */
    processQueue(batchSize?: number): Promise<number>;
    /**
     * Clear embedding cache
     */
    clearCache(): void;
}
//# sourceMappingURL=embeddings.d.ts.map