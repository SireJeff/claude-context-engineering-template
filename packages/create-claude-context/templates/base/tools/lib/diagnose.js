/**
 * Claude Context Engineering - Diagnostics Module
 *
 * System health diagnostics and issue detection with optional auto-fix.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { findClaudeDir, loadJsonFile } = require('./config-loader');
const { logger } = require('./logger');
const { validate } = require('./validate');

/**
 * Diagnostic procedures for common issues
 */
const DIAGNOSTIC_PROCEDURES = {
  'corrupted-settings': {
    name: 'Corrupted Settings',
    detect: async (claudeDir) => {
      const settingsPath = path.join(claudeDir, 'settings.json');
      if (!fs.existsSync(settingsPath)) return false;

      try {
        JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        return false;
      } catch {
        return true;
      }
    },
    fix: async (claudeDir) => {
      const settingsPath = path.join(claudeDir, 'settings.json');
      const backupPath = settingsPath + '.corrupted';

      // Backup corrupted file
      fs.renameSync(settingsPath, backupPath);

      // Create default settings
      const defaults = require('./config-loader').configLoader.getDefaults();
      defaults.$schema = './schemas/settings.schema.json';
      defaults.version = '1.1.0';

      fs.writeFileSync(settingsPath, JSON.stringify(defaults, null, 2));

      return `Settings restored from defaults. Backup saved to ${backupPath}`;
    },
  },

  'incomplete-init': {
    name: 'Incomplete Initialization',
    detect: async (claudeDir) => {
      const progressPath = path.join(claudeDir, 'INIT_PROGRESS.json');
      if (!fs.existsSync(progressPath)) return false;

      const progress = loadJsonFile(progressPath);
      return progress.status !== 'COMPLETED';
    },
    fix: async (claudeDir) => {
      console.log(chalk.yellow('  To resume initialization, run:'));
      console.log(chalk.cyan('    npx claude-context init --resume'));
      return 'Manual action required';
    },
  },

  'missing-schemas': {
    name: 'Missing Schema Directory',
    detect: async (claudeDir) => {
      return !fs.existsSync(path.join(claudeDir, 'schemas'));
    },
    fix: async (claudeDir) => {
      const schemaDir = path.join(claudeDir, 'schemas');
      fs.mkdirSync(schemaDir, { recursive: true });
      return 'Created schemas directory';
    },
  },

  'missing-logs-dir': {
    name: 'Missing Logs Directory',
    detect: async (claudeDir) => {
      return !fs.existsSync(path.join(claudeDir, 'logs'));
    },
    fix: async (claudeDir) => {
      fs.mkdirSync(path.join(claudeDir, 'logs'), { recursive: true });
      return 'Created logs directory';
    },
  },

  'orphaned-workflows': {
    name: 'Orphaned Workflow Files',
    detect: async (claudeDir) => {
      const indexPath = path.join(claudeDir, 'context', 'WORKFLOW_INDEX.md');
      const workflowDir = path.join(claudeDir, 'context', 'workflows');

      if (!fs.existsSync(indexPath) || !fs.existsSync(workflowDir)) {
        return false;
      }

      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const workflowFiles = fs.readdirSync(workflowDir).filter(f => f.endsWith('.md'));

      for (const wf of workflowFiles) {
        const baseName = wf.replace('.md', '');
        if (!indexContent.includes(baseName)) {
          return true;
        }
      }

      return false;
    },
    fix: async (claudeDir) => {
      return 'Orphaned workflows detected. Update WORKFLOW_INDEX.md to include all workflows.';
    },
  },
};

/**
 * Run diagnostics
 */
async function diagnose(options = {}) {
  const { fix = false, verbose = false } = options;
  const op = logger.startOperation('diagnose');

  const claudeDir = findClaudeDir();

  console.log(chalk.cyan('\n🔬 Running Diagnostics...\n'));

  const results = {
    timestamp: new Date().toISOString(),
    issues: [],
    fixed: [],
    suggestions: [],
  };

  // Run all diagnostic procedures
  for (const [key, procedure] of Object.entries(DIAGNOSTIC_PROCEDURES)) {
    if (verbose) {
      console.log(chalk.gray(`  Checking: ${procedure.name}...`));
    }

    try {
      const detected = await procedure.detect(claudeDir);

      if (detected) {
        console.log(chalk.yellow(`  ⚠️  Issue detected: ${procedure.name}`));

        results.issues.push({
          key,
          name: procedure.name,
          fixable: !!procedure.fix,
        });

        if (fix && procedure.fix) {
          console.log(chalk.cyan(`     Attempting fix...`));
          const fixResult = await procedure.fix(claudeDir);
          console.log(chalk.green(`     ✓ ${fixResult}`));
          results.fixed.push({ key, result: fixResult });
        } else if (procedure.fix) {
          console.log(chalk.gray(`     Run with --fix to attempt auto-repair`));
        }
      } else if (verbose) {
        console.log(chalk.green(`  ✓ ${procedure.name}: OK`));
      }
    } catch (error) {
      console.log(chalk.red(`  ✗ Error checking ${procedure.name}: ${error.message}`));
      results.issues.push({
        key,
        name: procedure.name,
        error: error.message,
      });
    }
  }

  // Run validation as part of diagnostics
  console.log(chalk.white('\nRunning validation checks...'));
  const validation = await validate({ all: true, claudeDir });

  if (validation.summary.failed > 0) {
    results.suggestions.push('Run validation to see detailed issues: npx claude-context validate');
  }

  // Summary
  console.log(chalk.white('\n📋 Diagnostic Summary'));
  console.log(chalk.gray('─'.repeat(50)));

  if (results.issues.length === 0) {
    console.log(chalk.green('  ✓ No issues detected'));
  } else {
    console.log(chalk.yellow(`  Issues found: ${results.issues.length}`));
    if (results.fixed.length > 0) {
      console.log(chalk.green(`  Issues fixed: ${results.fixed.length}`));
    }
  }

  if (results.suggestions.length > 0) {
    console.log(chalk.white('\n💡 Suggestions:'));
    results.suggestions.forEach(s => console.log(chalk.gray(`  - ${s}`)));
  }

  op.success();
  return results;
}

module.exports = {
  diagnose,
  DIAGNOSTIC_PROCEDURES,
};
