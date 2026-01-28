# create-universal-ai-context

Universal AI context engineering for any codebase. Generates optimized context for **Claude Code**, **GitHub Copilot**, **Cline**, **Antigravity**, and more.

![npm](https://img.shields.io/npm/v/create-universal-ai-context)
![npm downloads](https://img.shields.io/npm/dm/create-universal-ai-context)

## Quick Start

```bash
npx create-universal-ai-context
```

That's it. The CLI automatically:
1. Detects your tech stack (Express, FastAPI, Next.js, Django, Rails, NestJS, etc.)
2. Analyzes entry points and workflows
3. Generates context files for all supported AI tools

## AI Tools Supported

| Tool | Output | Description |
|------|--------|-------------|
| **Claude Code** | `AI_CONTEXT.md` + `.ai-context/` | Full context engineering system |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Copilot workspace instructions |
| **Cline** | `.clinerules` | Cline rules file |
| **Antigravity** | `.agent/` | Identity, architecture, workflows, skills |

## CLI Options

```bash
# Basic usage
npx create-universal-ai-context                    # Auto-detect and generate for all tools

# Select specific AI tools
npx create-universal-ai-context --ai claude        # Claude Code only
npx create-universal-ai-context --ai copilot       # GitHub Copilot only
npx create-universal-ai-context --ai cline         # Cline only
npx create-universal-ai-context --ai antigravity   # Antigravity only
npx create-universal-ai-context --ai all           # All tools (default)

# Analysis modes
npx create-universal-ai-context --static           # Force static analysis only
npx create-universal-ai-context --force-ai         # Require Claude Code session

# Other options
npx create-universal-ai-context --yes              # Accept all defaults
npx create-universal-ai-context --dry-run          # Preview without changes
npx create-universal-ai-context my-project         # Create in new directory
```

## Subcommands

```bash
# Generate context for specific tools
npx create-universal-ai-context generate --ai copilot

# Check installation status
npx create-universal-ai-context status

# Migrate from v1.x
npx create-universal-ai-context migrate

# Check documentation drift
npx create-universal-ai-context drift --all           # Check all docs
npx create-universal-ai-context drift --file README.md  # Check specific file
npx create-universal-ai-context drift --fix           # Auto-fix issues
npx create-universal-ai-context drift --strict        # Exit 1 on issues (CI)
```

## Existing Documentation Detection

The CLI automatically detects existing AI context files:

```bash
npx create-universal-ai-context

# Found existing documentation: Claude context (v1), README.md
# ? How would you like to proceed?
#   > Merge: Use existing docs as base, add new structure (recommended)
#     Fresh: Start fresh but import key values
#     Overwrite: Replace everything with new templates
#     Skip: Cancel initialization
```

### Merge Mode Options

```bash
npx create-universal-ai-context --mode merge          # Preserve customizations (default)
npx create-universal-ai-context --mode fresh          # New structure, keep values
npx create-universal-ai-context --mode overwrite      # Replace everything
npx create-universal-ai-context --preserve-custom     # Keep user customizations
npx create-universal-ai-context --update-refs         # Auto-fix line numbers
npx create-universal-ai-context --backup              # Create backup first
```

## What Gets Analyzed

| Analysis | Description |
|----------|-------------|
| **Entry Points** | API routes, CLI handlers, event listeners |
| **Workflows** | Business logic patterns (auth, payments, etc.) |
| **Architecture** | Directory structure, layers, dependencies |
| **Tech Stack** | Languages, frameworks, package managers |
| **LOC** | Lines of code with code/comments/blank breakdown |

## Execution Modes

| Mode | Condition | Capabilities |
|------|-----------|--------------|
| **full-ai** | Claude Code + API key | AI-enhanced analysis |
| **hybrid** | Claude Code (no API) | Static + AI handoff |
| **standalone** | No Claude Code | Static analysis only |

## Generated Structure

```
your-project/
├── AI_CONTEXT.md                    # Universal entry point
├── .ai-context/                     # Context engineering system
│   ├── agents/                      # 6 specialized agents
│   ├── commands/                    # 11 slash commands
│   ├── context/
│   │   ├── workflows/               # Auto-generated workflow docs
│   │   ├── ARCHITECTURE_SNAPSHOT.md
│   │   └── CODE_TO_WORKFLOW_MAP.md
│   └── indexes/                     # Navigation hierarchy
├── .github/
│   └── copilot-instructions.md      # GitHub Copilot
├── .clinerules                      # Cline
└── .agent/                          # Antigravity
    ├── rules/
    ├── workflows/
    └── skills/
```

## Tech Stack Presets

```bash
npx create-universal-ai-context -t python-fastapi
npx create-universal-ai-context -t python-django
npx create-universal-ai-context -t node-express
npx create-universal-ai-context -t node-nestjs
npx create-universal-ai-context -t typescript-nextjs
npx create-universal-ai-context -t go-gin
npx create-universal-ai-context -t rust-actix
npx create-universal-ai-context -t ruby-rails
```

## Features

### RPI Workflow
- `/rpi-research` - Systematic codebase exploration
- `/rpi-plan` - Implementation blueprints with file:line precision
- `/rpi-implement` - Atomic changes with continuous testing

### Specialized Agents
- `@context-engineer` - Setup and maintenance
- `@core-architect` - System design
- `@database-ops` - Database operations
- `@api-developer` - API development
- `@integration-hub` - External services
- `@deployment-ops` - CI/CD and infrastructure

## Migration from v1.x

If you have an existing `.claude/` directory:

```bash
npx create-universal-ai-context migrate
```

This will:
- Rename `.claude/` to `.ai-context/`
- Rename `CLAUDE.md` to `AI_CONTEXT.md`
- Generate additional AI tool outputs

## Requirements

- Node.js 18+

## Related Packages

- [`claude-context`](https://www.npmjs.com/package/claude-context) - CLI tools for validation, sync, and diagnostics
- [`claude-context-plugin`](https://www.npmjs.com/package/claude-context-plugin) - Claude Code plugin with RPI workflow

## Development

```bash
git clone https://github.com/SireJeff/claude-context-engineering-template.git
cd claude-context-engineering-template/packages/create-ai-context
npm install
npm test
```

## License

MIT

## Links

- [GitHub](https://github.com/SireJeff/claude-context-engineering-template)
- [Documentation](https://github.com/SireJeff/claude-context-engineering-template#readme)
- [Issues](https://github.com/SireJeff/claude-context-engineering-template/issues)
