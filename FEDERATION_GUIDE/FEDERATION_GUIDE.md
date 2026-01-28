# Federated Context System - Complete Guide

## Overview

The Federated Context System enables an **Architect-to-Builder** workflow where Claude Code (working at the monorepo root) can dispatch tasks and context to local AI assistants (GitHub Copilot, Cline, Google Antigravity, Gemini) working in submodule repositories.

```
MONOREPO (Architect - Claude Code)
    │
    ├─ Designs systems, maintains big picture
    ├─ Knows all workflows, gotchas, integrations
    ├─ Dispatches tasks with full context
    │
    ▼ [Federation Engine]
    │
SUBMODULES (Builders - Copilot/Cline/Antigravity)
    │
    ├─ Execute implementation plans
    ├─ Have auto-configured context files
    └─ Work with focused, relevant information
```

---

## Quick Start

```bash
# Generate context for all submodules, all formats
npm run federate

# Generate for specific submodule
npm run federate -- --target DLKBKD

# Generate specific format only
npm run federate -- --format antigravity

# Dispatch a task to a submodule
npm run federate -- --dispatch --target DLKBKD --task "Add health check endpoint"

# Watch mode (regenerate on changes)
npm run federate -- --watch

# Dry run (preview without writing)
npm run federate -- --dry-run

# Validate configuration
npm run federate -- --validate
```

---

## Commands Reference

### `npm run federate`

Main command to generate context files for AI assistants.

| Flag | Description | Example |
|------|-------------|---------|
| `--target <name>` | Generate for specific submodule only | `--target DLKBKD` |
| `--format <fmt>` | Generate specific format only | `--format copilot` |
| `--dry-run` | Preview output without writing files | `--dry-run` |
| `--validate` | Validate config and templates | `--validate` |
| `--watch` | Watch for changes and regenerate | `--watch` |
| `--verbose` | Show detailed output | `--verbose` |
| `--force` | Regenerate even if unchanged | `--force` |

**Formats available:**
- `copilot` - GitHub Copilot (`.github/copilot-instructions.md`)
- `cline` - Cline extension (`.clinerules`)
- `context-md` - Universal markdown (`CONTEXT.md`)
- `context-txt` - CLI piping (`context.txt`)
- `antigravity` - Google Antigravity (`.agent/` directory with multiple files)

### `npm run federate -- --dispatch`

Dispatch a task to a specific submodule. The task appears in generated context files.

| Flag | Description | Required |
|------|-------------|----------|
| `--target <name>` | Target submodule | Yes |
| `--task <desc>` | Task description | Yes |
| `--priority <p>` | Priority (low/medium/high) | No (default: medium) |
| `--id <id>` | Task ID for tracking | No (auto-generated) |

**Example:**
```bash
npm run federate -- --dispatch --target DLKBKD --task "Add health check endpoint with database and Redis status" --priority medium --id TASK-001
```

### `/federate` Command (Claude Code)

When working in Claude Code, you can use the `/federate` slash command:

```
/federate                     # Generate all
/federate DLKBKD              # Generate for DLKBKD only
/federate --format copilot    # Generate Copilot format only
```

---

## Output Formats

### 1. GitHub Copilot (`.github/copilot-instructions.md`)

**Auto-loaded by:** GitHub Copilot VS Code extension

**Contains:**
- Project identity and tech stack
- Architecture overview with layers
- Key files organized by category
- Critical gotchas with severity levels
- Active task (if dispatched)
- Cross-repo reference format

**Best for:** General coding assistance, completions, chat

### 2. Cline (`.clinerules`)

**Auto-loaded by:** Cline VS Code extension

**Contains:**
- Compact project identity
- Key patterns and constraints
- File structure summary
- Critical gotchas (one-liners)
- Active task specification

**Best for:** Autonomous coding tasks, file operations

### 3. Universal Markdown (`CONTEXT.md`)

**Manual reference** - works with any markdown-aware assistant

**Contains:**
- Full project context in readable format
- Quick start commands
- Architecture diagram
- Workflow summaries with entry points
- Complete gotcha details with fixes

**Best for:** Gemini, ChatGPT, or any assistant via copy/paste

### 4. CLI Text (`context.txt`)

**Usage:** Pipe to CLI tools

```bash
cat context.txt | gh copilot suggest "Add rate limiting to the API"
```

**Contains:**
- Minimal plain text format
- Essential context for CLI assistant
- No markdown formatting

