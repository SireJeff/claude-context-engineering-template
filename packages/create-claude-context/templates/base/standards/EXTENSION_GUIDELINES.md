# Extension Publishing Guidelines

Standards and requirements for publishing Claude Context Engineering extensions.

## Overview

Extensions enhance the Context Engineering template with additional agents, commands, workflows, and integrations. This guide covers requirements for publishing extensions to the community registry.

## Extension Types

| Type | Description | Directory |
|------|-------------|-----------|
| **Agent** | Specialized AI assistant | `.claude/extensions/[name]/agents/` |
| **Command** | Custom slash command | `.claude/extensions/[name]/commands/` |
| **Workflow** | Domain workflow documentation | `.claude/extensions/[name]/workflows/` |
| **Adapter** | Framework-specific configuration | `.claude/extensions/[name]/adapters/` |
| **Integration** | Third-party service integration | `.claude/extensions/[name]/integrations/` |

## Extension Structure

```
my-extension/
├── manifest.json        # Required: Extension metadata
├── README.md            # Required: Documentation
├── LICENSE              # Required: License file
├── CHANGELOG.md         # Recommended: Version history
├── agents/              # Agent definitions
│   └── my-agent.md
├── commands/            # Command definitions
│   └── my-command.md
├── workflows/           # Workflow documentation
│   └── my-workflow.md
├── schemas/             # Custom schemas
│   └── my-schema.json
└── tests/               # Extension tests
    └── validate.js
```

## Manifest Requirements

Every extension must include a `manifest.json`:

```json
{
  "$schema": "https://claude-context.dev/schemas/extension-manifest-v1.json",
  "name": "my-extension",
  "version": "1.0.0",
  "displayName": "My Extension",
  "description": "Brief description of what this extension provides",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "license": "MIT",
  "repository": "https://github.com/author/my-extension",
  "keywords": ["keyword1", "keyword2"],
  "claude_context_version": "^1.0.0",
  "contents": {
    "agents": ["my-agent"],
    "commands": ["my-command"],
    "workflows": ["my-workflow"]
  },
  "dependencies": {},
  "peerDependencies": {}
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (lowercase, hyphens only) |
| `version` | Semantic version (MAJOR.MINOR.PATCH) |
| `displayName` | Human-readable name |
| `description` | Brief description (max 200 chars) |
| `author` | Author information |
| `license` | SPDX license identifier |
| `claude_context_version` | Compatible template version |
| `contents` | What the extension provides |

## Documentation Requirements

### README.md Must Include

1. **Title and Description** - What the extension does
2. **Installation** - How to install
3. **Usage** - How to use each component
4. **Configuration** - Any required configuration
5. **Examples** - Working examples
6. **Troubleshooting** - Common issues
7. **License** - License information

### Minimum README Template

```markdown
# Extension Name

Brief description.

## Installation

\`\`\`bash
npx claude-context extension install extension-name
\`\`\`

## Usage

### Agent: @agent-name

Description and usage.

### Command: /command-name

Description and usage.

## Configuration

Required configuration steps.

## Examples

Working examples.

## License

MIT License
```

## Code Standards

### Agents

- Follow frontmatter schema
- Include all required metadata
- Document capabilities clearly
- Provide usage examples
- Specify context budget

### Commands

- Follow frontmatter schema
- Document all subcommands
- Include input/output examples
- Specify prerequisites
- Document error handling

### Workflows

- Follow workflow schema
- Include file:line references
- Document integration points
- Keep under 5000 tokens

## Quality Requirements

Before submitting, ensure:

- [ ] All files pass schema validation
- [ ] README is complete and accurate
- [ ] All examples work correctly
- [ ] No placeholder text remains
- [ ] License file included
- [ ] CHANGELOG documents changes
- [ ] Tests pass (if included)
- [ ] Context budget is documented
- [ ] No sensitive data included

## Versioning

Follow Semantic Versioning (SemVer):

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Version Compatibility

Specify `claude_context_version` using semver ranges:

```json
{
  "claude_context_version": "^1.0.0"  // 1.x.x
}
```

## Submission Process

### 1. Prepare Extension

- Complete all required files
- Run quality checklist
- Test with target template version

### 2. Create Repository

- Host on GitHub (public)
- Include all required files
- Tag release with version

### 3. Submit for Review

Open an issue using the Extension Submission template:
- Provide repository URL
- Describe the extension
- List tested versions

### 4. Review Process

Maintainers will:
1. Validate manifest and structure
2. Review documentation quality
3. Test installation and functionality
4. Check for security issues
5. Verify license compatibility

### 5. Publication

Once approved:
- Added to community registry
- Listed in extension search
- Announced in release notes

## Maintenance

### Ongoing Requirements

- Respond to issues within 14 days
- Update for breaking template changes
- Maintain documentation accuracy
- Follow security advisories

### Deprecation

To deprecate an extension:
1. Add `"deprecated": true` to manifest
2. Document migration path in README
3. Keep available for 6 months minimum

## Security Guidelines

### Do NOT Include

- API keys or secrets
- Personal data
- Executable binaries
- Minified/obfuscated code
- External network calls without disclosure

### Security Review

Extensions with these features require extra review:
- External API integrations
- File system operations
- Code execution
- Configuration of sensitive settings

## License Requirements

Acceptable licenses (SPDX identifiers):
- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC
- MPL-2.0

Other licenses reviewed case-by-case.

## Support

- GitHub Issues for bug reports
- Discussions for questions
- Security issues: security@claude-context.dev (example)

## Related

- [Quality Checklist](./QUALITY_CHECKLIST.md)
- [Compatibility Guide](./COMPATIBILITY.md)
- [Extension Manifest Schema](../schemas/manifest.schema.json)
