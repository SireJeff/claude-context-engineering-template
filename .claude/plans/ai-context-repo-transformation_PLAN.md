# Implementation Plan: AI Context Repository Transformation

**Feature:** ai-context-repo-transformation
**Date:** 2026-02-05
**Status:** READY_FOR_IMPLEMENTATION
**Based On:** `.claude/research/active/ai-context-repo-transformation_research.md`

---

## Overview

Transform the `feature/v3.0.0-publish-ready` branch into a minimal, focused repository for the `ai-context` package only. This will become the foundation for a new GitHub repository.

**Goal:** Create a clean, single-package repository that can be migrated to a new GitHub repo, with the old repo archived.

---

## Scope

### In Scope ✅
- Remove all legacy packages (`create-ai-context`, `ai-context-mcp-server`, `claude-context-plugin`)
- Flatten repository structure (move `ai-context` from `packages/` to root)
- Update `.github/` configuration for single package
- Update `.claude/` development context for single package
- Update all documentation and path references
- Create archive notice for old repository

### Out of Scope ❌
- Migrating git history to new repository (handled separately)
- DNS or GitHub organization changes
- npm package ownership transfer
- Website updates

---

## Chunk Manifest

| Chunk ID | From Research | Status | Todos | Dependencies | Ready |
|----------|---------------|--------|-------|--------------|-------|
| CHUNK-P1 | CHUNK-R1 | READY | 4 | None | ✅ |
| CHUNK-P2 | CHUNK-R2 | READY | 6 | CHUNK-P1 | ⏳ |
| CHUNK-P3 | CHUNK-R3 | READY | 6 | CHUNK-P2 | ⏳ |
| CHUNK-P4 | CHUNK-R4 | READY | 5 | CHUNK-P2 | ⏳ |
| CHUNK-P5 | CHUNK-R5 | READY | 7 | CHUNK-P2 | ⏳ |
| CHUNK-P6 | CHUNK-R6 | READY | 5 | CHUNK-P5 | ⏳ |
| CHUNK-P7 | CHUNK-R7 | READY | 3 | CHUNK-P6 | ⏳ |

---

## CHUNK-P1: Legacy Package Removal

**Status:** READY
**Dependencies:** None
**Update Research Status When Complete:** Mark CHUNK-R1 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | Extract templates from legacy package | `packages/create-ai-context/templates/` | All | LOW | Verify extracted | ⏳ |
| 2 | Remove create-ai-context package | `packages/create-ai-context/` | All | MEDIUM | Verify removed | ⏳ |
| 3 | Remove ai-context-mcp-server package | `packages/ai-context-mcp-server/` | All | MEDIUM | Verify removed | ⏳ |
| 4 | Remove claude-context-plugin package | `packages/claude-context-plugin/` | All | MEDIUM | Verify removed | ⏳ |

### Todo 1: Extract templates from legacy package
**File:** `packages/create-ai-context/templates/`
**Action:** Copy all template files to temporary location before deletion
**Command:**
```bash
mkdir -p /tmp/ai-context-templates
cp -r packages/create-ai-context/templates/* /tmp/ai-context-templates/
```
**Test After:** Verify templates exist in temp location
**Rollback:** N/A (preparation step)

### Todo 2: Remove create-ai-context package
**File:** `packages/create-ai-context/`
**Current Code:** Entire directory exists
**Proposed Change:** Remove directory
**Command:**
```bash
git rm -r packages/create-ai-context/
```
**Test After:** `ls packages/` should not show create-ai-context
**Rollback:** `git reset --hard HEAD~1`

### Todo 3: Remove ai-context-mcp-server package
**File:** `packages/ai-context-mcp-server/`
**Current Code:** Entire directory exists
**Proposed Change:** Remove directory
**Command:**
```bash
git rm -r packages/ai-context-mcp-server/
```
**Test After:** `ls packages/` should not show ai-context-mcp-server
**Rollback:** `git reset --hard HEAD~1`

### Todo 4: Remove claude-context-plugin package
**File:** `packages/claude-context-plugin/`
**Current Code:** Entire directory exists
**Proposed Change:** Remove directory
**Command:**
```bash
git rm -r packages/claude-context-plugin/
```
**Test After:** `ls packages/` should show only ai-context
**Rollback:** `git reset --hard HEAD~1`

