/**
 * AI Context Engineering - Drift Checker Module
 *
 * Validates documentation references against the actual codebase.
 * Detects stale file paths, outdated line numbers, missing functions, etc.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Drift severity levels
 */
const DRIFT_LEVEL = {
  NONE: 'none',
  LOW: 'low',        // Minor issues, easily fixable
  MEDIUM: 'medium',  // Requires review
  HIGH: 'high',      // Significant issues
  CRITICAL: 'critical' // Major issues, documentation may be unusable
};

/**
 * Health status thresholds
 */
const HEALTH_THRESHOLDS = {
  HEALTHY: 90,      // 90-100%
  NEEDS_UPDATE: 70, // 70-89%
  STALE: 50,        // 50-69%
  CRITICAL: 0       // < 50%
};

/**
 * Patterns to extract references from markdown content
 */
const REFERENCE_PATTERNS = {
  // File paths in backticks: `src/auth.py`
  backtickPath: /`([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)`/g,

  // Line references: file.js:123 or file.py:45-67
  lineReference: /([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+):(\d+)(?:-(\d+))?/g,

  // Anchor references: file.py::function_name() or file.js::ClassName
  anchorReference: /([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)::(\w+)(?:\(\))?/g,

  // Directory references: src/components/
  directoryReference: /`?([a-zA-Z0-9_\-./\\]+\/)`?/g,

  // Markdown links: [text](./path/to/file.md)
  markdownLink: /\[([^\]]+)\]\(([^)]+)\)/g,

  // Tech stack mentions
  techStackMention: /(?:built\s+with|using|technologies?|stack)[:\s]+([^\n]+)/gi
};

/**
 * Common source file extensions (for filtering path matches)
 */
const SOURCE_EXTENSIONS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs',
  'py', 'pyw', 'pyi',
  'go', 'rs', 'rb', 'java', 'kt', 'scala',
  'c', 'cpp', 'cc', 'h', 'hpp',
  'cs', 'fs', 'vb',
  'php', 'swift', 'dart',
  'md', 'json', 'yaml', 'yml', 'toml',
  'sh', 'bash', 'zsh', 'ps1',
  'sql', 'graphql'
]);

/**
 * Extract all reference types from markdown content
 * @param {string} content - Markdown content
 * @returns {object} Categorized references
 */
function extractAllReferences(content) {
  const references = {
    filePaths: [],
    lineReferences: [],
    anchorReferences: [],
    directoryReferences: [],
    markdownLinks: [],
    techStackClaims: []
  };

  // Reset regex lastIndex
  const resetRegex = (regex) => { regex.lastIndex = 0; return regex; };

  // Extract file paths from backticks
  let match;
  const backtickRegex = resetRegex(REFERENCE_PATTERNS.backtickPath);
  while ((match = backtickRegex.exec(content)) !== null) {
    const filePath = match[1].replace(/\\/g, '/');
    const ext = path.extname(filePath).slice(1).toLowerCase();
    if (SOURCE_EXTENSIONS.has(ext) || ext === '') {
      references.filePaths.push({
        type: 'file_path',
        file: filePath,
        original: match[0],
        position: match.index
      });
    }
  }

  // Extract line references
  const lineRegex = resetRegex(REFERENCE_PATTERNS.lineReference);
  while ((match = lineRegex.exec(content)) !== null) {
    references.lineReferences.push({
      type: 'line_reference',
      file: match[1].replace(/\\/g, '/'),
      line: parseInt(match[2], 10),
      endLine: match[3] ? parseInt(match[3], 10) : null,
      original: match[0],
      position: match.index
    });
  }

  // Extract anchor references
  const anchorRegex = resetRegex(REFERENCE_PATTERNS.anchorReference);
  while ((match = anchorRegex.exec(content)) !== null) {
    references.anchorReferences.push({
      type: 'anchor_reference',
      file: match[1].replace(/\\/g, '/'),
      anchor: match[2],
      original: match[0],
      position: match.index
    });
  }

  // Extract directory references
  const dirRegex = resetRegex(REFERENCE_PATTERNS.directoryReference);
  while ((match = dirRegex.exec(content)) !== null) {
    const dir = match[1].replace(/\\/g, '/');
    // Filter out URLs and common false positives
    if (!dir.includes('://') && !dir.startsWith('http') && dir.length > 2) {
      references.directoryReferences.push({
        type: 'directory_reference',
        directory: dir,
        original: match[0],
        position: match.index
      });
    }
  }

  // Extract markdown links to local files
  const linkRegex = resetRegex(REFERENCE_PATTERNS.markdownLink);
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[2];
    // Filter out external URLs, anchors-only, and mailto
    if (!href.startsWith('http') &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:')) {
      references.markdownLinks.push({
        type: 'markdown_link',
        text: match[1],
        href: href.replace(/\\/g, '/'),
        original: match[0],
        position: match.index
      });
    }
  }

  // Extract tech stack claims
  const techRegex = resetRegex(REFERENCE_PATTERNS.techStackMention);
  while ((match = techRegex.exec(content)) !== null) {
    const technologies = match[1]
      .split(/[,;]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0 && t.length < 50);
    if (technologies.length > 0) {
      references.techStackClaims.push({
        type: 'tech_stack_claim',
        technologies,
        original: match[0],
        position: match.index
      });
    }
  }

  // Deduplicate references
  references.filePaths = dedupeByFile(references.filePaths);
  references.lineReferences = dedupeByOriginal(references.lineReferences);
  references.anchorReferences = dedupeByOriginal(references.anchorReferences);
  references.directoryReferences = dedupeByOriginal(references.directoryReferences);
  references.markdownLinks = dedupeByOriginal(references.markdownLinks);

  return references;
}

