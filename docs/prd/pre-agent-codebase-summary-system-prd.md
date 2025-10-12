---
title: Pre-agent codebase summary system
type: PRD
created: 2025-10-12T15:57:08.321Z
updated: 2025-10-12T15:57:08.321Z
version: 1.0.0
status: Draft
author: FORGE MCP Server
cycleId: pre-agent-codebase-summary-system

---

# Product Requirements Document: Pre-agent codebase summary system

## Executive Summary

**Problem Statement**: This feature addresses: Create a comprehensive codebase summary document that agents can reference to understand the project structure, architecture, and key components without repeatedly analyzing the same files. This will save token usage and improve agent efficiency.

## Goals
- Create a single source of truth for codebase understanding
- Document all key components and their interactions
- Provide architecture overview and data flow
- List all MCP tools and their purposes
- Document file structure and organization
- Include agent integration patterns

## Requirements
- Summary should be loaded before agent invocation
- Should cover: architecture, core components, MCP tools, file structure, development workflow
- Must be kept up-to-date as codebase evolves
- Should reduce redundant file reading by agents

## Success Criteria
- Agents can understand codebase from summary alone
- Token usage reduced on agent invocations
- No duplicate codebase analysis across agents
- Summary is comprehensive yet concise

**Solution Overview**: Create a comprehensive codebase summary document that agents can reference to understand the project structure, architecture, and key components without repeatedly analyzing the same files. This will save token usage and improve agent efficiency.

## Goals
- Create a single source of truth for codebase understanding
- Document all key components and their interactions
- Provide architecture overview and data flow
- List all MCP tools and their purposes
- Document file structure and organization
- Include agent integration patterns

## Requirements
- Summary should be loaded before agent invocation
- Should cover: architecture, core components, MCP tools, file structure, development workflow
- Must be kept up-to-date as codebase evolves
- Should reduce redundant file reading by agents

## Success Criteria
- Agents can understand codebase from summary alone
- Token usage reduced on agent invocations
- No duplicate codebase analysis across agents
- Summary is comprehensive yet concise

**Business Value**: Expected impact and benefits to be defined during requirements gathering.

## Target Users

### Primary Users
- **FORGE Specialized Agents**: All 7 agents that need codebase context
  - 🟦 Architect Agent - Needs architecture and component overview
  - 🟨 Developer Agent - Needs file structure and development workflow
  - 🟪 Tester Agent - Needs component interactions for test planning
  - 🟩 DevOps Agent - Needs deployment architecture and tools
  - 🟥 Security Agent - Needs data flow and security patterns
  - 🟫 Documentation Agent - Needs overall system understanding
  - 🟧 Reviewer Agent - Needs coding standards and patterns

### Secondary Users
- **Human Developers**: Reference for onboarding and system understanding
- **External AI Assistants**: Any AI tool that needs FORGE context

## Requirements

### Functional Requirements

#### Core Features

**FR1: Codebase Summary Document**
- **Location**: `.forge/codebase-summary.md`
- **Format**: Markdown for optimal AI readability
- **Size Target**: Comprehensive yet under 5000 tokens
- **Acceptance Criteria**:
  - [ ] Document exists at `.forge/codebase-summary.md`
  - [ ] Contains all required sections (see FR2)
  - [ ] Size is under 5000 tokens
  - [ ] Validates as proper Markdown
- **Priority**: High

**FR2: Required Content Sections**
- **Architecture Overview**: High-level system design, component relationships
- **Core Components**: Detailed breakdown of lib/core/, lib/tools/, lib/resources/
- **MCP Tools Reference**: All tools with parameters, return types, use cases
- **File Structure**: Directory organization, key files, naming conventions
- **Development Workflow**: Git practices, testing approach, deployment
- **Agent Integration Patterns**: How agents are invoked, context loading
- **Acceptance Criteria**:
  - [ ] Each section is present and complete
  - [ ] Architecture diagram or ASCII representation included
  - [ ] All 18 MCP tools documented with examples
  - [ ] File structure matches actual codebase
- **Priority**: High

