/**
 * AI Context Engineering - Migration Script
 *
 * Migrates v1.x installations (.claude/, CLAUDE.md) to v2.0 format
 * (.ai-context/, AI_CONTEXT.md).
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Old and new directory/file names
 */
const MIGRATIONS = {
  directory: {
    old: '.claude',
    new: '.ai-context'
  },
  entryFile: {
    old: 'CLAUDE.md',
    new: 'AI_CONTEXT.md'
  }
};

/**
 * Patterns to update in file contents
 */
const CONTENT_REPLACEMENTS = [
  { pattern: /\.claude\//g, replacement: '.ai-context/' },
  { pattern: /\.claude\\/g, replacement: '.ai-context\\' },
  { pattern: /CLAUDE\.md/g, replacement: 'AI_CONTEXT.md' },
  { pattern: /create-claude-context/g, replacement: 'create-ai-context' },
  { pattern: /claude-context/g, replacement: 'ai-context' }
];

/**
 * Check if a project has v1.x installation
 * @param {string} projectRoot - Project root directory
 * @returns {object} Detection result
 */
function detectV1Installation(projectRoot) {
  const result = {
    hasV1: false,
    hasV2: false,
    oldDir: null,
    oldFile: null,
    newDir: null,
    newFile: null
  };

  const oldDirPath = path.join(projectRoot, MIGRATIONS.directory.old);
  const oldFilePath = path.join(projectRoot, MIGRATIONS.entryFile.old);
  const newDirPath = path.join(projectRoot, MIGRATIONS.directory.new);
  const newFilePath = path.join(projectRoot, MIGRATIONS.entryFile.new);

  if (fs.existsSync(oldDirPath)) {
    result.hasV1 = true;
    result.oldDir = oldDirPath;
  }

  if (fs.existsSync(oldFilePath)) {
    result.hasV1 = true;
    result.oldFile = oldFilePath;
  }

  if (fs.existsSync(newDirPath)) {
    result.hasV2 = true;
    result.newDir = newDirPath;
  }

  if (fs.existsSync(newFilePath)) {
    result.hasV2 = true;
    result.newFile = newFilePath;
  }

  return result;
}

/**
 * Migrate a v1.x installation to v2.0
 * @param {string} projectRoot - Project root directory
 * @param {object} options - Migration options
 * @returns {object} Migration result
 */
async function migrateV1ToV2(projectRoot, options = {}) {
  const {
    dryRun = false,
    force = false,
    updateReferences = true,
    backup = false
  } = options;

  const result = {
    success: false,
    changes: [],
    warnings: [],
    errors: []
  };

  // Detect current state
  const detection = detectV1Installation(projectRoot);

  if (!detection.hasV1) {
    result.warnings.push('No v1.x installation found (.claude/ or CLAUDE.md)');
    result.success = true;
    return result;
  }

  if (detection.hasV2 && !force) {
    result.errors.push('v2.0 installation already exists. Use --force to overwrite.');
    return result;
  }

  // 1. Rename .claude/ → .ai-context/
  if (detection.oldDir) {
    const newDirPath = path.join(projectRoot, MIGRATIONS.directory.new);

    if (dryRun) {
      result.changes.push({
        type: 'rename',
        action: 'would rename',
        from: MIGRATIONS.directory.old + '/',
        to: MIGRATIONS.directory.new + '/'
      });
    } else {
      try {
        // Backup if requested
        if (backup && fs.existsSync(newDirPath)) {
          const backupPath = newDirPath + '.backup-' + Date.now();
          fs.renameSync(newDirPath, backupPath);
          result.changes.push({
            type: 'backup',
            action: 'backed up',
            from: MIGRATIONS.directory.new + '/',
            to: path.basename(backupPath) + '/'
          });
        }

        // Remove existing v2 dir if force
        if (force && fs.existsSync(newDirPath)) {
          fs.rmSync(newDirPath, { recursive: true });
        }

        fs.renameSync(detection.oldDir, newDirPath);
        result.changes.push({
          type: 'rename',
          action: 'renamed',
          from: MIGRATIONS.directory.old + '/',
          to: MIGRATIONS.directory.new + '/'
        });
      } catch (error) {
        result.errors.push(`Failed to rename directory: ${error.message}`);
      }
    }
  }

  // 2. Rename CLAUDE.md → AI_CONTEXT.md
  if (detection.oldFile) {
    const newFilePath = path.join(projectRoot, MIGRATIONS.entryFile.new);

    if (dryRun) {
      result.changes.push({
        type: 'rename',
        action: 'would rename',
        from: MIGRATIONS.entryFile.old,
        to: MIGRATIONS.entryFile.new
      });
    } else {
      try {
        // Backup if requested
        if (backup && fs.existsSync(newFilePath)) {
          const backupPath = newFilePath + '.backup-' + Date.now();
          fs.renameSync(newFilePath, backupPath);
          result.changes.push({
            type: 'backup',
            action: 'backed up',
            from: MIGRATIONS.entryFile.new,
            to: path.basename(backupPath)
          });
        }

        // Remove existing v2 file if force
        if (force && fs.existsSync(newFilePath)) {
          fs.unlinkSync(newFilePath);
        }

        fs.renameSync(detection.oldFile, newFilePath);
        result.changes.push({
          type: 'rename',
          action: 'renamed',
          from: MIGRATIONS.entryFile.old,
          to: MIGRATIONS.entryFile.new
        });
      } catch (error) {
        result.errors.push(`Failed to rename entry file: ${error.message}`);
      }
    }
  }

  // 3. Update internal references in files
  if (updateReferences && !dryRun) {
    const contextDir = path.join(projectRoot, MIGRATIONS.directory.new);
    const entryFile = path.join(projectRoot, MIGRATIONS.entryFile.new);

    const filesToUpdate = [];

    // Add entry file
    if (fs.existsSync(entryFile)) {
      filesToUpdate.push(entryFile);
    }

    // Add all markdown and json files in context directory
    if (fs.existsSync(contextDir)) {
      try {
        const files = await glob('**/*.{md,json}', {
          cwd: contextDir,
          absolute: true,
          nodir: true
        });
        filesToUpdate.push(...files);
      } catch (error) {
        result.warnings.push(`Could not scan context directory: ${error.message}`);
      }
    }

    // Update .gitignore
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      filesToUpdate.push(gitignorePath);
    }

    // Process each file
    for (const filePath of filesToUpdate) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        const originalContent = content;

        for (const { pattern, replacement } of CONTENT_REPLACEMENTS) {
          content = content.replace(pattern, replacement);
        }

        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf-8');
          result.changes.push({
            type: 'update',
            action: 'updated references in',
            file: path.relative(projectRoot, filePath)
          });
        }
      } catch (error) {
        result.warnings.push(`Could not update ${path.relative(projectRoot, filePath)}: ${error.message}`);
      }
    }
  } else if (updateReferences && dryRun) {
    result.changes.push({
      type: 'update',
      action: 'would update references in',
      file: 'all markdown and json files'
    });
  }

  // Set success if no errors
  result.success = result.errors.length === 0;

  return result;
}

/**
 * Get migration status summary
 * @param {string} projectRoot - Project root directory
 * @returns {object} Status summary
 */
function getMigrationStatus(projectRoot) {
  const detection = detectV1Installation(projectRoot);

  if (!detection.hasV1 && !detection.hasV2) {
    return {
      status: 'none',
      message: 'No AI context installation found',
      needsMigration: false
    };
  }

  if (detection.hasV1 && !detection.hasV2) {
    return {
      status: 'v1',
      message: 'v1.x installation found, migration available',
      needsMigration: true,
      details: detection
    };
  }

  if (!detection.hasV1 && detection.hasV2) {
    return {
      status: 'v2',
      message: 'v2.0 installation found, no migration needed',
      needsMigration: false,
      details: detection
    };
  }

  if (detection.hasV1 && detection.hasV2) {
    return {
      status: 'mixed',
      message: 'Both v1.x and v2.0 installations found',
      needsMigration: true,
      details: detection
    };
  }
}

module.exports = {
  migrateV1ToV2,
  detectV1Installation,
  getMigrationStatus,
  MIGRATIONS,
  CONTENT_REPLACEMENTS
};
