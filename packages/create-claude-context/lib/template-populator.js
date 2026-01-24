/**
 * Template Populator
 *
 * Takes analysis results and populates all template files
 * with real, project-specific content.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Slugify a string for use in filenames
 * @param {string} str - String to slugify
 * @returns {string}
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Populate all templates with analysis results
 * @param {string} claudeDir - .claude directory path
 * @param {object} analysis - Analysis results from static analyzer
 * @param {object} config - Configuration from CLI
 * @returns {Promise<object>} Results of population
 */
async function populateAllTemplates(claudeDir, analysis, config) {
  const results = {
    populated: [],
    skipped: [],
    errors: [],
    created: []
  };

  const projectRoot = path.dirname(claudeDir);
  const projectName = config.projectName || path.basename(projectRoot);

  // 1. Populate CLAUDE.md at project root
  try {
    await populateClaudeMd(projectRoot, analysis, config);
    results.populated.push('CLAUDE.md');
  } catch (error) {
    results.errors.push({ file: 'CLAUDE.md', error: error.message });
  }

  // 2. Generate ARCHITECTURE_SNAPSHOT.md
  try {
    const content = generateArchitectureSnapshot(analysis, config);
    const filePath = path.join(claudeDir, 'context', 'ARCHITECTURE_SNAPSHOT.md');
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
    results.populated.push('context/ARCHITECTURE_SNAPSHOT.md');
  } catch (error) {
    results.errors.push({ file: 'ARCHITECTURE_SNAPSHOT.md', error: error.message });
  }

  // 3. Generate WORKFLOW_INDEX.md
  try {
    const content = generateWorkflowIndex(analysis, config);
    const filePath = path.join(claudeDir, 'context', 'WORKFLOW_INDEX.md');
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
    results.populated.push('context/WORKFLOW_INDEX.md');
  } catch (error) {
    results.errors.push({ file: 'WORKFLOW_INDEX.md', error: error.message });
  }

  // 4. Generate CODE_TO_WORKFLOW_MAP.md
  try {
    const content = generateCodeToWorkflowMap(analysis, config);
    const filePath = path.join(claudeDir, 'context', 'CODE_TO_WORKFLOW_MAP.md');
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
    results.populated.push('context/CODE_TO_WORKFLOW_MAP.md');
  } catch (error) {
    results.errors.push({ file: 'CODE_TO_WORKFLOW_MAP.md', error: error.message });
  }

  // 5. Generate individual workflow files
  const workflowsDir = path.join(claudeDir, 'context', 'workflows');
  ensureDir(workflowsDir);

  for (const workflow of (analysis.workflows || [])) {
    try {
      const content = generateWorkflowFile(workflow, analysis, config);
      const filename = `${slugify(workflow.name)}.md`;
      const filePath = path.join(workflowsDir, filename);
      fs.writeFileSync(filePath, content);
      results.created.push(`context/workflows/${filename}`);
    } catch (error) {
      results.errors.push({ file: `workflow:${workflow.name}`, error: error.message });
    }
  }

  // 6. Update category indexes
  try {
    await updateCategoryIndexes(claudeDir, analysis, config);
    results.populated.push('indexes/workflows/CATEGORY_INDEX.md');
  } catch (error) {
    results.errors.push({ file: 'CATEGORY_INDEX.md', error: error.message });
  }

  return results;
}

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Populate CLAUDE.md with real project info
 * @param {string} projectRoot - Project root directory
 * @param {object} analysis - Analysis results
 * @param {object} config - Configuration
 */
