/**
 * Cross-Tool Exporter
 * 
 * Exports database content to various AI tool formats:
 * - GitHub Copilot (.github/copilot-instructions.md)
 * - Cline (.clinerules)
 * - Antigravity (.agent/)
 * - Windsurf (.windsurf/rules.md)
 * - Aider (.aider.conf.yml)
 * - Continue (.continue/config.json)
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { DatabaseClient, type ContextItem, type SyncState } from '../db/client.js';
import type { ContextType, SyncStatus } from '../db/schema.js';

/**
 * Supported AI tools for export
 */
export type AIToolName = 'copilot' | 'cline' | 'antigravity' | 'windsurf' | 'aider' | 'continue';

/**
 * Export configuration
 */
export interface ExportConfig {
  tools: AIToolName[];
  includeTypes: ContextType[];
  force: boolean;
  verbose: boolean;
}

/**
 * Export result for a single tool
 */
export interface ToolExportResult {
  tool: AIToolName;
  success: boolean;
  files: string[];
  errors: string[];
}

/**
 * Overall export result
 */
export interface ExportResult {
  timestamp: string;
  results: ToolExportResult[];
  totalFiles: number;
  totalErrors: number;
}

/**
 * Default export configuration
 */
const DEFAULT_CONFIG: ExportConfig = {
  tools: ['copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue'],
  includeTypes: ['workflow', 'agent', 'command', 'config', 'knowledge'],
  force: false,
  verbose: false
};

/**
 * Cross-tool exporter class
 */
export class CrossToolExporter {
  private db: DatabaseClient;
  private projectRoot: string;
  private config: ExportConfig;

  constructor(db: DatabaseClient, projectRoot: string, config: Partial<ExportConfig> = {}) {
    this.db = db;
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Export to all configured tools
   */
  async exportAll(): Promise<ExportResult> {
    const result: ExportResult = {
      timestamp: new Date().toISOString(),
      results: [],
      totalFiles: 0,
      totalErrors: 0
    };

    for (const tool of this.config.tools) {
      const toolResult = await this.exportToTool(tool);
      result.results.push(toolResult);
      result.totalFiles += toolResult.files.length;
      result.totalErrors += toolResult.errors.length;
    }

    return result;
  }

  /**
   * Export to a specific tool
   */
  async exportToTool(tool: AIToolName): Promise<ToolExportResult> {
    const result: ToolExportResult = {
      tool,
      success: false,
      files: [],
      errors: []
    };

    try {
      switch (tool) {
        case 'copilot':
          await this.exportToCopilot(result);
          break;
        case 'cline':
          await this.exportToCline(result);
          break;
        case 'antigravity':
          await this.exportToAntigravity(result);
          break;
        case 'windsurf':
          await this.exportToWindsurf(result);
          break;
        case 'aider':
          await this.exportToAider(result);
          break;
        case 'continue':
          await this.exportToContinue(result);
          break;
      }

      result.success = result.errors.length === 0;

      // Update sync state
      this.updateToolSyncState(tool, result.success);

    } catch (error) {
      result.errors.push(`Export failed: ${error}`);
    }

    return result;
  }

  /**
   * Export to GitHub Copilot format
   * Output: .github/copilot-instructions.md
   */
  private async exportToCopilot(result: ToolExportResult): Promise<void> {
    const outputPath = path.join(this.projectRoot, '.github', 'copilot-instructions.md');
    
    // Check if file exists and is not managed
    if (!this.config.force && fs.existsSync(outputPath)) {
      if (!this.isManagedFile(outputPath)) {
        result.errors.push('copilot-instructions.md exists and is not managed. Use force=true to overwrite.');
        return;
      }
    }

    const content = this.generateCopilotContent();
    this.ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, content, 'utf-8');
    result.files.push('.github/copilot-instructions.md');
  }

  /**
   * Generate GitHub Copilot content
   */
  private generateCopilotContent(): string {
    const lines: string[] = [
      '<!-- Auto-generated from .ai-context.db - Edit source context, not this file -->',
      '',
      '# Copilot Instructions',
      '',
      this.generateProjectOverview(),
      '',
      '## Code Style & Conventions',
      '',
      this.generateCodeConventions(),
      '',
      '## Architecture',
      '',
      this.generateArchitectureSection(),
      '',
      '## Important Files',
      '',
      this.generateImportantFiles(),
      '',
      '## Testing Guidelines',
      '',
      this.generateTestingGuidelines(),
      '',
      '---',
      `*Auto-generated: ${new Date().toISOString()}*`
    ];

    return lines.join('\n');
  }

