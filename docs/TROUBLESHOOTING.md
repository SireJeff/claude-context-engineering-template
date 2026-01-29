# Troubleshooting Guide

Common issues and solutions for Claude Context Engineering.

---

## Quick Diagnosis

Run diagnostics to automatically detect issues:

```bash
npx .ai-context/tools/bin/claude-context.js diagnose
```

To attempt auto-fix:

```bash
npx .ai-context/tools/bin/claude-context.js diagnose --fix
```

---

## Issue Categories

1. [Installation Issues](#installation-issues)
2. [Initialization Failures](#initialization-failures)
3. [Context Budget Problems](#context-budget-problems)
4. [Validation Errors](#validation-errors)
5. [Agent/Command Issues](#agentcommand-issues)
6. [Performance Issues](#performance-issues)

---

## Installation Issues

### TSG-001: CLI Tools Won't Install

**Symptoms:**
- `npm install` fails in `.ai-context/tools/`
- Missing dependencies errors

**Diagnosis:**
```bash
node --version  # Should be 16+
npm --version   # Should be 8+
```

**Solutions:**

**A. Update Node.js**
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18
```

**B. Clear npm cache**
```bash
npm cache clean --force
cd .ai-context/tools && rm -rf node_modules && npm install
```

**C. Use yarn instead**
```bash
cd .ai-context/tools && yarn install
```

---

### TSG-002: Template Files Not Found

**Symptoms:**
- "AI_CONTEXT.md not found" errors
- Missing `.ai-context/` directory

**Solutions:**

**A. Verify copy was complete**
```bash
ls -la .ai-context/
# Should contain: agents/, commands/, context/, indexes/, settings.json, README.md
```

**B. Re-copy from template**
```bash
cp -r /path/to/template/.claude ./.claude
cp /path/to/template/AI_CONTEXT.md ./AI_CONTEXT.md
```

---

## Initialization Failures

### TSG-010: Tech Stack Not Detected

**Symptoms:**
- "Could not detect technology stack"
- Generic placeholders remain after initialization

**Diagnosis:**
```bash
# Check for expected files
ls package.json requirements.txt go.mod Cargo.toml pyproject.toml
```

**Solutions:**

**A. Provide explicit hint**
```bash
@context-engineer "Initialize for Python FastAPI with PostgreSQL"
```

**B. Create detection files**
If your project is non-standard, create a minimal detection file:
```bash
# For Python
echo "# Auto-generated for detection" > requirements.txt

# For Node
echo '{"name":"my-project"}' > package.json
```

**C. Manual initialization**
Edit `AI_CONTEXT.md` directly and replace `{{PLACEHOLDER}}` values manually.

---

### TSG-011: Too Many Workflows Discovered (>15)

**Symptoms:**
- Agent discovers 20+ workflows
- Documentation becomes unwieldy

**Solutions:**

**A. Let agent merge automatically**
The agent should merge related workflows. If not:
```bash
@context-engineer "Merge workflows: auth-login and auth-register into authentication"
```

**B. Focus on critical paths**
```bash
@context-engineer "Initialize focusing only on critical user paths"
```

---

### TSG-012: Too Few Workflows Discovered (<8)

**Symptoms:**
- Agent only finds 2-3 workflows
- Major functionality not documented

**Solutions:**

**A. Provide hints about areas to explore**
```bash
@context-engineer "Initialize and explore: user auth, payments, notifications, admin panel"
```

**B. Add workflows manually**
```bash
@context-engineer "Document workflow: [workflow-name]"
```

---

### TSG-013: Initialization Interrupted

**Symptoms:**
- `INIT_PROGRESS.json` exists
- Partial documentation

**Solutions:**

**A. Resume initialization**
```bash
npx .ai-context/tools/bin/claude-context.js init --resume
# Or in Claude Code:
@context-engineer "Resume initialization"
```

**B. Start fresh**
```bash
rm .ai-context/INIT_PROGRESS.json
@context-engineer "Initialize context engineering for this repository"
```

---

## Context Budget Problems

### TSG-020: Context Budget Exceeded

**Symptoms:**
- Claude responses truncated
- "Context limit" warnings
- Degraded response quality

**Diagnosis:**
Check current utilization by reviewing loaded content.

**Solutions:**

**A. Use progressive loading**
1. Load category index first (~5k tokens)
2. Load only relevant domain index (~15k tokens)
3. Load specific workflow only when needed

**B. Compact current context**
Ask Claude to summarize and archive current findings:
```
Summarize findings so far and archive. I need to load fresh context.
```

**C. Start fresh session**
For complex tasks, create a handoff document and start new session:
```bash
/collab handoff
```

---

### TSG-021: High Token Usage for Simple Tasks

**Symptoms:**
- 60%+ context utilization for basic tasks
- Loading unnecessary documentation

**Solutions:**

**A. Follow the 3-level chain**
Don't load detail files unless needed:
```
Level 1: CATEGORY_INDEX.md (~5k)
Level 2: domain index (~15k)
Level 3: workflow detail (~40k) - only if implementing
```

**B. Use targeted searches**
Instead of loading entire workflow:
```
Search for the specific function: [function name] in [file pattern]
```

---

## Validation Errors

### TSG-030: Schema Validation Failed

**Symptoms:**
- `settings.json` validation errors
- Invalid configuration

**Diagnosis:**
```bash
npx .ai-context/tools/bin/claude-context.js validate --schema
```

**Solutions:**

**A. Auto-fix with defaults**
```bash
npx .ai-context/tools/bin/claude-context.js diagnose --fix
```

**B. Manual fix**
Compare your `settings.json` with the schema in `.ai-context/schemas/settings.schema.json`.

---

### TSG-031: Broken Markdown Links

**Symptoms:**
- Links to files that don't exist
- 404 in documentation navigation

**Diagnosis:**
```bash
npx .ai-context/tools/bin/claude-context.js validate --links
```

**Solutions:**

**A. Update links after file moves**
After refactoring, update documentation:
```bash
# Find all references to old path
grep -r "old/path" .ai-context/
# Update to new path
```

**B. Regenerate affected workflows**
```bash
@context-engineer "Refresh workflow: [workflow-name]"
```

---

### TSG-032: Line Numbers Outdated

**Symptoms:**
- `file:line` references point to wrong code
- Accuracy below 60% threshold

**Diagnosis:**
```bash
npx .ai-context/tools/bin/claude-context.js validate --lines --threshold 60
```

**Solutions:**

**A. Run verification for modified files**
```bash
/verify-docs-current path/to/modified/file.py
```

**B. Refresh all workflows**
```bash
@context-engineer "Audit and refresh all workflow documentation"
```

**C. Accept drift within tolerance**
Line numbers within ±10 lines are acceptable. Focus on function names as anchors.

---

### TSG-033: Remaining Placeholders

**Symptoms:**
- `{{PLACEHOLDER}}` text visible in AI_CONTEXT.md
- Incomplete initialization

**Diagnosis:**
```bash
npx .ai-context/tools/bin/claude-context.js validate --placeholders
```

**Solutions:**

**A. Complete initialization**
```bash
@context-engineer "Complete placeholder replacement"
```

**B. Manual replacement**
Search and replace remaining placeholders in AI_CONTEXT.md with actual values.

---

## Agent/Command Issues

### TSG-040: Agent Not Found

**Symptoms:**
- "@agent-name" doesn't work
- "Agent not recognized" errors

**Solutions:**

**A. Check agent exists**
```bash
ls .ai-context/agents/
```

**B. Use correct invocation**
```bash
# Correct
@context-engineer "task description"

# Not
/context-engineer "task description"
```

---

### TSG-041: Command Not Found

**Symptoms:**
- "/rpi-research" doesn't work
- Command not recognized

**Solutions:**

**A. Check command exists**
```bash
ls .ai-context/commands/
```

**B. Verify command is registered**
Check `settings.json` includes the command:
```json
"commands": {
  "rpi_commands": ["/rpi-research", "/rpi-plan", "/rpi-implement"]
}
```

---

## Performance Issues

### TSG-050: Slow Initialization

**Symptoms:**
- Initialization takes 30+ minutes
- Agent seems stuck

**Solutions:**

**A. For large codebases (>100k LOC)**
```bash
@context-engineer "Initialize focusing on src/ directory only"
```

**B. Increase timeout**
Edit `settings.json`:
```json
"rpi_workflow": {
  "research_timeout_minutes": 60
}
```

---

### TSG-051: Slow Validation

**Symptoms:**
- Validation takes several minutes
- Especially on large documentation sets

**Solutions:**

**A. Validate specific checks only**
```bash
# Just schema
npx .ai-context/tools/bin/claude-context.js validate --schema

# Just structure
npx .ai-context/tools/bin/claude-context.js validate --structure
```

**B. Skip external link checking**
Ensure this is disabled (default):
```json
"validation": {
  "link_check_external": false
}
```

---

## Getting Help

If your issue isn't listed:

1. **Run full diagnostics:**
   ```bash
   npx .ai-context/tools/bin/claude-context.js diagnose --verbose
   ```

2. **Check logs:**
   ```bash
   cat .ai-context/logs/claude.log
   ```

3. **Report an issue:**
   https://github.com/SireJeff/claude-context-engineering-template/issues

Include:
- Error message
- Diagnostic output
- Tech stack
- Steps to reproduce
