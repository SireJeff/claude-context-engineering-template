# Known Gotchas - {{PROJECT_NAME}}

**Purpose:** Document lessons learned, common pitfalls, and their solutions
**Use:** Before implementing features or debugging issues
**Size:** ~15k tokens (grows over time)
**Last Updated:** {{DATE}}

---

## How to Use This File

1. **Before implementing:** Search for related gotchas
2. **After fixing bugs:** Add new gotchas
3. **During code review:** Reference relevant gotchas
4. **Quarterly:** Review and archive resolved gotchas

---

## Gotcha Categories

1. [Database](#database-gotchas)
2. [API](#api-gotchas)
3. [Authentication](#authentication-gotchas)
4. [External Services](#external-services-gotchas)
5. [Testing](#testing-gotchas)
6. [Deployment](#deployment-gotchas)

---

## Database Gotchas

### GOTCHA-DB-001: {{GOTCHA_TITLE}}

**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Discovered:** {{DATE}}
**Workflow Impact:** [workflow_1.md](./workflows/workflow_1.md)

**Symptom:**
{{WHAT_GOES_WRONG}}

**Root Cause:**
{{WHY_IT_HAPPENS}}

**Fix:**
```
{{CODE_OR_STEPS_TO_FIX}}
```

**Prevention:**
- {{HOW_TO_AVOID_IN_FUTURE}}

---

### GOTCHA-DB-002: {{GOTCHA_TITLE}}

[Same structure...]

---

## API Gotchas

### GOTCHA-API-001: {{GOTCHA_TITLE}}

**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Discovered:** {{DATE}}
**Workflow Impact:** [workflow_2.md](./workflows/workflow_2.md)

**Symptom:**
{{WHAT_GOES_WRONG}}

**Root Cause:**
{{WHY_IT_HAPPENS}}

**Fix:**
```
{{CODE_OR_STEPS_TO_FIX}}
```

**Prevention:**
- {{HOW_TO_AVOID_IN_FUTURE}}

---

## Authentication Gotchas

### GOTCHA-AUTH-001: {{GOTCHA_TITLE}}

[Same structure...]

---

## External Services Gotchas

### GOTCHA-EXT-001: {{GOTCHA_TITLE}}

[Same structure...]

---

## Testing Gotchas

### GOTCHA-TEST-001: {{GOTCHA_TITLE}}

[Same structure...]

---

## Deployment Gotchas

### GOTCHA-DEPLOY-001: {{GOTCHA_TITLE}}

[Same structure...]

---

## Quick Reference Table

| ID | Title | Severity | Workflow |
|----|-------|----------|----------|
| DB-001 | {{TITLE}} | {{SEVERITY}} | workflow_1 |
| API-001 | {{TITLE}} | {{SEVERITY}} | workflow_2 |
| AUTH-001 | {{TITLE}} | {{SEVERITY}} | workflow_3 |

---

## Adding New Gotchas

### Template

```markdown
### GOTCHA-[CATEGORY]-[NUMBER]: [Title]

**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Discovered:** YYYY-MM-DD
**Workflow Impact:** [workflow_name.md](./workflows/workflow_name.md)

**Symptom:**
[What the user/developer observes going wrong]

**Root Cause:**
[Technical explanation of why it happens]

**Fix:**
```
[Code or steps to fix]
```

**Prevention:**
- [How to avoid this in future code]
- [What patterns to use instead]
```

### Categories

- **DB**: Database, migrations, queries
- **API**: REST endpoints, request/response
- **AUTH**: Authentication, authorization, sessions
- **EXT**: External services, APIs, integrations
- **TEST**: Testing, mocking, fixtures
- **DEPLOY**: Deployment, CI/CD, infrastructure

### Severity Levels

| Level | Definition |
|-------|------------|
| CRITICAL | Production down, data loss possible |
| HIGH | Feature broken, workaround difficult |
| MEDIUM | Feature degraded, workaround exists |
| LOW | Minor inconvenience, edge case |

---

## Archived Gotchas

Gotchas that are fully resolved and no longer relevant:

| ID | Title | Resolved Date | Resolution |
|----|-------|---------------|------------|
| - | - | - | - |

---

## Statistics

- **Total Active Gotchas:** {{TOTAL_COUNT}}
- **Critical:** {{CRITICAL_COUNT}}
- **High:** {{HIGH_COUNT}}
- **Medium:** {{MEDIUM_COUNT}}
- **Low:** {{LOW_COUNT}}
- **Last Added:** {{LAST_ADDED_DATE}}

---

**Version:** 1.0
**Maintainer:** {{MAINTAINER}}
