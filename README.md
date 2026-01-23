# Claude Code Context Engineering Template

![GitHub Stars](https://img.shields.io/github/stars/SireJeff/claude-context-engineering-template?style=social)
![GitHub Forks](https://img.shields.io/github/forks/SireJeff/claude-context-engineering-template?style=social)
![GitHub License](https://img.shields.io/github/license/SireJeff/claude-context-engineering-template)
![GitHub Issues](https://img.shields.io/github/issues/SireJeff/claude-context-engineering-template)
![GitHub Pull Requests](https://img.shields.io/github/pulls/SireJeff/claude-context-engineering-template)

**A sophisticated, portable template for implementing context engineering in any codebase with Claude Code.** 

This template enables **zero-search context loading**, **<40% context window utilization**, and **10× faster issue resolution** by leveraging pre-computed system knowledge and optimized documentation structures.

## ⭐ Key Features

- **Zero-search context loading** - Pre-computed system knowledge eliminates the need for searching through files
- **<40% context window utilization** - Maximum efficiency with Claude's 200k token limit
- **30k token output limit optimization** - Perfectly aligned with Claude's output constraints
- **10× faster issue resolution** - Exact file:line references accelerate debugging
- **Self-maintaining documentation** - Automated validation prevents documentation drift
- **Proven results** - 77% time savings based on real-world case studies

## 🆕 What's New in v1.1.0

- **CLI Tooling** - `npx claude-context init|validate|diagnose` commands
- **JSON Schema Validation** - 7 schemas for settings, agents, commands, workflows
- **Team Collaboration** - `/collab` command for handoffs, shared knowledge base
- **CI/CD Templates** - GitHub Actions for automated validation
- **Community Standards** - Extension guidelines, quality checklist
- **New Commands** - `/help`, `/collab`, `/analytics`

## 🔧 Quick Start

### 1. Copy Template to Your Repository

```bash
# From your project root
cp -r /path/to/template_claude/.claude ./.claude
cp /path/to/template_claude/CLAUDE.md ./CLAUDE.md
```

### 2. Initialize with CLI or Agent

**Option A: CLI (Recommended)**
```bash
cd .claude/tools && npm install
npx claude-context init
```

**Option B: Context Engineer Agent**
```bash
# In Claude Code CLI
@context-engineer "Initialize context engineering for this repository"
```

The initialization will:
1. Analyze your codebase structure
2. Discover 8-15 major workflows
3. Create workflow documentation with file:line references
4. Populate all index files
5. Set up specialized agents
6. Validate the system

### 3. Start Using the System

```bash
# For new features
/rpi-research feature-name
/rpi-plan feature-name
/rpi-implement feature-name

# For debugging
# Load WORKFLOW_INDEX.md → Find relevant workflow → Jump to file:line

# After code changes
/verify-docs-current path/to/modified/file
```

## 📂 Directory Structure

```
your-project/
├── CLAUDE.md                    # Main entry point (populated from template)
└── .claude/
    ├── README.md                # Configuration overview
    ├── RPI_WORKFLOW_PLAN.md     # RPI methodology documentation
    │
    ├── agents/                  # Specialized agents (6)
    │   ├── context-engineer.md  # Initialization agent
    │   ├── core-architect.md    # System architecture
    │   ├── database-ops.md      # Database operations
    │   ├── api-developer.md     # API development
    │   ├── integration-hub.md   # External services
    │   └── deployment-ops.md    # CI/CD, infrastructure
    │
    ├── commands/                # Custom slash commands (8)
    │   ├── rpi-research.md      # Research phase
    │   ├── rpi-plan.md          # Plan phase
    │   ├── rpi-implement.md     # Implementation phase
    │   ├── verify-docs-current.md
    │   ├── validate-all.md
    │   ├── help.md              # Help system (NEW)
    │   ├── collab.md            # Team collaboration (NEW)
    │   └── analytics.md         # Usage analytics (NEW)
    │
    ├── tools/                   # CLI tooling (NEW)
    │   ├── package.json
    │   ├── bin/claude-context.js
    │   └── lib/                 # Core modules
    │
    ├── schemas/                 # JSON schemas (NEW)
    │   ├── settings.schema.json
    │   ├── agent.schema.json
    │   └── ...                  # 7 total schemas
    │
    ├── config/                  # Configuration (NEW)
    │   ├── base.json
    │   └── environments/        # Dev, staging, prod
    │
    ├── team/                    # Team collaboration (NEW)
    │   ├── config.json
    │   └── roles.json
    │
    ├── knowledge/               # Shared knowledge (NEW)
    │   ├── shared/decisions/    # ADRs
    │   ├── shared/patterns/     # Reusable patterns
    │   └── sessions/            # Session handoffs
    │
    ├── standards/               # Community standards (NEW)
    │   ├── EXTENSION_GUIDELINES.md
    │   └── QUALITY_CHECKLIST.md
    │
    ├── ci-templates/            # CI/CD templates (NEW)
    │   └── github-actions/
    │
    ├── context/                 # Pre-computed knowledge
    │   ├── WORKFLOW_INDEX.md
    │   ├── CODE_TO_WORKFLOW_MAP.md
    │   └── workflows/
    │
    ├── indexes/                 # 3-level navigation
    │   ├── workflows/
    │   ├── agents/
    │   ├── code/
    │   ├── routing/
    │   └── search/
    │
    ├── research/                # RPI research artifacts
    │   └── active/, completed/
    │
    └── plans/                   # RPI plan artifacts
        └── active/, completed/
```

## ⚖️ Hard Limits

These limits are **non-negotiable** and enforced throughout the system:

| Limit | Value | Why |
|-------|-------|-----|
| **Max Context** | 200,000 tokens | Claude's context window limit |
| **Max Output** | 30,000 tokens | Claude's output limit per response |
| **Target Usage** | <40% (80k tokens) | Prevent context rot |
| **Compact Trigger** | 35% (70k tokens) | Safety margin |
| **Workflow Count** | 8-15 | Optimal for navigation |
| **Line Tolerance** | ±10 lines | Acceptable drift |

## 🔍 The 3-Level Chain-of-Index Architecture

### Level 1: Category Indexes (~5k tokens each)

Entry points for navigation. Load one of these first:

- `indexes/workflows/CATEGORY_INDEX.md` - Workflow categories
- `indexes/code/CATEGORY_INDEX.md` - Code organization
- `indexes/agents/CATEGORY_INDEX.md` - Agent selection
- `indexes/routing/CATEGORY_INDEX.md` - Task routing
- `indexes/search/CATEGORY_INDEX.md` - Search patterns

### Level 2: Domain Indexes (~10-20k tokens each)

Detailed navigation within a category. Examples:
- `indexes/workflows/jobs.md` - All job-related workflows
- `indexes/workflows/payment.md` - All payment workflows

### Level 3: Detail Files (~20-50k tokens each)

Full documentation with file:line references:
- `context/workflows/[name].md` - Complete workflow documentation
- `agents/[domain]-agent.md` - Agent capabilities and usage

## 🔄 RPI Workflow

**Research-Plan-Implement** methodology prevents cascading errors:

### Phase 1: Research (`/rpi-research`)
- Launch 3 parallel Explore agents
- Trace call chains with line numbers
- Map dependencies
- Output: Research document (~20k tokens)

### Phase 2: Plan (`/rpi-plan`)
- Load research document
- Create step-by-step blueprint
- Define test strategy
- Get human approval
- Output: Plan document (~15k tokens)

### Phase 3: Implement (`/rpi-implement`)
- Execute atomically
- **ONE CHANGE → ONE TEST → ONE COMMIT**
- Update documentation (mandatory)
- Output: Completed feature + updated docs

## 💰 Context Budget Management

### Loading Strategy

```
Step 1: Load category index (~5k tokens) - 2.5%
Step 2: Load domain index (~15k tokens) - 7.5%
Step 3: Load specific workflow (~40k tokens) - 20%
Step 4: Read targeted code sections (~20k tokens) - 10%
─────────────────────────────────────────────────
Total: ~80k tokens (40%)
Buffer remaining: 120k tokens (60%)
```

### Compaction Triggers

| Trigger | Action |
|---------|--------|
| Context > 35% | Archive tool results, keep summaries |
| After RPI phase | Save progress, clear exploration |
| Error loop (3+) | Save state, start fresh session |
| Session > 1 hour | Create handoff document |

## 📑 Workflow Documentation Standard

Every workflow file follows this 10-section structure:

```markdown
# [Workflow Name] Workflow

1. ## Quick Navigation (TOC)
2. ## Overview (user journey, key features)
3. ## Entry Points (file:line references)
4. ## Sub-Workflow 1-N (call chains)
5. ## Database Schema (tables, operations)
6. ## External APIs (integrations)
7. ## Test Coverage (test files, gaps)
8. ## Known Gotchas (lessons learned)
9. ## Complete Call Chain (ASCII diagram)
10. ## File Reference Table (size, purpose)
```

## 🔄 Self-Maintaining Documentation

### After Code Changes

1. Check `CODE_TO_WORKFLOW_MAP.md` for affected workflows
2. Update workflow files with new line numbers
3. Verify function signatures match
4. Run `/verify-docs-current [modified-file]`
5. Commit documentation updates with code

### Maintenance Schedule

| Task | Frequency | Time |
|------|-----------|------|
| Spot-check 5 line numbers | Monthly | 15 min |
| Re-run discovery agents | Quarterly | 2 hours |
| Full documentation audit | Annually | 4-6 hours |

## 🤖 Specialized Agents

### Built-in Agent

- **`context-engineer`** - Initialization and transformation

### Generated Agents (examples)

After initialization, agents are created based on discovered domains:

- `core-architect` - System architecture, state machines
- `database-ops` - Migrations, schema, queries
- `api-developer` - Endpoints, contracts
- `integration-hub` - External services
- `deployment-ops` - CI/CD, infrastructure

## 🛠️ Template Placeholders

The template uses `{{PLACEHOLDER}}` syntax. The context-engineer agent replaces these during initialization:

| Placeholder | Replaced With |
|-------------|---------------|
| `{{PROJECT_NAME}}` | Detected project name |
| `{{TECH_STACK}}` | Detected technologies |
| `{{PRODUCTION_URL}}` | From config/env |
| `{{WORKFLOWS_COUNT}}` | Discovered workflow count |
| `{{DATE}}` | Initialization date |

## ✅ Validation

### Quality Standards

| Metric | Target |
|--------|--------|
| Line number accuracy | ≥60% |
| Markdown link validity | 100% |
| Workflow completeness | All 10 sections |
| Context budget | <40% for typical tasks |

### Validation Commands

```bash
/verify-docs-current path/to/file  # Check single file
/validate-all                       # Full validation suite
```

## 📈 Proven Results

Based on DeadlineKiller case study (50k+ LOC):

- **Context utilization:** 20-30% (was 40-60%)
- **Issue triage:** 1-3 minutes (was 20-30 minutes)
- **Feature planning:** 10-15 minutes (was 60-90 minutes)
- **Session onboarding:** 15 minutes (was 30-60 minutes)
- **Bugs found proactively:** 3 critical production blockers
- **Agent consolidation:** 72% reduction (43 → 12)
- **Time savings:** 77% after break-even

## 🛠️ Troubleshooting

### "Context-engineer can't detect my tech stack"

Provide hints:
```bash
@context-engineer "Initialize for Python FastAPI with PostgreSQL"
```

### "Too many workflows discovered"

Merge related workflows:
```bash
@context-engineer "Merge workflows: auth-login and auth-register into authentication"
```

### "Line numbers are outdated"

Run verification:
```bash
/verify-docs-current [file-path]
```

### "Context budget exceeded"

Use progressive loading:
1. Load category index first
2. Then load only relevant workflow
3. Read specific code sections, not entire files

## 🤝 Contributing

We love contributions! Whether you're fixing a bug, improving documentation, or adding new features, we want your input. Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📜 License

MIT License - Use freely in any project. See [LICENSE](LICENSE) for details.

## 🏛️ Credits

Based on context engineering principles from:
- DeadlineKiller project (production-validated)
- Human Layer research on LLM context management
- Claude Code best practices

---

**Version:** 1.1.0
**Updated:** 2025-01-24
**Validated:** DeadlineKiller (Python, FastAPI, PostgreSQL)
**Applicable To:** Any codebase (web, mobile, data, infrastructure)

### SEO Keywords
Claude Code, Context Engineering, AI Development, Code Documentation, Productivity Tool, Development Workflow, Context Management, Code Navigation, LLM Context Optimization, Developer Productivity
