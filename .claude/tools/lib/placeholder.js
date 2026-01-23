/**
 * Claude Context Engineering - Placeholder Replacement Engine
 *
 * Finds and replaces {{PLACEHOLDER}} patterns in template files.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

/**
 * Known placeholders with their descriptions
 */
const KNOWN_PLACEHOLDERS = {
  // Project identity
  PROJECT_NAME: { description: 'Project name', example: 'my-awesome-app' },
  PROJECT_DESCRIPTION: { description: 'Brief project description', example: 'A web application for...' },
  TECH_STACK: { description: 'Technologies used', example: 'Python 3.11, FastAPI, PostgreSQL' },
  PRODUCTION_URL: { description: 'Production URL', example: 'https://api.example.com' },
  PROJECT_STATUS: { description: 'Project status', example: 'Production' },

  // URLs
  API_URL: { description: 'API base URL', example: 'https://api.example.com/v1' },
  REPO_URL: { description: 'Repository URL', example: 'https://github.com/user/repo' },
  DEPLOYMENT_PLATFORM: { description: 'Where deployed', example: 'AWS ECS' },

  // Commands
  INSTALL_COMMAND: { description: 'Install dependencies command', example: 'npm install' },
  DEV_START_COMMAND: { description: 'Start dev server command', example: 'npm run dev' },
  TEST_COMMAND: { description: 'Run tests command', example: 'npm test' },
  TEST_E2E_COMMAND: { description: 'Run E2E tests command', example: 'npm run test:e2e' },
  TEST_COVERAGE_COMMAND: { description: 'Run coverage command', example: 'npm run coverage' },
  MIGRATION_CREATE_COMMAND: { description: 'Create migration command', example: 'npm run db:migrate:create' },
  MIGRATION_RUN_COMMAND: { description: 'Run migrations command', example: 'npm run db:migrate' },
  DEPLOY_COMMAND: { description: 'Deploy command', example: 'npm run deploy' },

  // Paths
  MODELS_PATH: { description: 'Models directory path', example: 'src/models/' },
  MIGRATIONS_PATH: { description: 'Migrations directory path', example: 'src/migrations/' },
  CORE_FILES_LIST: { description: 'List of core files', example: '- src/services/\n- src/models/' },

  // Patterns
  CONFIG_SEARCH_PATTERN: { description: 'Config search grep pattern', example: 'grep -r "process.env" src/' },
  URL_SEARCH_PATTERN: { description: 'URL search grep pattern', example: 'grep -rE "https?://" src/' },

  // Architecture
  ARCHITECTURE_DIAGRAM: { description: 'ASCII architecture diagram', example: '```\nClient → API → DB\n```' },
  EXTERNAL_INTEGRATIONS_LIST: { description: 'List of external integrations', example: '- Stripe: payments\n- SendGrid: email' },

  // Counts
  WORKFLOWS_COUNT: { description: 'Number of workflows', example: '12' },
  WORKFLOW_DOMAINS_COUNT: { description: 'Number of workflow domains', example: '5' },
  CODE_DOMAINS_COUNT: { description: 'Number of code domains', example: '4' },
  AGENTS_COUNT: { description: 'Number of agents', example: '6' },
  COMMANDS_COUNT: { description: 'Number of commands', example: '5' },
  INDEX_FILES_COUNT: { description: 'Number of index files', example: '25' },

  // Meta
  DATE: { description: 'Current date', example: '2025-12-06' },

  // Quick references
  DEBUGGING_QUICK_REFS: { description: 'Quick debug references', example: '[logs.md], [errors.md]' },
  CRITICAL_URLS: { description: 'Critical URLs list', example: '- API: https://...\n- Admin: https://...' },
  BUSINESS_CONSTANTS: { description: 'Business constants', example: '- MAX_USERS: 1000' },

  // Gotchas
  GOTCHA_CATEGORY_1: { description: 'First gotcha category', example: 'Authentication' },
  GOTCHA_1_ITEMS: { description: 'First gotcha items', example: '- Token expiry: 24h' },
  GOTCHA_CATEGORY_2: { description: 'Second gotcha category', example: 'Database' },
  GOTCHA_2_ITEMS: { description: 'Second gotcha items', example: '- Connection pooling required' },

  // Agent/command routing
  AGENT_ROUTING_TABLE: { description: 'Agent routing reference', example: '| Task | Agent |\n|---|---|' },
  COMMAND_LIST: { description: 'Command list', example: '/rpi-research, /rpi-plan' },

  // Tasks
  EXAMPLE_REFACTOR_TASK: { description: 'Example refactor task', example: 'Refactor authentication flow' },
  EXAMPLE_LOWLEVEL_TASK: { description: 'Example low-level task', example: 'Fix hardcoded API URL' },
  EXAMPLE_FEATURE_TASK: { description: 'Example feature task', example: 'Add user profile page' },

  // Production
  PRODUCTION_PLATFORM: { description: 'Production platform', example: 'AWS' },
  PRODUCTION_SERVICES: { description: 'Production services', example: 'ECS, RDS, ElastiCache' },
  MONITORING_COMMANDS: { description: 'Monitoring commands', example: 'kubectl logs, aws logs' },

  // Constraints
  MIGRATION_CONSTRAINTS: { description: 'Migration constraints', example: 'Always backup first' },
  TESTING_CONSTRAINTS: { description: 'Testing constraints', example: 'Must pass CI before merge' },
  SECURITY_CONSTRAINTS: { description: 'Security constraints', example: 'No secrets in code' },

  // Contact
  CONTACT_INFO: { description: 'Contact information', example: 'team@example.com' },
};

