/**
 * Validation module for Claude Context Engineering
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const chalk = require('chalk');

/**
 * Validate context engineering setup
 */
async function validate(projectRoot, options = {}) {
  const claudeDir = path.join(projectRoot, '.claude');
  const results = {
    success: true,
    checks: [],
    errors: [],
    warnings: []
  };

  console.log(chalk.blue('\n🔍 Validating context engineering setup...\n'));

  // Determine which checks to run
  const runAll = options.all || (!options.schema && !options.links && !options.placeholders && !options.structure && !options.lines);

  // Schema validation
  if (runAll || options.schema) {
    const schemaResult = await validateSchemas(claudeDir, options);
    results.checks.push(schemaResult);
    if (!schemaResult.passed) {
      results.errors.push(...schemaResult.errors);
      results.success = false;
    }
  }

  // Link validation
  if (runAll || options.links) {
    const linkResult = await validateLinks(claudeDir, projectRoot, options);
    results.checks.push(linkResult);
    if (!linkResult.passed) {
      results.errors.push(...linkResult.errors);
      results.success = false;
    }
  }

  // Placeholder validation
  if (runAll || options.placeholders) {
    const placeholderResult = await validatePlaceholders(claudeDir, options);
    results.checks.push(placeholderResult);
    if (!placeholderResult.passed) {
      results.warnings.push(...placeholderResult.errors);
      // Placeholders are warnings, not failures
    }
  }

  // Structure validation
  if (runAll || options.structure) {
    const structureResult = await validateStructure(claudeDir, options);
    results.checks.push(structureResult);
    if (!structureResult.passed) {
      results.errors.push(...structureResult.errors);
      results.success = false;
    }
  }

  // Line number validation
  if (runAll || options.lines) {
    const lineResult = await validateLineNumbers(claudeDir, projectRoot, options);
    results.checks.push(lineResult);
    if (!lineResult.passed) {
      results.warnings.push(...lineResult.errors);
    }
  }

  // Print summary
  printSummary(results);

  return results;
}

/**
 * Validate JSON schemas
 */
async function validateSchemas(claudeDir, options) {
  const result = { name: 'Schema Validation', passed: true, errors: [], count: 0 };

  const schemaDir = path.join(claudeDir, 'schemas');
  if (!fs.existsSync(schemaDir)) {
    result.errors.push('No schemas directory found');
    result.passed = false;
    return result;
  }

  const jsonFiles = await glob('**/*.json', { cwd: claudeDir, nodir: true });

  for (const file of jsonFiles) {
    try {
      const content = fs.readFileSync(path.join(claudeDir, file), 'utf8');
      JSON.parse(content);
      result.count++;
    } catch (e) {
      result.errors.push(`Invalid JSON in ${file}: ${e.message}`);
      result.passed = false;
    }
  }

  console.log(result.passed
    ? chalk.green(`✓ Schema validation: ${result.count} JSON files valid`)
    : chalk.red(`✗ Schema validation: ${result.errors.length} errors`));

  return result;
}

/**
 * Validate internal links
 */
async function validateLinks(claudeDir, projectRoot, options) {
  const result = { name: 'Link Validation', passed: true, errors: [], count: 0 };

  const mdFiles = await glob('**/*.md', { cwd: claudeDir, nodir: true });
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const file of mdFiles) {
    const content = fs.readFileSync(path.join(claudeDir, file), 'utf8');
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      const linkPath = match[2];

      // Skip external links and anchors
      if (linkPath.startsWith('http') || linkPath.startsWith('#') || linkPath.startsWith('mailto:')) {
        continue;
      }

      result.count++;

      // Resolve relative path
      const targetPath = path.resolve(path.dirname(path.join(claudeDir, file)), linkPath.split('#')[0]);

      if (!fs.existsSync(targetPath)) {
        result.errors.push(`Broken link in ${file}: ${linkPath}`);
        result.passed = false;
      }
    }
  }

  console.log(result.passed
    ? chalk.green(`✓ Link validation: ${result.count} links checked`)
    : chalk.red(`✗ Link validation: ${result.errors.length} broken links`));

  if (options.verbose && result.errors.length > 0) {
    result.errors.forEach(e => console.log(chalk.yellow(`  - ${e}`)));
  }

  return result;
}

/**
 * Validate placeholders are replaced
 */
