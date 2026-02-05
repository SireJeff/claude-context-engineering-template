/**
 * MCP Server
 * 
 * Model Context Protocol server for AI context.
 * Provides tools, resources, and prompts for AI coding assistants.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { DatabaseClient } from './db/client.js';
import { OpenRouterClient, createOpenRouterClient, hasOpenRouterKey } from './embeddings/openrouter.js';
import { createIntelligentAnalyzer } from './analyzer/intelligent-analyzer.js';

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
 * Tool context for handlers
 */
interface ToolContext {
  db: DatabaseClient;
  openrouter: OpenRouterClient | null;
  projectRoot: string;
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

  // Initialize OpenRouter client (optional)
  let openrouter: OpenRouterClient | null = null;
  if (hasOpenRouterKey()) {
    try {
      openrouter = createOpenRouterClient();
    } catch (error) {
      console.error('Warning: OpenRouter unavailable:', error);
    }
  }

  // Create context for handlers
  const ctx: ToolContext = { db, openrouter, projectRoot };

  // Create MCP server
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

  // search_context - Semantic search across indexed content
  server.registerTool(
    'search_context',
    {
      description: 'Semantic search across all indexed content (workflows, agents, code, commits, docs)',
      inputSchema: {
        query: z.string().describe('Natural language search query'),
        type: z.enum(['workflow', 'agent', 'command', 'code', 'commit', 'knowledge', 'config', 'doc', 'tool_config']).optional().describe('Filter by content type'),
        limit: z.number().optional().describe('Maximum results (default: 10)')
      }
    },
    async (args) => {
      const { query, type, limit = 10 } = args as { query: string; type?: string; limit?: number };
      
      // Text search (semantic search requires embeddings)
      const results = ctx.db.searchText(query, type as any);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results.slice(0, limit), null, 2)
        }]
      };
    }
  );

  // get_item - Get a specific context item
  server.registerTool(
    'get_item',
    {
      description: 'Get a specific context item by ID or path',
      inputSchema: {
        id: z.string().optional().describe('Context item ID'),
        path: z.string().optional().describe('File path to look up')
      }
    },
    async (args) => {
      const { id, path: filePath } = args as { id?: string; path?: string };
      
      let item = null;
      if (id) {
        item = ctx.db.getItem(id);
      } else if (filePath) {
        const items = ctx.db.getAllItems().filter(i => i.filePath === filePath);
        item = items[0] || null;
      }
      
      return {
        content: [{
          type: 'text',
          text: item ? JSON.stringify(item, null, 2) : 'Item not found'
        }]
      };
    }
  );

  // add_knowledge - Store new knowledge
  server.registerTool(
    'add_knowledge',
    {
      description: 'Store a new insight or fact about the codebase',
      inputSchema: {
        name: z.string().describe('Short name for the knowledge item'),
        content: z.string().describe('The knowledge content'),
        relatedTo: z.array(z.string()).optional().describe('IDs of related items')
      }
    },
    async (args) => {
      const { name, content, relatedTo } = args as { name: string; content: string; relatedTo?: string[] };
      
      const item = ctx.db.upsertItem({
        type: 'knowledge',
        name,
        content,
        metadata: { relatedTo }
      });
      
      // Add relations if specified
      if (relatedTo) {
        for (const targetId of relatedTo) {
          ctx.db.addRelation({
            sourceId: item.id,
            targetId,
            relationType: 'references'
          });
        }
      }
      
      return {
        content: [{
          type: 'text',
          text: `Knowledge item created: ${item.id}`
        }]
      };
    }
  );

  // analyze - Run intelligent analysis
  server.registerTool(
    'analyze',
    {
      description: 'Run intelligent analysis on the codebase using OpenRouter',
      inputSchema: {
        type: z.enum(['full', 'docs', 'code', 'tools']).optional().describe('Analysis type')
      }
    },
    async (args) => {
      const { type = 'full' } = args as { type?: string };
      
      const analyzer = createIntelligentAnalyzer(ctx.projectRoot);
      const analysis = await analyzer.analyze();
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(analysis, null, 2)
        }]
      };
    }
  );

  // get_tool_configs - Get AI tool configurations
  server.registerTool(
    'get_tool_configs',
    {
      description: 'Get configurations for AI tools (Claude, Copilot, Cline, etc.)',
      inputSchema: {
        tool: z.enum(['claude', 'copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue', 'cursor', 'gemini']).optional().describe('Specific tool to get configs for')
      }
    },
    async (args) => {
      const { tool } = args as { tool?: string };
      
      const configs = tool 
        ? ctx.db.getToolConfigs(tool as any)
        : ctx.db.getAllToolConfigs();
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(configs, null, 2)
        }]
      };
    }
  );

  // query_graph - Traverse knowledge graph
  server.registerTool(
    'query_graph',
    {
      description: 'Traverse the knowledge graph from a starting point',
      inputSchema: {
        startId: z.string().describe('Starting context item ID'),
        direction: z.enum(['outgoing', 'incoming', 'both']).optional().describe('Traversal direction'),
        maxDepth: z.number().optional().describe('Maximum depth (default: 3)')
      }
    },
    async (args) => {
      const { startId, direction = 'both', maxDepth = 3 } = args as { startId: string; direction?: string; maxDepth?: number };
      
      const results = ctx.db.traverseGraph(startId, maxDepth);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(Array.from(results.entries()), null, 2)
        }]
      };
    }
  );

  // get_stats - Database statistics
  server.registerTool(
    'get_stats',
    {
      description: 'Get database and indexing statistics',
      inputSchema: {}
    },
    async () => {
      const stats = ctx.db.getStats();
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(stats, null, 2)
        }]
      };
    }
  );

  // ==================== Register Prompts ====================

  // context-engineer prompt
  server.registerPrompt(
    'context-engineer',
    {
      description: 'Initialize and configure the AI context system',
      argsSchema: {
        projectType: z.string().optional().describe('Type of project')
      }
    },
    () => {
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `You are a Context Engineer specializing in setting up AI context systems.

Your goal is to analyze the current codebase and set up optimal AI context configuration.

Available tools:
- search_context: Search indexed content
- get_item: Get specific items
- add_knowledge: Store new insights
- analyze: Run intelligent analysis
- get_tool_configs: View AI tool configurations
- get_stats: View database statistics

Start by running 'analyze' to understand the codebase, then use 'add_knowledge' to capture important insights.`
          }
        }]
      };
    }
  );

  // core-architect prompt
  server.registerPrompt(
    'core-architect',
    {
      description: 'Design system architecture',
      argsSchema: {
        focus: z.string().optional().describe('Area to focus on')
      }
    },
    (args) => {
      const { focus } = args as { focus?: string };
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `You are a Core Architect designing system architecture.
${focus ? `Focus area: ${focus}` : ''}

Use the context tools to understand the existing architecture and propose improvements.`
          }
        }]
      };
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
  const projectRoot = process.env.AI_CONTEXT_PROJECT_ROOT || process.cwd();
  const dbPath = process.env.AI_CONTEXT_DB_PATH;

  await startServer({
    projectRoot,
    dbPath
  });
}
