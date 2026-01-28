/**
 * AI Context Engineering - Smart Merge Module
 *
 * Intelligently merges existing documentation with new analysis results.
 * Preserves user customizations while updating stale references and adding new content.
 */

const fs = require('fs');
const path = require('path');

/**
 * Decision types for merge operations
 */
const DECISION_TYPE = {
  PRESERVE: 'preserve',           // Keep existing value (user customized)
  UPDATE: 'update',               // Replace with new value
  CONFLICT: 'conflict',           // Values differ, needs resolution
  PRESERVE_SECTION: 'preserve_section', // Keep custom section
  REMOVE_STALE_REF: 'remove_stale_ref', // Remove reference to deleted file
  UPDATE_REF: 'update_ref',       // Update line reference
  ADD_WORKFLOW: 'add_workflow',   // Add newly discovered workflow
  ADD_ENTRY_POINT: 'add_entry_point' // Add new entry point
};

/**
 * Extract content from an existing documentation file
 * @param {string} filePath - Path to existing file
 * @param {string} templatePath - Path to template for comparison
 * @returns {object} Extracted content
 */
function extractExistingContent(filePath, templatePath = null) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  const result = {
    raw: content,
    sections: parseMarkdownSections(content),
    placeholders: extractPlaceholderValues(content),
    lineReferences: extractLineReferences(content),
    customSections: [],
    frontmatter: extractFrontmatter(content)
  };

  // If template provided, identify custom sections
  if (templatePath && fs.existsSync(templatePath)) {
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const templateSections = parseMarkdownSections(templateContent);
    const templateHeadings = new Set(templateSections.map(s => s.heading.toLowerCase()));

    result.customSections = result.sections.filter(
      s => !templateHeadings.has(s.heading.toLowerCase())
    );
  }

  return result;
}

/**
 * Parse markdown into sections by headings
 * @param {string} content - Markdown content
 * @returns {Array} Array of sections
 */
function parseMarkdownSections(content) {
  const sections = [];
  const lines = content.split('\n');
  let currentSection = { heading: 'root', level: 0, content: [], startLine: 0 };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section if it has content
      if (currentSection.content.length > 0 || currentSection.heading !== 'root') {
        currentSection.content = currentSection.content.join('\n').trim();
        sections.push(currentSection);
      }

      currentSection = {
        heading: headingMatch[2].trim(),
        level: headingMatch[1].length,
        content: [],
        startLine: i
      };
    } else {
      currentSection.content.push(line);
    }
  }

  // Save final section
  currentSection.content = currentSection.content.join('\n').trim();
  sections.push(currentSection);

  return sections;
}

/**
 * Extract placeholder values from content
 * @param {string} content - File content
 * @returns {object} Map of placeholder name to value
 */
function extractPlaceholderValues(content) {
  const values = {};

  // Known placeholder patterns and their extraction contexts
  const patterns = [
    { name: 'PROJECT_NAME', regex: /\*\*Project(?:\s*Name)?:\*\*\s*(.+?)(?:\n|$)/i },
    { name: 'PROJECT_DESCRIPTION', regex: /\*\*(?:Platform|Description):\*\*\s*(.+?)(?:\n|$)/i },
    { name: 'TECH_STACK', regex: /\*\*Tech Stack:\*\*\s*(.+?)(?:\n|$)/i },
    { name: 'PRODUCTION_URL', regex: /\*\*(?:Domain|URL):\*\*\s*(.+?)(?:\n|$)/i },
    { name: 'API_URL', regex: /\*\*API:\*\*\s*(.+?)(?:\n|$)/i },
    { name: 'REPO_URL', regex: /\*\*Repo:\*\*\s*(.+?)(?:\n|$)/i }
  ];

  for (const { name, regex } of patterns) {
    const match = content.match(regex);
    if (match && match[1]) {
      const value = match[1].trim();
      // Skip if still a placeholder
      if (!value.match(/\{\{[A-Z_]+\}\}/)) {
        values[name] = value;
      }
    }
  }

  return values;
}

/**
 * Extract line references from content
 * @param {string} content - File content
 * @returns {Array} Array of line references
 */
