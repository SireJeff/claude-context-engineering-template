/**
 * Diagnostics module for Claude Context Engineering
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const chalk = require('chalk');

/**
 * Run diagnostics on context engineering setup
 */
async function diagnose(projectRoot, options = {}) {
  const claudeDir = path.join(projectRoot, '.claude');
  const results = {
    success: true,
    checks: [],
    issues: [],
    fixed: 0
  };

  console.log(chalk.blue('\n🩺 Running diagnostics...\n'));

  // Check 1: Directory structure
  const structureCheck = checkStructure(claudeDir);
  results.checks.push(structureCheck);
  results.issues.push(...structureCheck.issues);

  // Check 2: CLAUDE.md exists and is valid
  const claudeMdCheck = checkClaudeMd(projectRoot);
  results.checks.push(claudeMdCheck);
  results.issues.push(...claudeMdCheck.issues);

  // Check 3: Settings.json is valid
  const settingsCheck = checkSettings(claudeDir);
  results.checks.push(settingsCheck);
  results.issues.push(...settingsCheck.issues);

  // Check 4: Agent files are valid
  const agentCheck = await checkAgents(claudeDir);
  results.checks.push(agentCheck);
  results.issues.push(...agentCheck.issues);

  // Check 5: Command files are valid
  const commandCheck = await checkCommands(claudeDir);
  results.checks.push(commandCheck);
  results.issues.push(...commandCheck.issues);

  // Check 6: Workflow files exist
  const workflowCheck = await checkWorkflows(claudeDir);
  results.checks.push(workflowCheck);
  results.issues.push(...workflowCheck.issues);

  // Fix issues if requested
  if (options.fix && results.issues.length > 0) {
    results.fixed = await fixIssues(claudeDir, projectRoot, results.issues);
  }

  // Determine success
  const criticalIssues = results.issues.filter(i => i.severity === 'error');
  results.success = criticalIssues.length === 0;

  // Print summary
  printDiagnosticsSummary(results, options);

  return results;
}

/**
 * Check directory structure
 */
function checkStructure(claudeDir) {
  const check = { name: 'Directory Structure', passed: true, issues: [] };

  const requiredDirs = ['agents', 'commands', 'context', 'indexes'];

  for (const dir of requiredDirs) {
    const dirPath = path.join(claudeDir, dir);
    if (!fs.existsSync(dirPath)) {
      check.passed = false;
      check.issues.push({
        type: 'missing_directory',
        path: dir,
        message: `Missing required directory: ${dir}`,
        severity: 'error',
        fix: () => fs.mkdirSync(dirPath, { recursive: true })
      });
    }
  }

  console.log(check.passed
    ? chalk.green('✓ Directory structure: OK')
    : chalk.red(`✗ Directory structure: ${check.issues.length} issues`));

  return check;
}

/**
 * Check CLAUDE.md
 */
function checkClaudeMd(projectRoot) {
  const check = { name: 'CLAUDE.md', passed: true, issues: [] };
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');

  if (!fs.existsSync(claudeMdPath)) {
    check.passed = false;
    check.issues.push({
      type: 'missing_file',
      path: 'CLAUDE.md',
      message: 'Missing CLAUDE.md at project root',
      severity: 'error'
    });
  } else {
    const content = fs.readFileSync(claudeMdPath, 'utf8');

    // Check for unreplaced placeholders
    const placeholders = content.match(/\{\{[A-Z_]+\}\}/g);
    if (placeholders && placeholders.length > 10) {
      check.passed = false;
      check.issues.push({
        type: 'too_many_placeholders',
        path: 'CLAUDE.md',
        message: `CLAUDE.md has ${placeholders.length} unreplaced placeholders`,
        severity: 'warning'
      });
    }

    // Check minimum content
    if (content.length < 500) {
      check.issues.push({
        type: 'minimal_content',
        path: 'CLAUDE.md',
        message: 'CLAUDE.md seems too short',
        severity: 'warning'
      });
    }
  }

  console.log(check.passed
    ? chalk.green('✓ CLAUDE.md: OK')
    : chalk.yellow(`⚠ CLAUDE.md: ${check.issues.length} issues`));

  return check;
}

/**
 * Check settings.json
 */
