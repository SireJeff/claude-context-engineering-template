# Pending GitHub Issues

This directory contains issue templates ready to be created on GitHub.

## How to Create These Issues

Since these issues were prepared by an automated system that cannot directly create GitHub issues, please follow these steps:

### Step 1: Create Issues on GitHub

1. Go to https://github.com/SireJeff/claude-context-engineering-template/issues/new/choose
2. For each file in this directory, create a new issue:
   - Copy the content from the `.md` file
   - Use the title from the first line (e.g., `[BUG] Post-commit hook triggers file revision loop`)
   - Apply the labels mentioned at the bottom of each file
   - Set the milestone if applicable

### Issue Summary

| File | Type | Priority | Title |
|------|------|----------|-------|
| `issue-1-post-commit-hook-bug.md` | Bug | HIGH | Post-commit hook triggers file revision loop |
| `issue-2-aider-config-defaults.md` | Enhancement | MEDIUM | Improve Aider configuration with sensible defaults |
| `issue-3-context-engineer-cross-tool.md` | Enhancement | HIGH | Update Context Engineer agent for universal cross-tool support |

### Step 2: Link PR to Issues

After creating the issues, update the PR description to include:

```
Fixes #<issue-1-number>
Fixes #<issue-2-number>
Fixes #<issue-3-number>
```

### Step 3: Change PR Target Branch

The current PR targets `main`. To change it to `dev`:

1. Go to the PR page on GitHub
2. Click "Edit" next to the base branch
3. Change from `main` to `dev`

### Step 4: Comment on Issues

After creating the issues and linking them to the PR, add a comment to each issue:

```
🔄 **Status: In Progress**

This issue is being addressed in PR #<pr-number>.

Implementation includes:
- [For issue 1] Added `sync:state` command for state-only sync
- [For issue 2] Rewrote aider-config.hbs with better defaults
- [For issue 3] Updated Context Engineer agent to v2.0.0

Will be resolved when PR is merged to `main`.
```

---

## After Merge to Main

Once the PR is merged from `dev` to `main`:

1. Close each issue with a comment: "Fixed in release vX.Y.Z"
2. Delete this `PENDING_ISSUES` directory
3. Update the CHANGELOG with the version release

---

*This file was auto-generated to facilitate the issue creation workflow.*
