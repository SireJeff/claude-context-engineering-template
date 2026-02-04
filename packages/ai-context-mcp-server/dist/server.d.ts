/**
 * MCP Server
 *
 * Main Model Context Protocol server implementation.
 * Uses stdio transport for Claude Desktop compatibility.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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
export declare function createServer(config: ServerConfig): Promise<Server>;
/**
 * Start the server with stdio transport
 */
export declare function startServer(config: ServerConfig): Promise<void>;
/**
 * Main entry point
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=server.d.ts.map