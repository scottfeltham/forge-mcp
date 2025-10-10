# Validate Phase Compliance

Check if your current phase is ready for advancement with detailed validation and guidance.

## Usage

```
/forge-checkpoint <cycle-id>
```

Claude will use the `forge_checkpoint` MCP tool to perform comprehensive validation of the current phase.

## What This Does

`/forge-checkpoint` provides:

1. **Compliance Status** - Are you ready to advance?
2. **Phase Requirements** - What this phase requires
3. **Blocking Issues** - What's preventing advancement
4. **Warnings** - Recommended but not required items
5. **Immediate Actions** - Specific next steps to take

## When to Use

- **Before advancing** - Check readiness without attempting to advance
- **During development** - Verify you're on track
- **When stuck** - Get specific guidance on what's needed
- **For planning** - Understand what's required to complete the phase

## Strict vs Advisory Mode

### Strict Mode (Default)
```
/forge-checkpoint <cycle-id>
```

Enforces all requirements. Advancement blocked until issues resolved.

### Advisory Mode
```
/forge-checkpoint <cycle-id> --advisory
```

Shows recommendations without blocking. Useful for exploration.

## Example Output

```
🔍 FORGE CHECKPOINT REPORT

**Cycle**: User Authentication System
**Phase**: Focus 🎯
**Compliance Status**: ❌ NON-COMPLIANT

📋 FOCUS PHASE REQUIREMENTS:
✅ Design architecture (Architect Agent)
✅ Identify security risks (Security Agent)
❌ Define test scenarios (MANDATORY)
❌ Write detailed requirements (>50 chars)

🛑 BLOCKING ISSUES:
• Test scenarios must be completed before advancing
  Action: Complete "Define test scenarios (MANDATORY)" task
• Requirements description too brief (<50 chars)
  Action: Add detailed requirements with acceptance criteria

⚠️ WARNINGS:
• No git commits made in Focus phase
  Recommendation: Commit PRD and architecture decisions

🎯 IMMEDIATE ACTIONS REQUIRED:
• Complete test scenario definition with clear acceptance criteria
• Expand requirements description with detailed specifications
• Engage Tester Agent to define comprehensive test scenarios

📊 ENFORCEMENT LEVEL: STRICT
🔒 PHASE LOCKED: Complete required actions before advancing.
```

## Phase-Specific Validations

### Focus Phase
- Test scenarios defined (MANDATORY)
- Architecture design completed
- Security risks identified
- Requirements description adequate
- Standards detected and configured

### Orchestrate Phase
- Minimum 3 tasks defined
- Task dependencies mapped
- Test strategy created
- CI/CD pipeline planned

### Refine Phase
- Tests written and passing (2-3+ depending on framework)
- Code review completed
- Implementation tasks finished
- Linting passed (if configured)
- Security scan run (if tools detected)

### Generate Phase
- Build artifacts created
- Documentation updated
- Final validation completed
- Deployment prepared

### Evaluate Phase
- Success metrics collected
- Retrospective conducted (recommended)
- Learnings documented

## Standards Integration

FORGE integrates with detected project standards:

- **If Jest/Pytest detected** → Higher test count required
- **If ESLint/Pylint configured** → Linting must pass
- **If Snyk/npm audit present** → Security scans enforced
- **If GitHub Actions/GitLab CI** → CI pipeline validation

## After Checkpoint

### If Compliant (✅)
```
🚀 READY TO ADVANCE:
All requirements satisfied. Use /forge-advance to move to next phase.
```

### If Non-Compliant (❌)
Follow the immediate actions listed, then:
1. Complete the required tasks
2. Run `/forge-checkpoint` again to verify
3. Use `/forge-advance` when ready

## Checkpoint vs Advance

| Command | Purpose | Changes State |
|---------|---------|---------------|
| `/forge-checkpoint` | Validate readiness | No ❌ |
| `/forge-advance` | Move to next phase | Yes ✅ |

**Pro Tip**: Always run `/forge-checkpoint` before `/forge-advance` to avoid blocked attempts.

## Related Commands

- `/forge-status` - View current cycle status
- `/forge-advance` - Advance to next phase (after checkpoint passes)
- `/forge-cycle` - Create new development cycle

## Philosophy

**"Measure twice, cut once"**

Checkpoints help you validate readiness before committing to advancement, preventing wasted effort and ensuring quality.
