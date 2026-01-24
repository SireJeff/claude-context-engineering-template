/**
 * Unit tests for call-tracer.js
 */

const path = require('path');
const fs = require('fs');

jest.mock('fs');

const {
  traceCallChain,
  formatCallChainAscii,
  summarizeCallChain,
  findFunctionCalls,
  extractFunctionBody,
  detectLanguage,
  resolveCallLocation,
  CALL_PATTERNS,
  EXCLUDED_CALLS
} = require('../../lib/call-tracer');

describe('call-tracer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('');
  });

  describe('detectLanguage', () => {
    it('should detect JavaScript', () => {
      expect(detectLanguage('file.js')).toBe('javascript');
      expect(detectLanguage('file.jsx')).toBe('javascript');
      expect(detectLanguage('file.mjs')).toBe('javascript');
    });

    it('should detect TypeScript', () => {
      expect(detectLanguage('file.ts')).toBe('typescript');
      expect(detectLanguage('file.tsx')).toBe('typescript');
    });

    it('should detect Python', () => {
      expect(detectLanguage('file.py')).toBe('python');
    });

    it('should detect Go', () => {
      expect(detectLanguage('file.go')).toBe('go');
    });

    it('should detect Ruby', () => {
      expect(detectLanguage('file.rb')).toBe('ruby');
    });

    it('should default to JavaScript for unknown extensions', () => {
      expect(detectLanguage('file.xyz')).toBe('javascript');
    });
  });

  describe('findFunctionCalls', () => {
    it('should find function calls in JavaScript', () => {
      const code = `
        const result = processData();
        saveToDatabase(result);
        sendNotification();
      `;

      const calls = findFunctionCalls(code, 'javascript');

      expect(calls.find(c => c.name === 'processData')).toBeDefined();
      expect(calls.find(c => c.name === 'saveToDatabase')).toBeDefined();
      expect(calls.find(c => c.name === 'sendNotification')).toBeDefined();
    });

    it('should find method calls', () => {
      const code = `
        user.save();
        database.query('SELECT *');
      `;

      const calls = findFunctionCalls(code, 'javascript');

      expect(calls.find(c => c.name === 'user.save')).toBeDefined();
      expect(calls.find(c => c.name === 'database.query')).toBeDefined();
    });

    it('should exclude built-in functions', () => {
      const code = `
        console.log('test');
        array.map(x => x);
        array.filter(x => true);
      `;

      const calls = findFunctionCalls(code, 'javascript');

      expect(calls.find(c => c.name === 'console.log')).toBeUndefined();
      expect(calls.find(c => c.name.includes('map'))).toBeUndefined();
    });

    it('should exclude control flow keywords', () => {
      const code = `
        if (condition) {
          for (i = 0; i < 10; i++) {
            while (true) {}
          }
        }
      `;

      const calls = findFunctionCalls(code, 'javascript');

      expect(calls.find(c => c.name === 'if')).toBeUndefined();
      expect(calls.find(c => c.name === 'for')).toBeUndefined();
      expect(calls.find(c => c.name === 'while')).toBeUndefined();
    });

    it('should deduplicate calls', () => {
      const code = `
        doSomething();
        doSomething();
        doSomething();
      `;

      const calls = findFunctionCalls(code, 'javascript');
      const doSomethingCalls = calls.filter(c => c.name === 'doSomething');

      expect(doSomethingCalls.length).toBe(1);
    });

    it('should find async/await calls', () => {
      const code = `
        const data = await fetchData();
        await user.save();
      `;

      const calls = findFunctionCalls(code, 'javascript');

      expect(calls.find(c => c.name === 'fetchData')).toBeDefined();
      expect(calls.find(c => c.name === 'user.save')).toBeDefined();
    });
  });

  describe('extractFunctionBody', () => {
    it('should extract JavaScript function body', () => {
      const content = `
function processUser() {
  const user = getUser();
  validateUser(user);
  return user;
}

function otherFunction() {}
      `;

      const result = extractFunctionBody(content, 'processUser', 'javascript');

      expect(result).not.toBeNull();
      expect(result.body).toContain('getUser');
      expect(result.body).toContain('validateUser');
      expect(result.startLine).toBeGreaterThan(0);
    });

    it('should extract arrow function body', () => {
      const content = `
const processUser = (data) => {
  return transform(data);
};
      `;

      const result = extractFunctionBody(content, 'processUser', 'javascript');

      expect(result).not.toBeNull();
      expect(result.body).toContain('transform');
    });

    it('should extract Python function body', () => {
      const content = `
def process_user():
    user = get_user()
    validate_user(user)
    return user

def other_function():
    pass
      `;

      const result = extractFunctionBody(content, 'process_user', 'python');

      expect(result).not.toBeNull();
      expect(result.body).toContain('get_user');
    });

    it('should return null for non-existent function', () => {
      const content = `function foo() {}`;

      const result = extractFunctionBody(content, 'bar', 'javascript');

      expect(result).toBeNull();
    });
  });

  describe('traceCallChain', () => {
    it('should trace function calls', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(`
function main() {
  processData();
  saveResult();
}
      `);

      const chain = traceCallChain('main.js', 'main', '/project');

      expect(chain.length).toBeGreaterThan(0);
      expect(chain[0].function).toBe('main');
      expect(chain[0].calls).toContain('processData');
    });

    it('should respect max depth', () => {
      fs.readFileSync.mockReturnValue(`
function level1() { level2(); }
function level2() { level3(); }
function level3() { level4(); }
function level4() { level5(); }
      `);

      const chain = traceCallChain('file.js', 'level1', '/project', { maxDepth: 2 });

      const maxDepth = Math.max(...chain.map(c => c.depth));
      expect(maxDepth).toBeLessThanOrEqual(2);
    });

    it('should handle missing files', () => {
      fs.existsSync.mockReturnValue(false);

      const chain = traceCallChain('missing.js', 'func', '/project');

      expect(chain).toEqual([]);
    });

    it('should handle file read errors', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const chain = traceCallChain('file.js', 'func', '/project');

      expect(chain[0].status).toBe('error');
    });
  });

  describe('formatCallChainAscii', () => {
    it('should format empty chain', () => {
      const result = formatCallChainAscii([]);

      expect(result).toBe('No call chain traced');
    });

    it('should format single function', () => {
      const chain = [
        { file: 'main.js', function: 'main', depth: 0, calls: ['helper'], status: 'traced', startLine: 10 }
      ];

      const result = formatCallChainAscii(chain);

      expect(result).toContain('main()');
      expect(result).toContain('main.js:10');
    });

    it('should format nested calls', () => {
      const chain = [
        { file: 'main.js', function: 'main', depth: 0, calls: ['helper'], status: 'traced' },
        { file: 'helper.js', function: 'helper', depth: 1, calls: [], status: 'traced' }
      ];

      const result = formatCallChainAscii(chain);

      expect(result).toContain('main()');
      expect(result).toContain('helper()');
    });

    it('should indicate not-found status', () => {
      const chain = [
        { file: 'main.js', function: 'missing', depth: 0, calls: [], status: 'not-found' }
      ];

      const result = formatCallChainAscii(chain);

      expect(result).toContain('[not-found]');
    });
  });

  describe('summarizeCallChain', () => {
    it('should calculate summary statistics', () => {
      const chain = [
        { file: 'a.js', function: 'a', depth: 0, calls: ['b', 'c'], status: 'traced' },
        { file: 'b.js', function: 'b', depth: 1, calls: ['d'], status: 'traced' },
        { file: 'c.js', function: 'c', depth: 1, calls: [], status: 'not-found' }
      ];

      const summary = summarizeCallChain(chain);

      expect(summary.totalFunctions).toBe(3);
      expect(summary.maxDepth).toBe(1);
      expect(summary.tracedSuccessfully).toBe(2);
      expect(summary.notFound).toBe(1);
      expect(summary.uniqueFiles).toBe(3);
    });

    it('should collect all unique calls', () => {
      const chain = [
        { file: 'a.js', function: 'a', depth: 0, calls: ['helper', 'util'], status: 'traced' },
        { file: 'b.js', function: 'b', depth: 1, calls: ['helper', 'other'], status: 'traced' }
      ];

      const summary = summarizeCallChain(chain);

      expect(summary.allCalls).toContain('helper');
      expect(summary.allCalls).toContain('util');
      expect(summary.allCalls).toContain('other');
    });
  });

  describe('resolveCallLocation', () => {
    it('should find file in same directory', () => {
      fs.existsSync.mockImplementation(p => p.includes('helper.js'));

      const result = resolveCallLocation(
        { name: 'helper' },
        'src/main.js',
        '/project'
      );

      expect(result).toContain('helper');
    });

    it('should return null for unresolved calls', () => {
      fs.existsSync.mockReturnValue(false);

      const result = resolveCallLocation(
        { name: 'unknownFunction' },
        'src/main.js',
        '/project'
      );

      expect(result).toBeNull();
    });
  });

  describe('constants', () => {
    it('should have call patterns for common languages', () => {
      expect(CALL_PATTERNS.javascript).toBeDefined();
      expect(CALL_PATTERNS.typescript).toBeDefined();
      expect(CALL_PATTERNS.python).toBeDefined();
      expect(CALL_PATTERNS.go).toBeDefined();
    });

    it('should exclude common built-ins', () => {
      expect(EXCLUDED_CALLS.has('console')).toBe(true);
      expect(EXCLUDED_CALLS.has('log')).toBe(true);
      expect(EXCLUDED_CALLS.has('map')).toBe(true);
      expect(EXCLUDED_CALLS.has('filter')).toBe(true);
    });
  });
});
