# MCP Server Quick Start

## Prerequisites

- Node.js 18+
- OpenRouter API key
- Claude Desktop (for MCP integration)

## Installation

```bash
npm install -g ai-context
```

## Setup

### 1. Set your OpenRouter API key

```bash
# Linux/macOS
export OPENROUTER_API_KEY="your-key"

# Windows PowerShell
$env:OPENROUTER_API_KEY="your-key"

# Windows CMD
set OPENROUTER_API_KEY=your-key
```

### 2. Initialize context in your project

```bash
cd your-project
ai-context init
```

This will:
- Analyze your codebase structure
- Detect frameworks and dependencies
- Create the database
- Index your documentation and code

### 3. Index your codebase

```bash
ai-context index
```

This will:
- Scan all source code files
- Index documentation
- Build the knowledge graph
- Create vector embeddings

### 4. Start the MCP server

```bash
ai-context mcp
```

The server will start with stdio transport (default for Claude Desktop).

## Claude Desktop Integration

### Step 1: Find your Claude Desktop config

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Add the MCP server configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-context": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\AppData\\Roaming\\npm\\node_modules\\ai-context\\dist\\mcp.js"],
      "env": {
        "OPENROUTER_API_KEY": "your-api-key-here",
        "AI_CONTEXT_PROJECT_ROOT": "C:\\path\\to\\your\\project"
      }
    }
  }
}
```

**Important notes:**
- Update the `args` path to where `ai-context` is installed on your system
- Set `AI_CONTEXT_PROJECT_ROOT` to your project directory
- Keep your `OPENROUTER_API_KEY` secure

### Step 3: Restart Claude Desktop

After saving the config file, restart Claude Desktop to load the MCP server.

## Usage

In Claude Desktop, you can now interact with your codebase context:

### Semantic Search

```
You: Search for authentication-related code
```

### Query Knowledge Graph

```
You: What are the dependencies of the payment module?
```

### Get Tool Configurations

```
You: Show me the Copilot configuration
```

### Analyze Code

```
You: Analyze the API endpoint structure
```

## Advanced Usage

### Database Path

By default, the database is created at `.ai-context.db` in your project root. You can customize this:

```bash
ai-context mcp --db /path/to/custom.db
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `AI_CONTEXT_PROJECT_ROOT` | Project directory | Current directory |
| `AI_CONTEXT_DB_PATH` | Database file path | `.ai-context.db` |
| `OPENROUTER_EMBEDDING_MODEL` | Embedding model | `openai/text-embedding-3-small` |
| `OPENROUTER_CHAT_MODEL` | Chat model | `anthropic/claude-3-haiku` |

### Troubleshooting

**MCP server not starting:**
```bash
# Check if the database exists
ai-context stats

# Re-index if needed
ai-context index
```

** Claude Desktop can't connect:**
- Verify the path to `mcp.js` in your config
- Check that Node.js 18+ is installed
- Ensure `OPENROUTER_API_KEY` is set correctly

**Search not working:**
```bash
# Re-index the database
ai-context index --all

# Check database stats
ai-context stats
```

## Next Steps

- Explore all [CLI commands](../README.md#commands)
- Learn about [supported AI tools](../README.md#supported-ai-tools)
- Read the [main documentation](../../README.md)

---

**Version:** 3.0.0 | **Updated:** 2026-02-05
