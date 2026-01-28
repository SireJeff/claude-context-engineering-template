/**
 * AI Context Engineering - Template Renderer
 *
 * Handlebars-based template rendering engine for generating
 * context files for multiple AI tools.
 */

const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

/**
 * Templates directory
 */
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'handlebars');

/**
 * Multi-file markers for Antigravity templates
 */
const FILE_START_MARKER = /\{\{\{fileStart\s+"([^"]+)"\}\}\}/g;
const FILE_END_MARKER = /\{\{\{fileEnd\}\}\}/g;

/**
 * Register custom Handlebars helpers
 */
function registerHelpers() {
  // Join array with delimiter
  Handlebars.registerHelper('join', function(array, delimiter) {
    if (!Array.isArray(array)) return '';
    return array.join(delimiter || ', ');
  });

  // Get first N items from array
  Handlebars.registerHelper('first', function(array, n) {
    if (!Array.isArray(array)) return [];
    return array.slice(0, n);
  });

  // Get length of array
  Handlebars.registerHelper('length', function(array) {
    if (!Array.isArray(array)) return 0;
    return array.length;
  });

  // Truncate string to max length
  Handlebars.registerHelper('truncate', function(str, maxLength) {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  });

  // Slugify string for filenames
  Handlebars.registerHelper('slugify', function(str) {
    if (typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  });

  // Concat strings
  Handlebars.registerHelper('concat', function(...args) {
    // Remove the Handlebars options object from args
    args.pop();
    return args.join('');
  });

  // Uppercase string
  Handlebars.registerHelper('uppercase', function(str) {
    if (typeof str !== 'string') return '';
    return str.toUpperCase();
  });

  // Lowercase string
  Handlebars.registerHelper('lowercase', function(str) {
    if (typeof str !== 'string') return '';
    return str.toLowerCase();
  });

  // Check if equal
  Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  });

  // Check if not equal
  Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
    return (arg1 !== arg2) ? options.fn(this) : options.inverse(this);
  });

  // Date formatting
  Handlebars.registerHelper('formatDate', function(date) {
    if (!date) return new Date().toISOString();
    return new Date(date).toISOString();
  });

  // File markers for multi-file templates (Antigravity)
  Handlebars.registerHelper('fileStart', function(filename) {
    return new Handlebars.SafeString(`<<<FILE_START:${filename}>>>`);
  });

  Handlebars.registerHelper('fileEnd', function() {
    return new Handlebars.SafeString('<<<FILE_END>>>');
  });
}

/**
 * Register partials from the partials directory
 * @param {string} partialsDir - Path to partials directory
 */
function registerPartials(partialsDir) {
  const defaultPartialsDir = partialsDir || path.join(TEMPLATES_DIR, 'partials');

  if (!fs.existsSync(defaultPartialsDir)) {
    return;
  }

  const files = fs.readdirSync(defaultPartialsDir)
    .filter(f => f.endsWith('.hbs'));

  for (const file of files) {
    const name = path.basename(file, '.hbs');
    const content = fs.readFileSync(path.join(defaultPartialsDir, file), 'utf-8');
    Handlebars.registerPartial(name, content);
  }
}

/**
 * Initialize the template engine
 */
function initialize() {
  registerHelpers();
  registerPartials();
}

/**
 * Compile and render a template
 * @param {string} templatePath - Path to the template file
 * @param {object} context - Context data for rendering
 * @returns {string} Rendered content
 */
function renderTemplate(templatePath, context) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const source = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(source, { noEscape: false });
  return template(context);
}

/**
 * Render a template by name (looks in templates/handlebars/)
 * @param {string} templateName - Template name (without .hbs extension)
 * @param {object} context - Context data for rendering
 * @returns {string} Rendered content
 */
function renderTemplateByName(templateName, context) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
  return renderTemplate(templatePath, context);
}

/**
 * Parse multi-file output from rendered template (for Antigravity)
 * @param {string} rendered - Rendered template content with file markers
 * @returns {object[]} Array of { filename, content } objects
 */
function parseMultiFileOutput(rendered) {
  const files = [];
  const parts = rendered.split('<<<FILE_START:');

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const endMarkerIndex = part.indexOf('>>>');

    if (endMarkerIndex === -1) continue;

    const filename = part.substring(0, endMarkerIndex);
    const rest = part.substring(endMarkerIndex + 3);

    const fileEndIndex = rest.indexOf('<<<FILE_END>>>');
    const content = fileEndIndex !== -1
      ? rest.substring(0, fileEndIndex).trim()
      : rest.trim();

    files.push({ filename, content });
  }

  return files;
}

