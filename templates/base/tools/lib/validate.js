/**
 * Claude Context Engineering - Validation Module
 *
 * Comprehensive validation of the context engineering setup:
 * - Schema validation for JSON files
 * - Markdown link validation
 * - Placeholder detection
 * - Line number accuracy checking
 * - Structure validation
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { glob } = require('glob');
const { configLoader, findClaudeDir, loadJsonFile } = require('./config-loader');
const { logger } = require('./logger');
const { ValidationError } = require('./errors');

/**
 * Main validation function
 */
async function validate(options = {}) {
  const {
    all = false,
    links = false,
    lines = false,
    placeholders = false,
    schema = false,
    structure = false,
    threshold = 60,
    output = 'console',
    file = null,
  } = options;

  const op = logger.startOperation('validate');
  const claudeDir = options.claudeDir || findClaudeDir();
  const projectRoot = path.dirname(claudeDir);

  const results = {
    timestamp: new Date().toISOString(),
    claudeDir,
    checks: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
  };

  try {
    console.log(chalk.cyan('\n🔍 Running Validation Suite...\n'));

    // Schema validation
    if (all || schema) {
      console.log(chalk.white('Schema Validation'));
      console.log(chalk.gray('─'.repeat(50)));
      results.checks.schema = await validateSchemas(claudeDir);
      printCheckResult(results.checks.schema);
    }

    // Link validation
    if (all || links) {
      console.log(chalk.white('\nLink Validation'));
      console.log(chalk.gray('─'.repeat(50)));
      results.checks.links = await validateLinks(claudeDir, projectRoot);
      printCheckResult(results.checks.links);
    }

    // Placeholder detection
    if (all || placeholders) {
      console.log(chalk.white('\nPlaceholder Detection'));
      console.log(chalk.gray('─'.repeat(50)));
      results.checks.placeholders = await detectPlaceholders(claudeDir, projectRoot);
      printCheckResult(results.checks.placeholders);
    }

    // Line number accuracy
    if (all || lines) {
      console.log(chalk.white('\nLine Number Accuracy'));
      console.log(chalk.gray('─'.repeat(50)));
      results.checks.lineNumbers = await validateLineNumbers(claudeDir, projectRoot, parseInt(threshold));
      printCheckResult(results.checks.lineNumbers);
    }

    // Structure validation
    if (all || structure) {
      console.log(chalk.white('\nStructure Validation'));
      console.log(chalk.gray('─'.repeat(50)));
      results.checks.structure = await validateStructure(claudeDir);
      printCheckResult(results.checks.structure);
    }

    // Calculate summary
    for (const check of Object.values(results.checks)) {
      results.summary.total++;
      if (check.status === 'PASS') results.summary.passed++;
      else if (check.status === 'FAIL') results.summary.failed++;
      else if (check.status === 'WARN') results.summary.warnings++;
    }

    // Print summary
    printSummary(results.summary);

    // Output results
    if (output === 'json') {
      console.log(JSON.stringify(results, null, 2));
    } else if (output === 'markdown') {
      console.log(formatMarkdown(results));
    }

    op.success();
    return results;

  } catch (error) {
    op.fail(error);
    throw error;
  }
}

/**
 * Validate JSON files against their schemas
 */
async function validateSchemas(claudeDir) {
  const result = {
    name: 'Schema Validation',
    status: 'PASS',
    checked: 0,
    passed: 0,
    failed: 0,
    issues: [],
  };

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  // Load all schemas
  const schemaDir = path.join(claudeDir, 'schemas');
  if (!fs.existsSync(schemaDir)) {
    result.status = 'WARN';
    result.issues.push({ file: schemaDir, message: 'Schemas directory not found' });
    return result;
  }

  // Validate settings.json
  const settingsPath = path.join(claudeDir, 'settings.json');
  const settingsSchemaPath = path.join(schemaDir, 'settings.schema.json');

  if (fs.existsSync(settingsPath) && fs.existsSync(settingsSchemaPath)) {
    result.checked++;
    try {
      const settings = loadJsonFile(settingsPath);
      const schema = loadJsonFile(settingsSchemaPath);
      const validate = ajv.compile(schema);

      if (validate(settings)) {
        result.passed++;
        console.log(chalk.green('  ✓ settings.json'));
      } else {
        result.failed++;
        result.status = 'FAIL';
        const errors = validate.errors.map(e => `${e.instancePath} ${e.message}`);
        result.issues.push({ file: 'settings.json', errors });
        console.log(chalk.red('  ✗ settings.json'));
        errors.forEach(e => console.log(chalk.gray(`    - ${e}`)));
      }
    } catch (error) {
      result.failed++;
      result.status = 'FAIL';
      result.issues.push({ file: 'settings.json', message: error.message });
      console.log(chalk.red(`  ✗ settings.json: ${error.message}`));
    }
  }

  return result;
}

