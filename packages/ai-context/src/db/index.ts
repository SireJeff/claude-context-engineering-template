/**
 * Database Module Index
 */

export { DatabaseClient, type ContextItem, type GraphEdge, type GitCommit, type SyncState, type AIToolConfig, type SearchResult } from './client.js';
export {
  SCHEMA_SQL,
  VECTOR_SCHEMA_SQL,
  SCHEMA_VERSION,
  RELATION_TYPES,
  CONTEXT_TYPES,
  SYNC_STATUSES,
  AI_TOOLS,
  AI_TOOL_FOLDERS,
  type RelationType,
  type ContextType,
  type SyncStatus,
  type AITool
} from './schema.js';
