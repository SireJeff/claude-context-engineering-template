/**
 * Database Client
 * 
 * SQLite database operations for AI context storage.
 * Handles CRUD operations, queries, and vector search.
 */

import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs';
import {
  SCHEMA_SQL,
  VECTOR_SCHEMA_SQL,
  SCHEMA_VERSION,
  type ContextType,
  type RelationType,
  type SyncStatus
} from './schema.js';

/**
 * Context item structure
 */
export interface ContextItem {
  id: string;
  type: ContextType;
  name: string;
  content: string;
  metadata?: Record<string, unknown>;
  filePath?: string;
  contentHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Knowledge graph edge
 */
export interface GraphEdge {
  id?: number;
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  weight?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Git commit record
 */
export interface GitCommit {
  sha: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  timestamp: string;
  filesChanged?: string[];
  stats?: { additions: number; deletions: number };
}

/**
 * Sync state record
 */
export interface SyncState {
  id: string;
  tool: string;
  contentHash?: string;
  lastSync: string;
  filePath?: string;
  status: SyncStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Search result with similarity score
 */
export interface SearchResult {
  item: ContextItem;
  similarity: number;
}

/**
 * Database client for AI context storage
 */
export class DatabaseClient {
  private db: Database.Database;
  private dbPath: string;

  constructor(projectRoot: string, dbFileName = '.ai-context.db') {
    this.dbPath = path.join(projectRoot, dbFileName);
    this.db = new Database(this.dbPath);
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Load sqlite-vec extension
    sqliteVec.load(this.db);
    
    // Initialize schema
    this.initSchema();
  }

