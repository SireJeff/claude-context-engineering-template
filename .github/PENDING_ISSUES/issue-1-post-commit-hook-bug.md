# [BUG] Post-commit hook triggers file revision loop

## Bug Report

### Environment

**Universal AI Context Engineering Version:** 2.5.0
**Node.js Version:** 18+
**Operating System:** All
**AI Tool(s) Used:** All supported tools

### Description

The post-commit AI hooks for the AI context engineering system trigger another file revision when they run, which creates uncommitted changes after every commit.

### Expected Behavior

The post-commit hook should NOT create additional uncommitted file modifications after a successful commit. It should only update internal state tracking without regenerating context files.

### Actual Behavior

After every commit:
1. The post-commit hook runs `sync:all`
2. This regenerates AI context files
3. Running `git status` shows modified files
4. This creates confusion and potential for a revision loop

### Steps to Reproduce

1. Initialize a project with `npx create-ai-context`
2. Install hooks with `npx create-ai-context hooks:install`
3. Make a code change and commit
4. Run `git status` immediately after commit
5. Observe that files have been modified by the post-commit hook

### Root Cause

The `post-commit.hbs` hook template calls `sync:all` which regenerates files instead of just updating state tracking.

**Files Affected:**
- `.claude/automation/hooks/post-commit.sh`
- `packages/create-ai-context/templates/hooks/post-commit.hbs`
- `packages/create-ai-context/lib/cross-tool-sync/sync-manager.js`

### Proposed Solution

Add a new `sync:state` command that only updates state tracking without regenerating files, and modify post-commit hooks to use this command.

---

### Checklist

- [x] Searched existing issues for duplicates
- [x] Included version information
- [x] Provided steps to reproduce
- [ ] Checked if symlink-related issue (on Windows)
- [x] Root cause identified

---

**Priority:** HIGH (Critical)
**Labels:** `bug`, `hooks`, `sync`
**Milestone:** v2.6.0