/**
 * Deduplicate by file path
 */
function dedupeByFile(refs) {
  const seen = new Set();
  return refs.filter(r => {
    if (seen.has(r.file)) return false;
    seen.add(r.file);
    return true;
  });
}

/**
 * Deduplicate by original text
 */
function dedupeByOriginal(refs) {
  const seen = new Set();
  return refs.filter(r => {
    if (seen.has(r.original)) return false;
    seen.add(r.original);
    return true;
  });
}

/**
 * Validate a file path reference
 * @param {object} ref - Reference object
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validateFilePath(ref, projectRoot) {
  const fullPath = path.join(projectRoot, ref.file);

  if (fs.existsSync(fullPath)) {
    return { valid: true };
  }

  // Try to find similar file
  const suggestion = findSimilarFile(ref.file, projectRoot);

  return {
    valid: false,
    level: DRIFT_LEVEL.CRITICAL,
    issue: 'File not found',
    suggestion: suggestion ? `Did you mean: ${suggestion}` : null
  };
}

/**
 * Validate a line reference
 * @param {object} ref - Reference object
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validateLineReference(ref, projectRoot) {
  const fullPath = path.join(projectRoot, ref.file);

  if (!fs.existsSync(fullPath)) {
    return {
      valid: false,
      level: DRIFT_LEVEL.CRITICAL,
      issue: 'Referenced file not found'
    };
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lineCount = content.split('\n').length;

    if (ref.line > lineCount) {
      return {
        valid: false,
        level: DRIFT_LEVEL.HIGH,
        issue: `Line ${ref.line} exceeds file length (${lineCount} lines)`,
        suggestion: `File now has ${lineCount} lines`,
        actualLineCount: lineCount
      };
    }

    if (ref.endLine && ref.endLine > lineCount) {
      return {
        valid: false,
        level: DRIFT_LEVEL.HIGH,
        issue: `End line ${ref.endLine} exceeds file length (${lineCount} lines)`,
        actualLineCount: lineCount
      };
    }

    return { valid: true, lineCount };
  } catch (error) {
    return {
      valid: false,
      level: DRIFT_LEVEL.HIGH,
      issue: `Cannot read file: ${error.message}`
    };
  }
}

/**
 * Validate an anchor reference (function/class)
 * @param {object} ref - Reference object
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validateAnchorReference(ref, projectRoot) {
  const fullPath = path.join(projectRoot, ref.file);

  if (!fs.existsSync(fullPath)) {
    return {
      valid: false,
      level: DRIFT_LEVEL.CRITICAL,
      issue: 'Referenced file not found'
    };
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const ext = path.extname(ref.file).slice(1).toLowerCase();

    // Get language-specific patterns
    const patterns = getSymbolPatterns(ext);
    const symbols = extractSymbols(content, patterns);

    // Check if anchor exists
    const foundSymbol = symbols.find(s =>
      s.name === ref.anchor ||
      s.name === ref.anchor.replace(/\(\)$/, '')
    );

    if (foundSymbol) {
      return {
        valid: true,
        currentLine: foundSymbol.line,
        symbolType: foundSymbol.type
      };
    }

    // Suggest similar symbols
    const similarSymbols = symbols
      .filter(s => s.name.toLowerCase().includes(ref.anchor.toLowerCase().substring(0, 3)))
      .slice(0, 5)
      .map(s => s.name);

    return {
      valid: false,
      level: DRIFT_LEVEL.HIGH,
      issue: `Symbol '${ref.anchor}' not found in ${ref.file}`,
      suggestion: similarSymbols.length > 0
        ? `Available symbols: ${similarSymbols.join(', ')}`
        : null,
      availableSymbols: symbols.slice(0, 10).map(s => s.name)
    };
  } catch (error) {
    return {
      valid: false,
      level: DRIFT_LEVEL.HIGH,
      issue: `Cannot analyze file: ${error.message}`
    };
  }
}

/**
 * Validate a directory reference
 * @param {object} ref - Reference object
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validateDirectory(ref, projectRoot) {
  const fullPath = path.join(projectRoot, ref.directory);

  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      return { valid: true };
    }
    return {
      valid: false,
      level: DRIFT_LEVEL.MEDIUM,
      issue: 'Path exists but is not a directory'
    };
  }

  // Try to find similar directory
  const suggestion = findSimilarDirectory(ref.directory, projectRoot);

  return {
    valid: false,
    level: DRIFT_LEVEL.MEDIUM,
    issue: 'Directory not found',
    suggestion: suggestion ? `Did you mean: ${suggestion}` : null
  };
}

/**
 * Validate a markdown link
 * @param {object} ref - Reference object
 * @param {string} docDir - Directory containing the document
 * @param {string} projectRoot - Project root directory
 * @returns {object} Validation result
 */
