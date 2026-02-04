/**
 * MCP Server
 * 
 * Main Model Context Protocol server implementation.
 * Uses stdio transport for Claude Desktop compatibility.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { DatabaseClient } from './db/client.js';
import { EmbeddingsManager } from './db/embeddings.js';
import { createEmbeddingsClient } from './embeddings/openrouter.js';
import { handleToolCall, type ToolContext } from './tools/handlers.js';
import { listResources, readResource, type ResourceContext } from './resources/handlers.js';
import { getPrompt, type PromptContext } from './prompts/handlers.js';

/**
 * Server configuration
 */
export interface ServerConfig {
  projectRoot: string;
  dbPath?: string;
  name?: string;
  version?: string;
}

/**
 * Create and start the MCP server
 */
export async function createServer(config: ServerConfig): Promise<McpServer> {
  const {
    projectRoot,
    dbPath = '.ai-context.db',
    name = 'ai-context',
    version = '1.0.0'
  } = config;

  // Initialize database
  const db = new DatabaseClient(projectRoot, dbPath);

  // Initialize embeddings (requires OPENROUTER_API_KEY)
  let embeddings: EmbeddingsManager;
  try {
    const embeddingsClient = createEmbeddingsClient();
    embeddings = new EmbeddingsManager(db['db'], embeddingsClient);
  } catch (error) {
    console.error('Warning: Embeddings unavailable:', error);
    // Create a mock embeddings manager that will throw on use
    embeddings = {
      search: async () => [],
      queueForEmbedding: () => {},
      processQueue: async () => 0,
      getCount: () => 0,
      deleteEmbedding: () => false
    } as unknown as EmbeddingsManager;
  }

  // Create context for handlers
  const ctx: ToolContext & ResourceContext & PromptContext = { db, embeddings, projectRoot };

  // Create MCP server using the new McpServer class
  const server = new McpServer(
    { name, version },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      }
    }
  );

  // ==================== Register Tools ====================

  // search_context
  server.registerTool(
    'search_context',
    {
      description: 'Semantic search across all indexed content (workflows, agents, code, commits)',
      inputSchema: {
        query: z.string().describe('Natural language search query'),
        type: z.enum(['workflow', 'agent', 'command', 'code', 'commit', 'knowledge', 'config']).optional().describe('Filter by content type (optional)'),
        limit: z.number().optional().describe('Maximum number of results (default: 10)')
      }
    },
    async (args) => {
      const result = await handleToolCall('search_context', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // get_item
  server.registerTool(
    'get_item',
    {
      description: 'Get a specific context item by ID or path',
      inputSchema: {
        id: z.string().optional().describe('Context item ID (e.g., "workflow:user-authentication")'),
        path: z.string().optional().describe('File path to look up')
      }
    },
    async (args) => {
      const result = await handleToolCall('get_item', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // add_knowledge
  server.registerTool(
    'add_knowledge',
    {
      description: 'Store a new insight or fact about the codebase',
      inputSchema: {
        name: z.string().describe('Short name for the knowledge item'),
        content: z.string().describe('The knowledge content to store'),
        relatedTo: z.array(z.string()).optional().describe('IDs of related context items (optional)')
      }
    },
    async (args) => {
      const result = await handleToolCall('add_knowledge', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // add_relation
  server.registerTool(
    'add_relation',
    {
      description: 'Add a relationship between two context items',
      inputSchema: {
        sourceId: z.string().describe('Source item ID'),
        targetId: z.string().describe('Target item ID'),
        relationType: z.enum([
          'uses', 'implements', 'depends_on', 'references', 'tests',
          'documents', 'extends', 'contains', 'calls', 'imports',
          'configures', 'authenticates', 'validates', 'transforms'
        ]).describe('Type of relationship')
      }
    },
    async (args) => {
      const result = await handleToolCall('add_relation', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // query_graph
  server.registerTool(
    'query_graph',
    {
      description: 'Traverse the knowledge graph from a starting point',
      inputSchema: {
        startId: z.string().describe('Starting context item ID'),
        direction: z.enum(['outgoing', 'incoming', 'both']).optional().describe('Traversal direction (default: both)'),
        relationType: z.string().optional().describe('Filter by relation type (optional)'),
        maxDepth: z.number().optional().describe('Maximum traversal depth (default: 3)')
      }
    },
    async (args) => {
      const result = await handleToolCall('query_graph', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // find_path
  server.registerTool(
    'find_path',
    {
      description: 'Find paths between two context items in the knowledge graph',
      inputSchema: {
        sourceId: z.string().describe('Source item ID'),
        targetId: z.string().describe('Target item ID'),
        maxDepth: z.number().optional().describe('Maximum path length (default: 5)')
      }
    },
    async (args) => {
      const result = await handleToolCall('find_path', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // run_drift_check
  server.registerTool(
    'run_drift_check',
    {
      description: 'Check if context documentation is in sync with the codebase',
      inputSchema: {}
    },
    async (args) => {
      const result = await handleToolCall('run_drift_check', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // reindex
  server.registerTool(
    'reindex',
    {
      description: 'Re-index the codebase, context documents, and git history',
      inputSchema: {
        types: z.array(z.enum(['context', 'code', 'git'])).optional().describe('Types of content to reindex (default: all)'),
        force: z.boolean().optional().describe('Force full reindex even if content unchanged')
      }
    },
    async (args) => {
      const result = await handleToolCall('reindex', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // export_shadow
  server.registerTool(
    'export_shadow',
    {
      description: 'Regenerate shadow .md files for git visibility',
      inputSchema: {}
    },
    async (args) => {
      const result = await handleToolCall('export_shadow', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // get_stats
  server.registerTool(
    'get_stats',
    {
      description: 'Get database and indexing statistics',
      inputSchema: {}
    },
    async (args) => {
      const result = await handleToolCall('get_stats', args as Record<string, unknown>, ctx);
      return result;
    }
  );

  // ==================== Register Resources ====================

  // Register resource templates to avoid eagerly loading all database-backed resources
  const resourceTemplates = getResourceTemplates(ctx);
  for (const template of resourceTemplates) {
    try {
      server.registerResourceTemplate(
        template.name,
        template.uriTemplate,
        { description: template.description, mimeType: template.mimeType },
        (request) => {
          const content = readResource(request.uri, ctx);
          return { contents: [{ uri: content.uri, mimeType: content.mimeType, text: content.text }] };
        }
      );
    } catch {
      // Resource template may already be registered or have invalid URI template
      console.error(
        `Failed to register resource "${resource.name}" with URI "${resource.uri}":`,
        error
      );
    }
  }

  // ==================== Register Prompts ====================

  // context-engineer
  server.registerPrompt(
    'context-engineer',
    {
      description: 'Initialize and configure the AI context system for a project',
      argsSchema: {
        projectType: z.string().optional().describe('Type of project (e.g., "web-app", "cli", "library")')
      }
    },
    (args) => {
      return getPrompt('context-engineer', args as Record<string, string>, ctx);
    }
  );

  // core-architect
  server.registerPrompt(
    'core-architect',
    {
      description: 'Design system architecture and plan project structure',
      argsSchema: {
        focus: z.string().optional().describe('Area to focus on (e.g., "api", "database", "frontend")')
      }
    },
    (args) => {
      return getPrompt('core-architect', args as Record<string, string>, ctx);
    }
  );

  // api-developer
  server.registerPrompt(
    'api-developer',
    {
      description: 'Design and implement API endpoints',
      argsSchema: {
        endpoint: z.string().optional().describe('Specific endpoint to work on')
      }
    },
    (args) => {
      return getPrompt('api-developer', args as Record<string, string>, ctx);
    }
  );

  // database-ops
  server.registerPrompt(
    'database-ops',
    {
      description: 'Design database schemas and migrations',
      argsSchema: {
        operation: z.string().optional().describe('Type of operation (e.g., "schema", "migration", "query")')
      }
    },
    (args) => {
      return getPrompt('database-ops', args as Record<string, string>, ctx);
    }
  );

  // deployment-ops
  server.registerPrompt(
    'deployment-ops',
    {
      description: 'Plan deployments and CI/CD pipelines',
      argsSchema: {
        environment: z.string().optional().describe('Target environment (e.g., "development", "staging", "production")')
      }
    },
    (args) => {
      return getPrompt('deployment-ops', args as Record<string, string>, ctx);
    }
  );

  // integration-hub
  server.registerPrompt(
    'integration-hub',
    {
      description: 'Design external service integrations',
      argsSchema: {
        service: z.string().optional().describe('Service to integrate with')
      }
    },
    (args) => {
      return getPrompt('integration-hub', args as Record<string, string>, ctx);
    }
  );

  return server;
}

/**
 * Start the server with stdio transport
 */
export async function startServer(config: ServerConfig): Promise<void> {
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
export async function main(): Promise<void> {
  // Get project root from environment or current directory
  const projectRoot = process.env.AI_CONTEXT_PROJECT_ROOT || process.cwd();
  const dbPath = process.env.AI_CONTEXT_DB_PATH;

  await startServer({
    projectRoot,
    dbPath
  });
}