async function populateClaudeMd(projectRoot, analysis, config) {
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');

  if (!fs.existsSync(claudeMdPath)) {
    return;
  }

  let content = fs.readFileSync(claudeMdPath, 'utf-8');
  const projectName = config.projectName || path.basename(projectRoot);

  // Build replacement map from analysis
  const replacements = {
    '{{PROJECT_NAME}}': projectName,
    '{{PROJECT_DESCRIPTION}}': `${projectName} application`,
    '{{TECH_STACK}}': analysis.techStack?.summary || config.techStack?.summary || 'Unknown',
    '{{PROJECT_STATUS}}': 'Development',
    '{{PRODUCTION_URL}}': `https://${slugify(projectName)}.example.com`,
    '{{API_URL}}': `https://api.${slugify(projectName)}.example.com`,
    '{{REPO_URL}}': `https://github.com/user/${slugify(projectName)}`,
    '{{DEPLOYMENT_PLATFORM}}': detectDeploymentPlatform(projectRoot),
    '{{DATE}}': new Date().toISOString().split('T')[0],

    // Commands
    '{{INSTALL_COMMAND}}': getInstallCommand(analysis.techStack || config.techStack),
    '{{DEV_START_COMMAND}}': getDevCommand(analysis.techStack || config.techStack),
    '{{TEST_COMMAND}}': getTestCommand(analysis.techStack || config.techStack),
    '{{TEST_E2E_COMMAND}}': 'npm run test:e2e',
    '{{TEST_COVERAGE_COMMAND}}': 'npm run test:coverage',
    '{{MIGRATION_CREATE_COMMAND}}': getMigrationCreateCommand(analysis.techStack || config.techStack),
    '{{MIGRATION_RUN_COMMAND}}': getMigrationRunCommand(analysis.techStack || config.techStack),
    '{{DEPLOY_COMMAND}}': 'npm run deploy',

    // Paths
    '{{MODELS_PATH}}': findModelsPath(analysis),
    '{{MIGRATIONS_PATH}}': findMigrationsPath(analysis),
    '{{CORE_FILES_LIST}}': formatCoreFiles(analysis),

    // Counts
    '{{WORKFLOWS_COUNT}}': String(analysis.workflows?.length || 0),
    '{{AGENTS_COUNT}}': '6',
    '{{COMMANDS_COUNT}}': '11',
    '{{INDEX_FILES_COUNT}}': '15',
    '{{WORKFLOW_DOMAINS_COUNT}}': String(analysis.workflows?.length || 0),
    '{{CODE_DOMAINS_COUNT}}': String(analysis.architecture?.layers?.length || 0),

    // Architecture
    '{{ARCHITECTURE_DIAGRAM}}': generateAsciiArchitecture(analysis),

    // Misc
    '{{EXTERNAL_INTEGRATIONS_LIST}}': formatExternalIntegrations(analysis),
    '{{CONFIG_SEARCH_PATTERN}}': 'grep -r "process.env" --include="*.js" --include="*.ts"',
    '{{URL_SEARCH_PATTERN}}': 'grep -rE "https?://" --include="*.js" --include="*.ts" --include="*.json"',

    // Placeholders for manual filling
    '{{EXAMPLE_REFACTOR_TASK}}': 'Refactor the authentication flow',
    '{{EXAMPLE_LOWLEVEL_TASK}}': 'Fix hardcoded API URL in config',
    '{{EXAMPLE_FEATURE_TASK}}': 'Add user notifications feature',
    '{{CRITICAL_URLS}}': `- Production: https://${slugify(projectName)}.example.com`,
    '{{BUSINESS_CONSTANTS}}': '- TBD (document key business constants)',
    '{{DEBUGGING_QUICK_REFS}}': 'KNOWN_GOTCHAS.md, logs/',
    '{{AGENT_ROUTING_TABLE}}': '@context-engineer for setup, @core-architect for design',
    '{{GOTCHA_CATEGORY_1}}': 'Database',
    '{{GOTCHA_1_ITEMS}}': '- TBD (document database gotchas)',
    '{{GOTCHA_CATEGORY_2}}': 'API',
    '{{GOTCHA_2_ITEMS}}': '- TBD (document API gotchas)',
    '{{PRODUCTION_PLATFORM}}': detectDeploymentPlatform(projectRoot),
    '{{PRODUCTION_SERVICES}}': 'Web, API, Database',
    '{{MONITORING_COMMANDS}}': 'Check logs, health endpoints',
    '{{MIGRATION_CONSTRAINTS}}': 'Always backup before migrations',
    '{{TESTING_CONSTRAINTS}}': 'Run tests before merging',
    '{{SECURITY_CONSTRAINTS}}': 'Never commit secrets',
    '{{CONTACT_INFO}}': 'TBD (add contact info)'
  };

  // Apply replacements
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(escapeRegex(placeholder), 'g'), value);
  }

  fs.writeFileSync(claudeMdPath, content);
}

/**
 * Escape regex special characters
 * @param {string} str - String to escape
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate ARCHITECTURE_SNAPSHOT.md content
 * @param {object} analysis - Analysis results
 * @param {object} config - Configuration
 * @returns {string}
 */
