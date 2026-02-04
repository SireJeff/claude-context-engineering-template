/**
 * Knowledge Graph Traversal
 * 
 * Graph query and traversal operations for the knowledge graph.
 */

import { DatabaseClient, type GraphEdge, type ContextItem } from '../db/client.js';
import type { RelationType } from '../db/schema.js';
import { getRelationsByCategory, RELATION_CATEGORIES } from './relations.js';

/**
 * Graph node with context
 */
export interface GraphNode {
  item: ContextItem;
  depth: number;
  path: string[];
  incomingRelations: GraphEdge[];
  outgoingRelations: GraphEdge[];
}

/**
 * Graph query result
 */
export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    maxDepth: number;
  };
}

/**
 * Path finding result
 */
export interface PathResult {
  source: ContextItem;
  target: ContextItem;
  paths: Array<{
    nodes: ContextItem[];
    edges: GraphEdge[];
    length: number;
  }>;
}

/**
 * Knowledge graph traversal engine
 */
export class GraphTraversal {
  private db: DatabaseClient;

  constructor(db: DatabaseClient) {
    this.db = db;
  }

  /**
   * Get full graph context for a node
   */
  getNodeContext(itemId: string): GraphNode | null {
    const item = this.db.getItem(itemId);
    if (!item) return null;

    return {
      item,
      depth: 0,
      path: [itemId],
      incomingRelations: this.db.getRelationsTo(itemId),
      outgoingRelations: this.db.getRelationsFrom(itemId)
    };
  }

  /**
   * Traverse the graph from a starting node
   */
  traverse(
    startId: string,
    options: {
      maxDepth?: number;
      relationTypes?: RelationType[];
      direction?: 'outgoing' | 'incoming' | 'both';
      maxNodes?: number;
    } = {}
  ): GraphQueryResult {
    const {
      maxDepth = 3,
      relationTypes,
      direction = 'both',
      maxNodes = 100
    } = options;

    const visited = new Map<string, GraphNode>();
    const allEdges: GraphEdge[] = [];
    const queue: Array<{ id: string; depth: number; path: string[] }> = [
      { id: startId, depth: 0, path: [startId] }
    ];

    while (queue.length > 0 && visited.size < maxNodes) {
      const { id, depth, path } = queue.shift()!;

      if (visited.has(id) || depth > maxDepth) continue;

      const item = this.db.getItem(id);
      if (!item) continue;

      // Get relations based on direction
      let outgoing: GraphEdge[] = [];
      let incoming: GraphEdge[] = [];

      if (direction === 'outgoing' || direction === 'both') {
        outgoing = this.db.getRelationsFrom(id, relationTypes?.[0]);
        if (relationTypes && relationTypes.length > 1) {
          outgoing = outgoing.filter(e => relationTypes.includes(e.relationType));
        }
      }

      if (direction === 'incoming' || direction === 'both') {
        incoming = this.db.getRelationsTo(id, relationTypes?.[0]);
        if (relationTypes && relationTypes.length > 1) {
          incoming = incoming.filter(e => relationTypes.includes(e.relationType));
        }
      }

      visited.set(id, {
        item,
        depth,
        path,
        incomingRelations: incoming,
        outgoingRelations: outgoing
      });

      // Add edges to result
      allEdges.push(...outgoing, ...incoming);

      // Queue next nodes
      for (const edge of outgoing) {
        if (!visited.has(edge.targetId)) {
          queue.push({
            id: edge.targetId,
            depth: depth + 1,
            path: [...path, edge.targetId]
          });
        }
      }

      for (const edge of incoming) {
        if (!visited.has(edge.sourceId)) {
          queue.push({
            id: edge.sourceId,
            depth: depth + 1,
            path: [...path, edge.sourceId]
          });
        }
      }
    }

    // Deduplicate edges
    const uniqueEdges = this.deduplicateEdges(allEdges);

    return {
      nodes: Array.from(visited.values()),
      edges: uniqueEdges,
      stats: {
        nodeCount: visited.size,
        edgeCount: uniqueEdges.length,
        maxDepth: Math.max(...Array.from(visited.values()).map(n => n.depth))
      }
    };
  }