/**
 * Validate markdown links
 */
async function validateLinks(claudeDir, projectRoot) {
  const result = {
    name: 'Link Validation',
    status: 'PASS',
    checked: 0,
    valid: 0,
    broken: 0,
    issues: [],
  };

  // Find all markdown files
  const mdFiles = await glob('**/*.md', {
    cwd: claudeDir,
    ignore: ['node_modules/**'],
  });

  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const mdFile of mdFiles) {
    const filePath = path.join(claudeDir, mdFile);
    const content = fs.readFileSync(filePath, 'utf8');
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      const [, text, link] = match;

      // Skip external links and anchors
      if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) {
        continue;
      }

      result.checked++;

      // Resolve the link path
      const linkPath = path.resolve(path.dirname(filePath), link.split('#')[0]);

      if (fs.existsSync(linkPath)) {
        result.valid++;
      } else {
        result.broken++;
        result.issues.push({
          file: mdFile,
          link,
          text,
        });
        console.log(chalk.red(`  ✗ ${mdFile}: broken link "${link}"`));
      }
    }
  }

  if (result.broken > 0) {
    result.status = 'FAIL';
  }

  console.log(chalk.gray(`  Checked ${result.checked} links, ${result.valid} valid, ${result.broken} broken`));

  return result;
}

/**
 * Detect remaining placeholders
 */
async function detectPlaceholders(claudeDir, projectRoot) {
  const result = {
    name: 'Placeholder Detection',
    status: 'PASS',
    checked: 0,
    found: 0,
    issues: [],
  };

  const placeholderPattern = /\{\{([A-Z_]+)\}\}/g;

  // Check AI_CONTEXT.md in project root
  const claudeMdPath = path.join(projectRoot, 'AI_CONTEXT.md');
  if (fs.existsSync(claudeMdPath)) {
    const content = fs.readFileSync(claudeMdPath, 'utf8');
    let match;

    while ((match = placeholderPattern.exec(content)) !== null) {
      result.found++;
      result.issues.push({
        file: 'AI_CONTEXT.md',
        placeholder: match[0],
        name: match[1],
      });
    }
    result.checked++;
  }

  // Check files in .claude directory
  const mdFiles = await glob('**/*.md', {
    cwd: claudeDir,
    ignore: ['node_modules/**'],
  });

  for (const mdFile of mdFiles) {
    const filePath = path.join(claudeDir, mdFile);
    const content = fs.readFileSync(filePath, 'utf8');
    let match;

    while ((match = placeholderPattern.exec(content)) !== null) {
      result.found++;
      result.issues.push({
        file: `.ai-context/${mdFile}`,
        placeholder: match[0],
        name: match[1],
      });
    }
    result.checked++;
  }

  if (result.found > 0) {
    result.status = 'WARN';
    console.log(chalk.yellow(`  ⚠️  Found ${result.found} unresolved placeholders:`));
    result.issues.forEach(issue => {
      console.log(chalk.gray(`    - ${issue.file}: ${issue.placeholder}`));
    });
  } else {
    console.log(chalk.green('  ✓ No unresolved placeholders'));
  }

  return result;
}

/**
 * Validate line number references
 */
