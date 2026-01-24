/**
 * Code Mapper - Auto-generates CODE_TO_WORKFLOW_MAP.md
 *
 * Scans workflow files for file:line references and builds
 * a reverse index mapping code files to their documentation.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CLAUDE_DIR = path.join(__dirname, '..', '..');
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

/**
 * Load automation config
 */
function loadConfig() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load config:', error.message);
    return null;
  }
}

/**
 * Extract file references from markdown content
 */
function extractReferences(content, filePath) {
  const references = [];
  const patterns = [
    // file.ext:123 format
    /([a-zA-Z0-9_\-./]+\.[a-zA-Z]+):(\d+)/g,
    // [Line 123] format with preceding file path
    /`([^`]+)`[^[]*\[Line (\d+)\]/g,
    // [Lines 123-456] format
    /`([^`]+)`[^[]*\[Lines (\d+)-(\d+)\]/g,
    // file.ext::function() semantic anchor format
    /([a-zA-Z0-9_\-./]+\.[a-zA-Z]+)::(\w+)\(\)/g
  ];

  // Simple line number extraction
  const linePattern = /([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+):(\d+)/g;
  let match;
  while ((match = linePattern.exec(content)) !== null) {
    references.push({
      file: match[1],
      line: parseInt(match[2]),
      type: 'line',
      source: filePath
    });
  }

  // Semantic anchor extraction
  const anchorPattern = /([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)::(\w+)\(\)/g;
  while ((match = anchorPattern.exec(content)) !== null) {
    references.push({
      file: match[1],
      anchor: match[2],
      type: 'anchor',
      source: filePath
    });
  }

  return references;
}

/**
 * Scan workflow files and extract all references
 */
function scanWorkflows() {
  const config = loadConfig();
  if (!config) return {};

  const allReferences = {};
  const scanPatterns = config.generators.code_mapper.scan_patterns || [
    'context/workflows/*.md',
    'agents/*.md'
  ];

  for (const pattern of scanPatterns) {
    const fullPattern = path.join(CLAUDE_DIR, pattern);
    const files = glob.sync(fullPattern);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(CLAUDE_DIR, file);
        const refs = extractReferences(content, relativePath);

        for (const ref of refs) {
          const normalizedPath = ref.file.replace(/\\/g, '/');
          if (!allReferences[normalizedPath]) {
            allReferences[normalizedPath] = {
              documentedIn: [],
              references: []
            };
          }

          // Add source document
          if (!allReferences[normalizedPath].documentedIn.includes(relativePath)) {
            allReferences[normalizedPath].documentedIn.push(relativePath);
          }

          // Add reference details
          allReferences[normalizedPath].references.push({
            source: relativePath,
            line: ref.line,
            anchor: ref.anchor,
            type: ref.type
          });
        }
      } catch (error) {
        console.error(`Error scanning ${file}:`, error.message);
      }
    }
  }

  return allReferences;
}

/**
 * Generate CODE_TO_WORKFLOW_MAP.md content
 */
function generateMapContent(references) {
  const now = new Date().toISOString();
  let content = `# Code to Workflow Map

> **Auto-generated:** ${now}
> **Generator:** code-mapper.js
>
> This file maps source code files to the workflow documentation that references them.
> Use this to find which docs need updating after code changes.

---

## How to Use

1. **Modified a file?** Search for it below
2. **Find "Documented In"** section for affected workflows
3. **Check references** to see what needs updating
4. **Run \`/verify-docs-current [file]\`** to validate

---

## File Mappings

`;

  // Sort files alphabetically
  const sortedFiles = Object.keys(references).sort();

  // Group by directory
  const byDirectory = {};
  for (const file of sortedFiles) {
    const dir = path.dirname(file) || '.';
    if (!byDirectory[dir]) {
      byDirectory[dir] = [];
    }
    byDirectory[dir].push(file);
  }

  for (const dir of Object.keys(byDirectory).sort()) {
    content += `### ${dir}/\n\n`;

    for (const file of byDirectory[dir]) {
      const data = references[file];
      const fileName = path.basename(file);
      const refCount = data.references.length;

      content += `#### \`${fileName}\`\n\n`;
      content += `**Documented In:**\n`;
      for (const doc of data.documentedIn) {
        content += `- [${doc}](./${doc})\n`;
      }

      content += `\n**References:** ${refCount}\n`;

      // Group references by type
      const lineRefs = data.references.filter(r => r.type === 'line');
      const anchorRefs = data.references.filter(r => r.type === 'anchor');

      if (lineRefs.length > 0) {
        content += `\n*Line References:*\n`;
        for (const ref of lineRefs.slice(0, 5)) {
          content += `- Line ${ref.line} in ${ref.source}\n`;
        }
        if (lineRefs.length > 5) {
          content += `- ... and ${lineRefs.length - 5} more\n`;
        }
      }

      if (anchorRefs.length > 0) {
        content += `\n*Semantic Anchors:*\n`;
        for (const ref of anchorRefs) {
          content += `- \`${ref.anchor}()\` in ${ref.source}\n`;
        }
      }

      content += `\n**Update After Changing:**\n`;
      for (const doc of data.documentedIn) {
        content += `- [ ] ${doc}\n`;
      }

      content += '\n---\n\n';
    }
  }

  // Summary section
  content += `## Summary

| Metric | Value |
|--------|-------|
| Files Documented | ${sortedFiles.length} |
| Total References | ${Object.values(references).reduce((sum, r) => sum + r.references.length, 0)} |
| Workflow Files | ${new Set(Object.values(references).flatMap(r => r.documentedIn)).size} |
| Generated | ${now} |

---

## Files NOT Currently Documented

*Run \`npx claude-context generate --scan-orphans\` to find undocumented code files.*

---

*This file is auto-generated. Do not edit manually.*
*Regenerate with: \`npx claude-context generate --code-map\`*
`;

  return content;
}

/**
 * Generate and write CODE_TO_WORKFLOW_MAP.md
 */
function generate(options = {}) {
  const { dryRun = false, verbose = false } = options;

  console.log('Scanning workflow files...');
  const references = scanWorkflows();

  const fileCount = Object.keys(references).length;
  const refCount = Object.values(references).reduce(
    (sum, r) => sum + r.references.length, 0
  );

  console.log(`Found ${fileCount} files with ${refCount} references`);

  if (verbose) {
    for (const [file, data] of Object.entries(references)) {
      console.log(`  ${file}: ${data.references.length} refs in ${data.documentedIn.length} docs`);
    }
  }

  const content = generateMapContent(references);

  if (dryRun) {
    console.log('\n--- DRY RUN OUTPUT ---\n');
    console.log(content.substring(0, 2000) + '\n...(truncated)');
    return { success: true, fileCount, refCount };
  }

  const outputPath = path.join(CLAUDE_DIR, 'context', 'CODE_TO_WORKFLOW_MAP.md');
  try {
    fs.writeFileSync(outputPath, content);
    console.log(`Generated: ${outputPath}`);

    // Update metadata
    const metaPath = path.join(CLAUDE_DIR, 'context', '.meta', 'generated-at.json');
    const metaDir = path.dirname(metaPath);
    if (!fs.existsSync(metaDir)) {
      fs.mkdirSync(metaDir, { recursive: true });
    }
    const metadata = {
      'CODE_TO_WORKFLOW_MAP.md': {
        generatedAt: new Date().toISOString(),
        filesScanned: fileCount,
        referencesFound: refCount
      }
    };
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

    return { success: true, fileCount, refCount, outputPath };
  } catch (error) {
    console.error('Failed to write output:', error.message);
    return { success: false, error: error.message };
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');

  const result = generate({ dryRun, verbose });
  process.exit(result.success ? 0 : 1);
}

module.exports = {
  generate,
  scanWorkflows,
  extractReferences,
  generateMapContent
};
