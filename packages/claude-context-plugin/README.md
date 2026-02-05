# claude-context-plugin

> **⚠️ DEPRECATION NOTICE**
>
> This plugin is **deprecated** as of v3.0.0. All skills and commands are now included in the unified [`ai-context`](../ai-context/) package.
>
> **Migration:** Use `ai-context` skills and commands directly.
>
> **Support:** Use unified package instead
>
> ---

Claude Code plugin for context engineering - RPI workflow and documentation optimization.

## Installation

### Via Plugin Manager

```bash
/plugin install claude-context-engineering
```

### Via CLI

```bash
npx claude-plugins install claude-context-engineering
```

## Skills

### /context-eng:research

Systematic codebase exploration for feature/fix analysis.

```
/context-eng:research user-authentication
```

Creates a research document with:
- Relevant files and line numbers
- Call chain analysis
- Dependency mapping
- Test coverage gaps

### /context-eng:plan

Create implementation blueprint with file:line precision.

```
/context-eng:plan user-authentication
```

Creates a plan document with:
- Exact file:line modifications
- Risk assessment
- Test strategy
- Rollback plan

### /context-eng:implement

Execute plan with atomic changes and continuous testing.

```
/context-eng:implement user-authentication
```

Follows the golden rule: ONE CHANGE → ONE TEST → ONE COMMIT

### /context-eng:validate

Run complete validation suite.

```
/context-eng:validate
```

Checks:
- Directory structure
- JSON schemas
- Markdown links
- Placeholder completion
- Line number accuracy

### /context-eng:verify-docs

Verify documentation line numbers match code.

```
/context-eng:verify-docs path/to/file.py
```

### /context-eng:context-optimize

Orchestrate context optimization with interactive scoping.

```
/context-eng:context-optimize
/context-eng:context-optimize --auto
/context-eng:context-optimize --scope documentation
```

Generates:
- Context audit in `.claude/research/active/context-audit_research.md`
- RPI TODO plan in `.claude/plans/active/context-optimization_plan.md`

## Agents

### @context-eng:context-engineer

Initialize and maintain context engineering documentation.

```
@context-eng:context-engineer "Discover workflows for this codebase"
```

## Requirements

- Claude Code v1.0.33+
- Context engineering setup (use `npx create-universal-ai-context` first)

## License

MIT

## Links

- [GitHub](https://github.com/SireJeff/claude-context-engineering-template)
- [create-universal-ai-context](https://www.npmjs.com/package/create-universal-ai-context)