function validateMarkdownLink(ref, docDir, projectRoot) {
  // Handle relative paths
  let targetPath;
  if (ref.href.startsWith('./') || ref.href.startsWith('../')) {
    targetPath = path.resolve(docDir, ref.href);
  } else if (ref.href.startsWith('/')) {
    targetPath = path.join(projectRoot, ref.href);
  } else {
    targetPath = path.resolve(docDir, ref.href);
  }

  // Remove anchor from path
  const pathWithoutAnchor = targetPath.split('#')[0];

  if (fs.existsSync(pathWithoutAnchor)) {
    return { valid: true };
  }

  return {
    valid: false,
    level: DRIFT_LEVEL.MEDIUM,
    issue: `Link target not found: ${ref.href}`
  };
}

/**
 * Check drift for a single documentation file
 * @param {string} docPath - Path to markdown file
 * @param {string} projectRoot - Project root directory
 * @returns {object} Drift report
 */
function checkDocumentDrift(docPath, projectRoot = process.cwd()) {
  const fullPath = path.isAbsolute(docPath) ? docPath : path.join(projectRoot, docPath);
  const relativePath = path.isAbsolute(docPath) ? path.relative(projectRoot, docPath) : docPath;

  if (!fs.existsSync(fullPath)) {
    return {
      document: relativePath,
      status: 'error',
      error: 'Document file not found',
      healthScore: 0
    };
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const docDir = path.dirname(fullPath);
    const references = extractAllReferences(content);
    const issues = [];
    const validRefs = [];

    // Validate file paths
    for (const ref of references.filePaths) {
      const result = validateFilePath(ref, projectRoot);
      if (result.valid) {
        validRefs.push({ ...ref, ...result });
      } else {
        issues.push({ ...ref, ...result });
      }
    }

    // Validate line references
    for (const ref of references.lineReferences) {
      const result = validateLineReference(ref, projectRoot);
      if (result.valid) {
        validRefs.push({ ...ref, ...result });
      } else {
        issues.push({ ...ref, ...result });
      }
    }

    // Validate anchor references
    for (const ref of references.anchorReferences) {
      const result = validateAnchorReference(ref, projectRoot);
      if (result.valid) {
        validRefs.push({ ...ref, ...result });
      } else {
        issues.push({ ...ref, ...result });
      }
    }

    // Validate directory references
    for (const ref of references.directoryReferences) {
      const result = validateDirectory(ref, projectRoot);
      if (result.valid) {
        validRefs.push({ ...ref, ...result });
      } else {
        issues.push({ ...ref, ...result });
      }
    }

    // Validate markdown links
    for (const ref of references.markdownLinks) {
      const result = validateMarkdownLink(ref, docDir, projectRoot);
      if (result.valid) {
        validRefs.push({ ...ref, ...result });
      } else {
        issues.push({ ...ref, ...result });
      }
    }

    // Calculate health score
    const totalRefs = validRefs.length + issues.length;
    const healthScore = totalRefs > 0
      ? Math.round((validRefs.length / totalRefs) * 100)
      : 100;

    // Determine status
    let status;
    if (healthScore >= HEALTH_THRESHOLDS.HEALTHY) {
      status = 'healthy';
    } else if (healthScore >= HEALTH_THRESHOLDS.NEEDS_UPDATE) {
      status = 'needs_update';
    } else if (healthScore >= HEALTH_THRESHOLDS.STALE) {
      status = 'stale';
    } else {
      status = 'critical';
    }

    // Determine overall drift level
    const level = calculateDriftLevel(issues);

    return {
      document: relativePath,
      status,
      level,
      healthScore,
      summary: {
        total: totalRefs,
        valid: validRefs.length,
        issues: issues.length
      },
      references: {
        valid: validRefs,
        invalid: issues
      },
      byType: {
        filePaths: references.filePaths.length,
        lineReferences: references.lineReferences.length,
        anchorReferences: references.anchorReferences.length,
        directories: references.directoryReferences.length,
        markdownLinks: references.markdownLinks.length,
        techStackClaims: references.techStackClaims.length
      },
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      document: relativePath,
      status: 'error',
      error: `Failed to check document: ${error.message}`,
      healthScore: 0
    };
  }
}

