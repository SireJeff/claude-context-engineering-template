/**
 * MCP Prompts Tests
 */

import { describe, it, expect } from 'vitest';
import { PROMPT_DEFINITIONS } from '../src/prompts/handlers.js';

describe('MCP Prompts', () => {
  describe('PROMPT_DEFINITIONS', () => {
    it('should define 6 prompts (agents)', () => {
      expect(PROMPT_DEFINITIONS).toHaveLength(6);
    });

    it('should have unique prompt names', () => {
      const names = PROMPT_DEFINITIONS.map(p => p.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toEqual(uniqueNames);
    });

    it('should define context-engineer prompt', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'context-engineer');
      expect(prompt).toBeDefined();
      expect(prompt?.description).toContain('Initialize');
    });

    it('should define core-architect prompt', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'core-architect');
      expect(prompt).toBeDefined();
      expect(prompt?.description).toContain('architecture');
    });

    it('should define api-developer prompt', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'api-developer');
      expect(prompt).toBeDefined();
      expect(prompt?.description).toContain('API');
    });

    it('should define database-ops prompt', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'database-ops');
      expect(prompt).toBeDefined();
      expect(prompt?.description).toContain('database');
    });

    it('should define deployment-ops prompt', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'deployment-ops');
      expect(prompt).toBeDefined();
      expect(prompt?.description).toContain('deployment');
    });

    it('should define integration-hub prompt', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'integration-hub');
      expect(prompt).toBeDefined();
      expect(prompt?.description).toContain('integration');
    });

    it('should have descriptions for all prompts', () => {
      for (const prompt of PROMPT_DEFINITIONS) {
        expect(prompt.description).toBeDefined();
        expect(prompt.description.length).toBeGreaterThan(10);
      }
    });

    it('should have arguments array for all prompts', () => {
      for (const prompt of PROMPT_DEFINITIONS) {
        expect(Array.isArray(prompt.arguments)).toBe(true);
      }
    });

    it('should have valid argument definitions', () => {
      for (const prompt of PROMPT_DEFINITIONS) {
        for (const arg of prompt.arguments) {
          expect(arg.name).toBeDefined();
          expect(arg.description).toBeDefined();
          expect(typeof arg.required).toBe('boolean');
        }
      }
    });
  });

  describe('Prompt Arguments', () => {
    it('context-engineer should have projectType argument', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'context-engineer');
      const arg = prompt?.arguments.find(a => a.name === 'projectType');
      expect(arg).toBeDefined();
      expect(arg?.required).toBe(false);
    });

    it('core-architect should have focus argument', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'core-architect');
      const arg = prompt?.arguments.find(a => a.name === 'focus');
      expect(arg).toBeDefined();
    });

    it('api-developer should have endpoint argument', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'api-developer');
      const arg = prompt?.arguments.find(a => a.name === 'endpoint');
      expect(arg).toBeDefined();
    });

    it('database-ops should have operation argument', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'database-ops');
      const arg = prompt?.arguments.find(a => a.name === 'operation');
      expect(arg).toBeDefined();
    });

    it('deployment-ops should have environment argument', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'deployment-ops');
      const arg = prompt?.arguments.find(a => a.name === 'environment');
      expect(arg).toBeDefined();
    });

    it('integration-hub should have service argument', () => {
      const prompt = PROMPT_DEFINITIONS.find(p => p.name === 'integration-hub');
      const arg = prompt?.arguments.find(a => a.name === 'service');
      expect(arg).toBeDefined();
    });
  });
});
