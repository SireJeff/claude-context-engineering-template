/**
 * Claude Context Engineering - Error Classes
 *
 * Structured error handling for the context engineering system.
 * All errors are categorized and include recovery information.
 */

/**
 * Base error class for all Claude Context errors
 */
class ClaudeContextError extends Error {
  constructor(message, code, recoverable = true, details = {}) {
    super(message);
    this.name = 'ClaudeContextError';
    this.code = code;
    this.recoverable = recoverable;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      recoverable: this.recoverable,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Configuration-related errors
 */
class ConfigurationError extends ClaudeContextError {
  constructor(message, details = {}) {
    super(message, ConfigurationError.codes[details.type] || 'E001', true, details);
    this.name = 'ConfigurationError';
  }

  static codes = {
    MISSING: 'E001',
    INVALID: 'E002',
    SCHEMA_VIOLATION: 'E003',
    MERGE_CONFLICT: 'E004',
  };
}

/**
 * Validation-related errors
 */
class ValidationError extends ClaudeContextError {
  constructor(message, details = {}) {
    super(message, ValidationError.codes[details.type] || 'E010', true, details);
    this.name = 'ValidationError';
  }

  static codes = {
    SCHEMA: 'E010',
    LINK_BROKEN: 'E011',
    PLACEHOLDER_REMAINING: 'E012',
    LINE_NUMBER_STALE: 'E013',
    STRUCTURE: 'E014',
  };
}

/**
 * File system-related errors
 */
class FileSystemError extends ClaudeContextError {
  constructor(message, details = {}) {
    super(message, FileSystemError.codes[details.type] || 'E020', true, details);
    this.name = 'FileSystemError';
  }

  static codes = {
    NOT_FOUND: 'E020',
    PERMISSION_DENIED: 'E021',
    READ_ERROR: 'E022',
    WRITE_ERROR: 'E023',
    DIRECTORY_ERROR: 'E024',
  };
}

/**
 * Initialization-related errors
 */
class InitializationError extends ClaudeContextError {
  constructor(message, details = {}) {
    super(message, InitializationError.codes[details.type] || 'E030', true, details);
    this.name = 'InitializationError';
  }

  static codes = {
    INCOMPLETE: 'E030',
    TECH_STACK_UNKNOWN: 'E031',
    WORKFLOW_DISCOVERY_FAILED: 'E032',
    PLACEHOLDER_REPLACEMENT_FAILED: 'E033',
    ALREADY_INITIALIZED: 'E034',
  };
}

/**
 * Agent/Command execution errors
 */
class ExecutionError extends ClaudeContextError {
  constructor(message, details = {}) {
    super(message, ExecutionError.codes[details.type] || 'E040', details.recoverable ?? true, details);
    this.name = 'ExecutionError';
  }

  static codes = {
    AGENT_NOT_FOUND: 'E040',
    COMMAND_NOT_FOUND: 'E041',
    TIMEOUT: 'E042',
    CONTEXT_EXCEEDED: 'E043',
    DEPENDENCY_MISSING: 'E044',
  };
}

/**
 * Error code reference table
 */
const ERROR_CODES = {
  // Configuration (E001-E009)
  E001: { name: 'CONFIG_MISSING', description: 'Configuration file not found' },
  E002: { name: 'CONFIG_INVALID', description: 'Configuration file is invalid JSON' },
  E003: { name: 'SCHEMA_VIOLATION', description: 'Configuration does not match schema' },
  E004: { name: 'MERGE_CONFLICT', description: 'Configuration merge conflict' },

  // Validation (E010-E019)
  E010: { name: 'SCHEMA_ERROR', description: 'JSON schema validation failed' },
  E011: { name: 'LINK_BROKEN', description: 'Markdown link does not resolve' },
  E012: { name: 'PLACEHOLDER_REMAINING', description: 'Unresolved {{PLACEHOLDER}} found' },
  E013: { name: 'LINE_NUMBER_STALE', description: 'Line number reference is outdated' },
  E014: { name: 'STRUCTURE_ERROR', description: 'Required file or directory missing' },

  // File System (E020-E029)
  E020: { name: 'FILE_NOT_FOUND', description: 'File does not exist' },
  E021: { name: 'PERMISSION_DENIED', description: 'Insufficient permissions' },
  E022: { name: 'READ_ERROR', description: 'Failed to read file' },
  E023: { name: 'WRITE_ERROR', description: 'Failed to write file' },
  E024: { name: 'DIRECTORY_ERROR', description: 'Directory operation failed' },

  // Initialization (E030-E039)
  E030: { name: 'INIT_INCOMPLETE', description: 'Initialization did not complete' },
  E031: { name: 'TECH_STACK_UNKNOWN', description: 'Could not detect technology stack' },
  E032: { name: 'WORKFLOW_DISCOVERY_FAILED', description: 'Failed to discover workflows' },
  E033: { name: 'PLACEHOLDER_REPLACEMENT_FAILED', description: 'Failed to replace placeholders' },
  E034: { name: 'ALREADY_INITIALIZED', description: 'System already initialized' },

  // Execution (E040-E049)
  E040: { name: 'AGENT_NOT_FOUND', description: 'Agent not found' },
  E041: { name: 'COMMAND_NOT_FOUND', description: 'Command not found' },
  E042: { name: 'TIMEOUT', description: 'Operation timed out' },
  E043: { name: 'CONTEXT_EXCEEDED', description: 'Context budget exceeded' },
  E044: { name: 'DEPENDENCY_MISSING', description: 'Required dependency not available' },
};

/**
 * Get error details by code
 */
function getErrorInfo(code) {
  return ERROR_CODES[code] || { name: 'UNKNOWN', description: 'Unknown error' };
}

/**
 * Format error for display
 */
function formatError(error) {
  if (error instanceof ClaudeContextError) {
    const info = getErrorInfo(error.code);
    return `[${error.code}] ${error.name}: ${error.message}\n` +
           `  Type: ${info.name}\n` +
           `  Recoverable: ${error.recoverable ? 'Yes' : 'No'}\n` +
           (Object.keys(error.details).length > 0
             ? `  Details: ${JSON.stringify(error.details, null, 2)}\n`
             : '');
  }
  return error.toString();
}

module.exports = {
  ClaudeContextError,
  ConfigurationError,
  ValidationError,
  FileSystemError,
  InitializationError,
  ExecutionError,
  ERROR_CODES,
  getErrorInfo,
  formatError,
};