function generateArchitectureSnapshot(analysis, config) {
  const projectName = config.projectName || 'Project';
  const date = new Date().toISOString().split('T')[0];

  return `# Architecture Snapshot - ${projectName}

**Purpose:** High-level system map for rapid orientation
**Load:** When starting a new session or onboarding
**Size:** ~10k tokens (5% of 200k budget)
**Last Updated:** ${date}

---

## System Overview

\`\`\`
${generateAsciiArchitecture(analysis)}
\`\`\`

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
${formatTechStackTable(analysis)}

---

## Core Components

${formatComponents(analysis)}

---

## Directory Structure

\`\`\`
${analysis.architecture?.directoryTree || 'TBD - Run AI analysis for complete structure'}
\`\`\`

---

## Entry Points

| Type | Count | Key Files |
|------|-------|-----------|
| API Routes | ${analysis.entryPoints?.length || 0} | ${getTopEntryPointFiles(analysis)} |
| Workflows | ${analysis.workflows?.length || 0} | See WORKFLOW_INDEX.md |

---

## External Integrations

${formatExternalIntegrations(analysis)}

---

## Data Flow

\`\`\`
Request → Router → Controller → Service → Repository → Database
                                    ↓
                              External APIs
\`\`\`

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Source Files | ${analysis.sourceFiles || 'TBD'} |
| Lines of Code | ${analysis.linesOfCode?.total || 'TBD'} |
| Dependencies | ${analysis.dependencies?.length || 0} |
| Entry Points | ${analysis.entryPoints?.length || 0} |
| Workflows | ${analysis.workflows?.length || 0} |

---

*Auto-generated by create-claude-context. Enhance with AI analysis for complete details.*
`;
}

/**
 * Generate WORKFLOW_INDEX.md content
 * @param {object} analysis - Analysis results
 * @param {object} config - Configuration
 * @returns {string}
 */
function generateWorkflowIndex(analysis, config) {
  const projectName = config.projectName || 'Project';
  const date = new Date().toISOString().split('T')[0];
  const workflows = analysis.workflows || [];

  return `# Workflow Index - ${projectName}

**Purpose:** Master catalog of all documented workflows
**Load:** At session start for navigation
**Size:** ~15k tokens (7.5% of 200k budget)
**Last Updated:** ${date}

---

## Quick Navigation

| Workflow | Category | Complexity | Files | Link |
|----------|----------|------------|-------|------|
${workflows.map(wf =>
    `| ${wf.name} | ${wf.category} | ${wf.complexity} | ${wf.fileCount || wf.files?.length || 0} | [Details](./workflows/${slugify(wf.name)}.md) |`
  ).join('\n') || '| *No workflows discovered* | - | - | - | - |'}

---

## Workflows by Category

${formatWorkflowsByCategory(workflows)}

---

## Entry Points Summary

| Entry Point | Workflow | Method |
|-------------|----------|--------|
${formatEntryPointsTable(analysis.entryPoints)}

---

## Cross-Reference: Files → Workflows

See [CODE_TO_WORKFLOW_MAP.md](./CODE_TO_WORKFLOW_MAP.md) for reverse lookup.

---

## Maintenance

- **Verification Frequency:** Weekly spot-checks, quarterly full review
- **Last Verified:** ${date}
- **Next Review:** TBD

---

*Auto-generated by create-claude-context. Run AI analysis for complete workflow documentation.*
`;
}

/**
 * Generate CODE_TO_WORKFLOW_MAP.md content
 * @param {object} analysis - Analysis results
 * @param {object} config - Configuration
 * @returns {string}
 */
function generateCodeToWorkflowMap(analysis, config) {
  const projectName = config.projectName || 'Project';
  const date = new Date().toISOString().split('T')[0];

  // Build file to workflow mapping
  const fileMap = buildFileToWorkflowMap(analysis);

  return `# Code to Workflow Map - ${projectName}

**Purpose:** Reverse lookup - find documentation for any file
**Load:** When investigating a specific file
**Size:** ~20k tokens (10% of 200k budget)
**Last Updated:** ${date}

---

## How to Use

When you modify a file:
1. Find it in this index
2. Check which workflows reference it
3. Update those workflow docs accordingly

---

## File Index

${formatFileIndex(fileMap)}

---

## Undocumented Files

The following files are not yet mapped to workflows:

${formatUndocumentedFiles(analysis, fileMap)}

---

## Update Checklist

After modifying code:

- [ ] Find affected file(s) in this index
- [ ] Update line numbers in referenced workflows
- [ ] Verify function signatures still match
- [ ] Run \`/verify-docs-current\` to validate

---

*Auto-generated by create-claude-context. Run \`/auto-sync --rebuild-map\` to refresh.*
`;
}

