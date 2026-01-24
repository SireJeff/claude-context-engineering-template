# Quick Start Guide (5 Minutes)

Get Claude Context Engineering running in your project in under 5 minutes.

## Prerequisites

- [ ] Claude Code CLI installed (`claude` command available)
- [ ] Node.js 18+ (for CLI tools)
- [ ] A codebase to enhance

## Step 1: Run the CLI (30 seconds)

```bash
# From your project root
npx create-claude-context
```

This single command:
- Creates the `.claude/` directory structure
- Detects your tech stack automatically
- Generates `CLAUDE.md` at your project root
- Installs the Claude Code plugin (optional)

### Alternative: Manual Installation

```bash
git clone https://github.com/SireJeff/claude-context-engineering-template.git /tmp/template
cp -r /tmp/template/.claude ./.claude
cp /tmp/template/CLAUDE.md ./CLAUDE.md
rm -rf /tmp/template

# Install CLI tools
cd .claude/tools && npm install && cd ../..
```

## Step 2: Run Validation (1 minute)

```bash
npx .claude/tools/bin/claude-context.js validate
```

You should see:
```
🔍 Running Validation Suite...

Schema Validation
──────────────────────────────────────────────────
  ✓ settings.json

Structure Validation
──────────────────────────────────────────────────
  ✓ settings.json
  ✓ README.md
  ✓ agents
  ✓ commands
  ✓ context
  ✓ indexes

📊 Validation Summary
──────────────────────────────────────────────────
  Total checks: 3
  Passed: 3

  Overall: PASS
```

## Step 4: Initialize for Your Project (2 minutes)

In Claude Code CLI:

```bash
@context-engineer "Initialize context engineering for this repository"
```

The agent will:
1. Detect your tech stack (Python, Node, Go, etc.)
2. Discover 8-15 major workflows
3. Create documentation with file:line references
4. Populate all template placeholders

## Step 5: Verify (30 seconds)

```bash
npx .claude/tools/bin/claude-context.js validate --all
```

All checks should pass.

---

## What Just Happened?

You now have:

| Created | Purpose |
|---------|---------|
| `.claude/context/workflows/*.md` | Documentation for each workflow |
| `.claude/context/WORKFLOW_INDEX.md` | Master catalog of all workflows |
| `.claude/context/CODE_TO_WORKFLOW_MAP.md` | Reverse index (file → workflows) |
| `CLAUDE.md` | Populated project guidance |

## Next Steps

### For Bug Fixes / Features

```bash
# Research the area
/rpi-research feature-name

# Create implementation plan
/rpi-plan feature-name

# Implement with automatic doc updates
/rpi-implement feature-name
```

### For Quick Navigation

1. Open `WORKFLOW_INDEX.md` to find relevant workflow
2. Jump to specific `file:line` references
3. Follow call chains for debugging

### After Code Changes

```bash
# Verify documentation is still accurate
/verify-docs-current path/to/modified/file

# Or validate everything
npx .claude/tools/bin/claude-context.js validate --all
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Tech stack not detected" | Provide hint: `@context-engineer "Initialize for Python FastAPI"` |
| "Too many/few workflows" | Agent will merge or split automatically |
| Validation fails | Run `npx .claude/tools/bin/claude-context.js diagnose --fix` |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npx claude-context validate` | Validate setup |
| `npx claude-context diagnose` | Find and fix issues |
| `/rpi-research [name]` | Research a feature/bug |
| `/rpi-plan [name]` | Create implementation plan |
| `/rpi-implement [name]` | Execute plan |
| `/verify-docs-current [file]` | Check doc accuracy |

---

**Total time:** ~5 minutes
**Context budget:** <40% of 200k tokens
**Result:** 10× faster issue resolution
