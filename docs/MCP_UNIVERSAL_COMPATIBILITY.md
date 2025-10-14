# FORGE MCP Server - Universal Development Tool Compatibility

## Overview

FORGE MCP Server is built using the **Model Context Protocol (MCP)** - a universal, open standard for connecting AI assistants to external tools and data sources. FORGE is specifically designed for **AI-powered development tools**, not general chat applications.

## Supported Development Tools

FORGE MCP Server works with MCP-compatible development tools and coding assistants:

### ✅ Claude Code
- **Claude Code CLI** - Terminal-based AI coding assistant
- **Claude Code for VS Code** - VSCode extension

### ✅ AI-Powered IDEs
- **Cursor IDE** - AI-first code editor with MCP support
- **Zed Editor** - Collaborative editor with built-in MCP support
- **Continue** - Open-source AI coding assistant for VS Code/JetBrains

### ✅ Editor Extensions
- **VS Code with MCP Extension** - Generic MCP client for VS Code
- **GitHub Copilot** (with MCP bridge when available)
- **Codeium** (with MCP support)

### ✅ Custom Development Tools
- **Any custom MCP-based development tool**
- **CI/CD integrations** (via MCP)
- **Build tool integrations**

### ❌ NOT Supported
FORGE is **not designed for general chat applications**:
- ❌ Claude Desktop (chat application)
- ❌ ChatGPT Desktop (chat application)
- ❌ General conversational AI interfaces

**Why?** FORGE is a structured development framework designed for project-based workflows, file system access, and development tooling integration - not casual conversation.

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

### Claude Code (CLI or VS Code Extension)

FORGE works seamlessly with Claude Code. No additional configuration needed - Claude Code automatically discovers MCP servers configured in your project or global settings.

Add to `~/.config/claude-code/settings.json` (or workspace settings):

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

Add to Cursor's MCP configuration (`.cursor/config.json`):

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

### Continue (VS Code/JetBrains)

Add to Continue's config file (`~/.continue/config.json`):

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

### Custom Development Tools (SSE)

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

## Multi-Tool Usage

You can use FORGE with multiple development tools simultaneously:

### Same Project, Different Tools

```bash
# Terminal with Claude Code
$ claude "Show me FORGE status"

# VS Code with Continue
> Ask Continue: "Check FORGE cycle progress"

# Cursor IDE
> Ask Cursor: "What's the current FORGE phase?"
```

All tools access the same `.forge/` state, ensuring consistency across your development environment.

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

### From Other MCP Servers

If you're migrating from another MCP-based development framework:

1. Install FORGE MCP server (see installation above)
2. Add FORGE to your development tool's MCP configuration
3. Initialize FORGE in your project: AI will use `forge_init_project`
4. Existing `.forge/` directories will be preserved if already present

### From Manual/CLI Workflows

If you're transitioning from manual development processes:

1. FORGE has no CLI - it's entirely MCP-based
2. Interact through your AI-powered development tool (Claude Code, Cursor, etc.)
3. Ask your AI to initialize FORGE and create development cycles
4. The AI guides you through structured 5-phase workflows
5. All state managed in `.forge/` directory

## Troubleshooting

### "MCP Server Not Found"

**Solution:** Verify the path to `server.js` in your client's MCP configuration.

### "Tools Not Appearing"

**Solution:**
1. Restart your development tool after configuration changes
2. Check that Node.js 18+ is installed
3. Test server directly: `node server.js --stdio`

### "State Not Syncing Between Tools"

**Solution:**
1. Ensure all development tools point to the same FORGE server
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

### ✅ Development Tool Choice

Choose development tool based on your workflow:
- **Claude Code**: Best for conversational development and structured workflows
- **Cursor**: Best for AI-first code editing
- **Continue**: Best for open-source, customizable AI assistance
- **VS Code + MCP**: Best for integrating with existing VS Code setup
- **Custom**: Build your own MCP-based development tool!

## Future Compatibility

FORGE will remain compatible with:

- ✅ **MCP Protocol Updates** - We track the MCP specification
- ✅ **New Development Tools** - Any MCP-compatible development tool works automatically
- ✅ **Extended Capabilities** - Backwards-compatible enhancements
- ✅ **Community Extensions** - Open for community contributions

## Resources

- **MCP Specification**: https://modelcontextprotocol.io
- **FORGE Documentation**: https://github.com/scottfeltham/forge-mcp-server
- **MCP Client List**: https://github.com/modelcontextprotocol/servers
- **Issue Tracker**: https://github.com/scottfeltham/forge-mcp-server/issues

---

**FORGE MCP Server: Universal AI-Native Development Framework**

Works with Claude Code, Cursor, Continue, VS Code, and any MCP-compatible development tool.