**Best for:** GitHub Copilot CLI, shell-based workflows

### 5. Google Antigravity (`.agent/` directory)

**Auto-loaded by:** Google Antigravity editor

**Structure:**
```
.agent/
├── rules/
│   ├── identity.md       # Project identity, commands, env vars
│   ├── architecture.md   # Layers, key files, integrations
│   ├── gotchas.md        # All gotchas with severity/symptom/fix
│   ├── constraints.md    # Critical constraints list
│   └── workflows.md      # Workflow summaries
├── workflows/
│   ├── run.md            # /run command
│   ├── test.md           # /test command
│   ├── migrate.md        # /migrate command (if applicable)
│   └── implement-*.md    # Per-workflow implementation guides
└── skills/
    ├── debugging.md      # Debugging skill with gotchas
    ├── implementation.md # Implementation skill with patterns
    └── current-task.md   # Active task (if dispatched)
```

**Best for:** Structured AI assistance with specific capabilities

---

## Session Workflows

### Architect Mode (Monorepo Root)

Use this when you need to:
- Design cross-service features
- Understand system-wide impact
- Dispatch tasks to builders
- Update documentation and context

**Session flow:**

```
1. START SESSION at monorepo root
   cd ~/projects/deadlinekiller-reorg-new
   claude

2. UNDERSTAND the task
   - Read relevant workflow files
   - Check KNOWN_GOTCHAS.md for pitfalls
   - Identify affected submodules

3. DESIGN the solution
   - Use /rpi-research for investigation
   - Use /rpi-plan for implementation plan
   - Consider cross-service implications

4. DISPATCH to builders (if delegating)
   npm run federate -- --dispatch --target DLKBKD --task "Your task description"

5. VERIFY federation
   npm run federate -- --verbose

6. END SESSION
   - Commit any documentation changes
   - Note pending tasks for builders
```

**When to use Architect mode:**
- New features spanning multiple services
- Architectural decisions
- Documentation updates
- Task planning and dispatch
- Debugging cross-service issues

### Builder Mode (Submodule)

Use this when you need to:
- Implement a specific feature
- Fix a bug in one service
- Work with focused context

**Session flow:**

```
1. START SESSION in submodule
   cd ~/projects/deadlinekiller-reorg-new/backend/DLKBKD
   code .   # Open in VS Code with Copilot/Cline

2. CHECK for dispatched tasks
   - Copilot: Automatic (reads copilot-instructions.md)
   - Cline: Automatic (reads .clinerules)
   - Antigravity: Automatic (reads .agent/)
   - Manual: Read CONTEXT.md or context.txt

3. IMPLEMENT the task
   - AI assistant has full context
   - Gotchas are pre-loaded
   - Patterns are documented

4. TEST your changes
   - Run tests as documented in context
   - Check for gotcha-related issues

5. COMMIT and notify
   - Commit with descriptive message
   - If part of larger task, update monorepo
```

**When to use Builder mode:**
- Single-service implementation
- Bug fixes with clear scope
- Following a dispatched task
- Routine development work

---

## Session Flow Examples

### Example 1: Production Deployment

**Scenario:** You want to deploy all services to production.

**Mode:** Architect only (deployment is orchestration, not coding)

```
SESSION FLOW: Production Deployment
═══════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│  MONOREPO (Claude Code) - ENTIRE SESSION                        │
└─────────────────────────────────────────────────────────────────┘

1. START SESSION at monorepo root
   ─────────────────────────────────
   cd ~/projects/deadlinekiller-reorg-new
   claude

2. RESEARCH deployment requirements
   ─────────────────────────────────
   Claude Code actions:
   - Read devops/deployments/README.md
   - Check .claude/context/KNOWN_GOTCHAS.md for deployment gotchas
   - Review docker-compose.yml or k8s configs
   - Identify any pending migrations

3. PRE-DEPLOYMENT CHECKS
   ─────────────────────────────────
   # Ensure all submodules are up to date
   git submodule update --remote

   # Check for uncommitted changes in submodules
   git status

   # Run tests across services (if CI not already done)
   cd backend/DLKBKD && pytest tests/ -v && cd ..
   cd core/synap5e && pytest tests/ -v && cd ..

4. DEPLOY (depends on platform)
   ─────────────────────────────────
   Option A - Docker Compose:
   docker-compose -f devops/docker/docker-compose.yml up -d --build

   Option B - ArvanCloud/Chabokan:
   # Follow devops/deployments/arvancloud/README.md
   # Or devops/deployments/chabokan/README.md

   Option C - Manual per-service:
   # Build and push images for each service

5. VERIFY deployment
   ─────────────────────────────────
   # Health checks
   curl https://api.deadlinekiller.com/health
   curl https://ai.deadlinekiller.com/v1/health

   # Test critical user flows
   # - Login
   # - Create job
   # - Chat completion

6. DOCUMENT any issues found
   ─────────────────────────────────
   # If you discovered new gotchas during deployment:
   # 1. Add to .claude/context/KNOWN_GOTCHAS.md
   # 2. Update federation to push to submodules
   npm run federate

7. COMMIT deployment changes (if any)
   ─────────────────────────────────
   git add .
   git commit -m "chore: deployment updates for production release"
   git push

═══════════════════════════════════
NO BUILDER MODE NEEDED
Deployment is orchestration from monorepo level
═══════════════════════════════════
```

