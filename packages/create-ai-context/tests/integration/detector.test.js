/**
 * Integration tests for the detector module
 */

const path = require('path');
const {
  detectTechStack,
  detectEntryPoints,
  countLinesOfCode,
  countProjectLOC,
  classifyFilePurpose,
  analyzeFilePurposes,
} = require('../../lib/detector');

const EXPRESS_FIXTURE = path.join(__dirname, '../../test-fixtures/express-app');
const FASTAPI_FIXTURE = path.join(__dirname, '../../test-fixtures/fastapi-app');

describe('detector', () => {
  describe('detectTechStack', () => {
    test('detects Express.js project correctly', async () => {
      const result = await detectTechStack(EXPRESS_FIXTURE);

      expect(result.languages).toContain('javascript');
      expect(result.frameworks).toContain('express');
      expect(result.databases).toContain('mongodb');
      expect(result.summary).toMatch(/javascript/i);
    });

    test('detects FastAPI project correctly', async () => {
      const result = await detectTechStack(FASTAPI_FIXTURE);

      expect(result.languages).toContain('python');
      expect(result.frameworks).toContain('fastapi');
      expect(result.summary).toMatch(/python/i);
    });

    test('includes LOC statistics', async () => {
      const result = await detectTechStack(EXPRESS_FIXTURE);

      expect(result.loc).toBeDefined();
      expect(result.loc.total).toBeGreaterThan(0);
      expect(result.loc.code).toBeGreaterThan(0);
      expect(result.loc.files).toBeGreaterThan(0);
    });

    test('includes file purpose analysis', async () => {
      const result = await detectTechStack(EXPRESS_FIXTURE);

      expect(result.filePurposes).toBeDefined();
      expect(result.filePurposes.counts).toBeDefined();
      expect(Object.keys(result.filePurposes.counts).length).toBeGreaterThan(0);
    });
  });

  describe('detectEntryPoints', () => {
    test('detects Express routes', async () => {
      const entryPoints = await detectEntryPoints(EXPRESS_FIXTURE, ['express']);

      expect(entryPoints.length).toBeGreaterThan(0);
      expect(entryPoints.some(ep => ep.method === 'GET')).toBe(true);
    });
  });

  describe('countLinesOfCode', () => {
    test('counts lines correctly', () => {
      const testFile = path.join(EXPRESS_FIXTURE, 'src/app.js');
      const result = countLinesOfCode(testFile);

      expect(result.total).toBeGreaterThan(0);
      expect(result.code).toBeGreaterThan(0);
      expect(result.code).toBeLessThanOrEqual(result.total);
    });

    test('handles non-existent files gracefully', () => {
      const result = countLinesOfCode('/nonexistent/file.js');

      expect(result.total).toBe(0);
      expect(result.code).toBe(0);
    });
  });

  describe('countProjectLOC', () => {
    test('counts project LOC correctly', async () => {
      const result = await countProjectLOC(EXPRESS_FIXTURE, ['.js']);

      expect(result.total).toBeGreaterThan(0);
      expect(result.files).toBeGreaterThan(0);
      expect(result.byLanguage['.js']).toBeDefined();
    });
  });

  describe('classifyFilePurpose', () => {
    test('classifies controller files', () => {
      expect(classifyFilePurpose('src/controllers/userController.js')).toBe('controller');
      expect(classifyFilePurpose('app/handlers/auth.py')).toBe('controller');
    });

    test('classifies model files', () => {
      expect(classifyFilePurpose('src/models/User.js')).toBe('model');
      expect(classifyFilePurpose('app/entities/Product.py')).toBe('model');
    });

    test('classifies service files', () => {
      expect(classifyFilePurpose('src/services/emailService.js')).toBe('service');
    });

    test('classifies middleware files', () => {
      expect(classifyFilePurpose('src/middleware/auth.js')).toBe('middleware');
    });

    test('classifies config files', () => {
      expect(classifyFilePurpose('src/config/database.js')).toBe('config');
    });

    test('classifies test files', () => {
      expect(classifyFilePurpose('tests/auth.test.js')).toBe('test');
      expect(classifyFilePurpose('__tests__/user.spec.ts')).toBe('test');
    });

    test('classifies route files', () => {
      expect(classifyFilePurpose('src/routes/users.js')).toBe('route');
    });

    test('returns other for unknown files', () => {
      expect(classifyFilePurpose('src/index.js')).toBe('other');
    });
  });

  describe('analyzeFilePurposes', () => {
    test('analyzes file purposes in project', async () => {
      const result = await analyzeFilePurposes(EXPRESS_FIXTURE, ['.js']);

      expect(result.counts).toBeDefined();
      expect(result.files).toBeDefined();
      expect(result.counts.controller).toBeGreaterThan(0);
      expect(result.counts.model).toBeGreaterThan(0);
    });
  });
});
