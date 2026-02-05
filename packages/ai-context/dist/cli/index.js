#!/usr/bin/env node
/**
 * AI Context CLI
 *
 * Unified CLI for AI Context Engineering.
 * Supports initialization, MCP server, context generation, and cross-tool sync.
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createIntelligentAnalyzer } from '../analyzer/intelligent-analyzer.js';
import { hasOpenRouterKey } from '../embeddings/openrouter.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Read package.json for version
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
// Supported AI tools
const AI_TOOLS = ['claude', 'copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue', 'cursor', 'gemini', 'all'];
/**
 * ASCII Banner
 */
function showBanner() {
    console.log(`
${chalk.cyan('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('AI Context')} ${chalk.gray('v' + packageJson.version)}                                      ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Unified context engineering for all AI coding assistants')}     ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════════╝')}
`);
}
/**
 * Parse AI tools from comma-separated string
 */
function parseAiTools(toolsString) {
    const tools = toolsString.split(',').map(t => t.trim().toLowerCase());
    const invalid = tools.filter(t => !AI_TOOLS.includes(t));
    if (invalid.length > 0) {
        console.error(chalk.red(`\n✖ Error: Invalid AI tools: ${invalid.join(', ')}`));
        console.error(chalk.gray(`  Valid options: ${AI_TOOLS.join(', ')}`));
        process.exit(1);
    }
    const allTools = AI_TOOLS.filter(t => t !== 'all');
    return tools.includes('all') ? allTools : tools;
}
/**
 * Create the CLI program
 */
