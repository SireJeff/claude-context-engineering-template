# Quality Checklist

Use this checklist to ensure your Claude Context Engineering implementation meets quality standards.

## For Projects Using the Template

### Initial Setup

- [ ] All `{{PLACEHOLDER}}` values replaced with project-specific content
- [ ] CLAUDE.md customized for your codebase
- [ ] Tech stack correctly identified
- [ ] File paths in documentation are accurate
- [ ] Line numbers in code references are current

### Documentation Quality

- [ ] INDEX files reflect actual directory structure
- [ ] Workflow documents describe real system behavior
- [ ] Architecture snapshot matches current architecture
- [ ] Known gotchas are documented and current
- [ ] Code-to-workflow map is accurate

### Context Budget

- [ ] Total documentation under 40% of context budget (~80K tokens)
- [ ] No single file exceeds 10K tokens
- [ ] Indexes are concise pointers, not content dumps
- [ ] Rarely-used content in separate files

### Validation

- [ ] `npx claude-context validate --all` passes
- [ ] All internal links resolve
- [ ] JSON files pass schema validation
- [ ] No broken file references

---

## For Extension Authors

### Structure

- [ ] `manifest.json` present and valid
- [ ] `README.md` complete with all sections
- [ ] `LICENSE` file included
- [ ] `CHANGELOG.md` documents version history
- [ ] Directory structure follows convention

### Manifest

- [ ] `name` is lowercase with hyphens only
- [ ] `version` follows semver (MAJOR.MINOR.PATCH)
- [ ] `description` is under 200 characters
- [ ] `author` information complete
- [ ] `license` is valid SPDX identifier
- [ ] `claude_context_version` specifies compatibility
- [ ] `contents` lists all provided components

### Documentation

- [ ] Installation instructions clear and tested
- [ ] All components documented with examples
- [ ] Configuration requirements specified
- [ ] Troubleshooting section included
- [ ] No placeholder text remains

### Code Quality

- [ ] Agents follow frontmatter schema
- [ ] Commands follow frontmatter schema
- [ ] Workflows follow workflow schema
- [ ] All required metadata present
- [ ] Context budgets documented

### Testing

- [ ] Installs without errors
- [ ] All examples work as documented
- [ ] No conflicts with base template
- [ ] Tested with specified template version

### Security

- [ ] No hardcoded secrets or API keys
- [ ] No personal data included
- [ ] External calls documented
- [ ] File operations are safe
- [ ] License is compatible

---

## For Template Contributors

### Code Changes

- [ ] Follows existing code style
- [ ] Includes appropriate tests
- [ ] Documentation updated
- [ ] CHANGELOG entry added
- [ ] Breaking changes documented

### Schema Changes

- [ ] Schema version incremented
- [ ] Migration path documented
- [ ] Backward compatibility considered
- [ ] Examples updated

### Documentation Changes

- [ ] Links verified
- [ ] Line numbers updated
- [ ] Consistent formatting
- [ ] Grammar and spelling checked

### Pull Request

- [ ] Clear description of changes
- [ ] Issue reference (if applicable)
- [ ] Tests passing
- [ ] Documentation updated
- [ ] CHANGELOG updated

---

## Validation Commands

Run these commands to validate your implementation:

```bash
# Full validation suite
npx claude-context validate --all

# Specific validations
npx claude-context validate --schema      # JSON schemas
npx claude-context validate --links       # Internal links
npx claude-context validate --placeholders # Unreplaced placeholders
npx claude-context validate --structure   # Directory structure
npx claude-context validate --lines       # Line number accuracy

# Diagnostics
npx claude-context diagnose               # System health check
npx claude-context diagnose --fix         # Auto-fix issues
```

## Quality Levels

### Level 1: Minimal (Required)

- All placeholders replaced
- Basic documentation present
- Validation passes
- No broken links

### Level 2: Standard (Recommended)

- Complete documentation
- Accurate line numbers (>60%)
- Context budget under 40%
- Regular validation in CI

### Level 3: Exemplary (Best Practice)

- Comprehensive documentation
- Line accuracy >80%
- Context budget under 30%
- Automated documentation updates
- Full CI/CD integration

## Common Issues

### Placeholder Not Replaced

**Symptom:** `{{PLACEHOLDER}}` appears in output

**Fix:** Search for all `{{` patterns and replace:
```bash
grep -r "{{" .claude/
```

### Broken Internal Link

**Symptom:** Link validation fails

**Fix:** Update link path or create missing file:
```bash
npx claude-context validate --links --verbose
```

### Context Budget Exceeded

**Symptom:** Documentation >40% of budget

**Fix:**
1. Split large files
2. Move details to separate files
3. Compact verbose sections

### Line Number Drift

**Symptom:** Code references point to wrong lines

**Fix:**
```bash
npx claude-context diagnose --fix
```

## Related

- [Extension Guidelines](./EXTENSION_GUIDELINES.md)
- [Compatibility Guide](./COMPATIBILITY.md)
