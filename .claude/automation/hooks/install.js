#!/usr/bin/env node
/**
 * Install Git Hooks for AI Context Sync
 *
 * Usage: node install-hooks.js
 */

const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname);
const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');

// Hooks to install
const hooks = [
  { source: 'pre-commit.hbs', target: 'pre-commit' },
  { source: 'post-commit.hbs', target: 'post-commit' }
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyHook(sourceFile, targetFile) {
  const sourcePath = path.join(hooksDir, sourceFile);
  const targetPath = path.join(gitHooksDir, targetFile);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`Warning: ${sourceFile} not found, skipping`);
    return false;
  }

  const content = fs.readFileSync(sourcePath, 'utf-8');

  fs.writeFileSync(targetPath, content, { mode: 0o755 });
  console.log(`✓ Installed ${targetFile}`);
  return true;
}

function main() {
  console.log('\nInstalling AI context sync git hooks...\n');

  // Check if we're in a git repository
  if (!fs.existsSync(gitHooksDir)) {
    console.error('Error: .git/hooks directory not found');
    console.error('Please run this command from the root of a git repository\n');
    process.exit(1);
  }

  // Ensure hooks directory exists
  ensureDirectory(gitHooksDir);

  // Copy hooks
  let installed = 0;
  for (const hook of hooks) {
    if (copyHook(hook.source, hook.target)) {
      installed++;
    }
  }

  console.log(`\nSuccessfully installed ${installed} git hooks\n`);
  console.log('The hooks will:');
  console.log('  • Check sync status before commits (pre-commit)');
  console.log('  • Auto-sync after successful commits (post-commit)\n');
  console.log('To skip sync checks, use: git commit --no-verify\n');
}

main();
