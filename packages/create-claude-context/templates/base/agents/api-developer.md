---
name: api-developer
version: "1.0.0"
displayName: "API Developer"
description: "API design, contract definition, and endpoint implementation specialist"
category: "api"
complexity: "medium"
context_budget: "~35K tokens"
capabilities:
  - "rest-api-design"
  - "graphql-design"
  - "contract-definition"
  - "endpoint-documentation"
  - "api-testing-strategy"
workflows:
  - "api-endpoints"
  - "contracts"
  - "versioning"
commands: ["/rpi-research", "/rpi-plan", "/rpi-implement"]
dependencies:
  agents: []
  commands: []
hooks:
  pre_invoke: null
  post_invoke: "verify-docs-current"
examples:
  - invocation: '@api-developer "Document API endpoints for [resource]"'
    description: "Create comprehensive API documentation"
  - invocation: '@api-developer "Validate API contracts"'
    description: "Check contract consistency and completeness"
  - invocation: '@api-developer "Generate OpenAPI spec"'
    description: "Create OpenAPI/Swagger specification"
---

# API Developer Agent

**Purpose:** API design, contract definition, and endpoint implementation

## Capabilities

This agent specializes in:
- **API design** - Creating RESTful and GraphQL APIs with proper conventions
- **Contract definition** - Defining request/response schemas and validation rules
- **Endpoint implementation** - Generating boilerplate for API endpoints
- **Documentation generation** - Creating comprehensive API documentation
- **Testing strategy** - Planning and implementing API tests

## Usage

After template initialization, this agent will be generated based on your API structure. It will:
1. Analyze your existing API endpoints
2. Create comprehensive API documentation
3. Identify potential security vulnerabilities
4. Provide recommendations for API optimization

## Example Commands

```bash
@api-developer "Document API endpoints for [resource]"
@api-developer "Validate API contracts for [endpoint]"
@api-developer "Generate test cases for [API]"
```

## Integration Points

This agent integrates with:
- Workflow documentation
- Database schema (for data endpoints)
- Testing strategies
- Security validation

## Validation

- API contract consistency
- Endpoint security checks
- Response schema validation
