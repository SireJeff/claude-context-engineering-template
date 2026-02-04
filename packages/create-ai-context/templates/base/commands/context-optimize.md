---
name: context-optimize
version: "1.0.0"
description: "Orchestrate context engineering optimization with interactive scoping and RPI workflow TODO generation"
category: "orchestration"
context_budget_estimate: "40K tokens"
typical_context_usage: "20%"
prerequisites: []
outputs:
  - "Optimization TODO checklist in .ai-context/plans/active/context-optimization_plan.md"
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

**Question 4: TODO Priority Order**
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
1. Analyze `.ai-context/` directory structure
2. Check workflow file coverage and accuracy
3. Verify index file completeness
4. Identify orphaned or outdated files
5. Assess agent and command coverage gaps

**Audit Checklist:**
```
[ ] AI_CONTEXT.md is current and accurate
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
- .ai-context/context/workflows/old_feature.md - Not in any index
- .ai-context/research/completed/stale_research.md - 90 days old

📋 Medium Priority (review needed):
- .ai-context/context/DUPLICATE_FILE.md - 85% similar to other.md

ℹ️  Low Priority (consider archiving):
- .ai-context/plans/completed/ancient_plan.md - 60 days old
```

---

### Step 5: Enhancement Recommendations

**Analysis Categories:**

1. **Agent Gaps**
   - Identify domains without specialized agents
   - Suggest new agents based on codebase patterns
   ```
   RECOMMENDED AGENTS:
   - payment-specialist (Payments, Billing)
   - data-pipeline-ops (ETL, analytics)
   ```

2. **Command Gaps**
   - Identify missing commands for frequent tasks
   - Suggest new commands based on patterns
   ```
   RECOMMENDED COMMANDS:
   - /db-migrate (Database migration helper)
   - /api-docs (Generate API documentation)
   ```

3. **Documentation Gaps**
   - Identify undocumented workflows
   - Recommend new workflow documentation

---

## Next Steps

After completion, execute the generated TODO list:
1. `/rpi-research [first-research-task]`
2. `/rpi-plan [first-plan-task]`
3. `/rpi-implement [first-impl-task]`
4. `/validate-all`