**FR3: Auto-Load Mechanism**
- **Behavior**: Summary loaded before agent invocation via `forge_invoke_agent`
- **Integration Point**: `lib/tools/index.js` - `forge_invoke_agent` function
- **Context Parameter**: Add `codebaseSummary` to agent context
- **Acceptance Criteria**:
  - [ ] Summary auto-loads when any agent is invoked
  - [ ] Summary passed in agent context object
  - [ ] No manual loading required
  - [ ] Works for all 7 agent types
- **Priority**: High

**FR4: Update Strategy**
- **Triggers**: After PR merges, new components added, architecture changes
- **Mechanism**: Manual regeneration script or automated hook
- **Validation**: Version tracking in summary document
- **Acceptance Criteria**:
  - [ ] Script to regenerate summary exists
  - [ ] Summary includes last-updated timestamp
  - [ ] Detects outdated summary (version mismatch)
  - [ ] Can be run manually or via git hook
- **Priority**: Medium

#### Optional Features
- **Auto-regeneration on commit**: Git hook to update summary automatically
- **Diff-based updates**: Only regenerate changed sections
- **Multiple format exports**: JSON, HTML versions for different tools
- **Interactive navigation**: Links between summary sections

### Non-Functional Requirements

#### Performance
- **Load Time**: Summary must load in <100ms for agent invocations
- **Summary Size**: Maximum 5000 tokens (approximately 3750 words)
- **Memory Footprint**: Summary kept in memory during agent session (<1MB)
- **Scalability**: Works for projects up to 100K+ lines of code with summary still under 5000 tokens

#### Security
- **No Sensitive Data**: Summary must not include API keys, passwords, or credentials
- **Read-Only**: Summary is read-only for agents, no write access
- **File Permissions**: Standard file permissions (.forge/ directory already secured)
- **Audit Trail**: Summary updates logged in git history

#### Usability
- **AI-Friendly Format**: Markdown with clear headings, lists, code blocks
- **Structured Sections**: Consistent section hierarchy for easy navigation
- **Search-Friendly**: Keywords and component names prominently featured
- **Human-Readable**: Also useful for human developers, not just AI

#### Reliability
- **Version Tracking**: Summary includes version/timestamp to detect staleness
- **Validation**: Script validates summary completeness before use
- **Graceful Degradation**: If summary missing/invalid, agents fall back to file reading
- **Consistency**: Summary regeneration produces identical output for same codebase state

## User Stories

### Epic 1: Agent Efficiency and Token Optimization

**US1.1**: As a specialized agent, I want a comprehensive codebase summary loaded automatically so that I don't waste tokens re-analyzing the same files repeatedly
- **Acceptance Criteria**:
  - [ ] Given I am invoked via `forge_invoke_agent`, when the invocation starts, then the codebase summary is automatically loaded into my context
  - [ ] Given the summary is loaded, when I need architecture information, then I can answer from the summary without reading additional files
  - [ ] Given the summary contains component details, when I need to understand interactions, then I find the information in the summary
- **Priority**: High
- **Value**: Reduces token usage by 30-50% per agent invocation

**US1.2**: As an Architect Agent, I want component relationship diagrams in the summary so that I can make informed design decisions quickly
- **Acceptance Criteria**:
  - [ ] Given I'm designing a new feature, when I reference the summary, then I see how existing components interact
  - [ ] Given the architecture section exists, when I check data flow, then I understand the MCP server → State Manager → Tools flow
  - [ ] Given I need tool capabilities, when I review the MCP Tools section, then I know what functionality already exists
- **Priority**: High

**US1.3**: As a Developer Agent, I want file structure and coding patterns documented so that I implement features consistently
- **Acceptance Criteria**:
  - [ ] Given I'm implementing a new tool, when I check the summary, then I know the file location pattern (lib/tools/)
  - [ ] Given I need coding standards, when I review the summary, then I find ESLint config and patterns used
  - [ ] Given I'm adding a new component, when I check file structure, then I understand where it belongs
- **Priority**: High

