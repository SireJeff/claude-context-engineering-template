# Shared Knowledge Base

Central repository for team knowledge, decisions, patterns, and session handoffs.

## Directory Structure

```
knowledge/
├── shared/           # Team-shared knowledge
│   ├── decisions/    # Architecture Decision Records (ADRs)
│   └── patterns/     # Reusable code patterns
├── sessions/         # Session handoff documents
└── README.md         # This file
```

## Shared Knowledge

### Architecture Decision Records (ADRs)

Located in `shared/decisions/`, ADRs document significant architectural decisions.

**Creating an ADR:**
1. Copy `shared/decisions/TEMPLATE.md`
2. Name it `NNNN-descriptive-title.md` (e.g., `0001-use-postgresql.md`)
3. Fill in all sections
4. Submit for team review

**ADR Statuses:**
- `proposed` - Under discussion
- `accepted` - Approved and in effect
- `deprecated` - Superseded by another ADR
- `rejected` - Not approved

### Reusable Patterns

Located in `shared/patterns/`, patterns document proven solutions to common problems.

**Pattern Categories:**
- `api/` - API design patterns
- `data/` - Data handling patterns
- `ui/` - User interface patterns
- `testing/` - Testing patterns
- `security/` - Security patterns

## Session Handoffs

Located in `sessions/`, handoff documents enable continuity between Claude Code sessions.

**Handoff Document Contents:**
- Session summary
- Work completed
- Work in progress
- Blockers and issues
- Next steps
- Relevant context

**Creating a Handoff:**
```
/collab handoff
```

**Naming Convention:**
`YYYY-MM-DD-HH-MM-member-id.md`

## Usage

### Adding Knowledge

1. Create document in appropriate directory
2. Follow the template structure
3. Run `/collab sync` to notify team

### Finding Knowledge

1. Check category directories for relevant content
2. Use grep/search for specific terms
3. Review recent session handoffs for context

### Updating Knowledge

1. Edit the document
2. Update the `last_updated` metadata
3. Add to revision history if significant

## Retention Policy

| Content Type | Retention |
|--------------|-----------|
| ADRs | Permanent (archive deprecated) |
| Patterns | Permanent (version updates) |
| Session Handoffs | 90 days (archive important ones) |

## Best Practices

1. **Keep it Current** - Update knowledge when code changes
2. **Be Specific** - Include concrete examples
3. **Link to Code** - Reference file:line where applicable
4. **Review Regularly** - Prune outdated content monthly
