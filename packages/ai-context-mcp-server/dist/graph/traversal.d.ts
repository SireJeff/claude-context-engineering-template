/**
 * Knowledge Graph Traversal
 *
 * Graph query and traversal operations for the knowledge graph.
 */
import { DatabaseClient, type GraphEdge, type ContextItem } from '../db/client.js';
import type { RelationType } from '../db/schema.js';
import { RELATION_CATEGORIES } from './relations.js';
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
export declare class GraphTraversal {
    private db;
    constructor(db: DatabaseClient);
    /**
     * Get full graph context for a node
     */
    getNodeContext(itemId: string): GraphNode | null;
    /**
     * Traverse the graph from a starting node
     */
    traverse(startId: string, options?: {
        maxDepth?: number;
        relationTypes?: RelationType[];
        direction?: 'outgoing' | 'incoming' | 'both';
        maxNodes?: number;
    }): GraphQueryResult;
    /**
     * Find all paths between two nodes
     */
    findPaths(sourceId: string, targetId: string, options?: {
        maxDepth?: number;
        maxPaths?: number;
    }): PathResult | null;
    /**
     * Get nodes by relation category
     */
    getNodesByRelationCategory(itemId: string, category: keyof typeof RELATION_CATEGORIES, direction?: 'outgoing' | 'incoming' | 'both'): ContextItem[];
    /**
     * Get dependency chain for a node
     */
    getDependencyChain(itemId: string, maxDepth?: number): GraphQueryResult;
    /**
     * Get dependents (things that depend on this node)
     */
    getDependents(itemId: string, maxDepth?: number): GraphQueryResult;
    /**
     * Get hierarchy (parent/child relationships)
     */
    getHierarchy(itemId: string, direction?: 'up' | 'down' | 'both'): GraphQueryResult;
    /**
     * Find related documentation
     */
    getRelatedDocs(itemId: string): ContextItem[];
    /**
     * Find related tests
     */
    getRelatedTests(itemId: string): ContextItem[];
    /**
     * Get strongly connected components (clusters)
     */
    getClusters(): Map<string, ContextItem[]>;
    /**
     * Deduplicate edges
     */
    private deduplicateEdges;
}
//# sourceMappingURL=traversal.d.ts.map