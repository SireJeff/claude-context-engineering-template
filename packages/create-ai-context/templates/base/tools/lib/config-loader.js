/**
 * Claude Context Engineering - Configuration Loader
 *
 * Environment-aware configuration loading with support for:
 * - Base configuration
 * - Environment-specific overrides
 * - Local overrides (gitignored)
 * - Environment variable overrides
 * - Schema validation
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { ConfigurationError } = require('./errors');
const { logger } = require('./logger');

// Configuration file paths relative to .ai-context/
const CONFIG_PATHS = {
  settings: 'settings.json',
  base: 'config/base.json',
  local: 'config/local.json',
  environments: 'config/environments',
};

// Schema path
const SCHEMA_PATH = 'schemas/settings.schema.json';

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  if (!source) return target;
  if (!target) return source;

  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key]) &&
        target[key] instanceof Object && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Load a JSON file safely
 */
function loadJsonFile(filePath, options = {}) {
  const { optional = false, silent = false } = options;

  if (!fs.existsSync(filePath)) {
    if (optional) {
      return null;
    }
    throw new ConfigurationError(
      `Configuration file not found: ${filePath}`,
      { type: 'MISSING', path: filePath }
    );
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ConfigurationError(
        `Invalid JSON in configuration file: ${filePath}`,
        { type: 'INVALID', path: filePath, parseError: error.message }
      );
    }
    throw error;
  }
}

/**
 * Load environment variables with CLAUDE_ prefix
 */
function loadEnvVars(prefix = 'CLAUDE_') {
  const config = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix)) {
      // Convert CLAUDE_CONTEXT_ENGINEERING_ENABLED to context_engineering.enabled
      const configKey = key
        .substring(prefix.length)
        .toLowerCase()
        .replace(/_([a-z])/g, (_, char) => `.${char}`);

      // Try to parse as JSON, otherwise use as string
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }

      // Set nested property
      setNestedProperty(config, configKey, parsedValue);
    }
  }

  return config;
}

/**
 * Set a nested property using dot notation
 */
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Find the .claude directory
 */
function findClaudeDir(startDir = process.cwd()) {
  let dir = startDir;

  while (dir !== path.dirname(dir)) {
    const claudeDir = path.join(dir, '.claude');
    if (fs.existsSync(claudeDir) && fs.statSync(claudeDir).isDirectory()) {
      return claudeDir;
    }
    dir = path.dirname(dir);
  }

  // Default to current directory's .claude
  return path.join(startDir, '.claude');
}

/**
 * Configuration loader class
 */
class ConfigLoader {
  constructor() {
    this.claudeDir = null;
    this.schema = null;
    this.ajv = null;
    this.cache = null;
  }

  /**
   * Initialize the config loader
   */
  initialize(claudeDir = null) {
    this.claudeDir = claudeDir || findClaudeDir();
    this.cache = null;

    // Initialize AJV for schema validation
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);

