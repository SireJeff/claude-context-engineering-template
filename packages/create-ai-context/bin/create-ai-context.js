#!/usr/bin/env node

/**
 * create-ai-context CLI
 *
 * Universal AI Context Engineering - Set up context for Claude, Copilot, Cline, Antigravity, and more.
 *
 * Usage:
 *   npx create-ai-context                      # Initialize in current directory
 *   npx create-ai-context my-project           # Initialize in new directory
 *   npx create-ai-context --yes                # Skip prompts
 *   npx create-ai-context --ai copilot         # Generate for specific tool
 *   npx create-ai-context generate             # Regenerate context files
 *   npx create-ai-context generate --ai cline  # Regenerate for specific tool
 *   npx create-ai-context migrate              # Migrate from v1.x
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { run } = require('../lib');
const { generateAll, getSupportedTools } = require('../lib/ai-context-generator');
const { migrateV1ToV2, getMigrationStatus } = require('../lib/migrate');
const { detectTechStack } = require('../lib/detector');
const { analyzeCodebase } = require('../lib/static-analyzer');
const { createSpinner } = require('../lib/spinner');
const {
  findDocumentationFiles,
  generateDriftReport,
  checkDocumentDrift,
  formatDriftReportConsole
} = require('../lib/drift-checker');
const {
  checkSyncStatus,
  syncAllFromCodebase,
  updateSyncStateOnly,
  propagateContextChange,
  resolveConflict,
  formatSyncStatus,
  getSyncHistory,
  CONFLICT_STRATEGY
} = require('../lib/cross-tool-sync');
const { getAdapterNames } = require('../lib/adapters');
const packageJson = require('../package.json');

// ASCII Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('AI Context Engineering')} ${chalk.gray('v' + packageJson.version)}                        ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Universal context for Claude, Copilot, Cline & more')}      ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
`;

// Supported AI tools
const AI_TOOLS = ['claude', 'copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue', 'all'];

// Parse AI tools helper
function parseAiTools(toolsString) {
  const tools = toolsString.split(',').map(t => t.trim().toLowerCase());
  const invalid = tools.filter(t => !AI_TOOLS.includes(t));
  if (invalid.length > 0) {
    console.error(chalk.red(`\n✖ Error: Invalid AI tools: ${invalid.join(', ')}`));
    console.error(chalk.gray(`  Valid options: ${AI_TOOLS.join(', ')}`));
    process.exit(1);
  }
  const allTools = ['claude', 'copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue'];
  return tools.includes('all') ? allTools : tools;
}

program
  .name('create-ai-context')
  .description('Universal AI Context Engineering - Set up context for multiple AI coding assistants')
  .version(packageJson.version);

// Main init command (default)
program
  .argument('[project-name]', 'Name of the project (defaults to current directory name)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--no-plugin', 'Skip plugin installation')
  .option('-t, --template <preset>', 'Use a tech stack preset (python-fastapi, node-express, etc.)')
  .option('--no-git', 'Skip git initialization')
  .option('-n, --dry-run', 'Show what would be done without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .option('--ai <tools>', 'Generate for specific AI tools (comma-separated: claude,copilot,cline,antigravity,windsurf,aider,continue,all)', 'all')
  .option('--force-ai', 'Force AI-enhanced mode (creates INIT_REQUEST.md)')
  .option('--static', 'Force standalone mode (static analysis only, no AI setup)')
  .option('--analyze-only', 'Run codebase analysis without installation')
  .option('--monorepo', 'Initialize in monorepo mode with federation support')
  .option('--federate', 'Run federation to generate context for subprojects')
  .option('--mode <mode>', 'How to handle existing docs: merge, overwrite, interactive', 'merge')
  .option('--preserve-custom', 'Keep user customizations when merging (default: true)', true)
  .option('--update-refs', 'Auto-fix drifted line references')
  .option('--backup', 'Create backup before modifying existing files')
  .option('-f, --force', 'Force overwrite of existing custom files (use with caution)')
  .option('--fail-on-unreplaced', 'Error if any placeholders remain unreplaced')
  .action(async (projectName, options) => {
    console.log(banner);

    const aiTools = parseAiTools(options.ai);

    if (options.forceAi && options.static) {
      console.error(chalk.red('\n✖ Error: --force-ai and --static are mutually exclusive'));
      process.exit(1);
    }

    try {
      await run({
        projectName,
        skipPrompts: options.yes,
        installPlugin: options.plugin !== false,
        template: options.template,
        initGit: options.git !== false,
        dryRun: options.dryRun,
        verbose: options.verbose,
        aiTools,
        forceAi: options.forceAi,
        forceStatic: options.static,
        analyzeOnly: options.analyzeOnly,
        monorepo: options.monorepo,
        federate: options.federate,
        // Merge options
        mode: options.mode,
        preserveCustom: options.preserveCustom,
        updateRefs: options.updateRefs,
        backup: options.backup,
        force: options.force || false,
        // Placeholder validation
        failOnUnreplaced: options.failOnUnreplaced === true
      });
    } catch (error) {
      console.error(chalk.red('\n✖ Error:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Generate subcommand - regenerate context files
program
  .command('generate')
  .description('Regenerate AI context files for an existing project')
  .option('--ai <tools>', 'Generate for specific AI tools (comma-separated)', 'all')
  .option('-d, --dryRun', 'Show what would be done without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .option('-f, --force', 'Force overwrite of existing custom files (use with caution)')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);
    const aiTools = parseAiTools(options.ai);
    const spinner = createSpinner();

    // Check if project has .ai-context
    const contextDir = path.join(projectRoot, '.ai-context');
    if (!fs.existsSync(contextDir)) {
      console.error(chalk.red('\n✖ Error: No .ai-context directory found.'));
      console.error(chalk.gray('  Run `npx create-ai-context` first to initialize.'));
      process.exit(1);
    }

    try {
      // Detect tech stack
      spinner.start('Detecting technology stack...');
      const techStack = await detectTechStack(projectRoot);
      spinner.succeed(`Detected: ${techStack.summary || 'Generic project'}`);

      // Analyze codebase
      spinner.start('Analyzing codebase...');
      const analysis = await analyzeCodebase(projectRoot, { techStack });
      analysis.techStack = techStack;
      spinner.succeed(`Analyzed: ${analysis.summary?.totalFiles || 0} files`);

      // Generate context files
      spinner.start('Generating AI context files...');
      const config = {
        projectName: path.basename(projectRoot),
        aiTools,
        verbose: options.verbose,
        force: options.force || false
      };

      if (options.dryRun) {
        spinner.info('Dry run - no files will be written');
        console.log(chalk.gray('\nWould generate for:'));
        aiTools.forEach(tool => {
          console.log(chalk.gray(`  • ${tool}`));
        });
      } else {
        const results = await generateAll(analysis, config, projectRoot, {
          aiTools,
          verbose: options.verbose
        });

        if (results.success) {
          spinner.succeed(`Generated ${results.summary.files} files for ${results.summary.successful} AI tools`);

          console.log(chalk.bold('\nGenerated files:'));
          results.generated.forEach(g => {
            console.log(chalk.green(`  ✓ ${g.displayName}`));
            g.files.forEach(f => {
              console.log(chalk.gray(`      ${f.relativePath}`));
            });
          });
        } else {
          spinner.warn(`Generated ${results.summary.successful}/${results.summary.total} tools`);
          results.errors.forEach(e => {
            console.error(chalk.red(`  ✖ ${e.adapter}: ${e.message || e.errors?.[0]?.message}`));
          });
        }
      }
    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red('\n✖ Error:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Migrate subcommand - upgrade from v1.x
program
  .command('migrate')
  .description('Migrate from v1.x (.claude/) to v2.0 (.ai-context/)')
  .option('-d, --dryRun', 'Show what would be done without making changes')
  .option('--force', 'Overwrite existing v2.0 installation')
  .option('--backup', 'Create backup of existing files')
  .option('--no-update-refs', 'Skip updating internal references')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);
    const spinner = createSpinner();

    // Check migration status
    spinner.start('Checking installation...');
    const status = getMigrationStatus(projectRoot);
    spinner.succeed(`Status: ${status.message}`);

    if (!status.needsMigration) {
      console.log(chalk.green('\n✓ No migration needed.'));
      process.exit(0);
    }

    // Show what will happen
    console.log(chalk.bold('\nMigration plan:'));
    if (status.details?.oldDir) {
      console.log(chalk.cyan(`  • Rename .claude/ → .ai-context/`));
    }
    if (status.details?.oldFile) {
      console.log(chalk.cyan(`  • Rename CLAUDE.md → AI_CONTEXT.md`));
    }
    if (options.updateRefs !== false) {
      console.log(chalk.cyan(`  • Update internal references in files`));
    }

    if (options.dryRun) {
      console.log(chalk.yellow('\n[dry-run] No changes will be made'));
      process.exit(0);
    }

    // Perform migration
    spinner.start('Migrating...');
    try {
      const result = await migrateV1ToV2(projectRoot, {
        dryRun: false,
        force: options.force,
        backup: options.backup,
        updateReferences: options.updateRefs !== false
      });

      if (result.success) {
        spinner.succeed('Migration completed successfully');

        console.log(chalk.bold('\nChanges made:'));
        result.changes.forEach(change => {
          if (change.type === 'rename') {
            console.log(chalk.green(`  ✓ ${change.action} ${change.from} → ${change.to}`));
          } else if (change.type === 'update') {
            console.log(chalk.green(`  ✓ ${change.action} ${change.file}`));
          } else if (change.type === 'backup') {
            console.log(chalk.blue(`  ↺ ${change.action} ${change.from} → ${change.to}`));
          }
        });

        if (result.warnings.length > 0) {
          console.log(chalk.yellow('\nWarnings:'));
          result.warnings.forEach(w => console.log(chalk.yellow(`  ⚠ ${w}`)));
        }

        console.log(chalk.bold('\nNext steps:'));
        console.log(chalk.gray('  1. Review AI_CONTEXT.md for any needed updates'));
        console.log(chalk.gray('  2. Run `npx create-ai-context generate` to regenerate AI tool files'));
        console.log(chalk.gray('  3. Commit the changes'));
      } else {
        spinner.fail('Migration failed');
        result.errors.forEach(e => {
          console.error(chalk.red(`  ✖ ${e}`));
        });
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Migration failed');
      console.error(chalk.red('\n✖ Error:'), error.message);
      process.exit(1);
    }
  });

// Status subcommand - show current installation status
program
  .command('status')
  .description('Show current AI context installation status')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);

    // Check migration status
    const migrationStatus = getMigrationStatus(projectRoot);

    console.log(chalk.bold('Installation Status:\n'));

    // Version status
    if (migrationStatus.status === 'none') {
      console.log(chalk.yellow('  ○ Not initialized'));
      console.log(chalk.gray('    Run `npx create-ai-context` to initialize\n'));
    } else if (migrationStatus.status === 'v1') {
      console.log(chalk.yellow('  ○ v1.x installation found'));
      console.log(chalk.gray('    Run `npx create-ai-context migrate` to upgrade to v2.0\n'));
    } else if (migrationStatus.status === 'v2') {
      console.log(chalk.green('  ✓ v2.0 installation'));
    } else if (migrationStatus.status === 'mixed') {
      console.log(chalk.yellow('  ⚠ Mixed v1.x and v2.0 installation'));
      console.log(chalk.gray('    Run `npx create-ai-context migrate --force` to clean up\n'));
    }

    // Check AI tool outputs
    if (migrationStatus.status === 'v2' || migrationStatus.status === 'mixed') {
      console.log(chalk.bold('\nAI Tool Outputs:'));

      const tools = getSupportedTools();
      for (const tool of tools) {
        let outputPath;
        if (tool.name === 'claude') {
          outputPath = path.join(projectRoot, 'AI_CONTEXT.md');
        } else if (tool.name === 'copilot') {
          outputPath = path.join(projectRoot, '.github', 'copilot-instructions.md');
        } else if (tool.name === 'cline') {
          outputPath = path.join(projectRoot, '.clinerules');
        } else if (tool.name === 'antigravity') {
          outputPath = path.join(projectRoot, '.agent');
        }

        const exists = fs.existsSync(outputPath);
        if (exists) {
          console.log(chalk.green(`  ✓ ${tool.displayName} (${tool.outputPath})`));
        } else {
          console.log(chalk.gray(`  ○ ${tool.displayName} (not generated)`));
        }
      }

      console.log(chalk.gray('\n  Run `npx create-ai-context generate` to regenerate'));
    }
  });

// Drift subcommand - check documentation drift
program
  .command('drift')
  .description('Check documentation drift against codebase')
  .option('-f, --file <path>', 'Check specific documentation file')
  .option('-a, --all', 'Check all documentation files')
  .option('--fix', 'Show suggested fixes for issues')
  .option('--strict', 'Exit with error if drift detected')
  .option('-o, --output <format>', 'Output format: console, json, markdown', 'console')
  .option('-t, --threshold <percent>', 'Health score threshold for --strict', '70')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);
    const spinner = createSpinner();

    try {
      // Determine which files to check
      let filesToCheck = [];

      if (options.file) {
        // Single file mode
        filesToCheck = [options.file];
      } else if (options.all) {
        // All documentation files
        spinner.start('Finding documentation files...');
        filesToCheck = await findDocumentationFiles(projectRoot);
        spinner.succeed(`Found ${filesToCheck.length} documentation files`);
      } else {
        // Default: check main context files
        const defaultFiles = ['CLAUDE.md', 'AI_CONTEXT.md', 'README.md'];
        filesToCheck = defaultFiles.filter(f =>
          fs.existsSync(path.join(projectRoot, f))
        );

        if (filesToCheck.length === 0) {
          console.log(chalk.yellow('\nNo documentation files found.'));
          console.log(chalk.gray('Use --all to scan for all markdown files, or --file to check a specific file.'));
          process.exit(0);
        }
      }

      // Generate drift report
      spinner.start('Checking documentation drift...');
      const report = generateDriftReport(filesToCheck, projectRoot);
      spinner.succeed(`Checked ${report.summary.totalDocuments} documents`);

      // Output results
      if (options.output === 'json') {
        console.log(JSON.stringify(report, null, 2));
      } else if (options.output === 'markdown') {
        console.log(formatDriftReportMarkdown(report));
      } else {
        // Console output
        console.log(formatDriftReportConsole(report));
      }

      // Show suggested fixes if requested
      if (options.fix && report.suggestedFixes.length > 0) {
        console.log(chalk.bold('\nSuggested Fixes:'));
        for (const fix of report.suggestedFixes) {
          console.log(chalk.cyan(`\n  ${fix.document}:`));
          console.log(chalk.red(`    - ${fix.original}`));
          console.log(chalk.green(`    + ${fix.suggestion}`));
        }
      }

      // Strict mode - exit with error if below threshold
      if (options.strict) {
        const threshold = parseInt(options.threshold, 10);
        if (report.summary.overallHealthScore < threshold) {
          console.log(chalk.red(`\n✖ Health score ${report.summary.overallHealthScore}% is below threshold ${threshold}%`));
          process.exit(1);
        } else {
          console.log(chalk.green(`\n✓ Health score ${report.summary.overallHealthScore}% meets threshold ${threshold}%`));
        }
      }

    } catch (error) {
      spinner.fail('Drift check failed');
      console.error(chalk.red('\n✖ Error:'), error.message);
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

/**
 * Format drift report as markdown
 */
