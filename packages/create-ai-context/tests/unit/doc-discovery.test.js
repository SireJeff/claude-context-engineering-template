/**
 * Tests for documentation discovery module
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  discoverExistingDocs,
  detectAITools,
  findCommonDocs,
  parseContextFile,
  parseReadme,
  extractValuesFromContent,
  generateDiscoveryPrompts,
  buildMergedValues,
  AI_TOOL_SIGNATURES,
  COMMON_DOC_PATTERNS
} = require('../../lib/doc-discovery');

describe('detectAITools', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-discovery-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns null for all tools when none exist', () => {
    const tools = detectAITools(testDir);

    expect(tools.claude).toBeNull();
    expect(tools.copilot).toBeNull();
    expect(tools.cline).toBeNull();
    expect(tools.antigravity).toBeNull();
  });

  test('detects Claude v1 directory', () => {
    fs.mkdirSync(path.join(testDir, '.claude'));

    const tools = detectAITools(testDir);

    expect(tools.claude).not.toBeNull();
    expect(tools.claude.exists).toBe(true);
    expect(tools.claude.version).toBe('v1');
    expect(tools.claude.hasV1).toBe(true);
    expect(tools.claude.hasV2).toBe(false);
    expect(tools.claude.needsMigration).toBe(true);
  });

  test('detects Claude v1 file', () => {
    fs.writeFileSync(path.join(testDir, 'CLAUDE.md'), '# Project');

    const tools = detectAITools(testDir);

    expect(tools.claude).not.toBeNull();
    expect(tools.claude.exists).toBe(true);
    expect(tools.claude.version).toBe('v1');
  });

  test('detects Claude v2 directory', () => {
    fs.mkdirSync(path.join(testDir, '.ai-context'));

    const tools = detectAITools(testDir);

    expect(tools.claude).not.toBeNull();
    expect(tools.claude.exists).toBe(true);
    expect(tools.claude.version).toBe('v2');
    expect(tools.claude.hasV2).toBe(true);
    expect(tools.claude.needsMigration).toBe(false);
  });

  test('detects Claude v2 file', () => {
    fs.writeFileSync(path.join(testDir, 'AI_CONTEXT.md'), '# Project');

    const tools = detectAITools(testDir);

    expect(tools.claude).not.toBeNull();
    expect(tools.claude.exists).toBe(true);
    expect(tools.claude.version).toBe('v2');
  });

  test('prefers v2 when both v1 and v2 exist', () => {
    fs.mkdirSync(path.join(testDir, '.claude'));
    fs.mkdirSync(path.join(testDir, '.ai-context'));

    const tools = detectAITools(testDir);

    expect(tools.claude.version).toBe('v2');
    expect(tools.claude.hasV1).toBe(true);
    expect(tools.claude.hasV2).toBe(true);
    expect(tools.claude.needsMigration).toBe(false);
  });

  test('detects GitHub Copilot instructions', () => {
    fs.mkdirSync(path.join(testDir, '.github'), { recursive: true });
    fs.writeFileSync(path.join(testDir, '.github', 'copilot-instructions.md'), '# Copilot');

    const tools = detectAITools(testDir);

    expect(tools.copilot).not.toBeNull();
    expect(tools.copilot.exists).toBe(true);
    expect(tools.copilot.relativePath).toBe('.github/copilot-instructions.md');
  });

  test('detects Cline rules', () => {
    fs.writeFileSync(path.join(testDir, '.clinerules'), 'rules');

    const tools = detectAITools(testDir);

    expect(tools.cline).not.toBeNull();
    expect(tools.cline.exists).toBe(true);
    expect(tools.cline.relativePath).toBe('.clinerules');
  });

  test('detects Antigravity directory', () => {
    fs.mkdirSync(path.join(testDir, '.agent'));

    const tools = detectAITools(testDir);

    expect(tools.antigravity).not.toBeNull();
    expect(tools.antigravity.exists).toBe(true);
    expect(tools.antigravity.relativePath).toBe('.agent/');
  });
});

describe('findCommonDocs', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-discovery-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns null for all when no docs exist', async () => {
    const docs = await findCommonDocs(testDir);

    expect(docs.readme).toBeNull();
    expect(docs.architecture).toBeNull();
    expect(docs.changelog).toBeNull();
    expect(docs.docsDir).toBeNull();
  });

  test('finds README.md', async () => {
    fs.writeFileSync(path.join(testDir, 'README.md'), '# My Project');

    const docs = await findCommonDocs(testDir);

    expect(docs.readme).not.toBeNull();
    expect(docs.readme.relativePath).toBe('README.md');
  });

  test('finds lowercase readme.md', async () => {
    fs.writeFileSync(path.join(testDir, 'readme.md'), '# My Project');

    const docs = await findCommonDocs(testDir);

    expect(docs.readme).not.toBeNull();
    // On case-insensitive file systems (Windows), both patterns match the same file
    // The function returns the first pattern that matches, so it may be README.md or readme.md
    expect(['README.md', 'readme.md']).toContain(docs.readme.relativePath);
  });

  test('finds ARCHITECTURE.md', async () => {
    fs.writeFileSync(path.join(testDir, 'ARCHITECTURE.md'), '# Architecture');

    const docs = await findCommonDocs(testDir);

    expect(docs.architecture).not.toBeNull();
    expect(docs.architecture.relativePath).toBe('ARCHITECTURE.md');
  });

  test('finds CHANGELOG.md', async () => {
    fs.writeFileSync(path.join(testDir, 'CHANGELOG.md'), '# Changelog');

    const docs = await findCommonDocs(testDir);

    expect(docs.changelog).not.toBeNull();
    expect(docs.changelog.relativePath).toBe('CHANGELOG.md');
  });

  test('finds docs directory and counts files', async () => {
    const docsDir = path.join(testDir, 'docs');
    fs.mkdirSync(docsDir);
    fs.writeFileSync(path.join(docsDir, 'guide.md'), '# Guide');
    fs.writeFileSync(path.join(docsDir, 'api.md'), '# API');

    const docs = await findCommonDocs(testDir);

    expect(docs.docsDir).not.toBeNull();
    expect(docs.docsDir.relativePath).toBe('docs/');
    expect(docs.docsDir.fileCount).toBe(2);
  });
});

describe('extractValuesFromContent', () => {
  test('extracts project name from bold format', () => {
    const content = '**Project Name:** My Awesome App\n';
    const values = extractValuesFromContent(content);

    expect(values.PROJECT_NAME).toBe('My Awesome App');
  });

  test('extracts tech stack', () => {
    const content = '**Tech Stack:** Node.js, Express, MongoDB\n';
    const values = extractValuesFromContent(content);

    expect(values.TECH_STACK).toBe('Node.js, Express, MongoDB');
  });

  test('extracts production URL', () => {
    const content = '**Domain:** https://myapp.example.com\n';
    const values = extractValuesFromContent(content);

    expect(values.PRODUCTION_URL).toBe('https://myapp.example.com');
  });

  test('extracts repo URL', () => {
    const content = '**Repo:** https://github.com/user/repo\n';
    const values = extractValuesFromContent(content);

    expect(values.REPO_URL).toBe('https://github.com/user/repo');
  });

  test('skips placeholder values', () => {
    const content = '**Project Name:** {{PROJECT_NAME}}\n';
    const values = extractValuesFromContent(content);

    expect(values.PROJECT_NAME).toBeUndefined();
  });

  test('tracks unfilled placeholders', () => {
    const content = 'Name: {{PROJECT_NAME}}\nStack: {{TECH_STACK}}\n';
    const values = extractValuesFromContent(content);

    expect(values._unfilledPlaceholders).toBeDefined();
    expect(values._unfilledPlaceholders).toContain('PROJECT_NAME');
    expect(values._unfilledPlaceholders).toContain('TECH_STACK');
  });

  test('returns null when no values extracted', () => {
    const content = 'Just some random text\n';
    const values = extractValuesFromContent(content);

    expect(values).toBeNull();
  });
});

describe('parseReadme', () => {
  let testDir;
  let readmePath;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-discovery-test-'));
    readmePath = path.join(testDir, 'README.md');
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('extracts project name from title', () => {
    fs.writeFileSync(readmePath, '# My Project\n\nDescription here');
    const values = parseReadme(readmePath);

    expect(values.PROJECT_NAME).toBe('My Project');
  });

  test('extracts description from first paragraph', () => {
    fs.writeFileSync(readmePath, '# Project\n\nThis is a great project.\n\nMore text');
    const values = parseReadme(readmePath);

    expect(values.PROJECT_DESCRIPTION).toBe('This is a great project.');
  });

  test('extracts GitHub repo URL', () => {
    fs.writeFileSync(readmePath, '# Project\n\n[![Build](https://github.com/user/repo/actions)]\n');
    const values = parseReadme(readmePath);

    expect(values.REPO_URL).toBe('https://github.com/user/repo');
  });

  test('returns null for non-existent file', () => {
    const values = parseReadme('/nonexistent/path/README.md');

    expect(values).toBeNull();
  });

  test('strips badges from title', () => {
    fs.writeFileSync(readmePath, '# My Project [![Build](https://img.shields.io/badge)](url)\n');
    const values = parseReadme(readmePath);

    expect(values.PROJECT_NAME).toBe('My Project');
  });
});

describe('parseContextFile', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-discovery-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns null for non-existent file', () => {
    const values = parseContextFile('/nonexistent/path');

    expect(values).toBeNull();
  });

  test('returns null for null path', () => {
    const values = parseContextFile(null);

    expect(values).toBeNull();
  });

  test('extracts values from context file', () => {
    const filePath = path.join(testDir, 'AI_CONTEXT.md');
    fs.writeFileSync(filePath, '**Project:** Test\n**Tech Stack:** Go, Gin\n');
    const values = parseContextFile(filePath);

    expect(values.PROJECT_NAME).toBe('Test');
    expect(values.TECH_STACK).toBe('Go, Gin');
  });
});

describe('generateDiscoveryPrompts', () => {
  test('returns empty array when no docs exist', () => {
    const discovery = { hasExistingDocs: false };
    const prompts = generateDiscoveryPrompts(discovery);

    expect(prompts).toEqual([]);
  });

  test('returns strategy prompt when docs exist', () => {
    const discovery = {
      hasExistingDocs: true,
      tools: { claude: { exists: true, version: 'v1' } },
      commonDocs: {},
      conflicts: []
    };
    const prompts = generateDiscoveryPrompts(discovery);

    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts[0].name).toBe('existingDocsStrategy');
    expect(prompts[0].type).toBe('select');
  });

  test('adds conflict resolution prompt when conflicts exist', () => {
    const discovery = {
      hasExistingDocs: true,
      tools: { claude: { exists: true, version: 'v1' } },
      commonDocs: {},
      conflicts: [
        { key: 'PROJECT_NAME', existingValue: 'Old', newValue: 'New' }
      ]
    };
    const prompts = generateDiscoveryPrompts(discovery);

    expect(prompts.length).toBe(2);
    expect(prompts[1].name).toBe('conflictResolution');
  });

  test('includes tool names in prompt message', () => {
    const discovery = {
      hasExistingDocs: true,
      tools: {
        claude: { exists: true, version: 'v2' },
        copilot: { exists: true }
      },
      commonDocs: { readme: { relativePath: 'README.md' } },
      conflicts: []
    };
    const prompts = generateDiscoveryPrompts(discovery);

    expect(prompts[0].message).toContain('Claude context (v2)');
    expect(prompts[0].message).toContain('GitHub Copilot');
    expect(prompts[0].message).toContain('README.md');
  });
});

describe('buildMergedValues', () => {
  test('returns empty object for overwrite strategy', () => {
    const discovery = {
      extractedValues: { PROJECT_NAME: 'Test' },
      conflicts: []
    };
    const values = buildMergedValues(discovery, 'overwrite');

    expect(values).toEqual({});
  });

  test('returns extracted values for merge strategy', () => {
    const discovery = {
      extractedValues: { PROJECT_NAME: 'Test', TECH_STACK: 'Node.js' },
      conflicts: []
    };
    const values = buildMergedValues(discovery, 'merge');

    expect(values.PROJECT_NAME).toBe('Test');
    expect(values.TECH_STACK).toBe('Node.js');
  });

  test('returns extracted values for fresh strategy', () => {
    const discovery = {
      extractedValues: { PROJECT_NAME: 'Test' },
      conflicts: []
    };
    const values = buildMergedValues(discovery, 'fresh');

    expect(values.PROJECT_NAME).toBe('Test');
  });

  test('applies conflict resolutions - existing', () => {
    const discovery = {
      extractedValues: { PROJECT_NAME: 'First' },
      conflicts: [
        { key: 'PROJECT_NAME', existingValue: 'Old', newValue: 'New' }
      ]
    };
    const values = buildMergedValues(discovery, 'merge', { PROJECT_NAME: 'existing' });

    expect(values.PROJECT_NAME).toBe('Old');
  });

  test('applies conflict resolutions - new', () => {
    const discovery = {
      extractedValues: { PROJECT_NAME: 'First' },
      conflicts: [
        { key: 'PROJECT_NAME', existingValue: 'Old', newValue: 'New' }
      ]
    };
    const values = buildMergedValues(discovery, 'merge', { PROJECT_NAME: 'new' });

    expect(values.PROJECT_NAME).toBe('New');
  });
});

describe('discoverExistingDocs', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-discovery-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns hasExistingDocs false for empty directory', async () => {
    const discovery = await discoverExistingDocs(testDir);

    expect(discovery.hasExistingDocs).toBe(false);
  });

  test('returns hasExistingDocs true when README exists', async () => {
    fs.writeFileSync(path.join(testDir, 'README.md'), '# Test');

    const discovery = await discoverExistingDocs(testDir);

    expect(discovery.hasExistingDocs).toBe(true);
    expect(discovery.commonDocs.readme).not.toBeNull();
  });

  test('returns hasExistingDocs true when Claude context exists', async () => {
    fs.mkdirSync(path.join(testDir, '.claude'));

    const discovery = await discoverExistingDocs(testDir);

    expect(discovery.hasExistingDocs).toBe(true);
    expect(discovery.tools.claude.exists).toBe(true);
  });

  test('extracts values from existing docs', async () => {
    fs.writeFileSync(path.join(testDir, 'README.md'), '# My Project\n\nA great project');

    const discovery = await discoverExistingDocs(testDir);

    expect(discovery.extractedValues.PROJECT_NAME).toBe('My Project');
  });

  test('generates recommendations for v1 migration', async () => {
    fs.mkdirSync(path.join(testDir, '.claude'));

    const discovery = await discoverExistingDocs(testDir);

    const migrationRec = discovery.recommendations.find(r => r.type === 'migration');
    expect(migrationRec).toBeDefined();
    expect(migrationRec.priority).toBe('high');
  });

  test('generates recommendations for multiple tools', async () => {
    fs.mkdirSync(path.join(testDir, '.claude'));
    fs.mkdirSync(path.join(testDir, '.github'));
    fs.writeFileSync(path.join(testDir, '.github', 'copilot-instructions.md'), '# Copilot');

    const discovery = await discoverExistingDocs(testDir);

    const multiToolRec = discovery.recommendations.find(r => r.type === 'multi-tool');
    expect(multiToolRec).toBeDefined();
    expect(multiToolRec.message).toContain('claude');
    expect(multiToolRec.message).toContain('copilot');
  });
});

describe('AI_TOOL_SIGNATURES', () => {
  test('defines Claude v1 and v2 signatures', () => {
    expect(AI_TOOL_SIGNATURES.claude.v1.directory).toBe('.claude');
    expect(AI_TOOL_SIGNATURES.claude.v2.directory).toBe('.ai-context');
  });

  test('defines Copilot signature', () => {
    expect(AI_TOOL_SIGNATURES.copilot.paths).toContain('.github/copilot-instructions.md');
  });

  test('defines Cline signature', () => {
    expect(AI_TOOL_SIGNATURES.cline.paths).toContain('.clinerules');
  });

  test('defines Antigravity signature', () => {
    expect(AI_TOOL_SIGNATURES.antigravity.paths).toContain('.agent/');
  });
});

describe('COMMON_DOC_PATTERNS', () => {
  test('includes README patterns', () => {
    expect(COMMON_DOC_PATTERNS.readme).toContain('README.md');
    expect(COMMON_DOC_PATTERNS.readme).toContain('readme.md');
  });

  test('includes architecture patterns', () => {
    expect(COMMON_DOC_PATTERNS.architecture).toContain('ARCHITECTURE.md');
  });

  test('includes changelog patterns', () => {
    expect(COMMON_DOC_PATTERNS.changelog).toContain('CHANGELOG.md');
  });

  test('includes docs directory patterns', () => {
    expect(COMMON_DOC_PATTERNS.docsDir).toContain('docs/');
  });
});
