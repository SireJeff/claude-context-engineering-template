# Code Category Index

## Purpose
Entry point for code organization and domain × layer overview

## Domains & Layers Available

| Domain | Layers | Description | When to Use |
|--------|--------|-------------|-------------|
| **core** | utils, services, models | Core application logic | When working with fundamental app components |
| **api** | controllers, routes, middleware | API layer | When implementing or debugging APIs |
| **infrastructure** | config, db, caching | Infrastructure components | When working with databases, caches, or configs |
| **ui** | components, pages, styles | User interface | When building or modifying front-end features |
| **testing** | unit, integration, e2e | Test suites | When writing or debugging tests |

## Quick Start

1. Load this category index first (~5k tokens)
2. Identify relevant domain and layer
3. Load domain index for detailed navigation
4. Access code files for implementation

## Context Budget
- Category Index: ~5k tokens (2.5% of context window)
- Domain Index: ~15k tokens (7.5% of context window)
- Code Files: ~20k tokens (10% of context window)

## Getting Started

```bash
# Load category index first
Read: .ai-context/indexes/code/CATEGORY_INDEX.md

# Then load relevant domain index
Read: .ai-context/indexes/code/[domain].md

# Finally load specific code files
Read: [code_file_path]
