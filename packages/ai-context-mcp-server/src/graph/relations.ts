/**
 * Knowledge Graph Relations
 * 
 * Defines typed relationships for the knowledge graph ontology.
 */

import type { RelationType } from '../db/schema.js';

/**
 * Relation type definitions with semantics
 */
export const RELATION_DEFINITIONS: Record<RelationType, {
  description: string;
  inverse: RelationType | null;
  category: 'dependency' | 'hierarchy' | 'association' | 'action';
}> = {
  uses: {
    description: 'X uses Y (library, function, component)',
    inverse: null,
    category: 'dependency'
  },
  implements: {
    description: 'X implements Y (interface, pattern, specification)',
    inverse: null,
    category: 'hierarchy'
  },
  depends_on: {
    description: 'X depends on Y (runtime or build dependency)',
    inverse: null,
    category: 'dependency'
  },
  references: {
    description: 'X references Y (documentation, mention)',
    inverse: null,
    category: 'association'
  },
  tests: {
    description: 'X tests Y (test file to source)',
    inverse: null,
    category: 'action'
  },
  documents: {
    description: 'X documents Y (documentation to code)',
    inverse: null,
    category: 'association'
  },
  extends: {
    description: 'X extends Y (class inheritance, prototype chain)',
    inverse: null,
    category: 'hierarchy'
  },
  contains: {
    description: 'X contains Y (file contains function, module contains class)',
    inverse: null,
    category: 'hierarchy'
  },
  calls: {
    description: 'X calls Y (function call, method invocation)',
    inverse: null,
    category: 'action'
  },
  imports: {
    description: 'X imports Y (ES import, require, use)',
    inverse: null,
    category: 'dependency'
  },
  configures: {
    description: 'X configures Y (config file to service)',
    inverse: null,
    category: 'association'
  },
  authenticates: {
    description: 'X authenticates Y (auth provider to resource)',
    inverse: null,
    category: 'action'
  },
  validates: {
    description: 'X validates Y (validator to data)',
    inverse: null,
    category: 'action'
  },
  transforms: {
    description: 'X transforms Y (data transformation, pipeline)',
    inverse: null,
    category: 'action'
  }
};

/**
 * Relation categories
 */
export const RELATION_CATEGORIES = {
  dependency: {
    name: 'Dependency',
    description: 'One entity requires another to function',
    relations: ['uses', 'depends_on', 'imports'] as RelationType[]
  },
  hierarchy: {
    name: 'Hierarchy',
    description: 'Parent-child or inheritance relationships',
    relations: ['implements', 'extends', 'contains'] as RelationType[]
  },
  association: {
    name: 'Association',
    description: 'Loose coupling or documentation relationships',
    relations: ['references', 'documents', 'configures'] as RelationType[]
  },
  action: {
    name: 'Action',
    description: 'Active relationships involving operations',
    relations: ['tests', 'calls', 'authenticates', 'validates', 'transforms'] as RelationType[]
  }
};

/**
 * Get all relations in a category
 */
export function getRelationsByCategory(category: keyof typeof RELATION_CATEGORIES): RelationType[] {
  return RELATION_CATEGORIES[category].relations;
}

/**
 * Get the category of a relation
 */
export function getRelationCategory(relationType: RelationType): keyof typeof RELATION_CATEGORIES {
  return RELATION_DEFINITIONS[relationType].category;
}

/**
 * Check if a relation is valid between two entity types
 */
export function isValidRelation(
  sourceType: string,
  targetType: string,
  relationType: RelationType
): boolean {
  // Define valid source-target type combinations
  const validCombinations: Record<RelationType, Array<[string | '*', string | '*']>> = {
    uses: [['*', '*']],
    implements: [['code', 'code'], ['workflow', 'workflow']],
    depends_on: [['*', '*']],
    references: [['*', '*']],
    tests: [['code', 'code']],
    documents: [['workflow', 'code'], ['agent', 'code'], ['command', 'code']],
    extends: [['code', 'code']],
    contains: [['code', 'code'], ['workflow', 'workflow']],
    calls: [['code', 'code']],
    imports: [['code', 'code']],
    configures: [['config', '*']],
    authenticates: [['code', 'code'], ['workflow', 'workflow']],
    validates: [['code', '*']],
    transforms: [['code', 'code'], ['workflow', 'workflow']]
  };

  const valid = validCombinations[relationType];
  if (!valid) return false;

  return valid.some(([src, tgt]) => 
    (src === '*' || src === sourceType) && 
    (tgt === '*' || tgt === targetType)
  );
}

/**
 * Suggest relations based on content analysis
 */
export function suggestRelations(
  sourceContent: string,
  targetName: string,
  sourceType: string,
  targetType: string
): RelationType[] {
  const suggestions: RelationType[] = [];

  // Check for import patterns
  if (sourceContent.includes(`import`) && sourceContent.includes(targetName)) {
    suggestions.push('imports');
  }

  // Check for test patterns
  if (sourceContent.includes('test') || sourceContent.includes('spec')) {
    if (sourceContent.toLowerCase().includes(targetName.toLowerCase())) {
      suggestions.push('tests');
    }
  }

  // Check for documentation patterns
  if (sourceType === 'workflow' || sourceType === 'agent') {
    if (sourceContent.toLowerCase().includes(targetName.toLowerCase())) {
      suggestions.push('documents');
    }
  }

  // Check for configuration patterns
  if (sourceType === 'config') {
    suggestions.push('configures');
  }

  // Check for function calls
  if (sourceContent.includes(`${targetName}(`)) {
    suggestions.push('calls');
  }

  // Check for extends/implements patterns
  if (sourceContent.includes(`extends ${targetName}`)) {
    suggestions.push('extends');
  }
  if (sourceContent.includes(`implements ${targetName}`)) {
    suggestions.push('implements');
  }

  return [...new Set(suggestions)];
}
