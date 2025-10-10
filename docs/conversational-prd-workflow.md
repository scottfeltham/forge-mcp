# Conversational PRD Building Workflow

FORGE MCP Server uses an interactive, conversational approach to ensure comprehensive requirements are captured before starting development cycles.

## Philosophy

**"Invest time in the Focus phase to save time in all other phases"**

By engaging in a conversation to build a complete PRD, FORGE helps you:
- ✅ Avoid scope creep and requirements gaps
- ✅ Identify risks and dependencies early
- ✅ Create clear acceptance criteria upfront
- ✅ Set measurable success metrics
- ✅ Build consensus with stakeholders

## Workflow Example

### Scenario 1: Minimal Information Provided

**User Request:**
```javascript
forge_new_cycle('user-authentication')
```

**FORGE Response:**
```markdown
📋 Let's Build a Comprehensive PRD Together

**Feature**: user-authentication
**Priority**: medium

**Let me help you build complete requirements. Please provide:**

**1. Feature Overview & Goals**
   • What problem does this solve?
   • Who are the users/stakeholders?
   • What are the key objectives?

**2. Detailed Requirements**
   • What are the core functionalities?
   • What are the user workflows?
   • What are the acceptance criteria?

**3. Technical Considerations**
   • Are there specific technologies or frameworks to use?
   • What are the integration points with existing systems?
   • What are the performance/scalability requirements?

**4. Security & Compliance**
   • Are there security requirements?
   • Any compliance standards to follow?
   • What are the data sensitivity levels?

**5. Success Criteria**
   • How will we measure success?
   • What are the key metrics?
   • What defines "done"?

💡 TIP: You can also provide:
• User stories in "As a [user], I want [goal], so that [benefit]" format
• Edge cases and error scenarios to handle
• Dependencies on other features or systems

🎯 Next Step: Please provide detailed answers to these questions.
```

**User Provides Details:**
```javascript
forge_new_cycle('user-authentication', {
  description: `
    As a user, I want to securely authenticate to access the system.

    Requirements:
    - Support email/password authentication
    - Implement JWT-based session management
    - Support password reset via email
    - Enforce strong password policies (min 12 chars, complexity)
    - Rate limiting on login attempts (5 attempts/15 minutes)

    Technical:
    - Use bcrypt for password hashing
    - Store tokens in httpOnly cookies
    - Integrate with existing Express.js API
    - Use PostgreSQL for user data storage

    Security:
    - Must comply with OWASP authentication guidelines
    - Implement MFA as future enhancement (not in this cycle)
    - Audit logging for all authentication events

    Success Criteria:
    - Users can register and login successfully
    - Failed login attempts are rate-limited
    - Password reset flow completes in < 5 minutes
    - Zero authentication bypass vulnerabilities
  `
})
```

**FORGE Creates Cycle:**
```markdown
🚀 New FORGE Development Cycle Created

**Feature**: user-authentication
**ID**: auth-2025-01-15-001
**Priority**: medium
**Phase**: Focus 🎯 (starting phase)

📄 DOCUMENTATION CREATED:
• PRD: docs/prd/auth-2025-01-15-001-user-authentication.md
• Test Plan: docs/testing/auth-2025-01-15-001-test-plan.md

📋 IMMEDIATE NEXT ACTIONS (Focus Phase):
1. 🏗️ Architect Agent: Design system architecture
2. 🔒 Security Agent: Identify security requirements
3. 📚 Documentation Agent: Update PRD and requirements

⚠️ MANDATORY BEFORE ADVANCING:
• Complete test scenarios (MANDATORY)
• Finalize architecture design
• Identify security risks
• Write detailed requirements (>50 chars)

🎯 Focus Phase Goal: Establish clear requirements and prevent scope creep
```

### Scenario 2: Partial Description Provided

**User Request:**
```javascript
forge_new_cycle('payment-processing', {
  description: 'Add payment processing to the application'
})
```

