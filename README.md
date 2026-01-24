# Claude Code Context Engineering Template

![npm](https://img.shields.io/npm/v/create-claude-context)
![npm downloads](https://img.shields.io/npm/dm/create-claude-context)
![GitHub Stars](https://img.shields.io/github/stars/SireJeff/claude-context-engineering-template?style=social)
![GitHub Forks](https://img.shields.io/github/forks/SireJeff/claude-context-engineering-template?style=social)
![GitHub License](https://img.shields.io/github/license/SireJeff/claude-context-engineering-template)
![GitHub Issues](https://img.shields.io/github/issues/SireJeff/claude-context-engineering-template)
![GitHub Pull Requests](https://img.shields.io/github/pulls/SireJeff/claude-context-engineering-template)

A complete template for organizing your codebase documentation so Claude Code can navigate it efficiently.

---

## Demo

<!-- Placeholder for demo GIF - see docs/RECORDING_DEMO.md for instructions -->
```
$ npx create-claude-context

  Let's set up context engineering for your project.

? Project name: my-awesome-app
? Technology stack: Confirm: Node.js, Express, MongoDB
? Features to include: RPI Workflow, Specialized Agents, Validation Commands
? Install Claude Code plugin? Yes

Creating .claude/ directory structure... done
Generating CLAUDE.md... done
Installing claude-context-plugin... done

  Context engineering setup complete.

  Next steps:
    1. Review CLAUDE.md
    2. Customize .claude/context/workflows/
    3. Run /help in Claude Code
```

> See [docs/RECORDING_DEMO.md](docs/RECORDING_DEMO.md) for creating an animated demo GIF.

---

## What This Template Does

This template solves a common problem: **Claude Code wastes tokens searching through your codebase** because it doesn't know where things are.

**Without this template:**
- Claude reads entire files looking for relevant code
- Context window fills up with irrelevant content
- You spend time guiding Claude to the right files
- Knowledge is lost between sessions

**With this template:**
- Pre-built indexes point Claude directly to relevant code
- Documentation includes exact file:line references
- Workflows are mapped so Claude understands your system
- Session handoffs preserve context for team members

---

## Prerequisites

Before installing, ensure you have:

| Requirement | Details |
|-------------|---------|
| **Node.js 18+** | Required for CLI tools |
| **A codebase** | This template works with any language/framework |
| **Claude Code CLI** | The Anthropic CLI tool |
| **~30 minutes** | For initial setup and configuration |

---

## Quick Start

### Option A: One-Command Install (Recommended)

```bash
npx create-claude-context
```

This single command:
- Creates the `.claude/` directory structure
- Detects your tech stack automatically
- Generates `CLAUDE.md` at your project root
- Installs the Claude Code plugin (optional)

### Option B: Manual Installation

#### Step 1: Copy the Template

Copy the `.claude` directory and `CLAUDE.md` to your project root:

```bash
# Clone this repo
git clone https://github.com/SireJeff/claude-context-engineering-template.git

# Copy to your project
cp -r claude-context-engineering-template/.claude your-project/.claude
cp claude-context-engineering-template/CLAUDE.md your-project/CLAUDE.md
```

### Step 2: Install CLI Tools

```bash
cd your-project/.claude/tools
npm install
```

### Step 3: Initialize for Your Codebase

Run the initialization command:

```bash
npx claude-context init
```

**What happens during initialization:**
1. CLI detects your tech stack (Python, Node, Go, etc.)
2. Scans for major workflows in your code
3. Replaces `{{PLACEHOLDER}}` values with your project info
4. Creates initial workflow documentation
5. Validates the setup

**Expected output:**
```
✓ Detected: Node.js with Express
✓ Found 12 potential workflows
✓ Replaced 45 placeholders
✓ Created workflow documentation
✓ Validation passed
```

### Step 4: Customize Your Documentation

The init command creates a starting point. You should:

1. **Review `.claude/context/workflows/`** - Edit the generated workflow files
2. **Update `CLAUDE.md`** - Add project-specific commands and patterns
3. **Fill in gotchas** - Document things Claude should know about your codebase

---

## What You Get

After setup, your project will have:

### Commands (8 total)

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/rpi-research` | Explores codebase, creates research doc | Starting a new feature |
| `/rpi-plan` | Creates implementation plan with file:line refs | After research, before coding |
| `/rpi-implement` | Executes plan with atomic commits | When you have an approved plan |
| `/verify-docs-current` | Checks if docs match code | After making changes |
| `/validate-all` | Runs full validation suite | Before committing |
| `/help` | Shows available commands and agents | When unsure what to use |
| `/collab` | Team handoffs and sync | End of session, team work |
| `/analytics` | Shows usage statistics | Monitoring context usage |

### Agents (6 total)

| Agent | Specialty | Example Use |
|-------|-----------|-------------|
| `@context-engineer` | Initial setup, re-indexing | "Re-scan the authentication module" |
| `@core-architect` | System design, architecture | "Explain the state machine" |
| `@database-ops` | Schema, migrations, queries | "Add a new migration" |
| `@api-developer` | Endpoints, contracts | "Add a new REST endpoint" |
| `@integration-hub` | External services | "Connect to Stripe API" |
| `@deployment-ops` | CI/CD, infrastructure | "Update the deploy pipeline" |

### Directory Structure

```
your-project/
├── CLAUDE.md                    # Entry point Claude reads first
└── .claude/
    ├── agents/                  # 6 specialized agents
    ├── commands/                # 8 slash commands
    ├── context/                 # Pre-computed knowledge
    │   ├── workflows/           # Workflow documentation
    │   ├── WORKFLOW_INDEX.md    # Master index
    │   └── KNOWN_GOTCHAS.md     # Documented issues
    ├── indexes/                 # Navigation hierarchy
    ├── tools/                   # CLI tooling
    ├── schemas/                 # JSON validation
    ├── config/                  # Environment configs
    ├── team/                    # Team collaboration
    ├── knowledge/               # Shared knowledge base
    └── standards/               # Quality guidelines
```

---

## How to Use

### Daily Development Workflow

**When fixing a bug:**
1. Tell Claude the symptom
2. Claude loads relevant workflow from index
3. Goes directly to file:line references
4. Fixes with full context

**When adding a feature:**
1. Run `/rpi-research feature-name`
2. Review the research document
3. Run `/rpi-plan feature-name`
4. Get your approval on the plan
5. Run `/rpi-implement feature-name`
6. Documentation updates automatically

### The RPI Workflow Explained

**R - Research:**
```bash
/rpi-research user-authentication
```
Claude explores your codebase using parallel agents, traces call chains, and produces a research document with all relevant files and line numbers.

**P - Plan:**
```bash
/rpi-plan user-authentication
```
Based on research, Claude creates a step-by-step implementation plan with exact file:line modifications. You review and approve before any code changes.

**I - Implement:**
```bash
/rpi-implement user-authentication
```
Claude executes the approved plan using atomic changes: ONE CHANGE → ONE TEST → ONE COMMIT. Documentation is updated automatically.

### Keeping Documentation Current

After making code changes:
```bash
/verify-docs-current path/to/changed/file
```

This checks if line numbers in docs still match the code. Run it before committing.

### Team Handoffs

At the end of your session:
```bash
/collab handoff
```

This creates a handoff document in `.claude/knowledge/sessions/` with:
- What you worked on
- What's in progress
- Any blockers
- Suggested next steps

The next developer can pick up exactly where you left off.

---

## What to Expect

### Context Efficiency

| Metric | Target | How It's Achieved |
|--------|--------|-------------------|
| Context usage | <40% | Progressive loading: index → workflow → code |
| Benefit | More room for actual work | Less wasted on exploration |

### Documentation Accuracy

| Metric | Target | How It's Maintained |
|--------|--------|---------------------|
| Line number accuracy | ≥60% | `/verify-docs-current` command |
| Benefit | Claude goes to correct locations | Not nearby guesses |

### Workflow Coverage

| Metric | Target | How It's Created |
|--------|--------|------------------|
| Documented workflows | 8-15 | `@context-engineer` during init |
| Benefit | Major features are pre-mapped | Faster navigation |

### Team Continuity

- Session handoffs preserve context between developers
- Shared knowledge base grows over time
- Architecture Decision Records (ADRs) document key choices
- New team members onboard faster with existing documentation

---

## Architecture Overview

The template uses a **3-level documentation hierarchy** to minimize context usage:

### Level 1: Category Indexes (~5k tokens each)

Entry points. Load one of these first based on your task type:

| Index | Use When |
|-------|----------|
| `indexes/workflows/CATEGORY_INDEX.md` | Working on a feature |
| `indexes/code/CATEGORY_INDEX.md` | Finding specific code |
| `indexes/agents/CATEGORY_INDEX.md` | Choosing which agent to use |

### Level 2: Domain Indexes (~15k tokens each)

Detailed navigation within a category. Example: `indexes/workflows/authentication.md` lists all auth-related workflows.

### Level 3: Detail Files (~40k tokens each)

Full documentation with file:line references. Example: `context/workflows/user-login.md` contains complete call chains for the login feature.

**Why this matters:** Claude loads only what it needs. For a simple bug fix, it might load 20k tokens total. For a complex feature, maybe 60k. Either way, you stay under the 40% target.

---

## Configuration

### Environment-Specific Settings

The template supports different configurations for dev/staging/prod:

```
.claude/config/
├── base.json              # Shared settings
├── environments/
│   ├── development.json   # Relaxed validation
│   ├── staging.json       # Balanced
│   └── production.json    # Strict validation
└── local.json             # Your overrides (gitignored)
```

### Key Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `validation.line_accuracy_threshold` | 60 | Minimum % of line numbers that must be accurate |
| `validation.on_commit` | true | Run validation before commits |
| `logging.level` | info | Log verbosity (debug, info, warn, error) |

---

## CLI Commands

The template includes CLI tools for validation and management:

```bash
# Initialize template for your project
npx claude-context init

# Validate all documentation
npx claude-context validate --all

# Check specific validations
npx claude-context validate --schema    # JSON schema validation
npx claude-context validate --links     # Internal link checking
npx claude-context validate --lines     # Line number accuracy

# System diagnostics
npx claude-context diagnose
npx claude-context diagnose --fix       # Auto-fix common issues
```

---

## Troubleshooting

### "CLI can't detect my tech stack"

Provide hints during initialization:
```bash
npx claude-context init --stack "python-fastapi-postgresql"
```

Or use the context engineer agent:
```bash
@context-engineer "Initialize for Python FastAPI with PostgreSQL"
```

### "Too many workflows discovered"

Merge related workflows:
```bash
@context-engineer "Merge workflows: auth-login and auth-register into authentication"
```

### "Line numbers are outdated"

Run verification and let it fix drift:
```bash
npx claude-context diagnose --fix
```

Or manually:
```bash
/verify-docs-current path/to/file
```

### "Context budget exceeded"

Use progressive loading:
1. Load category index first (5k tokens)
2. Then load only the relevant workflow (15-40k tokens)
3. Read specific code sections, not entire files

### "Validation always fails"

Check the threshold settings:
```bash
npx claude-context validate --lines --threshold 50  # More lenient
```

---

## CI/CD Integration

Copy the GitHub Actions workflows to automate validation:

```bash
cp -r .claude/ci-templates/github-actions/*.yml .github/workflows/
```

This adds:
- **validate-docs.yml** - Runs on PRs that touch `.claude/` or source files
- **context-check.yml** - Weekly health check of documentation budget

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Before submitting:
1. Run `npx claude-context validate --all`
2. Check the [Quality Checklist](.claude/standards/QUALITY_CHECKLIST.md)
3. For extensions, follow [Extension Guidelines](.claude/standards/EXTENSION_GUIDELINES.md)

---

## License

MIT License - Use freely in any project. See [LICENSE](LICENSE) for details.

---

## Credits

Built on context engineering principles:
- LLM context window optimization research
- Claude Code best practices
- Community feedback and contributions

---

**Version:** 1.2.0 | **Updated:** 2025-01-24 | **License:** MIT