  /**
   * Find all paths between two nodes
   */
  findPaths(
    sourceId: string,
    targetId: string,
    options: {
      maxDepth?: number;
      maxPaths?: number;
    } = {}
  ): PathResult | null {
    const { maxDepth = 5, maxPaths = 10 } = options;

    const source = this.db.getItem(sourceId);
    const target = this.db.getItem(targetId);

    if (!source || !target) return null;

    const paths: Array<{ nodes: ContextItem[]; edges: GraphEdge[]; length: number }> = [];
    const visited = new Set<string>();

    const dfs = (
      currentId: string,
      currentPath: string[],
      currentEdges: GraphEdge[]
    ): void => {
      if (paths.length >= maxPaths) return;
      if (currentPath.length > maxDepth) return;
      if (currentId === targetId) {
        // Found a path
        const pathNodes = currentPath.map(id => this.db.getItem(id)!);
        paths.push({
          nodes: pathNodes,
          edges: [...currentEdges],
          length: currentPath.length - 1
        });
        return;
      }

      visited.add(currentId);

      const outgoing = this.db.getRelationsFrom(currentId);
      for (const edge of outgoing) {
        if (!visited.has(edge.targetId)) {
          dfs(
            edge.targetId,
            [...currentPath, edge.targetId],
            [...currentEdges, edge]
          );
        }
      }

      visited.delete(currentId);
    };

    dfs(sourceId, [sourceId], []);

    return {
      source,
      target,
      paths: paths.sort((a, b) => a.length - b.length)
    };
  }

  /**
   * Get nodes by relation category
   */
  getNodesByRelationCategory(
    itemId: string,
    category: keyof typeof RELATION_CATEGORIES,
    direction: 'outgoing' | 'incoming' | 'both' = 'outgoing'
  ): ContextItem[] {
    const relationTypes = getRelationsByCategory(category);
    const result = this.traverse(itemId, {
      maxDepth: 1,
      relationTypes,
      direction
    });

    return result.nodes
      .filter(n => n.depth === 1)
      .map(n => n.item);
  }

  /**
   * Get dependency chain for a node
   */
  getDependencyChain(itemId: string, maxDepth = 5): GraphQueryResult {
    return this.traverse(itemId, {
      maxDepth,
      relationTypes: ['depends_on', 'imports', 'uses'],
      direction: 'outgoing'
    });
  }

  /**
   * Get dependents (things that depend on this node)
   */
  getDependents(itemId: string, maxDepth = 2): GraphQueryResult {
    return this.traverse(itemId, {
      maxDepth,
      relationTypes: ['depends_on', 'imports', 'uses'],
      direction: 'incoming'
    });
  }

  /**
   * Get hierarchy (parent/child relationships)
   */
  getHierarchy(itemId: string, direction: 'up' | 'down' | 'both' = 'both'): GraphQueryResult {
    const graphDirection = direction === 'up' 
      ? 'incoming' 
      : direction === 'down' 
        ? 'outgoing' 
        : 'both';

    return this.traverse(itemId, {
      maxDepth: 5,
      relationTypes: ['contains', 'extends', 'implements'],
      direction: graphDirection
    });
  }

  /**
   * Find related documentation
   */
  getRelatedDocs(itemId: string): ContextItem[] {
    const result = this.traverse(itemId, {
      maxDepth: 2,
      relationTypes: ['documents', 'references'],
      direction: 'both'
    });

    return result.nodes
      .filter(n => n.depth > 0 && ['workflow', 'agent', 'command'].includes(n.item.type))
      .map(n => n.item);
  }

  /**
   * Find related tests
   */
  getRelatedTests(itemId: string): ContextItem[] {
    const result = this.traverse(itemId, {
      maxDepth: 1,
      relationTypes: ['tests'],
      direction: 'incoming'
    });

    return result.nodes
      .filter(n => n.depth === 1)
      .map(n => n.item);
  }

  /**
   * Get strongly connected components (clusters)
   */
  getClusters(): Map<string, ContextItem[]> {
    const allItems = this.db.getAllItems();
    const clusters = new Map<string, ContextItem[]>();
    const visited = new Set<string>();

    for (const item of allItems) {
      if (visited.has(item.id)) continue;

      // BFS to find all connected nodes
      const cluster: ContextItem[] = [];
      const queue = [item.id];

      while (queue.length > 0) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;

        const node = this.db.getItem(id);
        if (!node) continue;

        visited.add(id);
        cluster.push(node);

        // Get all connected nodes
        const outgoing = this.db.getRelationsFrom(id);
        const incoming = this.db.getRelationsTo(id);

        for (const edge of outgoing) {
          if (!visited.has(edge.targetId)) {
            queue.push(edge.targetId);
          }
        }

        for (const edge of incoming) {
          if (!visited.has(edge.sourceId)) {
            queue.push(edge.sourceId);
          }
        }
      }

      if (cluster.length > 0) {
        // Name the cluster by the most central node
        const clusterName = cluster[0].name;
        clusters.set(clusterName, cluster);
      }
    }

    return clusters;
  }

  /**
   * Deduplicate edges
   */
  private deduplicateEdges(edges: GraphEdge[]): GraphEdge[] {
    const seen = new Set<string>();
    return edges.filter(edge => {
      const key = `${edge.sourceId}:${edge.targetId}:${edge.relationType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
