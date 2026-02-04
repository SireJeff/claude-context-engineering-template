/**
 * Knowledge Graph Traversal
 *
 * Graph query and traversal operations for the knowledge graph.
 */
import { getRelationsByCategory } from './relations.js';
/**
 * Knowledge graph traversal engine
 */
export class GraphTraversal {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Get full graph context for a node
     */
    getNodeContext(itemId) {
        const item = this.db.getItem(itemId);
        if (!item)
            return null;
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
    traverse(startId, options = {}) {
        const { maxDepth = 3, relationTypes, direction = 'both', maxNodes = 100 } = options;
        const visited = new Map();
        const allEdges = [];
        const queue = [
            { id: startId, depth: 0, path: [startId] }
        ];
        while (queue.length > 0 && visited.size < maxNodes) {
            const { id, depth, path } = queue.shift();
            if (visited.has(id) || depth > maxDepth)
                continue;
            const item = this.db.getItem(id);
            if (!item)
                continue;
            // Get relations based on direction
            let outgoing = [];
            let incoming = [];
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
    findPaths(sourceId, targetId, options = {}) {
        const { maxDepth = 5, maxPaths = 10 } = options;
        const source = this.db.getItem(sourceId);
        const target = this.db.getItem(targetId);
        if (!source || !target)
            return null;
        const paths = [];
        const visited = new Set();
        const dfs = (currentId, currentPath, currentEdges) => {
            if (paths.length >= maxPaths)
                return;
            if (currentPath.length > maxDepth)
                return;
            if (currentId === targetId) {
                // Found a path
                const pathNodes = currentPath.map(id => this.db.getItem(id));
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
                    dfs(edge.targetId, [...currentPath, edge.targetId], [...currentEdges, edge]);
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
    getNodesByRelationCategory(itemId, category, direction = 'outgoing') {
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
    getDependencyChain(itemId, maxDepth = 5) {
        return this.traverse(itemId, {
            maxDepth,
            relationTypes: ['depends_on', 'imports', 'uses'],
            direction: 'outgoing'
        });
    }
    /**
     * Get dependents (things that depend on this node)
     */
    getDependents(itemId, maxDepth = 2) {
        return this.traverse(itemId, {
            maxDepth,
            relationTypes: ['depends_on', 'imports', 'uses'],
            direction: 'incoming'
        });
    }
    /**
     * Get hierarchy (parent/child relationships)
     */
    getHierarchy(itemId, direction = 'both') {
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
    getRelatedDocs(itemId) {
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
    getRelatedTests(itemId) {
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
    getClusters() {
        const allItems = this.db.getAllItems();
        const clusters = new Map();
        const visited = new Set();
        for (const item of allItems) {
            if (visited.has(item.id))
                continue;
            // BFS to find all connected nodes
            const cluster = [];
            const queue = [item.id];
            while (queue.length > 0) {
                const id = queue.shift();
                if (visited.has(id))
                    continue;
                const node = this.db.getItem(id);
                if (!node)
                    continue;
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
    deduplicateEdges(edges) {
        const seen = new Set();
        return edges.filter(edge => {
            const key = `${edge.sourceId}:${edge.targetId}:${edge.relationType}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
}
//# sourceMappingURL=traversal.js.map