/**
 * Call Tracer
 *
 * Performs static call chain analysis to trace function calls.
 * Used for workflow documentation.
 */

const fs = require('fs');
const path = require('path');

/**
 * Language-specific patterns for call extraction
 */
const CALL_PATTERNS = {
  javascript: {
    functionCall: /(\w+)\s*\(/g,
    import: /(?:import\s+(?:(?:\{[^}]+\})|(?:\*\s+as\s+\w+)|(?:\w+))\s+from\s+['"]([^'"]+)['"])|(?:require\s*\(\s*['"]([^'"]+)['"]\s*\))/g,
    methodCall: /(\w+)\.(\w+)\s*\(/g,
    functionDef: /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*[:=]\s*(?:async\s*)?\([^)]*\)\s*=>)/g,
    asyncAwait: /await\s+(\w+)(?:\.(\w+))?\s*\(/g
  },

  typescript: {
    functionCall: /(\w+)\s*\(/g,
    import: /import\s+(?:\{[^}]+\}|(?:\*\s+as\s+\w+)|\w+)\s+from\s+['"]([^'"]+)['"]/g,
    methodCall: /(\w+)\.(\w+)\s*\(/g,
    functionDef: /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*[:=]\s*(?:async\s*)?\([^)]*\)\s*=>)/g,
    asyncAwait: /await\s+(\w+)(?:\.(\w+))?\s*\(/g,
    classMethod: /(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/g
  },

  python: {
    functionCall: /(\w+)\s*\(/g,
    import: /(?:from\s+(\S+)\s+import)|(?:import\s+(\S+))/g,
    methodCall: /(\w+)\.(\w+)\s*\(/g,
    functionDef: /def\s+(\w+)\s*\(/g,
    classMethod: /def\s+(\w+)\s*\(\s*self/g,
    asyncDef: /async\s+def\s+(\w+)\s*\(/g
  },

  go: {
    functionCall: /(\w+)\s*\(/g,
    import: /import\s+(?:\(\s*)?["']([^"']+)["']/g,
    methodCall: /(\w+)\.(\w+)\s*\(/g,
    functionDef: /func\s+(\w+)\s*\(/g,
    methodDef: /func\s+\([^)]+\)\s+(\w+)\s*\(/g
  },

  ruby: {
    functionCall: /(\w+)\s*[\(\s]/g,
    methodCall: /(\w+)\.(\w+)/g,
    functionDef: /def\s+(\w+)/g,
    classMethod: /def\s+self\.(\w+)/g
  }
};

/**
 * Keywords to exclude from call analysis
 */
const EXCLUDED_CALLS = new Set([
  // Control flow
  'if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch', 'finally',
  // Built-ins
  'console', 'log', 'error', 'warn', 'info', 'debug',
  'print', 'println', 'printf',
  'require', 'import', 'export', 'from',
  // Common JS
  'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every',
  'push', 'pop', 'shift', 'unshift', 'slice', 'splice',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'Promise', 'resolve', 'reject', 'then', 'catch', 'finally',
  'async', 'await',
  // Common Python
  'len', 'range', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float',
  'open', 'read', 'write', 'close',
  'append', 'extend', 'update', 'get', 'keys', 'values', 'items',
  // Types
  'String', 'Number', 'Boolean', 'Array', 'Object', 'Function',
  'typeof', 'instanceof'
]);

/**
 * Detect language from file extension
 * @param {string} filePath - File path
 * @returns {string} Language name
 */
function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const langMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.go': 'go',
    '.rb': 'ruby',
    '.rs': 'rust'
  };
  return langMap[ext] || 'javascript';
}

/**
 * Extract function body from content
 * @param {string} content - File content
 * @param {string} functionName - Function name to find
 * @param {string} language - Programming language
 * @returns {object|null} Function body and line number
 */
function extractFunctionBody(content, functionName, language) {
  const lines = content.split('\n');

  // Language-specific function patterns
  const patterns = {
    javascript: [
      new RegExp(`function\\s+${functionName}\\s*\\(`),
      new RegExp(`(?:const|let|var)\\s+${functionName}\\s*=\\s*(?:async\\s*)?\\(`),
      new RegExp(`${functionName}\\s*[:=]\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>`),
      new RegExp(`${functionName}\\s*\\([^)]*\\)\\s*\\{`)
    ],
    typescript: [
      new RegExp(`function\\s+${functionName}\\s*[<(]`),
      new RegExp(`(?:const|let|var)\\s+${functionName}\\s*=\\s*(?:async\\s*)?\\(`),
      new RegExp(`${functionName}\\s*[:=]\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>`),
      new RegExp(`(?:async\\s+)?${functionName}\\s*\\([^)]*\\)\\s*(?::\\s*\\w+)?\\s*\\{`)
    ],
    python: [
      new RegExp(`def\\s+${functionName}\\s*\\(`),
      new RegExp(`async\\s+def\\s+${functionName}\\s*\\(`)
    ],
    go: [
      new RegExp(`func\\s+${functionName}\\s*\\(`),
      new RegExp(`func\\s+\\([^)]+\\)\\s+${functionName}\\s*\\(`)
    ],
    ruby: [
      new RegExp(`def\\s+${functionName}\\b`)
    ]
  };

  const langPatterns = patterns[language] || patterns.javascript;

  // Find function start
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of langPatterns) {
      if (pattern.test(lines[i])) {
        startLine = i;
        break;
      }
    }
    if (startLine >= 0) break;
  }

  if (startLine === -1) return null;

  // Extract function body (simplified - track braces/indentation)
  const bodyLines = [];
  let braceCount = 0;
  let inFunction = false;

  for (let i = startLine; i < lines.length && i < startLine + 100; i++) {
    const line = lines[i];
    bodyLines.push(line);

    if (language === 'python' || language === 'ruby') {
      // Indentation-based
      if (i > startLine && line.trim() && !line.match(/^\s/)) {
        break;
      }
    } else {
      // Brace-based
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (braceCount > 0) inFunction = true;
      if (inFunction && braceCount === 0) break;
    }
  }

  return {
    body: bodyLines.join('\n'),
    startLine: startLine + 1,
    endLine: startLine + bodyLines.length
  };
}

/**
 * Find function calls in code
 * @param {string} code - Code to analyze
 * @param {string} language - Programming language
 * @returns {object[]} Array of function calls
 */
function findFunctionCalls(code, language = 'javascript') {
  const calls = [];
  const patterns = CALL_PATTERNS[language] || CALL_PATTERNS.javascript;

  // Find regular function calls
  const funcCallPattern = patterns.functionCall;
  let match;
  funcCallPattern.lastIndex = 0;

  while ((match = funcCallPattern.exec(code)) !== null) {
    const name = match[1];
    if (!EXCLUDED_CALLS.has(name) && !name.match(/^[A-Z_]+$/)) {
      calls.push({
        name,
        type: 'function',
        position: match.index
      });
    }
  }

  // Find method calls
  const methodCallPattern = patterns.methodCall;
  methodCallPattern.lastIndex = 0;

  while ((match = methodCallPattern.exec(code)) !== null) {
    const obj = match[1];
    const method = match[2];
    if (!EXCLUDED_CALLS.has(obj) && !EXCLUDED_CALLS.has(method)) {
      calls.push({
        name: `${obj}.${method}`,
        object: obj,
        method,
        type: 'method',
        position: match.index
      });
    }
  }

  // Find async/await calls (JS/TS)
  if (patterns.asyncAwait) {
    const asyncPattern = patterns.asyncAwait;
    asyncPattern.lastIndex = 0;

    while ((match = asyncPattern.exec(code)) !== null) {
      const name = match[2] ? `${match[1]}.${match[2]}` : match[1];
      if (!EXCLUDED_CALLS.has(match[1])) {
        calls.push({
          name,
          type: 'async',
          position: match.index
        });
      }
    }
  }

  // Deduplicate by name
  const seen = new Set();
  return calls.filter(c => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
}

/**
 * Resolve a call to its file location
 * @param {object} call - Call object
 * @param {string} currentFile - Current file path
 * @param {string} projectRoot - Project root
 * @returns {string|null} Resolved file path
 */
function resolveCallLocation(call, currentFile, projectRoot) {
  // This is a simplified resolution - real resolution would need import analysis
  const callName = call.method || call.name;
  const currentDir = path.dirname(currentFile);

  // Check same directory
  const extensions = ['.js', '.ts', '.py', '.go', '.rb'];
  for (const ext of extensions) {
    const sameDirFile = path.join(currentDir, callName + ext);
    const fullPath = path.join(projectRoot, sameDirFile);
    if (fs.existsSync(fullPath)) {
      return sameDirFile;
    }
  }

  // Check common directories
  const commonDirs = ['lib', 'src', 'utils', 'helpers', 'services'];
  for (const dir of commonDirs) {
    for (const ext of extensions) {
      const filePath = path.join(dir, callName + ext);
      const fullPath = path.join(projectRoot, filePath);
      if (fs.existsSync(fullPath)) {
        return filePath;
      }
    }
  }

  return null;
}

/**
 * Trace call chain from an entry point
 * @param {string} entryFile - Entry file path (relative to project root)
 * @param {string} entryFunction - Entry function name
 * @param {string} projectRoot - Project root directory
 * @param {object} options - Options
 * @returns {object[]} Call chain
 */
function traceCallChain(entryFile, entryFunction, projectRoot, options = {}) {
  const maxDepth = options.maxDepth || 3;
  const visited = new Set();
  const chain = [];

  function trace(file, func, depth) {
    const key = `${file}:${func}`;

    if (depth > maxDepth || visited.has(key)) {
      return;
    }

    visited.add(key);

    const fullPath = path.join(projectRoot, file);
    if (!fs.existsSync(fullPath)) {
      return;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const language = detectLanguage(file);
      const funcData = extractFunctionBody(content, func, language);

      if (!funcData) {
        chain.push({
          file,
          function: func,
          depth,
          calls: [],
          status: 'not-found'
        });
        return;
      }

      const calls = findFunctionCalls(funcData.body, language);

      chain.push({
        file,
        function: func,
        depth,
        startLine: funcData.startLine,
        endLine: funcData.endLine,
        calls: calls.map(c => c.name),
        status: 'traced'
      });

      // Trace each call (up to first 5)
      for (const call of calls.slice(0, 5)) {
        const callName = call.method || call.name;
        const resolvedFile = resolveCallLocation(call, file, projectRoot);

        if (resolvedFile) {
          trace(resolvedFile, callName, depth + 1);
        }
      }
    } catch (error) {
      chain.push({
        file,
        function: func,
        depth,
        calls: [],
        status: 'error',
        error: error.message
      });
    }
  }

  trace(entryFile, entryFunction, 0);

  return chain;
}

/**
 * Format call chain as ASCII tree
 * @param {object[]} chain - Call chain from traceCallChain
 * @returns {string} ASCII tree representation
 */
function formatCallChainAscii(chain) {
  if (!chain || chain.length === 0) {
    return 'No call chain traced';
  }

  let output = '';
  const maxDepth = Math.max(...chain.map(c => c.depth));

  for (const item of chain) {
    const indent = '  '.repeat(item.depth);
    const prefix = item.depth === 0 ? '' : '├─ ';
    const status = item.status === 'traced' ? '' : ` [${item.status}]`;

    output += `${indent}${prefix}${item.function}()${status}\n`;

    if (item.startLine) {
      output += `${indent}   └─ ${item.file}:${item.startLine}\n`;
    }

    // Show immediate calls (depth 0 and 1 only)
    if (item.depth < 2 && item.calls && item.calls.length > 0) {
      const callsToShow = item.calls.slice(0, 5);
      for (let i = 0; i < callsToShow.length; i++) {
        const isLast = i === callsToShow.length - 1 && item.depth === maxDepth;
        const callPrefix = isLast ? '└─' : '├─';
        output += `${indent}   ${callPrefix} → ${callsToShow[i]}()\n`;
      }
      if (item.calls.length > 5) {
        output += `${indent}   └─ ... and ${item.calls.length - 5} more\n`;
      }
    }
  }

  return output;
}

/**
 * Generate call chain summary
 * @param {object[]} chain - Call chain from traceCallChain
 * @returns {object} Summary statistics
 */
function summarizeCallChain(chain) {
  return {
    totalFunctions: chain.length,
    maxDepth: Math.max(...chain.map(c => c.depth), 0),
    tracedSuccessfully: chain.filter(c => c.status === 'traced').length,
    notFound: chain.filter(c => c.status === 'not-found').length,
    errors: chain.filter(c => c.status === 'error').length,
    uniqueFiles: [...new Set(chain.map(c => c.file))].length,
    allCalls: [...new Set(chain.flatMap(c => c.calls || []))]
  };
}

module.exports = {
  traceCallChain,
  formatCallChainAscii,
  summarizeCallChain,
  findFunctionCalls,
  extractFunctionBody,
  detectLanguage,
  resolveCallLocation,
  CALL_PATTERNS,
  EXCLUDED_CALLS
};
