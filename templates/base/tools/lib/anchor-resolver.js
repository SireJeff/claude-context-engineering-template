/**
 * Anchor Resolver - Resolves semantic anchors to line numbers
 *
 * Converts stable function/class references to current line numbers.
 * Supports: file.py::function_name(), file.js::ClassName
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SYNC_DIR = path.join(__dirname, '..', '..', 'sync');
const ANCHORS_PATH = path.join(SYNC_DIR, 'anchors.json');

/**
 * Language-specific patterns for finding functions/classes
 */
const PATTERNS = {
  // Python
  py: {
    function: /^(\s*)def\s+(\w+)\s*\(/gm,
    class: /^(\s*)class\s+(\w+)\s*[:\(]/gm,
    method: /^(\s+)def\s+(\w+)\s*\(/gm
  },
  // JavaScript/TypeScript
  js: {
    function: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm,
    class: /^(?:export\s+)?class\s+(\w+)/gm,
    method: /^\s+(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/gm,
    arrow: /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/gm
  },
  ts: {
    function: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[<(]/gm,
    class: /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/gm,
    method: /^\s+(?:public\s+|private\s+|protected\s+)?(?:async\s+)?(\w+)\s*[<(]/gm
  },
  // Go
  go: {
    function: /^func\s+(\w+)\s*\(/gm,
    method: /^func\s+\([^)]+\)\s+(\w+)\s*\(/gm,
    type: /^type\s+(\w+)\s+(?:struct|interface)/gm
  },
  // Rust
  rs: {
    function: /^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/gm,
    struct: /^(?:pub\s+)?struct\s+(\w+)/gm,
    impl: /^impl(?:<[^>]+>)?\s+(\w+)/gm
  },
  // Ruby
  rb: {
    function: /^\s*def\s+(\w+)/gm,
    class: /^class\s+(\w+)/gm,
    module: /^module\s+(\w+)/gm
  }
};

/**
 * Get language from file extension
 */
function getLanguage(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mapping = {
    py: 'py',
    js: 'js',
    jsx: 'js',
    ts: 'ts',
    tsx: 'ts',
    go: 'go',
    rs: 'rs',
    rb: 'rb'
  };
  return mapping[ext] || null;
}

/**
 * Find all symbols (functions, classes, methods) in a file
 */
function findSymbols(content, language) {
  const symbols = [];
  const patterns = PATTERNS[language];

  if (!patterns) return symbols;

  const lines = content.split('\n');

  for (const [type, pattern] of Object.entries(patterns)) {
    // Reset pattern state
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;

      // Get the symbol name (last capture group typically)
      const name = match[match.length - 1] || match[1];

      // Get the full line for context
      const line = lines[lineNumber - 1] || '';

      // Calculate content hash for the function body (simplified)
      const endIndex = findSymbolEnd(content, match.index, language);
      const symbolContent = content.substring(match.index, endIndex);
      const hash = crypto.createHash('md5').update(symbolContent).digest('hex').substring(0, 8);

      symbols.push({
        name,
        type,
        line: lineNumber,
        signature: line.trim(),
        hash
      });
    }
  }

  return symbols;
}

/**
 * Find the end of a symbol definition (simplified heuristic)
 */
function findSymbolEnd(content, startIndex, language) {
  // Simple approach: find next function/class definition or end of file
  const remaining = content.substring(startIndex + 1);
  const patterns = PATTERNS[language];

  let minEnd = content.length;

  for (const pattern of Object.values(patterns)) {
    pattern.lastIndex = 0;
    const match = pattern.exec(remaining);
    if (match && (startIndex + 1 + match.index) < minEnd) {
      minEnd = startIndex + 1 + match.index;
    }
  }

  return minEnd;
}

/**
 * Resolve a semantic anchor to current line number
 */
function resolveAnchor(anchor, projectRoot = process.cwd()) {
  // Parse anchor format: file.py::function_name()
  const match = anchor.match(/^(.+)::(\w+)(?:\(\))?$/);
  if (!match) {
    return { success: false, error: 'Invalid anchor format' };
  }

  const [, filePath, symbolName] = match;
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);

  if (!fs.existsSync(fullPath)) {
    return { success: false, error: `File not found: ${filePath}` };
  }

  const language = getLanguage(fullPath);
  if (!language) {
    return { success: false, error: `Unsupported language: ${path.extname(fullPath)}` };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const symbols = findSymbols(content, language);

  // Find the symbol
  const symbol = symbols.find(s => s.name === symbolName);
  if (!symbol) {
    return {
      success: false,
      error: `Symbol not found: ${symbolName}`,
      availableSymbols: symbols.map(s => s.name)
    };
  }

  return {
    success: true,
    file: filePath,
    symbol: symbolName,
    line: symbol.line,
    signature: symbol.signature,
    hash: symbol.hash,
    type: symbol.type
  };
}

/**
 * Build anchors for a file
 */
function buildFileAnchors(filePath, projectRoot = process.cwd()) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);

  if (!fs.existsSync(fullPath)) {
    return { success: false, error: `File not found: ${filePath}` };
  }

  const language = getLanguage(fullPath);
  if (!language) {
    return { success: false, error: `Unsupported language: ${path.extname(fullPath)}` };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const symbols = findSymbols(content, language);

  const anchors = {};
  for (const symbol of symbols) {
    anchors[symbol.name] = {
      type: symbol.type,
      line: symbol.line,
      signature: symbol.signature,
      hash: symbol.hash
    };
  }

  return { success: true, anchors, symbolCount: symbols.length };
}

/**
 * Load stored anchors
 */
function loadAnchors() {
  try {
    if (fs.existsSync(ANCHORS_PATH)) {
      const content = fs.readFileSync(ANCHORS_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Failed to load anchors:', error.message);
  }
  return { version: '1.0.0', anchors: {} };
}

/**
 * Save anchors
 */
function saveAnchors(data) {
  try {
    if (!fs.existsSync(SYNC_DIR)) {
      fs.mkdirSync(SYNC_DIR, { recursive: true });
    }
    data.generatedAt = new Date().toISOString();
    fs.writeFileSync(ANCHORS_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save anchors:', error.message);
    return false;
  }
}

/**
 * Update anchors for changed files
 */
function updateAnchors(filePaths, projectRoot = process.cwd()) {
  const stored = loadAnchors();

  for (const filePath of filePaths) {
    const result = buildFileAnchors(filePath, projectRoot);
    if (result.success) {
      stored.anchors[filePath] = result.anchors;
    }
  }

  saveAnchors(stored);
  return stored;
}

module.exports = {
  resolveAnchor,
  buildFileAnchors,
  findSymbols,
  loadAnchors,
  saveAnchors,
  updateAnchors,
  getLanguage,
  PATTERNS
};
