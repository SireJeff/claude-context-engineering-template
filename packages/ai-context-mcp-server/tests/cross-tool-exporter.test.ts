/**
 * Cross-Tool Exporter Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { DatabaseClient } from '../src/db/client.js';
import { 
  CrossToolExporter, 
  getSupportedTools, 
  getToolDisplayName, 
  getToolOutputPath,
  type AIToolName
} from '../src/export/cross-tool-exporter.js';

describe('CrossToolExporter', () => {
  let testDir: string;
  let db: DatabaseClient;
  let exporter: CrossToolExporter;

  beforeEach(() => {
    // Create a temporary directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cross-tool-export-test-'));
    
    // Create database
    db = new DatabaseClient(testDir, 'test.db');
    
    // Add some test data
    db.upsertItem({
      type: 'workflow',
      name: 'Test Workflow',
      content: 'This is a test workflow for authentication.'
    });
    
    db.upsertItem({
      type: 'agent',
      name: 'Test Agent',
      content: 'This is a test agent for code review.'
    });
    
    db.upsertItem({
      type: 'knowledge',
      name: 'Style Convention',
      content: 'Use 2-space indentation for JavaScript files.'
    });
    
    db.upsertItem({
      type: 'command',
      name: 'build',
      content: 'Build the project using npm run build'
    });

    // Create exporter
    exporter = new CrossToolExporter(db, testDir, { force: true });
  });

  afterEach(() => {
    db.close();
    // Clean up temp directory
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('getSupportedTools', () => {
    it('returns all supported tools', () => {
      const tools = getSupportedTools();
      expect(tools).toContain('copilot');
      expect(tools).toContain('cline');
      expect(tools).toContain('antigravity');
      expect(tools).toContain('windsurf');
      expect(tools).toContain('aider');
      expect(tools).toContain('continue');
      expect(tools).toHaveLength(6);
    });
  });

  describe('getToolDisplayName', () => {
    it('returns display names for all tools', () => {
      expect(getToolDisplayName('copilot')).toBe('GitHub Copilot');
      expect(getToolDisplayName('cline')).toBe('Cline');
      expect(getToolDisplayName('antigravity')).toBe('Antigravity');
      expect(getToolDisplayName('windsurf')).toBe('Windsurf');
      expect(getToolDisplayName('aider')).toBe('Aider');
      expect(getToolDisplayName('continue')).toBe('Continue');
    });
  });

  describe('getToolOutputPath', () => {
    it('returns correct output paths', () => {
      expect(getToolOutputPath('copilot')).toBe('.github/copilot-instructions.md');
      expect(getToolOutputPath('cline')).toBe('.clinerules');
      expect(getToolOutputPath('antigravity')).toBe('.agent/context.md');
      expect(getToolOutputPath('windsurf')).toBe('.windsurf/rules.md');
      expect(getToolOutputPath('aider')).toBe('.aider.conf.yml');
      expect(getToolOutputPath('continue')).toBe('.continue/config.json');
    });
  });

  describe('exportToTool - Copilot', () => {
    it('exports to Copilot format', async () => {
      const result = await exporter.exportToTool('copilot');
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('.github/copilot-instructions.md');
      expect(result.errors).toHaveLength(0);
      
      // Verify file was created
      const filePath = path.join(testDir, '.github', 'copilot-instructions.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Verify content
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('Auto-generated from .ai-context.db');
      expect(content).toContain('Copilot Instructions');
    });
  });

  describe('exportToTool - Cline', () => {
    it('exports to Cline format', async () => {
      const result = await exporter.exportToTool('cline');
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('.clinerules');
      
      // Verify file was created
      const filePath = path.join(testDir, '.clinerules');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Verify content
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('Cline Rules');
      expect(content).toContain('Auto-generated from .ai-context.db');
    });
  });

  describe('exportToTool - Antigravity', () => {
    it('exports to Antigravity format', async () => {
      const result = await exporter.exportToTool('antigravity');
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('.agent/context.md');
      
      // Verify file was created
      const filePath = path.join(testDir, '.agent', 'context.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Verify content
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('Agent Context');
      expect(content).toContain('Test Agent');
    });
  });

  describe('exportToTool - Windsurf', () => {
    it('exports to Windsurf format', async () => {
      const result = await exporter.exportToTool('windsurf');
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('.windsurf/rules.md');
      
      // Verify file was created
      const filePath = path.join(testDir, '.windsurf', 'rules.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Verify content
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('Windsurf Rules');
    });
  });

  describe('exportToTool - Aider', () => {
    it('exports to Aider format', async () => {
      const result = await exporter.exportToTool('aider');
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('.aider.conf.yml');
      expect(result.files).toContain('.aiderignore');
      
      // Verify config file was created
      const confPath = path.join(testDir, '.aider.conf.yml');
      expect(fs.existsSync(confPath)).toBe(true);
      
      const confContent = fs.readFileSync(confPath, 'utf-8');
      expect(confContent).toContain('Aider Configuration');
      expect(confContent).toContain('auto-commits: true');
      
      // Verify ignore file was created
      const ignorePath = path.join(testDir, '.aiderignore');
      expect(fs.existsSync(ignorePath)).toBe(true);
      
      const ignoreContent = fs.readFileSync(ignorePath, 'utf-8');
      expect(ignoreContent).toContain('.ai-context.db');
      expect(ignoreContent).toContain('node_modules/');
    });
  });

  describe('exportToTool - Continue', () => {
    it('exports to Continue format', async () => {
      const result = await exporter.exportToTool('continue');
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('.continue/config.json');
      
      // Verify file was created
      const filePath = path.join(testDir, '.continue', 'config.json');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Verify content is valid JSON
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);
      
      expect(config._generatedByAiContext).toBe(true);
      expect(config.models).toBeDefined();
      expect(config.models.length).toBeGreaterThan(0);
    });
  });

  describe('exportAll', () => {
    it('exports to all tools', async () => {
      const result = await exporter.exportAll();
      
      expect(result.results).toHaveLength(6);
      expect(result.totalFiles).toBeGreaterThan(0);
      expect(result.totalErrors).toBe(0);
      
      // Check each tool was exported
      const toolNames = result.results.map(r => r.tool);
      expect(toolNames).toContain('copilot');
      expect(toolNames).toContain('cline');
      expect(toolNames).toContain('antigravity');
      expect(toolNames).toContain('windsurf');
      expect(toolNames).toContain('aider');
      expect(toolNames).toContain('continue');
    });
  });

  describe('force option', () => {
    it('respects force=false for existing unmanaged files', async () => {
      // Create an existing Cline file without our marker
      fs.writeFileSync(path.join(testDir, '.clinerules'), 'Custom cline rules');
      
      // Create exporter with force=false
      const noForceExporter = new CrossToolExporter(db, testDir, { force: false });
      
      const result = await noForceExporter.exportToTool('cline');
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not managed');
    });

    it('overwrites existing files when force=true', async () => {
      // Create an existing Cline file
      fs.writeFileSync(path.join(testDir, '.clinerules'), 'Custom cline rules');
      
      // Create exporter with force=true
      const forceExporter = new CrossToolExporter(db, testDir, { force: true });
      
      const result = await forceExporter.exportToTool('cline');
      
      expect(result.success).toBe(true);
      
      const content = fs.readFileSync(path.join(testDir, '.clinerules'), 'utf-8');
      expect(content).toContain('Auto-generated from .ai-context.db');
    });
  });

  describe('getSyncStatus', () => {
    it('returns status for all tools', () => {
      const status = exporter.getSyncStatus();
      
      expect(Object.keys(status)).toHaveLength(6);
      expect(status.copilot).toBeDefined();
      expect(status.cline).toBeDefined();
      expect(status.antigravity).toBeDefined();
      expect(status.windsurf).toBeDefined();
      expect(status.aider).toBeDefined();
      expect(status.continue).toBeDefined();
    });

    it('detects existing files', async () => {
      // Export to cline
      await exporter.exportToTool('cline');
      
      const status = exporter.getSyncStatus();
      
      expect(status.cline.exists).toBe(true);
      expect(status.cline.managed).toBe(true);
      expect(status.copilot.exists).toBe(false);
    });
  });

  describe('content generation', () => {
    it('includes workflow content in exports', async () => {
      await exporter.exportToTool('cline');
      
      const content = fs.readFileSync(path.join(testDir, '.clinerules'), 'utf-8');
      expect(content).toContain('Test Workflow');
    });

    it('includes knowledge content in exports', async () => {
      await exporter.exportToTool('copilot');
      
      const content = fs.readFileSync(path.join(testDir, '.github', 'copilot-instructions.md'), 'utf-8');
      expect(content).toContain('Style Convention');
    });

    it('includes agent content in antigravity export', async () => {
      await exporter.exportToTool('antigravity');
      
      const content = fs.readFileSync(path.join(testDir, '.agent', 'context.md'), 'utf-8');
      expect(content).toContain('Test Agent');
    });
  });

  describe('sync state tracking', () => {
    it('updates sync state after export', async () => {
      await exporter.exportToTool('copilot');
      
      const syncStates = db.getSyncState('export-copilot');
      expect(syncStates.length).toBeGreaterThan(0);
      expect(syncStates[0].status).toBe('synced');
    });
  });
});