  /**
   * Export to Cline format
   * Output: .clinerules
   */
  private async exportToCline(result: ToolExportResult): Promise<void> {
    const outputPath = path.join(this.projectRoot, '.clinerules');
    
    if (!this.config.force && fs.existsSync(outputPath)) {
      if (!this.isManagedFile(outputPath)) {
        result.errors.push('.clinerules exists and is not managed. Use force=true to overwrite.');
        return;
      }
    }

    const content = this.generateClineContent();
    fs.writeFileSync(outputPath, content, 'utf-8');
    result.files.push('.clinerules');
  }

  /**
   * Generate Cline content
   */
  private generateClineContent(): string {
    const lines: string[] = [
      '# Cline Rules',
      '# Auto-generated from .ai-context.db',
      '',
      '## Project Context',
      '',
      this.generateProjectOverview(),
      '',
      '## Rules',
      '',
      this.generateRulesSection(),
      '',
      '## Workflows',
      '',
      this.generateWorkflowsSummary(),
      '',
      '---',
      `# Generated: ${new Date().toISOString()}`
    ];

    return lines.join('\n');
  }

  /**
   * Export to Antigravity format
   * Output: .agent/context.md
   */
  private async exportToAntigravity(result: ToolExportResult): Promise<void> {
    const outputDir = path.join(this.projectRoot, '.agent');
    const outputPath = path.join(outputDir, 'context.md');
    
    if (!this.config.force && fs.existsSync(outputPath)) {
      if (!this.isManagedFile(outputPath)) {
        result.errors.push('.agent/context.md exists and is not managed. Use force=true to overwrite.');
        return;
      }
    }

    this.ensureDir(outputDir);
    const content = this.generateAntigravityContent();
    fs.writeFileSync(outputPath, content, 'utf-8');
    result.files.push('.agent/context.md');
  }

  /**
   * Generate Antigravity content
   */
  private generateAntigravityContent(): string {
    const lines: string[] = [
      '<!-- Auto-generated from .ai-context.db -->',
      '',
      '# Agent Context',
      '',
      this.generateProjectOverview(),
      '',
      '## Agents',
      '',
      this.generateAgentsSection(),
      '',
      '## Commands',
      '',
      this.generateCommandsSection(),
      '',
      '## Knowledge Graph',
      '',
      this.generateKnowledgeGraphSummary(),
      '',
      '---',
      `*Generated: ${new Date().toISOString()}*`
    ];

    return lines.join('\n');
  }

  /**
   * Export to Windsurf format
   * Output: .windsurf/rules.md
   */
  private async exportToWindsurf(result: ToolExportResult): Promise<void> {
    const outputDir = path.join(this.projectRoot, '.windsurf');
    const outputPath = path.join(outputDir, 'rules.md');
    
    if (!this.config.force && fs.existsSync(outputPath)) {
      if (!this.isManagedFile(outputPath)) {
        result.errors.push('.windsurf/rules.md exists and is not managed. Use force=true to overwrite.');
        return;
      }
    }

    this.ensureDir(outputDir);
    const content = this.generateWindsurfContent();
    fs.writeFileSync(outputPath, content, 'utf-8');
    result.files.push('.windsurf/rules.md');
  }

  /**
   * Generate Windsurf content
   */
  private generateWindsurfContent(): string {
    const lines: string[] = [
      '<!-- Auto-generated from .ai-context.db -->',
      '',
      '# Windsurf Rules',
      '',
      this.generateProjectOverview(),
      '',
      '## Coding Guidelines',
      '',
      this.generateCodeConventions(),
      '',
      '## Project Structure',
      '',
      this.generateArchitectureSection(),
      '',
      '## Workflows',
      '',
      this.generateWorkflowsSummary(),
      '',
      '---',
      `*Generated: ${new Date().toISOString()}*`
    ];

    return lines.join('\n');
  }

