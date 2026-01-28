/**
 * AI Context Engineering - Documentation Discovery Module
 *
 * Scans for existing AI context files and documentation before initialization.
 * Detects which AI tools are already configured and extracts values from existing docs.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * AI tool detection signatures
 */
const AI_TOOL_SIGNATURES = {
  claude: {
    v1: {
      directory: '.claude',
      entryFile: 'CLAUDE.md',
      markers: ['.claude/agents/', '.claude/commands/', '.claude/context/']
    },
    v2: {
      directory: '.ai-context',
      entryFile: 'AI_CONTEXT.md',
      markers: ['.ai-context/agents/', '.ai-context/commands/', '.ai-context/context/']
    }
  },
  copilot: {
    paths: ['.github/copilot-instructions.md'],
    markers: ['copilot-instructions']
  },
  cline: {
    paths: ['.clinerules'],
    markers: ['.clinerules']
  },
  antigravity: {
    paths: ['.agent/'],
    markers: ['.agent/knowledge/', '.agent/config/', '.agent/rules/']
  }
};

/**
 * Common documentation locations
 */
const COMMON_DOC_PATTERNS = {
  readme: ['README.md', 'readme.md', 'README.markdown', 'docs/README.md'],
  architecture: ['ARCHITECTURE.md', 'docs/ARCHITECTURE.md', 'docs/architecture.md', 'DESIGN.md'],
  contributing: ['CONTRIBUTING.md', 'docs/CONTRIBUTING.md'],
  changelog: ['CHANGELOG.md', 'HISTORY.md', 'CHANGES.md'],
  docsDir: ['docs/', 'documentation/', 'doc/']
};

/**
 * Patterns to extract filled placeholder values from existing docs
 */
const VALUE_EXTRACTION_PATTERNS = {
  PROJECT_NAME: [
    /\*\*Project(?:\s*Name)?:\*\*\s*(.+?)(?:\n|$)/i,
    /^#\s+(.+?)(?:\n|$)/m
  ],
  PROJECT_DESCRIPTION: [
    /\*\*(?:Platform|Description):\*\*\s*(.+?)(?:\n|$)/i,
    /^#[^#].*?\n\n(.+?)(?:\n\n|$)/ms
  ],
  TECH_STACK: [
    /\*\*Tech Stack:\*\*\s*(.+?)(?:\n|$)/i,
    /(?:built with|using|technologies?):\s*(.+?)(?:\n|$)/i
  ],
  PRODUCTION_URL: [
    /\*\*(?:Domain|URL|Production):\*\*\s*(.+?)(?:\n|$)/i,
    /https?:\/\/[^\s\)]+/
  ],
  API_URL: [
    /\*\*API:\*\*\s*(.+?)(?:\n|$)/i
  ],
  REPO_URL: [
    /\*\*Repo(?:sitory)?:\*\*\s*(.+?)(?:\n|$)/i,
    /github\.com\/[\w\-]+\/[\w\-]+/
  ],
  INSTALL_COMMAND: [
    /```(?:bash|sh)?\s*\n([^`]*(?:npm install|pip install|cargo build|go mod)[^`]*)/i
  ],
  TEST_COMMAND: [
    /```(?:bash|sh)?\s*\n([^`]*(?:npm test|pytest|cargo test|go test)[^`]*)/i
  ]
};

/**
 * Main entry point - discover all existing documentation
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<object>} Discovery result
 */
