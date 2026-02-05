/**
 * Database Schema Tests
 */

import { describe, it, expect } from 'vitest';
import {
  SCHEMA_VERSION,
  SCHEMA_SQL,
  VECTOR_SCHEMA_SQL,
  RELATION_TYPES,
  CONTEXT_TYPES,
  type RelationType,
  type ContextType
} from '../src/db/schema.js';

describe('Database Schema', () => {
  describe('SCHEMA_VERSION', () => {
    it('should be a valid semver version', () => {
      expect(SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('SCHEMA_SQL', () => {
    it('should contain all required tables', () => {
      expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS schema_version');
      expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS context_items');
      expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS knowledge_graph');
      expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS git_commits');
      expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS sync_state');
      expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS embedding_queue');
      expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS usage_analytics');
    });

    it('should define all context item types', () => {
      expect(SCHEMA_SQL).toContain("'workflow'");
      expect(SCHEMA_SQL).toContain("'agent'");
      expect(SCHEMA_SQL).toContain("'command'");
      expect(SCHEMA_SQL).toContain("'code'");
      expect(SCHEMA_SQL).toContain("'commit'");
      expect(SCHEMA_SQL).toContain("'knowledge'");
      expect(SCHEMA_SQL).toContain("'config'");
    });

    it('should define all relation types', () => {
      expect(SCHEMA_SQL).toContain("'uses'");
      expect(SCHEMA_SQL).toContain("'implements'");
      expect(SCHEMA_SQL).toContain("'depends_on'");
      expect(SCHEMA_SQL).toContain("'tests'");
      expect(SCHEMA_SQL).toContain("'documents'");
    });
  });

  describe('VECTOR_SCHEMA_SQL', () => {
    it('should create embeddings virtual table', () => {
      expect(VECTOR_SCHEMA_SQL).toContain('CREATE VIRTUAL TABLE IF NOT EXISTS embeddings');
      expect(VECTOR_SCHEMA_SQL).toContain('USING vec0');
    });

    it('should define embedding dimension', () => {
      expect(VECTOR_SCHEMA_SQL).toContain('FLOAT[1536]');
    });
  });

  describe('RELATION_TYPES', () => {
    it('should contain all expected relation types', () => {
      const expectedTypes: RelationType[] = [
        'uses', 'implements', 'depends_on', 'references', 'tests',
        'documents', 'extends', 'contains', 'calls', 'imports',
        'configures', 'authenticates', 'validates', 'transforms'
      ];
      
      expect(RELATION_TYPES).toEqual(expectedTypes);
    });

    it('should have 14 relation types', () => {
      expect(RELATION_TYPES).toHaveLength(14);
    });
  });

  describe('CONTEXT_TYPES', () => {
    it('should contain all expected context types', () => {
      const expectedTypes: ContextType[] = [
        'workflow', 'agent', 'command', 'code', 'commit', 'knowledge', 'config'
      ];
      
      expect(CONTEXT_TYPES).toEqual(expectedTypes);
    });

    it('should have 7 context types', () => {
      expect(CONTEXT_TYPES).toHaveLength(7);
    });
  });
});
