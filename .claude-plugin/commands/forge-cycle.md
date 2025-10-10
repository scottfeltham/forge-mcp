# Create Development Cycle

Create a new FORGE development cycle with **conversational PRD building** to ensure comprehensive requirements.

## Conversational PRD Building

FORGE uses an interactive approach to help you build complete requirements:

1. **Ask clarifying questions** about the feature
2. **Guide through requirement gathering** (user context, acceptance criteria, technical details, security, success metrics)
3. **Validate completeness** before creating the cycle
4. **Generate documentation** automatically (PRD, test plan)

## Usage

### Quick Start (Conversational Mode)
```
/forge-cycle
```

Claude will engage in a conversation to understand your feature requirements.

### With Minimal Info (Triggers Conversation)
```
/forge-cycle feature-name
```

FORGE will ask questions to build a complete PRD.

### With Complete Requirements (Creates Immediately)
```
/forge-cycle feature-name --description="[comprehensive description]" --priority=high
```

If the description is comprehensive (user context, acceptance criteria, technical details, etc.), the cycle is created immediately.

## What Makes a Good PRD?

A complete PRD includes:

1. **User Context**: Who needs this and why?
2. **Acceptance Criteria**: What defines success?
3. **Technical Details**: Components, integrations, architecture
4. **Security & Compliance**: Requirements and risks
5. **Success Metrics**: How we measure success

## The Cycle is Created With:

- **Cycle ID**: Auto-generated unique identifier
- **5 Development Phases**:
  - 🎯 Focus - Requirements and planning
  - 📝 Orchestrate - Task breakdown and dependencies
  - 🔨 Refine - Implementation and testing
  - 🚀 Generate - Build and deployment
  - 📊 Evaluate - Success measurement and retrospective

- **Documentation**: PRD and test plan in `docs/`
- **Agent Recommendations**: Specialized agents for each phase
- **Progress Tracking**: Task lists and completion percentages

## Development Phases

### Focus Phase (Current)
- Gather and validate requirements
- Design architecture (Architect Agent)
- Identify security risks (Security Agent)
- Define test scenarios (Tester Agent - MANDATORY)

### Orchestrate Phase
- Break down into tasks
- Plan dependencies
- Design test strategy
- Plan CI/CD pipeline

### Refine Phase
- Implement features (TDD)
- Write and run tests
- Code review
- Security validation

### Generate Phase
- Build artifacts
- Prepare deployment
- Update documentation
- Final testing

### Evaluate Phase
- Measure success metrics
- Conduct retrospective
- Document learnings
- Plan improvements

## Phase Validation

FORGE enforces quality gates:
- ❌ Cannot advance without completing mandatory tasks
- ⚠️ Warnings for missing recommended items
- ✅ Clear guidance on what's needed to progress

## After Creation

Check cycle status:
```
/forge-status
```

Advance to next phase:
```
/forge-advance
```

Validate current phase:
```
/forge-checkpoint
```

## Philosophy

**"Invest time in Focus phase to save time in all other phases"**

Comprehensive requirements upfront prevent scope creep, reduce rework, and ensure stakeholder alignment.

Studies show 45% time savings through better upfront planning!
