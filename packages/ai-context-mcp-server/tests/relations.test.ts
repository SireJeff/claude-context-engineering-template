/**
 * Knowledge Graph Relations Tests
 */

import { describe, it, expect } from 'vitest';
import {
  RELATION_DEFINITIONS,
  RELATION_CATEGORIES,
  getRelationsByCategory,
  getRelationCategory,
  isValidRelation,
  suggestRelations
} from '../src/graph/relations.js';

describe('Knowledge Graph Relations', () => {
  describe('RELATION_DEFINITIONS', () => {
    it('should define all 14 relation types', () => {
      expect(Object.keys(RELATION_DEFINITIONS)).toHaveLength(14);
    });

    it('should have description for each relation', () => {
      for (const [type, def] of Object.entries(RELATION_DEFINITIONS)) {
        expect(def.description).toBeDefined();
        expect(def.description.length).toBeGreaterThan(10);
      }
    });

    it('should categorize each relation', () => {
      const validCategories = ['dependency', 'hierarchy', 'association', 'action'];
      
      for (const [type, def] of Object.entries(RELATION_DEFINITIONS)) {
        expect(validCategories).toContain(def.category);
      }
    });
  });

  describe('RELATION_CATEGORIES', () => {
    it('should have 4 categories', () => {
      expect(Object.keys(RELATION_CATEGORIES)).toHaveLength(4);
    });

    it('should include dependency category with correct relations', () => {
      expect(RELATION_CATEGORIES.dependency.relations).toContain('uses');
      expect(RELATION_CATEGORIES.dependency.relations).toContain('depends_on');
      expect(RELATION_CATEGORIES.dependency.relations).toContain('imports');
    });

    it('should include hierarchy category with correct relations', () => {
      expect(RELATION_CATEGORIES.hierarchy.relations).toContain('implements');
      expect(RELATION_CATEGORIES.hierarchy.relations).toContain('extends');
      expect(RELATION_CATEGORIES.hierarchy.relations).toContain('contains');
    });

    it('should include association category with correct relations', () => {
      expect(RELATION_CATEGORIES.association.relations).toContain('references');
      expect(RELATION_CATEGORIES.association.relations).toContain('documents');
      expect(RELATION_CATEGORIES.association.relations).toContain('configures');
    });

    it('should include action category with correct relations', () => {
      expect(RELATION_CATEGORIES.action.relations).toContain('tests');
      expect(RELATION_CATEGORIES.action.relations).toContain('calls');
      expect(RELATION_CATEGORIES.action.relations).toContain('validates');
    });
  });

  describe('getRelationsByCategory', () => {
    it('should return dependency relations', () => {
      const relations = getRelationsByCategory('dependency');
      expect(relations).toContain('uses');
      expect(relations).toContain('depends_on');
      expect(relations).toContain('imports');
    });

    it('should return hierarchy relations', () => {
      const relations = getRelationsByCategory('hierarchy');
      expect(relations).toContain('implements');
      expect(relations).toContain('extends');
      expect(relations).toContain('contains');
    });
  });

  describe('getRelationCategory', () => {
    it('should return correct category for uses', () => {
      expect(getRelationCategory('uses')).toBe('dependency');
    });

    it('should return correct category for extends', () => {
      expect(getRelationCategory('extends')).toBe('hierarchy');
    });

    it('should return correct category for documents', () => {
      expect(getRelationCategory('documents')).toBe('association');
    });

    it('should return correct category for tests', () => {
      expect(getRelationCategory('tests')).toBe('action');
    });
  });

  describe('isValidRelation', () => {
    it('should allow uses between any types', () => {
      expect(isValidRelation('code', 'code', 'uses')).toBe(true);
      expect(isValidRelation('workflow', 'code', 'uses')).toBe(true);
    });

    it('should allow tests between code types', () => {
      expect(isValidRelation('code', 'code', 'tests')).toBe(true);
    });

    it('should allow documents from workflow to code', () => {
      expect(isValidRelation('workflow', 'code', 'documents')).toBe(true);
    });

    it('should allow configures from config to any', () => {
      expect(isValidRelation('config', 'code', 'configures')).toBe(true);
      expect(isValidRelation('config', 'workflow', 'configures')).toBe(true);
    });
  });

  describe('suggestRelations', () => {
    it('should suggest imports when content contains import statement', () => {
      const content = "import { something } from 'myModule'";
      const suggestions = suggestRelations(content, 'myModule', 'code', 'code');
      expect(suggestions).toContain('imports');
    });

    it('should suggest calls when content contains function call', () => {
      const content = 'const result = myFunction(args);';
      const suggestions = suggestRelations(content, 'myFunction', 'code', 'code');
      expect(suggestions).toContain('calls');
    });

    it('should suggest extends when content contains extends keyword', () => {
      const content = 'class MyClass extends BaseClass {}';
      const suggestions = suggestRelations(content, 'BaseClass', 'code', 'code');
      expect(suggestions).toContain('extends');
    });

    it('should suggest implements when content contains implements keyword', () => {
      const content = 'class MyClass implements MyInterface {}';
      const suggestions = suggestRelations(content, 'MyInterface', 'code', 'code');
      expect(suggestions).toContain('implements');
    });

    it('should suggest tests when content appears to be a test file', () => {
      const content = 'describe("MyComponent test", () => {})';
      const suggestions = suggestRelations(content, 'MyComponent', 'code', 'code');
      expect(suggestions).toContain('tests');
    });

    it('should suggest documents for workflow to code', () => {
      const content = 'This workflow documents the authentication process.';
      const suggestions = suggestRelations(content, 'authentication', 'workflow', 'code');
      expect(suggestions).toContain('documents');
    });

    it('should suggest configures for config type', () => {
      const content = 'database configuration settings';
      const suggestions = suggestRelations(content, 'database', 'config', 'code');
      expect(suggestions).toContain('configures');
    });

    it('should return unique suggestions', () => {
      const content = 'import myModule; myModule(); extends myModule';
      const suggestions = suggestRelations(content, 'myModule', 'code', 'code');
      const uniqueSuggestions = [...new Set(suggestions)];
      expect(suggestions).toEqual(uniqueSuggestions);
    });
  });
});