async function validateLineNumbers(claudeDir, projectRoot, threshold) {
  const result = {
    name: 'Line Number Accuracy',
    status: 'PASS',
    checked: 0,
    valid: 0,
    invalid: 0,
    accuracy: 0,
    issues: [],
  };

  const lineRefPattern = /\[Line[s]?\s*(\d+)(?:-(\d+))?\]/gi;
  const fileLinePattern = /([^\s:]+):(\d+)/g;

  // Sample workflow files
  const workflowDir = path.join(claudeDir, 'context', 'workflows');
  if (!fs.existsSync(workflowDir)) {
    result.status = 'WARN';
    result.issues.push({ message: 'No workflow files found to validate' });
    console.log(chalk.yellow('  ⚠️  No workflow files found'));
    return result;
  }

  const workflowFiles = await glob('*.md', { cwd: workflowDir });

  // Sample up to 5 random references
  const samples = [];

  for (const wfFile of workflowFiles.slice(0, 3)) {
    const content = fs.readFileSync(path.join(workflowDir, wfFile), 'utf8');
    let match;

    while ((match = fileLinePattern.exec(content)) !== null) {
      const [, filePath, lineNum] = match;
      // Skip if it looks like a URL or example
      if (filePath.includes('http') || filePath.includes('example')) continue;

      samples.push({
        workflow: wfFile,
        file: filePath,
        line: parseInt(lineNum),
      });
    }
  }

  // Check samples (max 10)
  for (const sample of samples.slice(0, 10)) {
    result.checked++;

    const fullPath = path.join(projectRoot, sample.file);
    if (!fs.existsSync(fullPath)) {
      result.invalid++;
      result.issues.push({
        workflow: sample.workflow,
        file: sample.file,
        line: sample.line,
        error: 'File not found',
      });
      continue;
    }

    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    if (sample.line <= lines.length) {
      result.valid++;
    } else {
      result.invalid++;
      result.issues.push({
        workflow: sample.workflow,
        file: sample.file,
        line: sample.line,
        error: `Line ${sample.line} exceeds file length (${lines.length})`,
      });
    }
  }

  // Calculate accuracy
  result.accuracy = result.checked > 0 ? Math.round((result.valid / result.checked) * 100) : 100;

  if (result.accuracy < threshold) {
    result.status = 'FAIL';
    console.log(chalk.red(`  ✗ Accuracy: ${result.accuracy}% (threshold: ${threshold}%)`));
  } else {
    console.log(chalk.green(`  ✓ Accuracy: ${result.accuracy}% (threshold: ${threshold}%)`));
  }

  console.log(chalk.gray(`  Checked ${result.checked} references`));

  return result;
}

/**
 * Validate directory structure
 */
async function validateStructure(claudeDir) {
  const result = {
    name: 'Structure Validation',
    status: 'PASS',
    required: 0,
    found: 0,
    missing: [],
  };

  const requiredPaths = [
    'settings.json',
    'README.md',
    'agents',
    'commands',
    'context',
    'indexes',
  ];

  const recommendedPaths = [
    'research',
    'plans',
    'schemas',
  ];

  for (const reqPath of requiredPaths) {
    result.required++;
    const fullPath = path.join(claudeDir, reqPath);

    if (fs.existsSync(fullPath)) {
      result.found++;
      console.log(chalk.green(`  ✓ ${reqPath}`));
    } else {
      result.missing.push(reqPath);
      console.log(chalk.red(`  ✗ ${reqPath} (required)`));
    }
  }

  for (const recPath of recommendedPaths) {
    const fullPath = path.join(claudeDir, recPath);

    if (fs.existsSync(fullPath)) {
      console.log(chalk.green(`  ✓ ${recPath}`));
    } else {
      console.log(chalk.yellow(`  ⚠️ ${recPath} (recommended)`));
    }
  }

  if (result.missing.length > 0) {
    result.status = 'FAIL';
  }

  return result;
}

/**
 * Print check result
 */
function printCheckResult(check) {
  const statusIcon = check.status === 'PASS' ? chalk.green('✓') :
                     check.status === 'WARN' ? chalk.yellow('⚠️') :
                     chalk.red('✗');
  // Status already printed by individual checks
}

/**
 * Print summary
 */
function printSummary(summary) {
  console.log(chalk.white('\n📊 Validation Summary'));
  console.log(chalk.gray('─'.repeat(50)));

  const statusColor = summary.failed > 0 ? chalk.red :
                      summary.warnings > 0 ? chalk.yellow :
                      chalk.green;

  console.log(`  Total checks: ${summary.total}`);
  console.log(chalk.green(`  Passed: ${summary.passed}`));
  if (summary.warnings > 0) console.log(chalk.yellow(`  Warnings: ${summary.warnings}`));
  if (summary.failed > 0) console.log(chalk.red(`  Failed: ${summary.failed}`));

  const overallStatus = summary.failed > 0 ? 'FAIL' :
                        summary.warnings > 0 ? 'WARN' : 'PASS';

  console.log(statusColor(`\n  Overall: ${overallStatus}`));
}

/**
 * Format results as markdown
 */
function formatMarkdown(results) {
  let md = `# Validation Report\n\n`;
  md += `**Date:** ${results.timestamp}\n\n`;

  for (const [name, check] of Object.entries(results.checks)) {
    md += `## ${check.name}\n\n`;
    md += `**Status:** ${check.status}\n\n`;

    if (check.issues && check.issues.length > 0) {
      md += `### Issues\n\n`;
      for (const issue of check.issues) {
        md += `- ${JSON.stringify(issue)}\n`;
      }
      md += '\n';
    }
  }

  return md;
}

module.exports = {
  validate,
  validateSchemas,
  validateLinks,
  detectPlaceholders,
  validateLineNumbers,
  validateStructure,
};
