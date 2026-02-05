/**
 * Claude Context Engineering - Logger
 *
 * Structured logging with levels, file output, and operation tracking.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLORS = {
  debug: chalk.gray,
  info: chalk.blue,
  warn: chalk.yellow,
  error: chalk.red,
};

const LEVEL_ICONS = {
  debug: '🔍',
  info: 'ℹ️ ',
  warn: '⚠️ ',
  error: '❌',
};

/**
 * Create a logger instance
 */
function createLogger(options = {}) {
  const config = {
    level: options.level || 'info',
    file: options.file || null,
    maxSizeMb: options.maxSizeMb || 10,
    console: options.console !== false,
    timestamps: options.timestamps !== false,
    colors: options.colors !== false,
  };

  // Ensure log directory exists if file logging enabled
  if (config.file) {
    const logDir = path.dirname(config.file);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Check if we should log at this level
   */
  function shouldLog(level) {
    return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
  }

  /**
   * Format a log message
   */
  function formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const parts = [];

    if (config.timestamps) {
      parts.push(`[${timestamp}]`);
    }
    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);

    if (Object.keys(meta).length > 0) {
      parts.push(JSON.stringify(meta));
    }

    return parts.join(' ');
  }

  /**
   * Write to console with colors
   */
  function writeConsole(level, message, meta) {
    if (!config.console) return;

    const colorFn = config.colors ? LEVEL_COLORS[level] : (s) => s;
    const icon = LEVEL_ICONS[level];
    const timestamp = config.timestamps
      ? chalk.gray(`[${new Date().toISOString()}] `)
      : '';

    let output = `${timestamp}${icon} ${colorFn(message)}`;

    if (Object.keys(meta).length > 0) {
      output += '\n' + chalk.gray(JSON.stringify(meta, null, 2));
    }

    if (level === 'error') {
      console.error(output);
    } else {
      console.log(output);
    }
  }

  /**
   * Write to file
   */
  function writeFile(level, message, meta) {
    if (!config.file) return;

    try {
      const formatted = formatMessage(level, message, meta) + '\n';
      fs.appendFileSync(config.file, formatted);

      // Check file size and rotate if needed
      const stats = fs.statSync(config.file);
      const sizeMb = stats.size / (1024 * 1024);
      if (sizeMb > config.maxSizeMb) {
        rotateLog();
      }
    } catch (error) {
      // Silently fail file logging
    }
  }

  /**
   * Rotate log file
   */
  function rotateLog() {
    if (!config.file || !fs.existsSync(config.file)) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedPath = config.file.replace('.log', `-${timestamp}.log`);

    try {
      fs.renameSync(config.file, rotatedPath);
    } catch (error) {
      // Silently fail rotation
    }
  }

  /**
   * Core log function
   */
  function log(level, message, meta = {}) {
    if (!shouldLog(level)) return;

    writeConsole(level, message, meta);
    writeFile(level, message, meta);
  }

  /**
   * Start an operation and return tracking object
   */
  function startOperation(name) {
    const operationId = generateId();
    const startTime = Date.now();

    log('info', `Operation started: ${name}`, { operation_id: operationId });

    return {
      id: operationId,

      /**
       * Log progress
       */
      progress: (message, meta = {}) => {
        log('debug', `[${name}] ${message}`, { operation_id: operationId, ...meta });
      },

      /**
       * Mark operation as successful
       */
      success: (message = 'completed', meta = {}) => {
        const duration = Date.now() - startTime;
        log('info', `Operation completed: ${name} - ${message}`, {
          operation_id: operationId,
          duration_ms: duration,
          ...meta,
        });
        return { success: true, duration };
      },

      /**
       * Mark operation as failed
       */
      fail: (error, meta = {}) => {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : error;
        log('error', `Operation failed: ${name} - ${errorMessage}`, {
          operation_id: operationId,
          duration_ms: duration,
          error: error instanceof Error ? { name: error.name, stack: error.stack } : error,
          ...meta,
        });
        return { success: false, duration, error };
      },
    };
  }

  /**
   * Generate a short unique ID
   */
  function generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  // Return logger interface
  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
    startOperation,
    setLevel: (level) => { config.level = level; },
    getLevel: () => config.level,
  };
}

// Default logger instance
const logger = createLogger({
  level: process.env.CLAUDE_LOG_LEVEL || 'info',
  file: process.env.CLAUDE_LOG_FILE || null,
});

module.exports = {
  createLogger,
  logger,
  LOG_LEVELS,
};