async function discoverExistingDocs(projectRoot) {
  const result = {
    hasExistingDocs: false,
    tools: {
      claude: null,
      copilot: null,
      cline: null,
      antigravity: null
    },
    commonDocs: {
      readme: null,
      architecture: null,
      contributing: null,
      changelog: null,
      docsDir: null
    },
    extractedValues: {},
    detectedPatterns: {
      techStack: null,
      projectName: null,
      projectDescription: null,
      workflows: [],
      architecture: null
    },
    conflicts: [],
    recommendations: []
  };

  // 1. Detect AI tools
  result.tools = detectAITools(projectRoot);

  // 2. Find common docs
  result.commonDocs = await findCommonDocs(projectRoot);

  // 3. Check if any docs exist
  result.hasExistingDocs =
    Object.values(result.tools).some(t => t?.exists) ||
    Object.values(result.commonDocs).some(d => d !== null);

  if (!result.hasExistingDocs) {
    return result;
  }

  // 4. Parse and extract values from each source
  const valueSources = [];

  // Extract from Claude context file (v1 or v2)
  if (result.tools.claude?.exists) {
    const claudeValues = parseContextFile(result.tools.claude.entryPath);
    if (claudeValues) {
      valueSources.push({ source: 'claude', values: claudeValues });
    }
  }

  // Extract from README
  if (result.commonDocs.readme) {
    const readmeValues = parseReadme(result.commonDocs.readme.path);
    if (readmeValues) {
      valueSources.push({ source: 'readme', values: readmeValues });
    }
  }

  // Extract from Copilot instructions
  if (result.tools.copilot?.exists) {
    const copilotValues = parseCopilotInstructions(result.tools.copilot.path);
    if (copilotValues) {
      valueSources.push({ source: 'copilot', values: copilotValues });
    }
  }

  // Extract from Cline rules
  if (result.tools.cline?.exists) {
    const clineValues = parseClinerules(result.tools.cline.path);
    if (clineValues) {
      valueSources.push({ source: 'cline', values: clineValues });
    }
  }

  // 5. Merge extracted values, tracking conflicts
  const { merged, conflicts } = mergeExtractedValues(valueSources);
  result.extractedValues = merged;
  result.conflicts = conflicts;

  // 6. Generate recommendations
  result.recommendations = calculateRecommendations(result);

  return result;
}

/**
 * Detect which AI tools have existing context
 * @param {string} projectRoot - Project root directory
 * @returns {object} Tool detection results
 */
function detectAITools(projectRoot) {
  const tools = {
    claude: null,
    copilot: null,
    cline: null,
    antigravity: null
  };

  // Detect Claude (v1 and v2)
  const claudeV1Dir = path.join(projectRoot, AI_TOOL_SIGNATURES.claude.v1.directory);
  const claudeV1File = path.join(projectRoot, AI_TOOL_SIGNATURES.claude.v1.entryFile);
  const claudeV2Dir = path.join(projectRoot, AI_TOOL_SIGNATURES.claude.v2.directory);
  const claudeV2File = path.join(projectRoot, AI_TOOL_SIGNATURES.claude.v2.entryFile);

  const hasV1Dir = fs.existsSync(claudeV1Dir);
  const hasV1File = fs.existsSync(claudeV1File);
  const hasV2Dir = fs.existsSync(claudeV2Dir);
  const hasV2File = fs.existsSync(claudeV2File);

  if (hasV1Dir || hasV1File || hasV2Dir || hasV2File) {
    // Prefer v2 if both exist
    const version = (hasV2Dir || hasV2File) ? 'v2' : 'v1';
    const dirPath = version === 'v2' ? claudeV2Dir : claudeV1Dir;
    const entryPath = version === 'v2' ? claudeV2File : claudeV1File;

    tools.claude = {
      exists: true,
      version,
      dirPath: fs.existsSync(dirPath) ? dirPath : null,
      entryPath: fs.existsSync(entryPath) ? entryPath : null,
      hasV1: hasV1Dir || hasV1File,
      hasV2: hasV2Dir || hasV2File,
      needsMigration: (hasV1Dir || hasV1File) && !(hasV2Dir || hasV2File)
    };
  }

  // Detect GitHub Copilot
  for (const relPath of AI_TOOL_SIGNATURES.copilot.paths) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath)) {
      tools.copilot = {
        exists: true,
        path: fullPath,
        relativePath: relPath
      };
      break;
    }
  }

  // Detect Cline
  for (const relPath of AI_TOOL_SIGNATURES.cline.paths) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath)) {
      tools.cline = {
        exists: true,
        path: fullPath,
        relativePath: relPath
      };
      break;
    }
  }

  // Detect Antigravity
  for (const relPath of AI_TOOL_SIGNATURES.antigravity.paths) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      tools.antigravity = {
        exists: true,
        path: fullPath,
        relativePath: relPath
      };
      break;
    }
  }

  return tools;
}

/**
 * Find common documentation files
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<object>} Common docs found
 */
