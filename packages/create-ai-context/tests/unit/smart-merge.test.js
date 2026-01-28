/**
 * Tests for smart merge module
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  extractExistingContent,
  decideMerge,
  generateMergedContent,
  generateDiff,
  smartMergeFile,
  parseMarkdownSections,
  extractPlaceholderValues,
  extractLineReferences,
  extractFrontmatter,
  DECISION_TYPE
} = require('../../lib/smart-merge');

describe('parseMarkdownSections', () => {
  test('parses sections by headings', () => {
    const content = `# Title

Introduction text

## Section 1

Content 1

## Section 2

Content 2
`;
    const sections = parseMarkdownSections(content);

    expect(sections.length).toBeGreaterThan(0);
    expect(sections.some(s => s.heading === 'Title')).toBe(true);
    expect(sections.some(s => s.heading === 'Section 1')).toBe(true);
    expect(sections.some(s => s.heading === 'Section 2')).toBe(true);
  });

  test('captures heading level', () => {
    const content = `# H1

## H2

### H3
`;
    const sections = parseMarkdownSections(content);

    const h1 = sections.find(s => s.heading === 'H1');
    const h2 = sections.find(s => s.heading === 'H2');
    const h3 = sections.find(s => s.heading === 'H3');

    expect(h1.level).toBe(1);
    expect(h2.level).toBe(2);
    expect(h3.level).toBe(3);
  });

  test('captures section content', () => {
    const content = `## Section

This is the content.

More content here.

## Next Section
`;
    const sections = parseMarkdownSections(content);
    const section = sections.find(s => s.heading === 'Section');

    expect(section.content).toContain('This is the content');
    expect(section.content).toContain('More content here');
  });

  test('handles root content before first heading', () => {
    const content = `Some intro text

# First Heading
`;
    const sections = parseMarkdownSections(content);
    const root = sections.find(s => s.heading === 'root');

    expect(root).toBeDefined();
    expect(root.content).toContain('Some intro text');
  });
});

describe('extractPlaceholderValues', () => {
  test('extracts project name', () => {
    const content = '**Project Name:** My Project\n';
    const values = extractPlaceholderValues(content);

    expect(values.PROJECT_NAME).toBe('My Project');
  });

  test('extracts tech stack', () => {
    const content = '**Tech Stack:** Node.js, Express, MongoDB\n';
    const values = extractPlaceholderValues(content);

    expect(values.TECH_STACK).toBe('Node.js, Express, MongoDB');
  });

  test('extracts production URL', () => {
    const content = '**Domain:** https://myapp.com\n';
    const values = extractPlaceholderValues(content);

    expect(values.PRODUCTION_URL).toBe('https://myapp.com');
  });

  test('extracts API URL', () => {
    const content = '**API:** https://api.myapp.com\n';
    const values = extractPlaceholderValues(content);

    expect(values.API_URL).toBe('https://api.myapp.com');
  });

  test('extracts repo URL', () => {
    const content = '**Repo:** https://github.com/user/repo\n';
    const values = extractPlaceholderValues(content);

    expect(values.REPO_URL).toBe('https://github.com/user/repo');
  });

  test('skips placeholder patterns', () => {
    const content = '**Project Name:** {{PROJECT_NAME}}\n';
    const values = extractPlaceholderValues(content);

    expect(values.PROJECT_NAME).toBeUndefined();
  });

  test('returns empty object when no values found', () => {
    const content = 'Just some random text\n';
    const values = extractPlaceholderValues(content);

    expect(Object.keys(values).length).toBe(0);
  });
});

describe('extractLineReferences', () => {
  test('extracts simple line references', () => {
    const content = 'See src/auth.js:42 for details';
    const refs = extractLineReferences(content);

    expect(refs).toHaveLength(1);
    expect(refs[0].file).toBe('src/auth.js');
    expect(refs[0].line).toBe(42);
  });

  test('extracts line range references', () => {
    const content = 'See src/utils.py:10-25';
    const refs = extractLineReferences(content);

    expect(refs).toHaveLength(1);
    expect(refs[0].line).toBe(10);
    expect(refs[0].endLine).toBe(25);
  });

  test('extracts multiple references', () => {
    const content = 'See src/a.js:10 and src/b.js:20';
    const refs = extractLineReferences(content);

    expect(refs).toHaveLength(2);
  });

  test('normalizes Windows paths', () => {
    const content = 'See src\\auth.js:42';
    const refs = extractLineReferences(content);

    expect(refs[0].file).toBe('src/auth.js');
  });

  test('captures original text', () => {
    const content = 'See src/auth.js:42-50';
    const refs = extractLineReferences(content);

    expect(refs[0].original).toBe('src/auth.js:42-50');
  });
});

describe('extractFrontmatter', () => {
  test('extracts YAML frontmatter', () => {
    const content = `---
title: My Doc
category: guide
---

# Content
`;
    const frontmatter = extractFrontmatter(content);

    expect(frontmatter).not.toBeNull();
    expect(frontmatter.title).toBe('My Doc');
    expect(frontmatter.category).toBe('guide');
  });

  test('returns null when no frontmatter', () => {
    const content = '# Just Content\n\nNo frontmatter here.';
    const frontmatter = extractFrontmatter(content);

    expect(frontmatter).toBeNull();
  });

  test('handles multiline values', () => {
    const content = `---
name: test
status: active
---

Content`;
    const frontmatter = extractFrontmatter(content);

    expect(frontmatter.name).toBe('test');
    expect(frontmatter.status).toBe('active');
  });
});

describe('extractExistingContent', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smart-merge-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns null for non-existent file', () => {
    const result = extractExistingContent('/nonexistent/path.md');
    expect(result).toBeNull();
  });

  test('extracts raw content', () => {
    const content = '# Test\n\nContent here';
    const filePath = path.join(testDir, 'test.md');
    fs.writeFileSync(filePath, content);

    const result = extractExistingContent(filePath);

    expect(result.raw).toBe(content);
  });

  test('extracts sections', () => {
    const content = '# Title\n\n## Section 1\n\nContent';
    const filePath = path.join(testDir, 'test.md');
    fs.writeFileSync(filePath, content);

    const result = extractExistingContent(filePath);

    expect(result.sections.length).toBeGreaterThan(0);
  });

  test('extracts placeholder values', () => {
    const content = '**Project Name:** My App\n**Tech Stack:** Node.js';
    const filePath = path.join(testDir, 'test.md');
    fs.writeFileSync(filePath, content);

    const result = extractExistingContent(filePath);

    expect(result.placeholders.PROJECT_NAME).toBe('My App');
    expect(result.placeholders.TECH_STACK).toBe('Node.js');
  });

  test('extracts line references', () => {
    const content = 'See src/auth.js:42 for details';
    const filePath = path.join(testDir, 'test.md');
    fs.writeFileSync(filePath, content);

    const result = extractExistingContent(filePath);

    expect(result.lineReferences.length).toBe(1);
  });

  test('extracts frontmatter', () => {
    const content = '---\ntitle: Test\n---\n\n# Content';
    const filePath = path.join(testDir, 'test.md');
    fs.writeFileSync(filePath, content);

    const result = extractExistingContent(filePath);

    expect(result.frontmatter).not.toBeNull();
    expect(result.frontmatter.title).toBe('Test');
  });

  test('identifies custom sections when template provided', () => {
    const existingContent = '# Title\n\n## Custom Section\n\nMy content\n\n## Standard\n\nStandard content';
    const templateContent = '# Title\n\n## Standard\n\nTemplate content';

    const existingPath = path.join(testDir, 'existing.md');
    const templatePath = path.join(testDir, 'template.md');

    fs.writeFileSync(existingPath, existingContent);
    fs.writeFileSync(templatePath, templateContent);

    const result = extractExistingContent(existingPath, templatePath);

    expect(result.customSections.some(s => s.heading === 'Custom Section')).toBe(true);
  });
});

describe('decideMerge', () => {
  test('returns UPDATE when no existing content', () => {
    const decisions = decideMerge(null, {});

    expect(decisions.length).toBe(1);
    expect(decisions[0].type).toBe(DECISION_TYPE.UPDATE);
    expect(decisions[0].reason).toBe('No existing content');
  });

  test('preserves customized placeholders', () => {
    const existing = {
      placeholders: { PROJECT_NAME: 'My Custom Name' }
    };
    const newAnalysis = { values: { PROJECT_NAME: 'Default' } };

    const decisions = decideMerge(existing, newAnalysis, {
      preserveCustom: true,
      defaultPlaceholders: { PROJECT_NAME: 'Default' }
    });

    const preserved = decisions.find(
      d => d.type === DECISION_TYPE.PRESERVE && d.placeholder === 'PROJECT_NAME'
    );
    expect(preserved).toBeDefined();
    expect(preserved.value).toBe('My Custom Name');
  });

  test('updates default/template values', () => {
    const existing = {
      placeholders: { PROJECT_NAME: 'Default' }
    };
    const newAnalysis = { values: { PROJECT_NAME: 'New Value' } };

    const decisions = decideMerge(existing, newAnalysis, {
      preserveCustom: true,
      defaultPlaceholders: { PROJECT_NAME: 'Default' }
    });

    const updated = decisions.find(
      d => d.type === DECISION_TYPE.UPDATE && d.placeholder === 'PROJECT_NAME'
    );
    expect(updated).toBeDefined();
    expect(updated.newValue).toBe('New Value');
  });

  test('preserves custom sections', () => {
    const existing = {
      customSections: [{ heading: 'My Custom Section', content: 'Custom content', startLine: 10 }]
    };

    const decisions = decideMerge(existing, {}, { preserveCustom: true });

    const preserved = decisions.find(
      d => d.type === DECISION_TYPE.PRESERVE_SECTION && d.heading === 'My Custom Section'
    );
    expect(preserved).toBeDefined();
    expect(preserved.content).toBe('Custom content');
  });

  test('adds new workflows', () => {
    const existing = {
      sections: [{ heading: 'Existing Workflow', content: '' }]
    };
    const newAnalysis = {
      workflows: [{ name: 'New Feature' }]
    };

    const decisions = decideMerge(existing, newAnalysis);

    const added = decisions.find(
      d => d.type === DECISION_TYPE.ADD_WORKFLOW
    );
    expect(added).toBeDefined();
    expect(added.workflow.name).toBe('New Feature');
  });

  test('skips adding existing workflows', () => {
    const existing = {
      sections: [{ heading: 'Authentication Workflow', content: '' }]
    };
    const newAnalysis = {
      workflows: [{ name: 'authentication' }]
    };

    const decisions = decideMerge(existing, newAnalysis);

    const added = decisions.find(
      d => d.type === DECISION_TYPE.ADD_WORKFLOW && d.workflow.name === 'authentication'
    );
    expect(added).toBeUndefined();
  });
});

describe('generateMergedContent', () => {
  test('applies PRESERVE decisions', () => {
    const template = 'Project: {{PROJECT_NAME}}';
    const decisions = [{
      type: DECISION_TYPE.PRESERVE,
      placeholder: 'PROJECT_NAME',
      value: 'My Project'
    }];

    const result = generateMergedContent(template, decisions, {});

    expect(result).toBe('Project: My Project');
  });

  test('applies UPDATE decisions', () => {
    const template = 'Project: {{PROJECT_NAME}}';
    const decisions = [{
      type: DECISION_TYPE.UPDATE,
      placeholder: 'PROJECT_NAME',
      newValue: 'Updated Project'
    }];

    const result = generateMergedContent(template, decisions, {});

    expect(result).toBe('Project: Updated Project');
  });

  test('applies UPDATE_REF decisions', () => {
    const template = 'See src/auth.js:42 for details';
    const decisions = [{
      type: DECISION_TYPE.UPDATE_REF,
      oldRef: 'src/auth.js:42',
      newRef: 'src/auth.js:50'
    }];

    const result = generateMergedContent(template, decisions, {});

    expect(result).toContain('src/auth.js:50');
    expect(result).not.toContain('src/auth.js:42');
  });

  test('applies REMOVE_STALE_REF decisions', () => {
    const template = 'See src/old.js:10 for details';
    const decisions = [{
      type: DECISION_TYPE.REMOVE_STALE_REF,
      reference: 'src/old.js:10'
    }];

    const result = generateMergedContent(template, decisions, {});

    expect(result).toContain('<!-- REMOVED: src/old.js:10 -->');
  });

  test('replaces all occurrences of placeholder', () => {
    const template = 'Name: {{NAME}}, Also {{NAME}}';
    const decisions = [{
      type: DECISION_TYPE.UPDATE,
      placeholder: 'NAME',
      newValue: 'Test'
    }];

    const result = generateMergedContent(template, decisions, {});

    expect(result).toBe('Name: Test, Also Test');
  });
});

describe('generateDiff', () => {
  test('counts preserved items', () => {
    const decisions = [
      { type: DECISION_TYPE.PRESERVE, placeholder: 'A' },
      { type: DECISION_TYPE.PRESERVE_SECTION, heading: 'B' }
    ];

    const diff = generateDiff('', '', decisions);

    expect(diff.summary.preserved).toBe(2);
  });

  test('counts updated items', () => {
    const decisions = [
      { type: DECISION_TYPE.UPDATE, placeholder: 'A', oldValue: 'old', newValue: 'new' },
      { type: DECISION_TYPE.UPDATE_REF, oldRef: 'a.js:1', newRef: 'a.js:2' }
    ];

    const diff = generateDiff('', '', decisions);

    expect(diff.summary.updated).toBe(2);
  });

  test('counts added items', () => {
    const decisions = [
      { type: DECISION_TYPE.ADD_WORKFLOW, workflow: { name: 'Test' } },
      { type: DECISION_TYPE.ADD_ENTRY_POINT, entryPoint: { file: 'a.js' } }
    ];

    const diff = generateDiff('', '', decisions);

    expect(diff.summary.added).toBe(2);
  });

  test('counts removed items and adds migration notes', () => {
    const decisions = [
      { type: DECISION_TYPE.REMOVE_STALE_REF, reference: 'old.js:10', reason: 'File deleted' }
    ];

    const diff = generateDiff('', '', decisions);

    expect(diff.summary.removed).toBe(1);
    expect(diff.migrationNotes.length).toBe(1);
    expect(diff.migrationNotes[0].reference).toBe('old.js:10');
  });

  test('records changes with details', () => {
    const decisions = [
      { type: DECISION_TYPE.UPDATE, placeholder: 'NAME', oldValue: 'Old', newValue: 'New' }
    ];

    const diff = generateDiff('', '', decisions);

    expect(diff.changes.length).toBe(1);
    expect(diff.changes[0].type).toBe('update');
    expect(diff.changes[0].oldValue).toBe('Old');
    expect(diff.changes[0].newValue).toBe('New');
  });
});

describe('smartMergeFile', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smart-merge-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('returns error when template not found', async () => {
    const result = await smartMergeFile(
      path.join(testDir, 'file.md'),
      '/nonexistent/template.md',
      {}
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Template file not found');
  });

  test('creates new file from template when target does not exist', async () => {
    const templateContent = '# Template\n\nContent';
    const templatePath = path.join(testDir, 'template.md');
    const filePath = path.join(testDir, 'new.md');

    fs.writeFileSync(templatePath, templateContent);

    const result = await smartMergeFile(filePath, templatePath, {});

    expect(result.success).toBe(true);
    expect(result.isNew).toBe(true);
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe(templateContent);
  });

  test('respects dry run option - new file', async () => {
    const templatePath = path.join(testDir, 'template.md');
    const filePath = path.join(testDir, 'new.md');

    fs.writeFileSync(templatePath, '# Template');

    const result = await smartMergeFile(filePath, templatePath, {}, { dryRun: true });

    expect(result.success).toBe(true);
    expect(result.isNew).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false); // File should NOT be created in dry run
  });

  test('respects dry run option - existing file', async () => {
    const templateContent = '# Template\n\nProject: {{PROJECT_NAME}}';
    const existingContent = '# Existing\n\n**Project Name:** My Project';

    const templatePath = path.join(testDir, 'template.md');
    const filePath = path.join(testDir, 'existing.md');

    fs.writeFileSync(templatePath, templateContent);
    fs.writeFileSync(filePath, existingContent);

    const result = await smartMergeFile(filePath, templatePath, {}, { dryRun: true });

    expect(result.success).toBe(true);
    expect(result.dryRun).toBe(true);
    // File content should NOT change in dry run
    expect(fs.readFileSync(filePath, 'utf-8')).toBe(existingContent);
  });

  test('creates backup when requested', async () => {
    const templateContent = '# Template';
    const existingContent = '# Existing\n\n**Project Name:** My Project';

    const templatePath = path.join(testDir, 'template.md');
    const filePath = path.join(testDir, 'file.md');

    fs.writeFileSync(templatePath, templateContent);
    fs.writeFileSync(filePath, existingContent);

    await smartMergeFile(filePath, templatePath, {}, { backup: true });

    const backupFiles = fs.readdirSync(testDir).filter(f => f.startsWith('file.md.backup-'));
    expect(backupFiles.length).toBe(1);
  });

  test('preserves customized values in merge', async () => {
    const templateContent = 'Project: {{PROJECT_NAME}}\nStack: {{TECH_STACK}}';
    const existingContent = '**Project Name:** My Custom Project\n**Tech Stack:** Python';

    const templatePath = path.join(testDir, 'template.md');
    const filePath = path.join(testDir, 'file.md');

    fs.writeFileSync(templatePath, templateContent);
    fs.writeFileSync(filePath, existingContent);

    const result = await smartMergeFile(filePath, templatePath, {}, {
      preserveCustom: true,
      defaultPlaceholders: { PROJECT_NAME: 'Default', TECH_STACK: 'Default' }
    });

    expect(result.success).toBe(true);
    expect(result.preserved).toBeGreaterThan(0);
  });

  test('returns diff information', async () => {
    const templateContent = '# Template';
    const existingContent = '# Existing';

    const templatePath = path.join(testDir, 'template.md');
    const filePath = path.join(testDir, 'file.md');

    fs.writeFileSync(templatePath, templateContent);
    fs.writeFileSync(filePath, existingContent);

    const result = await smartMergeFile(filePath, templatePath, {});

    expect(result.success).toBe(true);
    expect(result.diff).toBeDefined();
    expect(result.diff.summary).toBeDefined();
  });
});

describe('DECISION_TYPE constants', () => {
  test('defines expected decision types', () => {
    expect(DECISION_TYPE.PRESERVE).toBe('preserve');
    expect(DECISION_TYPE.UPDATE).toBe('update');
    expect(DECISION_TYPE.CONFLICT).toBe('conflict');
    expect(DECISION_TYPE.PRESERVE_SECTION).toBe('preserve_section');
    expect(DECISION_TYPE.REMOVE_STALE_REF).toBe('remove_stale_ref');
    expect(DECISION_TYPE.UPDATE_REF).toBe('update_ref');
    expect(DECISION_TYPE.ADD_WORKFLOW).toBe('add_workflow');
    expect(DECISION_TYPE.ADD_ENTRY_POINT).toBe('add_entry_point');
  });
});