  /**
   * Initialize database schema
   */
  private initSchema(): void {
    // Create core tables
    this.db.exec(SCHEMA_SQL);
    
    // Create vector table
    this.db.exec(VECTOR_SCHEMA_SQL);
    
    // Record schema version
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO schema_version (version, applied_at)
      VALUES (?, datetime('now'))
    `);
    stmt.run(SCHEMA_VERSION);
  }

  /**
   * Generate content hash for deduplication
   */
  private hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  /**
   * Generate a unique ID for a context item
   */
  private generateId(type: ContextType, name: string): string {
    return `${type}:${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  // ==================== Context Items ====================

  /**
   * Insert or update a context item
   */
  upsertItem(item: Omit<ContextItem, 'id' | 'contentHash' | 'createdAt' | 'updatedAt'>): ContextItem {
    const id = this.generateId(item.type, item.name);
    const contentHash = this.hashContent(item.content);
    
    const stmt = this.db.prepare(`
      INSERT INTO context_items (id, type, name, content, metadata, file_path, content_hash, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        content = excluded.content,
        metadata = excluded.metadata,
        file_path = excluded.file_path,
        content_hash = excluded.content_hash,
        updated_at = datetime('now')
      RETURNING *
    `);
    
    const row = stmt.get(
      id,
      item.type,
      item.name,
      item.content,
      item.metadata ? JSON.stringify(item.metadata) : null,
      item.filePath || null,
      contentHash
    ) as Record<string, unknown>;
    
    return this.rowToItem(row);
  }

  /**
   * Get a context item by ID
   */
  getItem(id: string): ContextItem | null {
    const stmt = this.db.prepare('SELECT * FROM context_items WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? this.rowToItem(row) : null;
  }

  /**
   * Get items by type
   */
  getItemsByType(type: ContextType): ContextItem[] {
    const stmt = this.db.prepare('SELECT * FROM context_items WHERE type = ? ORDER BY name');
    const rows = stmt.all(type) as Record<string, unknown>[];
    return rows.map(row => this.rowToItem(row));
  }

  /**
   * Get all items
   */
  getAllItems(): ContextItem[] {
    const stmt = this.db.prepare('SELECT * FROM context_items ORDER BY type, name');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(row => this.rowToItem(row));
  }

  /**
   * Delete a context item
   */
  deleteItem(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM context_items WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Search items by text (full-text grep-style)
   */
  searchText(query: string, type?: ContextType): ContextItem[] {
    const pattern = `%${query}%`;
    let sql = 'SELECT * FROM context_items WHERE (content LIKE ? OR name LIKE ?)';
    const params: unknown[] = [pattern, pattern];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY name LIMIT 50';
    
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map(row => this.rowToItem(row));
  }

  /**
   * Convert database row to ContextItem
   */
  private rowToItem(row: Record<string, unknown>): ContextItem {
    return {
      id: row.id as string,
      type: row.type as ContextType,
      name: row.name as string,
      content: row.content as string,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined,
      filePath: row.file_path as string | undefined,
      contentHash: row.content_hash as string | undefined,
      createdAt: row.created_at as string | undefined,
      updatedAt: row.updated_at as string | undefined
    };
  }

  // ==================== Knowledge Graph ====================

  /**
   * Add a relationship to the knowledge graph
   */
  addRelation(edge: Omit<GraphEdge, 'id'>): GraphEdge {
    const stmt = this.db.prepare(`
      INSERT INTO knowledge_graph (source_id, target_id, relation_type, weight, metadata)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(source_id, target_id, relation_type) DO UPDATE SET
        weight = excluded.weight,
        metadata = excluded.metadata
      RETURNING *
    `);
    
    const row = stmt.get(
      edge.sourceId,
      edge.targetId,
      edge.relationType,
      edge.weight ?? 1.0,
      edge.metadata ? JSON.stringify(edge.metadata) : null
    ) as Record<string, unknown>;
    
    return {
      id: row.id as number,
      sourceId: row.source_id as string,
      targetId: row.target_id as string,
      relationType: row.relation_type as RelationType,
      weight: row.weight as number,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
    };
  }

  /**
   * Get relations from a source item
   */
  getRelationsFrom(sourceId: string, relationType?: RelationType): GraphEdge[] {
    let sql = `
      SELECT kg.*, ci.name as target_name
      FROM knowledge_graph kg
      JOIN context_items ci ON kg.target_id = ci.id
      WHERE kg.source_id = ?
    `;
    const params: unknown[] = [sourceId];
    
    if (relationType) {
      sql += ' AND kg.relation_type = ?';
      params.push(relationType);
    }
    
    sql += ' ORDER BY kg.weight DESC';
    
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    
    return rows.map(row => ({
      id: row.id as number,
      sourceId: row.source_id as string,
      targetId: row.target_id as string,
      relationType: row.relation_type as RelationType,
      weight: row.weight as number,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
    }));
  }

  /**
   * Get relations to a target item
   */
  getRelationsTo(targetId: string, relationType?: RelationType): GraphEdge[] {
    let sql = `
      SELECT kg.*, ci.name as source_name
      FROM knowledge_graph kg
      JOIN context_items ci ON kg.source_id = ci.id
      WHERE kg.target_id = ?
    `;
    const params: unknown[] = [targetId];
    
    if (relationType) {
      sql += ' AND kg.relation_type = ?';
      params.push(relationType);
    }
    
    sql += ' ORDER BY kg.weight DESC';
    
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    
    return rows.map(row => ({
      id: row.id as number,
      sourceId: row.source_id as string,
      targetId: row.target_id as string,
      relationType: row.relation_type as RelationType,
      weight: row.weight as number,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
    }));
  }

  /**
   * Traverse the graph from a starting point
   */
  traverseGraph(startId: string, maxDepth = 3): Map<string, { item: ContextItem; depth: number }> {
    const visited = new Map<string, { item: ContextItem; depth: number }>();
    const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (visited.has(id) || depth > maxDepth) continue;
      
      const item = this.getItem(id);
      if (!item) continue;
      
      visited.set(id, { item, depth });
      
      // Get all outgoing relations
      const relations = this.getRelationsFrom(id);
      for (const rel of relations) {
        if (!visited.has(rel.targetId)) {
          queue.push({ id: rel.targetId, depth: depth + 1 });
        }
      }
    }
    
    return visited;
  }

  // ==================== Git Commits ====================

  /**
   * Insert or update a git commit
   */
  upsertCommit(commit: GitCommit): void {
    const stmt = this.db.prepare(`
      INSERT INTO git_commits (sha, message, author_name, author_email, timestamp, files_changed, stats)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(sha) DO UPDATE SET
        message = excluded.message,
        files_changed = excluded.files_changed,
        stats = excluded.stats
    `);
    
    stmt.run(
      commit.sha,
      commit.message,
      commit.authorName || null,
      commit.authorEmail || null,
      commit.timestamp,
      commit.filesChanged ? JSON.stringify(commit.filesChanged) : null,
      commit.stats ? JSON.stringify(commit.stats) : null
    );
  }

  /**
   * Get recent commits
   */
  getRecentCommits(limit = 50): GitCommit[] {
    const stmt = this.db.prepare(`
      SELECT * FROM git_commits
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(limit) as Record<string, unknown>[];
    
    return rows.map(row => ({
      sha: row.sha as string,
      message: row.message as string,
      authorName: row.author_name as string | undefined,
      authorEmail: row.author_email as string | undefined,
      timestamp: row.timestamp as string,
      filesChanged: row.files_changed ? JSON.parse(row.files_changed as string) : undefined,
      stats: row.stats ? JSON.parse(row.stats as string) : undefined
    }));
  }

  // ==================== Sync State ====================

  /**
   * Update sync state for a tool
   */
  updateSyncState(state: SyncState): void {
    const stmt = this.db.prepare(`
      INSERT INTO sync_state (id, tool, content_hash, last_sync, file_path, status, metadata)
      VALUES (?, ?, ?, datetime('now'), ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        content_hash = excluded.content_hash,
        last_sync = datetime('now'),
        status = excluded.status,
        metadata = excluded.metadata
    `);
    
    stmt.run(
      state.id,
      state.tool,
      state.contentHash || null,
      state.filePath || null,
      state.status,
      state.metadata ? JSON.stringify(state.metadata) : null
    );
  }

  /**
   * Get sync state for a tool
   */
  getSyncState(tool: string): SyncState[] {
    const stmt = this.db.prepare('SELECT * FROM sync_state WHERE tool = ?');
    const rows = stmt.all(tool) as Record<string, unknown>[];
    
    return rows.map(row => ({
      id: row.id as string,
      tool: row.tool as string,
      contentHash: row.content_hash as string | undefined,
      lastSync: row.last_sync as string,
      filePath: row.file_path as string | undefined,
      status: row.status as SyncStatus,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
    }));
  }

  // ==================== Analytics ====================

  /**
   * Log a usage event
   */
  logUsage(toolName: string, query?: string, resultCount?: number, latencyMs?: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO usage_analytics (tool_name, query, result_count, latency_ms)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(toolName, query || null, resultCount ?? null, latencyMs ?? null);
  }

  /**
   * Get usage statistics
   */
  getUsageStats(days = 30): { toolName: string; count: number; avgLatency: number }[] {
    const stmt = this.db.prepare(`
      SELECT 
        tool_name,
        COUNT(*) as count,
        AVG(latency_ms) as avg_latency
      FROM usage_analytics
      WHERE timestamp > datetime('now', '-' || ? || ' days')
      GROUP BY tool_name
      ORDER BY count DESC
    `);
    
    const rows = stmt.all(days) as Record<string, unknown>[];
    
    return rows.map(row => ({
      toolName: row.tool_name as string,
      count: row.count as number,
      avgLatency: row.avg_latency as number
    }));
  }

  // ==================== Utility ====================

  /**
   * Get database path
   */
  getPath(): string {
    return this.dbPath;
  }

  /**
   * Get database statistics
   */
  getStats(): { items: number; relations: number; commits: number; embeddings: number } {
    const itemCount = (this.db.prepare('SELECT COUNT(*) as count FROM context_items').get() as { count: number }).count;
    const relationCount = (this.db.prepare('SELECT COUNT(*) as count FROM knowledge_graph').get() as { count: number }).count;
    const commitCount = (this.db.prepare('SELECT COUNT(*) as count FROM git_commits').get() as { count: number }).count;
    
    let embeddingCount = 0;
    try {
      embeddingCount = (this.db.prepare('SELECT COUNT(*) as count FROM embeddings').get() as { count: number }).count;
    } catch {
      // Vector table might not exist yet
    }
    
    return {
      items: itemCount,
      relations: relationCount,
      commits: commitCount,
      embeddings: embeddingCount
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}
