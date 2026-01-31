<p align="center">
  <img src="ccl_logo.jpg" alt="CCL Logo" width="200" height="200">
</p>

# Universal AI Context Engineering

![npm](https://img.shields.io/npm/v/create-universal-ai-context)
![npm downloads](https://img.shields.io/npm/dm/create-universal-ai-context)
![GitHub Stars](https://img.shields.io/github/stars/SireJeff/claude-context-engineering-template?style=social)
![GitHub License](https://img.shields.io/github/license/SireJeff/claude-context-engineering-template)

**One command to set up AI-friendly documentation for your codebase.**

Supports: **Claude Code**, **GitHub Copilot**, **Cline**, **Antigravity**, **Windsurf**, **Aider**, **Continue**

---

## Quick Start

```bash
npx create-universal-ai-context
```

That's it. The CLI will:
1. Analyze your codebase (languages, frameworks, entry points)
2. Generate optimized context files for your chosen AI tools
3. Set up persistent documentation that stays in sync with your code

### Options

| Flag | Purpose |
|------|---------|
| `--ai <tool>` | Generate for specific tool (claude, copilot, cline, antigravity, windsurf, aider, continue, all) |
| `--yes` | Skip all prompts |
| `--static` | Force static analysis (no AI) |

---

## What Gets Generated

| AI Tool | Output File | What It Contains |
|---------|-------------|------------------|
| **Claude Code** | `AI_CONTEXT.md` + `.ai-context/` | Project nav, workflows, commands, agents |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Tech stack, patterns, conventions |
| **Cline** | `.clinerules` | Architecture, commands, gotchas |
| **Antigravity** | `.agent/` (10 files) | Identity, workflows, skills |
| **Windsurf** | `.windsurf/rules.md` | XML-tagged rules for Cascade AI |
| **Aider** | `.aider.conf.yml` | YAML configuration |
| **Continue** | `.continue/config.json` | JSON configuration with slash commands |

### Analysis Includes

- **Entry points** - API routes, CLI handlers, event listeners
- **Workflows** - Auth, payments, data processing patterns
- **Tech stack** - Languages, frameworks, dependencies
- **Architecture** - Directory structure, layers, patterns

Supports: Express, FastAPI, Next.js, Django, Rails, NestJS

---

## Common Commands

```bash
# Regenerate context files
npx create-universal-ai-context generate

# Check installation status
npx create-universal-ai-context status

# Sync contexts across AI tools
npx create-universal-ai-context sync:all

# Install git hooks for auto-sync
npx create-universal-ai-context hooks:install
```

---

## Why Use This?

| Problem | Solution |
|---------|----------|
| AI reads entire files | Pre-built indexes point to relevant code |
| Context fills with irrelevant content | Progressive loading: index → workflow → code |
| Knowledge lost between sessions | Session persistence across Claude Code restarts |
| Docs drift out of sync | Automatic drift detection and sync |

---

## Project Structure

```
your-project/
├── AI_CONTEXT.md                # Universal entry point
├── .ai-context/                 # Single source of truth
│   ├── agents/                  # 6 specialized agents
│   ├── commands/                # 11 slash commands
│   ├── context/workflows/       # Auto-generated docs
│   └── indexes/                 # Navigation hierarchy
├── .claude/                     # Claude Code (symlinks to .ai-context/)
├── .github/copilot-instructions.md
├── .clinerules
├── .windsurf/rules.md
├── .aider.conf.yml
└── .continue/config.json
```

---

## Advanced Features

### Cross-Tool Sync
When you edit `AI_CONTEXT.md`, changes propagate to other tools automatically.

```bash
npx create-universal-ai-context sync:from claude --strategy source_wins
```

### Drift Detection
Check if docs are out of sync with code.

```bash
npx create-universal-ai-context drift --all
```

### Session Persistence
Save and resume Claude Code sessions.

```bash
/session-save    # In Claude Code
/session-resume  # Restore previous session
```

### Git Hooks
Auto-sync on commits.

```bash
npx create-universal-ai-context hooks:install
```

---

## CLI Reference (Inside Claude Code)

Once installed, use these slash commands:

| Command | Purpose |
|---------|---------|
| `/rpi-research` | Explore codebase, create research doc |
| `/rpi-plan` | Create implementation plan |
| `/rpi-implement` | Execute with atomic commits |
| `/validate-all` | Run full validation suite |
| `/auto-sync` | Sync docs with code |
| `/session-save` | Save session state |

---

## Configuration

Tech stack presets available:

`python`, `python-django`, `node`, `node-nestjs`, `typescript-remix`, `go`, `rust`, `ruby`, `java-spring`, `csharp-dotnet`, `php-laravel`

```bash
npx create-universal-ai-context --stack python-django
```

---

## FAQ

**Q: Does this modify my code?**
A: No. Only generates documentation files.

**Q: Can I customize the generated docs?**
A: Yes. Edit `.ai-context/` files directly. Your changes persist (except on `--force` regenerate).

**Q: What if I only use one AI tool?**
A: Use `--ai <tool>` to generate only what you need.

**Q: How do I update the docs after code changes?**
A: Run `npx create-universal-ai-context generate` or use `/auto-sync` in Claude Code.

---

## License

MIT

---

**Version:** 2.4.0 | **Updated:** 2026-01-31
