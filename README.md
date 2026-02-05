# ⚠️ This Repository is Archived

**The AI Context project has moved to a new repository:**

# 👉 [k0ntext](https://github.com/SireJeff/k0ntext) 👈

---

## Quick Links

- **New Repository:** https://github.com/SireJeff/k0ntext
- **npm Package:** https://www.npmjs.com/package/k0ntext
- **Documentation:** https://github.com/SireJeff/k0ntext#readme
- **Migration Guide:** https://github.com/SireJeff/k0ntext/blob/main/docs/MIGRATE_TO_UNIFIED.md

## Why Archive?

This repository (`claude-context-engineering-template`) was a monorepo with multiple packages. We've consolidated everything into a single, focused **`k0ntext`** package in a new repository.

## Legacy Package Status

The legacy packages from this repository are still available on npm in their final versions:

| Package | Final Version | npm URL |
|---------|---------------|---------|
| `create-universal-ai-context` | 2.6.0-final | [npm](https://www.npmjs.com/package/create-universal-ai-context) |
| `claude-context-plugin` | 2.2.0-final | [npm](https://www.npmjs.com/package/claude-context-plugin) |

These packages are **deprecated** and will not receive further updates. All functionality has been consolidated into the new **`k0ntext`** package.

## Migration

See the [new repository](https://github.com/SireJeff/k0ntext) for:
- Installation instructions
- Documentation
- Latest releases
- Issue tracking
- Contributing guidelines

### Quick Migration

```bash
# Uninstall old package
npm uninstall -g create-universal-ai-context

# Install new package
npm install -g k0ntext

# Initialize your project
k0ntext init
```

---

**Last updated:** 2026-02-05
**Status:** ⚠️ Archived - Use [k0ntext](https://github.com/SireJeff/k0ntext)
