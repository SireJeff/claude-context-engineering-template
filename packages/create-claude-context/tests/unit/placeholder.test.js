/**
 * Tests for placeholder replacement engine
 */

const path = require('path');
const fs = require('fs');
const { getDefaultValues, findPlaceholders, KNOWN_PLACEHOLDERS } = require('../../lib/placeholder');

describe('getDefaultValues', () => {
  test('returns object with expected keys', () => {
    const values = getDefaultValues({});

    expect(values).toHaveProperty('PROJECT_NAME');
    expect(values).toHaveProperty('TECH_STACK');
    expect(values).toHaveProperty('DATE');
    expect(values).toHaveProperty('INSTALL_COMMAND');
    expect(values).toHaveProperty('TEST_COMMAND');
  });

  test('uses provided project name', () => {
    const values = getDefaultValues({ projectName: 'my-awesome-project' });
    expect(values.PROJECT_NAME).toBe('my-awesome-project');
  });

  test('generates date in correct format', () => {
    const values = getDefaultValues({});
    // Date should be YYYY-MM-DD format
    expect(values.DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('uses Python commands for Python tech stack', () => {
    const values = getDefaultValues({}, { languages: ['python'] });
    expect(values.INSTALL_COMMAND).toContain('pip');
    expect(values.TEST_COMMAND).toContain('pytest');
  });

  test('uses Go commands for Go tech stack', () => {
    const values = getDefaultValues({}, { languages: ['go'] });
    expect(values.INSTALL_COMMAND).toContain('go mod');
    expect(values.TEST_COMMAND).toContain('go test');
  });

  test('uses Rust commands for Rust tech stack', () => {
    const values = getDefaultValues({}, { languages: ['rust'] });
    expect(values.INSTALL_COMMAND).toContain('cargo');
    expect(values.TEST_COMMAND).toContain('cargo test');
  });

  test('uses npm commands by default', () => {
    const values = getDefaultValues({});
    expect(values.INSTALL_COMMAND).toBe('npm install');
    expect(values.TEST_COMMAND).toBe('npm test');
  });

  test('includes tech stack summary', () => {
    const values = getDefaultValues({}, { summary: 'Node.js, Express, MongoDB' });
    expect(values.TECH_STACK).toBe('Node.js, Express, MongoDB');
  });

  test('uses preset commands when provided', () => {
    const values = getDefaultValues({}, {
      commands: {
        install: 'custom-install',
        dev: 'custom-dev',
        test: 'custom-test',
        migrate: 'custom-migrate'
      }
    });
    expect(values.INSTALL_COMMAND).toBe('custom-install');
    expect(values.DEV_START_COMMAND).toBe('custom-dev');
    expect(values.TEST_COMMAND).toBe('custom-test');
  });
});

describe('findPlaceholders', () => {
  const testFilePath = path.join(__dirname, 'test-placeholder-file.md');

  beforeEach(() => {
    // Create test file with placeholders
    fs.writeFileSync(testFilePath, `
# {{PROJECT_NAME}}

Tech: {{TECH_STACK}}
Install: {{INSTALL_COMMAND}}
Unknown: {{UNKNOWN_PLACEHOLDER}}
    `);
  });

  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  test('finds all placeholders in file', () => {
    const found = findPlaceholders(testFilePath);
    expect(found.length).toBe(4);
  });

  test('returns placeholder name and full pattern', () => {
    const found = findPlaceholders(testFilePath);
    const projectName = found.find(p => p.name === 'PROJECT_NAME');

    expect(projectName).toBeDefined();
    expect(projectName.placeholder).toBe('{{PROJECT_NAME}}');
    expect(projectName.name).toBe('PROJECT_NAME');
  });

  test('marks known placeholders correctly', () => {
    const found = findPlaceholders(testFilePath);

    const known = found.find(p => p.name === 'PROJECT_NAME');
    const unknown = found.find(p => p.name === 'UNKNOWN_PLACEHOLDER');

    expect(known.known).toBe(true);
    expect(unknown.known).toBe(false);
  });

  test('includes index position', () => {
    const found = findPlaceholders(testFilePath);
    found.forEach(p => {
      expect(typeof p.index).toBe('number');
      expect(p.index).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('getDefaultValues with analysis', () => {
  test('should use analysis.entryPoints for CORE_FILES_LIST', () => {
    const config = { projectName: 'test' };
    const techStack = { languages: ['javascript'], frameworks: ['express'] };
    const analysis = {
      entryPoints: [
        { file: 'src/routes/users.js', route: '/users' },
        { file: 'src/routes/auth.js', route: '/auth' }
      ],
      workflows: [
        { name: 'User Auth', category: 'security' },
        { name: 'Data Sync', category: 'data' }
      ],
      sourceFiles: 42,
      linesOfCode: { total: 5000 }
    };

    const values = getDefaultValues(config, techStack, analysis);

    expect(values.CORE_FILES_LIST).toContain('src/routes/users.js');
    expect(values.CORE_FILES_LIST).toContain('src/routes/auth.js');
    expect(values.WORKFLOWS_COUNT).toBe('2');
  });

  test('should set accurate counts from analysis', () => {
    const analysis = {
      entryPoints: [{ file: 'a.js' }, { file: 'b.js' }, { file: 'c.js' }],
      workflows: [{ name: 'W1' }, { name: 'W2' }],
      sourceFiles: 100
    };

    const values = getDefaultValues({}, {}, analysis);

    expect(values.WORKFLOWS_COUNT).toBe('2');
  });

  test('should use default CORE_FILES_LIST when no analysis', () => {
    const values = getDefaultValues({}, {}, {});

    expect(values.CORE_FILES_LIST).toContain('src/');
  });
});

describe('KNOWN_PLACEHOLDERS', () => {
  test('has expected number of placeholders', () => {
    const count = Object.keys(KNOWN_PLACEHOLDERS).length;
    expect(count).toBeGreaterThan(20);
  });

  test('each placeholder has description', () => {
    for (const [name, info] of Object.entries(KNOWN_PLACEHOLDERS)) {
      expect(info).toHaveProperty('description');
      expect(typeof info.description).toBe('string');
    }
  });

  test('each placeholder has example', () => {
    for (const [name, info] of Object.entries(KNOWN_PLACEHOLDERS)) {
      expect(info).toHaveProperty('example');
    }
  });

  test('includes essential project placeholders', () => {
    expect(KNOWN_PLACEHOLDERS).toHaveProperty('PROJECT_NAME');
    expect(KNOWN_PLACEHOLDERS).toHaveProperty('TECH_STACK');
    expect(KNOWN_PLACEHOLDERS).toHaveProperty('DATE');
  });

  test('includes command placeholders', () => {
    expect(KNOWN_PLACEHOLDERS).toHaveProperty('INSTALL_COMMAND');
    expect(KNOWN_PLACEHOLDERS).toHaveProperty('TEST_COMMAND');
    expect(KNOWN_PLACEHOLDERS).toHaveProperty('DEV_START_COMMAND');
  });
});
