# Analytics Data

Local storage for usage analytics and metrics.

## Overview

This directory stores local analytics data collected during Claude Code sessions. All data is stored locally and never sent externally unless explicitly configured.

## Files

| File | Description |
|------|-------------|
| `sessions.json` | Session history and metadata |
| `commands.json` | Command usage statistics |
| `agents.json` | Agent invocation tracking |
| `context.json` | Context budget metrics over time |
| `exports/` | Exported analytics files |

## Data Schema

### sessions.json

```json
{
  "sessions": [
    {
      "id": "uuid",
      "started": "ISO-timestamp",
      "ended": "ISO-timestamp",
      "duration_minutes": 45,
      "files_modified": 12,
      "commits": 3,
      "member_id": "dev-1"
    }
  ]
}
```

### commands.json

```json
{
  "commands": {
    "/rpi-research": {
      "count": 23,
      "last_used": "ISO-timestamp",
      "success_rate": 0.95,
      "history": [
        {
          "timestamp": "ISO-timestamp",
          "duration_seconds": 120,
          "success": true
        }
      ]
    }
  }
}
```

### agents.json

```json
{
  "agents": {
    "@core-architect": {
      "invocations": 18,
      "last_used": "ISO-timestamp",
      "avg_context_tokens": 35000,
      "tasks_completed": 15
    }
  }
}
```

### context.json

```json
{
  "snapshots": [
    {
      "timestamp": "ISO-timestamp",
      "total_tokens": 45000,
      "breakdown": {
        "indexes": 12400,
        "workflows": 18200,
        "agents": 8600,
        "commands": 5800
      },
      "budget_percentage": 22.5
    }
  ]
}
```

## Retention

Data is retained according to `telemetry.retention_days` in settings (default: 90 days). Older data is automatically pruned.

## Clearing Data

To clear all analytics data:

```
/analytics clear
```

Or manually delete files in this directory (except README.md).

## Privacy

- All data stored locally
- No external transmission
- User has full control
- Can be disabled in settings
