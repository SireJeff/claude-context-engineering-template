# Universal AI Context Engineering Template

![npm](https://img.shields.io/npm/v/create-universal-ai-context)
![npm downloads](https://img.shields.io/npm/dm/create-universal-ai-context)
![GitHub Stars](https://img.shields.io/github/stars/SireJeff/claude-context-engineering-template?style=social)
![GitHub License](https://img.shields.io/github/license/SireJeff/claude-context-engineering-template)

A self-sustaining template for organizing your codebase documentation so AI coding assistants can navigate it efficiently. Supports **Claude Code**, **GitHub Copilot**, **Cline**, and **Antigravity**. Includes **automatic codebase analysis**, workflow generation, and multi-tool output.

---

## Quick Start

```bash
# One command to set up everything (v2.0)
npx create-universal-ai-context

# Or with options
npx create-universal-ai-context --yes              # Accept defaults
npx create-universal-ai-context --ai copilot       # Generate for GitHub Copilot only
npx create-universal-ai-context --ai cline         # Generate for Cline only
npx create-universal-ai-context --ai all           # Generate for all AI tools (default)
npx create-universal-ai-context --static           # Force static-only analysis
npx create-universal-ai-context --force-ai         # Require Claude Code session

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

When you run `npx create-universal-ai-context`, the CLI performs **real codebase analysis**:

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

## Cross-Tool Sync (New!)

```bash
# Check if contexts are synchronized
npx create-universal-ai-context sync:check

# Sync all AI tool contexts
npx create-universal-ai-context sync:all

# Propagate changes from one tool to others
npx create-universal-ai-context sync:from claude --strategy source_wins

# Install git hooks for automatic sync
npx create-universal-ai-context hooks:install
```

**What it does:**
- Automatically keeps AI tool contexts synchronized
- When you edit `AI_CONTEXT.md`, other tools stay up-to-date
- Git hooks check sync status before commits
- Conflict resolution strategies for handling differences

**Conflict Strategies:**
- `source_wins` - Changed tool's context wins
- `regenerate_all` - Regenerate all from codebase
- `newest` - Most recently modified wins
- `manual` - Require manual resolution

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

## Automation & Hooks

The template includes self-sustaining automation that keeps your documentation synchronized with code changes automatically.

### Automation Generators

These scripts automatically update your documentation based on code changes:

#### 1. Code Mapper (`code-mapper.js`)

**What it does:**
- Scans all workflow files for file:line references
- Builds a reverse index mapping code files to documentation
- Generates `CODE_TO_WORKFLOW_MAP.md`

**When it runs:**
- Automatically after commits (via post-commit hook)
- Manually: `node .claude/automation/generators/code-mapper.js`

**Output:** `.claude/context/CODE_TO_WORKFLOW_MAP.md`

**Why it's useful:**
- When you modify a file, instantly see which docs reference it
- Track what needs updating after code changes
- Prevents stale documentation

---

#### 2. Index Builder (`index-builder.js`)

**What it does:**
- Scans workflows, agents, and commands for metadata
- Regenerates category index files automatically
- Updates navigation indexes with accurate counts

**When it runs:**
- Automatically when content changes
- Manually: `node .claude/automation/generators/index-builder.js`

**Files generated:**
- `.claude/indexes/workflows/CATEGORY_INDEX.md`
- `.claude/indexes/agents/CATEGORY_INDEX.md`

**Why it's useful:**
- Navigation indexes stay accurate as you add/remove workflows
- No manual index maintenance needed
- Always shows current state of your documentation

---

### Git Hooks

Hooks automate validation and updates during your git workflow:

#### Pre-Commit Hook (`pre-commit.sh`)

**What it does:**
- Checks if code changes might affect documentation
- Warns about potential documentation drift
- Optionally blocks commits if docs are stale

**Install:**
```bash
cp .claude/automation/hooks/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Configuration:** `.claude/automation/config.json`
```json
{
  "hooks": {
    "pre_commit": {
      "enabled": true,
      "check_drift": true,
      "block_on_stale": false
    }
  }
}
```

**Behavior:**
- Scans staged files for code changes (*.js, *.py, *.go, etc.)
- Checks if those files are referenced in workflows
- Warns if documentation may need updating
- If `block_on_stale: true`, blocks commit until docs are updated

**Skip the hook:**
```bash
git commit --no-verify -m "my message"
```

---

#### Post-Commit Hook (`post-commit.sh`)

**What it does:**
- Rebuilds CODE_TO_WORKFLOW_MAP.md in background
- Updates file hashes for change tracking
- Queues index rebuilds after documentation commits

**Install:**
```bash
cp .claude/automation/hooks/post-commit.sh .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

**Configuration:** `.claude/automation/config.json`
```json
{
  "hooks": {
    "post_commit": {
      "enabled": true,
      "rebuild_code_map": true,
      "update_hashes": true
    }
  }
}
```

**Behavior:**
- Runs asynchronously after successful commit
- Doesn't slow down your commit process
- Keeps indexes and maps up-to-date

---

#### Cross-Tool Sync Hooks (NEW!)

For automatically synchronizing AI tool contexts:

**Pre-Commit Sync Hook (`pre-commit.hbs`)**
- Checks if AI tool contexts are synchronized
- Blocks commit if contexts are out of sync
- Shows which tools need syncing

**Post-Commit Sync Hook (`post-commit.hbs`)**
- Triggers background sync after successful commits
- Syncs all AI tool contexts from codebase

**Install:**
```bash
npx create-universal-ai-context hooks:install
```

Or manually:
```bash
cp .claude/automation/hooks/pre-commit.hbs .git/hooks/pre-commit
cp .claude/automation/hooks/post-commit.hbs .git/hooks/post-commit
chmod +x .git/hooks/pre-commit .git/hooks/post-commit
```

**Configuration:** `.ai-context/sync-state.json` (auto-generated)

---

### Automation Configuration

All automation is controlled via: `.claude/automation/config.json`

```json
{
  "$schema": "../schemas/automation.schema.json",
  "version": "1.0.0",
  "generators": {
    "code_mapper": {
      "enabled": true,
      "output_path": "context/CODE_TO_WORKFLOW_MAP.md",
      "scan_patterns": [
        "context/workflows/*.md",
        "agents/*.md",
        "commands/*.md"
      ]
    },
    "index_builder": {
      "enabled": true,
      "rebuild_on_change": true
    }
  },
  "hooks": {
    "pre_commit": {
      "enabled": true,
      "check_drift": true,
      "block_on_stale": false
    },
    "post_commit": {
      "enabled": true,
      "rebuild_code_map": true,
      "update_hashes": true
    }
  }
}
```

### Manual Trigger Commands

```bash
# Regenerate code-to-workflow map
node .claude/automation/generators/code-mapper.js

# Rebuild all indexes
node .claude/automation/generators/index-builder.js

# Dry-run to see what would be generated
node .claude/automation/generators/code-mapper.js --dry-run
```

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
# Install hooks for context sync
npx create-universal-ai-context hooks:install

# Pre-commit: Checks sync status before commits
# Post-commit: Auto-syncs after successful commits
```

---

## Directory Structure

```
your-project/
├── AI_CONTEXT.md                # Entry point for AI tools (universal)
├── .ai-context/                 # Context engineering system (single source of truth)
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
│   ├── session/                 # Session persistence
│   │   ├── current/             # Active session
│   │   ├── history/             # Archived sessions
│   │   └── checkpoints/         # Named resume points
│   ├── sync/                    # Synchronization tracking
│   │   ├── anchors.json         # Semantic anchors
│   │   ├── hashes.json          # Content hashes
│   │   └── staleness.json       # Freshness tracking
│   ├── schemas/                 # JSON validation (14 schemas)
│   ├── tools/                   # CLI tooling
│   ├── config/                  # Environment configs
│   ├── team/                    # Team collaboration
│   ├── knowledge/               # Shared knowledge base
│   └── standards/               # Quality guidelines
├── .claude/                     # Claude Code-specific config (symlinks to .ai-context/)
│   ├── agents       → ../.ai-context/agents/
│   ├── commands     → ../.ai-context/commands/
│   ├── indexes      → ../.ai-context/indexes/
│   ├── context      → ../.ai-context/context/
│   ├── schemas      → ../.ai-context/schemas/
│   ├── standards    → ../.ai-context/standards/
│   ├── tools        → ../.ai-context/tools/
│   ├── settings.json           # Claude-specific settings
│   └── README.md                # Symlink architecture docs
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot context
├── .clinerules                  # Cline context
└── .agent/                      # Antigravity context (10 files)
    ├── rules/
    ├── workflows/
    └── skills/
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
npx create-universal-ai-context
npx create-universal-ai-context --yes      # Skip prompts
npx create-universal-ai-context --static   # Static analysis only
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
npx create-universal-ai-context --stack python-django
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
| `create-universal-ai-context` | CLI installer | `npx create-universal-ai-context` |
| `claude-context-plugin` | Claude Code plugin | Optional during setup |

---

## License

MIT License - Use freely in any project.

---

**Version:** 2.3.0 | **Updated:** 2026-01-30 | **License:** MIT