**FORGE Response:**
```markdown
⚠️ PRD Validation Check

**Feature**: payment-processing
**Priority**: medium

**Current Description**:
Add payment processing to the application

**❌ Missing Elements**:
• Description is too brief - needs detailed explanation
• Missing user/stakeholder context - who is this for?
• Missing acceptance criteria - what defines success?
• Missing technical details - needs implementation guidance

📋 Recommendations:

A comprehensive PRD should include:

1. **User Context**
   • Who needs this feature and why?
   • What problem are we solving?

2. **Acceptance Criteria**
   • What are the specific requirements?
   • How do we verify it works correctly?

3. **Technical Details**
   • What systems/components are involved?
   • Are there integration points or dependencies?

4. **Success Metrics**
   • How will we measure success?
   • What business value does this deliver?

🔄 Options:

1. **RECOMMENDED**: Provide more details by answering:
   • What is the user workflow for this feature?
   • What are the must-have vs nice-to-have requirements?
   • What are potential edge cases or error scenarios?
   • Are there security or performance requirements?

2. **Proceed anyway**: Call forge_new_cycle with confirmed: true
   ⚠️ Warning: Incomplete requirements lead to scope creep and rework!

💡 FORGE Philosophy: "Invest time in Focus phase to save time in all other phases"
```

### Scenario 3: Complete PRD Provided

**User Request:**
```javascript
forge_new_cycle('api-rate-limiting', {
  description: `
    Implement API rate limiting to prevent abuse and ensure fair usage.

    User Story:
    As an API consumer, I want rate limits that prevent abuse while allowing
    legitimate usage, so that the API remains stable and performant for all users.

    Requirements:
    - Implement token bucket algorithm for rate limiting
    - Support different rate limits per API endpoint
    - Return clear HTTP 429 responses with Retry-After headers
    - Store rate limit counters in Redis for distributed systems
    - Allow rate limit configuration via environment variables

    Technical Architecture:
    - Middleware component for Express.js
    - Integration with existing Redis cluster
    - Configurable limits: requests per minute/hour/day
    - Support for API key-based and IP-based limiting

    Acceptance Criteria:
    - Rate limits enforced on all public API endpoints
    - Legitimate requests pass through without delays
    - Exceeded limits return 429 with proper headers
    - Rate limit state survives service restarts
    - Admin endpoints have higher rate limits

    Security:
    - Prevent rate limit bypass via header manipulation
    - Log rate limit violations for security monitoring
    - Support allowlist for trusted IPs/keys

    Success Metrics:
    - < 1ms latency impact on allowed requests
    - 100% accuracy in rate limit enforcement
    - Zero false positives blocking legitimate traffic
    - Measurable reduction in API abuse incidents

    Dependencies:
    - Requires Redis cluster (already deployed)
    - Must integrate with existing authentication system

    Edge Cases:
    - Handle clock skew in distributed systems
    - Graceful degradation if Redis is unavailable
    - Burst allowance for legitimate traffic spikes
  `,
  priority: 'high'
})
```

**FORGE Response:**
```markdown
🚀 New FORGE Development Cycle Created

**Feature**: api-rate-limiting
**ID**: ratelimit-2025-01-15-002
**Priority**: high
**Phase**: Focus 🎯 (starting phase)

📄 DOCUMENTATION CREATED:
• PRD: docs/prd/ratelimit-2025-01-15-002-api-rate-limiting.md
• Test Plan: docs/testing/ratelimit-2025-01-15-002-test-plan.md

✅ Excellent PRD! All required elements present:
• Clear user context and problem statement
• Comprehensive acceptance criteria
• Detailed technical specifications
• Security considerations defined
• Measurable success metrics
• Dependencies and edge cases identified

📋 IMMEDIATE NEXT ACTIONS (Focus Phase):
1. 🏗️ Architect Agent: Design system architecture
2. 🔒 Security Agent: Identify security requirements
3. 📚 Documentation Agent: Update PRD and requirements
```