/**
 * Generate individual workflow file
 * @param {object} workflow - Workflow data
 * @param {object} analysis - Full analysis
 * @param {object} config - Configuration
 * @returns {string}
 */
function generateWorkflowFile(workflow, analysis, config) {
  const date = new Date().toISOString().split('T')[0];

  // Find entry points for this workflow
  const workflowEntryPoints = (analysis.entryPoints || []).filter(ep =>
    workflow.files?.some(f => ep.file.includes(f) || f.includes(ep.file))
  );

  return `---
name: ${slugify(workflow.name)}
category: ${workflow.category || 'general'}
complexity: ${workflow.complexity || 'MEDIUM'}
last_updated: ${date}
status: discovered
---

# ${workflow.name}

## Overview

**Purpose:** ${getWorkflowPurpose(workflow)}
**Complexity:** ${workflow.complexity || 'MEDIUM'}
**Confidence:** ${workflow.confidence || 0}%
**Files Involved:** ${workflow.fileCount || workflow.files?.length || 0}

---

## Entry Points

${workflowEntryPoints.length > 0 ? formatWorkflowEntryPoints(workflowEntryPoints) : '*Entry points to be documented during AI analysis*'}

---

## Key Files

| File | Purpose |
|------|---------|
${(workflow.files || []).slice(0, 20).map(f => `| \`${f}\` | TBD |`).join('\n') || '| *No files mapped* | - |'}

---

## Call Chain

\`\`\`
${workflow.name.toLowerCase().replace(/\s+/g, '_')}()
├─ [To be traced during AI analysis]
└─ [To be traced during AI analysis]
\`\`\`

---

## Database Operations

*Database operations to be documented during AI analysis*

---

## External Dependencies

*External dependencies to be documented during AI analysis*

---

## Test Coverage

| Test File | Type | Coverage |
|-----------|------|----------|
| *TBD* | - | - |

---

## Known Gotchas

*No gotchas documented yet. Add as discovered.*

---

## Maintenance

- **Last Verified:** ${date}
- **Verification Method:** Auto-discovered
- **Next Review:** TBD

---

*Auto-generated by create-claude-context. Enhance with AI analysis for complete documentation.*
`;
}

/**
 * Update category indexes
 * @param {string} claudeDir - .claude directory path
 * @param {object} analysis - Analysis results
 * @param {object} config - Configuration
 */
async function updateCategoryIndexes(claudeDir, analysis, config) {
  const indexPath = path.join(claudeDir, 'indexes', 'workflows', 'CATEGORY_INDEX.md');
  ensureDir(path.dirname(indexPath));

  const workflows = analysis.workflows || [];
  const categories = [...new Set(workflows.map(w => w.category))];
  const date = new Date().toISOString().split('T')[0];

  const content = `# Workflow Category Index

**Purpose:** Quick navigation to workflow categories
**Load:** At session start
**Last Updated:** ${date}

---

## Categories

${categories.map(cat => {
    const catWorkflows = workflows.filter(w => w.category === cat);
    return `### ${cat.charAt(0).toUpperCase() + cat.slice(1)}

| Workflow | Complexity | Link |
|----------|------------|------|
${catWorkflows.map(w => `| ${w.name} | ${w.complexity} | [Details](../../context/workflows/${slugify(w.name)}.md) |`).join('\n')}
`;
  }).join('\n') || '*No workflows discovered yet*'}

---

## Summary

| Category | Count |
|----------|-------|
${categories.map(cat => `| ${cat} | ${workflows.filter(w => w.category === cat).length} |`).join('\n') || '| - | 0 |'}

---

*Auto-generated by create-claude-context*
`;

  fs.writeFileSync(indexPath, content);
}

// Helper functions

function getInstallCommand(techStack) {
  const languages = techStack?.languages || [];
  if (languages.includes('python')) return 'pip install -r requirements.txt';
  if (languages.includes('go')) return 'go mod download';
  if (languages.includes('rust')) return 'cargo build';
  if (languages.includes('ruby')) return 'bundle install';
  return 'npm install';
}

function getDevCommand(techStack) {
  const languages = techStack?.languages || [];
  if (languages.includes('python')) return 'python main.py';
  if (languages.includes('go')) return 'go run .';
  if (languages.includes('rust')) return 'cargo run';
  if (languages.includes('ruby')) return 'rails server';
  return 'npm run dev';
}