/**
 * Generate comprehensive drift report for multiple documents
 * @param {string[]} docPaths - Array of document paths to analyze
 * @param {string} projectRoot - Project root directory
 * @returns {object} Complete drift report
 */
function generateDriftReport(docPaths, projectRoot = process.cwd()) {
  const report = {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    projectRoot,
    summary: {
      totalDocuments: 0,
      healthyDocuments: 0,
      documentsWithIssues: 0,
      overallHealthScore: 0,
      totalReferences: 0,
      validReferences: 0,
      invalidReferences: 0
    },
    healthBreakdown: {
      filePaths: { valid: 0, invalid: 0, score: 100 },
      lineReferences: { valid: 0, invalid: 0, score: 100 },
      anchorReferences: { valid: 0, invalid: 0, score: 100 },
      directories: { valid: 0, invalid: 0, score: 100 },
      markdownLinks: { valid: 0, invalid: 0, score: 100 }
    },
    documents: [],
    suggestedFixes: []
  };

  for (const docPath of docPaths) {
    const result = checkDocumentDrift(docPath, projectRoot);
    report.documents.push(result);

    if (result.status === 'error') continue;

    report.summary.totalDocuments++;
    report.summary.totalReferences += result.summary.total;
    report.summary.validReferences += result.summary.valid;
    report.summary.invalidReferences += result.summary.issues;

    if (result.status === 'healthy') {
      report.summary.healthyDocuments++;
    } else {
      report.summary.documentsWithIssues++;
    }

    // Aggregate type stats
    for (const ref of result.references.valid) {
      const typeKey = getTypeKey(ref.type);
      if (typeKey && report.healthBreakdown[typeKey]) {
        report.healthBreakdown[typeKey].valid++;
      }
    }
    for (const ref of result.references.invalid) {
      const typeKey = getTypeKey(ref.type);
      if (typeKey && report.healthBreakdown[typeKey]) {
        report.healthBreakdown[typeKey].invalid++;
      }

      // Generate suggested fixes
      if (ref.suggestion) {
        report.suggestedFixes.push({
          document: result.document,
          original: ref.original,
          issue: ref.issue,
          suggestion: ref.suggestion,
          level: ref.level
        });
      }
    }
  }

  // Calculate overall health score
  report.summary.overallHealthScore = report.summary.totalReferences > 0
    ? Math.round((report.summary.validReferences / report.summary.totalReferences) * 100)
    : 100;

  // Calculate per-type scores
  for (const [type, stats] of Object.entries(report.healthBreakdown)) {
    const total = stats.valid + stats.invalid;
    stats.score = total > 0 ? Math.round((stats.valid / total) * 100) : 100;
  }

  return report;
}