---

### Example 2: Multi-Service Feature Development

**Scenario:** Add a new "usage analytics" feature that requires:
- New endpoint in synap5e (core) to track token usage
- New endpoint in DLKBKD (backend) to aggregate and store analytics
- New dashboard page in DLKFTD-1 (frontend) to display analytics

**Mode:** Architect → Builder → Builder → Builder → Architect

```
SESSION FLOW: Multi-Service Feature
════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: ARCHITECT (Monorepo) - Planning & Dispatch            │
└─────────────────────────────────────────────────────────────────┘

1. START SESSION at monorepo root
   ─────────────────────────────────
   cd ~/projects/deadlinekiller-reorg-new
   claude

2. RESEARCH the feature
   ─────────────────────────────────
   /rpi-research

   Claude Code actions:
   - Understand existing token tracking in synap5e
   - Check how DLKBKD stores usage data
   - Review existing dashboard patterns in DLKFTD-1
   - Identify affected workflows and gotchas

3. PLAN the implementation
   ─────────────────────────────────
   /rpi-plan

   Claude Code creates plan:
   - synap5e: Add POST /v1/internal/track-usage endpoint
   - DLKBKD: Add GET/POST /api/v1/analytics endpoints + UsageAnalytics model
   - DLKFTD-1: Add /dashboard/analytics page with charts

4. DISPATCH tasks to each service
   ─────────────────────────────────
   # Core (synap5e) task
   npm run federate -- --dispatch \
     --target synap5e \
     --task "Add POST /v1/internal/track-usage endpoint. Accepts: user_id, tokens_used, model, preset. Returns: 201 with tracking_id. No auth required (internal only)." \
     --priority high \
     --id ANALYTICS-001-CORE

   # Backend (DLKBKD) task
   npm run federate -- --dispatch \
     --target DLKBKD \
     --task "Add analytics feature: 1) UsageAnalytics model (user_id, tokens, model, preset, timestamp), 2) GET /api/v1/analytics (user's usage stats), 3) POST /api/v1/analytics/record (called by synap5e). Include daily/weekly/monthly aggregations." \
     --priority high \
     --id ANALYTICS-001-API

   # Frontend (DLKFTD-1) task
   npm run federate -- --dispatch \
     --target DLKFTD-1 \
     --task "Add analytics dashboard: 1) New page at /dashboard/analytics, 2) Fetch from GET /api/v1/analytics, 3) Display charts for token usage over time, usage by model, usage by preset. Use existing chart library." \
     --priority medium \
     --id ANALYTICS-001-UI

5. GENERATE context files
   ─────────────────────────────────
   npm run federate --verbose

   # Verify tasks are in context
   cat core/synap5e/.agent/skills/current-task.md
   cat backend/DLKBKD/.agent/skills/current-task.md
   cat frontend/DLKFTD-1/.agent/skills/current-task.md


┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: BUILDER - Core (synap5e)                              │
└─────────────────────────────────────────────────────────────────┘

   # Open NEW VS Code window
   cd ~/projects/deadlinekiller-reorg-new/core/synap5e
   code .

   AI Assistant (Copilot/Cline/Antigravity) automatically knows:
   ✓ Current task: "Add POST /v1/internal/track-usage endpoint..."
   ✓ Existing patterns in the codebase
   ✓ Relevant gotchas for synap5e

   Actions:
   1. Implement the endpoint in app/api/v1/routes.py
   2. Add Pydantic schemas for request/response
   3. Write tests in tests/test_analytics.py
   4. Run tests: pytest tests/test_analytics.py -v

   Commit:
   git add .
   git commit -m "feat(analytics): add /v1/internal/track-usage endpoint"
   git push


┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: BUILDER - Backend (DLKBKD)                            │
└─────────────────────────────────────────────────────────────────┘

   # Open NEW VS Code window
   cd ~/projects/deadlinekiller-reorg-new/backend/DLKBKD
   code .

   AI Assistant automatically knows:
   ✓ Current task: "Add analytics feature: 1) UsageAnalytics model..."
   ✓ synap5e endpoint exists (from cross-repo reference)
   ✓ Database patterns and gotchas

   Actions:
   1. Create UsageAnalytics model in app/models.py
   2. Create migration: alembic revision --autogenerate -m "add usage_analytics"
   3. Add endpoints in app/api/v1/analytics.py
   4. Register router in app/main.py
   5. Write tests
   6. Run: alembic upgrade head && pytest tests/test_analytics.py -v

   Commit:
   git add .
   git commit -m "feat(analytics): add usage analytics model and endpoints"
   git push


┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: BUILDER - Frontend (DLKFTD-1)                         │
└─────────────────────────────────────────────────────────────────┘

   # Open NEW VS Code window
   cd ~/projects/deadlinekiller-reorg-new/frontend/DLKFTD-1
   code .

   AI Assistant automatically knows:
   ✓ Current task: "Add analytics dashboard..."
   ✓ Backend endpoint exists (from cross-repo reference)
   ✓ Existing dashboard patterns

   Actions:
   1. Create app/(dashboard)/analytics/page.tsx
   2. Add API client in lib/api/analytics.ts
   3. Create chart components in components/analytics/
   4. Add navigation link to analytics page
   5. Test locally: npm run dev

   Commit:
   git add .
   git commit -m "feat(analytics): add usage analytics dashboard"
   git push


┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: INTEGRATE (Back to Monorepo)                          │
└─────────────────────────────────────────────────────────────────┘

   cd ~/projects/deadlinekiller-reorg-new
   claude

   1. Update submodule references
      ─────────────────────────────────
      git add core/synap5e backend/DLKBKD frontend/DLKFTD-1
      git commit -m "feat: add usage analytics feature across all services"
      git push

   2. Test integration
      ─────────────────────────────────
      docker-compose up -d
      # Test the full flow:
      # - Make chat requests
      # - Check analytics are recorded
      # - View analytics dashboard

   3. Clear dispatched tasks
      ─────────────────────────────────
      # Edit .claude/federation/dispatch.json
      # Set status to "completed" or remove entries

   4. Update documentation
      ─────────────────────────────────
      # Add analytics workflow to .claude/context/workflows/
      # Update WORKFLOW_INDEX.md
      npm run federate  # Push updates to submodules
```