**US1.4**: As any agent, I want MCP tool references with examples so that I know what capabilities are available without exploring the codebase
- **Acceptance Criteria**:
  - [ ] Given I need to use a FORGE tool, when I check the summary, then I find all 18 tools with parameters
  - [ ] Given a tool is documented, when I read its entry, then I see parameter types, return values, and usage examples
  - [ ] Given I'm unsure which tool to use, when I review the tools section, then I can identify the right tool for my task
- **Priority**: High

**US1.5**: As a human developer, I want the summary as onboarding documentation so that I can understand FORGE quickly
- **Acceptance Criteria**:
  - [ ] Given I'm new to the codebase, when I read `.forge/codebase-summary.md`, then I understand the architecture in under 10 minutes
  - [ ] Given I need to add a feature, when I reference the summary, then I know which files to modify
  - [ ] Given I'm debugging, when I check component interactions, then I can trace the issue
- **Priority**: Medium

## Technical Considerations

### Architecture

**Summary Generation Flow**:
```
[Codebase Analysis Script]
        ↓
[Parse: server.js, lib/*, templates/*]
        ↓
[Generate Markdown Sections]
        ↓
[Validate: Size, Completeness, Format]
        ↓
[Write: .forge/codebase-summary.md]
```

**Agent Integration Flow**:
```
[User calls forge_invoke_agent]
        ↓
[lib/tools/index.js: forge_invoke_agent]
        ↓
[Load .forge/codebase-summary.md]
        ↓
[Add to agent context object]
        ↓
[Invoke specialized agent with context]
        ↓
[Agent uses summary to answer without extra file reads]
```

**Key Components**:
- **Generator Script**: `scripts/generate-codebase-summary.js` (new)
- **Summary Document**: `.forge/codebase-summary.md` (generated)
- **Integration Point**: `lib/tools/index.js` - `forge_invoke_agent` function (modified)
- **Validation Script**: `scripts/validate-summary.js` (new)

### Dependencies

**Internal Dependencies**:
- `lib/core/state-manager.js` - To read .forge directory
- `fs/promises` - File system operations
- `path` - Path resolution
- Existing agent templates in `templates/agents/`

**External Dependencies** (none required):
- Pure Node.js implementation
- No additional npm packages needed
- Uses existing FORGE infrastructure

**Codebase Analysis Needs**:
- Read server.js, lib/core/, lib/tools/, lib/resources/
- Parse agent templates
- Extract MCP tool schemas
- Map file structure

### Constraints

**Technical Limitations**:
- **Token Limit**: Must stay under 5000 tokens to be effective
- **Synchronous Loading**: Summary loaded synchronously, must be fast (<100ms)
- **Memory**: Summary held in memory during agent session
- **Markdown Only**: No dynamic/interactive elements in markdown

**FORGE Framework Constraints**:
- Must integrate with existing `forge_invoke_agent` without breaking changes
- Must work with all 7 existing agent types
- Must not interfere with normal FORGE workflow
- Should leverage .forge directory structure

**Maintenance Constraints**:
- Summary must be manually regenerated (Phase 1) - automation is optional feature
- Human must verify accuracy after regeneration
- Requires developer discipline to keep updated

### Risks and Mitigation

**Risk 1: Summary Becomes Outdated**
- **Impact**: High - Agents make decisions on stale information
- **Probability**: Medium - Developers forget to regenerate
- **Mitigation**:
  - Add version check comparing summary timestamp to latest git commit
  - Warning when summary is >7 days old
  - Optional: Git hook to remind after merges
  - Make regeneration script fast and easy (<5 min)

**Risk 2: Summary Exceeds Token Limit**
- **Impact**: Medium - Defeats purpose if too large
- **Probability**: Medium - As codebase grows
- **Mitigation**:
  - Validation script enforces 5000 token limit
  - Prioritize architecture over implementation details
  - Link to detailed docs rather than including everything
  - Regular review and optimization of summary content

**Risk 3: Agents Over-Rely on Summary**
- **Impact**: Low - Agents miss new files/components
- **Probability**: Low - Agents should still explore when needed
- **Mitigation**:
  - Document in agent prompts: "Summary is overview, explore for specifics"
  - Include "last updated" date prominently
  - Test agents with questions about brand-new components

