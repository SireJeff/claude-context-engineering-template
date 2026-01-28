/**
 * AI Context Engineering - Tech Stack Detector
 *
 * Auto-detects technology stack from project files.
 * Enhanced with LOC counting, file purpose classification, and deeper analysis.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * File purpose classification patterns
 */
const FILE_PURPOSE_PATTERNS = {
  controller: {
    patterns: [/controller/i, /handler/i, /endpoint/i],
    directories: ['controllers', 'handlers', 'api', 'endpoints'],
    keywords: ['@Controller', 'def handle', 'func Handle', 'router.']
  },
  model: {
    patterns: [/model/i, /entity/i, /schema/i],
    directories: ['models', 'entities', 'schemas', 'domain'],
    keywords: ['mongoose.Schema', 'class Model', 'BaseModel', '@Entity']
  },
  service: {
    patterns: [/service/i, /usecase/i],
    directories: ['services', 'usecases', 'application'],
    keywords: ['@Service', '@Injectable', 'class Service']
  },
  repository: {
    patterns: [/repository/i, /repo/i, /dal/i],
    directories: ['repositories', 'repos', 'dal', 'data'],
    keywords: ['@Repository', 'class Repository', 'def find']
  },
  middleware: {
    patterns: [/middleware/i, /interceptor/i, /guard/i],
    directories: ['middleware', 'middlewares', 'interceptors', 'guards'],
    keywords: ['next()', 'req, res, next', '@Middleware']
  },
  config: {
    patterns: [/config/i, /settings/i, /env/i],
    directories: ['config', 'configuration', 'settings'],
    keywords: ['process.env', 'os.environ', 'Config', 'Settings']
  },
  util: {
    patterns: [/util/i, /helper/i, /common/i, /lib/i],
    directories: ['utils', 'utilities', 'helpers', 'common', 'lib', 'shared'],
    keywords: ['export function', 'module.exports', 'def ']
  },
  test: {
    patterns: [/test/i, /spec/i, /__test__/i],
    directories: ['tests', 'test', '__tests__', 'spec', 'specs'],
    keywords: ['describe(', 'it(', 'test(', 'def test_', 'func Test']
  },
  migration: {
    patterns: [/migration/i, /migrate/i],
    directories: ['migrations', 'migrate', 'db/migrate'],
    keywords: ['up()', 'down()', 'def change', 'CreateTable']
  },
  route: {
    patterns: [/route/i, /router/i, /url/i],
    directories: ['routes', 'routers', 'urls'],
    keywords: ['router.', 'app.get', 'path(', '@app.']
  }
};

/**
 * Tech stack detection signatures
 */
