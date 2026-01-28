# Compatibility Guide

Version compatibility information for Claude Context Engineering.

## Template Versions

### Current Version: 1.0.0

**Release Date:** {{DATE}}

**Supported Claude Code Versions:** All versions with 200k context window

**Node.js Requirement:** 18.x or higher

## Version History

| Version | Release | Status | Notes |
|---------|---------|--------|-------|
| 1.0.0 | {{DATE}} | Current | Initial release |

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x → 2.x.x): Breaking changes
- **MINOR** (1.0.x → 1.1.x): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## Breaking Changes

### What Constitutes a Breaking Change

- Schema format changes requiring migration
- Removed or renamed configuration options
- Changed directory structure requirements
- Modified CLI command syntax
- Removed agents, commands, or workflows

### How Breaking Changes Are Handled

1. **Announced** in CHANGELOG and release notes
2. **Documented** with migration guide
3. **Deprecated** features have 2 minor versions notice
4. **Migration scripts** provided when possible

## Extension Compatibility

### Specifying Compatibility

In your extension `manifest.json`:

```json
{
  "claude_context_version": "^1.0.0"
}
```

### Version Range Examples

| Range | Meaning | Matches |
|-------|---------|---------|
| `1.0.0` | Exact version | 1.0.0 only |
| `^1.0.0` | Compatible with 1.x.x | 1.0.0, 1.1.0, 1.2.3 |
| `~1.0.0` | Patch updates only | 1.0.0, 1.0.1, 1.0.2 |
| `>=1.0.0 <2.0.0` | Range | 1.x.x |
| `*` | Any version | All (not recommended) |

### Recommended Practice

Use caret (`^`) for most extensions:
```json
{
  "claude_context_version": "^1.0.0"
}
```

This allows patch and minor updates while preventing breaking changes.

## Schema Compatibility

### Schema Versioning

Schemas include version in their `$id`:
```json
{
  "$id": "https://claude-context.dev/schemas/settings-v1.json"
}
```

### Schema Changes

| Change Type | Version Impact | Migration |
|-------------|----------------|-----------|
| Add optional field | None | Automatic |
| Add required field | Minor bump | Defaults provided |
| Remove field | Major bump | Migration required |
| Change field type | Major bump | Migration required |
| Rename field | Major bump | Migration required |

## Configuration Compatibility

### Adding New Settings

New settings always have defaults:
```json
{
  "new_feature": {
    "enabled": false  // Default: opt-in
  }
}
```

### Deprecating Settings

Deprecated settings:
1. Continue to work for 2 minor versions
2. Log deprecation warning
3. Document replacement in CHANGELOG
4. Remove in next major version

Example deprecation notice:
```json
{
  "old_setting": "DEPRECATED: Use new_setting instead"
}
```

## CLI Compatibility

### Command Stability

| Stability | Description | Change Policy |
|-----------|-------------|---------------|
| Stable | Production ready | No breaking changes in minor versions |
| Beta | Feature complete | May change in minor versions |
| Alpha | Experimental | May change in any version |

### Current Command Status

| Command | Stability |
|---------|-----------|
| `init` | Stable |
| `validate` | Stable |
| `diagnose` | Stable |
| `config` | Stable |

## Migration Guides

### Migrating Between Versions

When upgrading, check:
1. CHANGELOG for breaking changes
2. Migration guide (if major version)
3. Run `npx claude-context validate` after upgrade

### Migration Scripts

For major versions, migration scripts are provided:
```bash
npx claude-context migrate --from 1.x --to 2.x
```

## Testing Compatibility

### Before Upgrading

1. Review CHANGELOG for your current → target version
2. Check extension compatibility
3. Run validation on current version
4. Backup `.ai-context/` directory
5. Upgrade and re-validate

### Extension Testing Matrix

Test your extension against:
- Current stable version
- Latest minor version of each major
- Next release candidate (optional)

## Reporting Issues

### Compatibility Issue Template

When reporting compatibility issues, include:
- Template version
- Extension version (if applicable)
- Node.js version
- Operating system
- Error message or unexpected behavior
- Steps to reproduce

### Where to Report

- Template issues: [GitHub Issues]({{REPO_URL}}/issues)
- Extension issues: Extension's repository
- Security issues: security@claude-context.dev (example)

## Support Policy

### Version Support Duration

| Version Type | Support Duration |
|--------------|------------------|
| Current major | Full support |
| Previous major | Security fixes for 12 months |
| Older versions | Community support only |

### End of Life (EOL)

EOL versions:
- No longer receive updates
- May have known issues
- Should upgrade to supported version

## Related

- [Extension Guidelines](./EXTENSION_GUIDELINES.md)
- [Quality Checklist](./QUALITY_CHECKLIST.md)
- [CHANGELOG](../../CHANGELOG.md)
