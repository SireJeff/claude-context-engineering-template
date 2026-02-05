/**
 * OpenRouter Embeddings Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterEmbeddings } from '../src/embeddings/openrouter.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OpenRouterEmbeddings', () => {
  let client: OpenRouterEmbeddings;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new OpenRouterEmbeddings({
      apiKey: 'test-api-key'
    });
  });

  describe('constructor', () => {
    it('should throw if API key is not provided', () => {
      expect(() => new OpenRouterEmbeddings({ apiKey: '' })).toThrow('OPENROUTER_API_KEY is required');
    });

    it('should create client with valid API key', () => {
      expect(() => new OpenRouterEmbeddings({ apiKey: 'valid-key' })).not.toThrow();
    });

    it('should use default model if not specified', () => {
      const client = new OpenRouterEmbeddings({ apiKey: 'test-key' });
      expect(client.getDimension()).toBe(1536);
    });
  });

  describe('embed', () => {
    it('should call OpenRouter API with correct parameters', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding, index: 0 }],
          model: 'openai/text-embedding-3-small',
          usage: { prompt_tokens: 5, total_tokens: 5 }
        })
      });

      const result = await client.embed('test text');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/embeddings',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"input":"test text"')
        })
      );

      expect(result).toEqual(mockEmbedding);
    });

    it('should cache embeddings', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding, index: 0 }],
          model: 'openai/text-embedding-3-small',
          usage: { prompt_tokens: 5, total_tokens: 5 }
        })
      });

      // First call
      await client.embed('test text');
      
      // Second call with same text - should use cache
      const result = await client.embed('test text');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEmbedding);
    });

    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized'
      });

      await expect(client.embed('test text')).rejects.toThrow('OpenRouter API error: 401');
    });
  });

  describe('embedBatch', () => {
    it('should call API once for multiple texts', async () => {
      const mockEmbeddings = [
        Array(1536).fill(0.1),
        Array(1536).fill(0.2),
        Array(1536).fill(0.3)
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockEmbeddings.map((embedding, index) => ({ embedding, index })),
          model: 'openai/text-embedding-3-small',
          usage: { prompt_tokens: 15, total_tokens: 15 }
        })
      });

      const result = await client.embedBatch(['text1', 'text2', 'text3']);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockEmbeddings[0]);
      expect(result[1]).toEqual(mockEmbeddings[1]);
      expect(result[2]).toEqual(mockEmbeddings[2]);
    });

    it('should use cache for previously embedded texts', async () => {
      const mockEmbedding1 = Array(1536).fill(0.1);
      const mockEmbedding2 = Array(1536).fill(0.2);
      
      // First embed one text
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding1, index: 0 }],
          model: 'openai/text-embedding-3-small',
          usage: { prompt_tokens: 5, total_tokens: 5 }
        })
      });
      await client.embed('text1');

      // Now batch embed including the cached text
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding2, index: 0 }],
          model: 'openai/text-embedding-3-small',
          usage: { prompt_tokens: 5, total_tokens: 5 }
        })
      });
      const result = await client.embedBatch(['text1', 'text2']);

      // Should only request the uncached text
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const lastCall = mockFetch.mock.calls[1][1];
      expect(lastCall.body).not.toContain('text1');
      expect(lastCall.body).toContain('text2');
    });

    it('should return immediately if all texts are cached', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding, index: 0 }],
          model: 'openai/text-embedding-3-small',
          usage: { prompt_tokens: 5, total_tokens: 5 }
        })
      });

      // Cache a text
      await client.embed('cached text');
      
      // Batch with only cached text
      const result = await client.embedBatch(['cached text']);

      expect(mockFetch).toHaveBeenCalledTimes(1); // Only the first call
      expect(result).toHaveLength(1);
    });
  });

  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const vector = [1, 0, 0, 0];
      expect(OpenRouterEmbeddings.cosineSimilarity(vector, vector)).toBe(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      const a = [1, 0, 0, 0];
      const b = [0, 1, 0, 0];
      expect(OpenRouterEmbeddings.cosineSimilarity(a, b)).toBe(0);
    });

    it('should return -1 for opposite vectors', () => {
      const a = [1, 0, 0, 0];
      const b = [-1, 0, 0, 0];
      expect(OpenRouterEmbeddings.cosineSimilarity(a, b)).toBe(-1);
    });

    it('should throw for vectors of different lengths', () => {
      const a = [1, 0, 0];
      const b = [1, 0, 0, 0];
      expect(() => OpenRouterEmbeddings.cosineSimilarity(a, b)).toThrow('same dimension');
    });

    it('should return 0 for zero vectors', () => {
      const a = [0, 0, 0, 0];
      const b = [1, 0, 0, 0];
      expect(OpenRouterEmbeddings.cosineSimilarity(a, b)).toBe(0);
    });
  });

  describe('getDimension', () => {
    it('should return 1536', () => {
      expect(client.getDimension()).toBe(1536);
    });
  });

  describe('clearCache', () => {
    it('should clear the embedding cache', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding, index: 0 }],
          model: 'openai/text-embedding-3-small',
          usage: { prompt_tokens: 5, total_tokens: 5 }
        })
      });

      // Cache a text
      await client.embed('test text');
      expect(client.getCacheSize()).toBe(1);
      
      // Clear cache
      client.clearCache();
      expect(client.getCacheSize()).toBe(0);
      
      // Should need to call API again
      await client.embed('test text');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCacheSize', () => {
    it('should return 0 for empty cache', () => {
      expect(client.getCacheSize()).toBe(0);
    });

    it('should return correct count after caching', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding, index: 0 }],
          model: 'openai/text-embedding-3-small',
          usage: { prompt_tokens: 5, total_tokens: 5 }
        })
      });

      await client.embed('text1');
      await client.embed('text2');
      await client.embed('text3');
      
      expect(client.getCacheSize()).toBe(3);
    });
  });
});