function extractLineReferences(content) {
  const refs = [];
  const pattern = /([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+):(\d+)(?:-(\d+))?/g;

  let match;
  while ((match = pattern.exec(content)) !== null) {
    refs.push({
      file: match[1].replace(/\\/g, '/'),
      line: parseInt(match[2], 10),
      endLine: match[3] ? parseInt(match[3], 10) : null,
      original: match[0],
      position: match.index
    });
  }

  return refs;
}

/**
 * Extract YAML frontmatter from markdown
 * @param {string} content - File content
 * @returns {object|null} Parsed frontmatter
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  try {
    // Simple YAML parsing for common cases
    const yaml = {};
    const lines = match[1].split('\n');
    for (const line of lines) {
      const kvMatch = line.match(/^(\w+):\s*(.*)$/);
      if (kvMatch) {
        yaml[kvMatch[1]] = kvMatch[2].trim();
      }
    }
    return yaml;
  } catch {
    return null;
  }
}

/**
 * Generate merge decisions
 * @param {object} existing - Extracted existing content
 * @param {object} newAnalysis - New analysis results
 * @param {object} options - Merge options
 * @returns {Array} Array of merge decisions
 */
function decideMerge(existing, newAnalysis, options = {}) {
  const {
    preserveCustom = true,
    updateRefs = false,
    defaultPlaceholders = {}
  } = options;

  const decisions = [];

  if (!existing) {
    // No existing content, use all new values
    return [{
      type: DECISION_TYPE.UPDATE,
      reason: 'No existing content'
    }];
  }

  // 1. Placeholder decisions
  for (const [name, existingValue] of Object.entries(existing.placeholders || {})) {
    const newValue = newAnalysis?.values?.[name] || defaultPlaceholders[name];
    const defaultValue = defaultPlaceholders[name];

    // Check if value was customized (different from default)
    const isCustomized = existingValue !== defaultValue && existingValue !== `{{${name}}}`;

    if (isCustomized && preserveCustom) {
      decisions.push({
        type: DECISION_TYPE.PRESERVE,
        placeholder: name,
        value: existingValue,
        reason: 'User customized'
      });
    } else if (newValue && newValue !== existingValue) {
      decisions.push({
        type: DECISION_TYPE.UPDATE,
        placeholder: name,
        oldValue: existingValue,
        newValue,
        reason: 'Updated from analysis'
      });
    }
  }

  // 2. Custom section decisions
  for (const section of existing.customSections || []) {
    decisions.push({
      type: DECISION_TYPE.PRESERVE_SECTION,
      heading: section.heading,
      content: section.content,
      position: section.startLine,
      reason: 'Custom section not in template'
    });
  }

  // 3. Line reference decisions
  if (updateRefs) {
    for (const ref of existing.lineReferences || []) {
      const fullPath = path.join(process.cwd(), ref.file);

      if (!fs.existsSync(fullPath)) {
        decisions.push({
          type: DECISION_TYPE.REMOVE_STALE_REF,
          reference: ref.original,
          reason: 'File no longer exists'
        });
      } else {
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf-8');
          const lineCount = fileContent.split('\n').length;

          if (ref.line > lineCount) {
            decisions.push({
              type: DECISION_TYPE.UPDATE_REF,
              oldRef: ref.original,
              newRef: `${ref.file}:${lineCount}`,
              reason: `Line ${ref.line} exceeds file length (${lineCount} lines)`
            });
          }
        } catch {
          // Can't read file, skip
        }
      }
    }
  }

  // 4. New workflow decisions
  for (const workflow of newAnalysis?.workflows || []) {
    const existsInDocs = existing.sections?.some(
      s => s.heading.toLowerCase().includes(workflow.name?.toLowerCase() || '')
    );

    if (!existsInDocs) {
      decisions.push({
        type: DECISION_TYPE.ADD_WORKFLOW,
        workflow,
        reason: 'Newly discovered workflow'
      });
    }
  }

  return decisions;
}

/**
 * Generate merged content from decisions
 * @param {string} templateContent - Template content
 * @param {Array} decisions - Merge decisions
 * @param {object} existing - Existing content
 * @returns {string} Merged content
 */
