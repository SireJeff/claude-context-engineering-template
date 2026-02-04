/**
 * MCP Server
 *
 * Main Model Context Protocol server implementation.
 * Uses stdio transport for Claude Desktop compatibility.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListResourceTemplatesRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseClient } from './db/client.js';
import { EmbeddingsManager } from './db/embeddings.js';
import { createEmbeddingsClient } from './embeddings/openrouter.js';
import { TOOL_DEFINITIONS, handleToolCall } from './tools/handlers.js';
import { listResources, readResource, getResourceTemplates } from './resources/handlers.js';
import { PROMPT_DEFINITIONS, getPrompt } from './prompts/handlers.js';
/**
 * Create and start the MCP server
 */
export async function createServer(config) {
    const { projectRoot, dbPath = '.ai-context.db', name = 'ai-context', version = '1.0.0' } = config;
    // Initialize database
    const db = new DatabaseClient(projectRoot, dbPath);
    // Initialize embeddings (requires OPENROUTER_API_KEY)
    let embeddings;
    try {
        const embeddingsClient = createEmbeddingsClient();
        embeddings = new EmbeddingsManager(db['db'], embeddingsClient);
    }
    catch (error) {
        console.error('Warning: Embeddings unavailable:', error);
        // Create a mock embeddings manager that will throw on use
        embeddings = {
            search: async () => [],
            queueForEmbedding: () => { },
            processQueue: async () => 0,
            getCount: () => 0,
            deleteEmbedding: () => false
        };
    }
    // Create context for handlers
    const ctx = { db, embeddings, projectRoot };
    // Create MCP server
    const server = new Server({ name, version }, {
        capabilities: {
            tools: {},
            resources: {},
            prompts: {}
        }
    });
    // ==================== Tool Handlers ====================
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: TOOL_DEFINITIONS };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        return handleToolCall(name, args || {}, ctx);
    });
    // ==================== Resource Handlers ====================
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return { resources: listResources(ctx) };
    });
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
        return { resourceTemplates: getResourceTemplates() };
    });
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        const content = readResource(uri, ctx);
        return {
            contents: [{
                    uri: content.uri,
                    mimeType: content.mimeType,
                    text: content.text
                }]
        };
    });
    // ==================== Prompt Handlers ====================
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return { prompts: PROMPT_DEFINITIONS };
    });
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        return getPrompt(name, args || {}, ctx);
    });
    return server;
}
/**
 * Start the server with stdio transport
 */
export async function startServer(config) {
    const server = await createServer(config);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`AI Context MCP Server started`);
    console.error(`Project root: ${config.projectRoot}`);
    console.error(`Database: ${config.dbPath || '.ai-context.db'}`);
}
/**
 * Main entry point
 */
export async function main() {
    // Get project root from environment or current directory
    const projectRoot = process.env.AI_CONTEXT_PROJECT_ROOT || process.cwd();
    const dbPath = process.env.AI_CONTEXT_DB_PATH;
    await startServer({
        projectRoot,
        dbPath
    });
}
//# sourceMappingURL=server.js.map