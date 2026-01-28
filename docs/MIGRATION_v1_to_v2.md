# Migration Guide: v1.x to v2.0

This guide helps you upgrade from Claude Context Engineering v1.x to v2.0, which introduces multi-AI tool support.

## What Changed in v2.0

### Breaking Changes

| v1.x | v2.0 | Reason |
|------|------|--------|
| `.claude/` | `.ai-context/` | Universal AI tool support |
| `CLAUDE.md` | `AI_CONTEXT.md` | Not Claude-specific anymore |
| `npx create-claude-context` | `npx create-ai-context` | New primary command |

### New Features

- **Multi-AI Tool Output**: Generate context for Claude, Copilot, Cline, Antigravity
- **Automatic Workflow Generation**: 5-15 workflow docs auto-generated
- **Enhanced Analysis**: LOC counting, file purpose classification
- **New CLI Flags**: `--ai <tool>`, `--static`, `--force-ai`

## Migration Options

### Option 1: Automatic Migration (Recommended)

```bash
npx create-ai-context migrate
```

This command:
1. Renames `.claude/` to `.ai-context/`
2. Renames `CLAUDE.md` to `AI_CONTEXT.md`
3. Updates internal references
4. Generates additional AI tool outputs

### Option 2: Fresh Start

If you prefer a clean installation:

```bash
# Backup existing setup
mv .claude .claude-backup
mv CLAUDE.md CLAUDE.md.backup

# Run fresh installation
npx create-ai-context --yes

# Manually merge any customizations from backup
```

### Option 3: Manual Migration

If you need fine-grained control:

```bash
# Step 1: Rename directory
mv .claude .ai-context

# Step 2: Rename entry point
mv CLAUDE.md AI_CONTEXT.md

# Step 3: Update references in AI_CONTEXT.md
# Replace all ".claude/" with ".ai-context/"

# Step 4: Generate additional AI tool outputs
npx create-ai-context generate --ai copilot
npx create-ai-context generate --ai cline
npx create-ai-context generate --ai antigravity
```

## Path Reference Updates

If you have custom documentation with path references, update them:

| Old Path | New Path |
|----------|----------|
| `.claude/agents/` | `.ai-context/agents/` |
| `.claude/commands/` | `.ai-context/commands/` |
| `.claude/context/` | `.ai-context/context/` |
| `.claude/indexes/` | `.ai-context/indexes/` |
| `.claude/README.md` | `.ai-context/README.md` |

## Git Considerations

After migration, you'll want to:

```bash
# Stage the renamed files
git add -A

# Commit the migration
git commit -m "chore: migrate to v2.0 (.claude -> .ai-context)"
```

## Verify Migration

After migration, verify everything works:

```bash
# Check installation status
npx create-ai-context status

# Should show:
# ✓ v2.0 installation detected
# ✓ .ai-context/ directory exists
# ✓ AI_CONTEXT.md exists
```

## Troubleshooting

### "Directory .ai-context already exists"

The migration has already been run or you have both directories:

```bash
# Check what exists
ls -la | grep -E "\.claude|\.ai-context"

# Remove old directory if both exist
rm -rf .claude
```

### "CLAUDE.md not found"

The entry point may have already been renamed:

```bash
# Check what exists
ls -la | grep -E "CLAUDE|AI_CONTEXT"
```

### References still point to .claude/

Search and replace in your codebase:

```bash
# Find files with old references
grep -r "\.claude/" --include="*.md"

# Update references (careful with this)
find . -name "*.md" -exec sed -i 's/\.claude\//\.ai-context\//g' {} \;
```

## Backward Compatibility

The `create-claude-context` command still works and is now an alias for `create-ai-context`. You can continue using it, but we recommend switching to the new command.

## Questions?

- [GitHub Issues](https://github.com/SireJeff/claude-context-engineering-template/issues)
- [Documentation](https://github.com/SireJeff/claude-context-engineering-template#readme)
