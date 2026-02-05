# Migration Guide: Legacy Packages → Unified `ai-context`

**Version:** 3.0.0
**Date:** February 5, 2026

---

## Overview

The AI Context Engineering project has consolidated three separate packages into one unified `ai-context` package. This guide helps you migrate from the legacy packages.

## What Changed?

| Legacy Package | New Home | Status |
|---------------|----------|--------|
| `create-universal-ai-context` | `ai-context` | ⚠️ Deprecated |
| `@ai-context/mcp-server` | `ai-context` (included) | ⚠️ Deprecated |
| `claude-context-plugin` | `ai-context` skills | ⚠️ Deprecated |

---

## Migration Paths

### From `create-universal-ai-context`

**Old Commands:**
```bash
npx create-universal-ai-context init
npx create-universal-ai-context generate
```

**New Commands:**
```bash
# Install the unified package
npm install -g ai-context

# Initialize (same functionality)
ai-context init

# Generate context (same functionality)
ai-context generate
```

### From `@ai-context/mcp-server`

**Old Commands:**
```bash
npx create-ai-context mcp:start
npx create-ai-context mcp:init
npx create-ai-context mcp:status
```

**New Commands:**
```bash
# The MCP server is now included in ai-context
ai-context mcp

# All MCP functionality is now built-in
ai-context stats  # Equivalent to mcp:status
```

### From `claude-context-plugin`

**Old Commands:**
```bash
/context-optimize
/rpi-research
/rpi-plan
/rpi-implement
```

**New Usage:**
```bash
# Commands are now part of ai-context
# The same commands work - they're now in the unified package
```

---

## Step-by-Step Migration

### 1. Uninstall Legacy Packages

```bash
# Remove legacy packages
npm uninstall -g create-universal-ai-context

# Note: @ai-context/mcp-server and claude-context-plugin
# were typically not installed globally, but if you did:
npm uninstall -g @ai-context/mcp-server
npm uninstall -g claude-context-plugin
```

### 2. Install Unified Package

```bash
npm install -g ai-context
```

### 3. Update Configuration Files

**Claude Desktop Config:**
```json
{
  "mcpServers": {
    "ai-context": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\AppData\\Roaming\\npm\\node_modules\\ai-context\\dist\\mcp.js"],
      "env": {
        "OPENROUTER_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 4. Migrate Existing Context

```bash
# In your project directory
ai-context init

# Your existing context will be preserved and migrated
# to the new database format
```

### 5. Verify Migration

```bash
# Check status
ai-context stats

# Test commands
ai-context generate
ai-context sync

# Test MCP server
ai-context mcp
```

---

## Feature Mapping

| Legacy Feature | New Location | Notes |
|----------------|--------------|-------|
| `create-ai-context init` | `ai-context init` | Same functionality |
| `create-ai-context generate` | `ai-context generate` | Same functionality |
| `create-ai-context sync:*` | `ai-context sync` | Same functionality |
| `create-ai-context status` | `ai-context stats` | Same functionality |
| `mcp-server start` | `ai-context mcp` | Included in unified package |
| `mcp-server init` | Included in `ai-context init` | Automatic |
| Plugin skills | `ai-context` skills | Built-in commands |
| Plugin commands | `ai-context` commands | Built-in commands |

---

## Breaking Changes

### 1. Package Name

**Old:** `create-universal-ai-context`
**New:** `ai-context`

### 2. Command Prefix

**Old:** `create-ai-context`
**New:** `ai-context`

### 3. MCP Server

**Old:** Separate package `@ai-context/mcp-server`
**New:** Included in `ai-context`

### 4. Plugin

**Old:** Claude Code plugin
**New:** Built-in commands and skills

---

## Rollback

If you need to rollback:

```bash
# Uninstall new package
npm uninstall -g ai-context

# Reinstall legacy packages
npm install -g create-universal-ai-context@2.5.0
```

---

## Support

- **Legacy Support:** Security updates until 2026-06-01
- **Migration Issues:** [GitHub Issues](https://github.com/SireJeff/claude-context-engineering-template/issues)
- **Documentation:** [README](../README.md)

---

## FAQ

**Q: Do I need to migrate immediately?**
A: No, legacy packages will receive security updates until 2026-06-01.

**Q: Will my existing configurations work?**
A: Yes, most configurations are compatible. See the feature mapping table above.

**Q: What happens to my existing context files?**
A: They will be automatically migrated when you run `ai-context init`.

**Q: Is the unified package backward compatible?**
A: Yes, it supports all legacy workflows and configurations.

---

**Need Help?** Open an issue or join our community discussions.