function checkSettings(claudeDir) {
  const check = { name: 'Settings', passed: true, issues: [] };
  const settingsPath = path.join(claudeDir, 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    check.issues.push({
      type: 'missing_file',
      path: 'settings.json',
      message: 'Missing settings.json',
      severity: 'warning'
    });
  } else {
    try {
      const content = fs.readFileSync(settingsPath, 'utf8');
      JSON.parse(content);
    } catch (e) {
      check.passed = false;
      check.issues.push({
        type: 'invalid_json',
        path: 'settings.json',
        message: `Invalid JSON: ${e.message}`,
        severity: 'error'
      });
    }
  }

  console.log(check.passed
    ? chalk.green('✓ Settings: OK')
    : chalk.red(`✗ Settings: ${check.issues.length} issues`));

  return check;
}

/**
 * Check agent files
 */
async function checkAgents(claudeDir) {
  const check = { name: 'Agents', passed: true, issues: [] };
  const agentDir = path.join(claudeDir, 'agents');

  if (!fs.existsSync(agentDir)) {
    check.issues.push({
      type: 'missing_directory',
      path: 'agents',
      message: 'No agents directory',
      severity: 'warning'
    });
    return check;
  }

  const agentFiles = await glob('*.md', { cwd: agentDir });

  if (agentFiles.length === 0) {
    check.issues.push({
      type: 'no_agents',
      path: 'agents',
      message: 'No agent files found',
      severity: 'warning'
    });
  }

  // Check each agent has required sections
  for (const file of agentFiles) {
    const content = fs.readFileSync(path.join(agentDir, file), 'utf8');

    if (!content.includes('## Role') && !content.includes('## Purpose')) {
      check.issues.push({
        type: 'missing_section',
        path: `agents/${file}`,
        message: `Agent ${file} missing Role/Purpose section`,
        severity: 'warning'
      });
    }
  }

  console.log(check.issues.length === 0
    ? chalk.green(`✓ Agents: ${agentFiles.length} found`)
    : chalk.yellow(`⚠ Agents: ${check.issues.length} issues`));

  return check;
}

/**
 * Check command files
 */
async function checkCommands(claudeDir) {
  const check = { name: 'Commands', passed: true, issues: [] };
  const commandDir = path.join(claudeDir, 'commands');

  if (!fs.existsSync(commandDir)) {
    check.issues.push({
      type: 'missing_directory',
      path: 'commands',
      message: 'No commands directory',
      severity: 'warning'
    });
    return check;
  }

  const commandFiles = await glob('*.md', { cwd: commandDir });

  if (commandFiles.length === 0) {
    check.issues.push({
      type: 'no_commands',
      path: 'commands',
      message: 'No command files found',
      severity: 'warning'
    });
  }

  console.log(check.issues.length === 0
    ? chalk.green(`✓ Commands: ${commandFiles.length} found`)
    : chalk.yellow(`⚠ Commands: ${check.issues.length} issues`));

  return check;
}

/**
 * Check workflow files
 */
async function checkWorkflows(claudeDir) {
  const check = { name: 'Workflows', passed: true, issues: [] };
  const workflowDir = path.join(claudeDir, 'context', 'workflows');

  if (!fs.existsSync(workflowDir)) {
    check.issues.push({
      type: 'missing_directory',
      path: 'context/workflows',
      message: 'No workflows directory',
      severity: 'info'
    });
    console.log(chalk.gray('- Workflows: Not configured (run @context-engineer to create)'));
    return check;
  }

  const workflowFiles = await glob('*.md', { cwd: workflowDir });

  console.log(workflowFiles.length > 0
    ? chalk.green(`✓ Workflows: ${workflowFiles.length} found`)
    : chalk.gray('- Workflows: None yet'));

  return check;
}

/**
 * Fix detected issues
 */
async function fixIssues(claudeDir, projectRoot, issues) {
  let fixed = 0;

  for (const issue of issues) {
    if (issue.fix && typeof issue.fix === 'function') {
      try {
        issue.fix();
        fixed++;
        console.log(chalk.green(`  ✓ Fixed: ${issue.message}`));
      } catch (e) {
        console.log(chalk.red(`  ✗ Failed to fix: ${issue.message}`));
      }
    }
  }

  return fixed;
}

/**
 * Print diagnostics summary
 */
function printDiagnosticsSummary(results, options) {
  const errors = results.issues.filter(i => i.severity === 'error').length;
  const warnings = results.issues.filter(i => i.severity === 'warning').length;

  console.log('\n' + chalk.bold('Diagnostics Summary:'));
  console.log(`  Checks run: ${results.checks.length}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Warnings: ${warnings}`);

  if (options.fix) {
    console.log(`  Fixed: ${results.fixed}`);
  }

  if (results.success) {
    console.log(chalk.green('\n✓ System healthy!\n'));
  } else {
    console.log(chalk.red('\n✗ Issues detected. Run with --fix to auto-repair.\n'));
  }
}

module.exports = { diagnose };
