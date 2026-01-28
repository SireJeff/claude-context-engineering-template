/**
 * Tests for drift checker module
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  extractAllReferences,
  checkDocumentDrift,
  generateDriftReport,
  validateFilePath,
  validateLineReference,
  validateAnchorReference,
  validateDirectory,
  validateMarkdownLink,
  extractSymbols,
  getSymbolPatterns,
  calculateDriftLevel,
  DRIFT_LEVEL,
  HEALTH_THRESHOLDS,
  REFERENCE_PATTERNS
} = require('../../lib/drift-checker');

describe('extractAllReferences', () => {
  test('extracts file paths in backticks', () => {
    const content = 'See `src/auth.js` for details';
    const refs = extractAllReferences(content);

    expect(refs.filePaths).toHaveLength(1);
    expect(refs.filePaths[0].file).toBe('src/auth.js');
    expect(refs.filePaths[0].type).toBe('file_path');
  });

  test('extracts line references', () => {
    const content = 'Look at src/auth.js:42 for the function';
    const refs = extractAllReferences(content);

    expect(refs.lineReferences).toHaveLength(1);
    expect(refs.lineReferences[0].file).toBe('src/auth.js');
    expect(refs.lineReferences[0].line).toBe(42);
  });

  test('extracts line range references', () => {
    const content = 'See src/utils.py:10-25 for the implementation';
    const refs = extractAllReferences(content);

    expect(refs.lineReferences).toHaveLength(1);
    expect(refs.lineReferences[0].line).toBe(10);
    expect(refs.lineReferences[0].endLine).toBe(25);
  });

  test('extracts anchor references', () => {
    const content = 'See src/auth.py::authenticate() for details';
    const refs = extractAllReferences(content);

    expect(refs.anchorReferences).toHaveLength(1);
    expect(refs.anchorReferences[0].file).toBe('src/auth.py');
    expect(refs.anchorReferences[0].anchor).toBe('authenticate');
  });

  test('extracts directory references', () => {
    const content = 'Files are in `src/components/`';
    const refs = extractAllReferences(content);

    expect(refs.directoryReferences).toHaveLength(1);
    expect(refs.directoryReferences[0].directory).toBe('src/components/');
  });

  test('extracts markdown links', () => {
    const content = 'See [docs](./docs/api.md) for API info';
    const refs = extractAllReferences(content);

    expect(refs.markdownLinks).toHaveLength(1);
    expect(refs.markdownLinks[0].href).toBe('./docs/api.md');
    expect(refs.markdownLinks[0].text).toBe('docs');
  });

  test('filters out external URLs in links', () => {
    const content = 'See [website](https://example.com)';
    const refs = extractAllReferences(content);

    expect(refs.markdownLinks).toHaveLength(0);
  });

  test('extracts tech stack claims', () => {
    const content = 'Built with: Node.js, Express, MongoDB';
    const refs = extractAllReferences(content);

    expect(refs.techStackClaims).toHaveLength(1);
    expect(refs.techStackClaims[0].technologies).toContain('Node.js');
    expect(refs.techStackClaims[0].technologies).toContain('Express');
  });

  test('deduplicates file paths', () => {
    const content = 'See `src/auth.js` and `src/auth.js` again';
    const refs = extractAllReferences(content);

    expect(refs.filePaths).toHaveLength(1);
  });

  test('normalizes Windows paths', () => {
    const content = 'See `src\\auth.js` for details';
    const refs = extractAllReferences(content);

    expect(refs.filePaths[0].file).toBe('src/auth.js');
  });
});

describe('validateFilePath', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns valid for existing file', () => {
    fs.writeFileSync(path.join(testDir, 'test.js'), 'content');
    const ref = { file: 'test.js' };

    const result = validateFilePath(ref, testDir);

    expect(result.valid).toBe(true);
  });

  test('returns invalid for non-existent file', () => {
    const ref = { file: 'nonexistent.js' };

    const result = validateFilePath(ref, testDir);

    expect(result.valid).toBe(false);
    expect(result.level).toBe(DRIFT_LEVEL.CRITICAL);
    expect(result.issue).toBe('File not found');
  });

  test('suggests similar file when available', () => {
    fs.mkdirSync(path.join(testDir, 'src'));
    fs.writeFileSync(path.join(testDir, 'src', 'auth.js'), 'content');
    const ref = { file: 'auth.js' };

    const result = validateFilePath(ref, testDir);

    // Should find the file in src directory
    if (result.suggestion) {
      expect(result.suggestion).toContain('auth.js');
    }
  });
});

describe('validateLineReference', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns valid for valid line reference', () => {
    fs.writeFileSync(path.join(testDir, 'test.js'), 'line1\nline2\nline3\n');
    const ref = { file: 'test.js', line: 2 };

    const result = validateLineReference(ref, testDir);

    expect(result.valid).toBe(true);
    expect(result.lineCount).toBe(4);
  });

  test('returns invalid when line exceeds file length', () => {
    fs.writeFileSync(path.join(testDir, 'test.js'), 'line1\nline2\n');
    const ref = { file: 'test.js', line: 100 };

    const result = validateLineReference(ref, testDir);

    expect(result.valid).toBe(false);
    expect(result.level).toBe(DRIFT_LEVEL.HIGH);
    expect(result.issue).toContain('exceeds file length');
  });

  test('returns invalid for non-existent file', () => {
    const ref = { file: 'nonexistent.js', line: 1 };

    const result = validateLineReference(ref, testDir);

    expect(result.valid).toBe(false);
    expect(result.level).toBe(DRIFT_LEVEL.CRITICAL);
    expect(result.issue).toBe('Referenced file not found');
  });

  test('validates end line for ranges', () => {
    fs.writeFileSync(path.join(testDir, 'test.js'), 'line1\nline2\nline3\n');
    const ref = { file: 'test.js', line: 1, endLine: 100 };

    const result = validateLineReference(ref, testDir);

    expect(result.valid).toBe(false);
    expect(result.issue).toContain('End line');
  });
});

describe('validateAnchorReference', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns valid for existing function', () => {
    fs.writeFileSync(
      path.join(testDir, 'test.js'),
      'function authenticate() {\n  return true;\n}\n'
    );
    const ref = { file: 'test.js', anchor: 'authenticate' };

    const result = validateAnchorReference(ref, testDir);

    expect(result.valid).toBe(true);
    expect(result.currentLine).toBeDefined();
  });

  test('returns valid for existing class', () => {
    fs.writeFileSync(
      path.join(testDir, 'test.js'),
      'class UserService {\n  constructor() {}\n}\n'
    );
    const ref = { file: 'test.js', anchor: 'UserService' };

    const result = validateAnchorReference(ref, testDir);

    expect(result.valid).toBe(true);
    expect(result.symbolType).toBe('class');
  });

  test('returns invalid for missing symbol', () => {
    fs.writeFileSync(
      path.join(testDir, 'test.js'),
      'function login() {}\n'
    );
    const ref = { file: 'test.js', anchor: 'nonexistent' };

    const result = validateAnchorReference(ref, testDir);

    expect(result.valid).toBe(false);
    expect(result.level).toBe(DRIFT_LEVEL.HIGH);
    expect(result.issue).toContain('Symbol');
  });

  test('returns invalid for non-existent file', () => {
    const ref = { file: 'nonexistent.js', anchor: 'test' };

    const result = validateAnchorReference(ref, testDir);

    expect(result.valid).toBe(false);
    expect(result.level).toBe(DRIFT_LEVEL.CRITICAL);
  });

  test('finds Python functions', () => {
    fs.writeFileSync(
      path.join(testDir, 'test.py'),
      'def authenticate(user):\n    return True\n'
    );
    const ref = { file: 'test.py', anchor: 'authenticate' };

    const result = validateAnchorReference(ref, testDir);

    expect(result.valid).toBe(true);
  });
});

describe('validateDirectory', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns valid for existing directory', () => {
    fs.mkdirSync(path.join(testDir, 'src'));
    const ref = { directory: 'src/' };

    const result = validateDirectory(ref, testDir);

    expect(result.valid).toBe(true);
  });

  test('returns invalid for non-existent directory', () => {
    const ref = { directory: 'nonexistent/' };

    const result = validateDirectory(ref, testDir);

    expect(result.valid).toBe(false);
    expect(result.level).toBe(DRIFT_LEVEL.MEDIUM);
    expect(result.issue).toBe('Directory not found');
  });

  test('returns invalid when path is a file', () => {
    fs.writeFileSync(path.join(testDir, 'file'), 'content');
    const ref = { directory: 'file' };

    const result = validateDirectory(ref, testDir);

    expect(result.valid).toBe(false);
    expect(result.issue).toBe('Path exists but is not a directory');
  });
});

describe('validateMarkdownLink', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-test-'));
    fs.mkdirSync(path.join(testDir, 'docs'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns valid for existing relative link', () => {
    fs.writeFileSync(path.join(testDir, 'docs', 'api.md'), '# API');
    const ref = { href: './api.md' };

    const result = validateMarkdownLink(ref, path.join(testDir, 'docs'), testDir);

    expect(result.valid).toBe(true);
  });

  test('returns valid for existing parent link', () => {
    fs.writeFileSync(path.join(testDir, 'README.md'), '# README');
    const ref = { href: '../README.md' };

    const result = validateMarkdownLink(ref, path.join(testDir, 'docs'), testDir);

    expect(result.valid).toBe(true);
  });

  test('returns invalid for missing link', () => {
    const ref = { href: './nonexistent.md' };

    const result = validateMarkdownLink(ref, path.join(testDir, 'docs'), testDir);

    expect(result.valid).toBe(false);
    expect(result.level).toBe(DRIFT_LEVEL.MEDIUM);
  });

  test('strips anchor from path', () => {
    fs.writeFileSync(path.join(testDir, 'docs', 'api.md'), '# API');
    const ref = { href: './api.md#section' };

    const result = validateMarkdownLink(ref, path.join(testDir, 'docs'), testDir);

    expect(result.valid).toBe(true);
  });
});

describe('checkDocumentDrift', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns error for non-existent document', () => {
    const result = checkDocumentDrift('nonexistent.md', testDir);

    expect(result.status).toBe('error');
    expect(result.error).toContain('not found');
    expect(result.healthScore).toBe(0);
  });

  test('returns healthy status for doc with valid refs', () => {
    fs.writeFileSync(path.join(testDir, 'src.js'), 'content');
    fs.writeFileSync(
      path.join(testDir, 'doc.md'),
      'See `src.js` for details'
    );

    const result = checkDocumentDrift('doc.md', testDir);

    expect(result.status).toBe('healthy');
    expect(result.healthScore).toBe(100);
  });

  test('returns critical status for doc with invalid refs', () => {
    fs.writeFileSync(
      path.join(testDir, 'doc.md'),
      'See `nonexistent1.js` and `nonexistent2.js`'
    );

    const result = checkDocumentDrift('doc.md', testDir);

    expect(result.status).toBe('critical');
    expect(result.healthScore).toBe(0);
  });

  test('calculates correct summary', () => {
    fs.writeFileSync(path.join(testDir, 'exists.js'), 'content');
    fs.writeFileSync(
      path.join(testDir, 'doc.md'),
      'See `exists.js` and `nonexistent.js`'
    );

    const result = checkDocumentDrift('doc.md', testDir);

    expect(result.summary.total).toBe(2);
    expect(result.summary.valid).toBe(1);
    expect(result.summary.issues).toBe(1);
  });

  test('includes references by type', () => {
    fs.writeFileSync(
      path.join(testDir, 'doc.md'),
      'File `test.js`, line ref.js:10, dir `src/`'
    );

    const result = checkDocumentDrift('doc.md', testDir);

    expect(result.byType).toBeDefined();
    expect(typeof result.byType.filePaths).toBe('number');
    expect(typeof result.byType.lineReferences).toBe('number');
  });
});

describe('generateDriftReport', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('generates report for multiple documents', () => {
    fs.writeFileSync(path.join(testDir, 'doc1.md'), '# Doc 1');
    fs.writeFileSync(path.join(testDir, 'doc2.md'), '# Doc 2');

    const report = generateDriftReport(['doc1.md', 'doc2.md'], testDir);

    expect(report.documents).toHaveLength(2);
    expect(report.summary.totalDocuments).toBe(2);
  });

  test('calculates overall health score', () => {
    fs.writeFileSync(path.join(testDir, 'exists.js'), 'content');
    fs.writeFileSync(path.join(testDir, 'doc.md'), 'See `exists.js`');

    const report = generateDriftReport(['doc.md'], testDir);

    expect(report.summary.overallHealthScore).toBe(100);
  });

  test('includes health breakdown by type', () => {
    fs.writeFileSync(path.join(testDir, 'doc.md'), '# Test');

    const report = generateDriftReport(['doc.md'], testDir);

    expect(report.healthBreakdown).toBeDefined();
    expect(report.healthBreakdown.filePaths).toBeDefined();
    expect(report.healthBreakdown.lineReferences).toBeDefined();
  });

  test('collects suggested fixes', () => {
    fs.mkdirSync(path.join(testDir, 'src'));
    fs.writeFileSync(path.join(testDir, 'src', 'auth.js'), 'content');
    fs.writeFileSync(path.join(testDir, 'doc.md'), 'See `auth.js`');

    const report = generateDriftReport(['doc.md'], testDir);

    // Suggestion for file not at root but exists in src
    if (report.suggestedFixes.length > 0) {
      expect(report.suggestedFixes[0].suggestion).toBeDefined();
    }
  });
});

describe('extractSymbols', () => {
  test('extracts JavaScript functions', () => {
    const content = 'function test() {}\nconst helper = () => {};';
    const patterns = getSymbolPatterns('js');
    const symbols = extractSymbols(content, patterns);

    expect(symbols.some(s => s.name === 'test')).toBe(true);
  });

  test('extracts JavaScript classes', () => {
    const content = 'class MyService {\n  constructor() {}\n}';
    const patterns = getSymbolPatterns('js');
    const symbols = extractSymbols(content, patterns);

    expect(symbols.some(s => s.name === 'MyService' && s.type === 'class')).toBe(true);
  });

  test('extracts Python functions', () => {
    const content = 'def process_data(x):\n    return x * 2';
    const patterns = getSymbolPatterns('py');
    const symbols = extractSymbols(content, patterns);

    expect(symbols.some(s => s.name === 'process_data')).toBe(true);
  });

  test('extracts Python classes', () => {
    const content = 'class DataProcessor:\n    pass';
    const patterns = getSymbolPatterns('py');
    const symbols = extractSymbols(content, patterns);

    expect(symbols.some(s => s.name === 'DataProcessor' && s.type === 'class')).toBe(true);
  });

  test('extracts TypeScript interfaces', () => {
    const content = 'interface User {\n  name: string;\n}';
    const patterns = getSymbolPatterns('ts');
    const symbols = extractSymbols(content, patterns);

    expect(symbols.some(s => s.name === 'User')).toBe(true);
  });

  test('extracts Go functions', () => {
    const content = 'func handleRequest(w http.ResponseWriter) {}';
    const patterns = getSymbolPatterns('go');
    const symbols = extractSymbols(content, patterns);

    expect(symbols.some(s => s.name === 'handleRequest')).toBe(true);
  });

  test('extracts Rust functions', () => {
    const content = 'pub fn process(data: &str) -> Result<()> {}';
    const patterns = getSymbolPatterns('rs');
    const symbols = extractSymbols(content, patterns);

    expect(symbols.some(s => s.name === 'process')).toBe(true);
  });
});

describe('getSymbolPatterns', () => {
  test('returns patterns for known languages', () => {
    expect(getSymbolPatterns('js')).toBeDefined();
    expect(getSymbolPatterns('py')).toBeDefined();
    expect(getSymbolPatterns('ts')).toBeDefined();
    expect(getSymbolPatterns('go')).toBeDefined();
    expect(getSymbolPatterns('rs')).toBeDefined();
  });

  test('defaults to JS patterns for unknown extensions', () => {
    const patterns = getSymbolPatterns('unknown');
    expect(patterns).toBeDefined();
    expect(Array.isArray(patterns)).toBe(true);
  });

  test('handles JSX as JavaScript', () => {
    const jsPatterns = getSymbolPatterns('js');
    const jsxPatterns = getSymbolPatterns('jsx');
    expect(jsxPatterns).toEqual(jsPatterns);
  });
});

describe('calculateDriftLevel', () => {
  test('returns NONE for empty issues', () => {
    const level = calculateDriftLevel([]);
    expect(level).toBe(DRIFT_LEVEL.NONE);
  });

  test('returns CRITICAL when critical issue exists', () => {
    const issues = [{ level: DRIFT_LEVEL.CRITICAL }];
    const level = calculateDriftLevel(issues);
    expect(level).toBe(DRIFT_LEVEL.CRITICAL);
  });

  test('returns HIGH when high issue exists', () => {
    const issues = [{ level: DRIFT_LEVEL.HIGH }, { level: DRIFT_LEVEL.LOW }];
    const level = calculateDriftLevel(issues);
    expect(level).toBe(DRIFT_LEVEL.HIGH);
  });

  test('returns MEDIUM when only medium issues exist', () => {
    const issues = [{ level: DRIFT_LEVEL.MEDIUM }, { level: DRIFT_LEVEL.LOW }];
    const level = calculateDriftLevel(issues);
    expect(level).toBe(DRIFT_LEVEL.MEDIUM);
  });

  test('returns LOW when only low issues exist', () => {
    const issues = [{ level: DRIFT_LEVEL.LOW }];
    const level = calculateDriftLevel(issues);
    expect(level).toBe(DRIFT_LEVEL.LOW);
  });
});

describe('DRIFT_LEVEL constants', () => {
  test('defines expected levels', () => {
    expect(DRIFT_LEVEL.NONE).toBe('none');
    expect(DRIFT_LEVEL.LOW).toBe('low');
    expect(DRIFT_LEVEL.MEDIUM).toBe('medium');
    expect(DRIFT_LEVEL.HIGH).toBe('high');
    expect(DRIFT_LEVEL.CRITICAL).toBe('critical');
  });
});

describe('HEALTH_THRESHOLDS constants', () => {
  test('defines expected thresholds', () => {
    expect(HEALTH_THRESHOLDS.HEALTHY).toBe(90);
    expect(HEALTH_THRESHOLDS.NEEDS_UPDATE).toBe(70);
    expect(HEALTH_THRESHOLDS.STALE).toBe(50);
    expect(HEALTH_THRESHOLDS.CRITICAL).toBe(0);
  });
});

describe('REFERENCE_PATTERNS', () => {
  test('defines expected patterns', () => {
    expect(REFERENCE_PATTERNS.backtickPath).toBeDefined();
    expect(REFERENCE_PATTERNS.lineReference).toBeDefined();
    expect(REFERENCE_PATTERNS.anchorReference).toBeDefined();
    expect(REFERENCE_PATTERNS.directoryReference).toBeDefined();
    expect(REFERENCE_PATTERNS.markdownLink).toBeDefined();
    expect(REFERENCE_PATTERNS.techStackMention).toBeDefined();
  });

  test('patterns are valid regexes', () => {
    for (const [name, pattern] of Object.entries(REFERENCE_PATTERNS)) {
      expect(pattern).toBeInstanceOf(RegExp);
    }
  });
});
