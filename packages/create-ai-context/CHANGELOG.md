# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- MCP server CLI commands: `mcp:init`, `mcp:status`, `mcp:start`, `mcp:watch`, `mcp:migrate`, `mcp:export`, `mcp:sync`
- Cross-tool export from MCP database to all AI tool formats

### Fixed
- **Post-commit hook file revision bug**: Fixed issue where post-commit hooks triggered file regeneration, creating uncommitted changes after each commit. Hooks now use `sync:state` instead of `sync:all` to only update state tracking.
- Improved error reporting in sync:all and sync:from commands (no more "undefined" errors)
- Fixed --fail-on-unreplaced option to properly validate placeholders using strict boolean check
- Replaced hardcoded tool lists with dynamic getAdapterNames() calls throughout CLI

### Added
- **New `sync:state` command**: Updates sync state tracking without regenerating files (used by post-commit hooks)
- **New `updateSyncStateOnly()` function**: Core function for lightweight state-only sync operations
- Added windsurf, aider, continue to supported AI tools in CLI
- Added test coverage for sync error reporting
- Added test coverage for --fail-on-unreplaced option
- Added test coverage for dynamic tool lists
- Added tests for updateSyncStateOnly function

### Changed
- **Post-commit hooks**: Now use `sync:state` instead of `sync:all` to prevent file revision loop
- **Aider config template**: Improved with better defaults, organized sections, and clearer documentation
- **Context Engineer agent**: Updated to v2.0.0 with cross-tool sync integration and support for all AI tools
- AI_TOOLS array now includes all available adapters (claude, copilot, cline, antigravity, windsurf, aider, continue)
- Tool lists throughout CLI now use getAdapterNames() for consistency
- Updated --ai option help text to include all supported tools

## [2.4.0] - 2025-01-26

### Added
- Windsurf IDE adapter support
- Aider adapter support
- Continue adapter support
- --fail-on-unreplaced CLI flag for placeholder validation
- Error logging for backup and restore failures
- Path utilities and fs-wrapper for cross-platform support
- --force flag and custom content migration
- Tool coordination headers and footers to templates
- Content preservation and tool coordination modules

### Changed
- Improved symlink architecture for .claude/
- Better handling of existing documentation

## [2.3.0]

### Added
- Symlink architecture between .claude/ and .ai-context/
- Zero duplication of context files
- Automatic sync across AI tools

## [2.2.0]

### Added
- Cross-tool synchronization
- Git hooks for automatic sync
- Drift detection and smart merge

## [2.1.0]

### Added
- Documentation discovery
- Drift detection
- Smart merge capabilities
- Self-sustaining automation

## [2.0.0]

### Added
- Universal AI Context Engineering
- Support for multiple AI tools from single source
- .ai-context/ directory structure
- Workflow documentation
- Agent system
- Command system

## [1.2.0]

### Added
- Automatic codebase analysis
- Entry point detection
- Framework detection

## [1.1.0]

### Added
- CLI tooling
- Schema definitions
- Team features
- Industry-level enhancements

## [1.0.0]

### Added
- Initial release
- Claude Code support
- Basic context templates
