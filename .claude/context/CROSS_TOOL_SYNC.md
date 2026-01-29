# Cross-Tool Context Synchronization

## Overview

The cross-tool synchronization feature automatically keeps AI tool contexts in sync. When a user updates context for one tool (e.g., modifies `AI_CONTEXT.md` while using Claude Code), the system can automatically propagate those changes to all other tools.

## Problem Statement

Previously, each AI tool's context was generated independently:

1. User runs `npx create-universal-ai-context generate --ai all`
2. All tools get fresh contexts from codebase analysis
3. User works with Claude Code and manually edits `AI_CONTEXT.md`
4. **Problem:** Copilot, Cline, and Antigravity contexts remain stale
5. User must remember to re-run the generation command

## Solution

Automatic cross-tool synchronization with multiple modes:

### 1. Manual Sync Commands
CLI commands for on-demand synchronization

### 2. Git Hooks
Automatic sync triggered by git commits

### 3. Background Service (Optional)
Continuous monitoring and sync of context files

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cross-Tool Sync System                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │ File        │────▶│ Sync         │────▶│ Adapter     │ │
│  │ Watcher     │     │ Manager      │     │ Registry    │ │
│  └─────────────┘     └──────────────┘     └─────────────┘ │
│         │                   │                    │         │
│         v                   v                    v         │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐│
│  │ Change      │     │ Conflict     │     │ Context     ││
│  │ Detection   │     │ Resolution   │     │ Generation  ││
│  └─────────────┘     └──────────────┘     └─────────────┘│
│                                                     │        │
└─────────────────────────────────────────────────────┼────────┘
                                                      │
                                                      v
                                       ┌──────────────────────────┐
                                       │  AI Tool Contexts        │
                                       ├──────────────────────────┤
                                       │ • AI_CONTEXT.md          │
                                       │ • .github/copilot-...md  │
                                       │ • .clinerules            │
                                       │ • .agent/                │
                                       └──────────────────────────┘
```

---

## Core Components

### Sync Manager (`lib/cross-tool-sync/sync-manager.js`)

**Responsibilities:**
- Calculate file hashes for change detection
- Detect which tool's context has changed
- Propagate changes from source tool to all others
- Resolve conflicts between tools
- Maintain sync state and history

**Key Functions:**
- `checkSyncStatus(projectRoot)` - Check if contexts are in sync
- `propagateContextChange(sourceTool, projectRoot, config, strategy)` - Sync from one tool to others
- `syncAllFromCodebase(projectRoot, config)` - Regenerate all from codebase
- `resolveConflict(projectRoot, config, strategy, preferredTool)` - Handle conflicts

### File Watcher (`lib/cross-tool-sync/file-watcher.js`)

**Responsibilities:**
- Monitor AI tool context files for changes
- Detect file modifications via polling (no chokidar dependency)
- Emit events on file changes

**Key Features:**
- Pure Node.js implementation (no external dependencies)
- Configurable poll interval
- Directory hashing for multi-file contexts

### Sync Service (`lib/cross-tool-sync/sync-service.js`)

**Responsibilities:**
- Background service for continuous monitoring
- Debounced sync to avoid excessive regenerations
- Configurable sync strategies

**Configuration:**
```javascript
{
  pollInterval: 1000,      // How often to check for changes (ms)
  debounceDelay: 2000,     // Wait before triggering sync (ms)
  strategy: 'source_wins', // Conflict resolution strategy
  enabled: true,           // Enable/disable auto-sync
  verbose: false           // Log verbosity
}
```

---

## Conflict Resolution Strategies

### Source Wins (`source_wins`)
The changed tool's context always wins. Other tools are regenerated from the source.

**Use case:** You trust the edited context more than the generated one.

### Regenerate All (`regenerate_all`)
Ignore all existing contexts and regenerate everything from the codebase.

**Use case:** You want a fresh start from the current code state.

### Newest (`newest`)
The tool with the most recently modified context wins.

**Use case:** You want the most recent work to be preserved.

### Manual (`manual`)
Don't auto-resolve. Require user intervention.

**Use case:** You need to review conflicts before resolving.

---

## CLI Commands

### Check Sync Status
```bash
npx create-ai-context sync:check
```

**Output:**
```
Cross-Tool Sync Status
==================================================

Overall: Out of Sync ⚠

Changed Tools:
  - claude

Tools:
  claude: ✓ ⚠
  copilot: ✓
  cline: ✗
  antigravity: ✗
```

### Sync All Tools
```bash
npx create-ai-context sync:all
```

Regenerates all tool contexts from the codebase.

### Sync From Specific Tool
```bash
npx create-ai-context sync:from claude --strategy source_wins
```

Propagates changes from Claude Code context to all other tools.

### Resolve Conflicts
```bash
npx create-ai-context sync:resolve --strategy regenerate_all
npx create-ai-context sync:resolve --strategy source_wins --tool claude
```

### View Sync History
```bash
npx create-ai-context sync:history --limit 20
```

Shows recent sync operations with timestamps and results.

---

## Git Hooks Integration

### Installation
```bash
npx create-ai-context hooks:install
```

This installs:
- `.git/hooks/pre-commit` - Checks sync status before commits
- `.git/hooks/post-commit` - Triggers background sync after commits

### How It Works

**Pre-commit Hook:**
1. Runs `create-ai-context sync:check`
2. If contexts are out of sync, blocks the commit
3. Shows which tools need syncing
4. User can sync with `create-ai-context sync:all`
5. Or skip with `git commit --no-verify`

**Post-commit Hook:**
1. Runs `create-ai-context sync:all` in background
2. Doesn't block the commit process
3. Ensures contexts stay synced after commits

### Workflow Example

```bash
# User edits AI_CONTEXT.md during a Claude Code session
vim AI_CONTEXT.md

