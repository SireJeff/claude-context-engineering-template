/**
 * Code Indexer
 * 
 * Indexes source code files for semantic search.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { DatabaseClient } from '../db/client.js';
import { EmbeddingsManager } from '../db/embeddings.js';

/**
 * Supported language patterns
 */
const LANGUAGE_PATTERNS: Record<string, { extensions: string[]; ignore: string[] }> = {
  javascript: {
    extensions: ['*.js', '*.mjs', '*.cjs'],
    ignore: ['*.min.js', '*.bundle.js']
  },
  typescript: {
    extensions: ['*.ts', '*.tsx', '*.mts', '*.cts'],
    ignore: ['*.d.ts']
  },
  python: {
    extensions: ['*.py'],
    ignore: ['*_pb2.py']
  },
  go: {
    extensions: ['*.go'],
    ignore: ['*_test.go']
  },
  rust: {
    extensions: ['*.rs'],
    ignore: []
  },
  java: {
    extensions: ['*.java'],
    ignore: []
  },
  csharp: {
    extensions: ['*.cs'],
    ignore: ['*.Designer.cs']
  },
  ruby: {
    extensions: ['*.rb'],
    ignore: []
  },
  php: {
    extensions: ['*.php'],
    ignore: []
  }
};

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
  '**/.nuxt/**'
];

/**
 * Code chunk for indexing
 */
interface CodeChunk {
  name: string;
  content: string;
  filePath: string;
  language: string;
  startLine: number;
  endLine: number;
  type: 'file' | 'function' | 'class' | 'module';
}

/**
 * Indexing result
 */
export interface CodeIndexResult {
  files: number;
  chunks: number;
  errors: string[];
}

/**
 * Source code indexer
 */
export class CodeIndexer {
  private db: DatabaseClient;
  private embeddings: EmbeddingsManager;
  private projectRoot: string;
  private maxChunkSize: number;

  constructor(
    db: DatabaseClient, 
    embeddings: EmbeddingsManager, 
    projectRoot: string,
    maxChunkSize = 2000
  ) {
    this.db = db;
    this.embeddings = embeddings;
    this.projectRoot = projectRoot;
    this.maxChunkSize = maxChunkSize;
  }

