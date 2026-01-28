/**
 * Synchronization module for Claude Context Engineering
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const chalk = require('chalk');

/**
 * Synchronize documentation with code
 */
async function sync(projectRoot, options = {}) {
  const claudeDir = path.join(projectRoot, '.claude');
  const results = {
    success: true,
    driftDetected: false,
    filesChecked: 0,
    issuesFound: 0,
    issuesFixed: 0
  };

  console.log(chalk.blue('\n🔄 Checking documentation synchronization...\n'));

  // Check for drift
  if (options.check || options.fix || (!options.rebuildMap)) {
    const driftResult = await checkDrift(claudeDir, projectRoot, options);
    results.driftDetected = driftResult.hasDrift;
    results.filesChecked = driftResult.filesChecked;
    results.issuesFound = driftResult.issues.length;

    if (options.fix && driftResult.issues.length > 0) {
      const fixResult = await fixDrift(claudeDir, projectRoot, driftResult.issues);
      results.issuesFixed = fixResult.fixed;
    }

    if (options.strict && results.driftDetected) {
      results.success = false;
    }
  }

  // Rebuild CODE_TO_WORKFLOW_MAP
  if (options.rebuildMap) {
    await rebuildCodeMap(claudeDir, projectRoot);
    console.log(chalk.green('✓ CODE_TO_WORKFLOW_MAP.md regenerated'));
  }

  // Print summary
  printSyncSummary(results, options);

  return results;
}

/**
 * Check for documentation drift
 */
async function checkDrift(claudeDir, projectRoot, options) {
  const result = {
    hasDrift: false,
    filesChecked: 0,
    issues: []
  };

  // Load staleness tracking
  const stalenessPath = path.join(claudeDir, 'sync', 'staleness.json');
  let staleness = {};
  if (fs.existsSync(stalenessPath)) {
    try {
      staleness = JSON.parse(fs.readFileSync(stalenessPath, 'utf8'));
    } catch {
      // Start fresh
    }
  }

  // Check workflow files against code
  const workflowDir = path.join(claudeDir, 'context', 'workflows');
  if (fs.existsSync(workflowDir)) {
    const workflowFiles = await glob('*.md', { cwd: workflowDir });

    for (const file of workflowFiles) {
      result.filesChecked++;
      const content = fs.readFileSync(path.join(workflowDir, file), 'utf8');

      // Find file:line references
      const lineRefPattern = /`([^`]+):(\d+)`/g;
      let match;

      while ((match = lineRefPattern.exec(content)) !== null) {
        const filePath = match[1];
        const lineNum = parseInt(match[2], 10);
        const targetPath = path.join(projectRoot, filePath);

        if (fs.existsSync(targetPath)) {
          const lines = fs.readFileSync(targetPath, 'utf8').split('\n');

          if (lineNum > lines.length) {
            result.hasDrift = true;
            result.issues.push({
              docFile: file,
              codeFile: filePath,
              oldLine: lineNum,
              newLine: null,
              type: 'line_exceeded'
            });
          }
        } else {
          result.hasDrift = true;
          result.issues.push({
            docFile: file,
            codeFile: filePath,
            oldLine: lineNum,
            newLine: null,
            type: 'file_missing'
          });
        }
      }
    }
  }

  if (result.issues.length > 0) {
    console.log(chalk.yellow(`⚠ Found ${result.issues.length} drift issues:`));
    for (const issue of result.issues.slice(0, 5)) {
      if (issue.type === 'file_missing') {
        console.log(chalk.yellow(`  - ${issue.docFile}: File ${issue.codeFile} no longer exists`));
      } else {
        console.log(chalk.yellow(`  - ${issue.docFile}: Line ${issue.oldLine} in ${issue.codeFile} is out of range`));
      }
    }
    if (result.issues.length > 5) {
      console.log(chalk.yellow(`  ... and ${result.issues.length - 5} more`));
    }
  } else {
    console.log(chalk.green('✓ No drift detected'));
  }

  return result;
}

/**
 * Fix drift issues
 */
async function fixDrift(claudeDir, projectRoot, issues) {
  const result = { fixed: 0, failed: 0 };

  // Group issues by doc file
  const byDocFile = {};
  for (const issue of issues) {
    if (!byDocFile[issue.docFile]) {
      byDocFile[issue.docFile] = [];
    }
    byDocFile[issue.docFile].push(issue);
  }

  for (const [docFile, fileIssues] of Object.entries(byDocFile)) {
    const docPath = path.join(claudeDir, 'context', 'workflows', docFile);
    if (!fs.existsSync(docPath)) continue;

    let content = fs.readFileSync(docPath, 'utf8');
    let modified = false;

    for (const issue of fileIssues) {
      if (issue.type === 'file_missing') {
        // Comment out the reference
        const pattern = new RegExp(`\`${issue.codeFile}:${issue.oldLine}\``, 'g');
        const newContent = content.replace(pattern, `<!-- REMOVED: ${issue.codeFile}:${issue.oldLine} -->`);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          result.fixed++;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(docPath, content);
    }
  }

  console.log(chalk.green(`✓ Fixed ${result.fixed} issues`));

  return result;
}

/**
 * Rebuild CODE_TO_WORKFLOW_MAP.md
 */
async function rebuildCodeMap(claudeDir, projectRoot) {
  const mapPath = path.join(claudeDir, 'context', 'CODE_TO_WORKFLOW_MAP.md');
  const workflowDir = path.join(claudeDir, 'context', 'workflows');

  const codeToWorkflow = {};

  if (fs.existsSync(workflowDir)) {
    const workflowFiles = await glob('*.md', { cwd: workflowDir });

    for (const file of workflowFiles) {
      const content = fs.readFileSync(path.join(workflowDir, file), 'utf8');

      // Extract workflow name from first heading
      const nameMatch = content.match(/^#\s+(.+)$/m);
      const workflowName = nameMatch ? nameMatch[1] : file.replace('.md', '');

      // Find file references
      const fileRefPattern = /`([^`]+\.[a-z]+)(?::\d+)?`/g;
      let match;

      while ((match = fileRefPattern.exec(content)) !== null) {
        const filePath = match[1];
        if (!codeToWorkflow[filePath]) {
          codeToWorkflow[filePath] = [];
        }
        if (!codeToWorkflow[filePath].includes(workflowName)) {
          codeToWorkflow[filePath].push(workflowName);
        }
      }
    }
  }

  // Generate markdown
  let output = `# Code to Workflow Map

> Auto-generated by \`npx claude-context generate --code-map\`
> Last updated: ${new Date().toISOString().split('T')[0]}

This maps source files to their documenting workflows.

| File | Workflows |
|------|-----------|
`;

  const sortedFiles = Object.keys(codeToWorkflow).sort();
  for (const file of sortedFiles) {
    const workflows = codeToWorkflow[file].join(', ');
    output += `| \`${file}\` | ${workflows} |\n`;
  }

  if (sortedFiles.length === 0) {
    output += `| *No mappings yet* | - |\n`;
  }

  fs.writeFileSync(mapPath, output);
}

/**
 * Print sync summary
 */
function printSyncSummary(results, options) {
  console.log('\n' + chalk.bold('Sync Summary:'));
  console.log(`  Files checked: ${results.filesChecked}`);
  console.log(`  Issues found: ${results.issuesFound}`);

  if (options.fix) {
    console.log(`  Issues fixed: ${results.issuesFixed}`);
  }

  if (results.success) {
    console.log(chalk.green('\n✓ Sync check complete!\n'));
  } else {
    console.log(chalk.red('\n✗ Drift detected (strict mode).\n'));
  }
}

module.exports = { sync };