# User tries to commit
git add .
git commit -m "Update project info"

# Pre-commit hook blocks commit:
#   AI contexts are out of sync!
#   Claude Code context has changed
#   Run: create-ai-context sync:all
#   Or skip: git commit --no-verify

# User syncs
create-ai-context sync:all

# Commit succeeds
git commit -m "Update project info"
# Post-commit hook triggers background sync for next time
```

---

## Sync State

The sync state is stored in `.ai-context/sync-state.json`:

```json
{
  "version": "1.0.0",
  "lastSync": "2024-01-29T10:30:00Z",
  "toolHashes": {
    "claude": "abc123...",
    "copilot": "def456...",
    "cline": "ghi789...",
    "antigravity": "jkl012..."
  },
  "conflicts": [],
  "syncHistory": [
    {
      "timestamp": "2024-01-29T10:30:00Z",
      "sourceTool": "claude",
      "strategy": "source_wins",
      "propagatedCount": 3,
      "errorCount": 0
    }
  ]
}
```

---

## Configuration

### Project Configuration (`ai-context.config.json`)

```json
{
  "sync": {
    "autoSync": true,
    "strategy": "source_wins",
    "debounceDelay": 2000,
    "pollInterval": 1000
  }
}
```

### Environment Variables

```bash
# Disable auto-sync
AI_CONTEXT_SYNC_ENABLED=false

# Set default conflict strategy
AI_CONTEXT_SYNC_STRATEGY=regenerate_all

# Adjust poll interval (ms)
AI_CONTEXT_SYNC_POLL_INTERVAL=5000
```

---

## Testing

The sync system has comprehensive tests:

```bash
npm test -- tests/unit/cross-tool-sync.test.js
```

**Test Coverage:**
- Sync state management
- File hash calculation
- Tool context file detection
- Change detection
- Sync status checking
- Conflict strategies

---

## Troubleshooting

### Sync Not Working

1. **Check if sync state exists:**
   ```bash
   ls .ai-context/sync-state.json
   ```

2. **Verify file permissions:**
   ```bash
   ls -la AI_CONTEXT.md
   ```

3. **Run sync check manually:**
   ```bash
   npx create-ai-context sync:check --json
   ```

### Git Hooks Not Running

1. **Verify hooks are executable:**
   ```bash
   ls -la .git/hooks/pre-commit
   # Should show: -rwxr-xr-x
   ```

2. **Fix permissions:**
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

3. **Reinstall hooks:**
   ```bash
   npx create-ai-context hooks:install
   ```

### Excessive Syncing

1. **Increase debounce delay:**
   ```json
   {
     "sync": {
       "debounceDelay": 5000
     }
   }
   ```

2. **Disable auto-sync and use manual commands:**
   ```json
   {
     "sync": {
       "enabled": false
     }
   }
   ```

---

## Implementation Details

### File Watching Without Chokidar

The file watcher uses polling instead of native file system events to avoid external dependencies:

```javascript
// Check for changes every second
setInterval(() => {
  for (const [key, watchInfo] of this.watchPaths.entries()) {
    const oldHash = this.fileStates.get(key);
    const newHash = this.calculateHash(watchInfo.path);

    if (oldHash !== newHash) {
      this.emit('changed', watchInfo);
    }
  }
}, pollInterval);
```

### Hash Calculation

For single files, SHA-256 hash of content:
```javascript
const hash = crypto.createHash('sha256')
  .update(fs.readFileSync(filePath, 'utf-8'))
  .digest('hex');
```

For directories (like `.claude/`), combined hash of all files:
```javascript
const hash = crypto.createHash('sha256');
for (const file of getAllFiles(dir).sort()) {
  hash.update(fs.readFileSync(file, 'utf-8'));
}
```

### Change Detection Flow

```
1. Calculate current hashes for all tools
2. Compare with stored hashes from last sync
3. Identify tools with changed hashes
4. If multiple tools changed, use conflict resolution
5. Propagate changes to other tools
6. Update stored hashes
7. Record sync in history
```

---

## Future Enhancements

### Planned Features

1. **Bi-directional Sync** - Merge changes from multiple tools intelligently
2. **Selective Sync** - Choose which tools to sync
3. **Conflict Preview** - Show conflicts before resolving
4. **Rollback** - Revert to previous sync state
5. **Remote Sync** - Sync across multiple machines/repositories

### Known Limitations

1. **No Real-Time Collaboration** - Doesn't sync between multiple users
2. **Conflict Resolution is Basic** - Advanced merging not yet supported
3. **Git Hooks Require Manual Install** - Not automatic on project setup
4. **Background Service is Manual** - Must be explicitly started

---

## Related Files

| File | Purpose |
|------|---------|
| `lib/cross-tool-sync/sync-manager.js` | Core sync logic |
| `lib/cross-tool-sync/file-watcher.js` | Change detection |
| `lib/cross-tool-sync/sync-service.js` | Background service |
| `lib/cross-tool-sync/index.js` | Module exports |
| `bin/create-ai-context.js` | CLI commands (sync:*) |
| `.claude/automation/hooks/` | Git hook templates |
| `tests/unit/cross-tool-sync.test.js` | Test suite |

---

## Version History

- **v2.2.0** - Initial cross-tool sync implementation
  - File watcher service
  - Sync manager with conflict resolution
  - CLI commands for sync control
  - Git hooks integration
  - Comprehensive test coverage