## Best Practices

### ✅ DO

- **Provide user context**: Who benefits and why?
- **Define acceptance criteria**: What makes this feature "done"?
- **Consider edge cases**: What could go wrong?
- **Identify dependencies**: What do we need first?
- **Set success metrics**: How do we measure success?
- **Think about security**: What are the risks?

### ❌ DON'T

- **Skip the conversation**: Rushing leads to rework
- **Use vague descriptions**: "Make it better" isn't actionable
- **Ignore non-functional requirements**: Performance, security, scalability matter
- **Forget stakeholders**: Who needs to approve this?
- **Bypass validation without reason**: The `confirmed: true` flag is a last resort

## PRD Template

Here's a template for comprehensive feature descriptions:

```markdown
**Feature Name**: [Clear, concise name]

**User Story**:
As a [user type], I want [goal], so that [benefit].

**Requirements**:
- [Must-have requirement 1]
- [Must-have requirement 2]
- [Should-have requirement 3]

**Technical Approach**:
- [Technology/framework choice]
- [Integration points]
- [Data storage strategy]

**Acceptance Criteria**:
- [Testable criterion 1]
- [Testable criterion 2]
- [Testable criterion 3]

**Security Considerations**:
- [Security requirement 1]
- [Compliance standard]

**Success Metrics**:
- [Measurable metric 1]
- [Measurable metric 2]

**Dependencies**:
- [Required feature/system 1]
- [Required feature/system 2]

**Edge Cases**:
- [Edge case scenario 1]
- [Edge case scenario 2]
```

## Why This Matters

### Real Cost of Incomplete Requirements

**Without conversational PRD building:**
- 🔴 Requirements discovered during implementation → Rework in Refine phase
- 🔴 Security risks identified late → Expensive fixes in Generate phase
- 🔴 Missing acceptance criteria → Confusion during testing
- 🔴 Unclear scope → Feature creep and missed deadlines

**With conversational PRD building:**
- ✅ Clear requirements upfront → Smooth implementation
- ✅ Early risk identification → Proactive mitigation
- ✅ Defined success criteria → Clear testing targets
- ✅ Bounded scope → Predictable delivery

### Time Investment Comparison

| Activity | Without PRD Conversation | With PRD Conversation |
|----------|-------------------------|----------------------|
| Focus Phase | 10 minutes | 30 minutes |
| Orchestrate Phase | 20 minutes | 15 minutes |
| Refine Phase | 4 hours + rework | 2 hours |
| Generate Phase | 1 hour + fixes | 30 minutes |
| **Total** | **~5.5 hours** | **~3 hours** |
| **Rework** | **High** | **Minimal** |

**ROI: 45% time savings + higher quality outcomes**

## Advanced Usage

### Using with PRD Decomposition

For complex features with multiple sub-features:

```javascript
// First, decompose a comprehensive PRD
forge_decompose_prd({
  prdContent: `[Your detailed multi-feature PRD]`,
  generateCycles: true
})

// FORGE creates multiple cycles, each with proper requirements
// Each cycle gets its own conversational validation
```

### Integrating with Agents

Once your cycle is created with a solid PRD, engage specialist agents:

```javascript
// Invoke architect for system design
forge_invoke_agent('architect', 'cycle-id', 'Design authentication architecture')

// Invoke security agent for threat analysis
forge_invoke_agent('security', 'cycle-id', 'Analyze payment processing security risks')
```

## Summary

FORGE's conversational PRD building ensures:
1. **Complete requirements** before any code is written
2. **Early risk identification** in the Focus phase
3. **Clear success criteria** for testing and validation
4. **Stakeholder alignment** through comprehensive documentation
5. **Reduced rework** by catching issues early

Remember: **Time spent in conversation saves multiples of time in implementation!**
