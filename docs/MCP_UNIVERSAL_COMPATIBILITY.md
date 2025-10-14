# FORGE MCP Server - Universal AI Client Compatibility

## Overview

FORGE MCP Server is built using the **Model Context Protocol (MCP)** - a universal, open standard for connecting AI assistants to external tools and data sources. This means FORGE works with **any MCP-compatible AI client**, not just Claude.

## Supported AI Clients

FORGE MCP Server works with all MCP-compatible clients, including:

### ✅ Anthropic Claude
- **Claude Desktop** (macOS/Windows)
- **Claude Code** (CLI/VSCode extension)
- **Claude.ai** (via MCP bridge)

### ✅ OpenAI
- **ChatGPT Desktop** (with MCP support)
- **ChatGPT API** (via MCP integration)
- **Cursor IDE** (supports MCP servers)

### ✅ Microsoft
- **GitHub Copilot** (with MCP extensions)
- **VS Code** (via MCP extension)

### ✅ Other MCP Clients
- **Zed Editor** (built-in MCP support)
- **Continue** (open-source AI coding assistant)
- **Any custom MCP client**

## Transport Protocols

FORGE supports both standard MCP transport protocols:

### 1. STDIO Transport (Default)
Standard input/output communication - works with most desktop AI clients.

```bash
forge-mcp-server --stdio
```

**Best for:**
- Claude Desktop
- VS Code extensions
- CLI-based clients
- Local development

### 2. SSE Transport (Server-Sent Events)
HTTP-based communication - works with web-based and remote clients.

```bash
forge-mcp-server --sse 3000
```

**Best for:**
- Web-based AI interfaces
- Remote clients
- Multi-user scenarios
- Cloud deployments

## Configuration Examples

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": ["/path/to/forge-mcp/server.js", "--stdio"],
      "env": {}
    }
  }
}
```

**Config Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### VS Code with MCP Extension

Add to VS Code `settings.json`:

```json
{
  "mcp.servers": [
    {
      "name": "forge",
      "transport": "stdio",
      "command": "node",
      "args": ["/path/to/forge-mcp/server.js", "--stdio"],
      "workingDirectory": "${workspaceFolder}"
    }
  ]
}
```

### Cursor IDE

Add to Cursor's MCP configuration:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": ["/path/to/forge-mcp/server.js", "--stdio"]
    }
  }
}
```

### ChatGPT Desktop (when available)

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": ["/path/to/forge-mcp/server.js", "--stdio"]
    }
  }
}
```

### Custom/Web Clients (SSE)

Start FORGE with SSE transport:

```bash
forge-mcp-server --sse 3000
```

Connect from client:
```
http://localhost:3000/sse
```

## MCP Protocol Compliance

FORGE implements the full MCP specification:

### ✅ MCP Resources
Provides read-only data access via URI patterns:
- `forge://templates/*` - Development templates
- `forge://cycles/active` - Active development cycles
- `forge://cycles/history` - Completed cycles
- `forge://context/project` - Project configuration
- `forge://context/learnings` - Knowledge base

### ✅ MCP Tools
Provides executable functions:
- `forge_init_project` - Initialize FORGE in project
- `forge_new_cycle` - Create development cycle
- `forge_cycle_status` - Get cycle progress
- `forge_phase_advance` - Advance to next phase
- `forge_complete_cycle` - Complete and archive cycle
- `forge_add_learning` - Add project insights
- `forge_retrospective` - Generate retrospective
- `forge_analyze_project` - Analyze project structure
- `forge_checkpoint` - Validate phase compliance
- `forge_guide_next` - Get next action recommendations
- `forge_invoke_agent` - Activate specialized agents
- `forge_generate_docs` - Generate documentation
- `forge_decompose_prd` - Decompose PRD into tasks

### ✅ MCP Prompts (Optional)
FORGE tools provide rich prompts for AI assistants to guide workflow interactions.

### ✅ Standard MCP Messages
- `initialize` - Server capabilities negotiation
- `tools/list` - List available tools
- `tools/call` - Execute tool functions
- `resources/list` - List available resources
- `resources/read` - Read resource content
- `completion/complete` - Autocomplete support (optional)

## Client-Agnostic Design

FORGE is intentionally designed to work with any AI client:

