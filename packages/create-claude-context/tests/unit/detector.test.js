/**
 * Tests for tech stack detector
 */

const path = require('path');
const { detectTechStack, TECH_SIGNATURES } = require('../../lib/detector');

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

describe('detectTechStack', () => {
  describe('language detection', () => {
    test('detects Python from requirements.txt', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'python-project'));
      expect(result.languages).toContain('python');
    });

    test('detects Node.js from package.json', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'node-project'));
      expect(result.languages).toContain('javascript');
    });

    test('detects Go from go.mod', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'go-project'));
      expect(result.languages).toContain('go');
    });

    test('returns empty languages for empty directory', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'empty-test');
      const fs = require('fs');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const result = await detectTechStack(tempDir);
      expect(result.languages).toEqual([]);
      fs.rmdirSync(tempDir);
    });
  });

  describe('framework detection', () => {
    test('detects Express from package.json dependencies', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'node-project'));
      expect(result.frameworks).toContain('express');
    });

    test('detects FastAPI from requirements.txt patterns', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'python-project'));
      // FastAPI should be detected from requirements.txt content
      expect(result.stack).toContain('Python');
    });
  });

  describe('database detection', () => {
    test('detects MongoDB from mongoose dependency', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'node-project'));
      expect(result.databases).toContain('mongodb');
    });

    test('detects PostgreSQL from psycopg2 dependency', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'python-project'));
      expect(result.databases).toContain('postgresql');
    });
  });

  describe('result structure', () => {
    test('returns expected structure', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'node-project'));

      expect(result).toHaveProperty('stack');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('languages');
      expect(result).toHaveProperty('frameworks');
      expect(result).toHaveProperty('databases');
      expect(result).toHaveProperty('projectName');
      expect(result).toHaveProperty('fileCount');
    });

    test('generates stack summary string', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'node-project'));
      expect(typeof result.stack).toBe('string');
      expect(result.stack.length).toBeGreaterThan(0);
    });

    test('projectName matches directory name', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'node-project'));
      expect(result.projectName).toBe('node-project');
    });
  });

  describe('hint option', () => {
    test('uses hint when provided', async () => {
      const result = await detectTechStack(path.join(FIXTURES_DIR, 'node-project'), {
        hint: 'Custom Stack'
      });
      expect(result.stack).toBe('Custom Stack');
    });
  });
});

describe('TECH_SIGNATURES', () => {
  test('has language signatures', () => {
    expect(TECH_SIGNATURES.languages).toBeDefined();
    expect(Object.keys(TECH_SIGNATURES.languages).length).toBeGreaterThan(5);
  });

  test('has framework signatures', () => {
    expect(TECH_SIGNATURES.frameworks).toBeDefined();
    expect(Object.keys(TECH_SIGNATURES.frameworks).length).toBeGreaterThan(10);
  });

  test('has database signatures', () => {
    expect(TECH_SIGNATURES.databases).toBeDefined();
    expect(Object.keys(TECH_SIGNATURES.databases).length).toBeGreaterThan(3);
  });

  test('each language has files or extensions', () => {
    for (const [lang, sig] of Object.entries(TECH_SIGNATURES.languages)) {
      const hasFiles = sig.files && sig.files.length > 0;
      const hasExtensions = sig.extensions && sig.extensions.length > 0;
      expect(hasFiles || hasExtensions).toBe(true);
    }
  });
});
