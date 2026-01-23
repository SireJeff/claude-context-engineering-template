# Team Collaboration

Configuration and setup for team-based Claude Code collaboration.

## Overview

This directory contains team configuration that enables:
- Multi-user collaboration on Claude Code sessions
- Role-based access control
- Session handoffs between team members
- Shared knowledge synchronization
- Team notifications and integrations

## Quick Setup

### 1. Configure Team

Edit `config.json` and replace placeholders:

```json
{
  "team": {
    "name": "Your Team Name",
    "organization": "Your Organization"
  }
}
```

### 2. Add Team Members

Add members to the `members` array in `config.json`:

```json
{
  "members": [
    {
      "id": "unique-id",
      "name": "Developer Name",
      "role": "developer",
      "email": "dev@example.com",
      "permissions": ["read", "write", "execute"],
      "active": true
    }
  ]
}
```

### 3. Assign Roles

Available roles (defined in `roles.json`):

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `team-lead` | Full access, manages team | All permissions |
| `senior-developer` | Development + approvals | read, write, execute, approve |
| `developer` | Standard development | read, write, execute |
| `reviewer` | Code review focus | read, approve |
| `observer` | Read-only access | read |

### 4. Configure Integrations (Optional)

#### Slack Notifications

```json
{
  "notifications": {
    "enabled": true,
    "channels": {
      "slack": {
        "webhook_url": "https://hooks.slack.com/...",
        "channel": "#claude-notifications"
      }
    }
  }
}
```

#### Jira Integration

```json
{
  "integrations": {
    "jira": {
      "enabled": true,
      "project_key": "PROJ",
      "api_url": "https://your-domain.atlassian.net"
    }
  }
}
```

## Files

| File | Purpose |
|------|---------|
| `config.json` | Team settings, members, integrations |
| `roles.json` | Role definitions and permissions |

## Usage

### Session Handoffs

When ending a session, create a handoff document:

```
/collab handoff
```

This generates a session summary in `.claude/knowledge/sessions/` for the next team member.

### Sync Shared Knowledge

Synchronize team knowledge base:

```
/collab sync
```

### Check Team Status

View team configuration and active sessions:

```
/collab status
```

## Policies

Configure team policies in `config.json`:

```json
{
  "policies": {
    "code_review_required": true,
    "documentation_update_required": true,
    "test_coverage_minimum": 80,
    "max_file_changes_per_session": 50
  }
}
```

## Security Notes

- `config.json` may contain sensitive webhooks - consider gitignoring
- Use environment variables for API tokens
- Review member permissions regularly
- Session handoffs may contain context - handle appropriately

## Troubleshooting

### Member not recognized

Ensure the member entry in `config.json` has:
- Unique `id`
- Valid `role` matching `roles.json`
- `active: true`

### Notifications not sending

1. Verify webhook URL is correct
2. Check `notifications.enabled` is `true`
3. Ensure event type is enabled in `notifications.events`

### Permission denied

1. Check member's role in `config.json`
2. Verify role has required permission in `roles.json`
3. Ensure member is `active: true`