### Chunk Completion Criteria
- [ ] All legacy packages removed
- [ ] Only `` remains
- [ ] Templates extracted to temp location
- [ ] Commit: "chore: remove legacy deprecated packages"

---

## CHUNK-P2: Root Restructure

**Status:** READY
**Dependencies:** CHUNK-P1
**Update Research Status When Complete:** Mark CHUNK-R2 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | Remove monorepo package.json | `package.json` (root) | All | MEDIUM | Verify removed | ⏳ |
| 2 | Rewrite root README.md | `README.md` (root) | All | MEDIUM | Verify content | ⏳ |
| 3 | Update root CLAUDE.md | `CLAUDE.md` (root) | All | MEDIUM | Verify paths | ⏳ |
| 4 | Update root .gitignore | `.gitignore` | 33-34 | LOW | Verify ignores | ⏳ |
| 5 | Update root CHANGELOG.md | `CHANGELOG.md` (root) | 1-50 | LOW | Verify content | ⏳ |
| 6 | Clean root docs/ | `docs/` (root) | All | LOW | Verify cleaned | ⏳ |

### Todo 1: Remove monorepo package.json
**File:** `package.json` (root)
**Current Code:** Monorepo configuration with workspaces
**Proposed Change:** Delete file (package will be at root after CHUNK-P5)
**Command:**
```bash
git rm package.json
```
**Test After:** `ls package.json` should fail
**Rollback:** `git reset --hard HEAD~1`

### Todo 2: Rewrite root README.md
**File:** `README.md` (root)
**Current Code:** Describes monorepo with 3 packages
**Proposed Change:** Write new README for single ai-context package
**New Content:**
```markdown
# AI Context

Unified AI context engineering for Claude, Copilot, Cline, Cursor, and more.

## Quick Start

```bash
npm install -g ai-context
ai-context init
```

## Features

- 🧠 Intelligent codebase analysis (OpenRouter-powered)
- 🔍 Semantic search with vector embeddings
- 🔄 Cross-tool synchronization (9 AI tools supported)
- 📊 MCP server with 10 tools
- 🛠️ Complete CLI with 7 commands

## Documentation

- [Quick Start Guide](docs/QUICKSTART.md)
- [MCP Server Guide](docs/MCP_QUICKSTART.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## License

MIT
```
**Test After:** `head -20 README.md` should show new content
**Rollback:** `git reset --hard HEAD~1`

### Todo 3: Update root CLAUDE.md
**File:** `CLAUDE.md` (root)
**Current Code:** References 3-level navigation with packages/
**Proposed Change:** Update paths for single package at root
**Key Changes:**
- Remove `packages/` from all paths
- Update navigation for flat structure
- Update quick reference commands
**Test After:** Verify no references to ``
**Rollback:** `git reset --hard HEAD~1`

### Todo 4: Update root .gitignore
**File:** `.gitignore`
**Lines:** 33-34 (node_modules entries)
**Current Code:**
```
# Node modules (for CLI tools)
node_modules/
.claude/tools/node_modules/
packages/*/node_modules/
```
**Proposed Change:**
```
# Node modules
node_modules/
```
**Test After:** `grep node_modules .gitignore` should show 2 lines
**Rollback:** `git checkout .gitignore`

### Todo 5: Update root CHANGELOG.md
**File:** `CHANGELOG.md` (root)
**Lines:** 1-50 (v3.0.0 section)
**Current Code:** Describes package consolidation
**Proposed Change:** Update header for new repository context
**Test After:** `head -30 CHANGELOG.md` should look correct
**Rollback:** `git checkout CHANGELOG.md`

### Todo 6: Clean root docs/
**File:** `docs/` (root)
**Action:** Remove obsolete docs, keep relevant ones
**Keep:**
- `docs/TROUBLESHOOTING.md`
- `docs/MIGRATE_TO_UNIFIED.md` (historical)
**Remove:**
- `docs/QUICK_START_5MIN.md` (outdated)
- `docs/MIGRATION_v1_to_v2.md` (outdated)
- `docs/ISSUES_REPORT.md` (outdated)
- `docs/RECORDING_DEMO.md` (outdated)
**Command:**
```bash
git rm docs/QUICK_START_5MIN.md docs/MIGRATION_v1_to_v2.md docs/ISSUES_REPORT.md docs/RECORDING_DEMO.md
```
**Test After:** `ls docs/` should show only 2 files
**Rollback:** `git reset --hard HEAD~1`