---

### Example 3: Debugging a Cross-Service Issue

**Scenario:** Users report that chat messages sometimes fail with "token validation error" but only on the chat subdomain (DLKFTD-2), not the main site.

**Mode:** Architect (investigate) → Builder (fix) → Architect (verify)

```
SESSION FLOW: Cross-Service Debugging
══════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: ARCHITECT (Monorepo) - Investigation                  │
└─────────────────────────────────────────────────────────────────┘

1. START SESSION at monorepo root
   ─────────────────────────────────
   cd ~/projects/deadlinekiller-reorg-new
   claude

2. UNDERSTAND the issue scope
   ─────────────────────────────────
   Claude Code actions:
   - Check KNOWN_GOTCHAS.md for auth-related issues
     → Found: AUTH-001 "Cookie Domain for Subdomain Sharing"
   - Read authentication workflow
   - Trace the token flow: DLKFTD-2 → DLKBKD → synap5e

3. IDENTIFY the likely cause
   ─────────────────────────────────
   Based on gotchas and workflow analysis:
   - Cookie domain might not be set to ".deadlinekiller.com"
   - Or introspect endpoint response format changed
   - Or DLKFTD-2 is not sending cookies correctly

4. NARROW DOWN to specific service
   ─────────────────────────────────
   Analysis shows the issue is likely in DLKBKD (cookie setting)
   or DLKFTD-2 (cookie sending).

   Check recent commits:
   cd backend/DLKBKD && git log --oneline -10 && cd ..
   cd frontend/DLKFTD-2 && git log --oneline -10 && cd ..

   → Found: Recent DLKBKD commit changed auth.py

5. DISPATCH debugging task
   ─────────────────────────────────
   npm run federate -- --dispatch \
     --target DLKBKD \
     --task "DEBUG: Token validation failing for chat.deadlinekiller.com. Check cookie domain in auth.py - must be '.deadlinekiller.com' (with leading dot). Verify set_cookie calls in login and token refresh. Reference GOTCHA AUTH-001." \
     --priority high \
     --id DEBUG-AUTH-001

   npm run federate --verbose


┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: BUILDER - Backend (DLKBKD)                            │
└─────────────────────────────────────────────────────────────────┘

   cd ~/projects/deadlinekiller-reorg-new/backend/DLKBKD
   code .

   AI Assistant automatically knows:
   ✓ Debug task: "Token validation failing for chat.deadlinekiller.com..."
   ✓ Gotcha AUTH-001 details
   ✓ Relevant files: app/api/v1/auth.py

   Actions:
   1. Open app/api/v1/auth.py
   2. Search for set_cookie calls
   3. Find the bug:
      response.set_cookie(
          "access_token",
          token,
          domain="deadlinekiller.com"  # BUG: Missing leading dot!
      )
   4. Fix:
      response.set_cookie(
          "access_token",
          token,
          domain=".deadlinekiller.com"  # FIXED: Leading dot for subdomains
      )
   5. Check all other set_cookie calls for same issue
   6. Write regression test
   7. Run tests: pytest tests/test_auth.py -v

   Commit:
   git add .
   git commit -m "fix(auth): add leading dot to cookie domain for subdomain sharing

   Fixes token validation errors on chat.deadlinekiller.com.
   Cookie domain must be '.deadlinekiller.com' (with leading dot)
   to be accessible from subdomains.

   Closes DEBUG-AUTH-001"
   git push


┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: ARCHITECT (Monorepo) - Verify & Document              │
└─────────────────────────────────────────────────────────────────┘

   cd ~/projects/deadlinekiller-reorg-new
   claude

   1. Update submodule reference
      ─────────────────────────────────
      git add backend/DLKBKD
      git commit -m "fix: update DLKBKD with cookie domain fix"
      git push

   2. Deploy the fix
      ─────────────────────────────────
      # Follow deployment process
      docker-compose up -d --build dlkbkd

   3. Verify the fix
      ─────────────────────────────────
      # Test on chat.deadlinekiller.com
      # - Login on main site
      # - Navigate to chat subdomain
      # - Verify token is valid

   4. Update gotchas if needed
      ─────────────────────────────────
      # The gotcha already existed but wasn't followed
      # Consider adding automated check or test

   5. Clear debug task
      ─────────────────────────────────
      # Edit .claude/federation/dispatch.json
      # Remove DEBUG-AUTH-001

   6. Regenerate context
      ─────────────────────────────────
      npm run federate
```

