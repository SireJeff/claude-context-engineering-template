/**
 * Claude Context Engineering - Placeholder Replacement Engine
 *
 * Finds and replaces {{PLACEHOLDER}} patterns in template files.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

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

  // Counts
  WORKFLOWS_COUNT: { description: 'Number of workflows', example: '12' },
  AGENTS_COUNT: { description: 'Number of agents', example: '6' },
  COMMANDS_COUNT: { description: 'Number of commands', example: '8' },

  // Meta
  DATE: { description: 'Current date', example: '2025-01-24' },
  AGENT_TABLE_ROWS: { description: 'Agent table rows', example: '| core-architect | System design |' },
};

/**
 * Get default placeholder values based on config and tech stack
 */
function getDefaultValues(config = {}, techStack = {}) {
  const today = new Date().toISOString().split('T')[0];
  const projectName = config.projectName || 'my-project';

  // Determine commands based on tech stack
  let commands = {
    install: 'npm install',
    dev: 'npm run dev',
    test: 'npm test',
    migrate: 'npm run migrate'
  };

  if (techStack.commands) {
    commands = techStack.commands;
  } else if (techStack.languages?.includes('python')) {
    commands = {
      install: 'pip install -r requirements.txt',
      dev: 'python main.py',
      test: 'pytest',
      migrate: 'alembic upgrade head'
    };
  } else if (techStack.languages?.includes('go')) {
    commands = {
      install: 'go mod download',
      dev: 'go run .',
      test: 'go test ./...',
      migrate: 'migrate -path migrations up'
    };
  } else if (techStack.languages?.includes('rust')) {
    commands = {
      install: 'cargo build',
      dev: 'cargo run',
      test: 'cargo test',
      migrate: 'sqlx migrate run'
    };
  }

  return {
    PROJECT_NAME: projectName,
    PROJECT_DESCRIPTION: `${projectName} application`,
    TECH_STACK: techStack.summary || techStack.stack || 'Not detected',
    PRODUCTION_URL: `https://${projectName}.example.com`,
    PROJECT_STATUS: 'Development',
    API_URL: `https://api.${projectName}.example.com`,
    REPO_URL: `https://github.com/user/${projectName}`,
    DEPLOYMENT_PLATFORM: 'Docker',
    INSTALL_COMMAND: commands.install,
    DEV_START_COMMAND: commands.dev,
    TEST_COMMAND: commands.test,
    TEST_E2E_COMMAND: `${commands.test} --e2e`,
    TEST_COVERAGE_COMMAND: `${commands.test} --coverage`,
    MIGRATION_CREATE_COMMAND: `${commands.migrate}:create`,
    MIGRATION_RUN_COMMAND: commands.migrate,
    DEPLOY_COMMAND: 'docker-compose up -d',
    MODELS_PATH: 'src/models/',
    MIGRATIONS_PATH: 'src/migrations/',
    CORE_FILES_LIST: '- src/\n- config/',
    WORKFLOWS_COUNT: '8',
    AGENTS_COUNT: '6',
    COMMANDS_COUNT: '8',
    DATE: today,
    AGENT_TABLE_ROWS: '',
  };
}

/**
 * Replace placeholders in all files in a directory
 */
async function replacePlaceholders(targetDir, config = {}) {
  const claudeDir = path.join(targetDir, '.claude');
  const values = getDefaultValues(config, config.techStack || {});

  // Find all markdown and JSON files
  const files = await glob('**/*.{md,json}', {
    cwd: claudeDir,
    ignore: ['node_modules/**', '.git/**'],
    nodir: true,
    absolute: true
  });

  let totalReplaced = 0;

  for (const filePath of files) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Replace all placeholders
      for (const [key, value] of Object.entries(values)) {
        const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        content = content.replace(pattern, String(value));
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalReplaced++;
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  // Also replace in CLAUDE.md at root
  const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
  if (fs.existsSync(claudeMdPath)) {
    try {
      let content = fs.readFileSync(claudeMdPath, 'utf8');
      const originalContent = content;

      for (const [key, value] of Object.entries(values)) {
        const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        content = content.replace(pattern, String(value));
      }

      if (content !== originalContent) {
        fs.writeFileSync(claudeMdPath, content, 'utf8');
        totalReplaced++;
      }
    } catch (error) {
      // Skip if can't read
    }
  }

  return totalReplaced;
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

module.exports = {
  replacePlaceholders,
  findPlaceholders,
  getDefaultValues,
  KNOWN_PLACEHOLDERS,
};
