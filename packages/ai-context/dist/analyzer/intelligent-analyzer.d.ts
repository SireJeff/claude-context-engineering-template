/**
 * Intelligent Analyzer
 *
 * Uses OpenRouter API to intelligently analyze codebases, docs, and tool configurations.
 * This is the core of the "forcefully intelligent" initialization.
 */
import { type AITool } from '../db/schema.js';
/**
 * Discovery result for a file
 */
export interface DiscoveredFile {
    path: string;
    relativePath: string;
    type: 'doc' | 'code' | 'config' | 'tool_config';
    tool?: AITool;
    size: number;
    content?: string;
}
/**
 * Analysis result
 */
export interface AnalysisResult {
    summary: string;
    techStack: {
        languages: string[];
        frameworks: string[];
        tools: string[];
    };
    workflows: Array<{
        name: string;
        description: string;
        entryPoint: string;
        steps: string[];
    }>;
    architecture: {
        pattern: string;
        components: string[];
        integrations: string[];
    };
    existingContext: {
        tools: AITool[];
        files: DiscoveredFile[];
    };
    suggestions: {
        contextFiles: string[];
        workflows: string[];
        agents: string[];
        commands: string[];
    };
}
/**
 * Intelligent analyzer using OpenRouter
 */
export declare class IntelligentAnalyzer {
    private client;
    private projectRoot;
    constructor(projectRoot: string);
    /**
     * Check if intelligent analysis is available
     */
    isIntelligentModeAvailable(): boolean;
    /**
     * Discover all documentation files (.md files)
     */
    discoverDocs(): Promise<DiscoveredFile[]>;
    /**
     * Discover AI tool configurations
     */
    discoverToolConfigs(): Promise<DiscoveredFile[]>;
    /**
     * Discover source code files
     */
    discoverCode(): Promise<DiscoveredFile[]>;
    /**
     * Read file content safely
     */
    private readFileContent;
    /**
     * Perform full intelligent analysis
     */
    analyze(): Promise<AnalysisResult>;
    /**
     * Detect tech stack without AI
     */
    private detectTechStackBasic;
    /**
     * Perform intelligent analysis using OpenRouter
     */
    private performIntelligentAnalysis;
    /**
     * Generate basic summary without AI
     */
    private generateBasicSummary;
    /**
     * Generate embeddings for discovered content
     */
    generateEmbeddings(files: DiscoveredFile[]): Promise<Map<string, number[]>>;
}
/**
 * Create an intelligent analyzer
 */
export declare function createIntelligentAnalyzer(projectRoot: string): IntelligentAnalyzer;
//# sourceMappingURL=intelligent-analyzer.d.ts.map