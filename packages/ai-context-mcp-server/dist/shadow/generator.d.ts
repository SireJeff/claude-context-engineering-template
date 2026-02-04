/**
 * Shadow File Generator
 *
 * Generates .md files from database for git visibility.
 * Database is source of truth, files are auto-generated shadows.
 */
import { DatabaseClient } from '../db/client.js';
import type { ContextType } from '../db/schema.js';
/**
 * Shadow file configuration
 */
export interface ShadowConfig {
    outputDir: string;
    includeTypes: ContextType[];
    generateIndex: boolean;
    headerComment: string;
}
/**
 * Shadow generation result
 */
export interface ShadowResult {
    generated: string[];
    updated: string[];
    unchanged: string[];
    deleted: string[];
    errors: string[];
}
/**
 * Shadow file generator
 */
export declare class ShadowGenerator {
    private db;
    private projectRoot;
    private config;
    constructor(db: DatabaseClient, projectRoot: string, config?: Partial<ShadowConfig>);
    /**
     * Generate all shadow files
     */
    generateAll(): Promise<ShadowResult>;
    /**
     * Generate a single shadow file
     */
    private generateFile;
    /**
     * Format content for shadow file
     */
    private formatContent;
    /**
     * Generate index file
     */
    private generateIndex;
    /**
     * Get path for a type directory
     */
    private getTypePath;
    /**
     * Get relative path for an item
     */
    private getItemPath;
    /**
     * Sanitize filename
     */
    private sanitizeFileName;
    /**
     * Format type name for display
     */
    private formatTypeName;
    /**
     * Ensure directory exists
     */
    private ensureDir;
    /**
     * Hash content for change detection
     */
    private hashContent;
    /**
     * Update sync state for an item
     */
    private updateSyncState;
    /**
     * Clean up files that no longer exist in database
     */
    private cleanupOrphans;
    /**
     * Check if shadow files are in sync with database
     */
    checkSync(): {
        inSync: boolean;
        outdated: string[];
        missing: string[];
    };
    /**
     * Export database to a single markdown file
     */
    exportToSingleFile(outputPath: string): void;
}
//# sourceMappingURL=generator.d.ts.map