/**
 * MCP Server
 *
 * Model Context Protocol server for AI context.
 * Provides tools, resources, and prompts for AI coding assistants.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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
export declare function createServer(config: ServerConfig): Promise<McpServer>;
/**
 * Start the server with stdio transport
 */
export declare function startServer(config: ServerConfig): Promise<void>;
/**
 * Main entry point
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=mcp.d.ts.map