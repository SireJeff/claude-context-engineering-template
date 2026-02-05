---
name: analytics
version: "1.0.0"
displayName: "Usage Analytics"
description: "View local usage statistics and context metrics"
category: "system"
complexity: "low"
context_budget: "~5K tokens"
typical_context_usage: "2%"
prerequisites:
  - "Analytics enabled in settings (optional)"
outputs:
  - "Usage statistics report"
  - "Context metrics summary"
  - "Exported metrics file (with --export)"
related_agents: []
examples:
  - command: "/analytics"
    description: "View local usage statistics"
  - command: "/analytics context"
    description: "Show context budget metrics"
  - command: "/analytics export"
    description: "Export metrics to JSON file"
---

# /analytics - Usage Analytics Command

View local usage statistics, context metrics, and export data for analysis.

## Privacy First

**All analytics are local by default.** No data is sent externally unless explicitly configured in `.ai-context/settings.json`:

```json
{
  "telemetry": {
    "enabled": false
  }
}
```

## Subcommands

### `/analytics` (default)

Display summary of local usage statistics.

**Metrics Shown:**
- Session count (last 7/30 days)
- Command usage frequency
- Agent invocation counts
- Average session duration
- Files modified per session

### `/analytics context`

Show context budget metrics and trends.

**Metrics Shown:**
- Current documentation size (tokens)
- Budget utilization percentage
- Largest context consumers
- Token trend over time
- Recommendations for optimization

### `/analytics commands`

Show command usage breakdown.

**Metrics Shown:**
- Most used commands
- Command success/failure rates
- Average command duration
- Command usage by day/week

### `/analytics agents`

Show agent utilization breakdown.

**Metrics Shown:**
- Most invoked agents
- Agent task completion rates
- Average context per agent
- Agent usage patterns

### `/analytics export`

Export metrics to JSON file.

**Output:** `.ai-context/analytics/export-YYYY-MM-DD.json`

### `/analytics clear`

Clear local analytics data.

**Confirmation required** before clearing.

## Usage Examples

### View Summary Statistics

```
User: /analytics

Claude: ## Usage Analytics (Local)

### Session Summary (Last 30 Days)
| Metric | Value |
|--------|-------|
| Total Sessions | 42 |
| Avg Duration | 45 min |
| Files Modified | 312 |
| Commits Made | 87 |

### Top Commands
1. /rpi-research (23 uses)
2. /rpi-implement (19 uses)
3. /verify-docs-current (15 uses)
4. /rpi-plan (12 uses)
5. /help (8 uses)

### Top Agents
1. @core-architect (18 invocations)
2. @api-developer (14 invocations)
3. @database-ops (9 invocations)

### Context Health
- Documentation: 45K tokens (23% of budget)
- Status: Healthy ✓

Data stored locally in .ai-context/analytics/
```

### View Context Metrics

```
User: /analytics context

Claude: ## Context Budget Analysis

### Current State
| Category | Tokens | % Budget |
|----------|--------|----------|
| Indexes | 12,400 | 6.2% |
| Workflows | 18,200 | 9.1% |
| Agents | 8,600 | 4.3% |
| Commands | 5,800 | 2.9% |
| **Total** | **45,000** | **22.5%** |

### Budget Status
✓ Under 40% target (healthy)

### Largest Files
1. context/workflows/authentication.md (4,200 tokens)
2. context/ARCHITECTURE_SNAPSHOT.md (3,800 tokens)
3. agents/core-architect.md (2,100 tokens)

### Trend (Last 4 Weeks)
Week 1: 42K tokens
Week 2: 43K tokens
Week 3: 44K tokens
Week 4: 45K tokens (+7% growth)

### Recommendations
- Growth rate sustainable
- No immediate action needed
- Review if exceeds 50K tokens
```

### Export Metrics

```
User: /analytics export

Claude: Exporting analytics data...

Exported to: .ai-context/analytics/export-2024-01-15.json

Contents:
- Session history (42 sessions)
- Command usage (156 invocations)
- Agent usage (41 invocations)
- Context metrics (4 weekly snapshots)

File size: 24 KB
```

## Data Storage

Analytics data is stored locally in `.ai-context/analytics/`:

```
.ai-context/analytics/
├── sessions.json      # Session history
├── commands.json      # Command usage
├── agents.json        # Agent invocations
├── context.json       # Context metrics
└── exports/           # Exported files
```

## Configuration

Configure analytics behavior in `.ai-context/settings.json`:

```json
{
  "telemetry": {
    "enabled": false,
    "events": {
      "command_usage": true,
      "context_metrics": true,
      "error_reports": false
    },
    "retention_days": 90
  }
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | false | Enable/disable all tracking |
| `command_usage` | true | Track command invocations |
| `context_metrics` | true | Track context budget |
| `error_reports` | false | Track errors (local only) |
| `retention_days` | 90 | Days to retain data |

## Privacy Notes

1. **Local Only**: All data stays on your machine
2. **No External Calls**: Nothing sent to external services
3. **User Control**: Clear data anytime with `/analytics clear`
4. **Opt-in**: Tracking disabled by default
5. **Transparent**: All data in readable JSON files

## Related

- [Settings Configuration](./../settings.json)
- [Context Budget Guidelines](./../README.md#context-budget)
