# Research: AI Context Repository Transformation

**Feature:** ai-context-repo-transformation
**Date:** 2026-02-05
**Status:** RESEARCH_COMPLETE
**Researcher:** Claude

---

## Executive Summary

Transform the `feature/v3.0.0-publish-ready` branch into a minimal, focused repository containing only the `ai-context` package. This branch will become the foundation for a new GitHub repository, and the current `claude-context-engineering-template` repository will be archived with a migration notice.

---

## Current State Analysis

### Repository Structure (Current)
```
claude-context-engineering-template/
├── .github/                    # GitHub config
├── .claude/                    # Development context
├── packages/
│   ├── ai-context/            # ✅ Target package (KEEP)
│   ├── create-ai-context/     # ❌ Legacy (REMOVE)
│   ├── ai-context-mcp-server/ # ❌ Legacy (REMOVE)
│   └── claude-context-plugin/ # ❌ Legacy (REMOVE)
├── docs/                       # Root docs
├── README.md                   # Root README
├── CHANGELOG.md
├── CLAUDE.md
└── package.json                # Monorepo root
```

### Target State
```
ai-context/                     # NEW repository name
├── .github/                    # Updated GitHub config
├── .claude/                    # Updated development context
├── src/                        # Package source
├── bin/                        # CLI entry point
├── agents/                     # AI agents
├── skills/                     # AI skills
├── docs/                       # Documentation
├── templates/                  # Templates
├── tests/                      # Tests
├── README.md                   # Main README
├── CHANGELOG.md
├── LICENSE
└── package.json                # Single package
```

---

## Chunk Manifest

| Chunk ID | Focus Area | Files | Dependencies | Status |
|----------|-----------|-------|--------------|--------|
| CHUNK-R1 | Legacy Package Removal | packages/ | None | READY |
| CHUNK-R2 | Root Restructure | Root files | CHUNK-R1 | READY |
| CHUNK-R3 | .github/ Update | .github/ | CHUNK-R2 | READY |
| CHUNK-R4 | .claude/ Update | .claude/ | CHUNK-R2 | READY |
| CHUNK-R5 | Package Migration |  | CHUNK-R2 | READY |
| CHUNK-R6 | Documentation Finalize | All docs | CHUNK-R5 | READY |
| CHUNK-R7 | Archive Notice | Old repo | CHUNK-R6 | READY |

---

## CHUNK-R1: Legacy Package Removal

**Files Analyzed:**
- `packages/create-ai-context/` (v2.5.0 legacy)
- `packages/ai-context-mcp-server/` (v1.0.0 legacy)
- `packages/claude-context-plugin/` (v2.1.4 legacy)

**Analysis:**
These packages are deprecated as of v3.0.0. All functionality has been consolidated into `ai-context`.

**Key Findings:**
- `create-ai-context/` has templates that should be preserved in `ai-context/templates/`
- `ai-context-mcp-server/` MCP server is now built into `ai-context/src/mcp.ts`
- `claude-context-plugin/` skills are now in `ai-context/skills/`

**Dependencies:**
- Must preserve templates from `create-ai-context/templates/`
- Must verify MCP functionality migrated
- Must verify skills migrated

**Out of Scope:**
- Not migrating tests from legacy packages
- Not preserving legacy documentation

---

## CHUNK-R2: Root Restructure

**Files Analyzed:**
- `README.md` (root)
- `CHANGELOG.md` (root)
- `CLAUDE.md` (root)
- `package.json` (root monorepo)
- `.gitignore`
- `LICENSE`

**Analysis:**
Root level contains monorepo structure that needs to be flattened.

**Key Findings:**
- Root `package.json` defines workspaces - needs removal
- Root `README.md` describes monorepo - needs rewrite
- Root `CLAUDE.md` has 3-level navigation for monorepo - needs update
- Root files need to move to `ai-context/` or be rewritten

**Dependencies:**
- CHUNK-R1 (legacy packages removed)

**Target Changes:**
- Remove monorepo `package.json`
- Rewrite root `README.md` for single package
- Update root `CLAUDE.md` for new structure
- Keep root `CHANGELOG.md` but update
- Keep root `LICENSE`
- Update `.gitignore` for single package

---

## CHUNK-R3: .github/ Update

**Files Analyzed:**
- `.github/copilot-instructions.md`
- `.github/ISSUE_TEMPLATE/*.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/ci.yml`
- `.github/workflows/npm-publish.yml`
- `.github/PENDING_ISSUES/`

**Analysis:**
GitHub configuration needs update for single-package repository.

**Key Findings:**
- CI workflow references `` - needs path update
- npm-publish workflow references `` - needs path update
- Issue templates reference monorepo structure - needs update
- PR template references monorepo - needs update
- Copilot instructions need rewrite
- Pending issues are mostly resolved - can archive

**Dependencies:**
- CHUNK-R2 (root structure finalized)

**Target Changes:**
- Update CI workflow for single package
- Update npm-publish workflow for root-level package
- Rewrite issue templates
- Rewrite PR template
- Rewrite Copilot instructions
- Archive/clear pending issues

---

## CHUNK-R4: .claude/ Update

