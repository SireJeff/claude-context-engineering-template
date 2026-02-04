/**
 * AI Context MCP Server
 *
 * Database-backed MCP server for AI context storage and semantic search.
 *
 * @packageDocumentation
 */
// Server
export { createServer, startServer, main } from './server.js';
// Database
export { DatabaseClient } from './db/client.js';
export { EmbeddingsManager } from './db/embeddings.js';
export { SCHEMA_VERSION, RELATION_TYPES, CONTEXT_TYPES } from './db/schema.js';
// Embeddings
export { OpenRouterEmbeddings, createEmbeddingsClient } from './embeddings/openrouter.js';
// Indexers
export { ContextIndexer } from './indexers/context.js';
export { CodeIndexer } from './indexers/code.js';
export { GitIndexer } from './indexers/git.js';
// Graph
export { GraphTraversal } from './graph/traversal.js';
export { RELATION_DEFINITIONS, RELATION_CATEGORIES, getRelationsByCategory, getRelationCategory, isValidRelation, suggestRelations } from './graph/relations.js';
// Shadow
export { ShadowGenerator } from './shadow/generator.js';
// Tools
export { TOOL_DEFINITIONS, handleToolCall } from './tools/handlers.js';
// Resources
export { listResources, readResource, getResourceTemplates } from './resources/handlers.js';
// Prompts
export { PROMPT_DEFINITIONS, getPrompt } from './prompts/handlers.js';
//# sourceMappingURL=index.js.map