async function validatePlaceholders(claudeDir, options) {
  const result = { name: 'Placeholder Validation', passed: true, errors: [], count: 0 };

  const mdFiles = await glob('**/*.md', { cwd: claudeDir, nodir: true });
  const placeholderPattern = /\{\{([A-Z_]+)\}\}/g;

  for (const file of mdFiles) {
    const content = fs.readFileSync(path.join(claudeDir, file), 'utf8');
    let match;

    while ((match = placeholderPattern.exec(content)) !== null) {
      result.errors.push(`Unreplaced placeholder in ${file}: ${match[0]}`);
      result.count++;
      result.passed = false;
    }
  }

  console.log(result.passed
    ? chalk.green(`✓ Placeholder validation: No unreplaced placeholders`)
    : chalk.yellow(`⚠ Placeholder validation: ${result.count} unreplaced placeholders`));

  return result;
}

/**
 * Validate directory structure
 */
async function validateStructure(claudeDir, options) {
  const result = { name: 'Structure Validation', passed: true, errors: [], count: 0 };

  const requiredDirs = [
    'agents',
    'commands',
    'context',
    'indexes'
  ];

  for (const dir of requiredDirs) {
    const dirPath = path.join(claudeDir, dir);
    if (fs.existsSync(dirPath)) {
      result.count++;
    } else {
      result.errors.push(`Missing required directory: ${dir}`);
      result.passed = false;
    }
  }

  // Check for CLAUDE.md at project root
  const claudeMdPath = path.join(path.dirname(claudeDir), 'CLAUDE.md');
  if (fs.existsSync(claudeMdPath)) {
    result.count++;
  } else {
    result.errors.push('Missing CLAUDE.md at project root');
    result.passed = false;
  }

  console.log(result.passed
    ? chalk.green(`✓ Structure validation: ${result.count} required items present`)
    : chalk.red(`✗ Structure validation: ${result.errors.length} missing items`));

  return result;
}

/**
 * Validate line number references
 */
async function validateLineNumbers(claudeDir, projectRoot, options) {
  const result = { name: 'Line Number Validation', passed: true, errors: [], count: 0, accurate: 0 };
  const threshold = parseInt(options.threshold || '60', 10);

  const mdFiles = await glob('**/*.md', { cwd: claudeDir, nodir: true });
  const lineRefPattern = /`([^`]+):(\d+)`|([a-zA-Z0-9_\-/.]+):(\d+)/g;

  for (const file of mdFiles) {
    const content = fs.readFileSync(path.join(claudeDir, file), 'utf8');
    let match;

    while ((match = lineRefPattern.exec(content)) !== null) {
      const filePath = match[1] || match[3];
      const lineNum = parseInt(match[2] || match[4], 10);

      // Skip if file path doesn't look like a source file
      if (!filePath || filePath.includes(' ') || !filePath.includes('.')) {
        continue;
      }

      result.count++;

      const targetPath = path.join(projectRoot, filePath);
      if (fs.existsSync(targetPath)) {
        try {
          const lines = fs.readFileSync(targetPath, 'utf8').split('\n');
          if (lineNum <= lines.length) {
            result.accurate++;
          } else {
            result.errors.push(`Line ${lineNum} exceeds file length in ${filePath} (${lines.length} lines)`);
          }
        } catch {
          // Skip unreadable files
        }
      }
    }
  }

  const accuracy = result.count > 0 ? Math.round((result.accurate / result.count) * 100) : 100;
  result.passed = accuracy >= threshold;

  console.log(result.passed
    ? chalk.green(`✓ Line number validation: ${accuracy}% accurate (threshold: ${threshold}%)`)
    : chalk.yellow(`⚠ Line number validation: ${accuracy}% accurate (below ${threshold}% threshold)`));

  return result;
}

/**
 * Print validation summary
 */
function printSummary(results) {
  console.log('\n' + chalk.bold('Summary:'));
  console.log(`  Checks run: ${results.checks.length}`);
  console.log(`  Errors: ${results.errors.length}`);
  console.log(`  Warnings: ${results.warnings.length}`);

  if (results.success) {
    console.log(chalk.green('\n✓ All validations passed!\n'));
  } else {
    console.log(chalk.red('\n✗ Some validations failed.\n'));
  }
}

module.exports = { validate };
