/**
 * Static Analyzer
 *
 * Performs comprehensive static analysis of a codebase without AI.
 * Discovers entry points, workflows, architecture, and dependencies.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Entry point patterns by framework
 */
const ENTRY_PATTERNS = {
  // Express.js
  express: {
    patterns: [
      /\.(get|post|put|delete|patch|all|use)\s*\(\s*['"]/gi,
      /router\.(get|post|put|delete|patch|all|use)\s*\(\s*['"]/gi,
      /app\.(get|post|put|delete|patch|all|use)\s*\(\s*['"]/gi
    ],
    filePatterns: ['**/routes/**/*.js', '**/router/**/*.js', '**/api/**/*.js', '**/controllers/**/*.js']
  },

  // FastAPI (Python)
  fastapi: {
    patterns: [
      /@(app|router)\.(get|post|put|delete|patch)\s*\(/gi,
      /@router\.api_route\s*\(/gi
    ],
    filePatterns: ['**/routes/**/*.py', '**/api/**/*.py', '**/routers/**/*.py', '**/endpoints/**/*.py']
  },

  // Next.js (App Router)
  nextjs: {
    patterns: [
      /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*\(/gi,
      /export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=/gi
    ],
    filePatterns: ['**/app/**/route.ts', '**/app/**/route.js', '**/pages/api/**/*.ts', '**/pages/api/**/*.js']
  },

  // Django
  django: {
    patterns: [
      /path\s*\(\s*['"]/gi,
      /url\s*\(\s*r?['"]/gi,
      /@api_view\s*\(\s*\[/gi
    ],
    filePatterns: ['**/urls.py', '**/views.py', '**/api/**/*.py']
  },

  // Rails
  rails: {
    patterns: [
      /(get|post|put|patch|delete|resources|resource)\s+['"]/gi,
      /match\s+['"]/gi
    ],
    filePatterns: ['**/config/routes.rb', '**/app/controllers/**/*.rb']
  },

  // NestJS
  nestjs: {
    patterns: [
      /@(Get|Post|Put|Delete|Patch|All)\s*\(/gi,
      /@Controller\s*\(/gi
    ],
    filePatterns: ['**/*.controller.ts', '**/controllers/**/*.ts']
  },

  // Gin (Go)
  gin: {
    patterns: [
      /\.(GET|POST|PUT|DELETE|PATCH|Handle)\s*\(\s*"/gi,
      /router\.(GET|POST|PUT|DELETE|PATCH)\s*\(/gi
    ],
    filePatterns: ['**/routes/**/*.go', '**/handlers/**/*.go', '**/api/**/*.go', '**/main.go']
  },

  // Flask (Python)
  flask: {
    patterns: [
      /@(app|bp|blueprint)\.(route|get|post|put|delete|patch)\s*\(/gi
    ],
    filePatterns: ['**/routes/**/*.py', '**/views/**/*.py', '**/api/**/*.py', '**/app.py']
  }
};

/**
 * Workflow discovery heuristics
 */
const WORKFLOW_HEURISTICS = {
  authentication: {
    name: 'User Authentication',
    category: 'security',
    complexity: 'HIGH',
    keywords: ['login', 'logout', 'auth', 'authenticate', 'session', 'token', 'jwt', 'oauth', 'sso', 'password'],
    filePatterns: ['**/auth/**', '**/login/**', '**/session/**', '**/oauth/**'],
    priority: 1
  },

  userManagement: {
    name: 'User Management',
    category: 'core',
    complexity: 'MEDIUM',
    keywords: ['user', 'profile', 'account', 'registration', 'signup', 'register', 'onboarding'],
    filePatterns: ['**/users/**', '**/profile/**', '**/accounts/**', '**/members/**'],
    priority: 2
  },

  payments: {
    name: 'Payment Processing',
    category: 'core',
    complexity: 'HIGH',
    keywords: ['payment', 'stripe', 'paypal', 'invoice', 'billing', 'subscription', 'checkout', 'cart', 'order'],
    filePatterns: ['**/payments/**', '**/billing/**', '**/checkout/**', '**/orders/**', '**/subscriptions/**'],
    priority: 1
  },

  dataProcessing: {
    name: 'Data Processing',
    category: 'infrastructure',
    complexity: 'HIGH',
    keywords: ['process', 'transform', 'pipeline', 'batch', 'worker', 'job', 'queue', 'task', 'etl'],
    filePatterns: ['**/workers/**', '**/jobs/**', '**/tasks/**', '**/pipelines/**', '**/queues/**'],
    priority: 2
  },

  apiEndpoints: {
    name: 'API Endpoints',
    category: 'core',
    complexity: 'MEDIUM',
    keywords: ['api', 'endpoint', 'route', 'controller', 'handler', 'resource'],
    filePatterns: ['**/routes/**', '**/api/**', '**/controllers/**', '**/handlers/**'],
    priority: 3
  },

  database: {
    name: 'Database Operations',
    category: 'infrastructure',
    complexity: 'MEDIUM',
    keywords: ['model', 'schema', 'migration', 'repository', 'dao', 'orm', 'query', 'database'],
    filePatterns: ['**/models/**', '**/schemas/**', '**/migrations/**', '**/repositories/**', '**/entities/**'],
    priority: 2
  },

  notifications: {
    name: 'Notifications',
    category: 'features',
    complexity: 'MEDIUM',
    keywords: ['notification', 'email', 'sms', 'push', 'alert', 'message', 'mail', 'notify'],
    filePatterns: ['**/notifications/**', '**/emails/**', '**/mailers/**', '**/messaging/**'],
    priority: 3
  },

  fileHandling: {
    name: 'File Handling',
    category: 'features',
    complexity: 'MEDIUM',
    keywords: ['upload', 'download', 'file', 'storage', 's3', 'blob', 'attachment', 'media'],
    filePatterns: ['**/uploads/**', '**/storage/**', '**/files/**', '**/media/**'],
    priority: 3
  },

  search: {
    name: 'Search',
    category: 'features',
    complexity: 'MEDIUM',
    keywords: ['search', 'filter', 'query', 'elasticsearch', 'algolia', 'index', 'find'],
    filePatterns: ['**/search/**', '**/filters/**'],
    priority: 3
  },

  analytics: {
    name: 'Analytics',
    category: 'features',
    complexity: 'MEDIUM',
    keywords: ['analytics', 'tracking', 'metrics', 'stats', 'dashboard', 'report', 'insight'],
    filePatterns: ['**/analytics/**', '**/tracking/**', '**/metrics/**', '**/reports/**'],
    priority: 4
  },

  testing: {
    name: 'Testing',
    category: 'infrastructure',
    complexity: 'LOW',
    keywords: ['test', 'spec', 'mock', 'fixture', 'factory', 'stub'],
    filePatterns: ['**/tests/**', '**/test/**', '**/__tests__/**', '**/spec/**'],
    priority: 5
  },

  configuration: {
    name: 'Configuration',
    category: 'infrastructure',
    complexity: 'LOW',
    keywords: ['config', 'setting', 'env', 'constant', 'option'],
    filePatterns: ['**/config/**', '**/settings/**', '**/constants/**'],
    priority: 5
  }
};

/**
 * Source file extensions by language
 */
const SOURCE_EXTENSIONS = {
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  typescript: ['.ts', '.tsx', '.mts', '.cts'],
  python: ['.py'],
  go: ['.go'],
  rust: ['.rs'],
  ruby: ['.rb'],
  java: ['.java'],
  csharp: ['.cs'],
  php: ['.php']
};

/**
 * Directories to exclude from analysis
 */
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '__pycache__',
  '.venv',
  'venv',
  'vendor',
  'target',
  '.cache',
  'coverage',
  '.nyc_output'
];

/**
 * Find all source files in the project
 * @param {string} projectRoot - Project root directory
 * @param {string[]} languages - Languages to include
 * @returns {Promise<string[]>}
 */
async function findSourceFiles(projectRoot, languages = null) {
  const extensions = languages
    ? languages.flatMap(lang => SOURCE_EXTENSIONS[lang] || [])
    : Object.values(SOURCE_EXTENSIONS).flat();

  const pattern = `**/*{${extensions.join(',')}}`;

  const files = await glob(pattern, {
    cwd: projectRoot,
    nodir: true,
    ignore: EXCLUDED_DIRS.map(d => `**/${d}/**`)
  });

  return files;
}

/**
 * Discover entry points in the codebase
 * @param {string} projectRoot - Project root directory
 * @param {string[]} sourceFiles - List of source files
 * @param {object} techStack - Detected tech stack
 * @returns {Promise<object[]>}
 */
async function discoverEntryPoints(projectRoot, sourceFiles, techStack) {
  const entryPoints = [];
  const frameworks = techStack.frameworks || [];

  // Get relevant pattern sets
  const patternSets = [];
  for (const framework of frameworks) {
    if (ENTRY_PATTERNS[framework]) {
      patternSets.push(ENTRY_PATTERNS[framework]);
    }
  }

  // If no specific frameworks, try all patterns
  if (patternSets.length === 0) {
    patternSets.push(...Object.values(ENTRY_PATTERNS));
  }

  for (const file of sourceFiles) {
    const filePath = path.join(projectRoot, file);

    // Check if file matches any file patterns
    let isRelevant = false;
    for (const patternSet of patternSets) {
      for (const fp of patternSet.filePatterns) {
        if (minimatch(file, fp)) {
          isRelevant = true;
          break;
        }
      }
      if (isRelevant) break;
    }

    // For efficiency, skip if not a likely entry point file
    if (!isRelevant && sourceFiles.length > 100) {
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      for (const patternSet of patternSets) {
        for (const pattern of patternSet.patterns) {
          let match;
          pattern.lastIndex = 0;

          while ((match = pattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const lineContent = lines[lineNumber - 1] || '';

            // Extract route/path from the match context
            const routeMatch = lineContent.match(/['"]([^'"]+)['"]/);
            const route = routeMatch ? routeMatch[1] : null;

            entryPoints.push({
              file,
              line: lineNumber,
              match: match[0].trim(),
              context: lineContent.trim(),
              route,
              method: extractMethod(match[0]),
              framework: Object.keys(ENTRY_PATTERNS).find(k =>
                ENTRY_PATTERNS[k].patterns.includes(pattern)
              ) || 'unknown'
            });
          }
        }
      }
    } catch (e) {
      // Skip files that can't be read
    }
  }

  // Deduplicate by file:line
  const seen = new Set();
  return entryPoints.filter(ep => {
    const key = `${ep.file}:${ep.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Extract HTTP method from pattern match
 * @param {string} matchText - The matched text
 * @returns {string|null}
 */
function extractMethod(matchText) {
  const methodMatch = matchText.match(/\.(get|post|put|delete|patch|all|use|GET|POST|PUT|DELETE|PATCH)/i);
  return methodMatch ? methodMatch[1].toUpperCase() : null;
}

/**
 * Simple minimatch implementation for glob patterns
 * @param {string} file - File path
 * @param {string} pattern - Glob pattern
 * @returns {boolean}
 */
function minimatch(file, pattern) {
  // Convert glob to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '{{DOUBLE}}')
    .replace(/\*/g, '[^/]*')
    .replace(/{{DOUBLE}}/g, '.*')
    .replace(/\//g, '\\/');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(file);
}

/**
 * Discover workflows in the codebase
 * @param {string} projectRoot - Project root directory
 * @param {string[]} sourceFiles - List of source files
 * @returns {Promise<object[]>}
 */
async function discoverWorkflows(projectRoot, sourceFiles) {
  const workflows = [];

  for (const [workflowType, heuristics] of Object.entries(WORKFLOW_HEURISTICS)) {
    const matchingFiles = new Set();
    let keywordScore = 0;

    // Check file patterns
    for (const pattern of heuristics.filePatterns) {
      for (const file of sourceFiles) {
        if (minimatch(file, pattern)) {
          matchingFiles.add(file);
        }
      }
    }

    // Check keywords in file content (sample first 50 matching files)
    const filesToCheck = Array.from(matchingFiles).slice(0, 50);

    for (const file of filesToCheck) {
      try {
        const content = fs.readFileSync(path.join(projectRoot, file), 'utf-8').toLowerCase();
        const matchCount = heuristics.keywords.filter(kw => content.includes(kw)).length;
        keywordScore += matchCount;
      } catch {
        // Skip unreadable files
      }
    }

    // Also check remaining source files for keyword matches
    if (filesToCheck.length === 0) {
      const sampled = sourceFiles.slice(0, 200);
      for (const file of sampled) {
        try {
          const content = fs.readFileSync(path.join(projectRoot, file), 'utf-8').toLowerCase();
          const matchCount = heuristics.keywords.filter(kw => content.includes(kw)).length;
          if (matchCount >= 2) {
            matchingFiles.add(file);
            keywordScore += matchCount;
          }
        } catch {
          // Skip unreadable files
        }
      }
    }

    if (matchingFiles.size > 0 || keywordScore >= 3) {
      workflows.push({
        type: workflowType,
        name: heuristics.name,
        category: heuristics.category,
        complexity: heuristics.complexity,
        priority: heuristics.priority,
        files: Array.from(matchingFiles),
        fileCount: matchingFiles.size,
        keywordScore,
        confidence: calculateConfidence(matchingFiles.size, keywordScore),
        status: 'discovered'
      });
    }
  }

  // Sort by priority and confidence
  workflows.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.confidence - a.confidence;
  });

  return workflows;
}

/**
 * Calculate workflow confidence score
 * @param {number} fileCount - Number of matching files
 * @param {number} keywordScore - Keyword match score
 * @returns {number}
 */
function calculateConfidence(fileCount, keywordScore) {
  // Scale: 0-100
  const fileScore = Math.min(fileCount * 10, 50);
  const kwScore = Math.min(keywordScore * 5, 50);
  return fileScore + kwScore;
}

/**
 * Map the architecture of the codebase
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<object>}
 */
async function mapArchitecture(projectRoot) {
  const architecture = {
    directories: [],
    layers: [],
    components: [],
    directoryTree: ''
  };

  // Get top-level directories
  const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
  const dirs = entries
    .filter(e => e.isDirectory() && !EXCLUDED_DIRS.includes(e.name) && !e.name.startsWith('.'))
    .map(e => e.name);

  architecture.directories = dirs;

  // Identify architectural layers
  const layerPatterns = {
    presentation: ['components', 'views', 'pages', 'ui', 'templates', 'layouts', 'frontend'],
    application: ['services', 'usecases', 'handlers', 'controllers', 'actions'],
    domain: ['models', 'entities', 'domain', 'core', 'business'],
    infrastructure: ['repositories', 'database', 'db', 'cache', 'external', 'integrations', 'adapters'],
    api: ['api', 'routes', 'endpoints', 'rest', 'graphql'],
    config: ['config', 'settings', 'constants'],
    tests: ['tests', 'test', '__tests__', 'spec']
  };

  for (const [layer, patterns] of Object.entries(layerPatterns)) {
    const matchingDirs = dirs.filter(d =>
      patterns.some(p => d.toLowerCase().includes(p))
    );
    if (matchingDirs.length > 0) {
      architecture.layers.push({
        name: layer,
        directories: matchingDirs,
        purpose: getLayerPurpose(layer)
      });
    }
  }

  // Build directory tree (max 3 levels)
  architecture.directoryTree = buildDirectoryTree(projectRoot, 3);

  return architecture;
}

/**
 * Get purpose description for a layer
 * @param {string} layer - Layer name
 * @returns {string}
 */
function getLayerPurpose(layer) {
  const purposes = {
    presentation: 'User interface components and views',
    application: 'Application logic and service orchestration',
    domain: 'Core business logic and domain models',
    infrastructure: 'External systems and data persistence',
    api: 'API endpoints and route handling',
    config: 'Configuration and environment settings',
    tests: 'Test files and fixtures'
  };
  return purposes[layer] || 'Unknown';
}

/**
 * Build ASCII directory tree
 * @param {string} dir - Directory path
 * @param {number} maxDepth - Maximum depth
 * @param {string} prefix - Current prefix
 * @param {number} depth - Current depth
 * @returns {string}
 */
function buildDirectoryTree(dir, maxDepth, prefix = '', depth = 0) {
  if (depth >= maxDepth) return '';

  let tree = '';
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const filtered = entries.filter(e =>
    !EXCLUDED_DIRS.includes(e.name) &&
    !e.name.startsWith('.') &&
    e.isDirectory()
  );

  filtered.forEach((entry, index) => {
    const isLast = index === filtered.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';

    tree += `${prefix}${connector}${entry.name}/\n`;
    tree += buildDirectoryTree(
      path.join(dir, entry.name),
      maxDepth,
      prefix + childPrefix,
      depth + 1
    );
  });

  return tree;
}

/**
 * Extract dependencies from the project
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<object[]>}
 */
async function extractDependencies(projectRoot) {
  const dependencies = [];

  // Check package.json (Node.js)
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      for (const [name, version] of Object.entries(deps)) {
        dependencies.push({
          name,
          version,
          type: pkg.devDependencies?.[name] ? 'dev' : 'runtime',
          ecosystem: 'npm'
        });
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check requirements.txt (Python)
  const requirementsPath = path.join(projectRoot, 'requirements.txt');
  if (fs.existsSync(requirementsPath)) {
    try {
      const content = fs.readFileSync(requirementsPath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));

      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_-]+)([=<>!~]+.*)?/);
        if (match) {
          dependencies.push({
            name: match[1],
            version: match[2] || '*',
            type: 'runtime',
            ecosystem: 'pip'
          });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check go.mod (Go)
  const goModPath = path.join(projectRoot, 'go.mod');
  if (fs.existsSync(goModPath)) {
    try {
      const content = fs.readFileSync(goModPath, 'utf-8');
      const requireMatch = content.match(/require\s*\(([\s\S]*?)\)/);
      if (requireMatch) {
        const lines = requireMatch[1].split('\n').filter(l => l.trim());
        for (const line of lines) {
          const match = line.trim().match(/^([^\s]+)\s+([^\s]+)/);
          if (match) {
            dependencies.push({
              name: match[1],
              version: match[2],
              type: 'runtime',
              ecosystem: 'go'
            });
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return dependencies;
}

/**
 * Count lines of code by file
 * @param {string} projectRoot - Project root directory
 * @param {string[]} sourceFiles - List of source files
 * @returns {Promise<object>}
 */
async function countLinesOfCode(projectRoot, sourceFiles) {
  const locByFile = {};
  let totalLoc = 0;

  for (const file of sourceFiles.slice(0, 500)) { // Limit for performance
    try {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf-8');
      const lines = content.split('\n').filter(l => l.trim()).length;
      locByFile[file] = lines;
      totalLoc += lines;
    } catch {
      // Skip unreadable files
    }
  }

  return { byFile: locByFile, total: totalLoc };
}

/**
 * Main analysis function
 * @param {string} projectRoot - Project root directory
 * @param {object} options - Analysis options
 * @returns {Promise<object>}
 */
async function analyzeCodebase(projectRoot, options = {}) {
  const { techStack = {} } = options;

  // Find all source files
  const sourceFiles = await findSourceFiles(projectRoot, techStack.languages);

  // Run all analyses
  const [entryPoints, workflows, architecture, dependencies, loc] = await Promise.all([
    discoverEntryPoints(projectRoot, sourceFiles, techStack),
    discoverWorkflows(projectRoot, sourceFiles),
    mapArchitecture(projectRoot),
    extractDependencies(projectRoot),
    countLinesOfCode(projectRoot, sourceFiles)
  ]);

  return {
    projectRoot,
    sourceFiles: sourceFiles.length,
    entryPoints,
    workflows,
    architecture,
    dependencies,
    linesOfCode: loc,
    analyzedAt: new Date().toISOString(),
    summary: {
      totalFiles: sourceFiles.length,
      entryPointCount: entryPoints.length,
      workflowCount: workflows.length,
      layerCount: architecture.layers.length,
      dependencyCount: dependencies.length,
      totalLoc: loc.total
    }
  };
}

module.exports = {
  analyzeCodebase,
  findSourceFiles,
  discoverEntryPoints,
  discoverWorkflows,
  mapArchitecture,
  extractDependencies,
  countLinesOfCode,
  ENTRY_PATTERNS,
  WORKFLOW_HEURISTICS,
  SOURCE_EXTENSIONS,
  EXCLUDED_DIRS
};