    // Load schema if it exists
    const schemaPath = path.join(this.claudeDir, SCHEMA_PATH);
    if (fs.existsSync(schemaPath)) {
      try {
        this.schema = loadJsonFile(schemaPath);
      } catch (error) {
        logger.warn('Failed to load settings schema', { error: error.message });
      }
    }
  }

  /**
   * Get the configuration directory path
   */
  getConfigPath() {
    return this.claudeDir;
  }

  /**
   * Load configuration with all layers merged
   */
  async load(options = {}) {
    const {
      env = process.env.NODE_ENV || 'development',
      team = process.env.CLAUDE_TEAM,
      overrides = {},
      cache = true,
      validate = true,
    } = options;

    // Return cached config if available
    if (cache && this.cache) {
      return this.cache;
    }

    if (!this.claudeDir) {
      this.initialize();
    }

    const op = logger.startOperation('config-load');

    try {
      // 1. Load base configuration (settings.json or config/base.json)
      const settingsPath = path.join(this.claudeDir, CONFIG_PATHS.settings);
      const basePath = path.join(this.claudeDir, CONFIG_PATHS.base);

      let config = {};

      if (fs.existsSync(settingsPath)) {
        config = loadJsonFile(settingsPath);
        op.progress('Loaded settings.json');
      } else if (fs.existsSync(basePath)) {
        config = loadJsonFile(basePath);
        op.progress('Loaded config/base.json');
      } else {
        op.progress('No base config found, using defaults');
        config = this.getDefaults();
      }

      // 2. Merge environment-specific config
      const envPath = path.join(this.claudeDir, CONFIG_PATHS.environments, `${env}.json`);
      if (fs.existsSync(envPath)) {
        const envConfig = loadJsonFile(envPath, { optional: true });
        if (envConfig) {
          config = deepMerge(config, envConfig);
          op.progress(`Merged ${env} environment config`);
        }
      }

      // 3. Merge team-specific config if provided
      if (team) {
        const teamPath = path.join(this.claudeDir, 'config', 'teams', `${team}.json`);
        const teamConfig = loadJsonFile(teamPath, { optional: true });
        if (teamConfig) {
          config = deepMerge(config, teamConfig);
          op.progress(`Merged ${team} team config`);
        }
      }

      // 4. Merge local overrides (gitignored)
      const localPath = path.join(this.claudeDir, CONFIG_PATHS.local);
      const localConfig = loadJsonFile(localPath, { optional: true, silent: true });
      if (localConfig) {
        config = deepMerge(config, localConfig);
        op.progress('Merged local config');
      }

      // 5. Merge environment variables
      const envVars = loadEnvVars('CLAUDE_');
      if (Object.keys(envVars).length > 0) {
        config = deepMerge(config, envVars);
        op.progress('Merged environment variables');
      }

      // 6. Merge provided overrides
      if (Object.keys(overrides).length > 0) {
        config = deepMerge(config, overrides);
        op.progress('Merged provided overrides');
      }

      // Validate against schema if available
      if (validate && this.schema) {
        this.validateConfig(config);
        op.progress('Schema validation passed');
      }

      // Cache the result
      if (cache) {
        this.cache = config;
      }

      op.success();
      return config;

    } catch (error) {
      op.fail(error);
      throw error;
    }
  }

  /**
   * Validate configuration against schema
   */
  validateConfig(config) {
    if (!this.schema || !this.ajv) {
      return true;
    }

    const validate = this.ajv.compile(this.schema);
    const valid = validate(config);

    if (!valid) {
      const errors = validate.errors.map(e => `${e.instancePath} ${e.message}`).join('; ');
      throw new ConfigurationError(
        `Configuration validation failed: ${errors}`,
        { type: 'SCHEMA_VIOLATION', errors: validate.errors }
      );
    }

    return true;
  }

  /**
   * Get default configuration
   */
  getDefaults() {
    return {
      version: '1.0.0',
      context_engineering: {
        enabled: true,
        max_context_tokens: 200000,
        max_output_tokens: 30000,
        target_utilization: 0.40,
        compact_trigger: 0.35,
      },
      rpi_workflow: {
        enabled: true,
        phases: ['research', 'plan', 'implement'],
        require_human_approval: true,
        auto_doc_update: true,
      },
      documentation: {
        self_maintaining: true,
        verify_after_changes: true,
        line_number_tolerance: 10,
      },
      agents: {
        default: 'context-engineer',
        auto_select: true,
      },
      commands: {
        rpi_commands: ['/rpi-research', '/rpi-plan', '/rpi-implement'],
        validation_commands: ['/verify-docs-current', '/validate-all'],
      },
    };
  }

  /**
   * Clear the configuration cache
   */
  clearCache() {
    this.cache = null;
  }
}

// Singleton instance
const configLoader = new ConfigLoader();

module.exports = {
  ConfigLoader,
  configLoader,
  deepMerge,
  loadJsonFile,
  findClaudeDir,
};
