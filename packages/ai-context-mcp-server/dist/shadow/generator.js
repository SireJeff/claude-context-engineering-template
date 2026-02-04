/**
 * Shadow File Generator
 *
 * Generates .md files from database for git visibility.
 * Database is source of truth, files are auto-generated shadows.
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
    outputDir: '.ai-context',
    includeTypes: ['workflow', 'agent', 'command', 'config'],
    generateIndex: true,
    headerComment: '<!-- Auto-generated from .ai-context.db - DO NOT EDIT DIRECTLY -->'
};
/**
 * Shadow file generator
 */
export class ShadowGenerator {
    db;
    projectRoot;
    config;
    constructor(db, projectRoot, config = {}) {
        this.db = db;
        this.projectRoot = projectRoot;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Generate all shadow files
     */
    async generateAll() {
        const result = {
            generated: [],
            updated: [],
            unchanged: [],
            deleted: [],
            errors: []
        };
        // Ensure output directory exists
        const outputPath = path.join(this.projectRoot, this.config.outputDir);
        this.ensureDir(outputPath);
        // Track which files we generate
        const generatedPaths = new Set();
        // Generate files by type
        for (const type of this.config.includeTypes) {
            const typeDir = this.getTypePath(type);
            this.ensureDir(path.join(outputPath, typeDir));
            const items = this.db.getItemsByType(type);
            for (const item of items) {
                try {
                    const filePath = this.generateFile(item);
                    generatedPaths.add(filePath);
                    // Check if file was created, updated, or unchanged
                    const syncState = this.db.getSyncState('shadow').find(s => s.id === item.id);
                    if (!syncState) {
                        result.generated.push(filePath);
                    }
                    else if (syncState.contentHash !== this.hashContent(item.content)) {
                        result.updated.push(filePath);
                    }
                    else {
                        result.unchanged.push(filePath);
                    }
                    // Update sync state
                    this.updateSyncState(item);
                }
                catch (error) {
                    result.errors.push(`Error generating ${item.id}: ${error}`);
                }
            }
        }
        // Generate index file if enabled
        if (this.config.generateIndex) {
            try {
                const indexPath = this.generateIndex();
                generatedPaths.add(indexPath);
                result.generated.push(indexPath);
            }
            catch (error) {
                result.errors.push(`Error generating index: ${error}`);
            }
        }
        // Clean up orphaned files
        const deletedFiles = this.cleanupOrphans(generatedPaths);
        result.deleted.push(...deletedFiles);
        return result;
    }
    /**
     * Generate a single shadow file
     */
    generateFile(item) {
        const relativePath = this.getItemPath(item);
        const absolutePath = path.join(this.projectRoot, this.config.outputDir, relativePath);
        // Ensure parent directory exists
        this.ensureDir(path.dirname(absolutePath));
        // Generate content with header
        const content = this.formatContent(item);
        // Write file
        fs.writeFileSync(absolutePath, content, 'utf-8');
        return relativePath;
    }
    /**
     * Format content for shadow file
     */
    formatContent(item) {
        const lines = [
            this.config.headerComment,
            '',
            item.content
        ];
        // Add metadata footer
        lines.push('');
        lines.push('---');
        lines.push('');
        lines.push('<!-- Metadata');
        lines.push(`Type: ${item.type}`);
        lines.push(`ID: ${item.id}`);
        if (item.filePath) {
            lines.push(`Source: ${item.filePath}`);
        }
        lines.push(`Updated: ${item.updatedAt || new Date().toISOString()}`);
        lines.push('-->');
        return lines.join('\n');
    }
    /**
     * Generate index file
     */
    generateIndex() {
        const lines = [
            this.config.headerComment,
            '',
            '# AI Context Index',
            '',
            'This directory contains auto-generated AI context files.',
            'Source of truth: `.ai-context.db`',
            '',
            '## Contents',
            ''
        ];
        // Group items by type
        for (const type of this.config.includeTypes) {
            const items = this.db.getItemsByType(type);
            if (items.length === 0)
                continue;
            lines.push(`### ${this.formatTypeName(type)}`);
            lines.push('');
            for (const item of items) {
                const relativePath = this.getItemPath(item);
                lines.push(`- [${item.name}](${relativePath})`);
            }
            lines.push('');
        }
        // Add stats
        const stats = this.db.getStats();
        lines.push('## Statistics');
        lines.push('');
        lines.push(`- **Context Items:** ${stats.items}`);
        lines.push(`- **Relations:** ${stats.relations}`);
        lines.push(`- **Commits Indexed:** ${stats.commits}`);
        lines.push(`- **Embeddings:** ${stats.embeddings}`);
        lines.push('');
        lines.push(`*Last generated: ${new Date().toISOString()}*`);
        const content = lines.join('\n');
        const indexPath = path.join(this.projectRoot, this.config.outputDir, 'README.md');
        fs.writeFileSync(indexPath, content, 'utf-8');
        return 'README.md';
    }
    /**
     * Get path for a type directory
     */
    getTypePath(type) {
        const typePaths = {
            workflow: 'workflows',
            agent: 'agents',
            command: 'commands',
            code: 'code',
            commit: 'commits',
            knowledge: 'knowledge',
            config: ''
        };
        return typePaths[type] || type;
    }
    /**
     * Get relative path for an item
     */
    getItemPath(item) {
        const typeDir = this.getTypePath(item.type);
        const fileName = this.sanitizeFileName(item.name) + '.md';
        if (typeDir) {
            return path.join(typeDir, fileName);
        }
        return fileName;
    }
    /**
     * Sanitize filename
     */
    sanitizeFileName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    /**
     * Format type name for display
     */
    formatTypeName(type) {
        return type.charAt(0).toUpperCase() + type.slice(1) + 's';
    }
    /**
     * Ensure directory exists
     */
    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    /**
     * Hash content for change detection
     */
    hashContent(content) {
        return createHash('sha256').update(content).digest('hex').slice(0, 16);
    }
    /**
     * Update sync state for an item
     */
    updateSyncState(item) {
        const state = {
            id: item.id,
            tool: 'shadow',
            contentHash: this.hashContent(item.content),
            lastSync: new Date().toISOString(),
            filePath: this.getItemPath(item),
            status: 'synced'
        };
        this.db.updateSyncState(state);
    }
    /**
     * Clean up files that no longer exist in database
     */
    cleanupOrphans(validPaths) {
        const deleted = [];
        const outputPath = path.join(this.projectRoot, this.config.outputDir);
        // Get all sync states for shadow files
        const syncStates = this.db.getSyncState('shadow');
        for (const state of syncStates) {
            if (!validPaths.has(state.filePath || '')) {
                // File no longer exists in database, delete it
                const filePath = path.join(outputPath, state.filePath || '');
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    deleted.push(state.filePath || '');
                }
            }
        }
        return deleted;
    }
    /**
     * Check if shadow files are in sync with database
     */
    checkSync() {
        const outdated = [];
        const missing = [];
        for (const type of this.config.includeTypes) {
            const items = this.db.getItemsByType(type);
            for (const item of items) {
                const relativePath = this.getItemPath(item);
                const absolutePath = path.join(this.projectRoot, this.config.outputDir, relativePath);
                const syncState = this.db.getSyncState('shadow').find(s => s.id === item.id);
                if (!fs.existsSync(absolutePath)) {
                    missing.push(relativePath);
                }
                else if (!syncState || syncState.contentHash !== this.hashContent(item.content)) {
                    outdated.push(relativePath);
                }
            }
        }
        return {
            inSync: outdated.length === 0 && missing.length === 0,
            outdated,
            missing
        };
    }
    /**
     * Export database to a single markdown file
     */
    exportToSingleFile(outputPath) {
        const lines = [
            '# AI Context Export',
            '',
            `*Exported: ${new Date().toISOString()}*`,
            ''
        ];
        for (const type of this.config.includeTypes) {
            const items = this.db.getItemsByType(type);
            if (items.length === 0)
                continue;
            lines.push(`## ${this.formatTypeName(type)}`);
            lines.push('');
            for (const item of items) {
                lines.push(`### ${item.name}`);
                lines.push('');
                lines.push(item.content);
                lines.push('');
                lines.push('---');
                lines.push('');
            }
        }
        fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
    }
}
//# sourceMappingURL=generator.js.map