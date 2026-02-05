/**
 * AI Context
 *
 * Unified AI Context Engineering package.
 * Provides intelligent context for all AI coding assistants.
 *
 * @packageDocumentation
 */
// Database
export { DatabaseClient } from './db/client.js';
export { SCHEMA_VERSION, RELATION_TYPES, CONTEXT_TYPES, SYNC_STATUSES, AI_TOOLS, AI_TOOL_FOLDERS } from './db/schema.js';
// OpenRouter / Embeddings
export { OpenRouterClient, createOpenRouterClient, hasOpenRouterKey } from './embeddings/openrouter.js';
// Analyzer
export { IntelligentAnalyzer, createIntelligentAnalyzer } from './analyzer/intelligent-analyzer.js';
// MCP Server
export { createServer, startServer, main as startMcpServer } from './mcp.js';
//# sourceMappingURL=index.js.map