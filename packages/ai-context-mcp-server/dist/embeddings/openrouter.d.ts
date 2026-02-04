/**
 * OpenRouter Embeddings Client
 *
 * Generates embeddings using OpenRouter API for semantic search.
 * Uses text-embedding-3-small compatible models.
 */
/**
 * Configuration for OpenRouter client
 */
export interface OpenRouterConfig {
    apiKey: string;
    model?: string;
    siteUrl?: string;
    siteName?: string;
}
/**
 * OpenRouter embeddings client
 */
export declare class OpenRouterEmbeddings {
    private apiKey;
    private model;
    private siteUrl;
    private siteName;
    private cache;
    constructor(config: OpenRouterConfig);
    /**
     * Generate embedding for a single text
     */
    embed(text: string): Promise<number[]>;
    /**
     * Generate embeddings for multiple texts (batch)
     */
    embedBatch(texts: string[]): Promise<number[][]>;
    /**
     * Calculate cosine similarity between two embeddings
     */
    static cosineSimilarity(a: number[], b: number[]): number;
    /**
     * Get embedding dimension
     */
    getDimension(): number;
    /**
     * Clear embedding cache
     */
    clearCache(): void;
    /**
     * Get cache size
     */
    getCacheSize(): number;
    /**
     * Hash text for caching
     */
    private hashText;
}
/**
 * Create OpenRouter client from environment
 */
export declare function createEmbeddingsClient(): OpenRouterEmbeddings;
//# sourceMappingURL=openrouter.d.ts.map