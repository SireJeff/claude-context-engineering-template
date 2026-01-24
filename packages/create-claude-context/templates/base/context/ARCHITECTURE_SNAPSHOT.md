# Architecture Snapshot - {{PROJECT_NAME}}

**Purpose:** High-level system map for rapid orientation
**Load:** When starting a new session or onboarding
**Size:** ~10k tokens (5% of 200k budget)
**Last Updated:** {{DATE}}

---

## System Overview

{{SYSTEM_OVERVIEW_DIAGRAM}}

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | {{FRONTEND_TECH}} | {{FRONTEND_PURPOSE}} |
| **Backend** | {{BACKEND_TECH}} | {{BACKEND_PURPOSE}} |
| **Database** | {{DATABASE_TECH}} | {{DATABASE_PURPOSE}} |
| **Cache** | {{CACHE_TECH}} | {{CACHE_PURPOSE}} |
| **Queue** | {{QUEUE_TECH}} | {{QUEUE_PURPOSE}} |

---

## Core Components

### Component 1: {{COMPONENT_1_NAME}}

**Purpose:** {{COMPONENT_1_PURPOSE}}
**Key Files:**
- `{{FILE_1}}` - {{FILE_1_PURPOSE}}
- `{{FILE_2}}` - {{FILE_2_PURPOSE}}

**Related Workflows:**
- [workflow_1.md](./workflows/workflow_1.md)

---

### Component 2: {{COMPONENT_2_NAME}}

[Same structure...]

---

## Data Flow

```
{{DATA_FLOW_DIAGRAM}}
```

---

## Database Schema Summary

**Total Tables:** {{TABLE_COUNT}}

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `{{TABLE_1}}` | {{TABLE_1_PURPOSE}} | FK to {{RELATED_TABLE}} |
| `{{TABLE_2}}` | {{TABLE_2_PURPOSE}} | FK to {{RELATED_TABLE}} |

**Schema Details:** {{MODELS_FILE}}

---

## External Integrations

| Integration | Type | Purpose | Docs |
|-------------|------|---------|------|
| {{INTEGRATION_1}} | API | {{PURPOSE_1}} | {{DOCS_LINK}} |
| {{INTEGRATION_2}} | API | {{PURPOSE_2}} | {{DOCS_LINK}} |

---

## Key Architectural Decisions

### Decision 1: {{DECISION_1_TITLE}}

**Choice:** {{WHAT_WAS_CHOSEN}}
**Why:** {{RATIONALE}}
**Trade-offs:** {{TRADE_OFFS}}

---

### Decision 2: {{DECISION_2_TITLE}}

[Same structure...]

---

## Directory Structure

```
{{PROJECT_ROOT}}/
├── {{DIR_1}}/              # {{DIR_1_PURPOSE}}
│   ├── {{SUBDIR_1}}/       # {{SUBDIR_1_PURPOSE}}
│   └── {{SUBDIR_2}}/       # {{SUBDIR_2_PURPOSE}}
├── {{DIR_2}}/              # {{DIR_2_PURPOSE}}
├── {{DIR_3}}/              # {{DIR_3_PURPOSE}}
└── {{DIR_4}}/              # {{DIR_4_PURPOSE}}
```

---

## Security Model

### Authentication
{{AUTHENTICATION_DESCRIPTION}}

### Authorization
{{AUTHORIZATION_DESCRIPTION}}

### Data Protection
{{DATA_PROTECTION_DESCRIPTION}}

---

## Performance Characteristics

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | {{TARGET_1}} | {{CURRENT_1}} |
| Throughput | {{TARGET_2}} | {{CURRENT_2}} |
| Availability | {{TARGET_3}} | {{CURRENT_3}} |

---

## Deployment Architecture

```
{{DEPLOYMENT_DIAGRAM}}
```

**Environments:**
| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | {{DEV_URL}} | Local development |
| Staging | {{STAGING_URL}} | Pre-production testing |
| Production | {{PROD_URL}} | Live system |

---

## See Also

- **Detailed workflows:** [WORKFLOW_INDEX.md](./WORKFLOW_INDEX.md)
- **File responsibilities:** [FILE_OWNERSHIP.md](./FILE_OWNERSHIP.md)
- **External APIs:** [INTEGRATION_POINTS.md](./INTEGRATION_POINTS.md)
- **Lessons learned:** [KNOWN_GOTCHAS.md](./KNOWN_GOTCHAS.md)

---

**Version:** 1.0
**Verified Against Commit:** {{COMMIT_HASH}}
