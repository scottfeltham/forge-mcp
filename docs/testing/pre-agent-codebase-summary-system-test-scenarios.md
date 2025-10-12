---
title: Pre-agent codebase summary system
type: Test Scenarios
created: 2025-10-12T15:57:08.326Z
updated: 2025-10-12T18:35:00.000Z
version: 2.0.0
status: Complete
author: Tester Agent
cycleId: pre-agent-codebase-summary-system
---

# Test Plan: Pre-agent codebase summary system

**Feature**: Codebase Summary System for Agent Token Optimization
**Test Strategy**: Comprehensive unit, integration, performance, and end-to-end testing
**Target**: 80%+ code coverage, all acceptance criteria validated

---

## Test Strategy

### Testing Approach
- **Unit Testing**: Individual component testing (Generator, Validator, Loader)
- **Integration Testing**: Component interaction testing (Generation → Validation → Loading)
- **Performance Testing**: Token reduction, load time, memory footprint
- **Error Handling**: Graceful degradation, edge cases
- **End-to-End**: Full workflow validation

### Testing Tools
- Node.js built-in test runner (`node test/*.js`)
- Custom token counting utility
- Performance measurement with `performance.now()`
- File system mocking for edge cases

### Success Criteria
- ✅ All test cases pass
- ✅ 30-50% token reduction measured
- ✅ Load time <100ms validated
- ✅ Zero regression in agent functionality
- ✅ Backward compatibility confirmed

---

## Test Scenarios

### Category 1: Summary Generation Testing

#### TS-GEN-001: Valid Summary Generation
**Priority**: Critical
**Type**: Unit Test

**Given**: A valid FORGE MCP Server codebase exists
**When**: `generate-codebase-summary.js` is executed
**Then**:
- Summary file is created at `.forge/codebase-summary.md`
- File contains all 6 required sections
- Token count is ≤ 5000 tokens
- File has valid markdown syntax
- Metadata header includes version, timestamp, token count

**Test Data**: Current FORGE codebase
**Expected Output**: `.forge/codebase-summary.md` with 4500-5000 tokens

---

#### TS-GEN-002: Token Budget Enforcement
**Priority**: Critical
**Type**: Unit Test

**Given**: Codebase analysis completes successfully
**When**: Generator assembles summary sections
**Then**:
- Total token count is calculated correctly
- Token count is ≤ 5000 tokens
- If exceeds 5000, generation fails with clear error
- Error message indicates which section(s) are too large

**Test Data**: Mock analysis with oversized sections
**Expected Behavior**: Generation fails, suggests trimming specific sections

---

#### TS-GEN-003: All Required Sections Present
**Priority**: Critical
**Type**: Unit Test

**Given**: Generation process completes
**When**: Summary document is created
**Then**: Document contains exactly these sections:
1. Architecture Overview
2. Core Components
3. MCP Tools Reference
4. File Structure
5. Development Workflow
6. Agent Integration Patterns

**Validation**: Each section header exists and has content

---

#### TS-GEN-004: Section Content Completeness
**Priority**: High
**Type**: Unit Test

**Given**: Each section is generated
**When**: Section content is validated
**Then**:
- **Architecture**: Contains ASCII diagram and data flow
- **Components**: Documents all 6 core components
- **Tools**: Lists all 18 MCP tools with parameters
- **File Structure**: Matches actual directory structure
- **Workflow**: Explains 5 FORGE phases
- **Agents**: Describes all 7 agent types

---

#### TS-GEN-005: Metadata Accuracy
**Priority**: Medium
**Type**: Unit Test

**Given**: Summary is generated
**When**: Metadata header is written
**Then**:
- `version` matches expected version number
- `generated` timestamp is current (within 1 second)
- `codebaseVersion` matches current git commit hash
- `tokenCount` is accurate (±5 tokens tolerance)

**Test Method**: Parse metadata, compare to expected values

---

#### TS-GEN-006: Regeneration Consistency
**Priority**: Medium
**Type**: Unit Test

**Given**: Same codebase state (no changes)
**When**: Generator runs twice
**Then**:
- Both summaries are identical (except timestamp)
- Token counts match
- Section content is identical
- Demonstrates deterministic generation

---

### Category 2: Validation Testing

#### TS-VAL-001: Validator Detects Missing Sections
**Priority**: Critical
**Type**: Unit Test

**Given**: Summary file with missing section (e.g., no "Core Components")
**When**: `validate-summary.js` runs
**Then**:
- Validation fails (returns `valid: false`)
- Error message identifies missing section
- Lists all missing sections if multiple
- Exit code is non-zero