  /**
   * Export to Aider format
   * Output: .aider.conf.yml and .aiderignore
   */
  private async exportToAider(result: ToolExportResult): Promise<void> {
    const confPath = path.join(this.projectRoot, '.aider.conf.yml');
    const ignorePath = path.join(this.projectRoot, '.aiderignore');
    
    if (!this.config.force && fs.existsSync(confPath)) {
      if (!this.isManagedFile(confPath)) {
        result.errors.push('.aider.conf.yml exists and is not managed. Use force=true to overwrite.');
        return;
      }
    }

    // Generate config file
    const confContent = this.generateAiderConfig();
    fs.writeFileSync(confPath, confContent, 'utf-8');
    result.files.push('.aider.conf.yml');

    // Generate ignore file (only if it doesn't exist or force is true)
    if (this.config.force || !fs.existsSync(ignorePath)) {
      const ignoreContent = this.generateAiderIgnore();
      fs.writeFileSync(ignorePath, ignoreContent, 'utf-8');
      result.files.push('.aiderignore');
    }
  }

  /**
   * Generate Aider config content
   */
  private generateAiderConfig(): string {
    const projectName = path.basename(this.projectRoot);
    
    const lines: string[] = [
      '# Aider Configuration',
      '# Auto-generated from .ai-context.db',
      '',
      '# Model settings',
      'model: claude-3-5-sonnet-20241022',
      '',
      '# Project context',
      `# Project: ${projectName}`,
      '#',
      '# Key context from database:',
    ];

    // Add workflow summaries as comments
    const workflows = this.db.getItemsByType('workflow');
    if (workflows.length > 0) {
      lines.push('# Workflows:');
      for (const workflow of workflows.slice(0, 5)) {
        lines.push(`#   - ${workflow.name}`);
      }
    }

    // Add knowledge items as comments
    const knowledge = this.db.getItemsByType('knowledge');
    if (knowledge.length > 0) {
      lines.push('#');
      lines.push('# Knowledge:');
      for (const item of knowledge.slice(0, 10)) {
        lines.push(`#   - ${item.name}`);
      }
    }

    lines.push('');
    lines.push('# Auto-commits');
    lines.push('auto-commits: true');
    lines.push('');
    lines.push('# Lint command (if applicable)');
    lines.push('# lint-cmd: npm run lint');
    lines.push('');
    lines.push(`# Generated: ${new Date().toISOString()}`);

    return lines.join('\n');
  }

  /**
   * Generate Aider ignore content
   */
  private generateAiderIgnore(): string {
    const lines: string[] = [
      '# Aider Ignore',
      '# Auto-generated from .ai-context.db',
      '',
      '# Database file',
      '.ai-context.db',
      '.ai-context.db-journal',
      '',
      '# Generated files',
      '.ai-context/',
      '.ai-context-export/',
      '',
      '# Dependencies',
      'node_modules/',
      '__pycache__/',
      '.venv/',
      '',
      '# Build outputs',
      'dist/',
      'build/',
      '',
      '# Large files',
      '*.lock',
      'package-lock.json',
      '',
      `# Generated: ${new Date().toISOString()}`
    ];

    return lines.join('\n');
  }

  /**
   * Export to Continue format
   * Output: .continue/config.json
   */
  private async exportToContinue(result: ToolExportResult): Promise<void> {
    const outputDir = path.join(this.projectRoot, '.continue');
    const outputPath = path.join(outputDir, 'config.json');
    
    if (!this.config.force && fs.existsSync(outputPath)) {
      // Continue config is JSON, check if it has our marker
      try {
        const existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
        if (!existing._generatedByAiContext && !this.config.force) {
          result.errors.push('.continue/config.json exists and is not managed. Use force=true to overwrite.');
          return;
        }
      } catch {
        // Can't parse, let it be overwritten
      }
    }

    this.ensureDir(outputDir);
    const content = this.generateContinueConfig();
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8');
    result.files.push('.continue/config.json');
  }

  /**
   * Generate Continue config
   */
  private generateContinueConfig(): Record<string, unknown> {
    const projectName = path.basename(this.projectRoot);
    const workflows = this.db.getItemsByType('workflow');
    const knowledge = this.db.getItemsByType('knowledge');

    // Build context docs for Continue
    const contextDocs: Array<{ name: string; content: string }> = [];

    // Add workflows
    for (const workflow of workflows.slice(0, 10)) {
      contextDocs.push({
        name: `workflow:${workflow.name}`,
        content: workflow.content.slice(0, 2000) // Limit content size
      });
    }

    // Add knowledge
    for (const item of knowledge.slice(0, 10)) {
      contextDocs.push({
        name: `knowledge:${item.name}`,
        content: item.content.slice(0, 1000)
      });
    }

    return {
      _generatedByAiContext: true,
      _generatedAt: new Date().toISOString(),
      models: [
        {
          title: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022'
        }
      ],
      customCommands: [
        {
          name: 'context',
          description: `Get AI context for ${projectName}`,
          prompt: this.generateProjectOverview()
        }
      ],
      docs: contextDocs.map(doc => ({
        name: doc.name,
        startUrl: '',
        faviconUrl: '',
        title: doc.name,
        content: doc.content
      })),
      tabAutocompleteModel: {
        title: 'Starcoder',
        provider: 'ollama',
        model: 'starcoder'
      },
      allowAnonymousTelemetry: false,
      embeddingsProvider: {
        provider: 'transformers.js'
      }
    };
  }

