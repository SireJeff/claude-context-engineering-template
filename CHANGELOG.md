# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-01-24

### Added

#### npm Packages (`packages/`)
- `create-claude-context` - CLI for one-command setup (`npx create-claude-context`)
- `claude-context-plugin` - Optional plugin with ongoing commands

#### Self-Sustaining Automation (`.claude/automation/`)
- `generators/code-mapper.js` - Auto-generates CODE_TO_WORKFLOW_MAP.md
- `generators/index-builder.js` - Rebuilds category indexes from content
- `hooks/pre-commit.sh` - Validates documentation before commits
- `hooks/post-commit.sh` - Rebuilds indexes after commits
- `config.json` - Automation configuration

#### Session Management (`.claude/session/`)
- `/session-save` command - Save session state with optional checkpoints
- `/session-resume` command - Resume previous sessions
- `current/state.json` - Active session tracking
- `history/` - Archived sessions by date
- `checkpoints/` - Named resume points

#### Drift Detection & Synchronization (`.claude/sync/`)
- `/auto-sync` command - Synchronize documentation with code
- `anchors.json` - Semantic anchors mapping (file::function() format)
- `hashes.json` - Content hashes for change detection
- `staleness.json` - Documentation freshness tracking
- Drift levels: NONE, LOW, MEDIUM, HIGH, CRITICAL

#### New JSON Schemas (`.claude/schemas/`)
- `automation.schema.json` - Automation config validation
- `session.schema.json` - Session state validation
- `anchors.schema.json` - Semantic anchors validation
- `hashes.schema.json` - File hashes validation
- `staleness.schema.json` - Staleness tracking validation
- `team-config.schema.json` - Team config validation
- `roles.schema.json` - Team roles validation

#### New Tools/Lib Modules
- `session-manager.js` - Session persistence and restoration
- `anchor-resolver.js` - Semantic anchor resolution (supports Python, JS, TS, Go, Rust, Ruby)
- `drift-detector.js` - Documentation drift detection

#### Unit Tests (`packages/create-claude-context/tests/`)
- 50+ unit tests for CLI modules
- Jest test framework with coverage reporting
- Test fixtures for Python, Node.js, and Go projects

#### New Tech Stack Presets (12 total)
- `python-django` - Python + Django + PostgreSQL
- `node-nestjs` - Node.js + NestJS + TypeORM
- `typescript-remix` - TypeScript + Remix + Prisma
- `java-spring` - Java + Spring Boot + PostgreSQL
- `csharp-dotnet` - C# + .NET Core + Entity Framework
- `php-laravel` - PHP + Laravel + MySQL

#### CI/CD Workflows (`.github/workflows/`)
- `ci.yml` - PR validation (lint, test, package integrity)
- `npm-publish.yml` - Automated npm publishing on release

#### Documentation Placeholders
- `FILE_OWNERSHIP.md` - Template for tracking file ownership
- `INTEGRATION_POINTS.md` - Template for documenting integrations
- `TESTING_MAP.md` - Template for test coverage mapping

### Changed
- `settings.json` now includes session, automation, hooks sections (v1.2.0)
- `tools/lib/index.js` exports new modules (sessionManager, anchorResolver, driftDetector)
- README completely rewritten with all 11 commands, 12 tech stacks, self-sustaining features
- Total commands increased from 8 to 11
- Total schemas increased from 7 to 14
- All templates synced with source files

### Fixed
- Schema references across all JSON config files
- Cross-references between documentation files
- Version consistency across all package.json files

---

## [1.1.0] - 2025-01-24

### Added

#### CLI Tooling (`.claude/tools/`)
- `claude-context` CLI with commands: `init`, `validate`, `diagnose`, `config`
- Tech stack auto-detection for 10+ frameworks
- Placeholder replacement engine
- Validation suite (schemas, links, placeholders, structure, line numbers)
- Structured logging with operation tracking
- Environment-aware configuration loading

#### JSON Schemas (`.claude/schemas/`)
- `settings.schema.json` - Settings validation
- `manifest.schema.json` - Extension manifest validation
- `agent.schema.json` - Agent file structure
- `command.schema.json` - Command file structure
- `workflow.schema.json` - Workflow documentation
- `research.schema.json` - RPI research documents
- `plan.schema.json` - RPI plan documents

#### Configuration System (`.claude/config/`)
- `base.json` - Base configuration
- `environments/development.json` - Development overrides
- `environments/staging.json` - Staging overrides
- `environments/production.json` - Production overrides
- `local.json.example` - Template for local overrides

#### New Commands
- `/help` - Comprehensive help system with command/agent reference
- `/collab` - Team collaboration (handoff, sync, status)
- `/analytics` - Local usage statistics and context metrics

#### CI/CD Templates (`.claude/ci-templates/`)
- `github-actions/validate-docs.yml` - PR documentation validation
- `github-actions/context-check.yml` - Weekly context budget check

#### Team Collaboration (`.claude/team/`)
- `config.json` - Team settings, members, integrations
- `roles.json` - Role definitions with permissions

#### Shared Knowledge Base (`.claude/knowledge/`)
- `shared/decisions/` - Architecture Decision Records (ADRs)
- `shared/patterns/` - Reusable code patterns
- `sessions/` - Session handoff documents

#### Community Standards (`.claude/standards/`)
- `EXTENSION_GUIDELINES.md` - Extension publishing standards
- `QUALITY_CHECKLIST.md` - Quality requirements
- `COMPATIBILITY.md` - Version compatibility guide

#### Documentation (`docs/`)
- `QUICK_START_5MIN.md` - Zero-to-working guide
- `TROUBLESHOOTING.md` - Common issues catalog

#### Other
- `.claude/indexes/agents/CAPABILITY_MATRIX.md` - Agent selection guide
- Enhanced GitHub issue/PR templates

### Changed
- All commands updated with standardized frontmatter (version, outputs, examples)
- All agents updated with rich metadata (capabilities, workflows, hooks)
- `.claude/settings.json` - Added schema reference, validation, logging sections
- `.gitignore` - Added entries for logs, state, cache, analytics

---

## [1.0.0] - 2025-12-06

### Added
- Initial release of Claude Code Context Engineering Template
- Comprehensive directory structure with agents, commands, context, indexes, research, and plans
- Agent architecture with specialized agents (context-engineer, core-architect, database-ops, api-developer, integration-hub, deployment-ops)
- RPI (Research-Plan-Implement) workflow methodology
- Self-maintaining documentation system with verification commands
- Validation framework with quality standards
- Production-ready template with validation framework

### Known Limitations
- Template requires initialization with context-engineer agent for specific projects
- Line number accuracy target of ≥60% (configurable)
- Context budget management targets <40% utilization

## Future Improvements
- Enhanced validation tools
- Additional specialized agents
- Improved documentation generation capabilities
- Extended RPI workflow features
