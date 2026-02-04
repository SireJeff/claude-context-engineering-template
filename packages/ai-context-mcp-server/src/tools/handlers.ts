/**
 * MCP Tools
 * 
 * Tool definitions and handlers for the MCP server.
 */

import { z } from 'zod';
import { DatabaseClient } from '../db/client.js';
import { EmbeddingsManager } from '../db/embeddings.js';
import { ContextIndexer, CodeIndexer, GitIndexer } from '../indexers/index.js';
import { GraphTraversal } from '../graph/traversal.js';
import { ShadowGenerator } from '../shadow/generator.js';
import type { ContextType, RelationType } from '../db/schema.js';

/**
 * Tool definitions for MCP
 */
export const TOOL_DEFINITIONS = [
  {
    name: 'search_context',
    description: 'Semantic search across all indexed content (workflows, agents, code, commits)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query'
        },
        type: {
          type: 'string',
          enum: ['workflow', 'agent', 'command', 'code', 'commit', 'knowledge', 'config'],
          description: 'Filter by content type (optional)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_item',
    description: 'Get a specific context item by ID or path',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Context item ID (e.g., "workflow:user-authentication")'
        },
        path: {
          type: 'string',
          description: 'File path to look up'
        }
      }
    }
  },
  {
    name: 'add_knowledge',
    description: 'Store a new insight or fact about the codebase',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Short name for the knowledge item'
        },
        content: {
          type: 'string',
          description: 'The knowledge content to store'
        },
        relatedTo: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs of related context items (optional)'
        }
      },
      required: ['name', 'content']
    }
  },
  {
    name: 'add_relation',
    description: 'Add a relationship between two context items',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sourceId: {
          type: 'string',
          description: 'Source item ID'
        },
        targetId: {
          type: 'string',
          description: 'Target item ID'
        },
        relationType: {
          type: 'string',
          enum: [
            'uses', 'implements', 'depends_on', 'references', 'tests',
            'documents', 'extends', 'contains', 'calls', 'imports',
            'configures', 'authenticates', 'validates', 'transforms'
          ],
          description: 'Type of relationship'
        }
      },
      required: ['sourceId', 'targetId', 'relationType']
    }
  },
  {
    name: 'query_graph',
    description: 'Traverse the knowledge graph from a starting point',
    inputSchema: {
      type: 'object' as const,
      properties: {
        startId: {
          type: 'string',
          description: 'Starting context item ID'
        },
        direction: {
          type: 'string',
          enum: ['outgoing', 'incoming', 'both'],
          description: 'Traversal direction (default: both)'
        },
        relationType: {
          type: 'string',
          description: 'Filter by relation type (optional)'
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum traversal depth (default: 3)'
        }
      },
      required: ['startId']
    }
  },
  {
    name: 'find_path',
    description: 'Find paths between two context items in the knowledge graph',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sourceId: {
          type: 'string',
          description: 'Source item ID'
        },
        targetId: {
          type: 'string',
          description: 'Target item ID'
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum path length (default: 5)'
        }
      },
      required: ['sourceId', 'targetId']
    }
  },
  {
    name: 'run_drift_check',
    description: 'Check if context documentation is in sync with the codebase',
    inputSchema: {
      type: 'object' as const,
      properties: {}
    }
  },
  {
    name: 'reindex',
    description: 'Re-index the codebase, context documents, and git history',
    inputSchema: {
      type: 'object' as const,
      properties: {
        types: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['context', 'code', 'git']
          },
          description: 'Types of content to reindex (default: all)'
        },
        force: {
          type: 'boolean',
          description: 'Force full reindex even if content unchanged'
        }
      }
    }
  },
  {
    name: 'export_shadow',
    description: 'Regenerate shadow .md files for git visibility',
    inputSchema: {
      type: 'object' as const,
      properties: {}
    }
  },
  {
    name: 'get_stats',
    description: 'Get database and indexing statistics',
    inputSchema: {
      type: 'object' as const,
      properties: {}
    }
  }
];

/**
 * Tool handler context
 */
export interface ToolContext {
  db: DatabaseClient;
  embeddings: EmbeddingsManager;
  projectRoot: string;
}

/**
 * Tool handler result
 */
export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Handle tool calls
 */
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    let result: unknown;

    switch (name) {
      case 'search_context':
        result = await handleSearchContext(args, ctx);
        break;
      case 'get_item':
        result = await handleGetItem(args, ctx);
        break;
      case 'add_knowledge':
        result = await handleAddKnowledge(args, ctx);
        break;
      case 'add_relation':
        result = await handleAddRelation(args, ctx);
        break;
      case 'query_graph':
        result = await handleQueryGraph(args, ctx);
        break;
      case 'find_path':
        result = await handleFindPath(args, ctx);
        break;
      case 'run_drift_check':
        result = await handleDriftCheck(args, ctx);
        break;
      case 'reindex':
        result = await handleReindex(args, ctx);
        break;
      case 'export_shadow':
        result = await handleExportShadow(args, ctx);
        break;
      case 'get_stats':
        result = await handleGetStats(args, ctx);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Log usage
    const latency = Date.now() - startTime;
    ctx.db.logUsage(name, args.query as string | undefined, undefined, latency);

    return {
      content: [{
        type: 'text',
        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}

// ==================== Tool Handlers ====================

async function handleSearchContext(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const query = args.query as string;
  const type = args.type as ContextType | undefined;
  const limit = (args.limit as number) || 10;

  // First try semantic search
  const semanticResults = await ctx.embeddings.search(query, limit);

  if (semanticResults.length === 0) {
    // Fall back to text search
    const textResults = ctx.db.searchText(query, type);
    return {
      method: 'text',
      results: textResults.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        excerpt: item.content.slice(0, 200) + '...'
      }))
    };
  }

  // Get full items for semantic results
  const results = semanticResults
    .map(r => {
      const item = ctx.db.getItem(r.contextId);
      if (!item) return null;
      if (type && item.type !== type) return null;
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        similarity: r.similarity.toFixed(3),
        excerpt: item.content.slice(0, 200) + '...'
      };
    })
    .filter(Boolean);

  return {
    method: 'semantic',
    results
  };
}