### Chunk Completion Criteria
- [ ] Monorepo package.json removed
- [ ] Root README rewritten for single package
- [ ] CLAUDE.md updated with correct paths
- [ ] .gitignore cleaned
- [ ] CHANGELOG.md header updated
- [ ] docs/ cleaned to only relevant files
- [ ] Commit: "chore: restructure root for single package"

---

## CHUNK-P3: .github/ Update

**Status:** READY
**Dependencies:** CHUNK-P2
**Update Research Status When Complete:** Mark CHUNK-R3 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | Update CI workflow | `.github/workflows/ci.yml` | All | MEDIUM | Validate syntax | ⏳ |
| 2 | Update npm-publish workflow | `.github/workflows/npm-publish.yml` | All | MEDIUM | Validate syntax | ⏳ |
| 3 | Update PR template | `.github/PULL_REQUEST_TEMPLATE.md` | All | LOW | Verify content | ⏳ |
| 4 | Update issue templates | `.github/ISSUE_TEMPLATE/*.md` | All | LOW | Verify content | ⏳ |
| 5 | Rewrite Copilot instructions | `.github/copilot-instructions.md` | All | LOW | Verify content | ⏳ |
| 6 | Clear pending issues | `.github/PENDING_ISSUES/` | All | LOW | Verify cleared | ⏳ |

### Todo 1: Update CI workflow
**File:** `.github/workflows/ci.yml`
**Current Code:** References `` paths
**Proposed Change:** Update to root-level package
**Key Changes:**
- Change working directory from `` to `.`
- Update paths for `dist/` from root
- Update test paths
**Test After:** `yamllint .github/workflows/ci.yml` or manual review
**Rollback:** `git checkout .github/workflows/ci.yml`

### Todo 2: Update npm-publish workflow
**File:** `.github/workflows/npm-publish.yml`
**Current Code:** References ``
**Proposed Change:** Update to root-level package
**Key Changes:**
- Change working directory to `.`
- Update package.json path
**Test After:** Manual review of workflow
**Rollback:** `git checkout .github/workflows/npm-publish.yml`

### Todo 3: Update PR template
**File:** `.github/PULL_REQUEST_TEMPLATE.md`
**Current Code:** Mentions multiple packages
**Proposed Change:** Simplify for single package
**New Template:**
```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
<!-- Describe how you tested -->

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
```
**Test After:** `cat .github/PULL_REQUEST_TEMPLATE.md`
**Rollback:** `git checkout .github/PULL_REQUEST_TEMPLATE.md`

### Todo 4: Update issue templates
**Files:** `.github/ISSUE_TEMPLATE/*.md`
**Action:** Update templates to reference single package
**Files to Update:**
- `bug_report.md`
- `feature_request.md`
- `compatibility_issue.md`
- `extension_submission.md` (can remove - not relevant)
**Test After:** Review each template
**Rollback:** `git checkout .github/ISSUE_TEMPLATE/`

### Todo 5: Rewrite Copilot instructions
**File:** `.github/copilot-instructions.md`
**Current Code:** Describes monorepo structure
**Proposed Change:** Write instructions for single package
**New Content:**
```markdown
# AI Context - Copilot Instructions

## Project Overview
This is the ai-context package - unified AI context engineering tool.

## Structure
- src/ - TypeScript source code
- bin/ - CLI entry point
- tests/ - Vitest tests
- agents/ - AI agent definitions
- skills/ - AI skill definitions

## Key Commands
- ai-context init - Initialize context for a project
- ai-context generate - Generate context files
- ai-context sync - Sync across AI tools
- ai-context mcp - Start MCP server
```
**Test After:** `cat .github/copilot-instructions.md`
**Rollback:** `git checkout .github/copilot-instructions.md`

### Todo 6: Clear pending issues
**Directory:** `.github/PENDING_ISSUES/`
**Action:** Remove resolved/archived issues
**Command:**
```bash
git rm -r .github/PENDING_ISSUES/
```
**Test After:** `ls .github/PENDING_ISSUES/` should fail
**Rollback:** `git reset --hard HEAD~1`

