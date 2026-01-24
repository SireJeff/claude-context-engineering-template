/**
 * Tests for prompts module
 */

const path = require('path');
const { getDefaults, PRESETS } = require('../../lib/prompts');

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

describe('getDefaults', () => {
  test('returns expected structure', async () => {
    const defaults = await getDefaults(FIXTURES_DIR);

    expect(defaults).toHaveProperty('projectName');
    expect(defaults).toHaveProperty('techStack');
    expect(defaults).toHaveProperty('features');
    expect(defaults).toHaveProperty('installPlugin');
  });

  test('projectName is directory basename', async () => {
    const defaults = await getDefaults(path.join(FIXTURES_DIR, 'node-project'));
    expect(defaults.projectName).toBe('node-project');
  });

  test('features has expected boolean flags', async () => {
    const defaults = await getDefaults(FIXTURES_DIR);

    expect(defaults.features).toHaveProperty('rpi');
    expect(defaults.features).toHaveProperty('agents');
    expect(defaults.features).toHaveProperty('validation');
    expect(defaults.features).toHaveProperty('ci');
    expect(defaults.features).toHaveProperty('team');
    expect(defaults.features).toHaveProperty('analytics');
  });

  test('default features have rpi, agents, validation enabled', async () => {
    const defaults = await getDefaults(FIXTURES_DIR);

    expect(defaults.features.rpi).toBe(true);
    expect(defaults.features.agents).toBe(true);
    expect(defaults.features.validation).toBe(true);
  });

  test('default features have ci, team, analytics disabled', async () => {
    const defaults = await getDefaults(FIXTURES_DIR);

    expect(defaults.features.ci).toBe(false);
    expect(defaults.features.team).toBe(false);
    expect(defaults.features.analytics).toBe(false);
  });

  test('installPlugin defaults to true', async () => {
    const defaults = await getDefaults(FIXTURES_DIR);
    expect(defaults.installPlugin).toBe(true);
  });

  test('applies preset when provided', async () => {
    const defaults = await getDefaults(FIXTURES_DIR, 'python-fastapi');

    expect(defaults.techStack.preset).toBe('python-fastapi');
    expect(defaults.techStack.commands).toBeDefined();
  });

  test('detects tech stack from project', async () => {
    const defaults = await getDefaults(path.join(FIXTURES_DIR, 'node-project'));

    expect(defaults.techStack).toBeDefined();
    expect(defaults.techStack.languages).toContain('javascript');
  });
});

describe('PRESETS', () => {
  test('is an object with preset configurations', () => {
    expect(typeof PRESETS).toBe('object');
    expect(Object.keys(PRESETS).length).toBeGreaterThan(0);
  });

  test('each preset has required properties', () => {
    for (const [name, preset] of Object.entries(PRESETS)) {
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('stack');
      expect(preset).toHaveProperty('commands');
    }
  });

  test('each preset has all command types', () => {
    for (const [name, preset] of Object.entries(PRESETS)) {
      expect(preset.commands).toHaveProperty('install');
      expect(preset.commands).toHaveProperty('dev');
      expect(preset.commands).toHaveProperty('test');
      expect(preset.commands).toHaveProperty('migrate');
    }
  });

  test('includes python-fastapi preset', () => {
    expect(PRESETS).toHaveProperty('python-fastapi');
    expect(PRESETS['python-fastapi'].stack).toContain('Python');
    expect(PRESETS['python-fastapi'].commands.install).toContain('pip');
  });

  test('includes node-express preset', () => {
    expect(PRESETS).toHaveProperty('node-express');
    expect(PRESETS['node-express'].stack).toContain('Node');
    expect(PRESETS['node-express'].commands.install).toBe('npm install');
  });

  test('includes go-gin preset', () => {
    expect(PRESETS).toHaveProperty('go-gin');
    expect(PRESETS['go-gin'].stack).toContain('Go');
    expect(PRESETS['go-gin'].commands.install).toContain('go');
  });

  test('preset names are kebab-case', () => {
    for (const name of Object.keys(PRESETS)) {
      // Allow format: word-word or word-word-word (e.g., csharp-dotnet, typescript-nextjs)
      expect(name).toMatch(/^[a-z]+-[a-z]+(-[a-z]+)?$/);
    }
  });

  test('preset stack descriptions are descriptive', () => {
    for (const [name, preset] of Object.entries(PRESETS)) {
      expect(preset.stack.length).toBeGreaterThan(5);
      expect(preset.stack).toContain(','); // Should list multiple technologies
    }
  });
});
