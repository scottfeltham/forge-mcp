# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FORGE MCP Server is a pure MCP (Model Context Protocol) implementation of the FORGE development framework. It's designed from the ground up for AI assistant interaction, providing structured development workflow management without any CLI interface.

## Claude Code Subagent Integration

FORGE provides specialized Claude Code subagents for expert guidance throughout development cycles. These are real subagents with proper tool restrictions and context management.

### Available Specialized Agents

**Core Development Agents:**
- **🟦 Architect Agent** - System design, architecture patterns, technology selection
- **🟨 Developer Agent** - Code implementation, TDD practices, technical problem-solving
- **🟪 Tester Agent** - Test strategy, quality assurance, test automation
- **🟩 DevOps Agent** - Infrastructure, CI/CD, deployment automation

**Quality & Process Agents:**
- **🟥 Security Agent** - Security analysis, threat modeling, compliance
- **🟫 Documentation Agent** - Technical writing, knowledge management
- **🟧 Code Reviewer Agent** - Code quality, best practices enforcement

**Coordination Agents:**
- **🔗 Integration Coordinator Agent** - Monorepo coordination, cross-component integration

### Phase-Based Agent Selection

FORGE implements Intent-Driven Development (IDD) through 5 phases:

| Phase | Purpose | Primary Agents | Deliverables |
|-------|---------|----------------|--------------|
| **Focus** 🎯 | Clarity: What & Why | Architect, Security, Documentation | Problem statement, success criteria, C4 L1 |
| **Orchestrate** 📋 | Planning: Break It Down | Architect | C4 L2-L3, dependency map, session-sized tasks |
| **Refine** ✏️ | Precision: Define "Done" | Tester, Architect | Acceptance criteria, interfaces, edge cases |
| **Generate** ⚡ | Creation: AI Writes Code | Developer, Reviewer | TDD implementation, code review |
| **Evaluate** ✅ | Verification: Match Intent | Tester, Security | Criteria verification, edge case testing |

**CRITICAL**: Refine phase is for SPECIFICATION only - no code is written. Generate phase is where TDD implementation happens.

### Monorepo Coordination
For monorepo projects, use the Integration Coordinator Agent to manage:
- Cross-component dependencies and API contracts
- Frontend ↔ Backend integration points
- Multi-team FORGE cycle coordination
- Shared library and component management
- Synchronized release strategies

### Agent Invocation
Use `forge_invoke_agent` to activate specialized agents:
```javascript
// Invoke architect for system design
forge_invoke_agent('architect', 'cycle-id', 'Design authentication system architecture')

// Invoke security agent for threat analysis
forge_invoke_agent('security', 'cycle-id', 'Analyze payment processing security risks')

// Invoke integration coordinator for monorepo coordination
forge_invoke_agent('integration-coordinator', 'cycle-id', 'Coordinate FE/BE API contracts')
```

Agents are automatically invoked during cycle creation and provide context-aware, phase-specific guidance with proper tool restrictions and deliverable requirements.

## Interactive Workflow: Clarity Before Action

During **Focus, Orchestrate, and Refine** phases, you must gain clarity before proceeding:

1. **Assess clarity** - Are the requirements/inputs clear or vague?
2. **If vague** → Ask targeted clarifying questions (use `prompts/prd-conversation.md` as a guide)
3. **Always** → Summarize your understanding and confirm with the user before advancing

### Phase Confirmation Pattern

| Phase | Summarize & Confirm |
|-------|---------------------|
| **Focus** | "Problem: X. Users: Y. Success: Z. Boundaries: [in/out of scope]. Correct?" |
| **Orchestrate** | "Architecture: N containers/components. Dependencies: [map]. Task breakdown: [list]. Correct?" |
| **Refine** | "Acceptance criteria: [Given-When-Then]. Edge cases: [categories]. Interfaces: [specs]. Correct?" |

Only advance after user confirms. Generate and Evaluate phases may proceed without additional confirmation once Refine is validated.

### Resolving Clarity Issues (Any Phase)

If clarity issues arise at any phase, you may:
- Ask targeted clarifying questions
- Invoke specialist agents for guidance
- Recommend returning to an earlier phase

## Conversational PRD Building

FORGE uses an **interactive, conversational approach** when creating new development cycles:

### Starting a New Cycle

When you call `forge_new_cycle` with minimal information, FORGE will:

1. **Ask clarifying questions** about the feature requirements
2. **Guide you through PRD creation** with structured prompts
3. **Validate completeness** before creating the cycle
4. **Request confirmation** showing what will be created