### ✅ No Client-Specific Code
- No hardcoded references to specific AI platforms
- All interactions via standard MCP protocol
- Transport-agnostic architecture

### ✅ Universal State Management
- File-based state in `.forge/` directory
- Works across different clients simultaneously
- No database or client-specific storage

### ✅ Flexible Workflow
- AI assistant guides users through FORGE workflow
- Works with any conversational AI interface
- No assumptions about client capabilities

### ✅ Standard Output Formats
- Markdown for documentation
- YAML for configuration
- JSON for data interchange
- All standard, client-agnostic formats

## Multi-Client Usage

You can use FORGE with multiple AI clients simultaneously:

### Same Project, Different Clients

```bash
# Terminal with Claude Code
$ claude "Show me FORGE status"

# VS Code with Copilot
> Ask Copilot: "Check FORGE cycle progress"

# Claude Desktop
User: "What's the current FORGE phase?"
```

All clients access the same `.forge/` state, ensuring consistency.

### Different Projects

Each project maintains its own `.forge/` directory:

```
project-a/.forge/  ← FORGE state for project A
project-b/.forge/  ← FORGE state for project B
```

The MCP server uses the working directory to determine which project to manage.

## Testing MCP Compatibility

### Verify MCP Server

Test FORGE responds to standard MCP protocol:

```bash
# Start server
node server.js --stdio

# Send initialize request (via stdin)
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}

# Expected: Server responds with capabilities
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{...}}}
```

### List Available Tools

```bash
# Send tools/list request
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}

# Expected: List of all FORGE tools
{"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"forge_init_project",...}]}}
```

## Migration Guide

### From Claude-Specific Setup

If you're currently using FORGE with Claude and want to support other clients:

1. **No changes needed!** FORGE already supports any MCP client
2. Add configuration for your new AI client (see examples above)
3. Point to the same FORGE server installation
4. Start using FORGE with multiple clients

### From CLI Tools

If you're used to CLI-based development tools:

1. FORGE has no CLI - it's pure MCP
2. Interact entirely through your AI assistant
3. Ask your AI to use FORGE tools for structured development
4. The AI guides you through the workflow

## Troubleshooting

### "MCP Server Not Found"

**Solution:** Verify the path to `server.js` in your client's MCP configuration.

### "Tools Not Appearing"

**Solution:**
1. Restart your AI client after configuration changes
2. Check that Node.js 18+ is installed
3. Test server directly: `node server.js --stdio`

### "State Not Syncing Between Clients"

**Solution:**
1. Ensure all clients point to the same FORGE server
2. Verify working directory is correct
3. Check `.forge/` directory exists in your project

### "Permission Denied"

**Solution:**
```bash
chmod +x server.js
```

## Best Practices

### ✅ Single Server Installation

Install FORGE once globally:

```bash
npm install -g forge-mcp-server
```

Configure all clients to use the same installation.

### ✅ Project-Specific State

Don't share `.forge/` directories between projects. Each project should have its own:

```bash
project/
  .forge/          # Project-specific FORGE state
  .git/           # Git repository
  src/            # Source code
```

### ✅ Consistent Workflow

Use the same FORGE workflow regardless of AI client:
1. Initialize project
2. Create development cycle
3. Progress through phases
4. Complete and learn

### ✅ AI Client Choice

Choose AI client based on your preferences:
- **Claude**: Best for conversational development
- **Copilot**: Best for in-editor assistance
- **ChatGPT**: Best for web-based interaction
- **Custom**: Build your own MCP client!

## Future Compatibility

FORGE will remain compatible with:

- ✅ **MCP Protocol Updates** - We track the MCP specification
- ✅ **New AI Clients** - Any MCP-compatible client works automatically
- ✅ **Extended Capabilities** - Backwards-compatible enhancements
- ✅ **Community Extensions** - Open for community contributions

## Resources

- **MCP Specification**: https://modelcontextprotocol.io
- **FORGE Documentation**: https://github.com/scottfeltham/forge-mcp-server
- **MCP Client List**: https://github.com/modelcontextprotocol/servers
- **Issue Tracker**: https://github.com/scottfeltham/forge-mcp-server/issues

---

**FORGE MCP Server: Universal AI-Native Development**

Works with Claude, ChatGPT, Copilot, and any MCP-compatible AI client.
