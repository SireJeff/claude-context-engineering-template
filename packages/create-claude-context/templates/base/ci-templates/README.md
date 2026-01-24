# CI/CD Templates

Pre-built CI/CD workflows for Claude Context Engineering validation.

## Available Templates

### GitHub Actions

| Template | Purpose | Trigger |
|----------|---------|---------|
| `validate-docs.yml` | Validate documentation on PRs | Pull requests |
| `context-check.yml` | Monitor context budget health | Push, weekly, manual |

## Installation

### GitHub Actions

Copy templates to your `.github/workflows/` directory:

```bash
# From project root
mkdir -p .github/workflows
cp .claude/ci-templates/github-actions/*.yml .github/workflows/
```

### Prerequisites

1. Node.js 18+ available in CI environment
2. `.claude/tools/` dependencies installed:
   ```bash
   cd .claude/tools && npm ci
   ```

## Customization

### Adjust Validation Strictness

Edit the workflow files to change thresholds:

```yaml
# In validate-docs.yml
- name: Check Line Number Accuracy
  run: |
    npx claude-context validate --lines --threshold 70  # Stricter
```

### Add Notifications

Add Slack/Discord notifications on failure:

```yaml
- name: Notify on Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Skip on Specific Files

Modify the `paths` filter:

```yaml
on:
  pull_request:
    paths:
      - '.claude/**'
      - 'src/**'
      - '!src/**/*.test.js'  # Exclude test files
```

## Workflow Outputs

### validate-docs.yml

- **validation-report.md** - Detailed validation results
- PR comment on failure with specific issues

### context-check.yml

- **metrics.json** - Documentation metrics
- **diagnostics.txt** - System diagnostics
- **validation.txt** - Full validation output
- Auto-creates issue on weekly failure

## Troubleshooting

### "CLI tools not found"

Ensure tools are installed:
```bash
cd .claude/tools && npm ci
```

### "Validation always fails on line numbers"

Line number drift is expected. Adjust threshold:
```yaml
--threshold 50  # More lenient
```

### "Context budget exceeded"

Review documentation and consider:
1. Splitting large workflow files
2. Moving rarely-used content to separate files
3. Compacting verbose sections
