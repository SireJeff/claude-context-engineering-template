# Routing Category Index

## Purpose
Entry point for task routing and classification

## Task Types Available

| Task Type | Description | When to Use |
|-----------|-------------|-------------|
| **Feature** | New feature implementation | When building new functionality |
| **Bug Fix** | Issue resolution | When fixing bugs or issues |
| **Refactor** | Code improvement | When refactoring existing code |
| **Documentation** | Doc updates | When updating documentation |
| **Technical Debt** | Legacy improvements | When addressing technical debt |
| **Performance** | Optimization | When improving performance |

## Quick Start

1. Load this category index first (~5k tokens)
2. Identify relevant task type
3. Load routing matrix for detailed classification
4. Follow routing instructions for implementation

## Context Budget
- Category Index: ~5k tokens (2.5% of context window)
- Routing Matrix: ~10k tokens (5% of context window)
- Implementation Guidance: ~30k tokens (15% of context window)

## Getting Started

```bash
# Load category index first
Read: .claude/indexes/routing/CATEGORY_INDEX.md

# Then load relevant routing matrix
Read: .claude/indexes/routing/[task_type].md

# Finally follow routing instructions
Follow guidance in routing matrix
