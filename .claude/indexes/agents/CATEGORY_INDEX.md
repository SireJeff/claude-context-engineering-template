# Agents Category Index

## Purpose
Entry point for agent selection matrix

## Agents Available

| Agent | Primary Workflows | Use For |
|-------|------------------|---------|
| **`context-engineer`** | INITIALIZATION | Transform this template for any codebase |
| **core-architect** | System architecture, state machines | High-level design and architecture |
| **database-ops** | Migrations, schema, queries | Database operations and optimization |
| **api-developer** | Endpoints, contracts | API design and implementation |
| **integration-hub** | External services | Third-party service integration |
| **deployment-ops** | CI/CD, infrastructure | Deployment and infrastructure management |

## Detailed Selection Guide

For detailed agent selection guidance including capabilities, workflows, and decision criteria, see:
**[CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)**

## Quick Start

1. Load this category index first (~5k tokens)
2. Check CAPABILITY_MATRIX.md for detailed selection guidance
3. Load agent definition for detailed capabilities
4. Use agent for specific tasks

## Context Budget
- Category Index: ~5k tokens (2.5% of context window)
- Agent Definition: ~10k tokens (5% of context window)
- Agent Session: ~50k tokens (25% of context window)

## Getting Started

```bash
# Load category index first
Read: .claude/indexes/agents/CATEGORY_INDEX.md

# Then load relevant agent definition
Read: .claude/agents/[agent].md

# Finally use agent for specific tasks
@agent-name "Task description"
