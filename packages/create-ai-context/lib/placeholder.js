/**
 * AI Context Engineering - Placeholder Replacement Engine
 *
 * Finds and replaces {{PLACEHOLDER}} patterns in template files.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Context directory and file names
 */
const AI_CONTEXT_DIR = '.ai-context';
const AI_CONTEXT_FILE = 'AI_CONTEXT.md';

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
 * Get default placeholder values based on config, tech stack, and analysis
 * @param {object} config - Configuration from CLI (includes discoveredValues from merge)
 * @param {object} techStack - Detected tech stack
 * @param {object} analysis - Codebase analysis results
 * @returns {object} Placeholder values
 */
function getDefaultValues(config = {}, techStack = {}, analysis = {}) {
  // Get discovered values from merge phase (if available)
  const discoveredValues = config.discoveredValues || {};
  const today = new Date().toISOString().split('T')[0];
  const projectName = config.projectName || 'my-project';
  const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Get LOC information from tech stack or analysis
  const loc = techStack.loc || analysis.linesOfCode || { total: 0, code: 0, files: 0 };

  // Get file purposes from tech stack
  const filePurposes = techStack.filePurposes || {};

  // Determine commands based on tech stack
  let commands = {
    install: 'npm install',
    dev: 'npm run dev',
    test: 'npm test',
    testE2e: 'npm run test:e2e',
    testCoverage: 'npm run test:coverage',
    migrateCreate: 'npm run migration:create',
    migrateRun: 'npm run migration:run',
    deploy: 'npm run deploy'
  };

  if (techStack.commands) {
    commands = { ...commands, ...techStack.commands };
  } else if (techStack.languages?.includes('python')) {
    commands = {
      install: 'pip install -r requirements.txt',
      dev: 'python main.py',
      test: 'pytest',
      testE2e: 'pytest tests/e2e/',
      testCoverage: 'pytest --cov',
      migrateCreate: 'alembic revision --autogenerate',
      migrateRun: 'alembic upgrade head',
      deploy: 'docker-compose up -d'
    };
  } else if (techStack.languages?.includes('go')) {
    commands = {
      install: 'go mod download',
      dev: 'go run .',
      test: 'go test ./...',
      testE2e: 'go test ./e2e/...',
      testCoverage: 'go test -cover ./...',
      migrateCreate: 'migrate create -ext sql',
      migrateRun: 'migrate -path migrations up',
      deploy: 'docker-compose up -d'
    };
  } else if (techStack.languages?.includes('rust')) {
    commands = {
      install: 'cargo build',
      dev: 'cargo run',
      test: 'cargo test',
      testE2e: 'cargo test --test e2e',
      testCoverage: 'cargo tarpaulin',
      migrateCreate: 'sqlx migrate add',
      migrateRun: 'sqlx migrate run',
      deploy: 'cargo build --release'
    };
  }

  // Build core files list from analysis
  let coreFilesList = '- src/\n- config/';
  if (analysis.entryPoints && analysis.entryPoints.length > 0) {
    const uniqueFiles = [...new Set(analysis.entryPoints.map(e => e.file))];
    coreFilesList = uniqueFiles.slice(0, 10).map(f => `- \`${f}\``).join('\n');
  }

  // Get workflow count from analysis
  const workflowCount = analysis.workflows?.length || 0;

  // Detect deployment platform from project files
  const deploymentPlatform = detectDeploymentPlatform(config.targetDir);

  // Build models and migrations paths from file purposes
  const modelsPath = buildPathFromPurpose(filePurposes, 'model', 'models/');
  const migrationsPath = buildPathFromPurpose(filePurposes, 'migration', 'migrations/');

  // Build external integrations list from dependencies
  const externalIntegrations = buildExternalIntegrations(techStack.databases || [], analysis.dependencies || []);

  // Build architecture diagram from analysis
  const architectureDiagram = buildArchitectureDiagram(analysis.architecture || {}, filePurposes);

  // Determine search patterns based on language
  const searchPatterns = getSearchPatterns(techStack.languages || []);

  // Entry point count
  const entryPointCount = analysis.entryPoints?.length || techStack.entryPoints?.length || 0;

  const defaults = {
    // Project identity
    PROJECT_NAME: projectName,
    PROJECT_SLUG: projectSlug,
    PROJECT_DESCRIPTION: `${projectName} application`,
    TECH_STACK: techStack.summary || techStack.stack || 'Not detected',
    PRODUCTION_URL: `https://${projectSlug}.example.com`,
    PROJECT_STATUS: 'Development',

    // URLs
    API_URL: `https://api.${projectSlug}.example.com`,
    REPO_URL: `https://github.com/user/${projectSlug}`,
    DEPLOYMENT_PLATFORM: deploymentPlatform,

    // Commands
    INSTALL_COMMAND: commands.install,
    DEV_START_COMMAND: commands.dev,
    TEST_COMMAND: commands.test,
    TEST_E2E_COMMAND: commands.testE2e,
    TEST_COVERAGE_COMMAND: commands.testCoverage,
    MIGRATION_CREATE_COMMAND: commands.migrateCreate,
    MIGRATION_RUN_COMMAND: commands.migrateRun,
    DEPLOY_COMMAND: commands.deploy,

    // Paths (from analysis)
    MODELS_PATH: modelsPath,
    MIGRATIONS_PATH: migrationsPath,
    CORE_FILES_LIST: coreFilesList,

    // Counts (from analysis)
    WORKFLOWS_COUNT: String(workflowCount),
    WORKFLOW_DOMAINS_COUNT: String(workflowCount > 0 ? Math.min(workflowCount, 5) : 0),
    CODE_DOMAINS_COUNT: String(Object.keys(filePurposes.counts || {}).length),
    ENTRY_POINTS_COUNT: String(entryPointCount),
    SOURCE_FILES_COUNT: String(loc.files || 0),
    LINES_OF_CODE: String(loc.code || loc.total || 0),
    AGENTS_COUNT: '6',
    COMMANDS_COUNT: '11',
    INDEX_FILES_COUNT: '15',

    // Meta
    DATE: today,
    AGENT_TABLE_ROWS: '',
    AGENT_ROUTING_TABLE: '@context-engineer for setup, @core-architect for design',
    DEBUGGING_QUICK_REFS: 'KNOWN_GOTCHAS.md, logs/',

    // Examples (based on detected stack)
    EXAMPLE_REFACTOR_TASK: buildExampleTask('refactor', techStack),
    EXAMPLE_LOWLEVEL_TASK: buildExampleTask('lowlevel', techStack),
    EXAMPLE_FEATURE_TASK: buildExampleTask('feature', techStack),

    // Search patterns (language-aware)
    CONFIG_SEARCH_PATTERN: searchPatterns.config,
    URL_SEARCH_PATTERN: searchPatterns.url,

    // External integrations (from dependencies)
    EXTERNAL_INTEGRATIONS_LIST: externalIntegrations,

    // Architecture (from analysis)
    ARCHITECTURE_DIAGRAM: architectureDiagram,

    // URLs
    CRITICAL_URLS: `- Production: https://${projectSlug}.example.com`,
    BUSINESS_CONSTANTS: '- TBD (document key business constants)',

    // Gotchas
    GOTCHA_CATEGORY_1: 'Database',
    GOTCHA_1_ITEMS: '- TBD (document database gotchas)',
    GOTCHA_CATEGORY_2: 'API',
    GOTCHA_2_ITEMS: '- TBD (document API gotchas)',

    // Production
    PRODUCTION_PLATFORM: deploymentPlatform,
    PRODUCTION_SERVICES: buildProductionServices(techStack),
    MONITORING_COMMANDS: 'Check logs, health endpoints',

    // Constraints
    MIGRATION_CONSTRAINTS: 'Always backup before migrations',
    TESTING_CONSTRAINTS: 'Run tests before merging',
    SECURITY_CONSTRAINTS: 'Never commit secrets',
    CONTACT_INFO: 'TBD (add contact info)',

    // Languages and frameworks (for templates)
    PRIMARY_LANGUAGE: techStack.languages?.[0] || 'javascript',
    PRIMARY_FRAMEWORK: techStack.frameworks?.[0] || '',
    DATABASE_TYPE: techStack.databases?.[0] || '',
  };

  // Merge with discovered values - discovered values take precedence
  // This preserves user customizations from existing documentation
  return { ...defaults, ...discoveredValues };
}

