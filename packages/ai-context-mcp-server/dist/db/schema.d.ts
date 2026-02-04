/**
 * Database Schema
 *
 * SQLite + sqlite-vec schema for AI context storage.
 * Supports vector embeddings, knowledge graph, and sync state.
 */
export declare const SCHEMA_VERSION = "1.0.0";
/**
 * Core database schema SQL
 */
export declare const SCHEMA_SQL = "\n-- Schema version tracking\nCREATE TABLE IF NOT EXISTS schema_version (\n  version TEXT PRIMARY KEY,\n  applied_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\n-- Core context storage\nCREATE TABLE IF NOT EXISTS context_items (\n  id TEXT PRIMARY KEY,\n  type TEXT NOT NULL CHECK (type IN ('workflow', 'agent', 'command', 'code', 'commit', 'knowledge', 'config')),\n  name TEXT NOT NULL,\n  content TEXT NOT NULL,\n  metadata JSON,\n  file_path TEXT,\n  content_hash TEXT,\n  created_at TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\n-- Indexes for context_items\nCREATE INDEX IF NOT EXISTS idx_context_items_type ON context_items(type);\nCREATE INDEX IF NOT EXISTS idx_context_items_name ON context_items(name);\nCREATE INDEX IF NOT EXISTS idx_context_items_file_path ON context_items(file_path);\nCREATE INDEX IF NOT EXISTS idx_context_items_content_hash ON context_items(content_hash);\n\n-- Knowledge graph with typed relations\nCREATE TABLE IF NOT EXISTS knowledge_graph (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  source_id TEXT NOT NULL,\n  target_id TEXT NOT NULL,\n  relation_type TEXT NOT NULL CHECK (relation_type IN (\n    'uses', 'implements', 'depends_on', 'references', 'tests',\n    'documents', 'extends', 'contains', 'calls', 'imports',\n    'configures', 'authenticates', 'validates', 'transforms'\n  )),\n  weight REAL DEFAULT 1.0,\n  metadata JSON,\n  created_at TEXT NOT NULL DEFAULT (datetime('now')),\n  FOREIGN KEY (source_id) REFERENCES context_items(id) ON DELETE CASCADE,\n  FOREIGN KEY (target_id) REFERENCES context_items(id) ON DELETE CASCADE,\n  UNIQUE(source_id, target_id, relation_type)\n);\n\n-- Indexes for knowledge_graph\nCREATE INDEX IF NOT EXISTS idx_kg_source ON knowledge_graph(source_id);\nCREATE INDEX IF NOT EXISTS idx_kg_target ON knowledge_graph(target_id);\nCREATE INDEX IF NOT EXISTS idx_kg_relation ON knowledge_graph(relation_type);\n\n-- Git commits tracking\nCREATE TABLE IF NOT EXISTS git_commits (\n  sha TEXT PRIMARY KEY,\n  message TEXT NOT NULL,\n  author_name TEXT,\n  author_email TEXT,\n  timestamp TEXT NOT NULL,\n  files_changed JSON,\n  stats JSON,\n  created_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\n-- Indexes for git_commits\nCREATE INDEX IF NOT EXISTS idx_git_commits_timestamp ON git_commits(timestamp);\nCREATE INDEX IF NOT EXISTS idx_git_commits_author ON git_commits(author_email);\n\n-- Sync state for shadow file generation and tool sync\nCREATE TABLE IF NOT EXISTS sync_state (\n  id TEXT PRIMARY KEY,\n  tool TEXT NOT NULL,\n  content_hash TEXT,\n  last_sync TEXT NOT NULL DEFAULT (datetime('now')),\n  file_path TEXT,\n  status TEXT DEFAULT 'synced' CHECK (status IN ('synced', 'pending', 'conflict', 'error')),\n  metadata JSON\n);\n\n-- Indexes for sync_state\nCREATE INDEX IF NOT EXISTS idx_sync_state_tool ON sync_state(tool);\nCREATE INDEX IF NOT EXISTS idx_sync_state_status ON sync_state(status);\n\n-- Embedding queue for async processing\nCREATE TABLE IF NOT EXISTS embedding_queue (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  context_id TEXT NOT NULL,\n  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),\n  error_message TEXT,\n  created_at TEXT NOT NULL DEFAULT (datetime('now')),\n  processed_at TEXT,\n  FOREIGN KEY (context_id) REFERENCES context_items(id) ON DELETE CASCADE\n);\n\n-- Index for embedding_queue\nCREATE INDEX IF NOT EXISTS idx_embedding_queue_status ON embedding_queue(status);\n\n-- Analytics and usage tracking\nCREATE TABLE IF NOT EXISTS usage_analytics (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  query TEXT,\n  tool_name TEXT,\n  result_count INTEGER,\n  latency_ms INTEGER,\n  timestamp TEXT NOT NULL DEFAULT (datetime('now'))\n);\n\n-- Index for analytics\nCREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON usage_analytics(timestamp);\nCREATE INDEX IF NOT EXISTS idx_analytics_tool ON usage_analytics(tool_name);\n";
/**
 * sqlite-vec virtual table schema
 * Note: This is created separately after loading the extension
 */
export declare const VECTOR_SCHEMA_SQL = "\n-- Vector embeddings using sqlite-vec\n-- Dimension: 1536 for OpenRouter text-embedding-3-small compatible models\nCREATE VIRTUAL TABLE IF NOT EXISTS embeddings USING vec0(\n  context_id TEXT PRIMARY KEY,\n  embedding FLOAT[1536]\n);\n";
/**
 * Relationship types in the knowledge graph
 */
export declare const RELATION_TYPES: readonly ["uses", "implements", "depends_on", "references", "tests", "documents", "extends", "contains", "calls", "imports", "configures", "authenticates", "validates", "transforms"];
export type RelationType = typeof RELATION_TYPES[number];
/**
 * Context item types
 */
export declare const CONTEXT_TYPES: readonly ["workflow", "agent", "command", "code", "commit", "knowledge", "config"];
export type ContextType = typeof CONTEXT_TYPES[number];
/**
 * Sync status types
 */
export declare const SYNC_STATUSES: readonly ["synced", "pending", "conflict", "error"];
export type SyncStatus = typeof SYNC_STATUSES[number];
//# sourceMappingURL=schema.d.ts.map