**Files Analyzed:**
- `.claude/agents/*.md` (6 agents)
- `.claude/commands/*.md` (11 commands)
- `.claude/context/*.md` (documentation)
- `.claude/indexes/*.md` (navigation indexes)
- `.claude/automation/` (hooks and generators)
- `.claude/standards/` (quality standards)

**Analysis:**
Development context needs update for single-package structure.

**Key Findings:**
- Agents reference old package structure
- Commands reference old paths
- Indexes have 3-level navigation for monorepo
- Context documentation describes monorepo
- Automation hooks reference old structure

**Dependencies:**
- CHUNK-R2 (root structure finalized)

**Target Changes:**
- Update agents for single package
- Update commands for single package
- Rewrite indexes for flat structure
- Update context documentation
- Update automation scripts
- Keep standards (mostly unchanged)

---

## CHUNK-R5: Package Migration

**Files Analyzed:**
- `package.json`
- `src/` (all source)
- `bin/` (CLI)
- `agents/` (6 agents)
- `skills/` (6 skills)
- `docs/` (MCP docs)
- `templates/` (empty currently)

**Analysis:**
The `ai-context` package needs to move from `packages/` to root.

**Key Findings:**
- `package.json` has correct structure already
- `src/` includes all TypeScript source (12 files)
- `agents/` and `skills/` are duplicates of root `.claude/` - can consolidate
- `templates/` is empty - should populate from legacy package
- `docs/` has MCP quickstart only

**Dependencies:**
- CHUNK-R2 (root structure finalized)
- CHUNK-R1 (legacy templates extracted)

**Target Changes:**
- Move `*` to root `/*`
- Merge root `.claude/` into package structure
- Populate `templates/` from legacy
- Update internal imports
- Update package.json paths

---

## CHUNK-R6: Documentation Finalize

**Files Analyzed:**
- All `README.md` files
- `CHANGELOG.md`
- `docs/MIGRATE_TO_UNIFIED.md`
- `docs/TROUBLESHOOTING.md`
- `docs/MCP_QUICKSTART.md`

**Analysis:**
Documentation needs final update for single-package repository.

**Key Findings:**
- `MIGRATE_TO_UNIFIED.md` is about legacy migration - still relevant
- `TROUBLESHOOTING.md` has v3.0.0 updates - keep
- Package `README.md` needs update for root position
- Root `README.md` needs rewrite

**Dependencies:**
- CHUNK-R5 (package migrated to root)

**Target Changes:**
- Update package README for root position
- Rewrite root README for single package
- Keep migration guide (historical)
- Keep troubleshooting guide
- Update all path references

---

## CHUNK-R7: Archive Notice

**Files Analyzed:**
- Old repository (this will be archived)

**Analysis:**
Need to create migration notice for archived repository.

**Key Findings:**
- Users visiting old repo need clear migration path
- Should point to new repository
- Should explain why archived

**Dependencies:**
- CHUNK-R6 (documentation finalized)

**Target Changes:**
- Create ARCHIVE_NOTICE.md for old repo
- Update old repo README with notice
- Create migration guide

---

## Inter-Phase Contract

**Consumer:** rpi-implement
**Processing Order:** Sequential (CHUNK-P1 through CHUNK-P7)
**Mark As Implemented When:** All chunk todos complete
**Update Research Status:** true
**Context Reset Trigger:** Every 2 chunks or 25% utilization

**Critical Dependencies:**
```
CHUNK-P1 (Remove Legacy) → CHUNK-P2 (Root Restructure) → CHUNK-P5 (Package Migration)
                                                              ↓
                                                        CHUNK-P3 (GitHub Update)
                                                              ↓
                                                        CHUNK-P4 (Claude Update)
                                                              ↓
                                                        CHUNK-P6 (Docs Finalize)
                                                              ↓
                                                        CHUNK-P7 (Archive Notice)
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Git history loss | HIGH | Use git-filter-repo or preserve history |
| Broken imports | MEDIUM | Comprehensive testing |
| Missing templates | MEDIUM | Extract from legacy before deletion |
| CI/CD breakage | MEDIUM | Update workflows before migrating |
| Documentation drift | LOW | Update all references |

---

## Testing Strategy

### Per-Chunk Tests
- CHUNK-P1: Verify legacy packages removed
- CHUNK-P2: Verify root structure valid
- CHUNK-P3: Verify CI workflows run
- CHUNK-P4: Verify agents/commands work
- CHUNK-P5: Verify package builds and tests
- CHUNK-P6: Verify all docs link correctly
- CHUNK-P7: Verify archive notice clear

### Full Suite Tests
```bash
npm install
npm run build
npm test
npm run lint
ai-context --help
```

---

## Success Criteria

1. ✅ Only `ai-context` package remains
2. ✅ Package is at repository root
3. ✅ All documentation updated
4. ✅ CI/CD workflows functional
5. ✅ All tests passing
6. ✅ Archive notice created
7. ✅ Ready for new repository creation

---

## Rollback Plan

If transformation fails:
1. Restore from backup branch
2. Keep monorepo structure
3. Document issues encountered
4. Create alternative migration plan

**Backup Branch:** `backup/before-transformation`
**Rollback Command:** `git reset --hard backup/before-transformation`
