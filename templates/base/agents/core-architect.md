---
name: core-architect
version: "1.0.0"
displayName: "Core Architect"
description: "System architecture, state machines, and high-level design specialist"
category: "architecture"
complexity: "high"
context_budget: "~50K tokens"
capabilities:
  - "system-architecture-design"
  - "state-machine-analysis"
  - "dependency-mapping"
  - "scalability-planning"
  - "design-pattern-recommendation"
workflows:
  - "authentication"
  - "system-core"
  - "data-flow"
commands: ["/rpi-research", "/rpi-plan"]
dependencies:
  agents: []
  commands: ["/rpi-research"]
hooks:
  pre_invoke: null
  post_invoke: "verify-docs-current"
examples:
  - invocation: '@core-architect "Document system architecture"'
    description: "Create comprehensive architecture documentation"
  - invocation: '@core-architect "Analyze state transitions in [component]"'
    description: "Map state machine and transitions"
  - invocation: '@core-architect "Identify scalability bottlenecks"'
    description: "Performance and scaling analysis"
---

# Core Architect Agent

**Purpose:** System architecture, state machines, and high-level design

## Capabilities

This agent specializes in:
- **System architecture design** - Creating and validating architectural diagrams
- **State machine analysis** - Understanding and documenting state transitions
- **High-level system design** - Planning and documenting system components
- **Dependency mapping** - Visualizing component dependencies
- **Scalability planning** - Designing for growth and performance

## Usage

After template initialization, this agent will be generated based on your project's architecture. It will:
1. Analyze your existing architecture
2. Create comprehensive architecture documentation
3. Identify potential bottlenecks and scalability issues
4. Provide recommendations for improved design

## Example Commands

```bash
@core-architect "Document system architecture for [feature]"
@core-architect "Analyze state transitions in [component]"
@core-architect "Identify scalability bottlenecks"
```

## Integration Points

This agent integrates with:
- Workflow documentation
- Database schema analysis
- API design documentation
- Deployment strategies

## Validation

- Architecture consistency checks
- State machine validation
- Dependency consistency verification