async function findCommonDocs(projectRoot) {
  const docs = {
    readme: null,
    architecture: null,
    contributing: null,
    changelog: null,
    docsDir: null
  };

  // Find README
  for (const relPath of COMMON_DOC_PATTERNS.readme) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath)) {
      docs.readme = { path: fullPath, relativePath: relPath };
      break;
    }
  }

  // Find Architecture doc
  for (const relPath of COMMON_DOC_PATTERNS.architecture) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath)) {
      docs.architecture = { path: fullPath, relativePath: relPath };
      break;
    }
  }

  // Find Contributing doc
  for (const relPath of COMMON_DOC_PATTERNS.contributing) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath)) {
      docs.contributing = { path: fullPath, relativePath: relPath };
      break;
    }
  }

  // Find Changelog
  for (const relPath of COMMON_DOC_PATTERNS.changelog) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath)) {
      docs.changelog = { path: fullPath, relativePath: relPath };
      break;
    }
  }

  // Find docs directory
  for (const relPath of COMMON_DOC_PATTERNS.docsDir) {
    const fullPath = path.join(projectRoot, relPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      // Count markdown files in docs directory
      try {
        const mdFiles = await glob('**/*.md', { cwd: fullPath, nodir: true });
        docs.docsDir = {
          path: fullPath,
          relativePath: relPath,
          fileCount: mdFiles.length,
          files: mdFiles.slice(0, 10) // First 10 for preview
        };
      } catch {
        docs.docsDir = { path: fullPath, relativePath: relPath, fileCount: 0 };
      }
      break;
    }
  }

  return docs;
}

/**
 * Parse existing AI_CONTEXT.md/CLAUDE.md to extract values
 * @param {string} filePath - Path to context file
 * @returns {object|null} Extracted values
 */
function parseContextFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractValuesFromContent(content);
  } catch {
    return null;
  }
}

/**
 * Extract project info from README.md
 * @param {string} filePath - Path to README
 * @returns {object|null} Extracted project info
 */
function parseReadme(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const values = {};

    // Extract title as project name (first h1)
    const titleMatch = content.match(/^#\s+(.+?)(?:\n|$)/m);
    if (titleMatch) {
      // Remove badges and links from title
      const cleanTitle = titleMatch[1].replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '').trim();
      if (cleanTitle && !cleanTitle.match(/\{\{.*?\}\}/)) {
        values.PROJECT_NAME = cleanTitle;
      }
    }

    // Extract description (first paragraph after title)
    const descMatch = content.match(/^#[^#].*?\n\n(.+?)(?:\n\n|$)/ms);
    if (descMatch && descMatch[1].length < 500) {
      const cleanDesc = descMatch[1].trim();
      if (cleanDesc && !cleanDesc.match(/\{\{.*?\}\}/) && !cleanDesc.startsWith('![')) {
        values.PROJECT_DESCRIPTION = cleanDesc;
      }
    }

    // Extract repo URL from badges or links
    const repoMatch = content.match(/github\.com\/([\w\-]+\/[\w\-]+)/);
    if (repoMatch) {
      values.REPO_URL = `https://github.com/${repoMatch[1]}`;
    }

    return Object.keys(values).length > 0 ? values : null;
  } catch {
    return null;
  }
}

/**
 * Parse .clinerules for existing configurations
 * @param {string} filePath - Path to .clinerules
 * @returns {object|null} Cline configurations
 */
function parseClinerules(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractValuesFromContent(content);
  } catch {
    return null;
  }
}

/**
 * Parse copilot-instructions.md for existing context
 * @param {string} filePath - Path to copilot instructions
 * @returns {object|null} Copilot configurations
 */
function parseCopilotInstructions(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractValuesFromContent(content);
  } catch {
    return null;
  }
}

/**
 * Extract values from markdown content using patterns
 * @param {string} content - File content
 * @returns {object} Map of placeholder name to extracted value
 */
function extractValuesFromContent(content) {
  const values = {};

  for (const [placeholder, patterns] of Object.entries(VALUE_EXTRACTION_PATTERNS)) {
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        // Skip if it's still a placeholder
        if (!value.match(/\{\{[A-Z_]+\}\}/) && value.length < 500) {
          values[placeholder] = value;
          break;
        }
      }
    }
  }

  // Track unfilled placeholders
  const unfilledPattern = /\{\{([A-Z_]+)\}\}/g;
  const unfilled = [];
  let match;
  while ((match = unfilledPattern.exec(content)) !== null) {
    unfilled.push(match[1]);
  }
  if (unfilled.length > 0) {
    values._unfilledPlaceholders = [...new Set(unfilled)];
  }

  return Object.keys(values).length > 0 ? values : null;
}

