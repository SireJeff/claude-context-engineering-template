# Workflows Category Index

## Purpose
Entry point for workflow-related navigation and task classification

## Categories Available

| Category | Description | When to Use |
|----------|-------------|-------------|
| **jobs** | Job-related workflows (hiring, onboarding, payroll) | When working with HR or recruitment processes |
| **payment** | Payment processing workflows | When implementing payment features |
| **email** | Email-related workflows | When building email functionality |
| **reporting** | Reporting and analytics workflows | When creating dashboards or reports |
| **authentication** | Auth-related workflows | When implementing login/registration features |

## Quick Start

1. Load this category index first (~5k tokens)
2. Identify relevant category
3. Load domain index for detailed navigation
4. Access workflow detail files for implementation

## Context Budget
- Category Index: ~5k tokens (2.5% of context window)
- Domain Index: ~15k tokens (7.5% of context window)
- Workflow Detail: ~40k tokens (20% of context window)

## Getting Started

```bash
# Load category index first
Read: .ai-context/indexes/workflows/CATEGORY_INDEX.md

# Then load relevant domain index
Read: .ai-context/indexes/workflows/[category].md

# Finally load workflow detail file
Read: .ai-context/context/workflows/[workflow].md
