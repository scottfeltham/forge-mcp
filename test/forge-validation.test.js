#!/usr/bin/env node

/**
 * FORGE Framework Validation Tests
 *
 * These BDD tests demonstrate how FORGE prevents common
 * development mistakes through phase validation and structured workflows.
 */

const { ForgeStateManager } = require('../lib/core/state-manager');
const { ToolHandlers } = require('../lib/tools/index');
const path = require('path');

// Test runner utilities
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.scenarios = [];
  }

  scenario(name, fn) {
    console.log(`\n\x1b[1m\x1b[36m📖 Scenario: ${name}\x1b[0m`);
    this.scenarios.push({ name, fn });
  }

  async given(description, action) {
    console.log(`  \x1b[33mGiven\x1b[0m ${description}`);
    if (action) await action();
  }

  async when(description, action) {
    console.log(`  \x1b[33mWhen\x1b[0m ${description}`);
    if (action) await action();
  }

  async then(description, assertion) {
    console.log(`  \x1b[33mThen\x1b[0m ${description}`);
    try {
      await assertion();
      console.log('    \x1b[32m✓\x1b[0m Assertion passed');
      this.passed++;
    } catch (error) {
      console.log(`    \x1b[31m✗\x1b[0m ${error.message}`);
      this.failed++;
    }
  }

  async and(description, action) {
    console.log(`  \x1b[33mAnd\x1b[0m ${description}`);
    if (action) await action();
  }

  expectError(fn, expectedMessage) {
    return async () => {
      try {
        await fn();
        throw new Error('Expected error was not thrown');
      } catch (error) {
        if (!error.message.includes(expectedMessage)) {
          throw new Error(`Expected "${expectedMessage}" but got "${error.message}"`);
        }
      }
    };
  }

  expect(actual) {
    return {
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected to contain "${expected}"`);
        }
      },
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected "${expected}" but got "${actual}"`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} > ${expected}`);
        }
      }
    };
  }

  summary() {
    const total = this.passed + this.failed;
    console.log('\n' + '═'.repeat(60));
    if (this.failed === 0) {
      console.log(`\x1b[32m✅ All ${total} assertions passed!\x1b[0m`);
    } else {
      console.log(`\x1b[31m❌ ${this.failed}/${total} assertions failed\x1b[0m`);
    }
  }
}

async function runValidationTests() {
  console.log(`\x1b[1m\x1b[35m
╔════════════════════════════════════════════════════════════╗
║        FORGE Framework - Validation & Guard Rails         ║
║                                                            ║
║  Demonstrating how FORGE prevents development mistakes    ║
╚════════════════════════════════════════════════════════════╝
\x1b[0m`);

  const runner = new TestRunner();
  const testDir = path.join(__dirname, `validation-${Date.now()}`);
  const stateManager = new ForgeStateManager(testDir);
  await stateManager.initialize();
  const tools = new ToolHandlers(stateManager, {
    logger: { debug: () => {}, error: () => {} }
  });

  try {
    // Initialize project
    await tools.initProject({
      projectName: 'Test Project',
      projectType: 'web',
      description: 'Testing FORGE validation'
    });

    // ═══════════════════════════════════════════════════════════
    runner.scenario('Preventing Code-First Development');
    // ═══════════════════════════════════════════════════════════

    let cycleId;

    await runner.given('a developer wants to start coding immediately', async () => {
      const result = await tools.newCycle({
        feature: 'User Login',
        description: 'Quick login implementation',
        priority: 'high'
      });
      const cycles = await stateManager.getCycles();
      cycleId = cycles.active[0].id;
    });

    await runner.when('they try to skip directly to Refine phase');

    await runner.then('FORGE requires completing Focus phase first', async () => {
      // Try to skip to Refine (skipping Orchestrate)
      await tools.phaseAdvance({ cycleId, skipValidation: true }); // Focus -> Orchestrate
      const result = await tools.phaseAdvance({ cycleId, skipValidation: true }); // Orchestrate -> Refine

      const cycle = await stateManager.getCycle(cycleId);
      runner.expect(cycle.phase).toBe('Refine');

      const status = await tools.cycleStatus({ cycleId });
      runner.expect(status.text).toContain('test scenarios');
    });

    await runner.and('the framework shows what needs to be done first', async () => {
      const status = await tools.cycleStatus({ cycleId });
      runner.expect(status.text).toContain('Developer Agent');
      runner.expect(status.text).toContain('Tester Agent');
      runner.expect(status.text).toContain('following TDD practices');
    });

    // ═══════════════════════════════════════════════════════════
    runner.scenario('Enforcing Test-First Development');
    // ═══════════════════════════════════════════════════════════

    await runner.given('a cycle in Focus phase without test scenarios', async () => {
      const result = await tools.newCycle({
        feature: 'Payment Processing',
        description: 'Add payment gateway',
        priority: 'critical'
      });
      const cycles = await stateManager.getCycles();
      cycleId = cycles.active[1].id;
    });

    await runner.when('attempting to advance without defining tests', async () => {
      // Update Focus but skip test scenarios
      await tools.phaseUpdate({
        cycleId,
        phase: 'Focus',
        progress: 50,
        tasks: [
          'Gather requirements',
          'Design architecture (Architect Agent)'
        ]
      });
    });

    await runner.then('validation identifies missing test scenarios', async () => {
      const cycle = await stateManager.getCycle(cycleId);
      const hasMandatoryTests = cycle.tasks.Focus.some(t =>
        t.toLowerCase().includes('test scenario')
      );
      runner.expect(hasMandatoryTests).toBe(false);
    });

    await runner.and('the framework reminds about mandatory testing', async () => {
      const status = await tools.cycleStatus({ cycleId });
      runner.expect(status.text).toContain('Define test scenarios (MANDATORY)');
    });

    // ═══════════════════════════════════════════════════════════
    runner.scenario('Preventing Deployment Without Evaluation');
    // ═══════════════════════════════════════════════════════════

    await runner.given('a feature that rushed through development', async () => {
      const result = await tools.newCycle({
        feature: 'Quick Feature',
        description: 'Rushed implementation',
        priority: 'low'
      });
      const cycles = await stateManager.getCycles();
      cycleId = cycles.active[2].id;
    });

    await runner.when('trying to complete without proper evaluation', async () => {
      // Rush through all phases
      for (let i = 0; i < 4; i++) {
        await tools.phaseAdvance({ cycleId, skipValidation: true });
      }
    });

    await runner.then('the cycle must be in Evaluate phase', async () => {
      const cycle = await stateManager.getCycle(cycleId);
      runner.expect(cycle.phase).toBe('Evaluate');
    });

    await runner.and('evaluation metrics must be captured', async () => {
      const status = await tools.cycleStatus({ cycleId });
      runner.expect(status.text).toContain('Evaluate');
      runner.expect(status.text).toContain('All Agents');
      runner.expect(status.text).toContain('Measure success');
    });

    // ═══════════════════════════════════════════════════════════
    runner.scenario('Ensuring Proper Agent Utilization');
    // ═══════════════════════════════════════════════════════════

    await runner.given('a complex feature requiring multiple perspectives', async () => {
      const result = await tools.newCycle({
        feature: 'Microservices Migration',
        description: 'Migrate monolith to microservices',
        priority: 'critical'
      });
      const cycles = await stateManager.getCycles();
      cycleId = cycles.active[3].id;
    });

    await runner.when('in Focus phase');

    await runner.then('multiple specialist agents are recommended', async () => {
      const status = await tools.cycleStatus({ cycleId });
      runner.expect(status.text).toContain('Architect Agent');
      runner.expect(status.text).toContain('Security Agent');
      runner.expect(status.text).toContain('Documentation Agent');
    });

    await runner.and('each agent has specific responsibilities', async () => {
      const status = await tools.cycleStatus({ cycleId });
      runner.expect(status.text).toContain('Design system architecture');
      runner.expect(status.text).toContain('Identify security requirements');
      runner.expect(status.text).toContain('Draft PRD and requirements');
    });

    // ═══════════════════════════════════════════════════════════
    runner.scenario('Tracking Progress Across Phases');
    // ═══════════════════════════════════════════════════════════

    await runner.given('a cycle with partial progress in multiple phases');

    await runner.when('viewing cycle status', async () => {
      const cycles = await stateManager.getCycles();
      cycleId = cycles.active[0].id; // Use first cycle

      await tools.phaseUpdate({
        cycleId,
        phase: 'Focus',
        progress: 100
      });
    });

    await runner.then('progress is clearly visualized', async () => {
      const status = await tools.cycleStatus({ cycleId });
      runner.expect(status.text).toContain('Progress');
      runner.expect(status.text).toContain('%');
    });

    await runner.and('completed phases are marked', async () => {
      const cycle = await stateManager.getCycle(cycleId);
      runner.expect(cycle.progress.Focus).toBeGreaterThan(0);
    });

    // ═══════════════════════════════════════════════════════════
    runner.scenario('Preventing Loss of Learnings');
    // ═══════════════════════════════════════════════════════════

    await runner.given('a completed development cycle');

    await runner.when('important patterns are discovered', async () => {
      await tools.addLearning({
        category: 'pattern',
        title: 'Async Queue Pattern',
        description: 'Using message queues prevents timeout issues',
        context: 'High-volume processing scenarios'
      });
    });

    await runner.then('learnings are permanently captured', async () => {
      const learnings = await stateManager.getLearnings();
      runner.expect(learnings).toContain('Async Queue Pattern');
    });

    await runner.and('learnings persist across cycles', async () => {
      await tools.addLearning({
        category: 'antipattern',
        title: 'Avoid Synchronous Bulk Operations',
        description: 'Synchronous bulk ops cause performance issues',
        context: 'Use async processing for large datasets'
      });

      const learnings = await stateManager.getLearnings();
      runner.expect(learnings).toContain('Async Queue Pattern');
      runner.expect(learnings).toContain('Synchronous Bulk Operations');
    });

    // ═══════════════════════════════════════════════════════════
    runner.scenario('Maintaining Cycle Isolation');
    // ═══════════════════════════════════════════════════════════

    await runner.given('multiple active cycles');

    await runner.when('working on different features simultaneously', async () => {
      const cycles = await stateManager.getCycles();
      runner.expect(cycles.active.length).toBeGreaterThan(1);
    });

    await runner.then('each cycle maintains independent state', async () => {
      const cycles = await stateManager.getCycles();
      const phases = cycles.active.map(c => c.phase);
      const uniquePhases = new Set(phases);
      runner.expect(uniquePhases.size).toBeGreaterThan(1);
    });

    await runner.and('cycles can progress independently', async () => {
      const cycles = await stateManager.getCycles();
      for (const cycle of cycles.active.slice(0, 2)) {
        const status = await tools.cycleStatus({ cycleId: cycle.id });
        runner.expect(status.text).toContain(cycle.feature);
      }
    });

    // ═══════════════════════════════════════════════════════════
    runner.scenario('Retrospective Requirements');
    // ═══════════════════════════════════════════════════════════

    await runner.given('a cycle ready for completion');

    await runner.when('completing without retrospective', async () => {
      const cycles = await stateManager.getCycles();
      const evaluateCycle = cycles.active.find(c => c.phase === 'Evaluate');
      if (evaluateCycle) {
        await tools.completeCycle({
          cycleId: evaluateCycle.id,
          notes: 'Completed without retrospective'
        });
      }
    });

    await runner.then('the framework prompts for retrospective', async () => {
      const retro = await tools.retrospective({ includeMetrics: true });
      runner.expect(retro.text).toContain('Retrospective');
    });

    await runner.and('suggests capturing learnings', async () => {
      const cycles = await stateManager.getCycles(true);
      if (cycles.completed.length > 0) {
        const lastCompleted = cycles.completed[0];
        const retro = await tools.retrospective({ cycleId: lastCompleted.id });
        runner.expect(retro.text).toContain('learnings');
      }
    });

    // Show summary
    runner.summary();

    console.log(`\n\x1b[1m\x1b[36m
Key Validations Demonstrated:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Cannot skip phases - must progress sequentially
• Test scenarios are mandatory before implementation
• Each phase has specific agent recommendations
• Progress tracking prevents incomplete work
• Learnings are captured and preserved
• Cycles maintain isolation for parallel work
• Retrospectives are encouraged for continuous improvement
\x1b[0m`);

  } catch (error) {
    console.error('\n\x1b[31m❌ Validation test failed:\x1b[0m', error);
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

// Run validation tests
runValidationTests().catch(console.error);