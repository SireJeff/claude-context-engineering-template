# @sirejeff/create-ai-context

Universal AI context engineering for any codebase. Generates optimized context for **Claude Code**, **GitHub Copilot**, **Cline**, **Antigravity**, and more.

![npm](https://img.shields.io/npm/v/@sirejeff/create-ai-context)
![npm downloads](https://img.shields.io/npm/dm/@sirejeff/create-ai-context)

## Quick Start

```bash
npx @sirejeff/create-ai-context
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
npx create-ai-context                    # Auto-detect and generate for all tools

# Select specific AI tools
npx create-ai-context --ai claude        # Claude Code only
npx create-ai-context --ai copilot       # GitHub Copilot only
npx create-ai-context --ai cline         # Cline only
npx create-ai-context --ai antigravity   # Antigravity only
npx create-ai-context --ai all           # All tools (default)

# Analysis modes
npx create-ai-context --static           # Force static analysis only
npx create-ai-context --force-ai         # Require Claude Code session

# Other options
npx create-ai-context --yes              # Accept all defaults
npx create-ai-context --dry-run          # Preview without changes
npx create-ai-context my-project         # Create in new directory
```

## Subcommands

```bash
# Generate context for specific tools
npx create-ai-context generate --ai copilot

# Check installation status
npx create-ai-context status

# Migrate from v1.x
npx create-ai-context migrate
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
npx create-ai-context -t python-fastapi
npx create-ai-context -t python-django
npx create-ai-context -t node-express
npx create-ai-context -t node-nestjs
npx create-ai-context -t typescript-nextjs
npx create-ai-context -t go-gin
npx create-ai-context -t rust-actix
npx create-ai-context -t ruby-rails
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
npx create-ai-context migrate
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