---

### Quick Reference: Which Mode When?

```
┌─────────────────────────────────────────────────────────────────┐
│                     DECISION TREE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  What are you doing?                                             │
│  │                                                               │
│  ├─► Planning / Researching / Designing                          │
│  │   └─► ARCHITECT MODE (Monorepo + Claude Code)                │
│  │                                                               │
│  ├─► Deploying / Orchestrating                                   │
│  │   └─► ARCHITECT MODE (Monorepo + Claude Code)                │
│  │                                                               │
│  ├─► Debugging (unknown cause)                                   │
│  │   └─► ARCHITECT MODE first (investigate)                     │
│  │       └─► Then BUILDER MODE (fix specific service)           │
│  │                                                               │
│  ├─► Implementing in ONE service                                 │
│  │   └─► BUILDER MODE (Submodule + Copilot/Cline)               │
│  │                                                               │
│  ├─► Implementing across MULTIPLE services                       │
│  │   └─► ARCHITECT MODE (plan & dispatch)                       │
│  │       └─► BUILDER MODE (each service)                        │
│  │           └─► ARCHITECT MODE (integrate)                     │
│  │                                                               │
│  └─► Updating documentation / gotchas                            │
│      └─► ARCHITECT MODE (Monorepo + Claude Code)                │
│          └─► Run `npm run federate` to push changes             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration

### Main Config (`.claude/federation/config.json`)

```json
{
  "submodules": {
    "DLKBKD": {
      "path": "backend/DLKBKD",
      "outputs": {
        "copilot": { "enabled": true, "path": ".github/copilot-instructions.md" },
        "cline": { "enabled": true, "path": ".clinerules" },
        "context-md": { "enabled": true, "path": "CONTEXT.md" },
        "context-txt": { "enabled": true, "path": "context.txt" },
        "antigravity": { "enabled": true, "path": ".agent/", "multi_file": true }
      }
    }
  },
  "token_budgets": {
    "copilot": 8000,
    "cline": 4000,
    "context-md": 15000,
    "context-txt": 3000,
    "antigravity": 12000
  }
}
```

### Registry Files (`.claude/federation/registry/*.json`)

Each submodule has a registry file defining:
- Which workflows are relevant
- Which gotchas apply
- Integration points
- Key files and layers

### Dispatch File (`.claude/federation/dispatch.json`)

Active task specifications:

```json
{
  "DLKBKD": {
    "id": "TASK-001",
    "description": "Add health check endpoint with database and Redis status",
    "priority": "medium",
    "status": "pending",
    "dispatched_at": "2026-01-28T00:00:00Z"
  }
}
```

### Defaults (`.claude/federation/defaults.json`)

Global defaults applied to all submodules:

```json
{
  "token_budgets": {
    "copilot": 8000,
    "cline": 4000,
    "context-md": 15000,
    "context-txt": 3000,
    "antigravity": 12000
  },
  "include_patterns": ["**/*.md"],
  "exclude_patterns": ["**/node_modules/**"]
}
```

---

## Path Translation

The federation engine automatically translates paths:

| Monorepo Path | Local Path (in DLKBKD) |
|---------------|------------------------|
| `backend/DLKBKD/app/main.py` | `app/main.py` |
| `core/synap5e/app/routes.py` | `[EXTERNAL:synap5e] app/routes.py` |

External references use `[EXTERNAL:repo]` prefix to indicate cross-repo dependencies.

---

## Customization

### Adding a New Submodule

1. Add entry to `.claude/federation/config.json`:
```json
"new-service": {
  "path": "services/new-service",
  "outputs": { ... }
}
```

2. Create registry file `.claude/federation/registry/new-service.json`:
```json
{
  "workflows": ["relevant-workflow-1", "relevant-workflow-2"],
  "gotchas": ["GOTCHA-001", "GOTCHA-002"],
  "key_files": { ... }
}
```

3. Run federation:
```bash
npm run federate -- --target new-service --verbose
```

### Creating Custom Templates

Templates use Handlebars syntax. Available helpers:

| Helper | Description | Example |
|--------|-------------|---------|
| `{{#if condition}}` | Conditional | `{{#if activeTask}}...{{/if}}` |
| `{{#each array}}` | Loop | `{{#each gotchas}}...{{/each}}` |
| `{{#unless condition}}` | Negative conditional | `{{#unless empty}}...{{/unless}}` |
| `{{fileStart "path"}}` | Start multi-file section | `{{fileStart "rules/identity.md"}}` |
| `{{fileEnd}}` | End multi-file section | `{{fileEnd}}` |
| `{{slugify string}}` | URL-safe string | `{{slugify workflow.name}}` |
| `{{concat a b c}}` | Join strings | `{{concat "implement-" name ".md"}}` |
| `{{groupBy array prop}}` | Group by property | `{{#each (groupBy gotchas "category")}}` |
| `{{> partialName}}` | Include partial | `{{> header}}` |

### Template Context

Templates receive this context object:

```javascript
{
  submodule: {
    name: "DLKBKD",
    path: "backend/DLKBKD",
    identity: { ... },
    architecture: { ... }
  },
  workflows: [ ... ],
  gotchas: [ ... ],
  integrations: [ ... ],
  keyFiles: { ... },
  activeTask: { ... } | null,
  generatedAt: "2026-01-28T00:00:00Z",
  sourceRef: "deadlinekiller-reorg@abc123"
}
```

---

## Troubleshooting

### Files not updating

```bash
# Force regeneration
npm run federate -- --force

# Clear checksums
rm .claude/federation/.checksums.json
npm run federate
```

### Validation errors

```bash
# Validate configuration
npm run federate -- --validate

# Check specific submodule
npm run federate -- --validate --target DLKBKD
```

### Template errors

```bash
# Dry run with verbose output
npm run federate -- --dry-run --verbose

# Check template syntax
node -e "require('handlebars').compile(require('fs').readFileSync('.claude/federation/templates/copilot-instructions.md.hbs', 'utf8'))"
```

### Submodule not found

```bash
# Ensure submodule is initialized
git submodule update --init --recursive

# Check path in config.json matches actual path
ls -la backend/DLKBKD
```

---

## Best Practices

### 1. Keep Context Fresh

Run federation after:
- Adding new gotchas
- Updating workflows
- Changing architecture
- Before starting builder sessions

```bash
# Quick refresh
npm run federate
```

### 2. Use Dispatch for Handoffs

When delegating work:

```bash
# Be specific in task descriptions
npm run federate -- --dispatch \
  --target DLKBKD \
  --task "Add GET /health endpoint that returns JSON with: db_connected (bool), redis_connected (bool), version (string from package.json)" \
  --priority high \
  --id HEALTH-001
```

### 3. Verify Before Building

Before starting builder session:

```bash
# Check what AI assistants will see
cat backend/DLKBKD/CONTEXT.md | head -100

# Or for Antigravity
cat backend/DLKBKD/.agent/skills/current-task.md
```

### 4. Clear Tasks When Done

After completing dispatched tasks:

```bash
# Edit dispatch.json to remove completed tasks
# Or set status to "completed"
```

### 5. Use Watch Mode During Development

When actively updating documentation:

```bash
npm run federate -- --watch
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MONOREPO (deadlinekiller-reorg)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  .claude/                                                                    │
│  ├── context/                    ◄── Source of truth                        │
│  │   ├── WORKFLOW_INDEX.md           - All workflows                        │
│  │   ├── KNOWN_GOTCHAS.md            - All gotchas                          │
│  │   ├── ARCHITECTURE_SNAPSHOT.md    - System design                        │
│  │   └── workflows/*.md              - Detailed workflows                   │
│  │                                                                           │
│  ├── federation/                 ◄── Federation config                      │
│  │   ├── config.json                 - Submodule definitions                │
│  │   ├── dispatch.json               - Active tasks                         │
│  │   ├── registry/*.json             - Per-submodule filters                │
│  │   └── templates/*.hbs             - Output templates                     │
│  │                                                                           │
│  └── automation/generators/                                                  │
│      └── context-federator.js    ◄── Federation engine                      │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                              │                                               │
│                              ▼ npm run federate                              │
│                                                                              │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│   DLKBKD     │   synap5e    │   DLKFTD-1   │   DLKFTD-2   │                │
├──────────────┼──────────────┼──────────────┼──────────────┤                │
│              │              │              │              │                │
│ .github/     │ .github/     │ .github/     │ .github/     │ ◄─ Copilot     │
│  copilot-    │  copilot-    │  copilot-    │  copilot-    │                │
│  instruc...  │  instruc...  │  instruc...  │  instruc...  │                │
│              │              │              │              │                │
│ .clinerules  │ .clinerules  │ .clinerules  │ .clinerules  │ ◄─ Cline       │
│              │              │              │              │                │
│ CONTEXT.md   │ CONTEXT.md   │ CONTEXT.md   │ CONTEXT.md   │ ◄─ Universal   │
│              │              │              │              │                │
│ context.txt  │ context.txt  │ context.txt  │ context.txt  │ ◄─ CLI         │
│              │              │              │              │                │
│ .agent/      │ .agent/      │ .agent/      │ .agent/      │ ◄─ Antigravity │
│  ├─ rules/   │  ├─ rules/   │  ├─ rules/   │  ├─ rules/   │                │
│  ├─ work...  │  ├─ work...  │  ├─ work...  │  ├─ work...  │                │
│  └─ skills/  │  └─ skills/  │  └─ skills/  │  └─ skills/  │                │
│              │              │              │              │                │
└──────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-27 | Initial release with 4 output formats |
| 1.1 | 2026-01-28 | Added Google Antigravity multi-file support |

---

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Main project context
- [RPI_WORKFLOW_PLAN.md](./RPI_WORKFLOW_PLAN.md) - Research-Plan-Implement workflow
- [context/WORKFLOW_INDEX.md](./context/WORKFLOW_INDEX.md) - All workflow documentation
- [context/KNOWN_GOTCHAS.md](./context/KNOWN_GOTCHAS.md) - Known issues and fixes
- [commands/federate.md](./commands/federate.md) - Slash command documentation
