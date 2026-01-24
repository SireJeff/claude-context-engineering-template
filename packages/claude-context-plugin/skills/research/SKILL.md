---
description: RPI Research Phase - Systematic codebase exploration for feature/fix analysis
---

# Context Engineering: Research Phase

When invoked, perform systematic codebase exploration:

## Process

1. **Initialize Research Document**
   - Create `.claude/research/active/[feature]_research.md`
   - Use template from `.claude/research/RESEARCH_TEMPLATE.md`

2. **Entry Point Discovery**
   - Search for API routes, CLI commands, event handlers related to $ARGUMENTS
   - Use parallel exploration for efficiency (up to 3 agents)

3. **Call Chain Tracing**
   - Trace 3 levels deep from entry points
   - Record exact file:line references for each function

4. **Dependency Mapping**
   - Internal: services, models, utilities used
   - External: APIs, databases, third-party services

5. **Test Coverage Analysis**
   - Find existing tests for affected code
   - Identify coverage gaps

6. **Generate Summary**
   - 150-word summary for Plan phase
   - List 3-20 relevant files with line numbers

## Context Budget
- Target: 25% of 200k tokens (50k)
- Final output: ~20k tokens (research doc only)

## Output
Research document saved to `.claude/research/active/`

## Next Step
After completion, run `/context-eng:plan $ARGUMENTS`
