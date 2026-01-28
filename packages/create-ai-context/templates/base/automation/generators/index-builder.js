/**
 * Index Builder - Rebuilds category indexes from content
 *
 * Scans workflow and agent files to regenerate index files
 * with accurate counts and references.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CLAUDE_DIR = path.join(__dirname, '..', '..');

/**
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  }
  return frontmatter;
}

/**
 * Scan workflows directory and collect metadata
 */
function scanWorkflows() {
  const workflowsDir = path.join(CLAUDE_DIR, 'context', 'workflows');
  const workflows = [];

  if (!fs.existsSync(workflowsDir)) {
    return workflows;
  }

  const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    if (file === 'WORKFLOW_TEMPLATE.md') continue;

    try {
      const filePath = path.join(workflowsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

      workflows.push({
        file: file,
        name: frontmatter.name || title,
        category: frontmatter.category || 'uncategorized',
        complexity: frontmatter.complexity || 'medium',
        description: frontmatter.description || '',
        lastUpdated: frontmatter.last_updated || null
      });
    } catch (error) {
      console.error(`Error parsing ${file}:`, error.message);
    }
  }

  return workflows;
}

/**
 * Scan agents directory and collect metadata
 */
function scanAgents() {
  const agentsDir = path.join(CLAUDE_DIR, 'agents');
  const agents = [];

  if (!fs.existsSync(agentsDir)) {
    return agents;
  }

  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    try {
      const filePath = path.join(agentsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

      agents.push({
        file: file,
        name: frontmatter.name || title,
        role: frontmatter.role || 'general',
        complexity: frontmatter.complexity || 'medium',
        description: frontmatter.description || ''
      });
    } catch (error) {
      console.error(`Error parsing ${file}:`, error.message);
    }
  }

  return agents;
}

/**
 * Scan commands directory and collect metadata
 */
function scanCommands() {
  const commandsDir = path.join(CLAUDE_DIR, 'commands');
  const commands = [];

  if (!fs.existsSync(commandsDir)) {
    return commands;
  }

  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    try {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = parseFrontmatter(content);

      commands.push({
        file: file,
        name: frontmatter.name || '/' + file.replace('.md', ''),
        category: frontmatter.category || 'general',
        description: frontmatter.description || ''
      });
    } catch (error) {
      console.error(`Error parsing ${file}:`, error.message);
    }
  }

  return commands;
}

/**
 * Generate workflow category index content
 */
function generateWorkflowIndex(workflows) {
  const now = new Date().toISOString();

  // Group by category
  const byCategory = {};
  for (const wf of workflows) {
    if (!byCategory[wf.category]) {
      byCategory[wf.category] = [];
    }
    byCategory[wf.category].push(wf);
  }

  let content = `# Workflow Category Index

> **Auto-generated:** ${now}
> **Total Workflows:** ${workflows.length}

This index organizes all documented workflows by category.

---

## Quick Navigation

| Category | Count | Description |
|----------|-------|-------------|
`;

  for (const [category, wfs] of Object.entries(byCategory).sort()) {
    content += `| ${category} | ${wfs.length} | ${category} workflows |\n`;
  }

  content += `\n---\n\n`;

  // Detail by category
  for (const [category, wfs] of Object.entries(byCategory).sort()) {
    content += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    content += `| Workflow | Complexity | Description |\n`;
    content += `|----------|------------|-------------|\n`;

    for (const wf of wfs.sort((a, b) => a.name.localeCompare(b.name))) {
      const link = `[${wf.name}](../../context/workflows/${wf.file})`;
      content += `| ${link} | ${wf.complexity} | ${wf.description || '-'} |\n`;
    }

    content += `\n`;
  }

  content += `---\n\n*Auto-generated by index-builder.js*\n`;

  return content;
}

/**
 * Generate agent category index content
 */
function generateAgentIndex(agents) {
  const now = new Date().toISOString();

  let content = `# Agent Category Index

> **Auto-generated:** ${now}
> **Total Agents:** ${agents.length}

This index lists all specialized agents and their capabilities.

---

## Available Agents

| Agent | Role | Complexity | Description |
|-------|------|------------|-------------|
`;

  for (const agent of agents.sort((a, b) => a.name.localeCompare(b.name))) {
    const link = `[${agent.name}](../../agents/${agent.file})`;
    content += `| ${link} | ${agent.role} | ${agent.complexity} | ${agent.description || '-'} |\n`;
  }

  content += `\n---\n\n## Agent Selection Guide\n\n`;
  content += `Choose an agent based on your task:\n\n`;
  content += `- **context-engineer** - Initial setup, documentation generation\n`;
  content += `- **core-architect** - System design, architecture decisions\n`;
  content += `- **database-ops** - Schema, migrations, queries\n`;
  content += `- **api-developer** - Endpoints, contracts, REST/GraphQL\n`;
  content += `- **integration-hub** - External services, webhooks\n`;
  content += `- **deployment-ops** - CI/CD, infrastructure\n`;
  content += `\n---\n\n*Auto-generated by index-builder.js*\n`;

  return content;
}

/**
 * Build all indexes
 */
function buildAll(options = {}) {
  const { dryRun = false, verbose = false } = options;
  const results = [];

  console.log('Scanning content...');

  // Scan all content
  const workflows = scanWorkflows();
  const agents = scanAgents();
  const commands = scanCommands();

  console.log(`Found: ${workflows.length} workflows, ${agents.length} agents, ${commands.length} commands`);

  // Generate workflow index
  const workflowIndexContent = generateWorkflowIndex(workflows);
  const workflowIndexPath = path.join(CLAUDE_DIR, 'indexes', 'workflows', 'CATEGORY_INDEX.md');

  if (!dryRun) {
    fs.writeFileSync(workflowIndexPath, workflowIndexContent);
    console.log(`Generated: ${workflowIndexPath}`);
  }
  results.push({ type: 'workflow-index', path: workflowIndexPath, itemCount: workflows.length });

  // Generate agent index
  const agentIndexContent = generateAgentIndex(agents);
  const agentIndexPath = path.join(CLAUDE_DIR, 'indexes', 'agents', 'CATEGORY_INDEX.md');

  if (!dryRun) {
    fs.writeFileSync(agentIndexPath, agentIndexContent);
    console.log(`Generated: ${agentIndexPath}`);
  }
  results.push({ type: 'agent-index', path: agentIndexPath, itemCount: agents.length });

  // Update generation metadata
  if (!dryRun) {
    const metaPath = path.join(CLAUDE_DIR, 'context', '.meta', 'generated-at.json');
    let metadata = {};
    if (fs.existsSync(metaPath)) {
      try {
        metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (e) {}
    }

    metadata['WORKFLOW_CATEGORY_INDEX'] = {
      generatedAt: new Date().toISOString(),
      itemCount: workflows.length
    };
    metadata['AGENT_CATEGORY_INDEX'] = {
      generatedAt: new Date().toISOString(),
      itemCount: agents.length
    };

    const metaDir = path.dirname(metaPath);
    if (!fs.existsSync(metaDir)) {
      fs.mkdirSync(metaDir, { recursive: true });
    }
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  }

  return { success: true, results };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');

  const result = buildAll({ dryRun, verbose });
  console.log(`\nIndex build ${result.success ? 'complete' : 'failed'}`);
  process.exit(result.success ? 0 : 1);
}

module.exports = {
  buildAll,
  scanWorkflows,
  scanAgents,
  scanCommands,
  generateWorkflowIndex,
  generateAgentIndex
};
