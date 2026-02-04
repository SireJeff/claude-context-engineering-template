/**
 * MCP Resources
 *
 * Resource definitions and handlers for the MCP server.
 */
import { DatabaseClient } from '../db/client.js';
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
export declare function listResources(ctx: ResourceContext): Resource[];
/**
 * Get resource templates for dynamic resources
 */
export declare function getResourceTemplates(): Array<{
    uriTemplate: string;
    name: string;
    description: string;
    mimeType: string;
}>;
/**
 * Read a resource by URI
 */
export declare function readResource(uri: string, ctx: ResourceContext): ResourceContent;
//# sourceMappingURL=handlers.d.ts.map