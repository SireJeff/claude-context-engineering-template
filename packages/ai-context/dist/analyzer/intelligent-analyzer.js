/**
 * Intelligent Analyzer
 *
 * Uses OpenRouter API to intelligently analyze codebases, docs, and tool configurations.
 * This is the core of the "forcefully intelligent" initialization.
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { createOpenRouterClient, hasOpenRouterKey } from '../embeddings/openrouter.js';
import { AI_TOOLS, AI_TOOL_FOLDERS } from '../db/schema.js';
/**
 * Default ignore patterns
 */
const DEFAULT_IGNORE = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/vendor/**',
    '**/__pycache__/**',
    '**/target/**',
    '**/bin/**',
    '**/obj/**',
    '**/.next/**',
    '**/.nuxt/**',
    '**/*.min.js',
    '**/*.map',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml'
];
/**
 * Intelligent analyzer using OpenRouter
 */
export class IntelligentAnalyzer {
    client = null;
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        // Try to create client if API key available
        if (hasOpenRouterKey()) {
            try {
                this.client = createOpenRouterClient();
            }
            catch (error) {
                console.warn('OpenRouter client initialization failed:', error);
            }
        }
    }
    /**
     * Check if intelligent analysis is available
     */
    isIntelligentModeAvailable() {
        return this.client !== null;
    }
    /**
     * Discover all documentation files (.md files)
     */
    async discoverDocs() {
        const files = [];
        const mdFiles = await glob('**/*.md', {
            cwd: this.projectRoot,
            ignore: DEFAULT_IGNORE,
            absolute: true
        });
        for (const filePath of mdFiles) {
            const stats = fs.statSync(filePath);
            files.push({
                path: filePath,
                relativePath: path.relative(this.projectRoot, filePath),
                type: 'doc',
                size: stats.size
            });
        }
        return files;
    }
    /**
     * Discover AI tool configurations
     */
    async discoverToolConfigs() {
        const files = [];
        for (const tool of AI_TOOLS) {
            const patterns = AI_TOOL_FOLDERS[tool];
            for (const pattern of patterns) {
                const fullPath = path.join(this.projectRoot, pattern);
                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    if (stats.isDirectory()) {
                        // Scan directory contents
                        const dirFiles = await glob('**/*', {
                            cwd: fullPath,
                            nodir: true,
                            absolute: true
                        });
                        for (const filePath of dirFiles) {
                            const fileStats = fs.statSync(filePath);
                            files.push({
                                path: filePath,
                                relativePath: path.relative(this.projectRoot, filePath),
                                type: 'tool_config',
                                tool,
                                size: fileStats.size
                            });
                        }
                    }
                    else {
                        files.push({
                            path: fullPath,
                            relativePath: pattern,
                            type: 'tool_config',
                            tool,
                            size: stats.size
                        });
                    }
                }
            }
        }
        return files;
    }
    /**
     * Discover source code files
     */
    async discoverCode() {
        const files = [];
        const codePatterns = [
            '**/*.js', '**/*.ts', '**/*.tsx', '**/*.jsx',
            '**/*.py', '**/*.go', '**/*.rs', '**/*.java',
            '**/*.cs', '**/*.rb', '**/*.php'
        ];
        for (const pattern of codePatterns) {
            const codeFiles = await glob(pattern, {
                cwd: this.projectRoot,
                ignore: DEFAULT_IGNORE,
                absolute: true
            });
            for (const filePath of codeFiles) {
                const stats = fs.statSync(filePath);
                files.push({
                    path: filePath,
                    relativePath: path.relative(this.projectRoot, filePath),
                    type: 'code',
                    size: stats.size
                });
            }
        }
        return files;
    }
    /**
     * Read file content safely
     */
    readFileContent(filePath, maxSize = 50000) {
        try {
            const stats = fs.statSync(filePath);
            if (stats.size > maxSize) {
                // Read only first part of large files
                const fd = fs.openSync(filePath, 'r');
                const buffer = Buffer.alloc(maxSize);
                fs.readSync(fd, buffer, 0, maxSize, 0);
                fs.closeSync(fd);
                return buffer.toString('utf-8') + '\n\n... [truncated]';
            }
            return fs.readFileSync(filePath, 'utf-8');
        }
        catch {
            return null;
        }
    }
    /**
     * Perform full intelligent analysis
     */
    async analyze() {
        // Discover all files
        const [docs, toolConfigs, codeFiles] = await Promise.all([
            this.discoverDocs(),
            this.discoverToolConfigs(),
            this.discoverCode()
        ]);
        // Determine which AI tools are already configured
        const configuredTools = new Set();
        for (const config of toolConfigs) {
            if (config.tool) {
                configuredTools.add(config.tool);
            }
        }
        // Basic analysis (without AI)
        const basicResult = {
            summary: '',
            techStack: this.detectTechStackBasic(codeFiles),
            workflows: [],
            architecture: {
                pattern: 'unknown',
                components: [],
                integrations: []
            },
            existingContext: {
                tools: Array.from(configuredTools),
                files: [...docs, ...toolConfigs]
            },
            suggestions: {
                contextFiles: [],
                workflows: [],
                agents: [],
                commands: []
            }
        };
        // If OpenRouter is available, perform intelligent analysis
        if (this.client) {
            try {
                const intelligentResult = await this.performIntelligentAnalysis(docs, toolConfigs, codeFiles);
                return {
                    ...basicResult,
                    ...intelligentResult,
                    existingContext: basicResult.existingContext
                };
            }
            catch (error) {
                console.warn('Intelligent analysis failed, falling back to basic:', error);
            }
        }
        // Generate basic summary
        basicResult.summary = this.generateBasicSummary(docs, toolConfigs, codeFiles, basicResult.techStack);
        return basicResult;
    }
    /**
     * Detect tech stack without AI
     */
    detectTechStackBasic(codeFiles) {
        const languages = new Set();
        const frameworks = new Set();
        const tools = new Set();
        // Detect languages from file extensions
        for (const file of codeFiles) {
            const ext = path.extname(file.relativePath).toLowerCase();
            switch (ext) {
                case '.js':
                case '.mjs':
                case '.cjs':
                    languages.add('JavaScript');
                    break;
                case '.ts':
                case '.tsx':
                    languages.add('TypeScript');
                    break;
                case '.py':
                    languages.add('Python');
                    break;
                case '.go':
                    languages.add('Go');
                    break;
                case '.rs':
                    languages.add('Rust');
                    break;
                case '.java':
                    languages.add('Java');
                    break;
                case '.cs':
                    languages.add('C#');
                    break;
                case '.rb':
                    languages.add('Ruby');
                    break;
                case '.php':
                    languages.add('PHP');
                    break;
            }
        }
        // Check for common framework indicators
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                if (deps.react)
                    frameworks.add('React');
                if (deps.vue)
                    frameworks.add('Vue');
                if (deps.angular || deps['@angular/core'])
                    frameworks.add('Angular');
                if (deps.express)
                    frameworks.add('Express');
                if (deps.fastify)
                    frameworks.add('Fastify');
                if (deps.next)
                    frameworks.add('Next.js');
                if (deps.nest || deps['@nestjs/core'])
                    frameworks.add('NestJS');
                tools.add('npm');
            }
            catch {
                // Ignore parse errors
            }
        }
        // Check for Python indicators
        const requirementsTxtPath = path.join(this.projectRoot, 'requirements.txt');
        const pyprojectPath = path.join(this.projectRoot, 'pyproject.toml');
        if (fs.existsSync(requirementsTxtPath) || fs.existsSync(pyprojectPath)) {
            tools.add('pip');
            if (fs.existsSync(pyprojectPath)) {
                tools.add('poetry');
            }
        }
        return {
            languages: Array.from(languages),
            frameworks: Array.from(frameworks),
            tools: Array.from(tools)
        };
    }
    /**
     * Perform intelligent analysis using OpenRouter
     */
    async performIntelligentAnalysis(docs, toolConfigs, codeFiles) {
        if (!this.client) {
            throw new Error('OpenRouter client not available');
        }
        // Gather sample content for analysis
        const sampleContent = [];
        // Add README and main docs
        const importantDocs = docs.filter(d => d.relativePath.toLowerCase().includes('readme') ||
            d.relativePath.toLowerCase().includes('claude') ||
            d.relativePath.toLowerCase().includes('context')).slice(0, 5);
        for (const doc of importantDocs) {
            const content = this.readFileContent(doc.path, 10000);
            if (content) {
                sampleContent.push(`## File: ${doc.relativePath}\n\n${content}`);
            }
        }
        // Add tool configs
        for (const config of toolConfigs.slice(0, 5)) {
            const content = this.readFileContent(config.path, 5000);
            if (content) {
                sampleContent.push(`## Tool Config (${config.tool}): ${config.relativePath}\n\n${content}`);
            }
        }
        // Add sample code files (entry points)
        const entryPoints = codeFiles.filter(f => f.relativePath.includes('index.') ||
            f.relativePath.includes('main.') ||
            f.relativePath.includes('app.') ||
            f.relativePath.includes('server.')).slice(0, 5);
        for (const code of entryPoints) {
            const content = this.readFileContent(code.path, 8000);
            if (content) {
                sampleContent.push(`## Code: ${code.relativePath}\n\n${content}`);
            }
        }
        // Create analysis prompt
        const analysisPrompt = `
Analyze this codebase content and provide a structured analysis:

${sampleContent.join('\n\n---\n\n')}

Provide your analysis in the following JSON format:
{
  "summary": "Brief description of what this project does",
  "techStack": {
    "languages": ["list of programming languages"],
    "frameworks": ["list of frameworks"],
    "tools": ["list of tools and libraries"]
  },
  "workflows": [
    {
      "name": "workflow name",
      "description": "what it does",
      "entryPoint": "file:line",
      "steps": ["step 1", "step 2"]
    }
  ],
  "architecture": {
    "pattern": "architectural pattern (e.g., MVC, microservices)",
    "components": ["main components"],
    "integrations": ["external integrations"]
  },
  "suggestions": {
    "contextFiles": ["suggested context files to create"],
    "workflows": ["workflows to document"],
    "agents": ["agents that would be useful"],
    "commands": ["commands to implement"]
  }
}

Return ONLY valid JSON, no markdown formatting.
`;
        try {
            const response = await this.client.chat([
                {
                    role: 'system',
                    content: 'You are an expert code analyzer and AI context engineer. Analyze codebases to understand their structure, workflows, and suggest optimal AI context configurations. Always return valid JSON.'
                },
                { role: 'user', content: analysisPrompt }
            ], { temperature: 0.2, maxTokens: 4096 });
            // Parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        catch (error) {
            console.warn('Failed to parse intelligent analysis:', error);
        }
        return {};
    }
    /**
     * Generate basic summary without AI
     */
    generateBasicSummary(docs, toolConfigs, codeFiles, techStack) {
        const parts = [];
        parts.push(`Project Analysis Summary`);
        parts.push(`========================`);
        parts.push(``);
        parts.push(`**Files Discovered:**`);
        parts.push(`- Documentation: ${docs.length} files`);
        parts.push(`- Source Code: ${codeFiles.length} files`);
        parts.push(`- AI Tool Configs: ${toolConfigs.length} files`);
        parts.push(``);
        parts.push(`**Tech Stack:**`);
        if (techStack.languages.length > 0) {
            parts.push(`- Languages: ${techStack.languages.join(', ')}`);
        }
        if (techStack.frameworks.length > 0) {
            parts.push(`- Frameworks: ${techStack.frameworks.join(', ')}`);
        }
        if (techStack.tools.length > 0) {
            parts.push(`- Tools: ${techStack.tools.join(', ')}`);
        }
        return parts.join('\n');
    }
    /**
     * Generate embeddings for discovered content
     */
    async generateEmbeddings(files) {
        if (!this.client) {
            throw new Error('OpenRouter client not available for embeddings');
        }
        const embeddings = new Map();
        // Process in batches
        const batchSize = 10;
        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            const texts = [];
            const paths = [];
            for (const file of batch) {
                const content = this.readFileContent(file.path, 8000);
                if (content) {
                    texts.push(`File: ${file.relativePath}\n\n${content}`);
                    paths.push(file.relativePath);
                }
            }
            if (texts.length > 0) {
                const batchEmbeddings = await this.client.embedBatch(texts);
                for (let j = 0; j < paths.length; j++) {
                    embeddings.set(paths[j], batchEmbeddings[j]);
                }
            }
        }
        return embeddings;
    }
}
/**
 * Create an intelligent analyzer
 */
export function createIntelligentAnalyzer(projectRoot) {
    return new IntelligentAnalyzer(projectRoot);
}
//# sourceMappingURL=intelligent-analyzer.js.map