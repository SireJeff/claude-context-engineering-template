/**
 * MCP Tools
 *
 * Tool definitions and handlers for the MCP server.
 */
import { DatabaseClient } from '../db/client.js';
import { EmbeddingsManager } from '../db/embeddings.js';
/**
 * Tool definitions for MCP
 */
export declare const TOOL_DEFINITIONS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            id?: undefined;
            path?: undefined;
            name?: undefined;
            content?: undefined;
            relatedTo?: undefined;
            sourceId?: undefined;
            targetId?: undefined;
            relationType?: undefined;
            startId?: undefined;
            direction?: undefined;
            maxDepth?: undefined;
            types?: undefined;
            force?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            id: {
                type: string;
                description: string;
            };
            path: {
                type: string;
                description: string;
            };
            query?: undefined;
            type?: undefined;
            limit?: undefined;
            name?: undefined;
            content?: undefined;
            relatedTo?: undefined;
            sourceId?: undefined;
            targetId?: undefined;
            relationType?: undefined;
            startId?: undefined;
            direction?: undefined;
            maxDepth?: undefined;
            types?: undefined;
            force?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            name: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
            relatedTo: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            query?: undefined;
            type?: undefined;
            limit?: undefined;
            id?: undefined;
            path?: undefined;
            sourceId?: undefined;
            targetId?: undefined;
            relationType?: undefined;
            startId?: undefined;
            direction?: undefined;
            maxDepth?: undefined;
            types?: undefined;
            force?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sourceId: {
                type: string;
                description: string;
            };
            targetId: {
                type: string;
                description: string;
            };
            relationType: {
                type: string;
                enum: string[];
                description: string;
            };
            query?: undefined;
            type?: undefined;
            limit?: undefined;
            id?: undefined;
            path?: undefined;
            name?: undefined;
            content?: undefined;
            relatedTo?: undefined;
            startId?: undefined;
            direction?: undefined;
            maxDepth?: undefined;
            types?: undefined;
            force?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            startId: {
                type: string;
                description: string;
            };
            direction: {
                type: string;
                enum: string[];
                description: string;
            };
            relationType: {
                type: string;
                description: string;
                enum?: undefined;
            };
            maxDepth: {
                type: string;
                description: string;
            };
            query?: undefined;
            type?: undefined;
            limit?: undefined;
            id?: undefined;
            path?: undefined;
            name?: undefined;
            content?: undefined;
            relatedTo?: undefined;
            sourceId?: undefined;
            targetId?: undefined;
            types?: undefined;
            force?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sourceId: {
                type: string;
                description: string;
            };
            targetId: {
                type: string;
                description: string;
            };
            maxDepth: {
                type: string;
                description: string;
            };
            query?: undefined;
            type?: undefined;
            limit?: undefined;
            id?: undefined;
            path?: undefined;
            name?: undefined;
            content?: undefined;
            relatedTo?: undefined;
            relationType?: undefined;
            startId?: undefined;
            direction?: undefined;
            types?: undefined;
            force?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query?: undefined;
            type?: undefined;
            limit?: undefined;
            id?: undefined;
            path?: undefined;
            name?: undefined;
            content?: undefined;
            relatedTo?: undefined;
            sourceId?: undefined;
            targetId?: undefined;
            relationType?: undefined;
            startId?: undefined;
            direction?: undefined;
            maxDepth?: undefined;
            types?: undefined;
            force?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            types: {
                type: string;
                items: {
                    type: string;
                    enum: string[];
                };
                description: string;
            };
            force: {
                type: string;
                description: string;
            };
            query?: undefined;
            type?: undefined;
            limit?: undefined;
            id?: undefined;
            path?: undefined;
            name?: undefined;
            content?: undefined;
            relatedTo?: undefined;
            sourceId?: undefined;
            targetId?: undefined;
            relationType?: undefined;
            startId?: undefined;
            direction?: undefined;
            maxDepth?: undefined;
        };
        required?: undefined;
    };
})[];
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
export declare function handleToolCall(name: string, args: Record<string, unknown>, ctx: ToolContext): Promise<ToolResult>;
//# sourceMappingURL=handlers.d.ts.map