function getTestCommand(techStack) {
  const languages = techStack?.languages || [];
  if (languages.includes('python')) return 'pytest';
  if (languages.includes('go')) return 'go test ./...';
  if (languages.includes('rust')) return 'cargo test';
  if (languages.includes('ruby')) return 'rspec';
  return 'npm test';
}

function getMigrationCreateCommand(techStack) {
  const languages = techStack?.languages || [];
  if (languages.includes('python')) return 'alembic revision --autogenerate -m "description"';
  if (languages.includes('ruby')) return 'rails generate migration MigrationName';
  return 'npm run migration:create';
}

function getMigrationRunCommand(techStack) {
  const languages = techStack?.languages || [];
  if (languages.includes('python')) return 'alembic upgrade head';
  if (languages.includes('ruby')) return 'rails db:migrate';
  return 'npm run migration:run';
}

function detectDeploymentPlatform(projectRoot) {
  if (fs.existsSync(path.join(projectRoot, 'vercel.json'))) return 'Vercel';
  if (fs.existsSync(path.join(projectRoot, 'netlify.toml'))) return 'Netlify';
  if (fs.existsSync(path.join(projectRoot, 'Dockerfile'))) return 'Docker';
  if (fs.existsSync(path.join(projectRoot, 'fly.toml'))) return 'Fly.io';
  if (fs.existsSync(path.join(projectRoot, 'render.yaml'))) return 'Render';
  if (fs.existsSync(path.join(projectRoot, 'railway.json'))) return 'Railway';
  return 'TBD';
}

function findModelsPath(analysis) {
  const layers = analysis.architecture?.layers || [];
  const domainLayer = layers.find(l => l.name === 'domain');
  if (domainLayer?.directories?.length > 0) {
    return domainLayer.directories[0] + '/';
  }
  return 'models/';
}

function findMigrationsPath(analysis) {
  return 'migrations/';
}

function formatCoreFiles(analysis) {
  const entryPoints = analysis.entryPoints || [];
  const uniqueFiles = [...new Set(entryPoints.map(ep => ep.file))].slice(0, 5);
  return uniqueFiles.map(f => `- \`${f}\``).join('\n') || '- TBD';
}

function generateAsciiArchitecture(analysis) {
  const layers = analysis.architecture?.layers || [];

  if (layers.length === 0) {
    return `┌─────────────────────────────────────┐
│           [Application]             │
│                                     │
│   ┌───────────┐   ┌───────────┐    │
│   │   API     │   │  Services │    │
│   └───────────┘   └───────────┘    │
│                                     │
│   ┌───────────┐   ┌───────────┐    │
│   │  Models   │   │ Database  │    │
│   └───────────┘   └───────────┘    │
└─────────────────────────────────────┘`;
  }

  let diagram = '┌─────────────────────────────────────┐\n';
  for (const layer of layers.slice(0, 4)) {
    diagram += `│   [${layer.name.padEnd(30)}]   │\n`;
    diagram += `│   ${layer.directories?.slice(0, 2).join(', ').padEnd(32)}│\n`;
  }
  diagram += '└─────────────────────────────────────┘';

  return diagram;
}

function formatTechStackTable(analysis) {
  const techStack = analysis.techStack || {};
  const rows = [];

  if (techStack.languages?.length > 0) {
    rows.push(`| **Languages** | ${techStack.languages.join(', ')} | Core development |`);
  }
  if (techStack.frameworks?.length > 0) {
    rows.push(`| **Frameworks** | ${techStack.frameworks.join(', ')} | Application framework |`);
  }
  if (techStack.databases?.length > 0) {
    rows.push(`| **Databases** | ${techStack.databases.join(', ')} | Data persistence |`);
  }

  return rows.join('\n') || '| *TBD* | - | - |';
}

function formatComponents(analysis) {
  const layers = analysis.architecture?.layers || [];
  return layers.map(layer => `
### ${layer.name.charAt(0).toUpperCase() + layer.name.slice(1)}

**Purpose:** ${layer.purpose || 'TBD'}
**Directories:** ${layer.directories?.join(', ') || 'TBD'}
`).join('\n') || '*Components will be documented during AI analysis*';
}

function getTopEntryPointFiles(analysis) {
  const entryPoints = analysis.entryPoints || [];
  const files = [...new Set(entryPoints.map(ep => ep.file))].slice(0, 3);
  return files.join(', ') || 'TBD';
}