**Test Data**: Create intentionally incomplete summary

---

#### TS-VAL-002: Token Limit Enforcement
**Priority**: Critical
**Type**: Unit Test

**Given**: Summary file with 5500 tokens (exceeds limit)
**When**: Validator runs
**Then**:
- Validation fails
- Error: "Token count 5500 exceeds limit of 5000"
- Suggests sections to trim
- Exit code is non-zero

---

#### TS-VAL-003: Freshness Warning
**Priority**: Medium
**Type**: Unit Test

**Given**: Summary file with `generated` timestamp >7 days old
**When**: Validator runs
**Then**:
- Validation passes (warning only)
- Warning: "Summary is >7 days old. Consider regenerating."
- Exit code is zero (warning, not error)

---

#### TS-VAL-004: Markdown Syntax Validation
**Priority**: Medium
**Type**: Unit Test

**Given**: Summary with invalid markdown (e.g., unclosed code blocks)
**When**: Validator runs
**Then**:
- Validation fails
- Error identifies syntax issue
- Shows line number if possible

---

#### TS-VAL-005: Sensitive Data Detection
**Priority**: High
**Type**: Security Test

**Given**: Summary containing potential sensitive data patterns
**When**: Validator scans for sensitive data
**Then**:
- Detects patterns like API keys, passwords, tokens
- Fails validation if found
- Error lists what was detected

**Test Patterns**:
- `API_KEY=abc123`
- `password: "secret"`
- `token: "ghp_xxxx"`

---

### Category 3: Agent Integration Testing

#### TS-INT-001: Summary Loads Before Agent Invocation
**Priority**: Critical
**Type**: Integration Test

**Given**: Valid summary exists at `.forge/codebase-summary.md`
**When**: `forge_invoke_agent('architect', cycleId, task)` is called
**Then**:
- Summary file is read before agent prompt is built
- Load completes in <100ms
- Summary content is added to agent context
- `codebaseSummary` field in context is populated
- `summaryLoaded` field is `true`

**Measurement**: Add timing instrumentation to load function

---

#### TS-INT-002: All Agent Types Receive Summary
**Priority**: Critical
**Type**: Integration Test

**Given**: Valid summary exists
**When**: Each of the 7 agent types is invoked
**Then**: For each agent (Architect, Developer, Tester, DevOps, Security, Documentation, Reviewer):
- Agent receives summary in context
- Agent prompt includes summary text
- `summaryLoaded` is `true`
- Agent can reference summary in responses

**Test Method**: Invoke each agent type, verify context

---

#### TS-INT-003: Backward Compatibility - Missing Summary
**Priority**: Critical
**Type**: Integration Test

**Given**: Summary file does NOT exist
**When**: `forge_invoke_agent` is called
**Then**:
- No error is thrown
- Agent invocation continues normally
- `codebaseSummary` in context is `null`
- `summaryLoaded` is `false`
- Warning logged: "Codebase summary not found"
- Agent works without summary (fallback behavior)

**Expected**: Zero breaking changes, graceful degradation

---

#### TS-INT-004: Agents Use Summary Effectively
**Priority**: High
**Type**: Functional Test

**Given**: Summary loaded in agent context
**When**: Agent is asked architecture question (e.g., "How does MCP server handle requests?")
**Then**:
- Agent answers from summary
- Agent does NOT read additional files (server.js, mcp-server.js)
- Response is accurate and complete
- Response time is faster than without summary

**Measurement**: Track file reads during agent session

---

#### TS-INT-005: Context Object Structure Validation
**Priority**: Medium
**Type**: Integration Test

**Given**: Summary loads successfully
**When**: Agent context is built
**Then**: Context object has structure:
```javascript
{
  autoInvoked: boolean,
  phase: string,
  timestamp: string,
  codebaseSummary: string,      // NEW
  summaryLoaded: true,           // NEW
  ...userProvidedContext
}
```

**Validation**: Assert context object structure

---

### Category 4: Performance Testing

#### TS-PERF-001: Load Time Under 100ms
**Priority**: High
**Type**: Performance Test

**Given**: Summary file exists (typical size ~4800 tokens)
**When**: `loadCodebaseSummary()` is called
**Then**:
- Load completes in <100ms (target: ~10-50ms)
- Measured with `performance.now()`
- Test repeated 100 times, average <100ms
- 95th percentile <150ms

**Test Environment**: Standard development machine

---

#### TS-PERF-002: Token Usage Reduction
**Priority**: Critical
**Type**: Performance Test

