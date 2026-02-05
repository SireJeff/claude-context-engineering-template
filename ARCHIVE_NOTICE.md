# ⚠️ Repository Archived

This repository has been **archived** and is no longer maintained.

## 📢 Migration Notice

The `ai-context` project has moved to a new, focused repository:

**👉 [NEW REPOSITORY](https://github.com/SireJeff/ai-context)**

## Why the Change?

The `claude-context-engineering-template` repository was originally a monorepo containing:
- `ai-context` (the main package)
- `create-ai-context` (deprecated)
- `ai-context-mcp-server` (deprecated)
- `claude-context-plugin` (deprecated)

We've consolidated everything into a single, focused package: **`ai-context`**

## What You Need to Do

### If you're a user:
1. Uninstall old packages: `npm uninstall -g create-universal-ai-context`
2. Install new package: `npm install -g ai-context`
3. See [migration guide](https://github.com/SireJeff/ai-context/blob/main/docs/MIGRATE_TO_UNIFIED.md)

### If you're a contributor:
1. Update your remote: `git remote set-url origin https://github.com/SireJeff/ai-context`
2. Star the new repository ⭐
3. Open issues/PRs in the new repository

## Legacy Packages

| Package | Status | Replacement |
|---------|--------|-------------|
| `create-universal-ai-context` | ⚠️ Deprecated | `ai-context` |
| `@ai-context/mcp-server` | ⚠️ Deprecated | Built into `ai-context` |
| `claude-context-plugin` | ⚠️ Deprecated | `ai-context` skills |

## Support

For issues, questions, or contributions, please use the **new repository**:
https://github.com/SireJeff/ai-context

---

**Archived on:** 2026-02-05
**New repository:** https://github.com/SireJeff/ai-context
