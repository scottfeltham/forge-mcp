# FORGE Agent Usage Guide

This guide explains how and when FORGE specialized agents are invoked during development cycles.

## Overview

FORGE agents are AI-powered specialists that provide expertise during specific phases of development. They are automatically invoked by AI assistants when working with FORGE MCP Server, based on the current phase and task requirements.

## Agent Invocation Patterns

### Automatic Phase-Based Invocation

Agents are automatically engaged based on the current development phase:

#### Focus Phase (Requirements & Planning)
- **Project Analyzer Agent** - Initial project analysis and setup
- **Architect Agent** - System design and architecture planning
- **Security Agent** - Threat modeling and security requirements
- **Documentation Agent** - Documentation planning and structure

#### Orchestrate Phase (Task Breakdown)
- **Architect Agent** - Detailed design and interface definition
- **DevOps Agent** - Infrastructure and pipeline planning
- **Tester Agent** - Test strategy and scenario planning

#### Refine Phase (Implementation)
- **Developer Agent** - PRIMARY - Code implementation guidance
- **Code Reviewer Agent** - Continuous code review during development
- **Tester Agent** - Test implementation and execution
- **Security Agent** - Security control implementation

#### Generate Phase (Build & Deploy)
- **DevOps Agent** - PRIMARY - Deployment and release management
- **Documentation Agent** - Release notes and documentation updates
- **Tester Agent** - Final validation and smoke testing

#### Evaluate Phase (Retrospective)
- **All Agents** contribute to retrospective analysis
- **Documentation Agent** - Captures learnings and updates knowledge base

### Task-Based Invocation

Agents are also invoked based on specific task types:

```yaml
task_agent_mapping:
  architecture:
    primary: architect
    supporting: [security, devops]
    
  implementation:
    primary: developer
    supporting: [tester, reviewer]
    
  testing:
    primary: tester
    supporting: [developer, security]
    
  deployment:
    primary: devops
    supporting: [security, tester]
    
  documentation:
    primary: documentation
    supporting: [architect, developer]
    
  security:
    primary: security
    supporting: [devops, architect]
    
  review:
    primary: reviewer
    supporting: [security, tester]
```

## Usage Examples

### Example 1: Starting a New Feature

```markdown
User: "I need to implement user authentication for my React app"

AI Assistant Actions:
1. Invokes Project Analyzer Agent to understand current project structure
2. Creates new development cycle for authentication feature
3. During Focus phase:
   - Architect Agent designs authentication architecture
   - Security Agent defines security requirements
   - Documentation Agent plans documentation needs
4. During Orchestrate:
   - Breaks down into tasks with appropriate agent assignments
5. During Refine:
   - Developer Agent guides implementation
   - Tester Agent creates test scenarios
   - Code Reviewer provides continuous feedback
```

### Example 2: Security Audit

```markdown
User: "Can you perform a security review of my API?"

AI Assistant Actions:
1. Invokes Security Agent as primary specialist
2. Security Agent coordinates with:
   - Code Reviewer Agent for code-level vulnerabilities
   - DevOps Agent for infrastructure security
   - Architect Agent for architectural security patterns
3. Generates comprehensive security report
```

### Example 3: Setting Up CI/CD

```markdown
User: "Help me set up continuous deployment for my project"

AI Assistant Actions:
1. Invokes DevOps Agent as primary specialist
2. DevOps Agent:
   - Analyzes current project structure
   - Designs CI/CD pipeline architecture
   - Creates deployment configurations
3. Supporting agents:
   - Tester Agent integrates test automation
   - Security Agent adds security scanning
   - Documentation Agent documents procedures
```

## Agent Selection Logic

The AI assistant selects agents based on:

1. **Current Phase** - Each phase has primary and supporting agents
2. **Task Type** - Specific tasks trigger specific agents
3. **Project Context** - Project type influences agent priority
4. **User Request** - Explicit requests override default selection

### Priority Matrix