### Chunk Completion Criteria
- [ ] CI workflow updated for root package
- [ ] npm-publish workflow updated
- [ ] PR template simplified
- [ ] Issue templates updated
- [ ] Copilot instructions rewritten
- [ ] Pending issues cleared
- [ ] Commit: "chore: update .github configuration for single package"

---

## CHUNK-P4: .claude/ Update

**Status:** READY
**Dependencies:** CHUNK-P2
**Update Research Status When Complete:** Mark CHUNK-R4 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | Update CLAUDE.md paths | `.claude/context/CLAUDE.md` | All | MEDIUM | Verify no packages/ | ⏳ |
| 2 | Update agents | `.claude/agents/*.md` | All | MEDIUM | Verify paths | ⏳ |
| 3 | Update commands | `.claude/commands/*.md` | All | MEDIUM | Verify paths | ⏳ |
| 4 | Update indexes | `.claude/indexes/*.md` | All | MEDIUM | Verify structure | ⏳ |
| 5 | Update automation | `.claude/automation/*` | All | LOW | Verify scripts | ⏳ |

### Todo 1: Update CLAUDE.md paths
**Files:** `.claude/context/*.md`, `CLAUDE.md` (root)
**Current Code:** References to `` and `packages/create-ai-context/`
**Proposed Change:** Update all paths to root level
**Search/Replace:**
- `` → `` (empty, since at root)
- `packages/create-ai-context/` → Remove references
**Command:**
```bash
find .claude -type f -name "*.md" -exec sed -i 's|||g' {} \;
```
**Test After:** `grep -r "packages/" .claude/` should return minimal results
**Rollback:** `git checkout .claude/`

### Todo 2: Update agents
**Files:** `.claude/agents/*.md` (6 agent files)
**Action:** Update agent descriptions for single package
**Agents to Update:**
- context-engineer.md
- api-developer.md
- core-architect.md
- database-ops.md
- deployment-ops.md
- integration-hub.md
**Key Changes:**
- Remove references to monorepo
- Update navigation paths
- Update quick reference
**Test After:** Review each agent file
**Rollback:** `git checkout .claude/agents/`

### Todo 3: Update commands
**Files:** `.claude/commands/*.md` (11 command files)
**Action:** Update command descriptions for single package
**Commands to Update:**
- rpi-research.md
- rpi-plan.md
- rpi-implement.md
- context-optimize.md
- validate-all.md
- verify-docs-current.md
- help.md
- collab.md
- analytics.md
- auto-sync.md
- session-*.md
**Test After:** Review each command file
**Rollback:** `git checkout .claude/commands/`

### Todo 4: Update indexes
**Files:** `.claude/indexes/*.md` (all index files)
**Action:** Update index navigation for flat structure
**Indexes to Update:**
- workflows/CATEGORY_INDEX.md
- code/CATEGORY_INDEX.md
- agents/CATEGORY_INDEX.md
- routing/CATEGORY_INDEX.md
- search/CATEGORY_INDEX.md
- All domain indexes
**Key Changes:**
- Remove packages/ from paths
- Update 3-level chain navigation
- Update file references
**Test After:** `grep -r "packages/" .claude/indexes/` should return empty
**Rollback:** `git checkout .claude/indexes/`

### Todo 5: Update automation
**Files:** `.claude/automation/*`
**Action:** Update automation scripts for single package
**Files to Check:**
- `hooks/post-commit.sh`
- `hooks/pre-commit.sh`
- `generators/*.js`
- `config.json`
**Test After:** Review automation scripts
**Rollback:** `git checkout .claude/automation/`

### Chunk Completion Criteria
- [ ] All path references updated (no packages/)
- [ ] Agents updated for single package
- [ ] Commands updated for single package
- [ ] Indexes updated for flat structure
- [ ] Automation scripts updated
- [ ] Commit: "chore: update .claude development context for single package"

---

## CHUNK-P5: Package Migration

**Status:** READY
**Dependencies:** CHUNK-P2
**Update Research Status When Complete:** Mark CHUNK-R5 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | Move package contents to root | `*` | All | HIGH | Verify structure | ⏳ |
| 2 | Update package.json paths | `package.json` | All | MEDIUM | Verify valid JSON | ⏳ |
| 3 | Move templates to root | `templates/` | All | MEDIUM | Verify templates | ⏳ |
| 4 | Consolidate agents/ | `agents/` | All | LOW | Verify merged | ⏳ |
| 5 | Consolidate skills/ | `skills/` | All | LOW | Verify merged | ⏳ |
| 6 | Update internal imports | `src/**/*.ts` | All | MEDIUM | Verify build | ⏳ |
| 7 | Remove packages/ directory | `packages/` | All | MEDIUM | Verify removed | ⏳ |