/**
 * Merge extracted values from multiple sources, detecting conflicts
 * @param {Array} sources - Array of { source, values } objects
 * @returns {object} { merged, conflicts }
 */
function mergeExtractedValues(sources) {
  const merged = {};
  const conflicts = [];
  const seenKeys = {};

  for (const { source, values } of sources) {
    if (!values) continue;

    for (const [key, value] of Object.entries(values)) {
      if (key.startsWith('_')) continue; // Skip internal keys

      if (seenKeys[key]) {
        // Check for conflict
        if (seenKeys[key].value !== value) {
          conflicts.push({
            key,
            existingValue: seenKeys[key].value,
            existingSource: seenKeys[key].source,
            newValue: value,
            newSource: source
          });
        }
      } else {
        merged[key] = value;
        seenKeys[key] = { value, source };
      }
    }
  }

  return { merged, conflicts };
}

/**
 * Calculate recommendations based on discovery results
 * @param {object} discovery - Discovery results
 * @returns {Array} Recommendations
 */
function calculateRecommendations(discovery) {
  const recommendations = [];

  // Check for v1 → v2 migration
  if (discovery.tools.claude?.needsMigration) {
    recommendations.push({
      type: 'migration',
      priority: 'high',
      message: 'Claude context v1.x detected. Migration to v2.0 recommended.',
      action: 'Run with --mode merge to migrate and preserve customizations'
    });
  }

  // Check for multiple AI tools
  const existingTools = Object.entries(discovery.tools)
    .filter(([_, t]) => t?.exists)
    .map(([name, _]) => name);

  if (existingTools.length > 1) {
    recommendations.push({
      type: 'multi-tool',
      priority: 'info',
      message: `Multiple AI tool configs found: ${existingTools.join(', ')}`,
      action: 'Existing configs will be preserved unless --mode overwrite is used'
    });
  }

  // Check for conflicts
  if (discovery.conflicts.length > 0) {
    recommendations.push({
      type: 'conflicts',
      priority: 'medium',
      message: `${discovery.conflicts.length} value conflict(s) detected between sources`,
      action: 'Use --mode interactive to resolve conflicts manually'
    });
  }

  // Check for unfilled placeholders in existing docs
  const totalExtracted = Object.keys(discovery.extractedValues).length;
  if (totalExtracted > 0) {
    recommendations.push({
      type: 'extracted',
      priority: 'info',
      message: `Extracted ${totalExtracted} values from existing documentation`,
      action: 'These values will be preserved in merge mode'
    });
  }

  return recommendations;
}

/**
 * Generate user prompts for handling existing docs
 * @param {object} discovery - Discovery results
 * @returns {Array} Enquirer prompt configurations
 */
