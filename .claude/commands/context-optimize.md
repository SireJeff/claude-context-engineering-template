---
name: context-optimize
version: "1.0.0"
description: "Orchestrate context engineering optimization with interactive scoping and RPI workflow TODO generation"
category: "orchestration"
context_budget_estimate: "40K tokens"
typical_context_usage: "20%"
prerequisites: []
outputs:
  - "Optimization TODO checklist in .claude/plans/active/context-optimization_plan.md"
  - "Context enhancement recommendations"
  - "Redundant file identification report"
  - "Agent/command creation suggestions based on user scope"
next_commands: ["/rpi-research", "/rpi-plan", "/rpi-implement"]
related_agents: ["context-engineer"]
examples:
  - command: "/context-optimize"
    description: "Start interactive context optimization workflow"
  - command: "/context-optimize --auto"
    description: "Run optimization with automatic scoping"
  - command: "/context-optimize --scope documentation"
    description: "Focus optimization on documentation only"
exit_criteria:
  - "User scope defined through up to 4 questions"
  - "TODO checklist generated with RPI phases"
  - "Redundant files identified"
  - "Enhancement opportunities documented"
  - "Action plan ready for execution"
---

# Context Optimization Command

**Purpose:** Orchestrate the context engineer agent to create a comprehensive TODO list for running RPI workflow, functionalize the context engineering system, and identify enhancement opportunities.

**Syntax:** `/context-optimize [--auto|--scope <area>]`

---

## What This Command Does

1. **Interactive Scoping** - Asks up to 4 multiple choice questions to understand your optimization goals
2. **Context Audit** - Analyzes the current context engineering setup for the codebase
3. **RPI TODO Generation** - Creates actionable TODO list with research, plan, implement phases
4. **Redundancy Detection** - Identifies redundant or outdated files in the context system
5. **Enhancement Suggestions** - Recommends specific agents or commands to add based on codebase needs

---

## Execution Flow

### Step 1: Interactive Scoping (Optional with --auto)

Ask up to 4 multiple choice questions to define optimization scope:

**Question 1: Optimization Focus**
```
What is your primary optimization goal?
A) Functionalize the entire context engineering system
B) Update outdated documentation and line references
C) Identify and remove redundant context files
D) Discover enhancement opportunities (new agents/commands)
```

**Question 2: Codebase Coverage**
```
Which areas of the codebase should be prioritized?
A) Core business logic
B) API/External integrations
C) Database/Data layer
D) All areas equally
```

**Question 3: Enhancement Preferences**
```
What types of enhancements would be most valuable?
A) New specialized agents for specific domains
B) New workflow commands for common tasks
C) Improved documentation structure
D) Better cross-referencing and navigation
```

**Question 4: Urgency Level**
```
How should the TODO list be structured?
A) Quick wins first (< 30 min each)
B) High impact first (regardless of effort)
C) By workflow area (grouped logically)
D) By dependency order (foundational first)
```

---

### Step 2: Context System Audit

**Actions:**
1. Analyze `.claude/` directory structure
2. Check workflow file coverage and accuracy
3. Verify index file completeness
4. Identify orphaned or outdated files
5. Assess agent and command coverage gaps

**Audit Checklist:**
```
[ ] CLAUDE.md is current and accurate
[ ] All workflow files have valid line references
[ ] CODE_TO_WORKFLOW_MAP.md matches codebase structure
[ ] All agents are properly documented
[ ] All commands are functional
[ ] Index files are complete and navigable
[ ] Research/Plans directories are organized
```

---

### Step 3: Generate RPI TODO List

Based on scoping and audit, generate actionable TODO with RPI phases:

**Output Format:**
```markdown
# Context Optimization TODO

**Generated:** [timestamp]
**Scope:** [user-selected scope]
**Priority:** [user-selected priority]

## Phase 1: RESEARCH Tasks

- [ ] /rpi-research context-system-audit
  - Discover all existing context files and their relationships
  - Map current workflow coverage
  - Identify gaps in documentation

- [ ] /rpi-research [area-specific-task]
  - [Description based on scoping]

## Phase 2: PLAN Tasks

- [ ] /rpi-plan context-restructure
  - Define file reorganization strategy
  - Plan redundant file cleanup
  - Design enhanced navigation structure

- [ ] /rpi-plan [enhancement-specific-task]
  - [Description based on scoping]

## Phase 3: IMPLEMENT Tasks

- [ ] /rpi-implement context-updates
  - Execute planned changes atomically
  - Update all affected index files
  - Validate with /verify-docs-current

- [ ] /rpi-implement [new-agent-or-command]
  - [Description based on scoping]

## Post-Implementation

- [ ] Run /validate-all
- [ ] Archive completed plans
- [ ] Update CHANGELOG.md
```

