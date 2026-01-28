# Universal AI Context Engineering Template

![npm](https://img.shields.io/npm/v/create-ai-context)
![npm downloads](https://img.shields.io/npm/dm/create-ai-context)
![GitHub Stars](https://img.shields.io/github/stars/SireJeff/claude-context-engineering-template?style=social)
![GitHub License](https://img.shields.io/github/license/SireJeff/claude-context-engineering-template)

A self-sustaining template for organizing your codebase documentation so AI coding assistants can navigate it efficiently. Supports **Claude Code**, **GitHub Copilot**, **Cline**, and **Antigravity**. Includes **automatic codebase analysis**, workflow generation, and multi-tool output.

---

## Quick Start

```bash
# One command to set up everything (v2.0)
npx create-ai-context

# Or with options
npx create-ai-context --yes              # Accept defaults
npx create-ai-context --ai copilot       # Generate for GitHub Copilot only
npx create-ai-context --ai cline         # Generate for Cline only
npx create-ai-context --ai all           # Generate for all AI tools (default)
npx create-ai-context --static           # Force static-only analysis
npx create-ai-context --force-ai         # Require Claude Code session

# Legacy command (still works)
npx create-claude-context
```

### AI Tools Supported

| Tool | Output Generated |
|------|------------------|
| **Claude Code** | `AI_CONTEXT.md` + `.ai-context/` |
| **GitHub Copilot** | `.github/copilot-instructions.md` |
| **Cline** | `.clinerules` |
| **Antigravity** | `.agent/` (10 files) |

### What Happens

1. **Environment Detection** - Detects if running in Claude Code or standalone
2. **Deep Codebase Analysis** - Scans for entry points, workflows, architecture
3. **Template Generation** - Creates `.ai-context/` structure with real data
4. **Multi-Tool Output** - Generates context files for selected AI tools
5. **AI Handoff** (if in Claude Code) - Creates `INIT_REQUEST.md` for `@context-engineer`

---

## Automatic Initialization

When you run `npx create-ai-context`, the CLI performs **real codebase analysis**:

### What Gets Analyzed

| Analysis | Description |
|----------|-------------|
| **Entry Points** | API routes, CLI handlers, event listeners |
| **Workflows** | Business logic patterns (auth, payments, etc.) |
| **Architecture** | Directory structure, layers, dependencies |
| **Tech Stack** | Languages, frameworks, package managers |

### Supported Frameworks

| Framework | Entry Point Detection |
|-----------|----------------------|
| Express | `app.get()`, `router.post()` |
| FastAPI | `@app.get()`, `@router.post()` |
| Next.js | `export function GET()` |
| Django | `path('url', view)` |
| Rails | `get '/path'` |
| NestJS | `@Get()`, `@Post()` |

### Execution Modes

| Mode | Condition | Capabilities |
|------|-----------|--------------|
| **full-ai** | Claude Code + API key | AI-enhanced analysis |
| **hybrid** | Claude Code (no API) | Static + AI handoff |
| **standalone** | No Claude Code | Static analysis only |

In hybrid mode, the CLI creates `INIT_REQUEST.md` with instructions for `@context-engineer` to complete initialization.

---

## What This Solves

**Without this template:**
- Claude reads entire files looking for relevant code
- Context window fills up with irrelevant content
- Knowledge is lost between sessions
- Documentation drifts out of sync with code

**With this template:**
- Pre-built indexes point Claude directly to relevant code
- Session state persists across Claude Code sessions
- Automatic drift detection keeps docs synchronized
- Semantic anchors (`file::function()`) survive code refactoring

---

## Features

### Commands (11 total)

| Command | Category | Description |
|---------|----------|-------------|
| `/rpi-research` | RPI Workflow | Explore codebase, create research document |
| `/rpi-plan` | RPI Workflow | Create implementation plan with file:line refs |
| `/rpi-implement` | RPI Workflow | Execute plan with atomic commits |
| `/verify-docs-current` | Validation | Check if docs match code |
| `/validate-all` | Validation | Run full validation suite |
| `/session-save` | Session | Save current session state for later |
| `/session-resume` | Session | Resume a previous session |
| `/auto-sync` | Sync | Synchronize documentation with code |
| `/help` | General | Show available commands |
| `/collab` | Team | Team handoffs and knowledge sync |
| `/analytics` | Metrics | View usage statistics |

### Agents (6 total)

| Agent | Specialty | Example Use |
|-------|-----------|-------------|
| `@context-engineer` | Setup, re-indexing | "Re-scan the auth module" |
| `@core-architect` | System design | "Explain the state machine" |
| `@database-ops` | Schema, migrations | "Add a new migration" |
| `@api-developer` | Endpoints, contracts | "Add a REST endpoint" |
| `@integration-hub` | External services | "Connect to Stripe API" |
| `@deployment-ops` | CI/CD, infrastructure | "Update deploy pipeline" |

### Tech Stack Presets (12 total)

| Preset | Stack |
|--------|-------|
| `python` | Python, pip, pytest |
| `python-django` | Python, Django, PostgreSQL |
| `node` | Node.js, npm, Jest |
| `node-nestjs` | Node.js, NestJS, TypeORM |
| `typescript-remix` | TypeScript, Remix, Prisma |
| `go` | Go, go modules |
| `rust` | Rust, Cargo |
| `ruby` | Ruby, Bundler, RSpec |
| `java-spring` | Java, Spring Boot, Maven |
| `csharp-dotnet` | C#, .NET, NuGet |
| `php-laravel` | PHP, Laravel, Composer |
| `default` | Generic project |

---

## Self-Sustaining Features

### Session Persistence

Sessions persist across Claude Code restarts:

```bash
/session-save                    # Save current state
/session-save --checkpoint "v1"  # Create named checkpoint
/session-resume                  # Resume last session
/session-resume --list           # List available sessions
```

### Drift Detection

Automatic detection when documentation is out of sync:

```bash
/auto-sync --check        # Check for drift
/auto-sync --fix          # Auto-fix shifted line numbers
/auto-sync --rebuild-map  # Regenerate CODE_TO_WORKFLOW_MAP
```

### Semantic Anchors

Use stable function references instead of brittle line numbers:

```markdown
<!-- Before (breaks when code changes) -->
See auth.py:145

<!-- After (survives refactoring) -->
See auth.py::authenticate_user()
```

### Git Hooks

Optional hooks for automated verification:

```bash
# Install hooks
npx claude-context hooks install

# Pre-commit: Warns if docs need updating
# Post-commit: Rebuilds indexes automatically
```

---

## Directory Structure

```
your-project/
├── AI_CONTEXT.md                # Entry point for AI tools (universal)
├── .ai-context/                 # Context engineering system
│   ├── agents/                  # 6 specialized agents
│   ├── automation/              # Self-sustaining engines
│   │   ├── generators/          # Auto-generation scripts
│   │   └── hooks/               # Git hooks
│   ├── commands/                # 11 slash commands
│   ├── context/                 # Pre-computed knowledge
│   │   ├── workflows/           # Auto-generated workflow docs
│   │   ├── .meta/               # Generation metadata
│   │   └── CODE_TO_WORKFLOW_MAP.md
│   ├── indexes/                 # Navigation hierarchy
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot context
├── .clinerules                  # Cline context
└── .agent/                      # Antigravity context (10 files)
    ├── rules/
    ├── workflows/
    └── skills/
    ├── session/                 # Session persistence
    │   ├── current/             # Active session
    │   ├── history/             # Archived sessions
    │   └── checkpoints/         # Named resume points
    ├── sync/                    # Synchronization tracking
    │   ├── anchors.json         # Semantic anchors
    │   ├── hashes.json          # Content hashes
    │   └── staleness.json       # Freshness tracking
    ├── schemas/                 # JSON validation (14 schemas)
    ├── tools/                   # CLI tooling
    ├── config/                  # Environment configs
    ├── team/                    # Team collaboration
    ├── knowledge/               # Shared knowledge base
    └── standards/               # Quality guidelines
```

---

## RPI Workflow

The Research-Plan-Implement workflow ensures thorough, systematic changes:

```bash
# 1. Research: Explore and understand
/rpi-research user-authentication

# 2. Plan: Create detailed implementation plan
/rpi-plan user-authentication

# 3. Implement: Execute with atomic commits
/rpi-implement user-authentication
```

**Key principle:** ONE CHANGE → ONE TEST → ONE COMMIT

---

## Configuration

### Settings (`.claude/settings.json`)

Uses the official Claude Code settings schema:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [{ "type": "command", "command": "echo 'Committing...'" }]
      }
    ]
  }
}
```

Project-specific workflow configuration is documented in `CLAUDE.md` rather than settings.json.

### Environment Configs

```
.claude/config/
├── base.json              # Shared settings
├── environments/
│   ├── development.json   # Relaxed validation
│   ├── staging.json       # Balanced
│   └── production.json    # Strict validation
└── local.json             # Your overrides (gitignored)
```

---

## Commands

### Setup (npm)

```bash
# Initialize context engineering in your project
npx create-claude-context
npx create-claude-context --yes      # Skip prompts
npx create-claude-context --static   # Static analysis only
```

### Ongoing Use (Claude Code slash commands)

Once initialized, use these commands inside Claude Code:

```bash
# Validation
/validate-all                    # Run full validation suite
/verify-docs-current [file]      # Check if docs match code

