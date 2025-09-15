# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FORGE MCP Server is a pure MCP (Model Context Protocol) implementation of the FORGE development framework. It's designed from the ground up for AI assistant interaction, providing structured development workflow management without any CLI interface.

## Agent Invocation Guidelines

When working with FORGE development cycles, invoke specialized agents based on the current phase and task:

### Phase-Based Agent Selection
- **Focus Phase**: Architect, Security, Documentation agents for planning
- **Orchestrate Phase**: Architect (detailed design), DevOps (pipeline planning)
- **Refine Phase**: Developer (primary), Tester, Code Reviewer agents
- **Generate Phase**: DevOps (primary), Documentation, Tester agents
- **Evaluate Phase**: All agents contribute to retrospective

### Task-Based Agent Selection
- Architecture/Design → Architect Agent
- Implementation → Developer Agent
- Testing/QA → Tester Agent
- Deployment/Infrastructure → DevOps Agent
- Security concerns → Security Agent
- Code quality → Code Reviewer Agent
- Documentation → Documentation Agent

### Using Agent Templates
Access agent templates via resources:
```javascript
// Example: Reading architect agent template
const resource = await mcp.readResource('forge://templates/agents/architect');
```

Agents should be invoked contextually - let the task type and development phase guide which agent expertise to apply.

## Development Commands

```bash
# Start the server (stdio transport)
npm start

# Development mode with debug logging
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## Architecture

### Core Components

1. **MCP Server** (`server.js`, `lib/core/mcp-server.js`)
   - Main entry point that handles transport selection (stdio or SSE)
   - Manages server lifecycle and protocol implementation
   - Coordinates resources, tools, and state management

2. **State Manager** (`lib/core/state-manager.js`)
   - Handles persistent state in `.forge/` directory structure
   - Manages project configuration, cycles, and learnings
   - File-based state storage for simplicity and transparency

3. **Transport Layer** (`lib/transport/`)
   - `stdio.js`: Default stdio transport for Claude Desktop and VS Code
   - `sse.js`: Server-Sent Events transport for web clients

4. **Resources** (`lib/resources/index.js`)
   - Provides MCP resources for templates, cycles, context, and learnings
   - URI pattern: `forge://[category]/[item]`
   - Template system includes agent definitions and cycle templates

5. **Tools** (`lib/tools/index.js`)
   - MCP tool implementations for FORGE workflow operations
   - Project initialization, cycle management, phase progression
   - Learning capture and retrospective generation

### FORGE Development Cycle

The framework organizes work into 5-phase cycles:
1. **Focus** - Requirements gathering and planning
2. **Orchestrate** - Task breakdown and dependency planning
3. **Refine** - Implementation and testing
4. **Generate** - Build and deployment preparation
5. **Evaluate** - Success measurement and retrospective

### File Structure

```
.forge/                  # Project state directory
  ├── context.yaml      # Project configuration
  ├── learnings.yaml    # Knowledge base
  ├── cycles/           # Development cycles
  │   ├── active/       # Current cycles
  │   └── completed/    # Archived cycles
  └── retrospectives/   # Cycle retrospectives
```

## Testing Approach

Tests are located in `test/` directory and use Node.js built-in test capabilities. Run individual tests with:
```bash
node test/basic-test.js
```

## Key MCP Tools

- `forge_init_project` - Initialize FORGE in a project
- `forge_new_cycle` - Create development cycle
- `forge_cycle_status` - Check cycle progress
- `forge_phase_advance` - Move to next phase
- `forge_complete_cycle` - Complete and archive cycle
- `forge_add_learning` - Capture project insights
- `forge_retrospective` - Generate retrospective
- `forge_analyze_project` - Analyze project structure

## Development Guidelines

- This is a pure MCP server with no CLI interface - all interaction happens through MCP protocol
- State is stored in simple YAML files for transparency and easy debugging
- Templates use Markdown format for AI-friendly processing
- The server supports both stdio (default) and SSE transports
- Debug logging available with `--debug` flag for troubleshooting