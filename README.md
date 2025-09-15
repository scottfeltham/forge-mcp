# FORGE MCP Server

**Pure MCP (Model Context Protocol) implementation of the FORGE development framework**

FORGE MCP Server is an AI-native development framework designed from the ground up for AI assistant interaction. Unlike traditional CLI tools, this server provides direct, structured access to development workflow management through the universal MCP standard.

## Features

- 🤖 **AI-Native Design**: Built specifically for AI assistant interaction
- 🔌 **Universal Compatibility**: Works with Claude, ChatGPT, Copilot, VS Code, and any MCP client
- 📋 **Structured Workflows**: 5-phase development cycles (Focus → Orchestrate → Refine → Generate → Evaluate)
- 🧠 **Learning System**: Persistent project knowledge that grows with each interaction
- 📚 **Rich Templates**: Comprehensive templates for cycles, agents, and documentation
- ⚡ **Real-time State**: Live project progress and phase tracking

## Installation

```bash
npm install -g forge-mcp-server
```

## Configuration

### Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "forge": {
      "command": "forge-mcp-server",
      "args": ["--stdio"]
    }
  }
}
```

The server automatically uses the current working directory, supporting multiple projects without additional configuration.

### VS Code MCP Extension
```json
{
  "mcp.servers": [
    {
      "name": "forge",
      "transport": "stdio",
      "command": "forge-mcp-server",
      "args": ["--stdio"],
      "workingDirectory": "${workspaceFolder}"
    }
  ]
}
```

Each project maintains its own `.forge/` directory for state management.

## Usage

FORGE MCP Server is designed to be used entirely through AI assistants. Simply start a conversation with your AI assistant and ask for help with development workflows:

- "Help me set up FORGE for my React project"
- "I need to implement user authentication"
- "Show me the status of my current development cycle"
- "What did we learn from the last authentication project?"

The AI assistant will use FORGE's MCP tools to guide you through structured development cycles, manage project state, and capture learnings.

## Architecture

- **Pure MCP Server**: No CLI interface - designed entirely for AI interaction
- **Global Installation**: Single installation works across multiple projects
- **Project-Scoped State**: Each project maintains its own `.forge/` directory
- **Template System**: Rich templates for development cycles and specialized agents
- **Learning Integration**: Persistent knowledge base that improves with each project

## Development Cycles

FORGE organizes development into structured 5-phase cycles:

1. **Focus** 🎯 - Requirements gathering and planning
2. **Orchestrate** 📝 - Task breakdown and dependency planning  
3. **Refine** 🔨 - Implementation and testing
4. **Generate** 🚀 - Build and deployment preparation
5. **Evaluate** 📊 - Success measurement and retrospective

## Specialized Agents

FORGE provides specialized AI agents for each aspect of development:

### Core Development Agents
- **🏗️ Architect Agent** - System design, architecture patterns, technology selection
- **🔨 Developer Agent** - Code implementation, TDD practices, framework expertise
- **🧪 Tester Agent** - Test strategy, automation, quality assurance
- **🚀 DevOps Agent** - Infrastructure, CI/CD pipelines, deployment automation

### Quality & Process Agents
- **📝 Code Reviewer Agent** - Code quality, best practices, technical debt management
- **🔐 Security Agent** - Vulnerability assessment, compliance, threat modeling
- **📚 Documentation Agent** - Technical writing, API docs, knowledge management
- **🔍 Project Analyzer Agent** - Codebase analysis, project setup optimization

Each agent is automatically invoked during relevant phases of the development cycle, providing expert guidance tailored to your project's needs.

## MCP Resources & Tools

### Resources
- `forge://templates/*` - Development templates and agent definitions
- `forge://cycles/active` - Current active development cycles
- `forge://cycles/history` - Completed cycle archive
- `forge://context/project` - Project configuration and AI context
- `forge://context/learnings` - Project knowledge base

### Tools
- `forge_init_project` - Initialize FORGE in project
- `forge_new_cycle` - Create new development cycle
- `forge_cycle_status` - Get cycle progress and status
- `forge_phase_advance` - Advance to next development phase
- `forge_complete_cycle` - Complete and archive cycle
- `forge_add_learning` - Add insight to knowledge base
- `forge_retrospective` - Generate retrospective analysis
- `forge_analyze_project` - Analyze project structure

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

This project represents the future of AI-collaborative development. Contributions welcome!

---

*FORGE MCP Server - The first truly AI-native development framework*