function generateDiscoveryPrompts(discovery) {
  if (!discovery.hasExistingDocs) {
    return [];
  }

  const prompts = [];

  // Build summary of what was found
  const foundItems = [];

  if (discovery.tools.claude?.exists) {
    const v = discovery.tools.claude.version;
    foundItems.push(`Claude context (${v})`);
  }
  if (discovery.tools.copilot?.exists) {
    foundItems.push('GitHub Copilot');
  }
  if (discovery.tools.cline?.exists) {
    foundItems.push('Cline');
  }
  if (discovery.tools.antigravity?.exists) {
    foundItems.push('Antigravity');
  }
  if (discovery.commonDocs.readme) {
    foundItems.push('README.md');
  }
  if (discovery.commonDocs.docsDir) {
    foundItems.push(`docs/ (${discovery.commonDocs.docsDir.fileCount} files)`);
  }

  // Main strategy prompt
  prompts.push({
    type: 'select',
    name: 'existingDocsStrategy',
    message: `Found existing documentation: ${foundItems.join(', ')}. How to proceed?`,
    choices: [
      {
        name: 'merge',
        message: 'Merge: Use existing docs as base, add new structure (recommended)',
        hint: 'Preserves your customizations'
      },
      {
        name: 'fresh',
        message: 'Fresh: Start fresh but import key values',
        hint: 'New structure, keeps extracted values'
      },
      {
        name: 'overwrite',
        message: 'Overwrite: Replace everything with new templates',
        hint: 'Warning: existing customizations will be lost'
      },
      {
        name: 'skip',
        message: 'Skip: Cancel initialization',
        hint: 'No changes will be made'
      }
    ],
    initial: 0
  });

  // If conflicts detected, add conflict resolution prompt
  if (discovery.conflicts.length > 0) {
    prompts.push({
      type: 'select',
      name: 'conflictResolution',
      message: `Found ${discovery.conflicts.length} conflicting value(s). Which source should take priority?`,
      choices: [
        { name: 'existing', message: 'Keep existing values (from older docs)' },
        { name: 'detected', message: 'Use newly detected values' },
        { name: 'ask', message: 'Ask for each conflict' }
      ],
      skip() {
        return this.state.answers.existingDocsStrategy === 'overwrite' ||
               this.state.answers.existingDocsStrategy === 'skip';
      }
    });
  }

  return prompts;
}

/**
 * Format discovery summary for display
 * @param {object} discovery - Discovery results
 * @returns {string} Formatted summary string
 */
function formatDiscoverySummary(discovery) {
  const lines = [];

  // AI Tools
  if (discovery.tools.claude?.exists) {
    const v = discovery.tools.claude.version;
    const migration = discovery.tools.claude.needsMigration ? ' (needs migration)' : '';
    lines.push(`  Claude ${v}${migration}`);
  }
  if (discovery.tools.copilot?.exists) {
    lines.push(`  GitHub Copilot: ${discovery.tools.copilot.relativePath}`);
  }
  if (discovery.tools.cline?.exists) {
    lines.push(`  Cline: ${discovery.tools.cline.relativePath}`);
  }
  if (discovery.tools.antigravity?.exists) {
    lines.push(`  Antigravity: ${discovery.tools.antigravity.relativePath}`);
  }

  // Common docs
  if (discovery.commonDocs.readme) {
    lines.push(`  README: ${discovery.commonDocs.readme.relativePath}`);
  }
  if (discovery.commonDocs.docsDir) {
    lines.push(`  Docs: ${discovery.commonDocs.docsDir.relativePath} (${discovery.commonDocs.docsDir.fileCount} files)`);
  }

  // Extracted values
  const valueCount = Object.keys(discovery.extractedValues).length;
  if (valueCount > 0) {
    lines.push(`  Extracted ${valueCount} value(s) from existing docs`);
  }

  // Conflicts
  if (discovery.conflicts.length > 0) {
    lines.push(`  ${discovery.conflicts.length} conflict(s) between sources`);
  }

  return lines.join('\n');
}

/**
 * Build merged values from discovery and chosen strategy
 * @param {object} discovery - Discovery results
 * @param {string} strategy - 'merge' | 'fresh' | 'overwrite'
 * @param {object} conflictResolutions - Optional conflict resolutions
 * @returns {object} Merged placeholder values
 */
function buildMergedValues(discovery, strategy, conflictResolutions = {}) {
  if (strategy === 'overwrite') {
    return {}; // Start fresh, use defaults
  }

  const values = { ...discovery.extractedValues };

  // Apply conflict resolutions
  for (const conflict of discovery.conflicts) {
    const resolution = conflictResolutions[conflict.key];
    if (resolution === 'existing') {
      values[conflict.key] = conflict.existingValue;
    } else if (resolution === 'new' || resolution === 'detected') {
      values[conflict.key] = conflict.newValue;
    }
    // If no resolution, keep the first seen value (already in values)
  }

  return values;
}

module.exports = {
  discoverExistingDocs,
  detectAITools,
  findCommonDocs,
  parseContextFile,
  parseReadme,
  parseClinerules,
  parseCopilotInstructions,
  extractValuesFromContent,
  generateDiscoveryPrompts,
  formatDiscoverySummary,
  buildMergedValues,
  AI_TOOL_SIGNATURES,
  COMMON_DOC_PATTERNS,
  VALUE_EXTRACTION_PATTERNS
};