  /**
   * Index all source code
   */
  async indexAll(languages?: string[]): Promise<CodeIndexResult> {
    const result: CodeIndexResult = {
      files: 0,
      chunks: 0,
      errors: []
    };

    const targetLanguages = languages || Object.keys(LANGUAGE_PATTERNS);

    for (const lang of targetLanguages) {
      const config = LANGUAGE_PATTERNS[lang];
      if (!config) continue;

      try {
        const langResult = await this.indexLanguage(lang, config);
        result.files += langResult.files;
        result.chunks += langResult.chunks;
        result.errors.push(...langResult.errors);
      } catch (error) {
        result.errors.push(`Error indexing ${lang}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Index files for a specific language
   */
  private async indexLanguage(
    language: string, 
    config: { extensions: string[]; ignore: string[] }
  ): Promise<CodeIndexResult> {
    const result: CodeIndexResult = {
      files: 0,
      chunks: 0,
      errors: []
    };

    for (const ext of config.extensions) {
      const pattern = `**/${ext}`;
      const files = await glob(pattern, {
        cwd: this.projectRoot,
        ignore: [...DEFAULT_IGNORE, ...config.ignore],
        absolute: true
      });

      for (const filePath of files) {
        try {
          const chunks = await this.indexFile(filePath, language);
          result.files++;
          result.chunks += chunks;
        } catch (error) {
          result.errors.push(`Error indexing ${filePath}: ${error}`);
        }
      }
    }

    return result;
  }

  /**
   * Index a single source file
   */
  async indexFile(filePath: string, language: string): Promise<number> {
    if (!fs.existsSync(filePath)) {
      return 0;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(this.projectRoot, filePath);
    
    // Split into chunks
    const chunks = this.chunkCode(content, relativePath, language);
    
    for (const chunk of chunks) {
      // Create context item
      const item = this.db.upsertItem({
        type: 'code',
        name: chunk.name,
        content: chunk.content,
        filePath: chunk.filePath,
        metadata: {
          language: chunk.language,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          chunkType: chunk.type
        }
      });

      // Queue for embedding
      this.embeddings.queueForEmbedding(item.id);
    }

    return chunks.length;
  }

  /**
   * Split code into manageable chunks
   */
  private chunkCode(content: string, filePath: string, language: string): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    const lines = content.split('\n');
    
    // If file is small enough, index as single chunk
    if (content.length <= this.maxChunkSize) {
      chunks.push({
        name: path.basename(filePath),
        content: this.createCodeSummary(content, filePath, language),
        filePath,
        language,
        startLine: 1,
        endLine: lines.length,
        type: 'file'
      });
      return chunks;
    }

    // Try to split by semantic boundaries (functions, classes)
    const semanticChunks = this.extractSemanticChunks(content, language);
    
    if (semanticChunks.length > 0) {
      for (const semantic of semanticChunks) {
        chunks.push({
          name: `${path.basename(filePath)}:${semantic.name}`,
          content: this.createCodeSummary(semantic.content, filePath, language, semantic.name),
          filePath,
          language,
          startLine: semantic.startLine,
          endLine: semantic.endLine,
          type: semantic.type as 'function' | 'class'
        });
      }
    } else {
      // Fall back to line-based chunking
      const chunkLines = Math.ceil(this.maxChunkSize / 60); // Assume ~60 chars per line
      let startLine = 1;
      
      while (startLine <= lines.length) {
        const endLine = Math.min(startLine + chunkLines - 1, lines.length);
        const chunkContent = lines.slice(startLine - 1, endLine).join('\n');
        
        chunks.push({
          name: `${path.basename(filePath)}:L${startLine}-${endLine}`,
          content: `File: ${filePath}\nLines: ${startLine}-${endLine}\n\n${chunkContent}`,
          filePath,
          language,
          startLine,
          endLine,
          type: 'file'
        });
        
        startLine = endLine + 1;
      }
    }

    return chunks;
  }

  /**
   * Extract semantic chunks (functions, classes) from code
   */
  private extractSemanticChunks(content: string, language: string): Array<{
    name: string;
    content: string;
    startLine: number;
    endLine: number;
    type: string;
  }> {
    const chunks: Array<{
      name: string;
      content: string;
      startLine: number;
      endLine: number;
      type: string;
    }> = [];

    const lines = content.split('\n');
    
    // Language-specific patterns
    const patterns: Record<string, { function: RegExp; class: RegExp }> = {
      javascript: {
        function: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
        class: /^(?:export\s+)?class\s+(\w+)/
      },
      typescript: {
        function: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
        class: /^(?:export\s+)?class\s+(\w+)/
      },
      python: {
        function: /^(?:async\s+)?def\s+(\w+)/,
        class: /^class\s+(\w+)/
      },
      go: {
        function: /^func\s+(?:\([^)]+\)\s+)?(\w+)/,
        class: /^type\s+(\w+)\s+struct/
      },
      rust: {
        function: /^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/,
        class: /^(?:pub\s+)?struct\s+(\w+)/
      }
    };

    const langPatterns = patterns[language];
    if (!langPatterns) {
      return chunks;
    }

    let currentChunk: {
      name: string;
      startLine: number;
      type: string;
      braceCount: number;
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check for function/class start
      const funcMatch = line.match(langPatterns.function);
      const classMatch = line.match(langPatterns.class);

      if ((funcMatch || classMatch) && !currentChunk) {
        currentChunk = {
          name: funcMatch ? funcMatch[1] : classMatch![1],
          startLine: lineNum,
          type: funcMatch ? 'function' : 'class',
          braceCount: (line.match(/{/g) || []).length - (line.match(/}/g) || []).length
        };
        
        // For Python, use indentation-based detection
        if (language === 'python') {
          // Find end by looking for next line at same indentation level
          const indent = line.match(/^(\s*)/)?.[1].length || 0;
          let endLine = lineNum;
          
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j];
            if (nextLine.trim() === '') continue;
            const nextIndent = nextLine.match(/^(\s*)/)?.[1].length || 0;
            if (nextIndent <= indent && nextLine.trim() !== '') {
              break;
            }
            endLine = j + 1;
          }
          
          chunks.push({
            name: currentChunk.name,
            content: lines.slice(i, endLine).join('\n'),
            startLine: lineNum,
            endLine: endLine,
            type: currentChunk.type
          });
          
          currentChunk = null;
        }
      } else if (currentChunk && language !== 'python') {
        // Track braces for brace-based languages
        currentChunk.braceCount += (line.match(/{/g) || []).length;
        currentChunk.braceCount -= (line.match(/}/g) || []).length;
        
        if (currentChunk.braceCount <= 0) {
          chunks.push({
            name: currentChunk.name,
            content: lines.slice(currentChunk.startLine - 1, lineNum).join('\n'),
            startLine: currentChunk.startLine,
            endLine: lineNum,
            type: currentChunk.type
          });
          currentChunk = null;
        }
      }
    }

    return chunks;
  }

  /**
   * Create a summary for embedding (file context + content)
   */
  private createCodeSummary(
    content: string, 
    filePath: string, 
    language: string,
    entityName?: string
  ): string {
    const parts = [
      `File: ${filePath}`,
      `Language: ${language}`
    ];
    
    if (entityName) {
      parts.push(`Entity: ${entityName}`);
    }
    
    // Extract imports/dependencies
    const imports = this.extractImports(content, language);
    if (imports.length > 0) {
      parts.push(`Imports: ${imports.slice(0, 5).join(', ')}`);
    }
    
    // Extract exports
    const exports = this.extractExports(content, language);
    if (exports.length > 0) {
      parts.push(`Exports: ${exports.slice(0, 5).join(', ')}`);
    }
    
    parts.push('');
    parts.push(content);
    
    return parts.join('\n');
  }

  /**
   * Extract imports from code
   */
  private extractImports(content: string, language: string): string[] {
    const imports: string[] = [];
    
    const patterns: Record<string, RegExp> = {
      javascript: /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g,
      typescript: /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g,
      python: /(?:from\s+(\S+)\s+import|import\s+(\S+))/g,
      go: /import\s+(?:\(\s*)?["']([^"']+)["']/g,
      rust: /use\s+([a-zA-Z_][a-zA-Z0-9_]*(?:::[a-zA-Z_][a-zA-Z0-9_]*)*)/g
    };
    
    const pattern = patterns[language];
    if (!pattern) return imports;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1] || match[2]);
    }
    
    return [...new Set(imports)];
  }

  /**
   * Extract exports from code
   */
  private extractExports(content: string, language: string): string[] {
    const exports: string[] = [];
    
    if (language === 'javascript' || language === 'typescript') {
      // Named exports
      const namedExports = content.matchAll(/export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g);
      for (const match of namedExports) {
        exports.push(match[1]);
      }
      
      // Default export
      if (content.includes('export default')) {
        exports.push('default');
      }
    }
    
    return exports;
  }

  /**
   * Remove indexed code files
   */
  removeCodeFiles(): number {
    const items = this.db.getItemsByType('code');
    let removed = 0;
    
    for (const item of items) {
      if (this.db.deleteItem(item.id)) {
        this.embeddings.deleteEmbedding(item.id);
        removed++;
      }
    }
    
    return removed;
  }
}
