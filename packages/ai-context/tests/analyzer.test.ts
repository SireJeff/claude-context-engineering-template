/**
 * Integration tests for IntelligentAnalyzer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createIntelligentAnalyzer } from '../src/analyzer/intelligent-analyzer.js';

describe('IntelligentAnalyzer', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create temp directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-context-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('discoverDocs', () => {
    it('should discover markdown files', async () => {
      // Create test files
      fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test Project');
      fs.writeFileSync(path.join(tempDir, 'CONTRIBUTING.md'), '# Contributing');
      fs.mkdirSync(path.join(tempDir, 'docs'));
      fs.writeFileSync(path.join(tempDir, 'docs', 'guide.md'), '# Guide');

      const analyzer = createIntelligentAnalyzer(tempDir);
      const docs = await analyzer.discoverDocs();

      expect(docs.length).toBe(3);
      expect(docs.every(d => d.type === 'doc')).toBe(true);
    });

    it('should ignore node_modules', async () => {
      fs.mkdirSync(path.join(tempDir, 'node_modules', 'package'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, 'node_modules', 'package', 'README.md'), '# Package');
      fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test');

      const analyzer = createIntelligentAnalyzer(tempDir);
      const docs = await analyzer.discoverDocs();

      expect(docs.length).toBe(1);
      expect(docs[0].relativePath).toBe('README.md');
    });
  });

  describe('discoverToolConfigs', () => {
    it('should discover Claude config', async () => {
      fs.mkdirSync(path.join(tempDir, '.claude'));
      fs.writeFileSync(path.join(tempDir, '.claude', 'settings.json'), '{}');
      fs.writeFileSync(path.join(tempDir, 'CLAUDE.md'), '# Claude Config');

      const analyzer = createIntelligentAnalyzer(tempDir);
      const configs = await analyzer.discoverToolConfigs();

      expect(configs.some(c => c.tool === 'claude')).toBe(true);
    });

    it('should discover Copilot config', async () => {
      fs.mkdirSync(path.join(tempDir, '.github'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, '.github', 'copilot-instructions.md'), '# Copilot');

      const analyzer = createIntelligentAnalyzer(tempDir);
      const configs = await analyzer.discoverToolConfigs();

      expect(configs.some(c => c.tool === 'copilot')).toBe(true);
    });

    it('should discover Cline config', async () => {
      fs.writeFileSync(path.join(tempDir, '.clinerules'), 'rules');

      const analyzer = createIntelligentAnalyzer(tempDir);
      const configs = await analyzer.discoverToolConfigs();

      expect(configs.some(c => c.tool === 'cline')).toBe(true);
    });
  });

  describe('discoverCode', () => {
    it('should discover source code files', async () => {
      fs.writeFileSync(path.join(tempDir, 'index.ts'), 'console.log("test")');
      fs.writeFileSync(path.join(tempDir, 'app.js'), 'module.exports = {}');
      fs.mkdirSync(path.join(tempDir, 'src'));
      fs.writeFileSync(path.join(tempDir, 'src', 'main.py'), 'print("hello")');

      const analyzer = createIntelligentAnalyzer(tempDir);
      const code = await analyzer.discoverCode();

      expect(code.length).toBe(3);
      expect(code.every(c => c.type === 'code')).toBe(true);
    });
  });

  describe('analyze', () => {
    it('should perform basic analysis without OpenRouter', async () => {
      // Create a package.json for tech stack detection
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({
        name: 'test-project',
        dependencies: {
          'express': '^4.0.0',
          'react': '^18.0.0'
        }
      }));
      fs.writeFileSync(path.join(tempDir, 'index.ts'), 'import express from "express"');
      fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test Project');

      const analyzer = createIntelligentAnalyzer(tempDir);
      const analysis = await analyzer.analyze();

      expect(analysis.techStack.languages).toContain('TypeScript');
      expect(analysis.techStack.frameworks).toContain('Express');
      expect(analysis.techStack.frameworks).toContain('React');
      expect(analysis.existingContext.files.length).toBeGreaterThan(0);
    });

    it('should detect when intelligent mode is unavailable', () => {
      const analyzer = createIntelligentAnalyzer(tempDir);
      
      // Without OPENROUTER_API_KEY, intelligent mode should be unavailable
      expect(analyzer.isIntelligentModeAvailable()).toBe(false);
    });
  });
});
