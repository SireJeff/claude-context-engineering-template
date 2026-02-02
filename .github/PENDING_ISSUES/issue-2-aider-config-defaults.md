# [FEATURE] Improve Aider configuration with sensible defaults

## Feature Request

### Problem Statement

The Aider AI pair-programmer configuration generated during package installation lacks sensible default settings. Users must manually configure many options that could have reasonable defaults.

Current issues:
1. **Conflicting Settings:** `auto-commits: true` and `auto-commit: false` are confusing
2. **No Default Model:** Model is commented out, requiring manual selection
3. **Missing Important Defaults:** No `map-tokens`, `chat-history`, or `stream` settings
4. **Inconsistent Documentation:** Some settings have comments, others don't

### Proposed Solution

Update the `aider-config.hbs` template with:
- Organized sections with clear headers
- Conservative defaults (auto-commit disabled for safety)
- Modern model recommendations (Claude Sonnet)
- Context optimization settings (map-tokens: 2048)
- Proper integration with test and lint commands
- Compatibility notes for different Aider versions

### Use Cases

1. New users get a working configuration out of the box
2. Teams have consistent starting points for Aider configuration
3. Better integration with the AI context engineering workflow

### Feature Category

- [x] CLI tooling
- [ ] Symlink architecture
- [ ] Cross-tool synchronization
- [x] New AI tool adapter (Cursor, Windsurf, Aider, Continue, etc.)
- [x] Documentation/Templates
- [ ] Carbon efficiency
- [x] Token optimization
- [ ] Agents
- [ ] Commands
- [x] Configuration
- [ ] Validation
- [ ] Extension system
- [ ] Team collaboration
- [ ] CI/CD integration

### Impact

**Who would benefit:** All users of Aider with this package

**Frequency of use:** Daily (every Aider session)

**Token Efficiency Impact:**
- [x] Reduces token waste (estimated: 10-15%)
- [x] Improves context accuracy (estimated: 20%)

### Implementation Ideas

1. Update `packages/create-ai-context/templates/handlebars/aider-config.hbs`
2. Add detection for IDE preference in static analyzer
3. Update tests in `packages/create-ai-context/tests/unit/adapters/aider.test.js`

---

### Checklist

- [x] Searched existing issues and feature requests
- [x] Provided clear problem statement
- [x] Described at least one use case
- [x] Considered impact on existing features

---

**Priority:** MEDIUM
**Labels:** `enhancement`, `aider`, `configuration`
**Effort:** Low (1-2 hours)
