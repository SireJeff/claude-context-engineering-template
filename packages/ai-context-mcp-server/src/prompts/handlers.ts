/**
 * MCP Prompts
 * 
 * Prompt definitions for agent-like behaviors.
 */

import { DatabaseClient } from '../db/client.js';

/**
 * Prompt definition
 */
export interface Prompt {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

/**
 * Prompt message
 */
export interface PromptMessage {
  role: 'user' | 'assistant';
  content: {
    type: 'text';
    text: string;
  };
}

/**
 * Prompt context
 */
export interface PromptContext {
  db: DatabaseClient;
  projectRoot: string;
}

/**
 * Available prompts (agents)
 */
export const PROMPT_DEFINITIONS: Prompt[] = [
  {
    name: 'context-engineer',
    description: 'Initialize and configure the AI context system for a project',
    arguments: [
      {
        name: 'projectType',
        description: 'Type of project (e.g., "web-app", "cli", "library")',
        required: false
      }
    ]
  },
  {
    name: 'core-architect',
    description: 'Design system architecture and plan project structure',
    arguments: [
      {
        name: 'focus',
        description: 'Area to focus on (e.g., "api", "database", "frontend")',
        required: false
      }
    ]
  },
  {
    name: 'api-developer',
    description: 'Design and implement API endpoints',
    arguments: [
      {
        name: 'endpoint',
        description: 'Specific endpoint to work on',
        required: false
      }
    ]
  },
  {
    name: 'database-ops',
    description: 'Design database schemas and migrations',
    arguments: [
      {
        name: 'operation',
        description: 'Type of operation (e.g., "schema", "migration", "query")',
        required: false
      }
    ]
  },
  {
    name: 'deployment-ops',
    description: 'Plan deployments and CI/CD pipelines',
    arguments: [
      {
        name: 'environment',
        description: 'Target environment (e.g., "development", "staging", "production")',
        required: false
      }
    ]
  },
  {
    name: 'integration-hub',
    description: 'Design external service integrations',
    arguments: [
      {
        name: 'service',
        description: 'Service to integrate with',
        required: false
      }
    ]
  }
];

/**
 * Get a prompt by name
 */
export function getPrompt(
  name: string,
  args: Record<string, string>,
  ctx: PromptContext
): { description: string; messages: PromptMessage[] } {
  const prompt = PROMPT_DEFINITIONS.find(p => p.name === name);
  if (!prompt) {
    throw new Error(`Unknown prompt: ${name}`);
  }

  // Get relevant context from database
  const contextItems = getRelevantContext(name, ctx);

  // Build prompt messages
  const messages = buildPromptMessages(name, args, contextItems);

  return {
    description: prompt.description,
    messages
  };
}

/**
 * Get relevant context items for a prompt
 */
function getRelevantContext(promptName: string, ctx: PromptContext): string {
  const parts: string[] = [];

  // Get the agent definition if it exists
  const agentItem = ctx.db.getItem(`agent:${promptName}`);
  if (agentItem) {
    parts.push('## Agent Definition');
    parts.push(agentItem.content);
    parts.push('');
  }

  // Get relevant workflows based on prompt type
  const workflowKeywords: Record<string, string[]> = {
    'context-engineer': ['configuration', 'setup', 'initialization'],
    'core-architect': ['architecture', 'design', 'structure'],
    'api-developer': ['api', 'endpoint', 'route', 'http'],
    'database-ops': ['database', 'schema', 'migration', 'query'],
    'deployment-ops': ['deployment', 'ci', 'cd', 'pipeline'],
    'integration-hub': ['integration', 'external', 'webhook', 'api']
  };

  const keywords = workflowKeywords[promptName] || [];
  const workflows = ctx.db.getItemsByType('workflow');

  const relevantWorkflows = workflows.filter(w => 
    keywords.some(k => 
      w.name.toLowerCase().includes(k) || 
      w.content.toLowerCase().includes(k)
    )
  );

  if (relevantWorkflows.length > 0) {
    parts.push('## Relevant Workflows');
    for (const workflow of relevantWorkflows.slice(0, 3)) {
      parts.push(`### ${workflow.name}`);
      parts.push(workflow.content.slice(0, 500) + '...');
      parts.push('');
    }
  }

  // Get project stats
  const stats = ctx.db.getStats();
  parts.push('## Project Context');
  parts.push(`- Context items: ${stats.items}`);
  parts.push(`- Knowledge relations: ${stats.relations}`);
  parts.push(`- Indexed commits: ${stats.commits}`);

  return parts.join('\n');
}

/**
 * Build prompt messages
 */
function buildPromptMessages(
  promptName: string,
  args: Record<string, string>,
  context: string
): PromptMessage[] {
  const systemPrompts: Record<string, string> = {
    'context-engineer': `You are the Context Engineer, responsible for initializing and configuring AI context systems.

Your capabilities:
- Analyze project structure and requirements
- Set up context documentation structure
- Configure cross-tool synchronization
- Establish knowledge indexing

${context}`,

    'core-architect': `You are the Core Architect, responsible for system design and architecture decisions.

Your capabilities:
- Design overall system architecture
- Plan component structure and relationships
- Make technology stack decisions
- Ensure scalability and maintainability

${context}`,

    'api-developer': `You are the API Developer, specialized in designing and implementing API endpoints.

Your capabilities:
- Design RESTful and GraphQL APIs
- Implement route handlers
- Define request/response schemas
- Handle authentication and authorization

${context}`,

    'database-ops': `You are the Database Operations specialist, responsible for data layer design.

Your capabilities:
- Design database schemas
- Plan and execute migrations
- Optimize queries
- Manage data integrity

${context}`,

    'deployment-ops': `You are the Deployment Operations specialist, responsible for CI/CD and infrastructure.

Your capabilities:
- Configure CI/CD pipelines
- Plan deployment strategies
- Manage environments
- Monitor and troubleshoot deployments

${context}`,

    'integration-hub': `You are the Integration Hub specialist, responsible for external service integrations.

Your capabilities:
- Design integration patterns
- Implement third-party API connections
- Handle webhooks and callbacks
- Manage authentication with external services

${context}`
  };

  const systemPrompt = systemPrompts[promptName] || `You are an AI assistant with the following context:\n\n${context}`;

  // Build user message based on args
  let userMessage = `Please help with ${promptName.replace('-', ' ')} tasks.`;
  
  if (Object.keys(args).length > 0) {
    userMessage += '\n\nParameters:';
    for (const [key, value] of Object.entries(args)) {
      userMessage += `\n- ${key}: ${value}`;
    }
  }

  return [
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: systemPrompt
      }
    },
    {
      role: 'user',
      content: {
        type: 'text',
        text: userMessage
      }
    }
  ];
}
