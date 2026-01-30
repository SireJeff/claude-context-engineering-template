# Contributing to Universal AI Context Engineering Template

We love contributions! Whether you're fixing a bug, improving documentation, or adding new features, we want your input. Here's how you can contribute:

## Getting Started

### Prerequisites
- Basic knowledge of Markdown
- Familiarity with the context engineering concepts described in the README
- Git knowledge (for submitting changes)
- Node.js 18+ (for CLI tooling contributions)

### Setting Up
1. Fork the repository
2. Create a new branch for your changes: `git checkout -b feature/your-feature`
3. Make your changes
4. Submit a pull request

## Contribution Guidelines

### Code Contributions
- **Small, focused changes**: Prefer small, atomic changes that solve one problem
- **Testing**: If applicable, include tests for new functionality
- **Documentation**: Update documentation when adding or changing functionality
- **Style**: Follow the existing code style and formatting

### Documentation Contributions
- **Clarity**: Write clear, concise documentation
- **Consistency**: Maintain consistent terminology and formatting
- **Completeness**: Ensure all features and usage patterns are documented
- **Cross-Tool Sync**: Document new sync features in README and CHANGELOG
- **CLI Commands**: Update help text and examples for new commands
- **Symlink Architecture**: Document symlink behavior and fallback modes

### CLI Tooling Contributions
For changes to `.ai-context/tools/`:
- Follow existing code patterns in `lib/`
- Add appropriate error handling using `lib/errors.js` classes
- Update schemas in `.ai-context/schemas/` if adding new structures
- Run `npx create-universal-ai-context validate --all` before submitting

### npm Package Contributions
For changes to `packages/create-ai-context/`:
- Run tests: `cd packages/create-ai-context && npm test`
- Ensure coverage: `npm run test:coverage`
- Update package README if adding features
- Follow existing code patterns in `lib/`

### Symlink Architecture Contributions
For changes to `lib/adapters/claude.js` (symlink generation):
- Test symlink creation on Windows, macOS, and Linux
- Verify fallback to copy mode when symlinks aren't supported
- Update `.claude/README.md` if symlink structure changes
- Run E2E tests: `npm test -- tests/e2e/`
- Run integration tests: `npm test -- tests/integration/`

### Cross-Tool Sync Contributions
For changes to `lib/cross-tool-sync/`:
- Ensure file hashing works correctly (SHA-256)
- Test with all conflict resolution strategies
- Verify git hooks installation
- Test sync state persistence
- Run: `npm test -- tests/unit/cross-tool-sync.test.js`

### Quality Standards
- Review the [Quality Checklist](.ai-context/standards/QUALITY_CHECKLIST.md)
- For extensions, follow the [Extension Guidelines](.ai-context/standards/EXTENSION_GUIDELINES.md)

## Areas Looking for Contributors

### New AI Tool Support
We're looking for contributors to add support for:
- **Cursor** - Have their context format? Help us integrate
- **Windsurf** - Know their API? Contribute an adapter
- **Aider** - Want to add support? PRs welcome
- **Continue** - Help build the universal standard

See `lib/adapters/` for examples of existing adapters.

### Carbon Efficiency
- Implement token usage tracking
- Build carbon footprint calculator
- Add energy-aware context optimization

### Documentation
- Improve cross-tool sync documentation
- Write tutorials for specific use cases
- Create video demos

## Issue Reporting

When creating an issue, please provide:
- **Description**: A clear description of the problem or suggestion
- **Steps to Reproduce**: For bugs, detailed steps to reproduce
- **Expected vs Actual Behavior**: What you expected to happen vs what actually happened
- **Environment**: Your environment details (OS, Node.js version, AI tool)

## Pull Request Process

1. **Update the README** if you change functionality that users need to know about
2. **Add tests** if you add new functionality
3. **Update documentation** if you change existing functionality
4. **Update CHANGELOG.md** with your changes
5. **Ensure tests pass** (all 453+ tests)
6. **Submit your PR** with a clear description of changes

## Development Workflow

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/claude-context-engineering-template.git
cd claude-context-engineering-template

# Install dependencies
cd packages/create-ai-context && npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Link for local testing
npm link
create-universal-ai-context --version
```

## Code of Conduct

This project adheres to the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Vision

We're building toward the **Universal AI Context Standard** — an open specification that all AI coding tools can adopt for efficient, carbon-aware context management. Every contribution brings us closer to that goal.

## Contact

For questions or discussions, please open an issue or reach out to the maintainers.

---

**Version:** 2.3.0 | **Last Updated:** 2026-01-30
