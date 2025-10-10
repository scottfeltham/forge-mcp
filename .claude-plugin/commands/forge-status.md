# Check Cycle Status

View the current status of your FORGE development cycles, including progress, tasks, and agent recommendations.

## Usage

### View All Cycles
```
/forge-status
```

Shows all active cycles with their current phase and progress.

### View Specific Cycle
```
/forge-status <cycle-id>
```

Shows detailed information for a specific cycle:
- Current phase and progress
- Phase-by-phase progress bars
- Current phase tasks (completed and pending)
- Recommended agents for current phase
- Next actions to take

### Include Completed Cycles
```
/forge-status --history
```

Shows both active and recently completed cycles.

## What You'll See

### Cycle Overview
- Feature name and description
- Current phase with emoji indicator
- Priority level
- Started date

### Phase Progress
Visual progress bars for all 5 phases:
- 🎯 Focus
- 📝 Orchestrate
- 🔨 Refine
- 🚀 Generate
- 📊 Evaluate

### Current Phase Tasks
- ✅ Completed tasks
- ⬜ Pending tasks
- Task descriptions with agent assignments

### Agent Recommendations
Which specialist agents to engage for the current phase:
- 🟦 Architect Agent
- 🟨 Developer Agent
- 🟪 Tester Agent
- 🟩 DevOps Agent
- 🟥 Security Agent
- 🟫 Documentation Agent
- 🟧 Code Reviewer Agent

### Next Actions
Specific guidance on what to do next to progress the cycle.

## Example Output

```
📋 User Authentication System

**Phase**: Focus 🎯
**Priority**: high
**Started**: 2025-01-15

📊 Phase Progress:
🔵 Focus: ████████░░ 80%
⭕ Orchestrate: ░░░░░░░░░░ 0%
⭕ Refine: ░░░░░░░░░░ 0%
⭕ Generate: ░░░░░░░░░░ 0%
⭕ Evaluate: ░░░░░░░░░░ 0%

🎯 Current Phase Tasks (Focus):
✅ Design architecture (Architect Agent)
✅ Identify risks (Security Agent)
⬜ Define test scenarios (MANDATORY)

🤖 Recommended Agents:
• Architect Agent - Design system architecture
• Security Agent - Identify security requirements
• Documentation Agent - Draft PRD and requirements

💡 Next Action:
Complete "Define test scenarios (MANDATORY)" task before advancing to Orchestrate phase.
```

## Related Commands

- `/forge-cycle` - Create a new cycle
- `/forge-advance` - Move to next phase
- `/forge-checkpoint` - Validate current phase readiness

## Tips

- Check status frequently to track progress
- Use cycle-id for detailed view when working on multiple cycles
- Pay attention to mandatory tasks - they block phase advancement
- Follow agent recommendations for best results
