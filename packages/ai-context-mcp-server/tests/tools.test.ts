/**
 * MCP Tools Tests
 */

import { describe, it, expect } from 'vitest';
import { TOOL_DEFINITIONS } from '../src/tools/handlers.js';

describe('MCP Tools', () => {
  describe('TOOL_DEFINITIONS', () => {
    it('should define 10 tools', () => {
      expect(TOOL_DEFINITIONS).toHaveLength(10);
    });

    it('should have unique tool names', () => {
      const names = TOOL_DEFINITIONS.map(t => t.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toEqual(uniqueNames);
    });

    it('should define search_context tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'search_context');
      expect(tool).toBeDefined();
      expect(tool?.description).toContain('Semantic search');
      expect(tool?.inputSchema.required).toContain('query');
    });

    it('should define get_item tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'get_item');
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.properties).toHaveProperty('id');
      expect(tool?.inputSchema.properties).toHaveProperty('path');
    });

    it('should define add_knowledge tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'add_knowledge');
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.required).toContain('name');
      expect(tool?.inputSchema.required).toContain('content');
    });

    it('should define add_relation tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'add_relation');
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.required).toContain('sourceId');
      expect(tool?.inputSchema.required).toContain('targetId');
      expect(tool?.inputSchema.required).toContain('relationType');
    });

    it('should define query_graph tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'query_graph');
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.required).toContain('startId');
    });

    it('should define find_path tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'find_path');
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.required).toContain('sourceId');
      expect(tool?.inputSchema.required).toContain('targetId');
    });

    it('should define run_drift_check tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'run_drift_check');
      expect(tool).toBeDefined();
    });

    it('should define reindex tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'reindex');
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.properties).toHaveProperty('types');
    });

    it('should define export_shadow tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'export_shadow');
      expect(tool).toBeDefined();
    });

    it('should define get_stats tool', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'get_stats');
      expect(tool).toBeDefined();
    });

    it('should have valid input schemas', () => {
      for (const tool of TOOL_DEFINITIONS) {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      }
    });

    it('should have descriptions for all tools', () => {
      for (const tool of TOOL_DEFINITIONS) {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(10);
      }
    });
  });

  describe('Tool Input Schemas', () => {
    it('search_context should accept type filter', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'search_context');
      const typeProperty = tool?.inputSchema.properties?.type as { enum?: string[] };
      expect(typeProperty?.enum).toContain('workflow');
      expect(typeProperty?.enum).toContain('agent');
      expect(typeProperty?.enum).toContain('code');
    });

    it('add_relation should accept all relation types', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'add_relation');
      const relationProperty = tool?.inputSchema.properties?.relationType as { enum?: string[] };
      expect(relationProperty?.enum).toContain('uses');
      expect(relationProperty?.enum).toContain('implements');
      expect(relationProperty?.enum).toContain('depends_on');
      expect(relationProperty?.enum).toContain('tests');
      expect(relationProperty?.enum).toContain('documents');
    });

    it('query_graph should accept direction parameter', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'query_graph');
      const directionProperty = tool?.inputSchema.properties?.direction as { enum?: string[] };
      expect(directionProperty?.enum).toContain('outgoing');
      expect(directionProperty?.enum).toContain('incoming');
      expect(directionProperty?.enum).toContain('both');
    });

    it('reindex should accept type filter', () => {
      const tool = TOOL_DEFINITIONS.find(t => t.name === 'reindex');
      const typesProperty = tool?.inputSchema.properties?.types as { items?: { enum?: string[] } };
      expect(typesProperty?.items?.enum).toContain('context');
      expect(typesProperty?.items?.enum).toContain('code');
      expect(typesProperty?.items?.enum).toContain('git');
    });
  });
});
