/**
 * Vector Embeddings Database Operations
 * 
 * Handles storing and querying embeddings in SQLite using sqlite-vec.
 */

import Database from 'better-sqlite3';
import { OpenRouterEmbeddings, createEmbeddingsClient } from '../embeddings/openrouter.js';
import type { ContextItem } from './client.js';

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
export class EmbeddingsManager {
  private db: Database.Database;
  private client: OpenRouterEmbeddings;
  private dimension: number;

  constructor(db: Database.Database, client?: OpenRouterEmbeddings) {
    this.db = db;
    this.client = client || createEmbeddingsClient();
    this.dimension = this.client.getDimension();
  }

  /**
   * Store embedding for a context item
   */
  async storeEmbedding(contextId: string, content: string): Promise<void> {
    // Generate embedding
    const embedding = await this.client.embed(content);
    
    // Store in database using sqlite-vec
    // sqlite-vec uses vec_f32 for float32 arrays
    const stmt = this.db.prepare(`
      INSERT INTO embeddings (context_id, embedding)
      VALUES (?, vec_f32(?))
      ON CONFLICT(context_id) DO UPDATE SET
        embedding = excluded.embedding
    `);
    
    // Convert to Float32Array for sqlite-vec
    const float32Array = new Float32Array(embedding);
    stmt.run(contextId, Buffer.from(float32Array.buffer));
  }

  /**
   * Store embeddings for multiple items (batch)
   */
  async storeEmbeddingsBatch(items: Array<{ contextId: string; content: string }>): Promise<void> {
    // Generate embeddings in batch
    const contents = items.map(item => item.content);
    const embeddings = await this.client.embedBatch(contents);
    
    // Store all embeddings in a transaction
    const stmt = this.db.prepare(`
      INSERT INTO embeddings (context_id, embedding)
      VALUES (?, vec_f32(?))
      ON CONFLICT(context_id) DO UPDATE SET
        embedding = excluded.embedding
    `);
    
    const insertMany = this.db.transaction((items: Array<{ contextId: string; embedding: number[] }>) => {
      for (const item of items) {
        const float32Array = new Float32Array(item.embedding);
        stmt.run(item.contextId, Buffer.from(float32Array.buffer));
      }
    });
    
    insertMany(items.map((item, i) => ({
      contextId: item.contextId,
      embedding: embeddings[i]
    })));
  }

  /**
   * Semantic search for similar items
   */
  async search(query: string, limit = 10, minSimilarity = 0.5): Promise<SemanticSearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.client.embed(query);
    const float32Array = new Float32Array(queryEmbedding);
    const queryBuffer = Buffer.from(float32Array.buffer);
    
    // Search using sqlite-vec
    // vec_distance_L2 returns squared L2 distance
    // Lower distance = more similar
    const stmt = this.db.prepare(`
      SELECT 
        context_id,
        vec_distance_L2(embedding, vec_f32(?)) as distance
      FROM embeddings
      ORDER BY distance ASC
      LIMIT ?
    `);
    
    const rows = stmt.all(queryBuffer, limit * 2) as Array<{ context_id: string; distance: number }>;
    
    // Convert distance to similarity (0-1 scale)
    // Using: similarity = 1 / (1 + distance)
    const results = rows.map(row => ({
      contextId: row.context_id,
      distance: row.distance,
      similarity: 1 / (1 + Math.sqrt(row.distance))
    })).filter(r => r.similarity >= minSimilarity);
    
    return results.slice(0, limit);
  }

  /**
   * Find similar items to a given context ID
   */
  async findSimilar(contextId: string, limit = 10): Promise<SemanticSearchResult[]> {
    // Get the embedding for the given context ID
    const stmt = this.db.prepare(`
      SELECT embedding FROM embeddings WHERE context_id = ?
    `);
    
    const row = stmt.get(contextId) as { embedding: Buffer } | undefined;
    if (!row) {
      return [];
    }
    
    // Search for similar items (excluding the source)
    const searchStmt = this.db.prepare(`
      SELECT 
        context_id,
        vec_distance_L2(embedding, ?) as distance
      FROM embeddings
      WHERE context_id != ?
      ORDER BY distance ASC
      LIMIT ?
    `);
    
    const rows = searchStmt.all(row.embedding, contextId, limit) as Array<{ context_id: string; distance: number }>;
    
    return rows.map(row => ({
      contextId: row.context_id,
      distance: row.distance,
      similarity: 1 / (1 + Math.sqrt(row.distance))
    }));
  }

  /**
   * Delete embedding for a context item
   */
  deleteEmbedding(contextId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM embeddings WHERE context_id = ?');
    const result = stmt.run(contextId);
    return result.changes > 0;
  }

  /**
   * Check if embedding exists for a context item
   */
  hasEmbedding(contextId: string): boolean {
    const stmt = this.db.prepare('SELECT 1 FROM embeddings WHERE context_id = ? LIMIT 1');
    return stmt.get(contextId) !== undefined;
  }

  /**
   * Get count of stored embeddings
   */
  getCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM embeddings');
    const row = stmt.get() as { count: number };
    return row.count;
  }

  /**
   * Queue an item for embedding generation
   */
  queueForEmbedding(contextId: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO embedding_queue (context_id, status)
      VALUES (?, 'pending')
      ON CONFLICT DO NOTHING
    `);
    stmt.run(contextId);
  }

  /**
   * Process embedding queue
   */
  async processQueue(batchSize = 10): Promise<number> {
    // Get pending items
    const getStmt = this.db.prepare(`
      SELECT eq.context_id, ci.content
      FROM embedding_queue eq
      JOIN context_items ci ON eq.context_id = ci.id
      WHERE eq.status = 'pending'
      LIMIT ?
    `);
    
    const rows = getStmt.all(batchSize) as Array<{ context_id: string; content: string }>;
    
    if (rows.length === 0) {
      return 0;
    }
    
    // Mark as processing
    const updateStmt = this.db.prepare(`
      UPDATE embedding_queue
      SET status = 'processing'
      WHERE context_id = ?
    `);
    
    for (const row of rows) {
      updateStmt.run(row.context_id);
    }
    
    // Generate embeddings
    try {
      await this.storeEmbeddingsBatch(
        rows.map(row => ({
          contextId: row.context_id,
          content: row.content
        }))
      );
      
      // Mark as completed
      const completeStmt = this.db.prepare(`
        UPDATE embedding_queue
        SET status = 'completed', processed_at = datetime('now')
        WHERE context_id = ?
      `);
      
      for (const row of rows) {
        completeStmt.run(row.context_id);
      }
      
      return rows.length;
    } catch (error) {
      // Mark as failed
      const failStmt = this.db.prepare(`
        UPDATE embedding_queue
        SET status = 'failed', error_message = ?
        WHERE context_id = ?
      `);
      
      for (const row of rows) {
        failStmt.run(String(error), row.context_id);
      }
      
      throw error;
    }
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.client.clearCache();
  }
}
