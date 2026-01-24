# Session Handoffs

This directory contains session handoff documents that enable continuity between Claude Code sessions.

## Purpose

Session handoffs capture:
- Work completed during a session
- Work in progress with current state
- Blockers and issues encountered
- Context needed for continuation
- Recommended next steps

## Creating a Handoff

Use the `/collab handoff` command at the end of a session:

```
/collab handoff
```

This generates a handoff document from the current session state.

## Manual Handoff

If the command isn't available, copy `TEMPLATE.md` and fill in:

1. Session metadata
2. Completed work summary
3. In-progress work state
4. Any blockers or issues
5. Context for next session
6. Recommended next steps

## Naming Convention

Handoff files are named:
```
YYYY-MM-DD-HH-MM-member-id.md
```

Example: `2024-01-15-14-30-dev-1.md`

## Finding Relevant Handoffs

### Most Recent

Sort by filename (most recent first):
```bash
ls -r sessions/*.md
```

### By Team Member

```bash
ls sessions/*-member-id.md
```

### By Date Range

```bash
ls sessions/2024-01-*.md
```

## Retention

| Age | Action |
|-----|--------|
| < 7 days | Keep (active reference) |
| 7-30 days | Review for archival |
| 30-90 days | Archive important, delete routine |
| > 90 days | Delete unless historically significant |

## Archiving

Important handoffs (major feature completions, incident resolutions) should be:

1. Moved to `sessions/archive/`
2. Renamed with descriptive suffix: `YYYY-MM-DD-feature-name.md`
3. Referenced in relevant ADRs if applicable

## Best Practices

1. **Create handoffs proactively** - Don't wait until context is lost
2. **Be specific** - Include file paths, line numbers, commit hashes
3. **Note blockers clearly** - Help the next person avoid wasted effort
4. **Include context** - Share discoveries that aren't in the code
5. **Suggest next steps** - Prioritize what should happen next