**Example Flow:**
```javascript
// Initial request with minimal info
forge_new_cycle('user-authentication')

// FORGE responds with questions:
// - What authentication methods?
// - Security requirements?
// - Integration points?
// - Success criteria?

// After you provide details, FORGE validates and may ask for more info
// Only when PRD is complete does FORGE create the cycle
```

### PRD Requirements

A comprehensive PRD should include:

- **User Context**: Who needs this and why?
- **Acceptance Criteria**: What defines success?
- **Technical Details**: System components and integrations
- **Security & Compliance**: Requirements and standards
- **Success Metrics**: Measurable outcomes

### Bypassing Validation

For experienced users or quick prototypes, you can skip validation:

```javascript
forge_new_cycle('feature-name', {
  description: 'detailed description...',
  confirmed: true  // Skip PRD validation
})
```

⚠️ **Not recommended** - Incomplete requirements lead to scope creep and rework!

## Command Safety and Destructive Operations

**CRITICAL: FORGE enforces safety checks for all destructive operations.**

### Protected Command Patterns

FORGE automatically detects and requires human approval for:

**File Deletion:**
- `rm -rf` - Recursive deletion
- `rm /path/` - Directory deletion
- Any `rm` with wildcards (`rm *`)

**Dangerous Operations:**
- `chmod 777` - World-writable permissions
- `>>/dev/` - Writing to device files
- `dd` commands - Direct disk operations
- `mkfs` - Filesystem creation

**Git Operations:**
- `git push --force` - Force push (use --force-with-lease)
- `git reset --hard` - Hard reset (loses changes)
- `git clean -fd` - Cleaning untracked files
- `git branch -D` - Force delete branch

**System Modifications:**
- `sudo rm` - Elevated deletion
- `sudo shutdown/reboot` - System control
- `kill -9` - Force kill processes
- Package removal (`npm uninstall`, `apt remove`)

**Database Operations:**
- `DROP DATABASE` - Database deletion
- `DROP TABLE` - Table deletion
- `TRUNCATE` - Data truncation
- `DELETE FROM` - Row deletion

### AI Assistant Guidelines

When working with FORGE, AI assistants MUST:

1. **NEVER execute destructive commands without explicit human approval**
2. **ALWAYS suggest safer alternatives first**
3. **REQUIRE confirmation for any command matching destructive patterns**
4. **EXPLAIN the risks before requesting approval**
5. **LOG all destructive operations for audit trail**

### Safety Workflow

```
1. AI detects potentially destructive command
2. AI presents WARNING with:
   - Command and risk level
   - What could go wrong
   - Safer alternatives
   - Approval requirement
3. Human reviews and approves/rejects
4. If approved, AI asks for FINAL confirmation
5. Command executes only after double confirmation
```

### Example: Safe vs Unsafe

❌ **UNSAFE - Will be blocked:**
```bash
rm -rf node_modules/
git push --force
chmod 777 -R .
```

✅ **SAFE - Recommended alternatives:**
```bash
# Instead of rm -rf, use package manager
npm ci  # Reinstalls cleanly

# Instead of force push
git push --force-with-lease

# Instead of 777
chmod 755 file.sh  # Specific, appropriate permissions
```

### Bypass Safety (NOT RECOMMENDED)

Safety checks can be disabled in FORGE config:
```yaml
safety:
  commandValidation: false  # Disables all safety checks
```

⚠️ **WARNING:** Disabling safety checks removes all protections. Only do this in controlled, isolated environments.

### CommandSafety Integration

The CommandSafety class (`lib/core/command-safety.js`) provides the validation engine. AI assistants should use it as follows:

#### JavaScript Integration

```javascript
const { CommandSafety } = require('./lib/core/command-safety.js');
const safety = new CommandSafety({ logger: console });

// Before executing ANY command:
const validation = safety.validateCommand(command);

if (!validation.safe) {
  // STOP - Present warning to human
  const prompt = safety.generateConfirmationPrompt(command, validation);
  console.log(prompt);

  // Wait for explicit user approval
  // DO NOT execute until user confirms
  return;
}

// Log all commands for audit trail
safety.logCommand(command, validation, userApproved);
```

#### CommandSafety API

**validateCommand(command)** - Returns validation result:
```javascript
{
  safe: boolean,                // false if destructive pattern detected
  severity: string,             // 'critical' | 'high' | 'medium' | 'low' | 'none'
  description: string,          // Human-readable reason
  pattern: string,              // Regex pattern that matched (optional)
  requiresConfirmation: boolean // true for unsafe commands
}
```

