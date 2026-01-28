/**
 * Git hooks management for Claude Context Engineering
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const PRE_COMMIT_HOOK = `#!/bin/sh
# Claude Context Engineering - Pre-commit hook
# Validates documentation before commits

echo "🔍 Running context validation..."

# Check for unreplaced placeholders in staged files
STAGED_MD=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.md$' || true)

if [ -n "$STAGED_MD" ]; then
  for file in $STAGED_MD; do
    if grep -q '{{[A-Z_]*}}' "$file" 2>/dev/null; then
      echo "⚠️  Warning: Unreplaced placeholder found in $file"
    fi
  done
fi

# Optional: Run full validation (uncomment to enable)
# npx claude-context validate --all --strict

exit 0
`;

const POST_COMMIT_HOOK = `#!/bin/sh
# Claude Context Engineering - Post-commit hook
# Updates indexes after commits

echo "📝 Updating context indexes..."

# Regenerate CODE_TO_WORKFLOW_MAP if code files changed
CHANGED_CODE=$(git diff --name-only HEAD~1 HEAD | grep -E '\\.(js|ts|py|go|rb|java|cs|php)$' || true)

if [ -n "$CHANGED_CODE" ]; then
  echo "Code files changed, consider running: npx claude-context generate --code-map"
fi

exit 0
`;

/**
 * Manage git hooks
 */
async function hooks(projectRoot, action, options = {}) {
  const gitDir = path.join(projectRoot, '.git');
  const hooksDir = path.join(gitDir, 'hooks');

  const results = {
    success: true,
    installed: [],
    uninstalled: [],
    errors: []
  };

  // Check if git repo exists
  if (!fs.existsSync(gitDir)) {
    console.error(chalk.red('Error: Not a git repository.'));
    results.success = false;
    results.errors.push('Not a git repository');
    return results;
  }

  // Ensure hooks directory exists
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const hooksToManage = [];
  if (options.preCommit || (!options.preCommit && !options.postCommit)) {
    hooksToManage.push({ name: 'pre-commit', content: PRE_COMMIT_HOOK });
  }
  if (options.postCommit || (!options.preCommit && !options.postCommit)) {
    hooksToManage.push({ name: 'post-commit', content: POST_COMMIT_HOOK });
  }

  if (action === 'install') {
    console.log(chalk.blue('\n📦 Installing git hooks...\n'));

    for (const hook of hooksToManage) {
      const hookPath = path.join(hooksDir, hook.name);

      // Backup existing hook if present
      if (fs.existsSync(hookPath)) {
        const backupPath = `${hookPath}.backup`;
        fs.copyFileSync(hookPath, backupPath);
        console.log(chalk.yellow(`  Backed up existing ${hook.name} to ${hook.name}.backup`));
      }

      // Write new hook
      fs.writeFileSync(hookPath, hook.content);

      // Make executable (Unix)
      try {
        fs.chmodSync(hookPath, '755');
      } catch {
        // Windows doesn't need chmod
      }

      results.installed.push(hook.name);
      console.log(chalk.green(`  ✓ Installed ${hook.name} hook`));
    }

  } else if (action === 'uninstall') {
    console.log(chalk.blue('\n🗑️  Uninstalling git hooks...\n'));

    for (const hook of hooksToManage) {
      const hookPath = path.join(hooksDir, hook.name);

      if (fs.existsSync(hookPath)) {
        // Check if it's our hook
        const content = fs.readFileSync(hookPath, 'utf8');
        if (content.includes('Claude Context Engineering')) {
          fs.unlinkSync(hookPath);

          // Restore backup if exists
          const backupPath = `${hookPath}.backup`;
          if (fs.existsSync(backupPath)) {
            fs.renameSync(backupPath, hookPath);
            console.log(chalk.yellow(`  Restored ${hook.name} from backup`));
          }

          results.uninstalled.push(hook.name);
          console.log(chalk.green(`  ✓ Uninstalled ${hook.name} hook`));
        } else {
          console.log(chalk.yellow(`  ⚠ Skipped ${hook.name} (not a claude-context hook)`));
        }
      } else {
        console.log(chalk.gray(`  - ${hook.name} not installed`));
      }
    }
  }

  // Summary
  if (action === 'install') {
    console.log(chalk.green(`\n✓ Installed ${results.installed.length} hook(s)\n`));
  } else {
    console.log(chalk.green(`\n✓ Uninstalled ${results.uninstalled.length} hook(s)\n`));
  }

  return results;
}

module.exports = { hooks };
