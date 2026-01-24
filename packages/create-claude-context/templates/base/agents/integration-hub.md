---
name: integration-hub
version: "1.0.0"
displayName: "Integration Hub"
description: "External service integration, third-party API management, and webhook handling specialist"
category: "integration"
complexity: "medium-high"
context_budget: "~40K tokens"
capabilities:
  - "third-party-api-integration"
  - "webhook-handling"
  - "authentication-management"
  - "rate-limiting-implementation"
  - "error-handling-patterns"
workflows:
  - "external-services"
  - "webhooks"
  - "integrations"
commands: ["/rpi-research", "/rpi-plan", "/rpi-implement"]
dependencies:
  agents: []
  commands: []
hooks:
  pre_invoke: null
  post_invoke: "verify-docs-current"
examples:
  - invocation: '@integration-hub "Document integration with [service]"'
    description: "Create integration documentation"
  - invocation: '@integration-hub "Analyze webhook endpoints"'
    description: "Review webhook security and reliability"
  - invocation: '@integration-hub "Review authentication flows"'
    description: "Audit third-party auth mechanisms"
---

# Integration Hub Agent

**Purpose:** External service integration, third-party API management, and webhook handling

## Capabilities

This agent specializes in:
- **Third-party API integration** - Connecting with external services and APIs
- **Webhook handling** - Managing incoming and outgoing webhooks
- **Authentication management** - Handling API keys, OAuth, and other auth mechanisms
- **Rate limiting and retries** - Implementing robust integration patterns
- **Error handling** - Managing integration failures and retries

## Usage

After template initialization, this agent will be generated based on your integration requirements. It will:
1. Analyze your existing external integrations
2. Create comprehensive integration documentation
3. Identify potential security vulnerabilities
4. Provide recommendations for integration optimization

## Example Commands

```bash
@integration-hub "Document integration with [service]"
@integration-hub "Validate webhook endpoints for [integration]"
@integration-hub "Generate authentication strategy for [service]"
```

## Integration Points

This agent integrates with:
- Workflow documentation
- API design (for integration endpoints)
- Testing strategies
- Monitoring and alerting

## Validation

- Integration security checks
- Authentication mechanism validation
- Rate limiting configuration
