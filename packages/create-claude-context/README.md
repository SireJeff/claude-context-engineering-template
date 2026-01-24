# create-claude-context

Set up Claude Context Engineering for any project with a single command.

## Quick Start

```bash
npx create-claude-context
```

Or with npm init:

```bash
npm init claude-context
```

## What It Does

This CLI tool sets up a complete context engineering system for your codebase:

1. **Creates `.claude/` directory** - Context engineering documentation
2. **Creates `CLAUDE.md`** - Entry point for Claude Code
3. **Detects tech stack** - Auto-configures for your project
4. **Installs plugin** - Adds ongoing commands (optional)

## Options

```bash
npx create-claude-context [project-name] [options]

Options:
  -y, --yes          Skip prompts, use defaults
  --no-plugin        Skip Claude Code plugin installation
  -t, --template     Use a tech stack preset
  --no-git           Skip git initialization
  --dry-run          Show what would be done
  -v, --verbose      Show detailed output
  -V, --version      Output version number
  -h, --help         Display help
```

## Tech Stack Presets

```bash
# Python
npx create-claude-context -t python-fastapi
npx create-claude-context -t python-django

# JavaScript/TypeScript
npx create-claude-context -t node-express
npx create-claude-context -t node-nestjs
npx create-claude-context -t typescript-nextjs
npx create-claude-context -t typescript-remix

# Other Languages
npx create-claude-context -t go-gin
npx create-claude-context -t rust-actix
npx create-claude-context -t ruby-rails
npx create-claude-context -t java-spring
npx create-claude-context -t csharp-dotnet
npx create-claude-context -t php-laravel
```

## Features

After setup, you get:

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

### Documentation System
- 3-level index hierarchy
- File:line references
- Self-maintaining documentation
- Validation commands

## Directory Structure

```
your-project/
├── CLAUDE.md                 # Entry point for Claude
└── .claude/
    ├── agents/               # Specialized agents
    ├── commands/             # Slash commands
    ├── context/              # Pre-computed knowledge
    │   ├── workflows/        # Workflow documentation
    │   └── WORKFLOW_INDEX.md # Master index
    ├── indexes/              # Navigation hierarchy
    ├── plans/                # Implementation plans
    ├── research/             # Research documents
    └── schemas/              # JSON validation
```

## Requirements

- Node.js 18+
- Claude Code CLI

## Development

```bash
# Clone the repo
git clone https://github.com/SireJeff/claude-context-engineering-template.git
cd claude-context-engineering-template/packages/create-claude-context

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT

## Links

- [GitHub](https://github.com/SireJeff/claude-context-engineering-template)
- [Documentation](https://github.com/SireJeff/claude-context-engineering-template#readme)
- [Issues](https://github.com/SireJeff/claude-context-engineering-template/issues)
