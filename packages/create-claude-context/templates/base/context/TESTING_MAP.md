# Testing Map

> Maps source files to their corresponding tests.
> **Last Updated:** {{LAST_UPDATED}}

---

## Overview

This document provides a mapping between source files and their test coverage, helping developers find and update tests when modifying code.

---

## Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/            # End-to-end tests
└── fixtures/       # Test data and mocks
```

---

## Coverage Summary

| Category | Files | Covered | Coverage |
|----------|-------|---------|----------|
| Unit | {{UNIT_COUNT}} | {{UNIT_COVERED}} | {{UNIT_PCT}}% |
| Integration | {{INT_COUNT}} | {{INT_COVERED}} | {{INT_PCT}}% |
| E2E | {{E2E_COUNT}} | {{E2E_COVERED}} | {{E2E_PCT}}% |

---

## File-to-Test Mapping

### Core Application

| Source File | Test File | Coverage |
|-------------|-----------|----------|
| `src/{{file}}.{{ext}}` | `tests/unit/{{file}}.test.{{ext}}` | {{PCT}}% |

### Services

| Source File | Test File | Coverage |
|-------------|-----------|----------|
| `src/services/{{service}}.{{ext}}` | `tests/unit/services/{{service}}.test.{{ext}}` | {{PCT}}% |

### Utilities

| Source File | Test File | Coverage |
|-------------|-----------|----------|
| `src/utils/{{util}}.{{ext}}` | `tests/unit/utils/{{util}}.test.{{ext}}` | {{PCT}}% |

---

## Critical Paths

These files require comprehensive test coverage:

| Path | Reason | Minimum Coverage |
|------|--------|------------------|
| `src/auth/` | Security-critical | 90% |
| `src/payment/` | Financial transactions | 95% |
| `src/api/` | Public interface | 85% |

---

## Test Commands

```bash
# Run all tests
{{TEST_COMMAND}}

# Run with coverage
{{COVERAGE_COMMAND}}

# Run specific test
{{SPECIFIC_TEST_COMMAND}}
```

---

## Maintenance

Update this file when:
- New source files are added
- New test files are created
- Coverage thresholds change
- Test structure changes

---

*Template file - populate with actual test coverage data*
