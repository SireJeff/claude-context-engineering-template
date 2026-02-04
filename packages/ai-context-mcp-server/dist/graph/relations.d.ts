/**
 * Knowledge Graph Relations
 *
 * Defines typed relationships for the knowledge graph ontology.
 */
import type { RelationType } from '../db/schema.js';
/**
 * Relation type definitions with semantics
 */
export declare const RELATION_DEFINITIONS: Record<RelationType, {
    description: string;
    inverse: RelationType | null;
    category: 'dependency' | 'hierarchy' | 'association' | 'action';
}>;
/**
 * Relation categories
 */
export declare const RELATION_CATEGORIES: {
    dependency: {
        name: string;
        description: string;
        relations: RelationType[];
    };
    hierarchy: {
        name: string;
        description: string;
        relations: RelationType[];
    };
    association: {
        name: string;
        description: string;
        relations: RelationType[];
    };
    action: {
        name: string;
        description: string;
        relations: RelationType[];
    };
};
/**
 * Get all relations in a category
 */
export declare function getRelationsByCategory(category: keyof typeof RELATION_CATEGORIES): RelationType[];
/**
 * Get the category of a relation
 */
export declare function getRelationCategory(relationType: RelationType): keyof typeof RELATION_CATEGORIES;
/**
 * Check if a relation is valid between two entity types
 */
export declare function isValidRelation(sourceType: string, targetType: string, relationType: RelationType): boolean;
/**
 * Suggest relations based on content analysis
 */
export declare function suggestRelations(sourceContent: string, targetName: string, sourceType: string, targetType: string): RelationType[];
//# sourceMappingURL=relations.d.ts.map