**Given**: Baseline token usage measured (agent invocation WITHOUT summary)
**When**: Agent invocation WITH summary is measured
**Then**:
- Token usage reduced by 30-50%
- Baseline: ~2000 tokens per agent session (file reads)
- With summary: ~1000-1400 tokens (summary only)
- Reduction: 600-1000 tokens (30-50%)

**Test Method**:
1. Invoke agent 10 times without summary, measure tokens
2. Invoke agent 10 times with summary, measure tokens
3. Calculate percentage reduction

---

#### TS-PERF-003: Memory Footprint
**Priority**: Medium
**Type**: Performance Test

**Given**: Summary loaded into memory
**When**: Memory usage is measured
**Then**:
- Summary takes <1MB in memory
- Typical: 4800 tokens × ~4 bytes = ~20KB
- With overhead: <100KB total
- Does not leak memory over multiple invocations

**Test Method**: `process.memoryUsage()` before/after loading

---

#### TS-PERF-004: Concurrent Agent Invocations
**Priority**: Medium
**Type**: Performance Test

**Given**: Multiple agents invoked concurrently
**When**: 5 agents invoked simultaneously
**Then**:
- Each loads summary independently (no caching in Phase 1)
- No race conditions
- No file locking issues
- All 5 complete successfully
- Average load time still <100ms

---

### Category 5: Error Handling Testing

#### TS-ERR-001: Graceful Degradation - Missing File
**Priority**: Critical
**Type**: Error Handling Test

**Given**: `.forge/codebase-summary.md` does NOT exist
**When**: Agent is invoked
**Then**:
- No exception thrown
- Warning logged to console
- `codebaseSummary` is `null`
- Agent continues with normal workflow
- Agent can still read files as fallback

---

#### TS-ERR-002: Corrupted Summary File
**Priority**: High
**Type**: Error Handling Test

**Given**: Summary file contains invalid UTF-8 or binary data
**When**: `loadCodebaseSummary()` is called
**Then**:
- Error caught gracefully
- Error logged: "Error loading codebase summary: [error message]"
- Returns `null`
- Agent continues without summary

---

#### TS-ERR-003: Oversized Summary File
**Priority**: Medium
**Type**: Error Handling Test

**Given**: Summary file is 10MB (way oversized)
**When**: Load is attempted
**Then**:
- Load completes (no size limit in loader)
- Warning logged: "Summary is very large, may impact performance"
- Or: Loader can enforce max size (e.g., 1MB) and reject

**Decision**: Document expected behavior (accept vs reject large files)

---

#### TS-ERR-004: File Permission Errors
**Priority**: Medium
**Type**: Error Handling Test

**Given**: Summary file exists but is not readable (permissions 000)
**When**: Load is attempted
**Then**:
- Error caught (EACCES error)
- Error logged: "Permission denied reading summary"
- Returns `null`
- Agent continues without summary

---

#### TS-ERR-005: Summary With Missing Metadata
**Priority**: Low
**Type**: Error Handling Test

**Given**: Summary file missing version/timestamp in header
**When**: Summary is loaded and used
**Then**:
- File loads successfully (metadata optional for loading)
- Warning logged: "Summary metadata incomplete"
- Summary is still usable by agents

---

### Category 6: End-to-End Testing

#### TS-E2E-001: Full Generation to Usage Workflow
**Priority**: Critical
**Type**: End-to-End Test

**Scenario**: Complete workflow from generation to agent use

**Steps**:
1. **Given**: Clean state, no summary exists
2. **When**: Run `npm run generate:summary`
3. **Then**: Summary generated successfully
4. **When**: Run `npm run validate:summary`
5. **Then**: Validation passes
6. **When**: Invoke Architect Agent with architecture question
7. **Then**: Agent uses summary, answers correctly, no extra file reads

**Success Criteria**: All steps complete, agent answers from summary

---

#### TS-E2E-002: Multiple Agent Invocations
**Priority**: High
**Type**: End-to-End Test

**Given**: Summary generated once
**When**: Multiple agents invoked sequentially:
1. Architect Agent - design question
2. Developer Agent - implementation question
3. Tester Agent - testing strategy question

**Then**:
- All 3 agents load same summary
- Each agent uses summary appropriately
- No regeneration needed between invocations
- Token savings evident across all 3

---

#### TS-E2E-003: Summary Regeneration After Code Changes
**Priority**: Medium
**Type**: End-to-End Test

**Scenario**: Code changes require summary update

**Steps**:
1. **Given**: Valid summary exists (v1.0.0)
2. **When**: New component added to `lib/core/`
3. **And**: Summary is regenerated
4. **Then**:
  - New summary includes new component
  - Token count still under 5000
  - Version incremented (v1.0.1)
  - Timestamp updated