/**
 * Detect deployment platform from project files
 */
function detectDeploymentPlatform(projectRoot) {
  if (!projectRoot) return 'TBD';

  const platforms = [
    { file: 'vercel.json', name: 'Vercel' },
    { file: 'netlify.toml', name: 'Netlify' },
    { file: 'fly.toml', name: 'Fly.io' },
    { file: 'render.yaml', name: 'Render' },
    { file: 'railway.json', name: 'Railway' },
    { file: 'Dockerfile', name: 'Docker' },
    { file: 'docker-compose.yml', name: 'Docker Compose' },
    { file: 'docker-compose.yaml', name: 'Docker Compose' },
    { file: 'heroku.yml', name: 'Heroku' },
    { file: 'Procfile', name: 'Heroku' },
    { file: 'app.yaml', name: 'Google Cloud' },
    { file: 'serverless.yml', name: 'Serverless' },
    { file: 'terraform', name: 'Terraform' },
  ];

  for (const platform of platforms) {
    try {
      if (fs.existsSync(path.join(projectRoot, platform.file))) {
        return platform.name;
      }
    } catch {
      // Ignore errors
    }
  }

  return 'TBD';
}

/**
 * Build path from file purposes
 */
function buildPathFromPurpose(filePurposes, purpose, defaultPath) {
  const files = filePurposes?.files?.[purpose];
  if (files && files.length > 0) {
    const dir = path.dirname(files[0]);
    return dir === '.' ? defaultPath : dir + '/';
  }
  return defaultPath;
}

