# Contributing to Claude Code Context Engineering Template

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

### CLI Tooling Contributions
For changes to `.claude/tools/`:
- Follow existing code patterns in `lib/`
- Add appropriate error handling using `lib/errors.js` classes
- Update schemas in `.claude/schemas/` if adding new structures
- Run `npx claude-context validate --all` before submitting

### Quality Standards
- Review the [Quality Checklist](.claude/standards/QUALITY_CHECKLIST.md)
- For extensions, follow the [Extension Guidelines](.claude/standards/EXTENSION_GUIDELINES.md)

## Issue Reporting

When creating an issue, please provide:
- **Description**: A clear description of the problem or suggestion
- **Steps to Reproduce**: For bugs, detailed steps to reproduce
- **Expected vs Actual Behavior**: What you expected to happen vs what actually happened
- **Environment**: Your environment details (Claude Code version, etc.)

## Pull Request Process

1. **Update the README** if you change functionality that users need to know about
2. **Add tests** if you add new functionality
3. **Update documentation** if you change existing functionality
4. **Ensure tests pass**
5. **Submit your PR** with a clear description of changes

## Code of Conduct

This project adheres to the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Contact

For questions or discussions, please open an issue or reach out to the maintainers.
