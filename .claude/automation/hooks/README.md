# Git Hooks for AI Context Sync

This directory contains git hooks that enable automatic cross-tool context synchronization.

## Available Hooks

### pre-commit
Checks if AI tool contexts are out of sync before allowing a commit.

- **What it does**: Runs `create-ai-context sync:check` before each commit
- **On failure**: Blocks commit and shows sync status
- **Skip it**: Use `git commit --no-verify`

### post-commit
Triggers automatic sync after successful commits.

- **What it does**: Runs `create-ai-context sync:all` in the background
- **Non-blocking**: Runs async, doesn't interfere with commit

## Installation

### Automatic Installation
```bash
node .claude/automation/hooks/install.js
```

### Manual Installation
```bash
# Copy hooks to .git/hooks/
cp .claude/automation/hooks/pre-commit.hbs .git/hooks/pre-commit
cp .claude/automation/hooks/post-commit.hbs .git/hooks/post-commit

# Make executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit
```

## Workflow

### Normal Commit
```bash
git add .
git commit -m "my changes"
# 1. Pre-commit hook checks sync status
# 2. If in sync, commit proceeds
# 3. Post-commit hook triggers background sync
```

### When Contexts Are Out of Sync
```bash
git commit -m "my changes"
# Pre-commit hook blocks commit:
#
#   AI contexts are out of sync!
#
#   Claude Code context has changed
#   Copilot context is stale
#
# To sync all contexts, run:
#   create-ai-context sync:all
#
# To skip this check, use: git commit --no-verify

# Fix it:
create-ai-context sync:all

# Now commit works:
git commit -m "my changes"
```

### Skip Sync Check (Not Recommended)
```bash
git commit --no-verify -m "my changes"
```

## Configuration

You can configure hook behavior in `ai-context.config.json`:

```json
{
  "sync": {
    "autoSync": true,
    "strategy": "source_wins",
    "debounceDelay": 2000
  }
}
```

## Uninstalling

```bash
rm .git/hooks/pre-commit
rm .git/hooks/post-commit
```

## Troubleshooting

### Hook not running?
```bash
# Check file permissions
ls -la .git/hooks/pre-commit
# Should be: -rwxr-xr-x

# Fix if needed:
chmod +x .git/hooks/pre-commit
```

### Hook causing issues?
```bash
# Temporarily disable:
git commit --no-verify

# Or uninstall:
rm .git/hooks/pre-commit
```

### Debug hook output:
```bash
# Run hook manually:
./.git/hooks/pre-commit
```
