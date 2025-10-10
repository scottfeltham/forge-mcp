# Advance to Next Phase

Move your FORGE development cycle to the next phase after completing all requirements.

## Usage

```
/forge-advance <cycle-id>
```

Claude will use the `forge_phase_advance` MCP tool to validate the current phase and advance to the next one.

## Phase Progression

FORGE enforces a strict phase progression:

1. **Focus** 🎯 → Requirements and planning
2. **Orchestrate** 📝 → Task breakdown
3. **Refine** 🔨 → Implementation
4. **Generate** 🚀 → Build and deploy
5. **Evaluate** 📊 → Success measurement

You cannot skip phases or advance without meeting requirements.

## Validation Checks

Before advancing, FORGE validates:

### From Focus Phase
- ✅ Test scenarios defined (MANDATORY)
- ✅ Architecture design completed
- ✅ Security risks identified
- ✅ Requirements description adequate (>50 chars)
- ✅ Phase progress ≥80%

### From Orchestrate Phase
- ✅ Tasks broken down (minimum 3)
- ✅ Dependencies identified
- ✅ Test strategy defined

### From Refine Phase
- ✅ Tests written and passing (minimum 2-3 depending on detected frameworks)
- ✅ Code review completed
- ✅ Implementation tasks finished
- ✅ Linting passed (if linter configured)
- ⚠️ Security scan run (if security tools detected)

### From Generate Phase
- ✅ Build artifacts created
- ✅ Documentation updated
- ⚠️ Final validation completed

### From Evaluate Phase
- ✅ Success metrics measured
- ⚠️ Retrospective conducted

## What Happens on Advancement

1. **Current phase marked complete** (100% progress)
2. **Next phase activated** (starts at 10% progress)
3. **New agents recommended** for the next phase
4. **Tasks reset** for new phase activities
5. **Guidance provided** on next actions

## If Advancement is Blocked

FORGE will show:
- 🛑 **Blocking issues** that must be resolved
- ⚠️ **Warnings** about recommended actions
- 📋 **Required actions** with specific guidance
- 🔧 **Options** including override capability

### Override Validation

For exceptional cases, you can skip validation:
```
/forge-advance <cycle-id> --skip-validation
```

⚠️ **Not recommended!** Skipping validation can lead to:
- Incomplete requirements causing rework
- Missing tests leading to bugs
- Technical debt accumulation
- Failed deployments

## Example: Successful Advancement

```
🎯 Phase Advanced Successfully

**Cycle**: User Authentication System
**From**: Focus 🎯 ✅
**To**: Orchestrate 📝 🔵

🤖 Active Agents for Orchestrate:
• Architect Agent - Break down architecture into tasks
• DevOps Agent - Plan CI/CD pipeline
• Tester Agent - Design test strategy

💡 Next Action:
Break down "User Authentication System" into actionable tasks with dependencies
```

## Example: Blocked Advancement

```
🚫 FORGE FRAMEWORK ENFORCEMENT

Cannot advance from **Focus** phase:

**🛑 BLOCKING ISSUES:**
• Test scenarios must be completed before advancing
  Action: Complete "Define test scenarios (MANDATORY)" task
• Architecture design must be completed
  Action: Complete "Design architecture (Architect Agent)" task

**⚠️ WARNINGS:**
• Focus phase progress is only 60%
  Recommendation: Complete remaining tasks before advancing

**🔧 OPTIONS:**
• Complete the required actions above
• Use --skip-validation to override (not recommended)
• Use /forge-checkpoint to see detailed task status

🎯 FORGE Philosophy: "Quality over speed - each phase builds the foundation for the next"
```

## Related Commands

- `/forge-status` - Check current phase and progress
- `/forge-checkpoint` - Validate phase readiness before advancing
- `/forge-cycle` - Create a new development cycle

## Best Practices

1. **Check status first** with `/forge-status` to see what's needed
2. **Run checkpoint** with `/forge-checkpoint` to get detailed validation
3. **Complete all tasks** before attempting to advance
4. **Don't skip validation** unless absolutely necessary
5. **Review warnings** even if advancement succeeds

## Philosophy

**"Each phase builds the foundation for the next"**

FORGE's phase validation prevents rushing ahead with incomplete work, reducing technical debt and rework.
