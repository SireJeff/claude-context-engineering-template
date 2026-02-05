/**
 * MCP Resources
 * 
 * Resource definitions and handlers for the MCP server.
 */

import { DatabaseClient } from '../db/client.js';
import type { ContextType } from '../db/schema.js';

/**
 * Resource URI pattern
 */
export type ResourceUri = `context://${string}`;

/**
 * Resource definition
 */
export interface Resource {
  uri: ResourceUri;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Resource content
 */
export interface ResourceContent {
  uri: ResourceUri;
  mimeType: string;
  text: string;
}

/**
 * Resource handler context
 */
export interface ResourceContext {
  db: DatabaseClient;
  projectRoot: string;
}

/**
 * Get all available resources
 */
export function listResources(ctx: ResourceContext): Resource[] {
  const resources: Resource[] = [];

  // List all items as resources
  const items = ctx.db.getAllItems();

  for (const item of items) {
    resources.push({
      uri: `context://${item.type}/${encodeURIComponent(item.name)}` as ResourceUri,
      name: item.name,
      description: `${item.type}: ${item.name}`,
      mimeType: 'text/markdown'
    });
  }

  // Add special aggregate resources
  resources.push({
    uri: 'context://index' as ResourceUri,
    name: 'Context Index',
    description: 'Index of all context items',
    mimeType: 'text/markdown'
  });

  resources.push({
    uri: 'context://stats' as ResourceUri,
    name: 'Statistics',
    description: 'Database statistics and metrics',
    mimeType: 'application/json'
  });

  return resources;
}

/**
 * Get resource templates for dynamic resources
 */
export function getResourceTemplates(): Array<{
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}> {
  return [
    {
      uriTemplate: 'context://workflows/{name}',
      name: 'Workflow',
      description: 'Get a specific workflow document',
      mimeType: 'text/markdown'
    },
    {
      uriTemplate: 'context://agents/{name}',
      name: 'Agent',
      description: 'Get a specific agent definition',
      mimeType: 'text/markdown'
    },
    {
      uriTemplate: 'context://commands/{name}',
      name: 'Command',
      description: 'Get a specific command documentation',
      mimeType: 'text/markdown'
    },
    {
      uriTemplate: 'context://code/{path}',
      name: 'Code',
      description: 'Get indexed source code',
      mimeType: 'text/plain'
    },
    {
      uriTemplate: 'context://commits/{sha}',
      name: 'Commit',
      description: 'Get commit information',
      mimeType: 'text/markdown'
    }
  ];
}

/**
 * Read a resource by URI
 */
export function readResource(uri: string, ctx: ResourceContext): ResourceContent {
  // Parse URI
  const parsed = parseResourceUri(uri);

  if (!parsed) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }

  // Handle special resources
  if (parsed.type === 'index') {
    return {
      uri: uri as ResourceUri,
      mimeType: 'text/markdown',
      text: generateIndex(ctx)
    };
  }

  if (parsed.type === 'stats') {
    return {
      uri: uri as ResourceUri,
      mimeType: 'application/json',
      text: JSON.stringify(ctx.db.getStats(), null, 2)
    };
  }

  // Look up item by type and name
  const items = ctx.db.getItemsByType(parsed.type as ContextType);
  const item = items.find(i => 
    i.name.toLowerCase() === parsed.name.toLowerCase() ||
    i.id === `${parsed.type}:${parsed.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
  );

  if (!item) {
    throw new Error(`Resource not found: ${uri}`);
  }

  return {
    uri: uri as ResourceUri,
    mimeType: 'text/markdown',
    text: item.content
  };
}

/**
 * Parse resource URI
 */
function parseResourceUri(uri: string): { type: string; name: string } | null {
  const match = uri.match(/^context:\/\/([^/]+)(?:\/(.+))?$/);
  if (!match) return null;

  return {
    type: match[1],
    name: match[2] ? decodeURIComponent(match[2]) : ''
  };
}

/**
 * Generate index content
 */
function generateIndex(ctx: ResourceContext): string {
  const lines = [
    '# AI Context Index',
    '',
    '## Contents',
    ''
  ];

  const types: ContextType[] = ['workflow', 'agent', 'command', 'code', 'commit', 'knowledge', 'config'];

  for (const type of types) {
    const items = ctx.db.getItemsByType(type);
    if (items.length === 0) continue;

    lines.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)}s`);
    lines.push('');

    for (const item of items) {
      lines.push(`- **${item.name}** (${item.id})`);
    }

    lines.push('');
  }

  // Add stats
  const stats = ctx.db.getStats();
  lines.push('## Statistics');
  lines.push('');
  lines.push(`- Items: ${stats.items}`);
  lines.push(`- Relations: ${stats.relations}`);
  lines.push(`- Commits: ${stats.commits}`);
  lines.push(`- Embeddings: ${stats.embeddings}`);

  return lines.join('\n');
}
