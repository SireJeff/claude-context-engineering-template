---
name: validate-all
version: "1.0.0"
description: "Complete validation suite for the codebase"
category: "validation"
context_budget_estimate: "40K tokens"
typical_context_usage: "20%"
prerequisites: []
outputs:
  - "Validation report with PASS/FAIL per category"
  - "Documentation accuracy metrics"
  - "Test results summary"
  - "Overall READY/NOT READY status"
next_commands: []
related_agents: ["context-engineer", "deployment-ops"]
examples:
  - command: "/validate-all"
    description: "Run complete validation before deployment"
exit_criteria:
  - "Documentation validation complete"
  - "Test validation complete"
  - "Code quality checks complete"
  - "Configuration validation complete"
  - "Overall status determined"
---

# Complete Validation Suite

**Purpose:** Run all validation checks before deployment

**Syntax:** `/validate-all`

---

## Validation Checks

### 1. Documentation Validation
- All workflows have valid line numbers
- All markdown links resolve
- CODE_TO_WORKFLOW_MAP is current

### 2. Test Validation
- All unit tests pass
- All integration tests pass
- Coverage meets threshold

### 3. Code Quality
- No linting errors
- Type checking passes (if applicable)
- No security vulnerabilities

### 4. Configuration Validation
- All required environment variables defined
- Configuration files valid

---

## Output Format

```
VALIDATION REPORT

Documentation:  ✅ PASS / ❌ FAIL
Tests:          ✅ PASS / ❌ FAIL
Code Quality:   ✅ PASS / ❌ FAIL
Configuration:  ✅ PASS / ❌ FAIL

Overall: READY / NOT READY
```

---

## When to Run

- Before creating PR
- Before deploying
- After major refactoring