const TECH_SIGNATURES = {
  // Languages
  languages: {
    python: {
      files: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile', 'poetry.lock'],
      extensions: ['.py'],
    },
    javascript: {
      files: ['package.json', 'yarn.lock', 'pnpm-lock.yaml'],
      extensions: ['.js', '.mjs', '.cjs'],
    },
    typescript: {
      files: ['tsconfig.json'],
      extensions: ['.ts', '.tsx'],
    },
    go: {
      files: ['go.mod', 'go.sum'],
      extensions: ['.go'],
    },
    rust: {
      files: ['Cargo.toml', 'Cargo.lock'],
      extensions: ['.rs'],
    },
    java: {
      files: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
      extensions: ['.java'],
    },
    csharp: {
      files: ['*.csproj', '*.sln'],
      extensions: ['.cs'],
    },
    ruby: {
      files: ['Gemfile', 'Gemfile.lock'],
      extensions: ['.rb'],
    },
    php: {
      files: ['composer.json', 'composer.lock'],
      extensions: ['.php'],
    },
  },

  // Frameworks
  frameworks: {
    // Python
    fastapi: {
      language: 'python',
      patterns: ['fastapi', 'FastAPI', '@router', 'APIRouter'],
      files: [],
    },
    django: {
      language: 'python',
      patterns: ['django.conf', 'INSTALLED_APPS', 'from django'],
      files: ['manage.py'],
    },
    flask: {
      language: 'python',
      patterns: ['Flask(__name__)', '@app.route', 'from flask'],
      files: [],
    },

    // JavaScript/TypeScript
    react: {
      language: 'javascript',
      patterns: ['react', 'React', 'useState', 'useEffect'],
      packageDeps: ['react', 'react-dom'],
    },
    nextjs: {
      language: 'javascript',
      patterns: ['next/'],
      files: ['next.config.js', 'next.config.mjs'],
      packageDeps: ['next'],
    },
    express: {
      language: 'javascript',
      patterns: ['express()', 'app.use', 'app.get', 'router.'],
      packageDeps: ['express'],
    },
    nestjs: {
      language: 'typescript',
      patterns: ['@nestjs/', '@Controller', '@Injectable'],
      packageDeps: ['@nestjs/core'],
    },
    vue: {
      language: 'javascript',
      patterns: ['<template>', 'Vue.'],
      packageDeps: ['vue'],
    },

    // Go
    gin: {
      language: 'go',
      patterns: ['gin.', 'gin-gonic'],
      files: [],
    },
    echo: {
      language: 'go',
      patterns: ['echo.', 'labstack/echo'],
      files: [],
    },

    // Ruby
    rails: {
      language: 'ruby',
      patterns: ['Rails.application', 'ActionController', 'ActiveRecord'],
      files: ['config/routes.rb'],
    },

    // Rust
    actix: {
      language: 'rust',
      patterns: ['actix_web', 'actix-web'],
      files: [],
    },
    axum: {
      language: 'rust',
      patterns: ['axum::'],
      files: [],
    },
  },

  // Databases
  databases: {
    postgresql: {
      patterns: ['postgresql', 'postgres', 'psycopg', 'pg'],
      envVars: ['DATABASE_URL', 'POSTGRES_'],
    },
    mysql: {
      patterns: ['mysql', 'mariadb'],
      envVars: ['MYSQL_'],
    },
    mongodb: {
      patterns: ['mongodb', 'mongoose', 'pymongo'],
      envVars: ['MONGO_'],
    },
    redis: {
      patterns: ['redis', 'ioredis'],
      envVars: ['REDIS_'],
    },
    sqlite: {
      patterns: ['sqlite', 'sqlite3'],
      files: ['*.db', '*.sqlite'],
    },
  },
};

/**
 * Entry point patterns for different frameworks
 */
