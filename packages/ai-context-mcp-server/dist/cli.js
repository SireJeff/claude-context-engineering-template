#!/usr/bin/env node
/**
 * CLI Entry Point
 *
 * Command-line interface for the AI Context MCP Server.
 */
import { main } from './server.js';
// Run the server
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map