### Todo 1: Move package contents to root
**Source:** `*`
**Target:** Repository root
**Command:**
```bash
git mv src .
git mv bin .
git mv docs .
git mv tests .
git mv agents .
git mv skills
git mv package.json .
```
**Test After:** `ls -la` should show src/, bin/, docs/, tests/, etc. at root
**Rollback:** `git reset --hard HEAD~1`

### Todo 2: Update package.json paths
**File:** `package.json` (now at root)
**Current Code:** Has paths for templates/, agents/, skills/ inside package
**Proposed Change:** All paths are now relative to root (no change needed)
**Verification:**
```bash
cat package.json | grep -A 10 '"files"'
```
**Test After:** Should see correct file paths
**Rollback:** `git checkout package.json`

### Todo 3: Move templates to root
**Source:** `/tmp/ai-context-templates/*` (from CHUNK-P1)
**Target:** `templates/` at root
**Action:** Create templates directory and populate
**Command:**
```bash
mkdir -p templates
cp -r /tmp/ai-context-templates/* templates/
git add templates/
```
**Test After:** `ls templates/` should show template files
**Rollback:** `git reset --hard HEAD~1`

### Todo 4: Consolidate agents/
**Source:** `agents/` (if different from root `.claude/agents/`)
**Action:** Merge if different, otherwise remove package copy
**Command:**
```bash
# Check if different
diff -r .claude/agents/ agents/ || rm -rf agents/
```
**Test After:** Only one agents/ directory should exist
**Rollback:** `git reset --hard HEAD~1`

### Todo 5: Consolidate skills/
**Source:** `skills/`
**Action:** Same as agents - merge or remove duplicate
**Test After:** Only one skills/ directory should exist
**Rollback:** `git reset --hard HEAD~1`

### Todo 6: Update internal imports
**Files:** `src/**/*.ts`, `bin/*.js`
**Current Code:** Imports like `import { x } from '../db/client.js'`
**Proposed Change:** No change needed (relative imports remain same)
**Verification:**
```bash
npm run build
```
**Test After:** Build should complete successfully
**Rollback:** `git checkout src/ bin/`

### Todo 7: Remove packages/ directory
**Directory:** `packages/`
**Action:** Remove empty packages directory
**Command:**
```bash
rmdir packages 2>/dev/null || git rm -r packages/
```
**Test After:** `ls packages/` should fail
**Rollback:** `git reset --hard HEAD~1`

### Chunk Completion Criteria
- [ ] All package content at root level
- [ ] package.json correctly configured
- [ ] templates/ directory populated
- [ ] agents/ and skills/ consolidated
- [ ] Internal imports working (build succeeds)
- [ ] packages/ directory removed
- [ ] Commit: "refactor: migrate ai-context package to repository root"

---

## CHUNK-P6: Documentation Finalize

**Status:** READY
**Dependencies:** CHUNK-P5
**Update Research Status When Complete:** Mark CHUNK-R6 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | Update main README | `README.md` | All | LOW | Verify content | ⏳ |
| 2 | Update package README | `README.md` (was package) | All | LOW | Merge if needed | ⏳ |
| 3 | Update all path references | All `.md` files | All | MEDIUM | Verify links | ⏳ |
| 4 | Verify documentation links | All docs | - | MEDIUM | Check links | ⏳ |
| 5 | Create QUICKSTART guide | `docs/QUICKSTART.md` | New | LOW | Verify content | ⏳ |

### Todo 1: Update main README
**File:** `README.md` (root, updated in CHUNK-P2)
**Action:** Final review and polish for new repository
**Verify:**
- Installation instructions clear
- Feature list accurate
- Links working
- License information present
**Test After:** `head -50 README.md` should look good
**Rollback:** N/A (polish only)

### Todo 2: Update package README
**File:** If `README.md` still exists with unique content
**Action:** Merge any unique content into main README, then delete
**Command:**
```bash
# Check if it exists and has unique content
if [ -f README.md ]; then
  # Review and merge manually
  git rm README.md
fi
```
**Test After:** Only one README.md should exist
**Rollback:** `git reset --hard HEAD~1`