| Task Category | Primary Agent | Secondary Agents | Triggered By |
|--------------|--------------|------------------|--------------|
| New Feature | Developer | Architect, Tester | "implement", "build", "create" |
| Bug Fix | Developer | Tester, Reviewer | "fix", "debug", "resolve" |
| Architecture | Architect | Security, DevOps | "design", "structure", "plan" |
| Testing | Tester | Developer, Security | "test", "validate", "verify" |
| Deployment | DevOps | Security, Tester | "deploy", "release", "ship" |
| Security | Security | Architect, DevOps | "security", "vulnerability", "compliance" |
| Documentation | Documentation | Developer, Architect | "document", "explain", "describe" |
| Code Review | Reviewer | Security, Tester | "review", "quality", "refactor" |

## Agent Collaboration Patterns

### Sequential Collaboration
Agents work in sequence, each building on the previous agent's output:

```
Architect → Developer → Tester → DevOps
```

### Parallel Collaboration
Multiple agents work simultaneously on different aspects:

```
         ┌─→ Developer (implementation)
Architect├─→ Tester (test planning)
         └─→ Documentation (API docs)
```

### Consultative Collaboration
Primary agent consults with specialists as needed:

```
Developer ←→ Security (for auth implementation)
         ←→ Architect (for pattern guidance)
         ←→ Reviewer (for quality checks)
```

## Best Practices

1. **Let Agents Guide the Process**
   - Trust agent recommendations for their specialty areas
   - Allow agents to identify issues early in the cycle

2. **Provide Context**
   - Share project constraints and requirements
   - Mention specific compliance or framework needs

3. **Iterative Refinement**
   - Agents learn from each cycle
   - Captured learnings improve future recommendations

4. **Cross-Agent Validation**
   - Security Agent validates Developer implementations
   - Reviewer Agent ensures Architect patterns are followed
   - Tester Agent verifies DevOps configurations

## Agent Resource Access

Each agent can access:
- Project configuration (`forge://context/project`)
- Previous learnings (`forge://context/learnings`)
- Active cycles (`forge://cycles/active`)
- Their specialized templates (`forge://templates/agents/*`)

## Customizing Agent Behavior

While agents have default behaviors, you can influence their focus:

1. **Project Type Configuration**
   ```yaml
   project_type: api
   # Emphasizes API design, security, performance
   ```

2. **Phase Emphasis**
   ```yaml
   phase_emphasis:
     security: high
     performance: medium
   ```

3. **Explicit Instructions**
   ```markdown
   "Focus on GDPR compliance during implementation"
   "Prioritize mobile performance optimization"
   ```

## Agent Output Formats

Each agent provides structured output:

- **Architect**: System diagrams, design decisions, trade-offs
- **Developer**: Code examples, implementation steps, best practices
- **Tester**: Test plans, scenarios, coverage reports
- **DevOps**: Pipeline configs, deployment scripts, monitoring setup
- **Security**: Threat models, vulnerability reports, compliance checklists
- **Reviewer**: Code quality metrics, improvement suggestions
- **Documentation**: User guides, API references, tutorials

## Troubleshooting Agent Invocation

If agents aren't providing expected guidance:

1. **Check Current Phase** - Some agents are phase-specific
2. **Verify Project Context** - Ensure FORGE is initialized
3. **Be Explicit** - Request specific agent expertise
4. **Review Cycle Status** - Agents respond to cycle state

## Advanced Usage

### Multi-Agent Workflows

For complex tasks, explicitly request multi-agent collaboration:

```markdown
"I need a security-focused architecture review with deployment considerations"
→ Triggers: Architect + Security + DevOps agents
```

### Agent Chaining

Chain agent expertise for comprehensive solutions:

```markdown
"Design, implement, and deploy a rate limiting feature"
→ Architect (design) → Developer (implement) → DevOps (deploy)
```

### Retrospective Learning

After each cycle, agents contribute learnings:

```markdown
- Architect: Design patterns that worked
- Developer: Implementation challenges solved
- Tester: Test strategies that found issues
- DevOps: Deployment optimizations discovered
```

These learnings improve future agent recommendations.

## Conclusion

FORGE agents work together to provide comprehensive development guidance. By understanding when and how they're invoked, you can leverage their expertise effectively throughout your development cycles.