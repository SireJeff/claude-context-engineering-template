---
name: database-ops
version: "1.0.0"
displayName: "Database Operations"
description: "Database operations, schema management, and query optimization specialist"
category: "database"
complexity: "medium-high"
context_budget: "~40K tokens"
capabilities:
  - "schema-design"
  - "migration-planning"
  - "query-optimization"
  - "data-integrity-checks"
  - "performance-tuning"
workflows:
  - "data-persistence"
  - "migrations"
  - "queries"
commands: ["/rpi-research", "/rpi-plan", "/rpi-implement"]
dependencies:
  agents: []
  commands: []
hooks:
  pre_invoke: null
  post_invoke: "verify-docs-current"
examples:
  - invocation: '@database-ops "Document database schema"'
    description: "Create schema documentation with relationships"
  - invocation: '@database-ops "Analyze query performance for [query]"'
    description: "Identify and optimize slow queries"
  - invocation: '@database-ops "Plan migration for [change]"'
    description: "Design safe migration strategy"
---

# Database Ops Agent

**Purpose:** Database operations, schema management, and query optimization

## Capabilities

This agent specializes in:
- **Schema design and validation** - Creating and validating database schemas
- **Migration management** - Planning and executing database migrations
- **Query optimization** - Analyzing and optimizing database queries
- **Data integrity checks** - Ensuring data consistency and validity
- **Performance tuning** - Identifying and resolving database performance issues

## Usage

After template initialization, this agent will be generated based on your database structure. It will:
1. Analyze your existing database schema
2. Create comprehensive schema documentation
3. Identify potential performance bottlenecks
4. Provide recommendations for schema optimization

## Example Commands

```bash
@database-ops "Document database schema for [table]"
@database-ops "Analyze query performance for [query]"
@database-ops "Plan migration from [old_version] to [new_version]"
```

## Integration Points

This agent integrates with:
- Workflow documentation
- API design (for data endpoints)
- Testing strategies
- Deployment processes

## Validation

- Schema consistency checks
- Migration validation
- Query performance benchmarks
