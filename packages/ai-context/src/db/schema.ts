/**
 * Database Schema
 * 
 * SQLite + sqlite-vec schema for AI context storage.
 * Supports vector embeddings, knowledge graph, and sync state.
 */

export const SCHEMA_VERSION = '1.0.0';

/**
 * Core database schema SQL
 */
export const SCHEMA_SQL = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Core context storage
CREATE TABLE IF NOT EXISTS context_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('workflow', 'agent', 'command', 'code', 'commit', 'knowledge', 'config', 'doc', 'tool_config')),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  file_path TEXT,
  content_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for context_items
CREATE INDEX IF NOT EXISTS idx_context_items_type ON context_items(type);
CREATE INDEX IF NOT EXISTS idx_context_items_name ON context_items(name);
CREATE INDEX IF NOT EXISTS idx_context_items_file_path ON context_items(file_path);
CREATE INDEX IF NOT EXISTS idx_context_items_content_hash ON context_items(content_hash);

-- Knowledge graph with typed relations
CREATE TABLE IF NOT EXISTS knowledge_graph (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relation_type TEXT NOT NULL CHECK (relation_type IN (
    'uses', 'implements', 'depends_on', 'references', 'tests',
    'documents', 'extends', 'contains', 'calls', 'imports',
    'configures', 'authenticates', 'validates', 'transforms'
  )),
  weight REAL DEFAULT 1.0,
  metadata JSON,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (source_id) REFERENCES context_items(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES context_items(id) ON DELETE CASCADE,
  UNIQUE(source_id, target_id, relation_type)
);

-- Indexes for knowledge_graph
CREATE INDEX IF NOT EXISTS idx_kg_source ON knowledge_graph(source_id);
CREATE INDEX IF NOT EXISTS idx_kg_target ON knowledge_graph(target_id);
CREATE INDEX IF NOT EXISTS idx_kg_relation ON knowledge_graph(relation_type);

-- Git commits tracking
CREATE TABLE IF NOT EXISTS git_commits (
  sha TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,
  timestamp TEXT NOT NULL,
  files_changed JSON,
  stats JSON,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for git_commits
CREATE INDEX IF NOT EXISTS idx_git_commits_timestamp ON git_commits(timestamp);
CREATE INDEX IF NOT EXISTS idx_git_commits_author ON git_commits(author_email);

-- AI tool configurations (claude, cline, copilot, etc.)
CREATE TABLE IF NOT EXISTS ai_tool_configs (
  id TEXT PRIMARY KEY,
  tool_name TEXT NOT NULL,
  config_path TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT,
  last_sync TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT DEFAULT 'synced' CHECK (status IN ('synced', 'pending', 'conflict', 'error')),
  metadata JSON
);

-- Indexes for ai_tool_configs
CREATE INDEX IF NOT EXISTS idx_ai_tool_configs_tool ON ai_tool_configs(tool_name);
CREATE INDEX IF NOT EXISTS idx_ai_tool_configs_status ON ai_tool_configs(status);

-- Sync state for shadow file generation and tool sync
CREATE TABLE IF NOT EXISTS sync_state (
  id TEXT PRIMARY KEY,
  tool TEXT NOT NULL,
  content_hash TEXT,
  last_sync TEXT NOT NULL DEFAULT (datetime('now')),
  file_path TEXT,
  status TEXT DEFAULT 'synced' CHECK (status IN ('synced', 'pending', 'conflict', 'error')),
  metadata JSON
);

-- Indexes for sync_state
CREATE INDEX IF NOT EXISTS idx_sync_state_tool ON sync_state(tool);
CREATE INDEX IF NOT EXISTS idx_sync_state_status ON sync_state(status);

-- Embedding queue for async processing
CREATE TABLE IF NOT EXISTS embedding_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  context_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT,
  FOREIGN KEY (context_id) REFERENCES context_items(id) ON DELETE CASCADE
);

-- Index for embedding_queue
CREATE INDEX IF NOT EXISTS idx_embedding_queue_status ON embedding_queue(status);

-- Analytics and usage tracking
CREATE TABLE IF NOT EXISTS usage_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT,
  tool_name TEXT,
  result_count INTEGER,
  latency_ms INTEGER,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON usage_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_tool ON usage_analytics(tool_name);
`;

/**
 * sqlite-vec virtual table schema
 * Note: This is created separately after loading the extension
 */
export const VECTOR_SCHEMA_SQL = `
-- Vector embeddings using sqlite-vec
-- Dimension: 1536 for OpenRouter text-embedding-3-small compatible models
CREATE VIRTUAL TABLE IF NOT EXISTS embeddings USING vec0(
  context_id TEXT PRIMARY KEY,
  embedding FLOAT[1536]
);
`;

/**
 * Relationship types in the knowledge graph
 */
export const RELATION_TYPES = [
  'uses',
  'implements',
  'depends_on',
  'references',
  'tests',
  'documents',
  'extends',
  'contains',
  'calls',
  'imports',
  'configures',
  'authenticates',
  'validates',
  'transforms'
] as const;

export type RelationType = typeof RELATION_TYPES[number];

/**
 * Context item types - extended to include docs and tool configs
 */
export const CONTEXT_TYPES = [
  'workflow',
  'agent',
  'command',
  'code',
  'commit',
  'knowledge',
  'config',
  'doc',           // For markdown documentation files
  'tool_config'    // For AI tool-specific configurations (.claude, .gemini, etc.)
] as const;

export type ContextType = typeof CONTEXT_TYPES[number];

/**
 * Sync status types
 */
export const SYNC_STATUSES = ['synced', 'pending', 'conflict', 'error'] as const;

export type SyncStatus = typeof SYNC_STATUSES[number];

/**
 * Supported AI tools
 */
export const AI_TOOLS = [
  'claude',
  'copilot',
  'cline',
  'antigravity',
  'windsurf',
  'aider',
  'continue',
  'cursor',
  'gemini'
] as const;

export type AITool = typeof AI_TOOLS[number];

/**
 * AI tool folder mappings
 */
export const AI_TOOL_FOLDERS: Record<AITool, string[]> = {
  claude: ['.claude', 'CLAUDE.md', 'AI_CONTEXT.md'],
  copilot: ['.github/copilot-instructions.md'],
  cline: ['.clinerules', '.cline'],
  antigravity: ['.agent'],
  windsurf: ['.windsurf'],
  aider: ['.aider', '.aider.conf.yml'],
  continue: ['.continue'],
  cursor: ['.cursor', '.cursorrules'],
  gemini: ['.gemini']
};