### Todo 3: Update all path references
**Files:** All `.md` files in repository
**Action:** Find and replace any remaining old path references
**Search Patterns:**
- `` → `` (empty)
- `packages/create-ai-context/` → Remove or update
- `create-ai-context` → `ai-context` (command name)
**Command:**
```bash
find . -name "*.md" -type f -exec sed -i 's|||g' {} \;
```
**Test After:** `grep -r "packages/" *.md docs/*.md` should return minimal
**Rollback:** `git reset --hard HEAD~1`

### Todo 4: Verify documentation links
**Files:** All documentation files
**Action:** Check all internal links still work
**Key Files:**
- `README.md`
- `CHANGELOG.md`
- `CLAUDE.md`
- `docs/TROUBLESHOOTING.md`
- `docs/MIGRATE_TO_UNIFIED.md`
- `docs/MCP_QUICKSTART.md`
**Test After:** Manual review of links in key docs
**Rollback:** Individual file fixes

### Todo 5: Create QUICKSTART guide
**File:** `docs/QUICKSTART.md` (new)
**Action:** Create comprehensive quick start guide
**Content:**
```markdown
# AI Context - Quick Start Guide

## Installation

```bash
npm install -g ai-context
```

## Initialize Your Project

```bash
cd your-project
ai-context init
```

## Generate Context Files

```bash
ai-context generate
```

## Start MCP Server

```bash
ai-context mcp
```

## Next Steps

- Read the [full documentation](README.md)
- Configure for your [AI tools](docs/CROSS_TOOL_SYNC.md)
- Set up [MCP server](docs/MCP_QUICKSTART.md)
```
**Test After:** `cat docs/QUICKSTART.md`
**Rollback:** `git rm docs/QUICKSTART.md`

### Chunk Completion Criteria
- [ ] Main README finalized
- [ ] No duplicate READMEs
- [ ] All path references updated
- [ ] Documentation links verified
- [ ] QUICKSTART guide created
- [ ] Commit: "docs: finalize documentation for single package repository"

---

## CHUNK-P7: Archive Notice

**Status:** READY
**Dependencies:** CHUNK-P6
**Update Research Status When Complete:** Mark CHUNK-R7 as IMPLEMENTED

### Todolist

| # | Action | File | Lines | Risk | Test | Status |
|---|--------|------|-------|------|------|--------|
| 1 | Create archive notice | `ARCHIVE_NOTICE.md` | New | LOW | Verify content | ⏳ |
| 2 | Update old repo README | `README.md` (old repo) | 1-20 | LOW | Verify notice | ⏳ |
| 3 | Create migration doc | `docs/MIGRATE_TO_NEW_REPO.md` | New | LOW | Verify steps | ⏳ |

### Todo 1: Create archive notice
**File:** `ARCHIVE_NOTICE.md` (to be added to OLD repository)
**Action:** Create notice explaining migration
**Content:**
```markdown
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
```
**Test After:** `cat ARCHIVE_NOTICE.md`
**Rollback:** N/A (new file)

### Todo 2: Update old repo README
**File:** `README.md` (in OLD repository, before archiving)
**Action:** Replace current content with archive notice
**New Content:**
```markdown
# ⚠️ This Repository is Archived

**The AI Context project has moved to a new repository:**

# 👉 [ai-context](https://github.com/SireJeff/ai-context) 👈

---

## Quick Links

- **New Repository:** https://github.com/SireJeff/ai-context
- **npm Package:** https://www.npmjs.com/package/ai-context
- **Documentation:** https://github.com/SireJeff/ai-context#readme
- **Migration Guide:** https://github.com/SireJeff/ai-context/blob/main/docs/MIGRATE_TO_UNIFIED.md

## Why Archive?

This repository (`claude-context-engineering-template`) was a monorepo with multiple packages. We've consolidated everything into a single, focused **`ai-context`** package in a new repository.

## Migration

See the [new repository](https://github.com/SireJeff/ai-context) for:
- Installation instructions
- Documentation
- Latest releases
- Issue tracking
- Contributing guidelines

---

**Last updated:** 2026-02-05
**Status:** ⚠️ Archived - Use new repository
```
**Test After:** `head -30 README.md` (in old repo)
**Rollback:** `git checkout README.md` (if done in wrong repo)