/**
 * Build external integrations list from dependencies
 */
function buildExternalIntegrations(databases, dependencies) {
  const integrations = [];

  // Add databases
  for (const db of databases) {
    integrations.push(`- **${capitalize(db)}**: Database`);
  }

  // Check dependencies for known integrations
  const knownIntegrations = {
    stripe: 'Payment processing',
    'aws-sdk': 'AWS services',
    '@aws-sdk': 'AWS services',
    firebase: 'Firebase services',
    twilio: 'SMS/Voice',
    sendgrid: 'Email delivery',
    '@sendgrid': 'Email delivery',
    nodemailer: 'Email',
    redis: 'Caching',
    ioredis: 'Caching',
    elasticsearch: 'Search',
    '@elastic': 'Search',
    'socket.io': 'Real-time',
    pusher: 'Real-time',
    cloudinary: 'Media storage',
    's3': 'File storage',
  };

  for (const dep of dependencies) {
    const depName = dep.name || dep;
    for (const [key, desc] of Object.entries(knownIntegrations)) {
      if (depName.toLowerCase().includes(key)) {
        integrations.push(`- **${depName}**: ${desc}`);
        break;
      }
    }
  }

  if (integrations.length === 0) {
    return '*No external integrations detected. Document manually if present.*';
  }

  return integrations.slice(0, 10).join('\n');
}

/**
 * Build architecture diagram from analysis
 */
