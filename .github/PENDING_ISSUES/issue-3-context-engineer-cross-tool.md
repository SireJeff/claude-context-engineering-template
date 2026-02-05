# [FEATURE] Update Context Engineer agent for universal cross-tool support

## Feature Request

### Problem Statement

The Context Engineer agent needs to be updated to be more efficient and work across all supported AI tools (Claude Code, GitHub Copilot, Cline, Antigravity, Windsurf, Aider, Continue) based on the new Universal AI Context Engineering flow.

Current limitations:
1. Designed primarily for Claude Code
2. Doesn't generate contexts for all supported tools simultaneously
3. Doesn't maintain cross-tool synchronization
4. Doesn't leverage tool-specific optimizations
5. Doesn't handle the new Universal AI flow properly

### Proposed Solution

Update the Context Engineer agent to v2.0.0 with:

1. **Multi-Tool Initialization:** Generate context for all 7 supported tools from a single initialization
2. **Cross-Tool Sync Integration:** Use the sync commands to maintain consistency
3. **Tool-Specific Optimizations:** Different detail levels for different tool context limits
4. **Efficiency Improvements:** Parallel operations, cached analysis, token budget management

### Key Changes

1. Add `supported_tools` list in YAML frontmatter
2. Add tool-specific context budget table
3. Update Phase 3 to "Universal Context Population"
4. Add new "Cross-Tool Synchronization" section
5. Add sync commands and best practices documentation

### Use Cases

1. Initialize a project once, get context for all AI tools
2. Edit context in one tool, automatically propagate to others
3. Team members using different AI tools stay in sync
4. Efficient token usage per tool's context limits

### Feature Category

- [ ] CLI tooling
- [ ] Symlink architecture
- [x] Cross-tool synchronization
- [x] New AI tool adapter (Cursor, Windsurf, Aider, Continue, etc.)
- [x] Documentation/Templates
- [ ] Carbon efficiency
- [x] Token optimization
- [x] Agents
- [ ] Commands
- [ ] Configuration
- [ ] Validation
- [ ] Extension system
- [x] Team collaboration
- [ ] CI/CD integration

### Impact

**Who would benefit:** All users using multiple AI coding assistants

**Frequency of use:** Daily

**Token Efficiency Impact:**
- [x] Reduces token waste (estimated: 30% through tool-specific optimization)
- [x] Improves context accuracy (estimated: 25%)
- [x] Enables carbon-aware context optimization

### Supported Tools

| Tool | Max Context | Output Format |
|------|-------------|---------------|
| Claude Code | 200k | .claude/ + CLAUDE.md |
| GitHub Copilot | 8k | .github/copilot-instructions.md |
| Cline | 16k | .clinerules |
| Antigravity | Variable | .agent/ |
| Windsurf | 16k | .windsurfrules |
| Aider | Model-dependent | .aider.conf.yml |
| Continue | Variable | .continue/ |

---

### Checklist

- [x] Searched existing issues and feature requests
- [x] Provided clear problem statement
- [x] Described at least one use case
- [x] Considered impact on existing features
- [x] Considered carbon efficiency impact

---

**Priority:** HIGH
**Labels:** `enhancement`, `agent`, `cross-tool`
**Effort:** High (4-8 hours)
