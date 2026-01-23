# Agent Capability Matrix

Quick reference for selecting the right agent for your task.

---

## Decision Matrix

| Task Type | Primary Agent | Support Agent | Notes |
|-----------|---------------|---------------|-------|
| **Initialization/Setup** | `@context-engineer` | - | Only for first-time setup |
| **System Architecture** | `@core-architect` | `@database-ops` | High-level design |
| **State Machines** | `@core-architect` | - | Flow analysis |
| **Database Schema** | `@database-ops` | `@core-architect` | Schema design |
| **Migrations** | `@database-ops` | - | Schema changes |
| **Query Optimization** | `@database-ops` | - | Performance |
| **API Design** | `@api-developer` | `@core-architect` | REST/GraphQL |
| **API Contracts** | `@api-developer` | - | Request/response |
| **API Documentation** | `@api-developer` | - | OpenAPI/Swagger |
| **External Integrations** | `@integration-hub` | `@api-developer` | Third-party APIs |
| **Webhooks** | `@integration-hub` | - | Incoming/outgoing |
| **Authentication (External)** | `@integration-hub` | - | OAuth, API keys |
| **CI/CD Pipelines** | `@deployment-ops` | - | Build/deploy |
| **Infrastructure** | `@deployment-ops` | - | IaC, cloud |
| **Deployment Strategy** | `@deployment-ops` | `@core-architect` | Blue-green, canary |
| **Performance Tuning** | `@core-architect` | `@database-ops` | System-wide |
| **Security Review** | `@core-architect` | All | Cross-cutting |

---

## Agent Selection Flowchart

```
START: What are you trying to do?
│
├─► Setting up for the first time?
│   └─► @context-engineer
│
├─► Working with external services?
│   ├─► Third-party APIs → @integration-hub
│   ├─► Webhooks → @integration-hub
│   └─► External auth → @integration-hub
│
├─► Working with the database?
│   ├─► Schema design → @database-ops
│   ├─► Migrations → @database-ops
│   └─► Query performance → @database-ops
│
├─► Working with APIs?
│   ├─► Endpoint design → @api-developer
│   ├─► Contracts/schemas → @api-developer
│   └─► API documentation → @api-developer
│
├─► Working with deployment?
│   ├─► CI/CD pipelines → @deployment-ops
│   ├─► Infrastructure → @deployment-ops
│   └─► Rollback planning → @deployment-ops
│
└─► System design or architecture?
    └─► @core-architect
```

---

## Agent Profiles

### @context-engineer

| Attribute | Value |
|-----------|-------|
| **Category** | Initialization |
| **Complexity** | Very High |
| **Context Budget** | ~80K tokens (40%) |
| **Primary Use** | First-time setup, documentation refresh |

**Best For:**
- Initial repository setup
- Complete documentation generation
- Workflow discovery
- Template population

**Not For:**
- Day-to-day development
- Specific domain tasks
- Quick fixes

---

### @core-architect

| Attribute | Value |
|-----------|-------|
| **Category** | Architecture |
| **Complexity** | High |
| **Context Budget** | ~50K tokens (25%) |
| **Primary Use** | System design, state machines |

**Best For:**
- High-level system design
- State machine analysis
- Dependency mapping
- Scalability planning
- Cross-cutting concerns

**Not For:**
- Database-specific work
- API implementation details
- External service integration

---

### @database-ops

| Attribute | Value |
|-----------|-------|
| **Category** | Database |
| **Complexity** | Medium-High |
| **Context Budget** | ~40K tokens (20%) |
| **Primary Use** | Schema, migrations, queries |

**Best For:**
- Schema design and validation
- Migration planning
- Query optimization
- Data integrity
- Database performance

**Not For:**
- API design
- External integrations
- Deployment

---

### @api-developer

| Attribute | Value |
|-----------|-------|
| **Category** | API |
| **Complexity** | Medium |
| **Context Budget** | ~35K tokens (17%) |
| **Primary Use** | Endpoints, contracts |

**Best For:**
- REST API design
- GraphQL schema
- Contract definition
- API documentation
- Endpoint testing strategy

**Not For:**
- Database operations
- External service integration
- Infrastructure

---

### @integration-hub

| Attribute | Value |
|-----------|-------|
| **Category** | Integration |
| **Complexity** | Medium-High |
| **Context Budget** | ~40K tokens (20%) |
| **Primary Use** | External services, webhooks |

**Best For:**
- Third-party API integration
- Webhook handling
- External authentication
- Rate limiting
- Integration error handling

**Not For:**
- Internal API design
- Database work
- Deployment

---

### @deployment-ops

| Attribute | Value |
|-----------|-------|
| **Category** | DevOps |
| **Complexity** | High |
| **Context Budget** | ~45K tokens (22%) |
| **Primary Use** | CI/CD, infrastructure |

**Best For:**
- CI/CD pipeline design
- Infrastructure as code
- Deployment strategies
- Environment management
- Rollback planning

**Not For:**
- Application code
- Database schema
- API design

---

## Capability Overlap

Some tasks benefit from multiple agents working together:

### Architecture + Database
When designing a new feature that involves both system architecture and data persistence:
1. Start with `@core-architect` for high-level design
2. Consult `@database-ops` for schema implications
3. Return to `@core-architect` for integration

### API + Integration
When building an API that wraps external services:
1. Start with `@api-developer` for your API design
2. Consult `@integration-hub` for external service patterns
3. Return to `@api-developer` for implementation

### All Agents for Security Review
Security reviews often require input from multiple perspectives:
- `@core-architect` - System-level security
- `@database-ops` - Data security
- `@api-developer` - API security
- `@integration-hub` - Integration security
- `@deployment-ops` - Infrastructure security

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT QUICK SELECT                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🚀 Setup/Init      → @context-engineer                     │
│  🏗️  Architecture    → @core-architect                       │
│  🗄️  Database        → @database-ops                         │
│  🔌 API             → @api-developer                        │
│  🔗 External        → @integration-hub                      │
│  📦 Deploy          → @deployment-ops                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  When unsure, start with @core-architect for guidance       │
└─────────────────────────────────────────────────────────────┘
```

---

## See Also

- [Agent Details](./../agents/) - Full agent documentation
- [Commands Reference](./../../commands/help.md) - Available commands
- [RPI Workflow](./../../RPI_WORKFLOW_PLAN.md) - Research-Plan-Implement methodology
