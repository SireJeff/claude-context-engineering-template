/**
 * AI Context
 * 
 * Unified AI Context Engineering package.
 * Provides intelligent context for all AI coding assistants.
 * 
 * @packageDocumentation
 */

// Database
export {
  DatabaseClient,
  type ContextItem,
  type GraphEdge,
  type GitCommit,
  type SyncState,
  type AIToolConfig,
  type SearchResult
} from './db/client.js';

export {
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
} from './db/schema.js';

// OpenRouter / Embeddings
export {
  OpenRouterClient,
  createOpenRouterClient,
  hasOpenRouterKey,
  type OpenRouterConfig,
  type ChatMessage
} from './embeddings/openrouter.js';

// Analyzer
export {
  IntelligentAnalyzer,
  createIntelligentAnalyzer,
  type DiscoveredFile,
  type AnalysisResult
} from './analyzer/intelligent-analyzer.js';

// MCP Server
export {
  createServer,
  startServer,
  main as startMcpServer,
  type ServerConfig
} from './mcp.js';