  // ==================== Content Generation Helpers ====================

  /**
   * Generate project overview section
   */
  private generateProjectOverview(): string {
    const projectName = path.basename(this.projectRoot);
    const stats = this.db.getStats();
    
    const lines: string[] = [
      `This is the ${projectName} project.`,
      '',
      `Database contains:`,
      `- ${stats.items} context items`,
      `- ${stats.relations} knowledge graph relations`,
      `- ${stats.commits} indexed commits`
    ];

    // Add config items if available
    const configs = this.db.getItemsByType('config');
    if (configs.length > 0) {
      const mainConfig = configs[0];
      if (mainConfig.content) {
        lines.push('');
        lines.push('From project configuration:');
        // Extract key info from config
        const contentLines = mainConfig.content.split('\n').slice(0, 10);
        for (const line of contentLines) {
          if (line.trim()) {
            lines.push(line);
          }
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate code conventions section
   */
  private generateCodeConventions(): string {
    const knowledge = this.db.getItemsByType('knowledge');
    const conventions = knowledge.filter(k => 
      k.name.toLowerCase().includes('convention') ||
      k.name.toLowerCase().includes('style') ||
      k.name.toLowerCase().includes('rule')
    );

    if (conventions.length === 0) {
      return 'No specific code conventions documented yet.';
    }

    const lines: string[] = [];
    for (const conv of conventions.slice(0, 5)) {
      lines.push(`### ${conv.name}`);
      lines.push('');
      lines.push(conv.content.slice(0, 500));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate architecture section
   */
  private generateArchitectureSection(): string {
    const workflows = this.db.getItemsByType('workflow');
    const archWorkflows = workflows.filter(w =>
      w.name.toLowerCase().includes('architecture') ||
      w.name.toLowerCase().includes('structure') ||
      w.name.toLowerCase().includes('design')
    );

    if (archWorkflows.length === 0) {
      return 'See project documentation for architecture details.';
    }

    const lines: string[] = [];
    for (const workflow of archWorkflows.slice(0, 3)) {
      lines.push(`### ${workflow.name}`);
      lines.push('');
      lines.push(workflow.content.slice(0, 800));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate important files section
   */
  private generateImportantFiles(): string {
    const items = this.db.getAllItems();
    const filesWithPaths = items.filter(item => item.filePath);
    
    if (filesWithPaths.length === 0) {
      return 'No specific important files documented.';
    }

    const lines: string[] = [];
    const uniquePaths = [...new Set(filesWithPaths.map(i => i.filePath))].slice(0, 15);
    
    for (const filePath of uniquePaths) {
      lines.push(`- \`${filePath}\``);
    }

    return lines.join('\n');
  }

  /**
   * Generate testing guidelines section
   */
  private generateTestingGuidelines(): string {
    const knowledge = this.db.getItemsByType('knowledge');
    const testKnowledge = knowledge.filter(k =>
      k.name.toLowerCase().includes('test') ||
      k.name.toLowerCase().includes('testing')
    );

    if (testKnowledge.length === 0) {
      return 'Follow standard testing practices for this project type.';
    }

    const lines: string[] = [];
    for (const item of testKnowledge.slice(0, 3)) {
      lines.push(item.content.slice(0, 400));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate rules section (for Cline)
   */
  private generateRulesSection(): string {
    const knowledge = this.db.getItemsByType('knowledge');
    
    if (knowledge.length === 0) {
      return '- Follow project conventions\n- Write clean, maintainable code';
    }

    const lines: string[] = [];
    for (const item of knowledge.slice(0, 10)) {
      // Format as a rule
      const ruleText = item.content.split('\n')[0].slice(0, 100);
      lines.push(`- ${item.name}: ${ruleText}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate workflows summary
   */
  private generateWorkflowsSummary(): string {
    const workflows = this.db.getItemsByType('workflow');
    
    if (workflows.length === 0) {
      return 'No workflows documented yet.';
    }

    const lines: string[] = [];
    for (const workflow of workflows.slice(0, 10)) {
      lines.push(`### ${workflow.name}`);
      lines.push('');
      // First paragraph only
      const firstPara = workflow.content.split('\n\n')[0] || workflow.content.slice(0, 200);
      lines.push(firstPara);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate agents section
   */
  private generateAgentsSection(): string {
    const agents = this.db.getItemsByType('agent');
    
    if (agents.length === 0) {
      return 'No agents defined.';
    }

    const lines: string[] = [];
    for (const agent of agents.slice(0, 10)) {
      lines.push(`### ${agent.name}`);
      lines.push('');
      lines.push(agent.content.slice(0, 500));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate commands section
   */
  private generateCommandsSection(): string {
    const commands = this.db.getItemsByType('command');
    
    if (commands.length === 0) {
      return 'No commands documented.';
    }

    const lines: string[] = [];
    for (const command of commands.slice(0, 15)) {
      lines.push(`- **${command.name}**: ${command.content.split('\n')[0].slice(0, 80)}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate knowledge graph summary
   */
  private generateKnowledgeGraphSummary(): string {
    const stats = this.db.getStats();
    
    return `The knowledge graph contains ${stats.relations} relationships between context items. Use the MCP server to query and traverse the graph.`;
  }

  // ==================== Utility Methods ====================

  /**
   * Check if a file is managed by this tool
   */
  private isManagedFile(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes('Auto-generated from .ai-context.db') ||
           content.includes('_generatedByAiContext');
  }

  /**
   * Ensure directory exists
   */
  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Hash content for change detection
   */
  private hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  /**
   * Update sync state for a tool
   */
  private updateToolSyncState(tool: AIToolName, success: boolean): void {
    const state: SyncState = {
      id: `export:${tool}`,
      tool: `export-${tool}`,
      lastSync: new Date().toISOString(),
      status: success ? 'synced' as SyncStatus : 'error' as SyncStatus
    };

    this.db.updateSyncState(state);
  }

  /**
   * Get sync status for all tools
   */
  getSyncStatus(): Record<AIToolName, { exists: boolean; managed: boolean; lastSync?: string }> {
    const status: Record<AIToolName, { exists: boolean; managed: boolean; lastSync?: string }> = {
      copilot: { exists: false, managed: false },
      cline: { exists: false, managed: false },
      antigravity: { exists: false, managed: false },
      windsurf: { exists: false, managed: false },
      aider: { exists: false, managed: false },
      continue: { exists: false, managed: false }
    };

    const toolPaths: Record<AIToolName, string> = {
      copilot: '.github/copilot-instructions.md',
      cline: '.clinerules',
      antigravity: '.agent/context.md',
      windsurf: '.windsurf/rules.md',
      aider: '.aider.conf.yml',
      continue: '.continue/config.json'
    };

    for (const [tool, relativePath] of Object.entries(toolPaths)) {
      const fullPath = path.join(this.projectRoot, relativePath);
      const exists = fs.existsSync(fullPath);
      const managed = exists ? this.isManagedFile(fullPath) : false;
      
      // Get last sync time from database
      const syncStates = this.db.getSyncState(`export-${tool}`);
      const lastSync = syncStates.length > 0 ? syncStates[0].lastSync : undefined;

      status[tool as AIToolName] = { exists, managed, lastSync };
    }

    return status;
  }
}

/**
 * Get list of supported tools
 */
export function getSupportedTools(): AIToolName[] {
  return ['copilot', 'cline', 'antigravity', 'windsurf', 'aider', 'continue'];
}

/**
 * Get tool display names
 */
export function getToolDisplayName(tool: AIToolName): string {
  const names: Record<AIToolName, string> = {
    copilot: 'GitHub Copilot',
    cline: 'Cline',
    antigravity: 'Antigravity',
    windsurf: 'Windsurf',
    aider: 'Aider',
    continue: 'Continue'
  };
  return names[tool];
}

/**
 * Get tool output paths
 */
export function getToolOutputPath(tool: AIToolName): string {
  const paths: Record<AIToolName, string> = {
    copilot: '.github/copilot-instructions.md',
    cline: '.clinerules',
    antigravity: '.agent/context.md',
    windsurf: '.windsurf/rules.md',
    aider: '.aider.conf.yml',
    continue: '.continue/config.json'
  };
  return paths[tool];
}
