/**
 * Database Client
 *
 * SQLite database operations for AI context storage.
 * Handles CRUD operations, queries, and vector search.
 */
import { type ContextType, type RelationType, type SyncStatus } from './schema.js';
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
    stats?: {
        additions: number;
        deletions: number;
    };
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
export declare class DatabaseClient {
    private db;
    private dbPath;
    constructor(projectRoot: string, dbFileName?: string);
    /**
     * Initialize database schema
     */
    private initSchema;
    /**
     * Generate content hash for deduplication
     */
    private hashContent;
    /**
     * Generate a unique ID for a context item
     */
    private generateId;
    /**
     * Insert or update a context item
     */
    upsertItem(item: Omit<ContextItem, 'id' | 'contentHash' | 'createdAt' | 'updatedAt'>): ContextItem;
    /**
     * Get a context item by ID
     */
    getItem(id: string): ContextItem | null;
    /**
     * Get items by type
     */
    getItemsByType(type: ContextType): ContextItem[];
    /**
     * Get all items
     */
    getAllItems(): ContextItem[];
    /**
     * Delete a context item
     */
    deleteItem(id: string): boolean;
    /**
     * Search items by text (full-text grep-style)
     */
    searchText(query: string, type?: ContextType): ContextItem[];
    /**
     * Convert database row to ContextItem
     */
    private rowToItem;
    /**
     * Add a relationship to the knowledge graph
     */
    addRelation(edge: Omit<GraphEdge, 'id'>): GraphEdge;
    /**
     * Get relations from a source item
     */
    getRelationsFrom(sourceId: string, relationType?: RelationType): GraphEdge[];
    /**
     * Get relations to a target item
     */
    getRelationsTo(targetId: string, relationType?: RelationType): GraphEdge[];
    /**
     * Traverse the graph from a starting point
     */
    traverseGraph(startId: string, maxDepth?: number): Map<string, {
        item: ContextItem;
        depth: number;
    }>;
    /**
     * Insert or update a git commit
     */
    upsertCommit(commit: GitCommit): void;
    /**
     * Get recent commits
     */
    getRecentCommits(limit?: number): GitCommit[];
    /**
     * Update sync state for a tool
     */
    updateSyncState(state: SyncState): void;
    /**
     * Get sync state for a tool
     */
    getSyncState(tool: string): SyncState[];
    /**
     * Log a usage event
     */
    logUsage(toolName: string, query?: string, resultCount?: number, latencyMs?: number): void;
    /**
     * Get usage statistics
     */
    getUsageStats(days?: number): {
        toolName: string;
        count: number;
        avgLatency: number;
    }[];
    /**
     * Get database path
     */
    getPath(): string;
    /**
     * Get database statistics
     */
    getStats(): {
        items: number;
        relations: number;
        commits: number;
        embeddings: number;
    };
    /**
     * Close database connection
     */
    close(): void;
}
//# sourceMappingURL=client.d.ts.map