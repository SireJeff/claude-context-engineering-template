/**
 * OpenRouter Embeddings Client
 *
 * Generates embeddings using OpenRouter API for semantic search.
 * Uses text-embedding-3-small compatible models.
 */
import { createHash } from 'crypto';
/**
 * OpenRouter API configuration
 */
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/embeddings';
const DEFAULT_MODEL = 'openai/text-embedding-3-small';
const EMBEDDING_DIMENSION = 1536;
/**
 * OpenRouter embeddings client
 */
export class OpenRouterEmbeddings {
    apiKey;
    model;
    siteUrl;
    siteName;
    cache = new Map();
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('OPENROUTER_API_KEY is required');
        }
        this.apiKey = config.apiKey;
        this.model = config.model || DEFAULT_MODEL;
        this.siteUrl = config.siteUrl || 'https://github.com/SireJeff/claude-context-engineering-template';
        this.siteName = config.siteName || 'AI Context MCP Server';
    }
    /**
     * Generate embedding for a single text
     */
    async embed(text) {
        // Check cache
        const cacheKey = this.hashText(text);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': this.siteUrl,
                'X-Title': this.siteName
            },
            body: JSON.stringify({
                model: this.model,
                input: text
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
        }
        const data = await response.json();
        const embedding = data.data[0].embedding;
        // Cache the result
        this.cache.set(cacheKey, embedding);
        return embedding;
    }
    /**
     * Generate embeddings for multiple texts (batch)
     */
    async embedBatch(texts) {
        // Check cache for all texts
        const uncachedTexts = [];
        const uncachedIndices = [];
        const results = texts.map((text, index) => {
            const cacheKey = this.hashText(text);
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            uncachedTexts.push(text);
            uncachedIndices.push(index);
            return null;
        });
        // If all cached, return immediately
        if (uncachedTexts.length === 0) {
            return results;
        }
        // Batch request to OpenRouter
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': this.siteUrl,
                'X-Title': this.siteName
            },
            body: JSON.stringify({
                model: this.model,
                input: uncachedTexts
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
        }
        const data = await response.json();
        // Fill in results and cache
        for (let i = 0; i < data.data.length; i++) {
            const embedding = data.data[i].embedding;
            const originalIndex = uncachedIndices[i];
            const text = uncachedTexts[i];
            results[originalIndex] = embedding;
            this.cache.set(this.hashText(text), embedding);
        }
        return results;
    }
    /**
     * Calculate cosine similarity between two embeddings
     */
    static cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Embeddings must have the same dimension');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        if (magnitude === 0)
            return 0;
        return dotProduct / magnitude;
    }
    /**
     * Get embedding dimension
     */
    getDimension() {
        return EMBEDDING_DIMENSION;
    }
    /**
     * Clear embedding cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Get cache size
     */
    getCacheSize() {
        return this.cache.size;
    }
    /**
     * Hash text for caching
     */
    hashText(text) {
        return createHash('md5').update(text).digest('hex');
    }
}
/**
 * Create OpenRouter client from environment
 */
export function createEmbeddingsClient() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY environment variable is required.\n' +
            'Get your API key at: https://openrouter.ai/keys');
    }
    return new OpenRouterEmbeddings({
        apiKey,
        model: process.env.OPENROUTER_EMBEDDING_MODEL || DEFAULT_MODEL
    });
}
//# sourceMappingURL=openrouter.js.map