---

### Step 4: Redundant File Detection

**Detection Rules:**
1. Files not referenced by any index
2. Duplicate or overlapping content (>70% similarity)
3. Outdated files with stale line references (>20% drift)
4. Empty placeholder files without content
5. Orphaned research/plan files older than 30 days

**Output:**
```
REDUNDANT FILES DETECTED:

⚠️  High Priority (should remove):
- .claude/context/workflows/old_feature.md - Not in any index
- .claude/research/completed/stale_research.md - 90 days old

📋 Medium Priority (review needed):
- .claude/context/DUPLICATE_FILE.md - 85% similar to other.md

ℹ️  Low Priority (consider archiving):
- .claude/plans/completed/ancient_plan.md - 60 days old
```

---

### Step 5: Enhancement Recommendations

**Analysis Categories:**

1. **Agent Gaps**
   - Identify domains without specialized agents
   - Suggest new agents based on codebase patterns
   ```
   RECOMMENDED AGENTS:
   - @testing-specialist: Found 150+ test files without dedicated agent
   - @security-ops: Detected auth/security patterns in 12 files
   ```

2. **Command Gaps**
   - Identify common tasks without commands
   - Suggest automation opportunities
   ```
   RECOMMENDED COMMANDS:
   - /test-coverage: Frequent test coverage checks detected
   - /security-audit: Security-related workflows found
   ```

3. **Documentation Gaps**
   - Identify undocumented workflows
   - Suggest documentation priorities
   ```
   UNDOCUMENTED WORKFLOWS:
   - Error handling flow (found in 8 files)
   - Cache invalidation (found in 5 files)
   ```

---

## Output Files

1. **TODO Checklist:** `.claude/plans/active/context-optimization_plan.md`
2. **Audit Report:** `.claude/research/active/context-audit_research.md`
3. **Recommendations:** Inline in TODO checklist

---

## Context Budget

- Scoping questions: ~5K tokens
- Audit phase: ~15K tokens
- TODO generation: ~10K tokens
- Recommendations: ~10K tokens
- Total: ~40K tokens (20%)

---

## Usage Examples

### Full Interactive Flow
```bash
/context-optimize
```
Walks through all 4 scoping questions, then generates comprehensive TODO.

### Automatic Mode
```bash
/context-optimize --auto
```
Uses intelligent defaults:
- Focus: Functionalize entire system
- Coverage: All areas equally
- Enhancements: All types
- Priority: By dependency order

### Scoped Mode
```bash
/context-optimize --scope documentation
/context-optimize --scope agents
/context-optimize --scope workflows
/context-optimize --scope cleanup
```
Skips scoping questions, focuses on specified area.

---

## Integration with RPI Workflow

After running `/context-optimize`, execute the generated TODO:

```
1. /context-optimize                    ← Generate TODO
2. /rpi-research [first-research-task]  ← Execute research items
3. /rpi-plan [first-plan-task]          ← Create implementation plans
4. /rpi-implement [first-impl-task]     ← Execute changes
5. /validate-all                        ← Verify everything works
```

---

## Success Metrics

After completing the optimization TODO:

| Metric | Target |
|--------|--------|
| Workflow coverage | >90% of codebase |
| Line number accuracy | >60% within ±10 lines |
| Index completeness | 100% files referenced |
| Redundant files | 0 after cleanup |
| Agent coverage | 1 agent per major domain |

---

## Related

- **Agent:** `@context-engineer` - Used for analysis and enhancement creation
- **Commands:** `/rpi-research`, `/rpi-plan`, `/rpi-implement` - Execute TODO items
- **Validation:** `/validate-all`, `/verify-docs-current` - Verify results

---

**Version:** 1.0.0
**Category:** Orchestration
**Context Usage:** ~40K tokens (20%)
