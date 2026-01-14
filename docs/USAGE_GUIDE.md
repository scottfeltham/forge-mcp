# FORGE Usage Guide

This guide covers both the **MCP Server** and **Claude Code Skill** implementations of FORGE.

## Quick Start

### Option 1: MCP Server (Recommended for IDE Integration)

1. **Add to Claude Code settings** (`~/.claude/settings.json`):
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

2. **Start using FORGE** - just ask Claude:
```
Initialize FORGE in this project
Start a new cycle for user authentication
```

### Option 2: Claude Code Skill (No MCP Required)

1. **Copy skill to project**:
```bash
cp -r forge-skill/.claude/skills/forge .claude/skills/
```

2. **Just talk to Claude** - the skill auto-activates on keywords:
```
"Start a new FORGE cycle for payment processing"
"Advance to the next phase"
"Check my cycle status"
```

The skill activates automatically when you mention:
- "forge", "FORGE", "new cycle", "start cycle"
- "advance phase", "next phase", "checkpoint"
- Phase names: "focus", "orchestrate", "refine", "generate", "evaluate"

Claude runs the tools for you - no manual commands needed.

---

## The FORGE Workflow

### Phase 1: Focus 🎯
**Purpose**: Define what you're building and why

**Say to Claude**:
- "Initialize FORGE in this project"
- "Start a new cycle for [feature name]"

**Required Outputs**:
- [ ] Problem statement and target users
- [ ] Testable success criteria
- [ ] C4 Level 1 System Context diagram
- [ ] Clear boundaries (what you WON'T build)

**Check Progress**: "What's my cycle status?"

---

### Phase 2: Orchestrate 📋
**Purpose**: Break work into session-sized pieces

**Say to Claude**: "Advance to Orchestrate phase"

**Required Outputs**:
- [ ] Container architecture (C4 L2)
- [ ] Component architecture (C4 L3)
- [ ] Dependency map
- [ ] Tasks sized for single AI sessions

**Complete tasks**: "Mark 'Container architecture' as complete"

---

### Phase 3: Refine ✏️
**Purpose**: Define exactly what "done" looks like

⚠️ **CRITICAL: No code in this phase - specifications only**

**Required Outputs**:
- [ ] Acceptance criteria (Given-When-Then format)
- [ ] Interface specifications
- [ ] Edge cases enumerated by category
- [ ] Constraints vs criteria documented

**Given-When-Then Example**:
```gherkin
Given a user is logged in
When they click logout
Then their session is invalidated
And they are redirected to login
```

**Edge Case Categories**:
| Category | Examples |
|----------|----------|
| Empty/null | Empty string, null input |
| Boundary | Min/max values |
| Invalid | Wrong type, malformed data |
| Timing | Concurrent requests, timeouts |
| Failure | Network errors |

---

### Phase 4: Generate ⚡
**Purpose**: AI writes code following TDD

**Process**: RED → GREEN → REFACTOR
1. **RED**: Write failing test first
2. **GREEN**: Minimal code to pass
3. **REFACTOR**: Improve while tests stay green

**Rules**:
- One task per AI session
- Tests BEFORE implementation
- 80% minimum coverage

**Say to Claude**: "Add task: Implement user authentication"

---

### Phase 5: Evaluate ✅
**Purpose**: Verify output matches intent

**Checklist**:
- [ ] Criteria verified line-by-line
- [ ] Edge cases tested
- [ ] Security review completed
- [ ] Integration tested

**Disposition Options**:
| Decision | Meaning | Action |
|----------|---------|--------|
| Accept | Meets all criteria | Complete cycle |
| Accept with issues | Works, minor issues | Document, plan fixes |
| Revise | Doesn't meet criteria | Back to Generate |
| Reject | Fundamental problems | Back to Focus |

**Say to Claude**: "Complete this cycle"

---

## Capturing Learnings

**Say to Claude**:
- "Add a pattern learning: [title] - [description]"
- "Record an anti-pattern: [what to avoid]"
- "Capture this decision: [what we decided and why]"

**Categories**:
- `pattern` - Successful approaches to reuse
- `anti-pattern` - Approaches to avoid
- `decision` - Key decisions and rationale
- `tool` - Useful tools and techniques

**Run retrospective**: "Start a retrospective for this cycle"

---

## MCP Tools Reference

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
| `forge_complete_cycle` | Archive completed cycle |
| `forge_add_learning` | Capture learning |
| `forge_retro` | Start retrospective |
| `forge_get_cycle` | Get cycle content |
| `forge_invoke_agent` | Invoke specialist agent |

---

## Invoking Specialist Agents

FORGE provides specialized agents for expert guidance:

| Agent | Expertise |
|-------|-----------|
| `architect` | System design, C4 diagrams, technology selection |
| `developer` | TDD implementation, code patterns |
| `tester` | Test strategy, edge cases, quality |
| `security` | Threat modeling, OWASP, compliance |
| `devops` | CI/CD, infrastructure, deployment |
| `documentation` | Technical writing, API docs |
| `reviewer` | Code review, best practices |

**Invoke an agent**:
```
forge_invoke_agent agent="architect" task="Design authentication system"
```

**Phase-Agent Recommendations**:
| Phase | Recommended Agents |
|-------|-------------------|
| Focus | architect, security, documentation |
| Orchestrate | architect |
| Refine | tester, architect |
| Generate | developer, reviewer |
| Evaluate | tester, security |

---

## File Structure

FORGE creates this structure in your project:

```
.forge/
├── config.yaml       # Project configuration
├── context.md        # AI assistant context
├── learnings.md      # Knowledge base
└── cycles/
    ├── active/       # Current cycles
    │   └── 20250113-feature-name.md
    └── completed/    # Archived cycles
```

---

## Best Practices

1. **Don't skip phases** - Each phase prevents problems in later phases
2. **Keep tasks small** - One task = one AI session
3. **Write criteria first** - In Refine, before any code
4. **Test first** - In Generate, RED before GREEN
5. **Capture learnings** - Build your knowledge base
6. **Run retrospectives** - Improve your process

---

## Troubleshooting

**"FORGE not initialized"**
→ Say: "Initialize FORGE in this project"

**"Cannot advance: incomplete items"**
→ Say: "What's incomplete in my current phase?"
→ Then: "Mark [item] as complete"

**"Cycle not found"**
→ Say: "List my FORGE cycles"

**Phase validation failed**
→ Say: "Validate my current phase"