function formatDriftReportMarkdown(report) {
  const lines = [
    '# Documentation Drift Report',
    '',
    `**Generated:** ${report.generatedAt}`,
    `**Overall Health:** ${report.summary.overallHealthScore}%`,
    '',
    '## Summary',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Documents Analyzed | ${report.summary.totalDocuments} |`,
    `| Healthy | ${report.summary.healthyDocuments} |`,
    `| With Issues | ${report.summary.documentsWithIssues} |`,
    `| References Valid | ${report.summary.validReferences}/${report.summary.totalReferences} |`,
    ''
  ];

  if (report.documents.length > 0) {
    lines.push('## Documents', '');
    for (const doc of report.documents) {
      const emoji = doc.status === 'healthy' ? '✓' :
                    doc.status === 'needs_update' ? '⚠' : '✗';
      lines.push(`### ${doc.document} (${doc.healthScore}% ${emoji})`);
      lines.push('');

      if (doc.references.invalid.length > 0) {
        lines.push('**Issues:**', '');
        for (const issue of doc.references.invalid) {
          lines.push(`- \`${issue.original}\` - ${issue.issue}`);
          if (issue.suggestion) {
            lines.push(`  - Suggestion: ${issue.suggestion}`);
          }
        }
        lines.push('');
      }
    }
  }

  if (report.suggestedFixes.length > 0) {
    lines.push('## Suggested Fixes', '');
    for (const fix of report.suggestedFixes) {
      lines.push(`- **${fix.document}**: \`${fix.original}\``);
      lines.push(`  - → ${fix.suggestion}`);
    }
  }

  return lines.join('\n');
}

