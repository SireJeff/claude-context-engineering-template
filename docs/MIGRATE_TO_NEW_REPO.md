# Migrating to the New AI Context Repository

This guide helps you migrate from the old `claude-context-engineering-template` repository to the new `ai-context` repository.

## For Users

### Update Your Installation

```bash
# Uninstall old package
npm uninstall -g create-universal-ai-context

# Install new package
npm install -g ai-context

# Verify installation
ai-context --help
```

### Update Your Projects

If you have the old package installed in a project:

```bash
# Remove old package
npm uninstall create-universal-ai-context

# Install new package
npm install ai-context

# Re-initialize (your context will be preserved)
ai-context init
```

### What Changed?

| Old | New |
|-----|-----|
| Repository | `claude-context-engineering-template` | `ai-context` |
| Package | `create-universal-ai-context` | `ai-context` |
| Command | `create-ai-context` | `ai-context` |
| Structure | Monorepo (4 packages) | Single package |

### Features

The new `ai-context` package includes all features from the previous packages:

- ✅ Intelligent codebase analysis (OpenRouter-powered)
- ✅ Semantic search with vector embeddings
- ✅ MCP server (10 tools + 6 prompts)
- ✅ Cross-tool synchronization (9 AI tools)
- ✅ Complete CLI (7 commands)

## For Contributors

### Update Your Local Repository

If you have a fork or clone of the old repository:

```bash
# 1. Note your current branch
git branch --show-current

# 2. Add new remote
git remote add new-origin https://github.com/SireJeff/ai-context

# 3. Fetch from new repository
git fetch new-origin

# 4. Switch to tracking new repository
git branch --set-upstream-to=new-origin/main main

# 5. Remove old remote
git remote remove origin
git remote rename new-origin origin
```

### Update Your Fork

If you have a forked repository:

1. Visit https://github.com/SireJeff/ai-context
2. Click "Fork" to create a new fork
3. Update your local remote to point to your new fork
4. Delete your old fork from GitHub

### Update CI/CD

Update any GitHub Actions or CI/CD pipelines:

```yaml
# Old
- uses: actions/checkout@v3
  with:
    repository: SireJeff/claude-context-engineering-template

# New
- uses: actions/checkout@v3
  with:
    repository: SireJeff/ai-context
```

### Update npm Scripts

If you reference the package in npm scripts:

```json
{
  "scripts": {
    "old": "create-ai-context generate",
    "new": "ai-context generate"
  }
}
```

## For Developers Using the MCP Server

### Update Claude Desktop Config

Edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-context": {
      "command": "npx",
      "args": ["-y", "ai-context", "mcp"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

The MCP server is now built into `ai-context` — no separate package needed.

## Legacy Packages Reference

### create-universal-ai-context → ai-context

All functionality has been preserved:

```bash
# Old command
create-ai-context init
create-ai-context generate
create-ai-context sync:all

# New command
ai-context init
ai-context generate
ai-context sync
```

### @ai-context/mcp-server → Built-in

The MCP server is now part of `ai-context`:

```bash
# Old
npx @ai-context/mcp-server

# New
ai-context mcp
```

### claude-context-plugin → Skills

Plugin functionality is now available as RPI workflow skills in `ai-context`:

- `.claude/skills/` contains skill definitions
- Use with `/skill-name` commands in Claude Code

## Data Migration

### Database Compatibility

Your existing `.ai-context.db` is **fully compatible** with the new package. No migration needed!

### Context Files

Existing context files (`.ai-context/`, `.clinerules`, etc.) will be updated when you run:
```bash
ai-context generate
```

## Breaking Changes

There are **no breaking changes** to the core functionality. The consolidation was designed to be a drop-in replacement.

### Minor Differences

1. **Command name:** `create-ai-context` → `ai-context`
2. **Package name:** `create-universal-ai-context` → `ai-context`
3. **Repository:** Monorepo → Single package

## Rollback

If you need to rollback to the old package:

```bash
npm uninstall ai-context
npm install -g create-universal-ai-context@2.5.0
```

However, we strongly recommend using the new package as the old one is deprecated.

## Support

- **New Repository:** https://github.com/SireJeff/ai-context
- **Issues:** https://github.com/SireJeff/ai-context/issues
- **Discussions:** https://github.com/SireJeff/ai-context/discussions
- **Documentation:** https://github.com/SireJeff/ai-context#readme

## Timeline

- **2026-02-05:** New repository launched
- **2026-03-01:** Old repository archived
- **2026-06-01:** Legacy packages deprecated on npm

---

**Questions?** Please open an issue on the new repository: https://github.com/SireJeff/ai-context/issues
