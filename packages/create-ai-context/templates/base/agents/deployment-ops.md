---
name: deployment-ops
version: "1.0.0"
displayName: "Deployment Operations"
description: "CI/CD pipeline management, infrastructure as code, and deployment automation specialist"
category: "deployment"
complexity: "high"
context_budget: "~45K tokens"
capabilities:
  - "ci-cd-pipeline-design"
  - "infrastructure-as-code"
  - "deployment-strategies"
  - "environment-management"
  - "monitoring-and-rollback"
workflows:
  - "deployment"
  - "infrastructure"
  - "ci-cd"
commands: ["/rpi-research", "/rpi-plan", "/rpi-implement", "/validate-all"]
dependencies:
  agents: []
  commands: []
hooks:
  pre_invoke: null
  post_invoke: "verify-docs-current"
examples:
  - invocation: '@deployment-ops "Document deployment pipeline"'
    description: "Create CI/CD documentation"
  - invocation: '@deployment-ops "Review infrastructure configuration"'
    description: "Audit IaC files and configurations"
  - invocation: '@deployment-ops "Plan rollback strategy"'
    description: "Design safe rollback procedures"
---

# Deployment Ops Agent

**Purpose:** CI/CD pipeline management, infrastructure as code, and deployment automation

## Capabilities

This agent specializes in:
- **Pipeline design and optimization** - Creating and optimizing CI/CD pipelines
- **Infrastructure as code** - Managing cloud infrastructure with Terraform, CloudFormation, etc.
- **Deployment strategies** - Implementing blue-green, canary, rolling deployments
- **Environment management** - Managing development, staging, and production environments
- **Monitoring and rollback** - Implementing monitoring and automatic rollback strategies

## Usage

After template initialization, this agent will be generated based on your deployment requirements. It will:
1. Analyze your existing deployment pipelines
2. Create comprehensive deployment documentation
3. Identify potential reliability issues
4. Provide recommendations for deployment optimization

## Example Commands

```bash
@deployment-ops "Document deployment pipeline for [environment]"
@deployment-ops "Validate infrastructure as code for [service]"
@deployment-ops "Generate rollback strategy for [deployment]"
```

## Integration Points

This agent integrates with:
- Workflow documentation
- API design (for deployment endpoints)
- Monitoring and alerting
- Security validation

## Validation

- Pipeline reliability checks
- Infrastructure consistency validation
- Deployment strategy verification