/**
 * Replace placeholders in a file
 */
async function replacePlaceholders(filePath, values, options = {}) {
  const { dryRun = false, backup = true } = options;

  const result = {
    file: filePath,
    replaced: 0,
    remaining: 0,
    replacements: [],
  };

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const placeholderPattern = /\{\{([A-Z_]+)\}\}/g;

  // Find all placeholders
  const found = new Set();
  let match;
  while ((match = placeholderPattern.exec(content)) !== null) {
    found.add(match[1]);
  }

  // Replace placeholders with provided values
  for (const placeholder of found) {
    const value = values[placeholder];

    if (value !== undefined && value !== `{{${placeholder}}}`) {
      const pattern = new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g');
      const before = content;
      content = content.replace(pattern, value);

      if (content !== before) {
        result.replaced++;
        result.replacements.push({
          placeholder,
          value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
        });
      }
    } else {
      result.remaining++;
    }
  }

  // Write changes
  if (!dryRun && result.replaced > 0) {
    if (backup) {
      const backupPath = filePath + '.bak';
      fs.copyFileSync(filePath, backupPath);
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return result;
}

/**
 * Find all placeholders in a file
 */
function findPlaceholders(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const placeholderPattern = /\{\{([A-Z_]+)\}\}/g;

  const found = [];
  let match;

  while ((match = placeholderPattern.exec(content)) !== null) {
    found.push({
      placeholder: match[0],
      name: match[1],
      index: match.index,
      known: KNOWN_PLACEHOLDERS.hasOwnProperty(match[1]),
    });
  }

  return found;
}

/**
 * Get placeholder information
 */
function getPlaceholderInfo(name) {
  return KNOWN_PLACEHOLDERS[name] || null;
}

/**
 * List all known placeholders
 */
function listKnownPlaceholders() {
  return Object.entries(KNOWN_PLACEHOLDERS).map(([name, info]) => ({
    name,
    placeholder: `{{${name}}}`,
    ...info,
  }));
}

module.exports = {
  replacePlaceholders,
  findPlaceholders,
  getPlaceholderInfo,
  listKnownPlaceholders,
  KNOWN_PLACEHOLDERS,
};