// Sync subcommands
program
  .command('sync:check')
  .description('Check if AI tool contexts are synchronized')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);

    try {
      const status = checkSyncStatus(projectRoot);

      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
      } else {
        console.log(formatSyncStatus(status));

        if (!status.inSync) {
          console.log(chalk.yellow('\nTo sync all contexts, run:'));
          console.log(chalk.gray('  npx create-ai-context sync:all'));
          process.exit(1);
        }
      }
    } catch (error) {
      console.error(chalk.red('\n✖ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('sync:all')
  .description('Synchronize all AI tool contexts from codebase')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .option('--quiet', 'Suppress output')
  .action(async (options) => {
    if (!options.quiet) {
      console.log(banner);
    }

    const projectRoot = path.resolve(options.path);
    const spinner = createSpinner();

    try {
      if (!options.quiet) {
        spinner.start('Analyzing codebase...');
      }

      const config = {
        projectName: path.basename(projectRoot),
        aiTools: getAdapterNames()
      };

      const results = await syncAllFromCodebase(projectRoot, config);

      if (!options.quiet) {
        if (results.errors.length > 0) {
          spinner.warn('Sync completed with errors');

          console.log(chalk.bold('\nSynced tools:'));
          for (const tool of results.tools) {
            console.log(chalk.green(`  ✓ ${tool.tool} (${tool.fileCount} files)`));
          }

          console.log(chalk.red('\nErrors:'));
          for (const error of results.errors) {
            // error object has: { tool, errors: [] } or { tool, message }
            const errorText = error.message ||
              (error.errors && error.errors.length > 0
                ? error.errors.map(e => e.message || e).join('; ')
                : error.tool);
            console.error(chalk.red(`  ✖ ${error.tool || 'Unknown'}: ${errorText}`));
          }
          process.exit(1);
        } else {
          spinner.succeed(`Synced ${results.tools.length} AI tools`);

          console.log(chalk.bold('\nSynced tools:'));
          for (const tool of results.tools) {
            console.log(chalk.green(`  ✓ ${tool.tool} (${tool.fileCount} files)`));
          }
        }
      }
    } catch (error) {
      if (!options.quiet) {
        spinner.fail('Sync failed');
        console.error(chalk.red('\n✖ Error:'), error.message);
      }
      process.exit(1);
    }
  });

program
  .command('sync:state')
  .description('Update sync state without regenerating files (used by post-commit hooks)')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .option('--quiet', 'Suppress output')
  .action(async (options) => {
    if (!options.quiet) {
      console.log(banner);
    }

    const projectRoot = path.resolve(options.path);

    try {
      const result = updateSyncStateOnly(projectRoot);

      if (!options.quiet) {
        console.log(chalk.green('✓ Sync state updated'));
        console.log(chalk.gray(`  Timestamp: ${result.timestamp}`));
        console.log(chalk.gray(`  Tools tracked: ${Object.keys(result.hashes).length}`));
      }
    } catch (error) {
      if (!options.quiet) {
        console.error(chalk.red('\n✖ Error:'), error.message);
      }
      process.exit(1);
    }
  });

program
  .command('sync:from <tool>')
  .description('Propagate context from a specific tool to all others')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .option('-s, --strategy <strategy>', 'Conflict resolution strategy', 'source_wins')
  .action(async (sourceTool, options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);
    const spinner = createSpinner();

    const validTools = getAdapterNames();
    if (!validTools.includes(sourceTool)) {
      console.error(chalk.red(`\n✖ Error: Invalid tool: ${sourceTool}`));
      console.error(chalk.gray(`  Valid options: ${validTools.join(', ')}`));
      process.exit(1);
    }

    try {
      spinner.start(`Propagating from ${sourceTool}...`);

      const config = {
        projectName: path.basename(projectRoot),
        aiTools: validTools
      };

      const results = await propagateContextChange(
        sourceTool,
        projectRoot,
        config,
        options.strategy
      );

      if (results.errors.length > 0) {
        spinner.warn('Propagation completed with errors');

        console.log(chalk.bold('\nPropagated to:'));
        for (const tool of results.propagated) {
          console.log(chalk.green(`  ✓ ${tool.displayName}`));
        }

        console.log(chalk.red('\nErrors:'));
        for (const error of results.errors) {
          const errorText = error.message ||
            (error.errors && error.errors.length > 0
              ? error.errors.map(e => e.message || e).join('; ')
              : 'Unknown error');
          console.error(chalk.red(`  ✖ ${error.tool || 'Unknown'}: ${errorText}`));
        }
        process.exit(1);
      } else {
        spinner.succeed(`Propagated to ${results.propagated.length} tools`);

        console.log(chalk.bold('\nPropagated to:'));
        for (const tool of results.propagated) {
          console.log(chalk.green(`  ✓ ${tool.displayName}`));
        }
      }
    } catch (error) {
      spinner.fail('Propagation failed');
      console.error(chalk.red('\n✖ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('sync:resolve')
  .description('Resolve conflicts between AI tool contexts')
  .option('-s, --strategy <strategy>', 'Strategy: source_wins, regenerate_all, newest, manual', 'regenerate_all')
  .option('-t, --tool <tool>', 'Preferred tool (for source_wins strategy)')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);
    const spinner = createSpinner();

    const validStrategies = Object.values(CONFLICT_STRATEGY);
    if (!validStrategies.includes(options.strategy)) {
      console.error(chalk.red(`\n✖ Error: Invalid strategy: ${options.strategy}`));
      console.error(chalk.gray(`  Valid options: ${validStrategies.join(', ')}`));
      process.exit(1);
    }

    try {
      spinner.start(`Resolving conflicts (${options.strategy})...`);

      const config = {
        projectName: path.basename(projectRoot),
        aiTools: getAdapterNames()
      };

      const result = await resolveConflict(
        projectRoot,
        config,
        options.strategy,
        options.tool
      );

      if (result.resolved) {
        spinner.succeed(result.message);
      } else {
        spinner.warn('Unable to resolve');
        console.log(chalk.yellow(`\n${result.message}`));

        if (result.status) {
          console.log(formatSyncStatus(result.status));
        }
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Resolution failed');
      console.error(chalk.red('\n✖ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('sync:history')
  .description('Show sync history')
  .option('-n, --limit <number>', 'Number of entries to show', '10')
  .option('-p, --path <dir>', 'Project directory (defaults to current)', '.')
  .action(async (options) => {
    console.log(banner);

    const projectRoot = path.resolve(options.path);

    try {
      const history = getSyncHistory(projectRoot, parseInt(options.limit, 10));

      console.log(chalk.bold('\nSync History:\n'));

      if (history.length === 0) {
        console.log(chalk.gray('  No sync history found\n'));
      } else {
        for (const entry of history.reverse()) {
          const date = new Date(entry.timestamp).toLocaleString();
          console.log(chalk.cyan(`  ${date}`));
          console.log(chalk.gray(`    Source: ${entry.source || entry.sourceTool}`));
          console.log(chalk.gray(`    Strategy: ${entry.strategy}`));
          console.log(chalk.gray(`    Propagated: ${entry.propagatedCount} tools`));

          if (entry.errorCount > 0) {
            console.log(chalk.red(`    Errors: ${entry.errorCount}`));
          }
          console.log('');
        }
      }
    } catch (error) {
      console.error(chalk.red('\n✖ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('hooks:install')
  .description('Install git hooks for automatic sync')
  .action(async () => {
    console.log(banner);

    try {
      const { installHooks } = require('../lib/install-hooks');
      installHooks();
    } catch (error) {
      console.error(chalk.red('\n✖ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