const ENTRY_POINT_PATTERNS = {
  express: {
    regex: /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractor: (match) => ({ method: match[1].toUpperCase(), route: match[2] })
  },
  fastapi: {
    regex: /@app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractor: (match) => ({ method: match[1].toUpperCase(), route: match[2] })
  },
  nextjs: {
    regex: /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/g,
    extractor: (match) => ({ method: match[2], route: 'app-router' })
  },
  django: {
    regex: /path\s*\(\s*['"`]([^'"`]+)['"`]/g,
    extractor: (match) => ({ method: 'ANY', route: match[1] })
  },
  rails: {
    regex: /(get|post|put|delete|patch)\s+['"`]([^'"`]+)['"`]/g,
    extractor: (match) => ({ method: match[1].toUpperCase(), route: match[2] })
  },
  nestjs: {
    regex: /@(Get|Post|Put|Delete|Patch)\s*\(\s*['"`]?([^'"`)\s]*)['"`]?\s*\)/g,
    extractor: (match) => ({ method: match[1].toUpperCase(), route: match[2] || '/' })
  }
};

/**
 * Count lines of code in a file
 * @param {string} filePath - Path to file
 * @returns {object} LOC statistics
 */
function countLinesOfCode(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let total = lines.length;
    let code = 0;
    let comments = 0;
    let blank = 0;

    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        blank++;
        continue;
      }

      // Check for block comments
      if (trimmed.startsWith('/*') || trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        inBlockComment = true;
        comments++;
        if (trimmed.endsWith('*/') || (trimmed.length > 3 && (trimmed.endsWith('"""') || trimmed.endsWith("'''")))) {
          inBlockComment = false;
        }
        continue;
      }

      if (inBlockComment) {
        comments++;
        if (trimmed.includes('*/') || trimmed.endsWith('"""') || trimmed.endsWith("'''")) {
          inBlockComment = false;
        }
        continue;
      }

      // Single line comments
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('--')) {
        comments++;
        continue;
      }

      code++;
    }

    return { total, code, comments, blank };
  } catch {
    return { total: 0, code: 0, comments: 0, blank: 0 };
  }
}

/**
 * Count LOC for entire project
 * @param {string} projectRoot - Project root directory
 * @param {string[]} extensions - File extensions to count
 * @returns {Promise<object>} LOC statistics
 */
async function countProjectLOC(projectRoot, extensions = ['.js', '.ts', '.py', '.go', '.rb', '.rs', '.java']) {
  const stats = {
    total: 0,
    code: 0,
    comments: 0,
    blank: 0,
    files: 0,
    byLanguage: {}
  };

  // Build glob pattern - use array for multiple extensions, single pattern for one
  const patterns = extensions.map(e => `**/*${e}`);
  const globPattern = patterns.length === 1 ? patterns[0] : `{${patterns.join(',')}}`;

  try {
    const files = await glob(globPattern, {
      cwd: projectRoot,
      ignore: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**', 'build/**', '__pycache__/**', '*.min.js'],
      nodir: true
    });

    for (const file of files.slice(0, 200)) { // Limit to 200 files for performance
      const filePath = path.join(projectRoot, file);
      const ext = path.extname(file);
      const fileLoc = countLinesOfCode(filePath);

      stats.total += fileLoc.total;
      stats.code += fileLoc.code;
      stats.comments += fileLoc.comments;
      stats.blank += fileLoc.blank;
      stats.files++;

      // Track by language
      if (!stats.byLanguage[ext]) {
        stats.byLanguage[ext] = { total: 0, code: 0, files: 0 };
      }
      stats.byLanguage[ext].total += fileLoc.total;
      stats.byLanguage[ext].code += fileLoc.code;
      stats.byLanguage[ext].files++;
    }
  } catch {
    // Ignore glob errors
  }

  return stats;
}

/**
 * Classify file purpose
 * @param {string} filePath - Relative file path
 * @param {string} content - File content (optional, for deeper analysis)
 * @returns {string} File purpose category
 */
function classifyFilePurpose(filePath, content = null) {
  const lowerPath = filePath.toLowerCase();
  const dirName = path.dirname(lowerPath);
  const fileName = path.basename(lowerPath, path.extname(lowerPath));

  for (const [purpose, config] of Object.entries(FILE_PURPOSE_PATTERNS)) {
    // Check directory patterns
    for (const dir of config.directories) {
      if (dirName.includes(dir) || dirName.endsWith(dir)) {
        return purpose;
      }
    }

    // Check filename patterns
    for (const pattern of config.patterns) {
      if (pattern.test(fileName) || pattern.test(lowerPath)) {
        return purpose;
      }
    }

    // Check content keywords if content provided
    if (content) {
      for (const keyword of config.keywords) {
        if (content.includes(keyword)) {
          return purpose;
        }
      }
    }
  }

  return 'other';
}

/**
 * Analyze file purposes in project
 * @param {string} projectRoot - Project root
 * @param {string[]} extensions - File extensions to analyze
 * @returns {Promise<object>} File purpose analysis
 */
async function analyzeFilePurposes(projectRoot, extensions = ['.js', '.ts', '.py', '.go', '.rb']) {
  const purposes = {};
  const filesByPurpose = {};

  // Build glob pattern - use array for multiple extensions, single pattern for one
  const patterns = extensions.map(e => `**/*${e}`);
  const globPattern = patterns.length === 1 ? patterns[0] : `{${patterns.join(',')}}`;

  try {
    const files = await glob(globPattern, {
      cwd: projectRoot,
      ignore: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**', 'build/**', '__pycache__/**'],
      nodir: true
    });

    for (const file of files.slice(0, 100)) { // Limit for performance
      let content = null;
      try {
        content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
      } catch {
        // Skip unreadable files
      }

      const purpose = classifyFilePurpose(file, content);

      if (!purposes[purpose]) {
        purposes[purpose] = 0;
        filesByPurpose[purpose] = [];
      }
      purposes[purpose]++;
      filesByPurpose[purpose].push(file);
    }
  } catch {
    // Ignore glob errors
  }

  return { counts: purposes, files: filesByPurpose };
}

/**
 * Detect entry points in source files
 */
async function detectEntryPoints(projectRoot, frameworks) {
  const entryPoints = [];

  for (const framework of frameworks) {
    const pattern = ENTRY_POINT_PATTERNS[framework];
    if (!pattern) continue;

    // Get appropriate file extension
    const lang = TECH_SIGNATURES.frameworks[framework]?.language || 'javascript';
    const ext = TECH_SIGNATURES.languages[lang]?.extensions?.[0] || '.js';

    try {
      const files = await glob(`**/*${ext}`, {
        cwd: projectRoot,
        ignore: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**', 'build/**', '__pycache__/**'],
        nodir: true,
      });

      for (const file of files.slice(0, 20)) { // Limit to 20 files
        try {
          const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
          let match;

          while ((match = pattern.regex.exec(content)) !== null) {
            const entry = pattern.extractor(match);
            entryPoints.push({
              ...entry,
              file,
              line: content.substring(0, match.index).split('\n').length,
              framework
            });
          }
          pattern.regex.lastIndex = 0; // Reset regex
        } catch {
          // Skip unreadable files
        }
      }
    } catch {
      // Skip glob errors
    }
  }

  return entryPoints;
}

/**
 * Detect technology stack
 */
async function detectTechStack(projectRoot, options = {}) {
  const { hint = null } = options;

  const result = {
    stack: '',
    summary: '',
    languages: [],
    frameworks: [],
    databases: [],
    projectName: path.basename(projectRoot),
    fileCount: 0,
    loc: 0,
  };

  // If hint provided, use it
  if (hint) {
    result.stack = hint;
    result.summary = hint;
    return result;
  }

  // Detect languages
  for (const [lang, signature] of Object.entries(TECH_SIGNATURES.languages)) {
    // Check for signature files
    for (const sigFile of signature.files) {
      if (fs.existsSync(path.join(projectRoot, sigFile))) {
        if (!result.languages.includes(lang)) {
          result.languages.push(lang);
        }
        break;
      }
    }

    // Check for file extensions
    if (signature.extensions) {
      for (const ext of signature.extensions) {
        try {
          const files = await glob(`**/*${ext}`, {
            cwd: projectRoot,
            ignore: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**', 'build/**'],
            nodir: true,
          });

          if (files.length > 0) {
            if (!result.languages.includes(lang)) {
              result.languages.push(lang);
            }
            result.fileCount += files.length;
            break;
          }
        } catch {
          // Ignore glob errors
        }
      }
    }
  }

  // Detect frameworks
  for (const [framework, signature] of Object.entries(TECH_SIGNATURES.frameworks)) {
    // Check for package.json dependencies
    if (signature.packageDeps) {
      const pkgPath = path.join(projectRoot, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
          };

          for (const dep of signature.packageDeps) {
            if (allDeps[dep]) {
              if (!result.frameworks.includes(framework)) {
                result.frameworks.push(framework);
              }
              break;
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    }

    // Check for signature files
    if (signature.files) {
      for (const sigFile of signature.files) {
        if (fs.existsSync(path.join(projectRoot, sigFile))) {
          if (!result.frameworks.includes(framework)) {
            result.frameworks.push(framework);
          }
          break;
        }
      }
    }

    // Check for patterns in source files (sample)
    if (signature.patterns && result.languages.includes(signature.language)) {
      // Sample a few source files
      const ext = TECH_SIGNATURES.languages[signature.language]?.extensions?.[0];
      if (ext) {
        try {
          const sampleFiles = await glob(`**/*${ext}`, {
            cwd: projectRoot,
            ignore: ['node_modules/**', 'vendor/**', '.git/**'],
            nodir: true,
          });

          // Check first 5 files
          for (const file of sampleFiles.slice(0, 5)) {
            try {
              const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');

              for (const pattern of signature.patterns) {
                if (content.includes(pattern)) {
                  if (!result.frameworks.includes(framework)) {
                    result.frameworks.push(framework);
                  }
                  break;
                }
              }
            } catch {
              // Ignore file read errors
            }
          }
        } catch {
          // Ignore glob errors
        }
      }
    }
  }

  // Detect databases
  for (const [db, signature] of Object.entries(TECH_SIGNATURES.databases)) {
    // Check environment files
    const envFiles = ['.env', '.env.example', '.env.local'];
    for (const envFile of envFiles) {
      const envPath = path.join(projectRoot, envFile);
      if (fs.existsSync(envPath)) {
        try {
          const content = fs.readFileSync(envPath, 'utf8');

          if (signature.envVars) {
            for (const envVar of signature.envVars) {
              if (content.includes(envVar)) {
                if (!result.databases.includes(db)) {
                  result.databases.push(db);
                }
                break;
              }
            }
          }
        } catch {
          // Ignore read errors
        }
      }
    }

    // Check for patterns in config files
    if (signature.patterns) {
      const configFiles = ['package.json', 'requirements.txt', 'pyproject.toml', 'Cargo.toml'];
      for (const configFile of configFiles) {
        const configPath = path.join(projectRoot, configFile);
        if (fs.existsSync(configPath)) {
          try {
            const content = fs.readFileSync(configPath, 'utf8').toLowerCase();

            for (const pattern of signature.patterns) {
              if (content.includes(pattern.toLowerCase())) {
                if (!result.databases.includes(db)) {
                  result.databases.push(db);
                }
                break;
              }
            }
          } catch {
            // Ignore read errors
          }
        }
      }
    }
  }

  // Detect entry points for discovered frameworks
  result.entryPoints = await detectEntryPoints(projectRoot, result.frameworks);

  // Count lines of code
  const langExtensions = result.languages.flatMap(lang =>
    TECH_SIGNATURES.languages[lang]?.extensions || []
  );
  if (langExtensions.length > 0) {
    result.loc = await countProjectLOC(projectRoot, langExtensions);
  } else {
    result.loc = await countProjectLOC(projectRoot);
  }

  // Analyze file purposes
  result.filePurposes = await analyzeFilePurposes(projectRoot, langExtensions.length > 0 ? langExtensions : undefined);

  // Build stack string
  const stackParts = [];
  if (result.languages.length > 0) {
    stackParts.push(result.languages.map(l => capitalize(l)).join(', '));
  }
  if (result.frameworks.length > 0) {
    stackParts.push(result.frameworks.map(f => capitalize(f)).join(', '));
  }
  if (result.databases.length > 0) {
    stackParts.push(result.databases.map(d => capitalize(d)).join(', '));
  }

  result.stack = stackParts.join(' + ') || 'Unknown';
  result.summary = result.stack;

  return result;
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  detectTechStack,
  detectEntryPoints,
  countLinesOfCode,
  countProjectLOC,
  classifyFilePurpose,
  analyzeFilePurposes,
  TECH_SIGNATURES,
  ENTRY_POINT_PATTERNS,
  FILE_PURPOSE_PATTERNS,
};
