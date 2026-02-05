/**
 * OpenRouter Client
 * 
 * Client for OpenRouter API supporting both embeddings and chat completions.
 * Used for intelligent initialization and context understanding.
 */

import { createHash } from 'crypto';

/**
 * OpenRouter API endpoints
 */
const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Default models
 */
const DEFAULT_EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const DEFAULT_CHAT_MODEL = 'anthropic/claude-3-haiku';
const EMBEDDING_DIMENSION = 1536;

/**
 * Embedding response from OpenRouter
 */
interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Chat completion response from OpenRouter
 */
interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

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
export class OpenRouterClient {
  private apiKey: string;
  private embeddingModel: string;
  private chatModel: string;
  private siteUrl: string;
  private siteName: string;
  private embeddingCache: Map<string, number[]> = new Map();

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error('OPENROUTER_API_KEY is required');
    }
    
    this.apiKey = config.apiKey;
    this.embeddingModel = config.embeddingModel || DEFAULT_EMBEDDING_MODEL;
    this.chatModel = config.chatModel || DEFAULT_CHAT_MODEL;
    this.siteUrl = config.siteUrl || 'https://github.com/SireJeff/claude-context-engineering-template';
    this.siteName = config.siteName || 'AI Context';
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text: string): Promise<number[]> {
    // Check cache
    const cacheKey = this.hashText(text);
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName
      },
      body: JSON.stringify({
        model: this.embeddingModel,
        input: text
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as EmbeddingResponse;

    if (
      !data ||
      !Array.isArray(data.data) ||
      data.data.length === 0 ||
      !data.data[0] ||
      !Array.isArray(data.data[0].embedding)
    ) {
      throw new Error('OpenRouter API error: no embedding data returned in response');
    }

    const embedding = data.data[0].embedding;

    // Cache the result
    this.embeddingCache.set(cacheKey, embedding);

    return embedding;
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    // Check cache for all texts
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];
    const results: (number[] | null)[] = texts.map((text, index) => {
      const cacheKey = this.hashText(text);
      if (this.embeddingCache.has(cacheKey)) {
        return this.embeddingCache.get(cacheKey)!;
      }
      uncachedTexts.push(text);
      uncachedIndices.push(index);
      return null;
    });

    // If all cached, return immediately
    if (uncachedTexts.length === 0) {
      return results as number[][];
    }

    // Batch request to OpenRouter
    const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName
      },
      body: JSON.stringify({
        model: this.embeddingModel,
        input: uncachedTexts
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as EmbeddingResponse;

    // Fill in results and cache
    for (let i = 0; i < data.data.length; i++) {
      const embedding = data.data[i].embedding;
      const originalIndex = uncachedIndices[i];
      const text = uncachedTexts[i];
      
      results[originalIndex] = embedding;
      this.embeddingCache.set(this.hashText(text), embedding);
    }

    return results as number[][];
  }

  /**
   * Chat completion - for intelligent context understanding
   */
  async chat(messages: ChatMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<string> {
    const response = await fetch(OPENROUTER_CHAT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName
      },
      body: JSON.stringify({
        model: options?.model || this.chatModel,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 4096
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter Chat API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as ChatResponse;

    const firstChoice = data?.choices && Array.isArray(data.choices) ? data.choices[0] : undefined;
    const content = firstChoice?.message?.content;

    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('OpenRouter Chat API returned an unexpected response structure: missing or empty message content.');
    }

    return content;
  }

  /**
   * Analyze codebase content intelligently
   */
  async analyzeContent(content: string, analysisType: 'summarize' | 'extract_workflows' | 'extract_architecture' | 'suggest_context'): Promise<string> {
    const systemPrompts: Record<string, string> = {
      summarize: `You are an expert code analyzer. Provide a concise summary of the given code or documentation. 
Focus on: purpose, key functionality, dependencies, and important patterns. 
Keep the summary under 500 words.`,
      
      extract_workflows: `You are an expert at analyzing codebases to identify workflows.
Extract the main workflows from the given code. For each workflow, identify:
1. Entry points (API routes, CLI commands, event handlers)
2. Key processing steps
3. Dependencies and integrations
4. Data flow
Output as structured markdown with file:line references where possible.`,
      
      extract_architecture: `You are an expert software architect.
Analyze the given code to extract the architecture patterns:
1. Project structure and organization
2. Design patterns used
3. Key components and their responsibilities
4. Integration points
5. Technology stack
Output as structured markdown.`,
      
      suggest_context: `You are an AI context engineering expert.
Analyze the given codebase content and suggest:
1. Key context files that should be created
2. Important workflows to document
3. Agent configurations needed
4. Commands that would be useful
5. Knowledge base entries to capture
Be specific and actionable in your suggestions.`
    };

    return this.chat([
      { role: 'system', content: systemPrompts[analysisType] },
      { role: 'user', content }
    ]);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
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
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }

  /**
   * Get embedding dimension
   */
  getDimension(): number {
    return EMBEDDING_DIMENSION;
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.embeddingCache.size;
  }

  /**
   * Hash text for caching
   */
  private hashText(text: string): string {
    return createHash('md5').update(text).digest('hex');
  }
}

/**
 * Create OpenRouter client from environment
 */
export function createOpenRouterClient(): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY environment variable is required.\n' +
      'Get your API key at: https://openrouter.ai/keys'
    );
  }

  return new OpenRouterClient({
    apiKey,
    embeddingModel: process.env.OPENROUTER_EMBEDDING_MODEL,
    chatModel: process.env.OPENROUTER_CHAT_MODEL
  });
}

/**
 * Check if OpenRouter API key is available
 */
export function hasOpenRouterKey(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}