**generateConfirmationPrompt(command, validation)** - Returns formatted warning with:
- Severity indicator with emoji (🚨 critical, ⚠️ high/medium, 💡 low)
- Command being blocked
- Risk level and explanation
- Specific warnings based on severity
- Safer alternatives for high/critical operations
- Step-by-step approval instructions

**logCommand(command, validation, approved)** - Creates audit trail:
```javascript
{
  command: string,
  severity: string,
  description: string,
  approved: boolean,
  timestamp: ISO8601
}
```

#### Severity Levels

- **Critical**: Permanent data loss, system instability (rm -rf, DROP DATABASE, dd)
- **High**: File/data deletion, losing uncommitted changes (git reset --hard, rm directories)
- **Medium**: System state modification, service impact (chmod 777, kill -9, reboot)
- **Low**: Dependency removal, requires reinstall (npm uninstall, pip uninstall)

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
   - `stdio.js`: Default stdio transport for development tools (Claude Code, VS Code, etc.)
   - `sse.js`: Server-Sent Events transport for web-based clients

4. **Resources** (`lib/resources/index.js`)
   - Provides MCP resources for templates, cycles, context, and learnings
   - URI pattern: `forge://[category]/[item]`
   - Template system includes agent definitions and cycle templates

5. **Tools** (`lib/tools/index.js`)
   - MCP tool implementations for FORGE workflow operations
   - Project initialization, cycle management, phase progression
   - Learning capture and retrospective generation

### FORGE Development Cycle

The framework organizes work into 5-phase cycles implementing Intent-Driven Development:

1. **Focus** 🎯 - **Clarity: What & Why**
   - Problem statement, target users, testable success criteria
   - System Context diagram (C4 Level 1)
   - Clear boundaries - what you WON'T build

2. **Orchestrate** 📋 - **Planning: Break It Down**
   - Container architecture (C4 Level 2) - deployable units
   - Component architecture (C4 Level 3) - internal structure
   - Dependency mapping, session-sized tasks

3. **Refine** ✏️ - **Precision: Define "Done" BEFORE Code**
   - Acceptance criteria (Given-When-Then format)
   - Interface specifications (inputs, outputs, errors)
   - Edge cases by category - NO CODE WRITTEN

4. **Generate** ⚡ - **Creation: AI Writes Code**
   - One task per session
   - TDD: RED → GREEN → REFACTOR
   - Code review before advancing

5. **Evaluate** ✅ - **Verification: Does Output Match Intent?**
   - Verify against acceptance criteria
   - Test edge cases (listed AND unlisted)
   - Disposition: Accept / Accept with issues / Revise / Reject

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

| Tool | Purpose |
|------|---------|
| `forge_init` | Initialize FORGE in a project |
| `forge_new_cycle` | Create development cycle |
| `forge_list_cycles` | List all cycles |
| `forge_status` | Check cycle progress |
| `forge_validate` | Validate phase requirements |
| `forge_advance_phase` | Move to next phase |
| `forge_complete_task` | Mark task complete |
| `forge_add_task` | Add new task |
| `forge_complete_cycle` | Complete and archive cycle |
| `forge_add_learning` | Capture project insights |
| `forge_retro` | Run retrospective |
| `forge_get_cycle` | Get cycle content |
| `forge_invoke_agent` | Invoke specialist agent |

## Development Guidelines

- This is a pure MCP server with no CLI interface - all interaction happens through MCP protocol
- State is stored in simple YAML files for transparency and easy debugging
- Templates use Markdown format for AI-friendly processing
- The server supports both stdio (default) and SSE transports
- Debug logging available with `--debug` flag for troubleshooting

### Git Workflow Best Practices

**FORGE strongly encourages regular commits and pushes throughout development cycles:**

- **Commit frequently**: After completing each meaningful task or checkpoint
- **Push regularly**: Share your progress with the team at least daily
- **Descriptive messages**: Write clear commit messages that explain the "why"
- **Small, focused commits**: Each commit should represent a single logical change

**Phase-specific commit guidelines:**
- **Focus Phase**: Commit problem statements, success criteria, C4 L1 diagrams
- **Orchestrate Phase**: Commit C4 L2-L3 architecture, dependency maps, task breakdowns
- **Refine Phase**: Commit acceptance criteria, interface specs, edge case lists (NO CODE)
- **Generate Phase**: Commit implementation code, tests, code review results
- **Evaluate Phase**: Commit verification results, retrospectives, disposition decisions

**Benefits of regular commits:**
- Maintains clear project history and progress tracking
- Enables easy rollback if issues arise
- Facilitates team collaboration and code review
- Preserves work incrementally, reducing risk of loss
- Allows parallel development without conflicts