5. **When**: Agent invoked with question about new component
6. **Then**: Agent finds information in updated summary

---

#### TS-E2E-004: Stale Summary Detection
**Priority**: Medium
**Type**: End-to-End Test

**Given**: Summary is 10 days old
**When**: Agent is invoked
**Then**:
- Warning logged: "Summary is >7 days old"
- Summary still loads and is usable
- Reminder to regenerate appears

---

#### TS-E2E-005: First-Time Setup Experience
**Priority**: High
**Type**: End-to-End Test

**Scenario**: New developer sets up codebase summary

**Steps**:
1. **Given**: Fresh clone of FORGE MCP, no summary
2. **When**: Developer runs `npm run generate:summary`
3. **Then**: Summary generated in ~5 minutes
4. **When**: Developer invokes any agent
5. **Then**: Agent uses summary immediately
6. **When**: Developer reads `.forge/codebase-summary.md`
7. **Then**: Human-readable, useful for onboarding

---

## Test Coverage Matrix

| Component | Unit Tests | Integration Tests | E2E Tests | Total |
|-----------|------------|-------------------|-----------|-------|
| Generator | 6 | 1 | 2 | 9 |
| Validator | 5 | - | 1 | 6 |
| Loader | 2 | 3 | - | 5 |
| Integration | - | 5 | 3 | 8 |
| Performance | - | 4 | - | 4 |
| Error Handling | - | 5 | 1 | 6 |
| **TOTAL** | **13** | **18** | **7** | **38** |

**Target Coverage**: 80%+ code coverage
**Critical Path**: TS-GEN-001, TS-VAL-001, TS-INT-001, TS-INT-003, TS-PERF-002, TS-E2E-001

---

## Acceptance Criteria

### Must Pass (Critical)
- ✅ TS-GEN-001: Valid summary generation
- ✅ TS-GEN-002: Token budget enforcement
- ✅ TS-GEN-003: All sections present
- ✅ TS-VAL-001: Missing sections detected
- ✅ TS-VAL-002: Token limit enforced
- ✅ TS-INT-001: Summary loads before invocation
- ✅ TS-INT-002: All agents receive summary
- ✅ TS-INT-003: Backward compatible (missing summary)
- ✅ TS-PERF-002: Token usage reduced 30-50%
- ✅ TS-ERR-001: Graceful degradation
- ✅ TS-E2E-001: Full workflow completes

### Should Pass (High Priority)
- TS-GEN-004: Section content completeness
- TS-VAL-005: Sensitive data detection
- TS-INT-004: Agents use summary effectively
- TS-PERF-001: Load time <100ms
- TS-ERR-002: Corrupted file handling
- TS-E2E-002: Multiple agent invocations
- TS-E2E-005: First-time setup

### Nice to Have (Medium Priority)
- All remaining test scenarios

---

## Test Execution Plan

### Phase: Refine (Development)
- Implement unit tests alongside components
- Run unit tests after each component completion
- Continuous testing during development

### Phase: Generate (Pre-Deployment)
- Run full test suite
- Execute performance tests
- Validate all acceptance criteria
- Fix any failing tests

### Phase: Evaluate (Post-Deployment)
- Real-world usage monitoring
- Token usage metrics collection
- User feedback on summary usefulness
- Retrospective on test effectiveness

---

## Test Automation

### Scripts
```json
{
  "scripts": {
    "test": "node test/run-tests.js",
    "test:summary": "node test/codebase-summary-test.js",
    "test:generator": "node test/generator-test.js",
    "test:validator": "node test/validator-test.js",
    "test:integration": "node test/summary-integration-test.js",
    "test:performance": "node test/summary-performance-test.js"
  }
}
```

### Continuous Integration
- Run test suite on every PR
- Fail PR if critical tests fail
- Report token usage metrics
- Track test coverage trends

---

## Success Metrics

**Test Quality Metrics**:
- 100% of critical tests pass
- 90%+ of high priority tests pass
- 80%+ code coverage
- Zero regressions in agent functionality

**Feature Success Metrics** (from PRD):
- 30-50% token usage reduction measured
- <100ms load time validated
- 80%+ architecture questions answered from summary
- Zero backward compatibility issues

---

**Document Status**: Complete
**Test Scenarios Defined**: 38 test cases across 6 categories
**Coverage**: Unit, Integration, Performance, Error Handling, E2E
**Next Step**: Begin implementation in Orchestrate/Refine phases

---

*Generated by FORGE Tester Agent*
*Cycle: pre-agent-codebase-summary-system*
*Phase: Focus*
