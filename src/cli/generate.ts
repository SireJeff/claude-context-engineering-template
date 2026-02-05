import { Command } from 'commander';
import { DatabaseClient } from '../db/client.js';
import { IntelligentAnalyzer } from '../analyzer/intelligent-analyzer.js';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export const generateCommand = new Command('generate')
  .description('Generate context files for all AI tools')
  .option('-ai, --ai <tools>', 'Generate for specific tools (comma-separated)')
  .option('--force', 'Force regenerate all files')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    const spinner = ora('Generating context files...').start();

    try {
      const db = new DatabaseClient();

      // Check if database has content
      const stats = await db.getStats();
      if (stats.totalItems === 0) {
        spinner.warn(chalk.yellow('No context found in database. Run `ai-context index` first.'));
        return;
      }

      spinner.text = `Found ${stats.totalItems} context items`;

      // Determine which tools to generate for
      const toolsParam = options.ai ? options.ai.split(',') : ['all'];
      const tools = toolsParam.includes('all') ?
        ['claude', 'copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue', 'cursor', 'gemini'] :
        toolsParam;

      spinner.text = `Generating context for ${tools.length} tools...`;

      const generated = [];
      const skipped = [];

      for (const tool of tools) {
        try {
          const toolPath = await generateForTool(tool, db, options.force);
          if (toolPath) {
            generated.push(tool);
            spinner.text = `Generated ${tool} context`;
          } else {
            skipped.push(tool);
          }
        } catch (error) {
          spinner.fail(chalk.red(`Failed to generate ${tool}: ${error.message}`));
          if (options.verbose) {
            console.error(chalk.dim(error.stack));
          }
        }
      }

      spinner.succeed(chalk.green(`Generated context for ${generated.length} tools`));

      if (skipped.length > 0) {
        console.log(chalk.dim(`Skipped: ${skipped.join(', ')}`));
      }

      if (options.verbose) {
        console.log(chalk.dim('Generated:'), generated.join(', '));
      }

    } catch (error) {
      spinner.fail(chalk.red('Generation failed'));
      console.error(chalk.dim(error.message));
      if (options.verbose) {
        console.error(chalk.dim(error.stack));
      }
      process.exit(1);
    }
  });

async function generateForTool(
  tool: string,
  db: DatabaseClient,
  force: boolean
): Promise<string | null> {
  const toolConfigs: Record<string, { path: string; template: string }> = {
    claude: { path: 'AI_CONTEXT.md', template: 'claude' },
    copilot: { path: '.github/copilot-instructions.md', template: 'copilot' },
    cline: { path: '.clinerules', template: 'cline' },
    antigravity: { path: '.agent/README.md', template: 'antigravity' },
    windsurf: { path: '.windsurf/rules.md', template: 'windsurf' },
    aider: { path: '.aider.conf.yml', template: 'aider' },
    continue: { path: '.continue/config.json', template: 'continue' },
    cursor: { path: '.cursorrules', template: 'cursor' },
    gemini: { path: '.gemini/config.md', template: 'gemini' }
  });

  const config = toolConfigs[tool];
  if (!config) {
    return null;
  }

  // Check if file exists and force is not set
  if (!force) {
    try {
      await fs.access(config.path);
      return null; // File exists, skip
    } catch {
      // File doesn't exist, proceed
    }
  }

  // Get context from database
  const contextItems = await db.getContextItems();

  // Generate content based on tool
  const content = generateContent(tool, contextItems);

  // Ensure directory exists
  const dir = path.dirname(config.path);
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(config.path, content, 'utf-8');

  return config.path;
}

function generateContent(tool: string, contextItems: any[]): string {
  // Basic content generation - in production this would use templates
  const projectName = contextItems.find(i => i.type === 'config' && i.name === 'project')?.content?.name || 'Project';
  const description = contextItems.find(i => i.type === 'config' && i.name === 'project')?.content?.description || '';

  switch (tool) {
    case 'claude':
      return generateClaudeContext(projectName, description, contextItems);
    case 'copilot':
      return generateCopilotContext(projectName, description, contextItems);
    case 'cline':
      return generateClineContext(projectName, description, contextItems);
    case 'aider':
      return generateAiderConfig(contextItems);
    default:
      return `# ${tool.charAt(0).toUpperCase() + tool.slice(1)} Context\n\nProject: ${projectName}\n${description}`;
  }
}

function generateClaudeContext(projectName: string, description: string, items: any[]): string {
  return `# ${projectName}

${description}

## Project Structure

${items.filter(i => i.type === 'workflow').map(i => `### ${i.name}\n${i.content?.substring(0, 200)}...`).join('\n\n')}

## Key Files

${items.filter(i => i.type === 'code').slice(0, 10).map(i => `- \`${i.name}\``).join('\n')}

---
*Generated by ai-context v3.0.0*
`;
}

function generateCopilotContext(projectName: string, description: string, items: any[]): string {
  return `# ${projectName}

${description}

## Tech Stack
- Node.js 18+
- TypeScript

## Key Patterns
${items.filter(i => i.type === 'workflow').slice(0, 5).map(i => `- ${i.name}: ${i.content?.substring(0, 100)}...`).join('\n')}

---
*Generated by ai-context v3.0.0*
`;
}

function generateClineContext(projectName: string, description: string, items: any[]): string {
  return `# ${projectName} - Cline Rules

${description}

## Architecture
${items.filter(i => i.type === 'workflow').slice(0, 3).map(i => `### ${i.name}\n${i.content?.substring(0, 150)}...`).join('\n\n')}

## Development Commands
- \`npm install\` - Install dependencies
- \`npm test\` - Run tests
- \`npm run build\` - Build project

---
*Generated by ai-context v3.0.0*
`;
}

function generateAiderConfig(items: any[]): string {
  return `# Aider Configuration
model: claude-3-5-sonnet-20241022
auto-commits: false
map-tokens: 2048

# Always read these files
read:
  - README.md
  - AI_CONTEXT.md

# Testing
test-cmd: npm test
auto-test: false

# Language
language: typescript

---
*Generated by ai-context v3.0.0*
`;
}