function formatExternalIntegrations(analysis) {
  const deps = analysis.dependencies || [];
  const integrations = deps.filter(d =>
    ['stripe', 'aws', 'firebase', 'twilio', 'sendgrid', 'redis', 'elasticsearch'].some(
      int => d.name.toLowerCase().includes(int)
    )
  );

  if (integrations.length === 0) {
    return '*No external integrations detected. Document manually if present.*';
  }

  return integrations.map(i => `- **${i.name}** (${i.version})`).join('\n');
}

function formatWorkflowsByCategory(workflows) {
  const categories = [...new Set(workflows.map(w => w.category))];

  return categories.map(cat => {
    const catWorkflows = workflows.filter(w => w.category === cat);
    return `### ${cat.charAt(0).toUpperCase() + cat.slice(1)}

${catWorkflows.map(w => `- [${w.name}](./workflows/${slugify(w.name)}.md) - ${w.complexity}`).join('\n')}
`;
  }).join('\n') || '*No workflows by category*';
}

function formatEntryPointsTable(entryPoints) {
  if (!entryPoints || entryPoints.length === 0) {
    return '| *TBD* | - | - |';
  }

  return entryPoints.slice(0, 20).map(ep =>
    `| \`${ep.file}:${ep.line}\` | ${ep.route || 'TBD'} | ${ep.method || '-'} |`
  ).join('\n');
}

function buildFileToWorkflowMap(analysis) {
  const map = {};
  const workflows = analysis.workflows || [];

  for (const workflow of workflows) {
    for (const file of (workflow.files || [])) {
      if (!map[file]) map[file] = [];
      map[file].push(workflow.name);
    }
  }

  return map;
}

function formatFileIndex(fileMap) {
  const entries = Object.entries(fileMap);

  if (entries.length === 0) {
    return '*No files mapped to workflows yet. Run AI analysis to populate.*';
  }

  // Group by directory
  const byDir = {};
  for (const [file, workflows] of entries) {
    const dir = path.dirname(file) || '.';
    if (!byDir[dir]) byDir[dir] = [];
    byDir[dir].push({ file, workflows });
  }

  return Object.entries(byDir).map(([dir, files]) => `
### ${dir}/

| File | Workflows |
|------|-----------|
${files.map(f => `| \`${path.basename(f.file)}\` | ${f.workflows.join(', ')} |`).join('\n')}
`).join('\n');
}

function formatUndocumentedFiles(analysis, fileMap) {
  const mappedFiles = new Set(Object.keys(fileMap));
  const allEntryFiles = (analysis.entryPoints || []).map(ep => ep.file);
  const unmapped = allEntryFiles.filter(f => !mappedFiles.has(f));

  if (unmapped.length === 0) {
    return '*All entry point files are mapped to workflows.*';
  }

  return unmapped.slice(0, 20).map(f => `- \`${f}\``).join('\n');
}

function getWorkflowPurpose(workflow) {
  const purposes = {
    authentication: 'Handles user authentication and session management',
    userManagement: 'Manages user accounts, profiles, and preferences',
    payments: 'Processes payments, billing, and subscriptions',
    dataProcessing: 'Handles background jobs and data pipelines',
    apiEndpoints: 'Exposes API endpoints for external consumption',
    database: 'Manages database operations and queries',
    notifications: 'Sends notifications via email, SMS, or push',
    fileHandling: 'Handles file uploads, storage, and downloads',
    search: 'Provides search functionality across the application',
    analytics: 'Tracks metrics and generates analytics',
    testing: 'Contains test suites and fixtures',
    configuration: 'Manages application configuration'
  };

  return purposes[workflow.type] || `Handles ${workflow.name.toLowerCase()} functionality`;
}

function formatWorkflowEntryPoints(entryPoints) {
  return entryPoints.slice(0, 10).map(ep => `
### \`${ep.file}:${ep.line}\`

**Route:** ${ep.route || 'N/A'}
**Method:** ${ep.method || 'N/A'}

\`\`\`
${ep.context || 'No context available'}
\`\`\`
`).join('\n');
}

module.exports = {
  populateAllTemplates,
  populateClaudeMd,
  generateArchitectureSnapshot,
  generateWorkflowIndex,
  generateCodeToWorkflowMap,
  generateWorkflowFile,
  updateCategoryIndexes,
  slugify
};