/**
 * Render a multi-file template (for Antigravity)
 * @param {string} templatePath - Path to the template file
 * @param {object} context - Context data for rendering
 * @returns {object[]} Array of { filename, content } objects
 */
function renderMultiFileTemplate(templatePath, context) {
  const rendered = renderTemplate(templatePath, context);
  return parseMultiFileOutput(rendered);
}

/**
 * Get available template names
 * @returns {string[]} Array of template names
 */
function getAvailableTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }

  return fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith('.hbs') && !fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory())
    .map(f => path.basename(f, '.hbs'));
}

/**
 * Build default context from analysis results
 * @param {object} analysis - Analysis results from static analyzer
 * @param {object} config - Configuration from CLI
 * @returns {object} Context object for templates
 */
function buildContext(analysis, config) {
  const projectName = config.projectName || 'project';
  const techStack = analysis.techStack || config.techStack || {};

  return {
    // Project identity
    project: {
      name: projectName,
      description: config.description || `${projectName} application`,
      tech_stack: techStack.languages || [],
      primary_language: techStack.languages?.[0] || 'unknown'
    },

    // Architecture (from analysis)
    architecture: {
      pattern: analysis.architecture?.pattern || 'layered',
      layers: (analysis.architecture?.layers || []).map(l => ({
        name: l.name,
        path: l.directories?.[0] || l.name + '/',
        purpose: l.purpose || l.name
      }))
    },

    // Workflows (from analysis)
    workflows: (analysis.workflows || []).map(wf => ({
      name: wf.name,
      category: wf.category || 'general',
      complexity: wf.complexity || 'MEDIUM',
      description: wf.description || `Handles ${wf.name} functionality`,
      files: wf.files || [],
      entry_points: (wf.entryPoints || []).map(ep => ({
        endpoint: ep.route || ep.name || 'unknown',
        file: ep.file,
        line: ep.line,
        method: ep.method || 'GET',
        purpose: ep.purpose || 'Entry point'
      }))
    })),

    // Gotchas (empty by default, filled by AI or manual)
    gotchas: [],

    // Key files (from analysis)
    key_files: {
      entry_points: (analysis.entryPoints || []).map(ep => ep.file),
      api_routes: [],
      config: [],
      models: []
    },

    // Commands (from tech stack)
    commands: {
      install: techStack.commands?.install || 'npm install',
      dev: techStack.commands?.dev || 'npm run dev',
      test: techStack.commands?.test || 'npm test',
      build: techStack.commands?.build || 'npm run build'
    },

    // Environment
    environment: {
      required: [],
      optional: []
    },

    // Critical constraints
    critical_constraints: [],

    // Metadata
    metadata: {
      header: '<!-- Auto-generated by AI Context Engineering. Do not edit manually. -->',
      timestamp: new Date().toISOString(),
      generator_version: getPackageVersion(),
      source_ref: projectName
    },

    // Registry (for federation compatibility)
    registry: {
      name: projectName,
      submodule: projectName,
      description: config.description || `${projectName} application`,
      tech_stack: techStack.languages || [],
      primary_language: techStack.languages?.[0] || 'unknown',
      architecture: {
        pattern: analysis.architecture?.pattern || 'layered',
        layers: (analysis.architecture?.layers || []).map(l => l.name || l),
        dependencies: {}
      },
      key_files: {
        entry_points: (analysis.entryPoints || []).map(ep => ep.file),
        api_routes: [],
        core: [],
        config: []
      },
      commands: {
        install: techStack.commands?.install || 'npm install',
        run: techStack.commands?.dev || 'npm run dev',
        test: techStack.commands?.test || 'npm test',
        build: techStack.commands?.build || 'npm run build'
      },
      environment: {
        required: [],
        optional: []
      },
      critical_constraints: [],
      integrations: {
        external: {},
        internal: {}
      }
    },

    // Submodule (for federation compatibility)
    submodule: {
      ports: {
        default: 3000
      }
    },

    // Cross-repo references (for federation)
    cross_repos: [],

    // Active task (for task dispatch)
    active_task: null,

    // Federation info
    federation: {
      is_federated: false,
      subproject: null,
      cross_repos: []
    }
  };
}

/**
 * Get package version
 * @returns {string} Package version
 */
function getPackageVersion() {
  try {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.version || '2.0.0';
  } catch {
    return '2.0.0';
  }
}

// Initialize on module load
initialize();

module.exports = {
  renderTemplate,
  renderTemplateByName,
  renderMultiFileTemplate,
  parseMultiFileOutput,
  buildContext,
  registerPartials,
  registerHelpers,
  initialize,
  getAvailableTemplates,
  TEMPLATES_DIR
};
