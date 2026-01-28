/**
 * Integration tests for the placeholder module
 */

const path = require('path');
const fs = require('fs');
const {
  replacePlaceholders,
  findPlaceholders,
  getDefaultValues,
} = require('../../lib/placeholder');

const EXPRESS_FIXTURE = path.join(__dirname, '../../test-fixtures/express-app');

describe('placeholder', () => {
  describe('getDefaultValues', () => {
    test('generates default values with empty inputs', () => {
      const values = getDefaultValues();

      expect(values.PROJECT_NAME).toBe('my-project');
      expect(values.DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(values.INSTALL_COMMAND).toBe('npm install');
    });

    test('uses project name from config', () => {
      const config = { projectName: 'test-app' };
      const values = getDefaultValues(config);

      expect(values.PROJECT_NAME).toBe('test-app');
      expect(values.PROJECT_SLUG).toBe('test-app');
    });

    test('generates correct commands for Python projects', () => {
      const techStack = { languages: ['python'] };
      const values = getDefaultValues({}, techStack);

      expect(values.INSTALL_COMMAND).toBe('pip install -r requirements.txt');
      expect(values.TEST_COMMAND).toBe('pytest');
    });

    test('generates correct commands for Go projects', () => {
      const techStack = { languages: ['go'] };
      const values = getDefaultValues({}, techStack);

      expect(values.INSTALL_COMMAND).toBe('go mod download');
      expect(values.TEST_COMMAND).toBe('go test ./...');
    });

    test('generates correct commands for Rust projects', () => {
      const techStack = { languages: ['rust'] };
      const values = getDefaultValues({}, techStack);

      expect(values.INSTALL_COMMAND).toBe('cargo build');
      expect(values.TEST_COMMAND).toBe('cargo test');
    });

    test('uses tech stack summary', () => {
      const techStack = { summary: 'Python + FastAPI + PostgreSQL' };
      const values = getDefaultValues({}, techStack);

      expect(values.TECH_STACK).toBe('Python + FastAPI + PostgreSQL');
    });

    test('builds core files list from analysis', () => {
      const analysis = {
        entryPoints: [
          { file: 'src/app.js' },
          { file: 'src/routes/users.js' },
        ]
      };
      const values = getDefaultValues({}, {}, analysis);

      expect(values.CORE_FILES_LIST).toContain('src/app.js');
    });

    test('uses workflow count from analysis', () => {
      const analysis = {
        workflows: [
          { name: 'Auth' },
          { name: 'Users' },
          { name: 'Products' },
        ]
      };
      const values = getDefaultValues({}, {}, analysis);

      expect(values.WORKFLOWS_COUNT).toBe('3');
    });

    test('includes LOC values from tech stack', () => {
      const techStack = {
        loc: { total: 1000, code: 800, files: 20 }
      };
      const values = getDefaultValues({}, techStack);

      expect(values.LINES_OF_CODE).toBe('800');
      expect(values.SOURCE_FILES_COUNT).toBe('20');
    });

    test('generates language-specific search patterns', () => {
      const pythonValues = getDefaultValues({}, { languages: ['python'] });
      expect(pythonValues.CONFIG_SEARCH_PATTERN).toContain('os.environ');

      const goValues = getDefaultValues({}, { languages: ['go'] });
      expect(goValues.CONFIG_SEARCH_PATTERN).toContain('os.Getenv');

      const jsValues = getDefaultValues({}, { languages: ['javascript'] });
      expect(jsValues.CONFIG_SEARCH_PATTERN).toContain('process.env');
    });

    test('builds external integrations from databases', () => {
      const techStack = { databases: ['postgresql', 'redis'] };
      const values = getDefaultValues({}, techStack);

      expect(values.EXTERNAL_INTEGRATIONS_LIST).toContain('Postgresql');
      expect(values.EXTERNAL_INTEGRATIONS_LIST).toContain('Redis');
    });

    test('builds production services from tech stack', () => {
      const techStack = {
        frameworks: ['express'],
        databases: ['mongodb', 'redis']
      };
      const values = getDefaultValues({}, techStack);

      expect(values.PRODUCTION_SERVICES).toContain('Web');
      expect(values.PRODUCTION_SERVICES).toContain('API');
      expect(values.PRODUCTION_SERVICES).toContain('Database');
      expect(values.PRODUCTION_SERVICES).toContain('Cache');
    });

    test('generates framework-specific example tasks', () => {
      const expressValues = getDefaultValues({}, { frameworks: ['express'] });
      expect(expressValues.EXAMPLE_REFACTOR_TASK).toContain('middleware');

      const fastapiValues = getDefaultValues({}, { frameworks: ['fastapi'] });
      expect(fastapiValues.EXAMPLE_REFACTOR_TASK).toContain('dependency');
    });

    test('includes primary language and framework', () => {
      const techStack = {
        languages: ['python', 'javascript'],
        frameworks: ['fastapi', 'react']
      };
      const values = getDefaultValues({}, techStack);

      expect(values.PRIMARY_LANGUAGE).toBe('python');
      expect(values.PRIMARY_FRAMEWORK).toBe('fastapi');
    });
  });

  describe('findPlaceholders', () => {
    test('finds placeholders in content', () => {
      const tempFile = path.join(__dirname, 'temp-test.md');
      fs.writeFileSync(tempFile, '# {{PROJECT_NAME}}\n\nUsing {{TECH_STACK}}');

      try {
        const placeholders = findPlaceholders(tempFile);

        expect(placeholders.length).toBe(2);
        expect(placeholders.some(p => p.name === 'PROJECT_NAME')).toBe(true);
        expect(placeholders.some(p => p.name === 'TECH_STACK')).toBe(true);
      } finally {
        fs.unlinkSync(tempFile);
      }
    });

    test('marks known placeholders', () => {
      const tempFile = path.join(__dirname, 'temp-test.md');
      fs.writeFileSync(tempFile, '{{PROJECT_NAME}} {{UNKNOWN_PLACEHOLDER}}');

      try {
        const placeholders = findPlaceholders(tempFile);

        const knownPh = placeholders.find(p => p.name === 'PROJECT_NAME');
        const unknownPh = placeholders.find(p => p.name === 'UNKNOWN_PLACEHOLDER');

        expect(knownPh.known).toBe(true);
        expect(unknownPh.known).toBe(false);
      } finally {
        fs.unlinkSync(tempFile);
      }
    });
  });
});