function generateMergedContent(templateContent, decisions, existing) {
  let content = templateContent;

  // Apply decisions
  for (const decision of decisions) {
    switch (decision.type) {
      case DECISION_TYPE.PRESERVE:
      case DECISION_TYPE.UPDATE:
        // Replace placeholder with value
        if (decision.placeholder && (decision.value || decision.newValue)) {
          const value = decision.value || decision.newValue;
          const placeholder = `{{${decision.placeholder}}}`;
          content = content.replace(new RegExp(escapeRegex(placeholder), 'g'), value);
        }
        break;

      case DECISION_TYPE.PRESERVE_SECTION:
        // Insert custom section at appropriate position
        if (decision.heading && decision.content) {
          const level = '#'.repeat(decision.level || 2);
          const sectionContent = `\n${level} ${decision.heading}\n\n${decision.content}\n`;
          // Append before the last section or at end
          const lastHeadingMatch = content.match(/\n(#{1,6}\s+[^\n]+)\n[^#]*$/);
          if (lastHeadingMatch) {
            content = content.replace(lastHeadingMatch[0], sectionContent + lastHeadingMatch[0]);
          } else {
            content += sectionContent;
          }
        }
        break;

      case DECISION_TYPE.UPDATE_REF:
        // Update line reference
        if (decision.oldRef && decision.newRef) {
          content = content.replace(
            new RegExp(escapeRegex(decision.oldRef), 'g'),
            decision.newRef
          );
        }
        break;

      case DECISION_TYPE.REMOVE_STALE_REF:
        // Comment out or remove stale reference
        if (decision.reference) {
          content = content.replace(
            new RegExp(escapeRegex(decision.reference), 'g'),
            `<!-- REMOVED: ${decision.reference} -->`
          );
        }
        break;
    }
  }

  return content;
}

/**
 * Generate diff between old and new content
 * @param {string} oldContent - Original content
 * @param {string} newContent - New content
 * @param {Array} decisions - Merge decisions
 * @returns {object} Diff summary
 */
function generateDiff(oldContent, newContent, decisions) {
  const diff = {
    summary: {
      preserved: 0,
      updated: 0,
      added: 0,
      removed: 0,
      conflicts: 0
    },
    changes: [],
    migrationNotes: []
  };

  for (const decision of decisions) {
    switch (decision.type) {
      case DECISION_TYPE.PRESERVE:
      case DECISION_TYPE.PRESERVE_SECTION:
        diff.summary.preserved++;
        diff.changes.push({
          type: 'preserve',
          location: decision.placeholder || decision.heading,
          reason: decision.reason
        });
        break;

      case DECISION_TYPE.UPDATE:
      case DECISION_TYPE.UPDATE_REF:
        diff.summary.updated++;
        diff.changes.push({
          type: 'update',
          location: decision.placeholder || decision.oldRef,
          oldValue: decision.oldValue || decision.oldRef,
          newValue: decision.newValue || decision.newRef
        });
        break;

      case DECISION_TYPE.ADD_WORKFLOW:
      case DECISION_TYPE.ADD_ENTRY_POINT:
        diff.summary.added++;
        diff.changes.push({
          type: 'add',
          description: decision.workflow?.name || decision.entryPoint?.file
        });
        break;

      case DECISION_TYPE.REMOVE_STALE_REF:
        diff.summary.removed++;
        diff.migrationNotes.push({
          type: 'removed',
          reference: decision.reference,
          reason: decision.reason
        });
        break;

      case DECISION_TYPE.CONFLICT:
        diff.summary.conflicts++;
        diff.changes.push({
          type: 'conflict',
          location: decision.placeholder,
          existing: decision.existingValue,
          proposed: decision.newValue
        });
        break;
    }
  }

  return diff;
}

/**
 * Escape regex special characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Smart merge a file with new analysis
 * @param {string} filePath - Path to existing file
 * @param {string} templatePath - Path to template
 * @param {object} analysis - New analysis results
 * @param {object} options - Merge options
 * @returns {object} Merge result
 */
async function smartMergeFile(filePath, templatePath, analysis, options = {}) {
  const {
    dryRun = false,
    backup = false,
    preserveCustom = true,
    updateRefs = false
  } = options;

  // Check if file exists
  const fileExists = fs.existsSync(filePath);
  const templateExists = fs.existsSync(templatePath);

  if (!templateExists) {
    return {
      success: false,
      error: 'Template file not found'
    };
  }

  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  // If file doesn't exist, just use template
  if (!fileExists) {
    if (!dryRun) {
      fs.writeFileSync(filePath, templateContent);
    }
    return {
      success: true,
      isNew: true,
      decisions: []
    };
  }

  // Extract existing content
  const existing = extractExistingContent(filePath, templatePath);

  // Generate merge decisions
  const decisions = decideMerge(existing, analysis, {
    preserveCustom,
    updateRefs,
    defaultPlaceholders: options.defaultPlaceholders || {}
  });

  // Generate merged content
  const mergedContent = generateMergedContent(templateContent, decisions, existing);

  // Generate diff
  const diff = generateDiff(existing.raw, mergedContent, decisions);

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      decisions,
      diff,
      wouldWrite: mergedContent !== existing.raw
    };
  }

  // Backup if requested
  if (backup) {
    const backupPath = filePath + '.backup-' + Date.now();
    fs.writeFileSync(backupPath, existing.raw);
  }

  // Write merged content
  fs.writeFileSync(filePath, mergedContent);

  return {
    success: true,
    decisions,
    diff,
    preserved: diff.summary.preserved,
    updated: diff.summary.updated,
    added: diff.summary.added,
    removed: diff.summary.removed,
    migrationNotes: diff.migrationNotes
  };
}

module.exports = {
  // Core functions
  extractExistingContent,
  decideMerge,
  generateMergedContent,
  generateDiff,
  smartMergeFile,

  // Parsing functions
  parseMarkdownSections,
  extractPlaceholderValues,
  extractLineReferences,
  extractFrontmatter,

  // Constants
  DECISION_TYPE
};
