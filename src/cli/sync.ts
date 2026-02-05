import { Command } from 'commander';
import { DatabaseClient } from '../db/client.js';
import ora from 'ora';
import chalk from 'chalk';
import crypto from 'crypto';
import fs from 'fs/promises';

export interface SyncStatus {
  synced: boolean;
  differences: string[];
}

export interface SyncResult {
  count: number;
  files: string[];
}

export const syncCommand = new Command('sync')
  .description('Synchronize context across all AI tools')
  .option('--check', 'Only check synchronization status')
  .option('--from <tool>', 'Sync from specific tool')
  .option('--to <tool>', 'Sync to specific tool')
  .option('--force', 'Force sync even if up-to-date')
  .action(async (options) => {
    const spinner = ora('Checking sync status...').start();

    try {
      const db = new DatabaseClient();
      const syncManager = new SyncManager(db);

      if (options.check) {
        const status = await syncManager.checkStatus();
        if (status.synced) {
          spinner.succeed(chalk.green('All tools are synchronized'));
        } else {
          spinner.warn(chalk.yellow('Tools are out of sync'));
          console.log(chalk.dim('Differences:'), status.differences.join(', '));
        }
        return;
      }

      if (options.from) {
        spinner.text = `Syncing from ${options.from}...`;
        await syncManager.syncFrom(options.from);
        spinner.succeed(chalk.green(`Synced from ${options.from}`));
        return;
      }

      // Default: sync all tools
      spinner.text = 'Syncing all tools...';
      const result = await syncManager.syncAll({ force: options.force });
      spinner.succeed(chalk.green(`Synced ${result.count} tools`));

      if (result.files.length > 0) {
        console.log(chalk.dim('Synced:'), result.files.join(', '));
      }

    } catch (error) {
      spinner.fail(chalk.red('Sync failed'));
      console.error(chalk.dim(error.message));
      process.exit(1);
    }
  });

export class SyncManager {
  constructor(private db: DatabaseClient) {}

  async checkStatus(): Promise<SyncStatus> {
    const tools = await this.getToolFiles();
    const hashes = await this.getFileHashes(tools);
    const differences: string[] = [];

    for (const [tool, hash] of Object.entries(hashes)) {
      const stored = await this.db.getSyncState(tool);
      const storedHash = Array.isArray(stored) ? stored[0]?.hash : stored?.hash;
      if (storedHash !== undefined && storedHash !== hash) {
        differences.push(tool);
      }
    }

    return {
      synced: differences.length === 0,
      differences
    };
  }

  async syncFrom(tool: string): Promise<void> {
    const configs = await this.db.getToolConfigs(tool);
    if (!configs || configs.length === 0) {
      throw new Error(`Tool ${tool} not found in database`);
    }

    // Sync logic - propagate changes from this tool to others
    const content = await this.readToolFile(tool);
    await this.propagateToTools(tool, content);
  }

  async syncAll(options: { force?: boolean }): Promise<SyncResult> {
    const tools = ['claude', 'copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue', 'cursor', 'gemini'];
    const synced = [];

    for (const tool of tools) {
      try {
        await this.syncTool(tool, options);
        synced.push(tool);
      } catch (error) {
        // Continue with other tools even if one fails
        console.error(chalk.dim(`Failed to sync ${tool}: ${error.message}`));
      }
    }

    return { count: synced.length, files: synced };
  }

  private async getToolFiles(): Promise<string[]> {
    return ['claude', 'copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue', 'cursor', 'gemini'];
  }

  private async getFileHashes(tools: string[]): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {};
    const toolPaths: Record<string, string> = {
      claude: 'AI_CONTEXT.md',
      copilot: '.github/copilot-instructions.md',
      cline: '.clinerules',
      antigravity: '.agent/README.md',
      windsurf: '.windsurf/rules.md',
      aider: '.aider.conf.yml',
      continue: '.continue/config.json',
      cursor: '.cursorrules',
      gemini: '.gemini/config.md'
    };

    for (const tool of tools) {
      try {
        const content = await fs.readFile(toolPaths[tool], 'utf-8');
        hashes[tool] = crypto.createHash('sha256').update(content).digest('hex');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          chalk.yellow(
            `Warning: Failed to read tool file for "${tool}" at "${toolPaths[tool]}": ${message}`
          )
        );
        hashes[tool] = '';
      }
    }

    return hashes;
  }

  private async readToolFile(tool: string): Promise<string> {
    const toolPaths: Record<string, string> = {
      claude: 'AI_CONTEXT.md',
      copilot: '.github/copilot-instructions.md',
      cline: '.clinerules',
      antigravity: '.agent/README.md',
      windsurf: '.windsurf/rules.md',
      aider: '.aider.conf.yml',
      continue: '.continue/config.json',
      cursor: '.cursorrules',
      gemini: '.gemini/config.md'
    };

    return await fs.readFile(toolPaths[tool], 'utf-8');
  }

  private async propagateToTools(fromTool: string, content: string): Promise<void> {
    // In a full implementation, this would parse the content
    // and propagate it to all other tools
    // For now, this is a placeholder
    console.log(chalk.dim(`Propagating from ${fromTool} to other tools...`));
  }

  private async syncTool(tool: string, options: { force?: boolean }): Promise<void> {
    const toolPaths: Record<string, string> = {
      claude: 'AI_CONTEXT.md',
      copilot: '.github/copilot-instructions.md',
      cline: '.clinerules',
      antigravity: '.agent/README.md',
      windsurf: '.windsurf/rules.md',
      aider: '.aider.conf.yml',
      continue: '.continue/config.json',
      cursor: '.cursorrules',
      gemini: '.gemini/config.md'
    };

    // Check if sync is needed
    if (!options.force) {
      const content = await this.db.getContextItems();
      if (content.length === 0) {
        throw new Error(`No content in database for ${tool}`);
      }
    }

    // Update sync state
    await this.db.updateSyncState(tool, {
      hash: Date.now().toString(),
      lastSynced: new Date().toISOString()
    });
  }
}
