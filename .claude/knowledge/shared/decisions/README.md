# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting significant technical decisions.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-adopt-context-engineering.md) | Adopt Context Engineering Template | accepted | {{DATE}} |

## Creating a New ADR

1. Copy `TEMPLATE.md` to `NNNN-descriptive-title.md`
2. Use the next sequential number
3. Fill in all sections
4. Set status to `proposed`
5. Request review from team
6. Update status to `accepted` or `rejected` after review

## ADR Lifecycle

```
proposed → accepted → deprecated
              ↓
          rejected
```

## Naming Convention

`NNNN-lowercase-hyphenated-title.md`

- NNNN: 4-digit sequential number
- Use lowercase letters
- Separate words with hyphens
- Keep title concise but descriptive

## When to Write an ADR

Write an ADR when:
- Choosing between significant alternatives
- Making irreversible or costly-to-reverse decisions
- Establishing patterns the team should follow
- Adopting new technologies or frameworks
- Changing architectural direction

Don't write an ADR for:
- Minor implementation details
- Obvious choices with no alternatives
- Temporary decisions
