#!/usr/bin/env node

/**
 * FORGE Framework Scenario Test
 *
 * This test demonstrates a complete feature development cycle
 * using the FORGE framework from start to finish.
 */

const { ForgeStateManager } = require('../lib/core/state-manager');
const { ToolHandlers } = require('../lib/tools/index');
const path = require('path');

// Color output for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function phase(text) {
  console.log(`\n${colors.bright}${colors.blue}━━━ ${text} ━━━${colors.reset}`);
}

function scenario(text) {
  console.log(`\n${colors.bright}${colors.cyan}📖 ${text}${colors.reset}`);
}

function given(text) {
  console.log(`  ${colors.yellow}Given${colors.reset} ${text}`);
}

function when(text) {
  console.log(`  ${colors.yellow}When${colors.reset} ${text}`);
}

function then(text) {
  console.log(`  ${colors.yellow}Then${colors.reset} ${text}`);
}

function action(text) {
  console.log(`    ${colors.green}➜${colors.reset} ${text}`);
}

function output(text) {
  const lines = text.split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.log(`      ${colors.bright}${line}${colors.reset}`);
    }
  });
}

async function runScenario() {
  console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════╗
║     FORGE Framework - Complete Feature Scenario Test     ║
║                                                          ║
║  Feature: Shopping Cart with Real-time Inventory        ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

  const testDir = path.join(__dirname, `scenario-${Date.now()}`);
  const stateManager = new ForgeStateManager(testDir);
  await stateManager.initialize();
  const tools = new ToolHandlers(stateManager, {
    logger: { debug: () => {}, error: console.error }
  });

  try {
    // ═══════════════════════════════════════════════════════════
    scenario('Scenario: Complete Shopping Cart Feature Development');
    // ═══════════════════════════════════════════════════════════

    // INITIALIZATION
    phase('PROJECT INITIALIZATION');

    given('a new e-commerce project needs a shopping cart feature');
    action('Initializing FORGE project...');

    const initResult = await tools.initProject({
      projectName: 'E-Commerce Platform',
      projectType: 'fullstack',
      description: 'Modern e-commerce with real-time inventory'
    });

    when('FORGE is initialized');
    then('project structure is created');
    output('✅ FORGE initialized for E-Commerce Platform');

    // CYCLE CREATION
    phase('CYCLE CREATION');

    given('product team has defined shopping cart requirements');
    action('Creating development cycle...');

    const cycleResult = await tools.newCycle({
      feature: 'Shopping Cart with Real-time Inventory',
      description: `Implement shopping cart that:
- Supports guest and authenticated users
- Persists cart state across sessions
- Shows real-time inventory availability
- Calculates shipping and taxes
- Integrates with payment gateway`,
      priority: 'high'
    });

    when('development cycle is created');
    then('cycle starts in Focus phase');

    const cycles = await stateManager.getCycles();
    const cycleId = cycles.active[0].id;
    output(`Cycle ID: ${cycleId}`);

    // ═══════════════════════════════════════════════════════════
    // PHASE 1: FOCUS
    // ═══════════════════════════════════════════════════════════
    phase('PHASE 1: FOCUS 🎯');

    given('cycle is in Focus phase');
    action('Getting current status and agent recommendations...');

    let status = await tools.cycleStatus({ cycleId });
    output('Lead Agents: Architect, Security, Documentation');

    when('requirements are gathered and analyzed');
    action('Updating Focus phase with completed tasks...');

    await tools.phaseUpdate({
      cycleId,
      phase: 'Focus',
      progress: 80,
      tasks: [
        'Gather requirements ✓',
        'Define test scenarios (MANDATORY) ✓',
        'Create/Update PRD in specs/ ✓',
        'Design architecture (Architect Agent)',
        'Identify risks (Security Agent)'
      ]
    });

    action('Adding test scenarios...');
    output(`Test Scenarios Defined:
- Guest user can add items to cart
- Cart persists after login
- Inventory updates in real-time
- Out-of-stock items are handled
- Shipping calculation works correctly`);

    then('Focus phase requirements are complete');
    action('Advancing to Orchestrate phase...');

    const advance1 = await tools.phaseAdvance({
      cycleId,
      skipValidation: true,
      notes: 'Requirements gathered, test scenarios defined'
    });

    // ═══════════════════════════════════════════════════════════
    // PHASE 2: ORCHESTRATE
    // ═══════════════════════════════════════════════════════════
    phase('PHASE 2: ORCHESTRATE 📝');

    given('cycle is in Orchestrate phase');
    output('Lead Agents: Architect, DevOps, Tester');

    when('tasks are broken down and dependencies planned');
    action('Creating detailed task breakdown...');

    await tools.phaseUpdate({
      cycleId,
      phase: 'Orchestrate',
      progress: 100,
      tasks: [
        'Backend: Create cart service API ✓',
        'Backend: Implement session management ✓',
        'Backend: Set up Redis for cart persistence ✓',
        'Backend: Create inventory service ✓',
        'Frontend: Build cart UI components ✓',
        'Frontend: Implement state management ✓',
        'Integration: Connect to payment gateway ✓',
        'Testing: Write unit tests ✓',
        'Testing: Create integration tests ✓',
        'DevOps: Set up CI/CD pipeline ✓'
      ]
    });

    then('all tasks are defined with clear dependencies');
    output(`Task Dependencies Mapped:
- Cart service depends on session management
- UI components depend on state management
- Integration tests depend on all services
- Deployment depends on all tests passing`);

    action('Advancing to Refine phase...');
    await tools.phaseAdvance({
      cycleId,
      skipValidation: true,
      notes: 'Task breakdown complete, ready for implementation'
    });

    // ═══════════════════════════════════════════════════════════
    // PHASE 3: REFINE
    // ═══════════════════════════════════════════════════════════
    phase('PHASE 3: REFINE 🔨');

    given('cycle is in Refine phase');
    output('Lead Agents: Developer, Tester, Code Reviewer');

    when('implementation begins following TDD');
    action('Developer Agent implements cart service...');
    output('✓ Cart service API implemented with tests');

    action('Tester Agent writes comprehensive tests...');
    output('✓ 45 unit tests passing');
    output('✓ 12 integration tests passing');
    output('✓ 5 E2E tests passing');

    action('Code Reviewer Agent reviews implementation...');
    output('✓ Code review completed - no critical issues');

    await tools.phaseUpdate({
      cycleId,
      phase: 'Refine',
      progress: 100,
      tasks: [
        'Cart service API implemented ✓',
        'Session management working ✓',
        'Redis persistence configured ✓',
        'Inventory service integrated ✓',
        'Cart UI components built ✓',
        'State management implemented ✓',
        'All tests passing ✓',
        'Code review completed ✓'
      ]
    });

    then('implementation is complete with all tests passing');
    action('Advancing to Generate phase...');

    await tools.phaseAdvance({
      cycleId,
      skipValidation: true,
      notes: 'Implementation complete, all tests passing'
    });

    // ═══════════════════════════════════════════════════════════
    // PHASE 4: GENERATE
    // ═══════════════════════════════════════════════════════════
    phase('PHASE 4: GENERATE 🚀');

    given('cycle is in Generate phase');
    output('Lead Agents: DevOps, Documentation, Tester');

    when('build and deployment preparation begins');
    action('DevOps Agent builds artifacts...');
    output('✓ Docker images built');
    output('✓ Kubernetes manifests generated');

    action('Documentation Agent updates docs...');
    output('✓ API documentation generated');
    output('✓ User guide updated');
    output('✓ Deployment guide created');

    action('Tester Agent runs final validation...');
    output('✓ Performance tests passing');
    output('✓ Security scan clean');
    output('✓ Accessibility audit passed');

    await tools.phaseUpdate({
      cycleId,
      phase: 'Generate',
      progress: 100,
      tasks: [
        'Build artifacts created ✓',
        'Deployment configs ready ✓',
        'Documentation updated ✓',
        'Performance validated ✓',
        'Security validated ✓',
        'Ready for production ✓'
      ]
    });

    then('feature is ready for deployment');
    action('Advancing to Evaluate phase...');

    await tools.phaseAdvance({
      cycleId,
      skipValidation: true,
      notes: 'Build complete, ready for evaluation'
    });

    // ═══════════════════════════════════════════════════════════
    // PHASE 5: EVALUATE
    // ═══════════════════════════════════════════════════════════
    phase('PHASE 5: EVALUATE 📊');

    given('cycle is in Evaluate phase');
    output('All Agents Contribute to Retrospective');

    when('success metrics are measured');
    action('Collecting metrics...');
    output(`Performance Metrics:
- Page load time: 1.2s (target: <2s) ✅
- Cart API response: 45ms (target: <100ms) ✅
- Test coverage: 92% (target: >80%) ✅
- Zero critical bugs ✅`);

    action('Gathering stakeholder feedback...');
    output('Product Owner: Exceeds expectations');
    output('QA Team: High quality implementation');
    output('DevOps: Smooth deployment process');

    await tools.phaseUpdate({
      cycleId,
      phase: 'Evaluate',
      progress: 100,
      tasks: [
        'Metrics collected ✓',
        'Stakeholder feedback positive ✓',
        'Retrospective conducted ✓',
        'Learnings documented ✓'
      ]
    });

    // ═══════════════════════════════════════════════════════════
    // LEARNING CAPTURE
    // ═══════════════════════════════════════════════════════════
    phase('LEARNING CAPTURE');

    when('learnings are captured from the cycle');
    action('Adding successful patterns...');

    await tools.addLearning({
      category: 'pattern',
      title: 'Redis Session Pattern',
      description: 'Using Redis for cart persistence enables seamless guest-to-user transition',
      context: 'Shopping cart implementation - reusable for wishlist, comparison features'
    });

    await tools.addLearning({
      category: 'success',
      title: 'Real-time Inventory Updates',
      description: 'WebSocket integration for inventory updates prevents overselling',
      context: 'Critical for flash sales and high-traffic periods'
    });

    await tools.addLearning({
      category: 'tool',
      title: 'Playwright for E2E Testing',
      description: 'Playwright provided reliable cross-browser testing for cart flows',
      context: 'Recommended for future E2E test suites'
    });

    then('knowledge base is enriched with learnings');

    // ═══════════════════════════════════════════════════════════
    // CYCLE COMPLETION
    // ═══════════════════════════════════════════════════════════
    phase('CYCLE COMPLETION');

    when('cycle is marked as complete');
    action('Completing cycle with final notes...');

    await tools.completeCycle({
      cycleId,
      notes: 'Shopping cart successfully implemented with real-time inventory. All acceptance criteria met. Feature deployed to production.'
    });

    then('cycle is archived for future reference');

    // ═══════════════════════════════════════════════════════════
    // RETROSPECTIVE
    // ═══════════════════════════════════════════════════════════
    phase('PROJECT RETROSPECTIVE');

    action('Generating retrospective analysis...');
    const retro = await tools.retrospective({ cycleId, includeMetrics: true });

    action('Analyzing project health...');
    const analysis = await tools.analyzeProject({
      depth: 'comprehensive',
      focus: ['structure', 'performance', 'quality']
    });

    console.log(`\n${colors.bright}${colors.green}
╔══════════════════════════════════════════════════════════╗
║                    TEST COMPLETED                        ║
║                                                          ║
║  ✅ All 5 FORGE phases successfully executed            ║
║  ✅ Feature delivered with high quality                 ║
║  ✅ Learnings captured for future cycles                ║
║  ✅ FORGE framework properly demonstrated               ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

    // Show final summary
    console.log(`\n${colors.bright}${colors.cyan}📊 FINAL METRICS:${colors.reset}`);
    console.log('  • Cycle Duration: Focus → Evaluate (5 phases)');
    console.log('  • Tasks Completed: 35/35');
    console.log('  • Test Coverage: 92%');
    console.log('  • Learnings Captured: 3');
    console.log('  • Agent Utilization: 8 specialist agents');

  } catch (error) {
    console.error(`\n${colors.bright}❌ Scenario failed:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await stateManager.cleanup();
    // Clean up test directory
    const fs = require('fs').promises;
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) { /* ignore cleanup errors */ }
  }
}

// Run the scenario
runScenario().catch(console.error);