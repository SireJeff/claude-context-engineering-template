---
name: session-resume
description: Resume a previous session with full context restoration
version: 1.0.0
category: session
context_budget: 10000
inputs:
  - session/current/state.json
  - session/history/**/*.json
outputs:
  - Restored session context
---

# /session-resume

Resume a previous session, restoring task context, loaded files reference, and pending updates.

## Syntax

```
/session-resume [sessionId | --list | --last]
```

## Options

| Option | Description |
|--------|-------------|
| `sessionId` | Resume specific session by ID |
| `--list` | Show available sessions |
| `--last` | Resume most recent session (default) |
| `--checkpoint <id>` | Resume from specific checkpoint |

## Examples

### Resume Last Session
```
/session-resume
```
or
```
/session-resume --last
```

### List Available Sessions
```
/session-resume --list
```
Shows recent sessions with IDs, dates, and task names.

### Resume Specific Session
```
/session-resume abc123-def456
```

### Resume from Checkpoint
```
/session-resume --checkpoint chk-789xyz
```

## What Gets Restored

| Data | Action |
|------|--------|
| Phase | Set to previous RPI phase |
| Task | Display task name and description |
| Files | List files that were loaded (for re-loading) |
| Pending Updates | Show queued doc updates |
| Context | Suggest files to reload |

## Resume Flow

1. **Load Session State**
   - Read from history or current state
   - Validate session data

2. **Display Summary**
   ```
   RESUMING SESSION

   Session: abc123-def456
   Started: 2025-01-24 10:30:00
   Phase: implement (Step 3 of 5)
   Task: Add user authentication

   Files Previously Loaded:
   - src/auth/login.py
   - src/models/user.py
   - tests/test_auth.py

   Pending Documentation Updates: 3
   - workflows/authentication.md (line numbers shifted)
   - workflows/user-management.md (new function added)

   Artifacts:
   - research/active/user-auth_research.md
   - plans/active/user-auth_plan.md
   ```

3. **Offer Actions**
   - [Continue] - Proceed with task
   - [Load Files] - Reload previously loaded files
   - [Process Updates] - Run /auto-sync for pending updates
   - [Start Fresh] - Archive and start new session

## Session List Format

```
AVAILABLE SESSIONS

ID                    Date        Phase      Task
────────────────────────────────────────────────────────
abc123-def456        2025-01-24  implement  Add user auth
def789-ghi012        2025-01-23  research   Fix payment bug
jkl345-mno678        2025-01-22  plan       Refactor API

Use: /session-resume <ID>
```

## Integration with RPI

When resuming during an RPI workflow:
- **Research phase**: Shows research document path
- **Plan phase**: Shows plan document path
- **Implement phase**: Shows current step and remaining steps

## Configuration

In `.ai-context/settings.json`:
```json
{
  "session": {
    "max_history_days": 30,
    "auto_archive_completed": true
  }
}
```

## Related Commands

- `/session-save` - Save current session
- `/collab handoff` - Create team handoff
- `/rpi-research` - Start research phase
- `/rpi-plan` - Start plan phase
- `/rpi-implement` - Start implement phase
