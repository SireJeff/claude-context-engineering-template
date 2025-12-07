# Search Category Index

## Purpose
Entry point for search strategies and pattern recognition

## Search Patterns Available

| Pattern Type | Description | When to Use |
|--------------|-------------|-------------|
| **Configuration Values** | Environment variables, hardcoded settings | When searching for config values |
| **Business Logic** | Core application logic files | When locating business rules |
| **Database Schema** | Models, migrations, queries | When investigating data structures |
| **External Integrations** | API calls, webhooks, Connectors | When examining third-party integrations |
| **Error Handling** | Exception handling patterns | When debugging error scenarios |
| **Performance Bottlenecks** | Heavy computations, slow queries | When optimizing performance |

## Quick Start

1. Load this category index first (~5k tokens)
2. Identify relevant search pattern
3. Load pattern details for specific implementation
4. Use search strategies for investigation

## Context Budget
- Category Index: ~5k tokens (2.5% of context window)
- Pattern Details: ~10k tokens (5% of context window)
- Search Execution: ~30k tokens (15% of context window)

## Getting Started

```bash
# Load category index first
Read: .claude/indexes/search/CATEGORY_INDEX.md

# Then load relevant pattern details
Read: .claude/indexes/search/[pattern_type].md

# Finally execute search strategy
Follow pattern instructions for investigation
