# ADR-0001: Adopt Context Engineering Template

## Metadata

| Field | Value |
|-------|-------|
| **Status** | accepted |
| **Created** | {{DATE}} |
| **Updated** | {{DATE}} |
| **Author** | {{AUTHOR_NAME}} |
| **Reviewers** | Team |
| **Supersedes** | N/A |
| **Superseded by** | N/A |

## Context

When working with Claude Code on complex codebases, we face several challenges:

### Background

- Claude Code has a 200k token context window
- Loading entire codebases exceeds this limit
- Ad-hoc exploration wastes tokens and time
- Knowledge is lost between sessions
- Team members lack shared context

### Current State

Without structured context management:
- Each session starts from scratch
- Developers manually guide Claude to relevant code
- Documentation and code drift apart
- Tribal knowledge remains undocumented

## Decision

Adopt the Context Engineering Template for Claude Code, implementing:

1. **3-Level Chain-of-Index Architecture** - Progressive detail loading
2. **RPI Workflow** - Research-Plan-Implement methodology
3. **Self-Maintaining Documentation** - Code-to-workflow mapping
4. **Specialized Agents** - Domain-specific assistants

### Key Points

1. Keep context budget under 40% (80k tokens) for working room
2. Use indexes to navigate, not to hold all information
3. Update documentation when code changes
4. Use RPI workflow for all significant features

## Alternatives Considered

### Alternative 1: Flat Documentation

**Description:** Single large CLAUDE.md with all information

**Pros:**
- Simple to maintain
- Everything in one place

**Cons:**
- Quickly exceeds context budget
- No progressive loading
- Hard to navigate

**Why not chosen:** Doesn't scale with codebase size

### Alternative 2: No Documentation Structure

**Description:** Rely on Claude's code exploration

**Pros:**
- Zero maintenance overhead
- Always up-to-date with code

**Cons:**
- Wastes context on exploration
- No curated knowledge
- Inconsistent results

**Why not chosen:** Inefficient use of context window

## Consequences

### Positive

- Efficient context utilization
- Consistent navigation patterns
- Knowledge persists across sessions
- Team shares common understanding

### Negative

- Initial setup overhead
- Requires maintenance discipline
- Learning curve for team

### Risks

- Documentation drift if not maintained
  - Mitigation: Use CODE_TO_WORKFLOW_MAP.md and /verify-docs-current
- Over-documentation consuming budget
  - Mitigation: Regular audits, keep to 40% target

## Implementation

### Steps

1. Copy template to project root
2. Run initialization (`npx claude-context init`)
3. Customize placeholders for project
4. Train team on RPI workflow
5. Establish documentation update habits

### Affected Components

- Development workflow: Add documentation updates
- Code review: Include documentation check
- CI/CD: Add validation workflow

### Migration Plan

Gradual adoption - start with core workflows, expand as team learns.

## Verification

- [ ] Context budget stays under 40%
- [ ] Team can navigate without manual guidance
- [ ] Documentation accuracy above 80%
- [ ] Session handoffs are effective

## References

- [Context Engineering Template README](../../../README.md)
- [RPI Workflow Plan](../../../RPI_WORKFLOW_PLAN.md)
- [Chain-of-Index Architecture](../../../indexes/README.md)

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| {{DATE}} | {{AUTHOR_NAME}} | Initial adoption decision |
