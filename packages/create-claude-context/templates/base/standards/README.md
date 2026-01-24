# Standards

Quality standards, guidelines, and compatibility information for Claude Context Engineering.

## Contents

| Document | Description |
|----------|-------------|
| [EXTENSION_GUIDELINES.md](./EXTENSION_GUIDELINES.md) | How to create and publish extensions |
| [QUALITY_CHECKLIST.md](./QUALITY_CHECKLIST.md) | Quality requirements and validation checklist |
| [COMPATIBILITY.md](./COMPATIBILITY.md) | Version compatibility and migration information |

## Quick Reference

### For Users

Use the [Quality Checklist](./QUALITY_CHECKLIST.md) to ensure your implementation meets standards:

```bash
# Run full validation
npx claude-context validate --all
```

### For Extension Authors

Follow the [Extension Guidelines](./EXTENSION_GUIDELINES.md) to create publishable extensions:

1. Structure your extension correctly
2. Include required manifest and documentation
3. Meet quality requirements
4. Submit for review

### For Contributors

Check [Compatibility](./COMPATIBILITY.md) when making changes:

- Follow semantic versioning
- Document breaking changes
- Provide migration paths

## Standards Summary

### Quality Levels

| Level | Requirements |
|-------|--------------|
| Minimal | Placeholders replaced, validation passes |
| Standard | Complete documentation, <40% context budget |
| Exemplary | >80% accuracy, <30% budget, CI integration |

### Extension Requirements

| Requirement | Status |
|-------------|--------|
| manifest.json | Required |
| README.md | Required |
| LICENSE | Required |
| CHANGELOG.md | Recommended |
| Tests | Recommended |

### Version Compatibility

- Use `^1.0.0` for extension compatibility ranges
- Major version = breaking changes
- Minor version = new features
- Patch version = bug fixes
