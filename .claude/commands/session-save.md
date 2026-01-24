---
name: session-save
description: Save current session state for later resumption
version: 1.0.0
category: session
context_budget: 5000
outputs:
  - session/current/state.json
  - session/checkpoints/*.json (if checkpoint created)
---

# /session-save

Save the current session state including task context, loaded files, and pending documentation updates.

## Syntax

```
/session-save [--checkpoint "description"]
```

## Options

| Option | Description |
|--------|-------------|
| `--checkpoint "desc"` | Create a named checkpoint for easy resumption |

## What Gets Saved

| Data | Description |
|------|-------------|
| Session ID | Unique identifier for this session |
| Phase | Current RPI phase (idle/research/plan/implement) |
| Task | Active task name and description |
| Files Loaded | List of files loaded into context |
| Pending Updates | Documentation updates queued |
| Checkpoints | Named resume points |

## Examples

### Basic Save
```
/session-save
```
Saves current state to `.claude/session/current/state.json`

### Save with Checkpoint
```
/session-save --checkpoint "After completing user auth research"
```
Creates a named checkpoint for easy resumption later.

## Automatic Saving

Sessions are automatically saved:
- Every 5 minutes (configurable in settings.json)
- On RPI phase transitions
- Before context compaction

## Resume Later

Use `/session-resume` to restore this session.

## Session Location

```
.claude/session/
├── current/
│   └── state.json       # Current session state
├── history/
│   └── YYYY-MM-DD/      # Archived sessions by date
└── checkpoints/
    └── {id}.json        # Named checkpoints
```

## Process

1. **Collect State**
   - Gather current phase, task, loaded files
   - Collect pending documentation updates
   - Record context usage metrics

2. **Save to File**
   - Write to session/current/state.json
   - Optionally create checkpoint file

3. **Confirm**
   - Display summary of saved state
   - Show pending updates count

## Output Format

```
SESSION SAVED

Session: abc123-def456
Started: 2025-01-24 10:30:00
Phase: implement
Task: Add user authentication

Files Loaded: 12
Pending Updates: 3
Checkpoints: 2

Use '/session-resume' to restore this session.
```

## Related Commands

- `/session-resume` - Resume a saved session
- `/collab handoff` - Create team handoff document
- `/auto-sync` - Process pending documentation updates