**Risk 4: Integration Breaks Existing Agents**
- **Impact**: High - All agents affected
- **Probability**: Low - Simple additive change
- **Mitigation**:
  - Add summary to context as optional parameter
  - Backward compatible - works if summary missing
  - Comprehensive testing with all 7 agents before merge
  - Gradual rollout: Test with one agent type first

## Success Metrics

### Primary KPIs

**KPI1: Token Usage Reduction**
- **Target**: 30-50% reduction in tokens used per agent invocation
- **Measurement**: Compare token usage before/after summary implementation
- **Success Threshold**: Minimum 30% reduction
- **How to Measure**:
  - Baseline: Average tokens per agent invocation without summary
  - Post-implementation: Average tokens with summary loaded
  - Calculate percentage reduction

**KPI2: Duplicate File Read Elimination**
- **Target**: Zero duplicate reads of core architecture files across agents
- **Measurement**: Track file reads during agent invocations
- **Success Threshold**: 0 duplicate reads of files covered in summary
- **How to Measure**:
  - Log all file reads during agent sessions
  - Identify repeated reads of same files
  - Track reduction after summary implementation

**KPI3: Agent Self-Sufficiency**
- **Target**: Agents can answer 80%+ architecture questions from summary alone
- **Measurement**: Test agents with architecture questions, track if they reference summary vs read files
- **Success Threshold**: 80% of questions answered from summary
- **How to Measure**:
  - Create test set of 20 architecture/component questions
  - Invoke agents with questions
  - Track: Used summary only vs Required additional file reads

### Secondary KPIs

**KPI4: Summary Maintenance Burden**
- **Target**: Summary regeneration takes <5 minutes
- **Measurement**: Time to update summary after significant codebase change
- **Success Threshold**: Less than 5 minutes manual effort

**KPI5: Summary Accuracy**
- **Target**: 100% accuracy with current codebase state
- **Measurement**: Manual review comparing summary to actual codebase
- **Success Threshold**: No discrepancies found in quarterly reviews

### User Satisfaction

**Agent Satisfaction** (Qualitative):
- Agents reference summary naturally without prompting
- Agents provide faster, more accurate responses
- Reduced "file not found" or incorrect assumptions

**Human Developer Satisfaction**:
- Summary useful for onboarding (survey: 4+/5 rating)
- Summary referenced during PR reviews
- Summary cited in architecture discussions

## Implementation Phases

### Phase 1: Foundation (Focus & Orchestrate)
- Requirements validation
- Technical design
- Architecture planning
- **Deliverables**: Architecture docs, detailed task breakdown
- **Progress**: Focus 0%, Orchestrate 0%

### Phase 2: Core Development (Refine)
- Core feature implementation
- Unit and integration testing
- Code reviews
- **Deliverables**: Working core features with tests
- **Progress**: 0%

### Phase 3: Polish & Deploy (Generate)
- Performance optimization
- Security hardening
- Documentation
- Production deployment
- **Deliverables**: Production-ready feature
- **Progress**: 0%

### Phase 4: Validation (Evaluate)
- User acceptance testing
- Performance monitoring
- Success metrics validation
- **Deliverables**: Go-live decision, retrospective
- **Progress**: 0%

## Current Development Status

**Phase**: Focus
**Started**: 10/12/2025
**Priority**: high

### Active Tasks (Focus Phase)
*Tasks to be defined*

## Appendices

### Mockups and Wireframes
- Design assets: To be created during Focus/Orchestrate phases
- User flow diagrams: To be documented

### API Specifications
- Endpoint definitions: To be designed during Orchestrate phase
- Request/response schemas: To be documented
- Authentication details: To be specified

### Data Models
- Database schema changes: To be planned
- Data migration requirements: To be assessed

---

**Document Status**: Draft
**Last Updated**: 2025-10-12
**FORGE Cycle**: pre-agent-codebase-summary-system
**FORGE Integration**: This PRD is designed for FORGE development cycle integration
