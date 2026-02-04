/**
 * AI Context MCP Server
 *
 * Database-backed MCP server for AI context storage and semantic search.
 *
 * @packageDocumentation
 */
export { createServer, startServer, main, type ServerConfig } from './server.js';
export { DatabaseClient, type ContextItem, type GraphEdge, type GitCommit, type SyncState, type SearchResult } from './db/client.js';
export { EmbeddingsManager, type EmbeddingRecord, type SemanticSearchResult } from './db/embeddings.js';
export { SCHEMA_VERSION, RELATION_TYPES, CONTEXT_TYPES, type RelationType, type ContextType, type SyncStatus } from './db/schema.js';
export { OpenRouterEmbeddings, createEmbeddingsClient, type OpenRouterConfig } from './embeddings/openrouter.js';
export { ContextIndexer, type IndexResult } from './indexers/context.js';
export { CodeIndexer, type CodeIndexResult } from './indexers/code.js';
export { GitIndexer, type GitIndexResult } from './indexers/git.js';
export { GraphTraversal, type GraphNode, type GraphQueryResult, type PathResult } from './graph/traversal.js';
export { RELATION_DEFINITIONS, RELATION_CATEGORIES, getRelationsByCategory, getRelationCategory, isValidRelation, suggestRelations } from './graph/relations.js';
export { ShadowGenerator, type ShadowConfig, type ShadowResult } from './shadow/generator.js';
export { TOOL_DEFINITIONS, handleToolCall, type ToolContext, type ToolResult } from './tools/handlers.js';
export { listResources, readResource, getResourceTemplates, type Resource, type ResourceContent, type ResourceContext } from './resources/handlers.js';
export { PROMPT_DEFINITIONS, getPrompt, type Prompt, type PromptMessage, type PromptContext } from './prompts/handlers.js';
//# sourceMappingURL=index.d.ts.map