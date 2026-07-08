# FORGE MCP Server

> 🧊 **MAINTENANCE MODE.** The canonical FORGE implementation is now
> [forge-skill](https://github.com/scottfeltham/forge-skill) (Claude Code
> skill) paired with forge-kit (phase-guard hook). This server shares the
> same `.forge/` state format and remains available for MCP-only clients
> (Cursor, VS Code, etc.), but new capabilities land in the skill first.

**Pure MCP (Model Context Protocol) implementation of the FORGE development framework**

FORGE MCP Server is an AI-native development framework designed for AI-powered development tools. It provides structured workflow management through the MCP standard, implementing Intent-Driven Development (IDD).

## Features

- **AI-Native Design**: Built for AI coding assistants (Claude Code, Cursor, VS Code)
- **5-Phase Workflow**: Focus → Orchestrate → Refine → Generate → Evaluate
- **TDD Enforcement**: Tests before implementation, 80% minimum coverage
- **Learning System**: Persistent project knowledge base
- **Specialist Agents**: Expert guidance for each development aspect

## Quick Start

### Local Installation

```bash
cd forge-mcp
npm install
npm start
```

### Claude Code Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": ["/path/to/forge-mcp/server.js"]
    }
  }
}
```

### Usage

Just talk to Claude:
- "Initialize FORGE in this project"
- "Start a new cycle for user authentication"
- "What's my cycle status?"
- "Advance to the next phase"

## Development Cycles

FORGE implements Intent-Driven Development through 5 phases:

| Phase | Purpose | Key Output |
|-------|---------|------------|
| **Focus** 🎯 | Clarity: What & Why | Problem statement, success criteria, C4 L1 |
| **Orchestrate** 📋 | Planning: Break It Down | C4 L2-L3, dependency map, session-sized tasks |
| **Refine** ✏️ | Precision: Define "Done" | Acceptance criteria, interfaces, edge cases |
| **Generate** ⚡ | Creation: TDD Code | RED → GREEN → REFACTOR |
| **Evaluate** ✅ | Verification | Criteria check, security review, disposition |

**Key Rule**: No code in Refine phase - specifications only.

## MCP Tools

| Tool | Purpose |
|------|---------|
| `forge_init` | Initialize FORGE in project |
| `forge_new_cycle` | Create development cycle |
| `forge_list_cycles` | List all cycles |
| `forge_status` | Check cycle progress |
| `forge_validate` | Validate phase requirements |
| `forge_advance_phase` | Move to next phase |
| `forge_complete_task` | Mark task complete |
| `forge_add_task` | Add new task |
| `forge_complete_cycle` | Complete and archive cycle |
| `forge_add_learning` | Capture learning |
| `forge_retro` | Run retrospective |
| `forge_invoke_agent` | Invoke specialist agent |

## MCP Resources

| URI | Content |
|-----|---------|
| `forge://config` | Project configuration |
| `forge://context` | AI assistant context |
| `forge://learnings` | Knowledge base |
| `forge://cycles/{id}` | Cycle content |
| `forge://cookbook/{phase}` | Phase guides |
| `forge://agents/{name}` | Agent definitions |

## Specialist Agents

| Agent | Expertise |
|-------|-----------|
| `architect` | System design, C4 diagrams, technology selection |
| `developer` | TDD implementation, code patterns |
| `tester` | Test strategy, edge cases, quality |
| `security` | Threat modeling, OWASP, compliance |
| `devops` | CI/CD, infrastructure, deployment |
| `documentation` | Technical writing, API docs |
| `reviewer` | Code review, best practices |

## Project Structure

```
forge-mcp/
├── server.js              # Entry point
├── lib/
│   ├── core/
│   │   ├── mcp-server.js  # MCP protocol handler
│   │   └── state-manager.js # File-based state
│   ├── tools/index.js     # MCP tool implementations
│   ├── resources/index.js # MCP resource handlers
│   └── transport/stdio.js # Stdio transport
├── cookbook/phases/       # Phase guides
├── prompts/               # PRD and retrospective guides
└── templates/             # Cycle and agent templates
```

## Development

```bash
npm test        # Run tests
npm run dev     # Debug mode
npm run lint    # Check code style
```

## License

MIT License - see [LICENSE](LICENSE) file.

---

*FORGE - Intent-Driven Development for the AI era*