async function handleGetItem(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const id = args.id as string | undefined;
  const filePath = args.path as string | undefined;

  if (id) {
    const item = ctx.db.getItem(id);
    if (!item) {
      throw new Error(`Item not found: ${id}`);
    }
    return item;
  }

  if (filePath) {
    const items = ctx.db.getAllItems().filter(i => i.filePath === filePath);
    if (items.length === 0) {
      throw new Error(`No item found for path: ${filePath}`);
    }
    return items;
  }

  throw new Error('Either id or path is required');
}

async function handleAddKnowledge(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const name = args.name as string;
  const content = args.content as string;
  const relatedTo = args.relatedTo as string[] | undefined;

  // Add knowledge item
  const item = ctx.db.upsertItem({
    type: 'knowledge',
    name,
    content
  });

  // Queue for embedding
  ctx.embeddings.queueForEmbedding(item.id);

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
    success: true,
    item: {
      id: item.id,
      name: item.name,
      type: item.type
    },
    message: 'Knowledge stored successfully'
  };
}

async function handleAddRelation(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const sourceId = args.sourceId as string;
  const targetId = args.targetId as string;
  const relationType = args.relationType as RelationType;

  // Verify both items exist
  if (!ctx.db.getItem(sourceId)) {
    throw new Error(`Source item not found: ${sourceId}`);
  }
  if (!ctx.db.getItem(targetId)) {
    throw new Error(`Target item not found: ${targetId}`);
  }

  const edge = ctx.db.addRelation({
    sourceId,
    targetId,
    relationType
  });

  return {
    success: true,
    relation: edge,
    message: `Added ${relationType} relation from ${sourceId} to ${targetId}`
  };
}

async function handleQueryGraph(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const startId = args.startId as string;
  const direction = (args.direction as 'outgoing' | 'incoming' | 'both') || 'both';
  const relationType = args.relationType as RelationType | undefined;
  const maxDepth = (args.maxDepth as number) || 3;

  const traversal = new GraphTraversal(ctx.db);
  const result = traversal.traverse(startId, {
    maxDepth,
    direction,
    relationTypes: relationType ? [relationType] : undefined
  });

  return {
    nodes: result.nodes.map(n => ({
      id: n.item.id,
      name: n.item.name,
      type: n.item.type,
      depth: n.depth
    })),
    edges: result.edges.map(e => ({
      source: e.sourceId,
      target: e.targetId,
      relation: e.relationType
    })),
    stats: result.stats
  };
}

async function handleFindPath(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const sourceId = args.sourceId as string;
  const targetId = args.targetId as string;
  const maxDepth = (args.maxDepth as number) || 5;

  const traversal = new GraphTraversal(ctx.db);
  const result = traversal.findPaths(sourceId, targetId, { maxDepth });

  if (!result) {
    throw new Error('Source or target not found');
  }

  return {
    source: { id: result.source.id, name: result.source.name },
    target: { id: result.target.id, name: result.target.name },
    paths: result.paths.map(p => ({
      length: p.length,
      nodes: p.nodes.map(n => n.name),
      relations: p.edges.map(e => e.relationType)
    }))
  };
}

async function handleDriftCheck(
  _args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const shadow = new ShadowGenerator(ctx.db, ctx.projectRoot);
  const syncStatus = shadow.checkSync();

  return {
    inSync: syncStatus.inSync,
    outdated: syncStatus.outdated,
    missing: syncStatus.missing,
    recommendation: syncStatus.inSync 
      ? 'All shadow files are in sync with database'
      : 'Run export_shadow to regenerate shadow files'
  };
}

async function handleReindex(
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const types = (args.types as string[]) || ['context', 'code', 'git'];
  const results: Record<string, unknown> = {};

  if (types.includes('context')) {
    const indexer = new ContextIndexer(ctx.db, ctx.embeddings, ctx.projectRoot);
    results.context = await indexer.indexAll();
  }

  if (types.includes('code')) {
    const indexer = new CodeIndexer(ctx.db, ctx.embeddings, ctx.projectRoot);
    results.code = await indexer.indexAll();
  }

  if (types.includes('git')) {
    const indexer = new GitIndexer(ctx.db, ctx.embeddings, ctx.projectRoot);
    results.git = await indexer.indexHistory();
  }

  // Process embedding queue
  const processed = await ctx.embeddings.processQueue(50);
  results.embeddingsProcessed = processed;

  return results;
}

async function handleExportShadow(
  _args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const shadow = new ShadowGenerator(ctx.db, ctx.projectRoot);
  const result = await shadow.generateAll();

  return {
    generated: result.generated.length,
    updated: result.updated.length,
    unchanged: result.unchanged.length,
    deleted: result.deleted.length,
    errors: result.errors
  };
}

async function handleGetStats(
  _args: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const dbStats = ctx.db.getStats();
  const usageStats = ctx.db.getUsageStats();

  return {
    database: {
      path: ctx.db.getPath(),
      ...dbStats
    },
    usage: usageStats,
    embeddingCache: ctx.embeddings.getCount()
  };
}
