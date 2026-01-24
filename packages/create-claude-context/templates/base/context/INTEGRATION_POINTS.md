# Integration Points

> Documents external systems, APIs, and integration boundaries.
> **Last Updated:** {{LAST_UPDATED}}

---

## Overview

This document maps all integration points where our system connects with external services, APIs, or systems.

---

## External APIs

### {{API_NAME}}

| Property | Value |
|----------|-------|
| **Base URL** | `{{API_URL}}` |
| **Authentication** | {{AUTH_METHOD}} |
| **Rate Limits** | {{RATE_LIMITS}} |
| **Documentation** | {{DOCS_URL}} |

**Used By:**
- `src/services/{{service}}.{{ext}}`

**Gotchas:**
- {{GOTCHA_1}}

---

## Databases

### {{DATABASE_NAME}}

| Property | Value |
|----------|-------|
| **Type** | {{DB_TYPE}} |
| **Connection** | {{CONNECTION_STRING}} |
| **Migrations** | `{{MIGRATIONS_PATH}}` |

---

## Message Queues

### {{QUEUE_NAME}}

| Property | Value |
|----------|-------|
| **Type** | {{QUEUE_TYPE}} |
| **Topics** | {{TOPICS}} |

---

## Third-Party Services

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| {{SERVICE}} | {{PURPOSE}} | `{{CONFIG_PATH}}` |

---

## Internal Boundaries

### Microservice Communication

| Service A | Service B | Protocol | Notes |
|-----------|-----------|----------|-------|
| {{SVC_A}} | {{SVC_B}} | {{PROTOCOL}} | {{NOTES}} |

---

## Authentication Flows

```
{{AUTH_FLOW_DIAGRAM}}
```

---

## Maintenance

Update this file when:
- New integrations are added
- API endpoints change
- Authentication methods update
- New services are introduced

---

*Template file - populate with actual integration data*