/**
 * Find documentation files in project
 * @param {string} projectRoot - Project root
 * @returns {Promise<string[]>} Array of doc paths
 */
async function findDocumentationFiles(projectRoot) {
  const patterns = [
    'CLAUDE.md',
    'AI_CONTEXT.md',
    'README.md',
    '.github/copilot-instructions.md',
    '.clinerules',
    'docs/**/*.md',
    '.claude/**/*.md',
    '.ai-context/**/*.md'
  ];

  const files = [];
  for (const pattern of patterns) {
    try {
      const matches = await glob(pattern, {
        cwd: projectRoot,
        ignore: ['node_modules/**', '**/node_modules/**'],
        nodir: true
      });
      files.push(...matches);
    } catch {
      // Ignore glob errors
    }
  }

  return [...new Set(files)];
}

/**
 * Calculate drift level from issues
 */
function calculateDriftLevel(issues) {
  if (issues.length === 0) return DRIFT_LEVEL.NONE;

  const hasCritical = issues.some(i => i.level === DRIFT_LEVEL.CRITICAL);
  const hasHigh = issues.some(i => i.level === DRIFT_LEVEL.HIGH);
  const hasMedium = issues.some(i => i.level === DRIFT_LEVEL.MEDIUM);

  if (hasCritical) return DRIFT_LEVEL.CRITICAL;
  if (hasHigh) return DRIFT_LEVEL.HIGH;
  if (hasMedium) return DRIFT_LEVEL.MEDIUM;
  return DRIFT_LEVEL.LOW;
}

/**
 * Get type key for health breakdown
 */
function getTypeKey(type) {
  const mapping = {
    'file_path': 'filePaths',
    'line_reference': 'lineReferences',
    'anchor_reference': 'anchorReferences',
    'directory_reference': 'directories',
    'markdown_link': 'markdownLinks'
  };
  return mapping[type];
}

/**
 * Get symbol extraction patterns for a language
 */
function getSymbolPatterns(ext) {
  const patterns = {
    // Python
    py: [
      /^(?:async\s+)?def\s+(\w+)\s*\(/gm,
      /^class\s+(\w+)/gm
    ],
    pyw: [
      /^(?:async\s+)?def\s+(\w+)\s*\(/gm,
      /^class\s+(\w+)/gm
    ],
    // JavaScript/TypeScript
    js: [
      /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm,
      /^(?:export\s+)?class\s+(\w+)/gm,
      /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/gm,
      /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/gm
    ],
    ts: [
      /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[<(]/gm,
      /^(?:export\s+)?class\s+(\w+)/gm,
      /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/gm,
      /^(?:export\s+)?interface\s+(\w+)/gm,
      /^(?:export\s+)?type\s+(\w+)/gm
    ],
    // Go
    go: [
      /^func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/gm,
      /^type\s+(\w+)\s+struct/gm,
      /^type\s+(\w+)\s+interface/gm
    ],
    // Rust
    rs: [
      /^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/gm,
      /^(?:pub\s+)?struct\s+(\w+)/gm,
      /^(?:pub\s+)?enum\s+(\w+)/gm,
      /^(?:pub\s+)?trait\s+(\w+)/gm,
      /^impl(?:<[^>]+>)?\s+(\w+)/gm
    ],
    // Ruby
    rb: [
      /^(?:\s*)def\s+(\w+)/gm,
      /^(?:\s*)class\s+(\w+)/gm,
      /^(?:\s*)module\s+(\w+)/gm
    ]
  };

  // Handle jsx, tsx, mjs, cjs as their base type
  const normalized = ext.replace(/[jt]sx$/, ext[0] + 's').replace(/[cm]js$/, 'js');
  return patterns[normalized] || patterns.js; // Default to JS patterns
}

/**
 * Extract symbols from content using patterns
 */
function extractSymbols(content, patterns) {
  const symbols = [];
  const lines = content.split('\n');

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      // Calculate line number
      const beforeMatch = content.substring(0, match.index);
      const line = beforeMatch.split('\n').length;

      symbols.push({
        name,
        line,
        type: pattern.source.includes('class') ? 'class' :
              pattern.source.includes('struct') ? 'struct' :
              pattern.source.includes('interface') ? 'interface' :
              pattern.source.includes('trait') ? 'trait' :
              pattern.source.includes('type') ? 'type' :
              pattern.source.includes('module') ? 'module' : 'function'
      });
    }
  }

  return symbols;
}

/**
 * Find similar file in project
 */
function findSimilarFile(targetFile, projectRoot) {
  const basename = path.basename(targetFile);
  const dirname = path.dirname(targetFile);

  // Try common variations
  const variations = [
    targetFile,
    path.join(dirname, basename.toLowerCase()),
    path.join('src', targetFile),
    path.join('lib', targetFile),
    basename
  ];

  for (const variation of variations) {
    const fullPath = path.join(projectRoot, variation);
    if (fs.existsSync(fullPath)) {
      return variation;
    }
  }

  return null;
}

/**
 * Find similar directory in project
 */
function findSimilarDirectory(targetDir, projectRoot) {
  const basename = path.basename(targetDir.replace(/\/$/, ''));

  // Try common variations
  const variations = [
    targetDir,
    path.join('src', basename),
    path.join('lib', basename),
    basename
  ];

  for (const variation of variations) {
    const fullPath = path.join(projectRoot, variation);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      return variation + '/';
    }
  }

  return null;
}

