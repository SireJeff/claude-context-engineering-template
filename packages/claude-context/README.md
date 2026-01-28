# claude-context

CLI tools for managing Claude Context Engineering in your project.

## Installation

```bash
# Use directly with npx (recommended)
npx claude-context validate --all

# Or install globally
npm install -g claude-context
```

## Prerequisites

Run `npx create-claude-context` first to initialize context engineering in your project.

## Commands

### Validate

Validate your context engineering setup:

```bash
# Run all validations
npx claude-context validate --all

# Specific validations
npx claude-context validate --schema        # JSON schema validation
npx claude-context validate --links         # Internal link validation
npx claude-context validate --placeholders  # Check for unreplaced {{PLACEHOLDERS}}
npx claude-context validate --structure     # Directory structure validation
npx claude-context validate --lines         # Line number accuracy check

# With options
npx claude-context validate --all --verbose
npx claude-context validate --lines --threshold 70
```

### Sync

Synchronize documentation with code changes:

```bash
# Check for drift
npx claude-context sync --check

# Auto-fix line number drift
npx claude-context sync --fix

# Rebuild CODE_TO_WORKFLOW_MAP
npx claude-context sync --rebuild-map

# Strict mode (fail on any drift)
npx claude-context sync --check --strict
```

### Hooks

Manage git hooks for automatic validation:

```bash
# Install pre-commit and post-commit hooks
npx claude-context hooks install

# Uninstall hooks
npx claude-context hooks uninstall

# Install only pre-commit
npx claude-context hooks install --pre-commit
```

### Diagnose

Run diagnostics on your setup:

```bash
# Run diagnostics
npx claude-context diagnose

# Auto-fix detected issues
npx claude-context diagnose --fix

# Verbose output
npx claude-context diagnose --verbose
```

### Generate

Generate or regenerate documentation:

```bash
# Regenerate CODE_TO_WORKFLOW_MAP.md
npx claude-context generate --code-map

# Rebuild all indexes
npx claude-context generate --indexes

# Regenerate semantic anchors
npx claude-context generate --anchors
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Validate context engineering
  run: npx claude-context validate --all --strict
```

## Related

- [create-claude-context](https://www.npmjs.com/package/create-claude-context) - Initial setup
- [claude-context-plugin](https://www.npmjs.com/package/claude-context-plugin) - Claude Code plugin

## License

MIT
