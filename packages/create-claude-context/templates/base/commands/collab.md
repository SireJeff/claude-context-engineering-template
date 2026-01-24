---
name: collab
version: "1.0.0"
displayName: "Team Collaboration"
description: "Team collaboration tools for handoffs, knowledge sync, and status"
category: "team"
complexity: "low"
context_budget: "~10K tokens"
typical_context_usage: "5%"
prerequisites:
  - ".claude/team/config.json exists"
  - "Team configuration completed"
outputs:
  - "Session handoff document (handoff)"
  - "Sync status report (sync)"
  - "Team status overview (status)"
related_agents: []
examples:
  - command: "/collab handoff"
    description: "Create session handoff for next team member"
  - command: "/collab sync"
    description: "Synchronize shared knowledge base"
  - command: "/collab status"
    description: "View team configuration and status"
---

# /collab - Team Collaboration Command

Manage team collaboration features including session handoffs, knowledge synchronization, and team status.

## Subcommands

### `/collab handoff`

Create a session handoff document for the next team member.

**Workflow:**
1. Collect session information:
   - Files modified in session
   - Git status and recent commits
   - Open tasks and blockers
2. Prompt for additional context:
   - Work in progress description
   - Blockers encountered
   - Recommended next steps
3. Generate handoff document from template
4. Save to `.claude/knowledge/sessions/`
5. Display handoff summary

**Output:** `.claude/knowledge/sessions/YYYY-MM-DD-HH-MM-{member-id}.md`

### `/collab sync`

Synchronize and validate the shared knowledge base.

**Workflow:**
1. Scan knowledge directories:
   - `shared/decisions/` - ADRs
   - `shared/patterns/` - Patterns
   - `sessions/` - Recent handoffs
2. Validate document structure
3. Check for stale content (>30 days unchanged)
4. Report sync status:
   - Documents found
   - Validation issues
   - Stale content warnings
5. Optionally notify team of updates

**Output:** Sync status report to console

### `/collab status`

Display team configuration and current status.

**Workflow:**
1. Load team configuration from `.claude/team/config.json`
2. Display:
   - Team name and organization
   - Active members and roles
   - Current policies
   - Integration status
3. Check for configuration issues
4. Show recent activity summary

**Output:** Team status report to console

## Usage Examples

### End of Session Handoff

```
User: /collab handoff

Claude: Creating session handoff...

## Session Summary
Please describe what you worked on this session:

User: Implemented user authentication flow, added login/logout endpoints

Claude: ## Work In Progress
Any incomplete work to note?

User: JWT refresh token logic needs testing

Claude: ## Blockers
Any blockers for the next person?

User: None

Claude: ## Next Steps
Recommended priorities for next session?

User: 1. Test refresh tokens 2. Add password reset

Claude: Session handoff created: .claude/knowledge/sessions/2024-01-15-16-30-dev-1.md

### Handoff Summary
- Session: 2024-01-15 16:30
- Files Modified: 8
- Commits: 3
- Status: Ready for handoff

The next team member can review this handoff to continue your work.
```

### Sync Knowledge Base

```
User: /collab sync

Claude: Synchronizing knowledge base...

### Scan Results
- ADRs: 3 documents
- Patterns: 5 documents
- Sessions: 12 handoffs

### Validation
✓ All ADRs have required sections
✓ All patterns follow template
⚠ 2 session handoffs > 30 days old

### Recommendations
- Archive or delete old handoffs:
  - sessions/2023-12-01-14-00-dev-2.md
  - sessions/2023-12-05-09-15-dev-1.md

Knowledge base sync complete.
```

### Check Team Status

```
User: /collab status

Claude: ## Team Status

### Configuration
- Team: Engineering Team
- Organization: Acme Corp
- Version: 1.0.0

### Members (3 active)
| Name | Role | Status |
|------|------|--------|
| Alice | team-lead | active |
| Bob | developer | active |
| Carol | developer | active |

### Policies
- Code review required: Yes
- Documentation updates required: Yes
- Test coverage minimum: 80%

### Integrations
- Slack: Configured ✓
- Jira: Not configured
- Confluence: Not configured

### Recent Activity
- Last handoff: 2024-01-15 by Bob
- Knowledge updates: 2 this week
```

## Configuration

Requires `.claude/team/config.json` to be configured. See `.claude/team/README.md` for setup instructions.

## Related

- [Team Configuration](./../team/README.md)
- [Knowledge Base](./../knowledge/README.md)
- [Session Handoff Template](./../knowledge/sessions/TEMPLATE.md)
