/**
 * Knowledge Graph Relations
 *
 * Defines typed relationships for the knowledge graph ontology.
 */
/**
 * Relation type definitions with semantics
 */
export const RELATION_DEFINITIONS = {
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
        relations: ['uses', 'depends_on', 'imports']
    },
    hierarchy: {
        name: 'Hierarchy',
        description: 'Parent-child or inheritance relationships',
        relations: ['implements', 'extends', 'contains']
    },
    association: {
        name: 'Association',
        description: 'Loose coupling or documentation relationships',
        relations: ['references', 'documents', 'configures']
    },
    action: {
        name: 'Action',
        description: 'Active relationships involving operations',
        relations: ['tests', 'calls', 'authenticates', 'validates', 'transforms']
    }
};
/**
 * Get all relations in a category
 */
export function getRelationsByCategory(category) {
    return RELATION_CATEGORIES[category].relations;
}
/**
 * Get the category of a relation
 */
export function getRelationCategory(relationType) {
    return RELATION_DEFINITIONS[relationType].category;
}
/**
 * Check if a relation is valid between two entity types
 */
export function isValidRelation(sourceType, targetType, relationType) {
    // Define valid source-target type combinations
    const validCombinations = {
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
    if (!valid)
        return false;
    return valid.some(([src, tgt]) => (src === '*' || src === sourceType) &&
        (tgt === '*' || tgt === targetType));
}
/**
 * Suggest relations based on content analysis
 */
export function suggestRelations(sourceContent, targetName, sourceType, targetType) {
    const suggestions = [];
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
//# sourceMappingURL=relations.js.map