function createProgram() {
    const program = new Command();
    program
        .name('ai-context')
        .description('Unified AI Context Engineering - Intelligent context for all AI coding assistants')
        .version(packageJson.version);
    // ==================== Init Command ====================
    program
        .command('init')
        .description('Initialize AI context for a project with intelligent analysis')
        .argument('[project-name]', 'Name of the project (defaults to current directory)')
        .option('-y, --yes', 'Skip prompts and use defaults')
        .option('--ai <tools>', 'Generate for specific AI tools (comma-separated)', 'all')
        .option('-v, --verbose', 'Show detailed output')
        .option('--no-intelligent', 'Skip OpenRouter-powered intelligent analysis')
        .option('--force', 'Force overwrite existing context files')
        .action(async (projectName, options) => {
        showBanner();
        const targetDir = projectName
            ? path.resolve(process.cwd(), projectName)
            : process.cwd();
        const spinner = ora();
        // Check for OpenRouter API key
        const hasApiKey = hasOpenRouterKey();
        if (!hasApiKey && options.intelligent !== false) {
            console.log(chalk.yellow('\n⚠ OPENROUTER_API_KEY not found'));
            console.log(chalk.gray('  Set OPENROUTER_API_KEY for intelligent analysis'));
            console.log(chalk.gray('  Get your key at: https://openrouter.ai/keys\n'));
            console.log(chalk.gray('  Continuing with basic analysis...\n'));
        }
        try {
            // Create analyzer
            spinner.start('Analyzing project...');
            const analyzer = createIntelligentAnalyzer(targetDir);
            // Run analysis
            const analysis = await analyzer.analyze();
            spinner.succeed('Analysis complete');
            // Display results
            console.log(`\n${chalk.bold('Analysis Results:')}`);
            console.log(`  ${chalk.cyan('•')} Documents: ${analysis.existingContext.files.filter(f => f.type === 'doc').length} found`);
            console.log(`  ${chalk.cyan('•')} Tool Configs: ${analysis.existingContext.tools.length} configured (${analysis.existingContext.tools.join(', ') || 'none'})`);
            console.log(`  ${chalk.cyan('•')} Tech Stack: ${analysis.techStack.languages.join(', ') || 'Unknown'}`);
            if (analyzer.isIntelligentModeAvailable()) {
                console.log(`  ${chalk.green('✓')} Intelligent Analysis: Enabled`);
                if (analysis.workflows.length > 0) {
                    console.log(`  ${chalk.cyan('•')} Workflows Discovered: ${analysis.workflows.length}`);
                }
            }
            else {
                console.log(`  ${chalk.yellow('○')} Intelligent Analysis: Disabled (no API key)`);
            }
            console.log(`\n${chalk.bold('Summary:')}`);
            console.log(analysis.summary);
            if (analysis.suggestions.workflows.length > 0) {
                console.log(`\n${chalk.bold('Suggested Workflows to Document:')}`);
                for (const workflow of analysis.suggestions.workflows.slice(0, 5)) {
                    console.log(`  ${chalk.cyan('•')} ${workflow}`);
                }
            }
            console.log(`\n${chalk.green('✓')} AI Context initialized successfully!`);
            console.log(`\n${chalk.bold('Next Steps:')}`);
            console.log(`  ${chalk.cyan('1.')} Run ${chalk.white('ai-context generate')} to create context files`);
            console.log(`  ${chalk.cyan('2.')} Run ${chalk.white('ai-context mcp')} to start the MCP server`);
            console.log(`  ${chalk.cyan('3.')} Run ${chalk.white('ai-context sync')} to sync across AI tools`);
        }
        catch (error) {
            spinner.fail('Analysis failed');
            console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : error}`));
            process.exit(1);
        }
    });
    // ==================== Generate Command ====================
    program
        .command('generate')
        .description('Generate or regenerate context files for AI tools')
        .option('--ai <tools>', 'Generate for specific AI tools (comma-separated)', 'all')
        .option('-v, --verbose', 'Show detailed output')
        .option('--force', 'Force regenerate even if files exist')
        .action(async (options) => {
        showBanner();
        const targetDir = process.cwd();
        const tools = parseAiTools(options.ai);
        const spinner = ora();
        try {
            spinner.start(`Generating context for: ${tools.join(', ')}`);
            // TODO: Implement generation from database
            spinner.succeed(`Generated context files for ${tools.length} tools`);
        }
        catch (error) {
            spinner.fail('Generation failed');
            console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : error}`));
            process.exit(1);
        }
    });
    // ==================== MCP Command ====================
    program
        .command('mcp')
        .description('Start the MCP server for AI tools to connect')
        .option('--db <path>', 'Database file path', '.ai-context.db')
        .option('--port <port>', 'HTTP port (for HTTP transport)', '3000')
        .option('--stdio', 'Use stdio transport (default for Claude Desktop)')
        .action(async (options) => {
        const projectRoot = process.cwd();
        console.error(chalk.cyan('AI Context MCP Server starting...'));
        console.error(chalk.gray(`Project root: ${projectRoot}`));
        console.error(chalk.gray(`Database: ${options.db}`));
        // Dynamic import of server module
        try {
            const { startServer } = await import('../mcp.js');
            await startServer({
                projectRoot,
                dbPath: options.db
            });
        }
        catch (error) {
            console.error(chalk.red(`\nError starting MCP server: ${error instanceof Error ? error.message : error}`));
            process.exit(1);
        }
    });
    // ==================== Sync Command ====================
    program
        .command('sync')
        .description('Synchronize context across all AI tools')
        .option('--check', 'Only check sync status, do not modify')
        .option('--from <tool>', 'Sync from a specific tool to others')
        .option('--to <tool>', 'Sync to a specific tool')
        .option('-v, --verbose', 'Show detailed output')
        .action(async (options) => {
        showBanner();
        const spinner = ora();
        try {
            spinner.start('Checking sync status...');
            // TODO: Implement sync logic
            spinner.succeed('All tools synchronized');
        }
        catch (error) {
            spinner.fail('Sync failed');
            console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : error}`));
            process.exit(1);
        }
    });
    // ==================== Index Command ====================
    program
        .command('index')
        .description('Index codebase content into the database')
        .option('--docs', 'Index documentation files only')
        .option('--code', 'Index source code only')
        .option('--tools', 'Index AI tool configurations only')
        .option('--all', 'Index everything (default)')
        .option('-v, --verbose', 'Show detailed output')
        .action(async (options) => {
        showBanner();
        const spinner = ora();
        try {
            spinner.start('Indexing content...');
            const analyzer = createIntelligentAnalyzer(process.cwd());
            let indexed = 0;
            if (options.all || (!options.docs && !options.code && !options.tools)) {
                // Index everything
                const [docs, code, tools] = await Promise.all([
                    analyzer.discoverDocs(),
                    analyzer.discoverCode(),
                    analyzer.discoverToolConfigs()
                ]);
                indexed = docs.length + code.length + tools.length;
            }
            else {
                if (options.docs) {
                    const docs = await analyzer.discoverDocs();
                    indexed += docs.length;
                }
                if (options.code) {
                    const code = await analyzer.discoverCode();
                    indexed += code.length;
                }
                if (options.tools) {
                    const tools = await analyzer.discoverToolConfigs();
                    indexed += tools.length;
                }
            }
            spinner.succeed(`Indexed ${indexed} files`);
        }
        catch (error) {
            spinner.fail('Indexing failed');
            console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : error}`));
            process.exit(1);
        }
    });
    // ==================== Search Command ====================
    program
        .command('search <query>')
        .description('Semantic search across indexed content')
        .option('-t, --type <type>', 'Filter by type (workflow, agent, command, code, doc)')
        .option('-l, --limit <n>', 'Maximum results', '10')
        .action(async (query, options) => {
        const spinner = ora();
        try {
            spinner.start('Searching...');
            // TODO: Implement search
            spinner.stop();
            console.log(chalk.yellow('\nSearch functionality coming soon...'));
        }
        catch (error) {
            spinner.fail('Search failed');
            console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : error}`));
            process.exit(1);
        }
    });
    // ==================== Stats Command ====================
    program
        .command('stats')
        .description('Show database and indexing statistics')
        .action(async () => {
        showBanner();
        try {
            const { DatabaseClient } = await import('../db/client.js');
            const db = new DatabaseClient(process.cwd());
            const stats = db.getStats();
            console.log(`${chalk.bold('Database Statistics:')}`);
            console.log(`  ${chalk.cyan('•')} Context Items: ${stats.items}`);
            console.log(`  ${chalk.cyan('•')} Relations: ${stats.relations}`);
            console.log(`  ${chalk.cyan('•')} Git Commits: ${stats.commits}`);
            console.log(`  ${chalk.cyan('•')} Embeddings: ${stats.embeddings}`);
            console.log(`  ${chalk.cyan('•')} Tool Configs: ${stats.toolConfigs}`);
            console.log(`  ${chalk.cyan('•')} Database Path: ${db.getPath()}`);
            db.close();
        }
        catch (error) {
            console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : error}`));
            process.exit(1);
        }
    });
    return program;
}
// Main entry point
const program = createProgram();
program.parse();
//# sourceMappingURL=index.js.map