function buildArchitectureDiagram(architecture, filePurposes) {
  const layers = architecture?.layers || [];
  const purposeCounts = filePurposes?.counts || {};

  // Build diagram based on discovered layers or file purposes
  if (layers.length > 0) {
    let diagram = '┌─────────────────────────────────────┐\n';
    for (const layer of layers.slice(0, 4)) {
      diagram += `│   [${(layer.name || 'Layer').padEnd(30)}]   │\n`;
    }
    diagram += '└─────────────────────────────────────┘';
    return diagram;
  }

  // Build from file purposes
  const hasControllers = purposeCounts.controller > 0 || purposeCounts.route > 0;
  const hasServices = purposeCounts.service > 0;
  const hasModels = purposeCounts.model > 0;
  const hasRepos = purposeCounts.repository > 0;

  return `┌─────────────────────────────────────┐
│           [Application]             │
│                                     │
${hasControllers ? '│   ┌───────────┐   ┌───────────┐    │\n│   │   API     │   │  Routes   │    │\n│   └───────────┘   └───────────┘    │\n' : ''}${hasServices ? '│   ┌───────────────────────────┐    │\n│   │        Services           │    │\n│   └───────────────────────────┘    │\n' : ''}${hasModels || hasRepos ? '│   ┌───────────┐   ┌───────────┐    │\n│   │  Models   │   │ Database  │    │\n│   └───────────┘   └───────────┘    │\n' : ''}└─────────────────────────────────────┘`;
}

/**
 * Get search patterns based on languages
 */
function getSearchPatterns(languages) {
  if (languages.includes('python')) {
    return {
      config: 'grep -r "os.environ" --include="*.py"',
      url: 'grep -rE "https?://" --include="*.py" --include="*.json"'
    };
  }
  if (languages.includes('go')) {
    return {
      config: 'grep -r "os.Getenv" --include="*.go"',
      url: 'grep -rE "https?://" --include="*.go" --include="*.json"'
    };
  }
  if (languages.includes('rust')) {
    return {
      config: 'grep -r "env::var" --include="*.rs"',
      url: 'grep -rE "https?://" --include="*.rs" --include="*.toml"'
    };
  }
  // Default: JavaScript/TypeScript
  return {
    config: 'grep -r "process.env" --include="*.js" --include="*.ts"',
    url: 'grep -rE "https?://" --include="*.js" --include="*.ts" --include="*.json"'
  };
}

/**
 * Build example task based on tech stack
 */
function buildExampleTask(type, techStack) {
  const framework = techStack.frameworks?.[0] || '';
  const language = techStack.languages?.[0] || 'javascript';

  const examples = {
    refactor: {
      express: 'Refactor the authentication middleware',
      fastapi: 'Refactor the dependency injection system',
      django: 'Refactor the view decorators',
      nextjs: 'Refactor the API routes to app router',
      default: 'Refactor the authentication flow'
    },
    lowlevel: {
      express: 'Fix hardcoded timeout in request handler',
      fastapi: 'Fix hardcoded API URL in config',
      django: 'Fix hardcoded secret key in settings',
      default: 'Fix hardcoded API URL in config'
    },
    feature: {
      express: 'Add rate limiting middleware',
      fastapi: 'Add WebSocket support for real-time updates',
      django: 'Add user notifications feature',
      nextjs: 'Add server-side caching',
      default: 'Add user notifications feature'
    }
  };

  return examples[type][framework] || examples[type].default;
}

/**
 * Build production services list
 */
function buildProductionServices(techStack) {
  const services = ['Web'];

  if (techStack.frameworks?.some(f => ['express', 'fastapi', 'django', 'rails'].includes(f))) {
    services.push('API');
  }

  if (techStack.databases?.length > 0) {
    services.push('Database');
  }

  if (techStack.databases?.includes('redis')) {
    services.push('Cache');
  }

  return services.join(', ');
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Replace placeholders in all files in a directory
 */
async function replacePlaceholders(targetDir, config = {}) {
  const contextDir = path.join(targetDir, AI_CONTEXT_DIR);
  const values = getDefaultValues(config, config.techStack || {}, config.analysis || {});

  // Find all markdown and JSON files
  const files = await glob('**/*.{md,json}', {
    cwd: contextDir,
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

  // Also replace in AI_CONTEXT.md at root
  const aiContextPath = path.join(targetDir, AI_CONTEXT_FILE);
  if (fs.existsSync(aiContextPath)) {
    try {
      let content = fs.readFileSync(aiContextPath, 'utf8');
      const originalContent = content;

      for (const [key, value] of Object.entries(values)) {
        const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        content = content.replace(pattern, String(value));
      }

      if (content !== originalContent) {
        fs.writeFileSync(aiContextPath, content, 'utf8');
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