# Synchronization
/auto-sync --check               # Check for drift
/auto-sync --fix                 # Auto-fix shifted line numbers

# Session Management
/session-save                    # Save current session
/session-resume                  # Resume previous session

# RPI Workflow
/rpi-research [feature]          # Research a feature
/rpi-plan [feature]              # Create implementation plan
/rpi-implement [feature]         # Execute with atomic commits

# Help
/help                            # Show all commands
```

### Local Tools (optional)

The `.claude/tools/` directory contains local scripts for advanced use:

```bash
# Run from project root
node .claude/tools/lib/validate.js --all
node .claude/tools/lib/code-mapper.js
```

---

## Context Efficiency

| Metric | Target | How It's Achieved |
|--------|--------|-------------------|
| Context usage | <40% | Progressive loading: index → workflow → code |
| Line accuracy | ≥60% | `/verify-docs-current` + semantic anchors |
| Session continuity | 100% | Persistent session state |

---

## CI/CD Integration

Copy GitHub Actions workflows:

```bash
cp -r .claude/ci-templates/github-actions/*.yml .github/workflows/
```

Includes:
- **validate-docs.yml** - Runs on PRs affecting docs
- **context-check.yml** - Weekly documentation health check

---

## Troubleshooting

### "CLI can't detect my tech stack"

```bash
npx create-claude-context --stack python-django
```

### "Line numbers are outdated"

```bash
/auto-sync --fix
```

### "Session won't resume"

```bash
/session-resume --list  # Check available sessions
```

### "Context budget exceeded"

Load progressively:
1. Category index (5k tokens)
2. Relevant workflow (15-40k tokens)
3. Specific code sections only

---

## npm Packages

| Package | Purpose | Install |
|---------|---------|---------|
| `create-claude-context` | CLI installer | `npx create-claude-context` |
| `claude-context-plugin` | Claude Code plugin | Optional during setup |

---

## License

MIT License - Use freely in any project.

---

**Version:** 1.2.4 | **Updated:** 2026-01-28 | **License:** MIT