### Todo 3: Create migration doc
**File:** `docs/MIGRATE_TO_NEW_REPO.md` (to be added to OLD repository)
**Action:** Create step-by-step migration guide
**Content:**
```markdown
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

## Changes Summary

| Old | New |
|-----|-----|
| Repository | `claude-context-engineering-template` | `ai-context` |
| Package | `create-universal-ai-context` | `ai-context` |
| Command | `create-ai-context` | `ai-context` |
| Structure | Monorepo (4 packages) | Single package |

## Questions?

- **New Repository:** https://github.com/SireJeff/ai-context
- **Issues:** https://github.com/SireJeff/ai-context/issues
- **Discussions:** https://github.com/SireJeff/ai-context/discussions
```
**Test After:** `cat docs/MIGRATE_TO_NEW_REPO.md`
**Rollback:** N/A (new file)

### Chunk Completion Criteria
- [ ] Archive notice created
- [ ] Old repo README updated (template)
- [ ] Migration document created
- [ ] Commit: "docs: add archive notice and migration guide"

**Note:** This chunk creates files to be added to the OLD repository after the feature branch is migrated to the new repository.

---

## Chunk Dependency Graph

```
┌─────────────┐
│ CHUNK-P1    │
│ Remove      │
│ Legacy      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CHUNK-P2    │
│ Root        │
│ Restructure │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ CHUNK-P3    │ │ CHUNK-P4    │ │ CHUNK-P5    │
│ .github/    │ │ .claude/    │ │ Package     │
│ Update      │ │ Update      │ │ Migration   │
└──────┬──────┘ └─────────────┘ └──────┬──────┘
       │                            │
       └────────────┬───────────────┘
                    ▼
            ┌─────────────┐
            │ CHUNK-P6    │
            │ Docs        │
            │ Finalize    │
            └──────┬──────┘
                   │
                   ▼
            ┌─────────────┐
            │ CHUNK-P7    │
            │ Archive     │
            │ Notice      │
            └─────────────┘
```

---

## Testing Strategy

### Per-Chunk Testing

After each CHUNK-Pn:
1. Run git status to verify expected changes
2. Run any specific tests for the chunk
3. Verify no unintended file modifications
4. Commit with descriptive message

### Full Suite Testing

After all chunks complete:
```bash
# Verify structure
ls -la

# Install and build
npm install
npm run build

# Run tests
npm test

# Verify CLI
npm link
ai-context --help
ai-context init

# Verify all docs
grep -r "packages/" . --include="*.md" --include="*.ts"

# Verify CI/CD files
yamllint .github/workflows/*.yml
```

---

## Rollback Plan

### Per-Chunk Rollback
Each chunk has individual rollback commands in its todos.

### Full Rollback
If entire transformation fails:
```bash
# Create backup before starting
git branch backup/before-transformation

# If rollback needed
git reset --hard backup/before-transformation
git clean -fd
```

### Safety Measures
1. Create backup branch before starting
2. Commit after each chunk
3. Atomic changes per chunk
4. Verify after each chunk

---

## Success Criteria

- [ ] Only `ai-context` package remains
- [ ] Package is at repository root
- [ ] All path references updated (no `packages/` in code)
- [ ] All documentation updated
- [ ] CI/CD workflows functional
- [ ] All tests passing
- [ ] CLI commands working
- [ ] Archive notice ready
- [ ] Ready for new repository creation

---

## Post-Implementation Steps

After implementation complete:

1. **Verify Everything:**
   ```bash
   npm install
   npm run build
   npm test
   ai-context --help
   ```

2. **Create New Repository:**
   - Create new repo `ai-context` on GitHub
   - Push feature branch to new repo
   - Set as main branch

3. **Publish to npm:**
   ```bash
   npm publish --access public
   ```

4. **Archive Old Repository:**
   - Add archive notice to old repo README
   - Add ARCHIVE_NOTICE.md
   - Add migration guide
   - Set repository to "Archived" status in GitHub settings

5. **Announcement:**
   - Create release in new repo
   - Post announcement on social media
   - Update npm package metadata

---

**Plan Status:** READY_FOR_IMPLEMENTATION
**Next Command:** `/rpi-implement ai-context-repo-transformation`