/**
 * Format drift report for console output
 */
function formatDriftReportConsole(report) {
  const lines = [];

  lines.push('');
  lines.push('Documentation Drift Report');
  lines.push('=' .repeat(50));
  lines.push('');

  // Overall summary
  const healthEmoji = report.summary.overallHealthScore >= 90 ? '\u2713' :
                      report.summary.overallHealthScore >= 70 ? '\u26A0' : '\u2717';
  lines.push(`Overall Health: ${report.summary.overallHealthScore}% ${healthEmoji}`);
  lines.push('');
  lines.push(`Documents: ${report.summary.totalDocuments} (${report.summary.healthyDocuments} healthy)`);
  lines.push(`References: ${report.summary.validReferences}/${report.summary.totalReferences} valid`);
  lines.push('');

  // Per-document results
  for (const doc of report.documents) {
    if (doc.status === 'error') {
      lines.push(`${doc.document} - ERROR: ${doc.error}`);
      continue;
    }

    const emoji = doc.status === 'healthy' ? '\u2713' :
                  doc.status === 'needs_update' ? '\u26A0' : '\u2717';
    lines.push(`${doc.document} - ${doc.healthScore}% ${emoji} ${doc.status}`);

    if (doc.references.invalid.length > 0) {
      for (const issue of doc.references.invalid.slice(0, 5)) {
        lines.push(`  \u2717 ${issue.original} - ${issue.issue}`);
        if (issue.suggestion) {
          lines.push(`      ${issue.suggestion}`);
        }
      }
      if (doc.references.invalid.length > 5) {
        lines.push(`  ... and ${doc.references.invalid.length - 5} more issues`);
      }
    }
  }

  lines.push('');

  // Suggested fixes
  if (report.suggestedFixes.length > 0) {
    lines.push('Suggested Fixes:');
    for (const fix of report.suggestedFixes.slice(0, 10)) {
      lines.push(`  ${fix.document}: ${fix.original}`);
      lines.push(`    -> ${fix.suggestion}`);
    }
  }

  return lines.join('\n');
}

module.exports = {
  // Core functions
  extractAllReferences,
  checkDocumentDrift,
  generateDriftReport,
  findDocumentationFiles,
  formatDriftReportConsole,

  // Validation functions
  validateFilePath,
  validateLineReference,
  validateAnchorReference,
  validateDirectory,
  validateMarkdownLink,

  // Utilities
  extractSymbols,
  getSymbolPatterns,
  findSimilarFile,
  findSimilarDirectory,
  calculateDriftLevel,

  // Constants
  DRIFT_LEVEL,
  HEALTH_THRESHOLDS,
  REFERENCE_PATTERNS
};
