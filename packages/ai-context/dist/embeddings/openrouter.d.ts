/**
 * OpenRouter Client
 *
 * Client for OpenRouter API supporting both embeddings and chat completions.
 * Used for intelligent initialization and context understanding.
 */
/**
 * Message for chat completion
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
/**
 * Configuration for OpenRouter client
 */
export interface OpenRouterConfig {
    apiKey: string;
    embeddingModel?: string;
    chatModel?: string;
    siteUrl?: string;
    siteName?: string;
}
/**
 * OpenRouter client for embeddings and chat
 */
export declare class OpenRouterClient {
    private apiKey;
    private embeddingModel;
    private chatModel;
    private siteUrl;
    private siteName;
    private embeddingCache;
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
     * Chat completion - for intelligent context understanding
     */
    chat(messages: ChatMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
        model?: string;
    }): Promise<string>;
    /**
     * Analyze codebase content intelligently
     */
    analyzeContent(content: string, analysisType: 'summarize' | 'extract_workflows' | 'extract_architecture' | 'suggest_context'): Promise<string>;
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
export declare function createOpenRouterClient(): OpenRouterClient;
/**
 * Check if OpenRouter API key is available
 */
export declare function hasOpenRouterKey(): boolean;
//# sourceMappingURL=openrouter.d.ts.map