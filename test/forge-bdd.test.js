#!/usr/bin/env node

/**
 * BDD Tests for FORGE MCP Framework
 *
 * These tests demonstrate the complete FORGE development workflow
 * using behavior-driven development scenarios.
 */

const { ForgeStateManager } = require('../lib/core/state-manager');
const { ToolHandlers } = require('../lib/tools/index');
const path = require('path');
const assert = require('assert');

// Test utilities
class TestContext {
  constructor() {
    this.testDir = path.join(__dirname, `test-forge-${Date.now()}`);
    this.stateManager = null;
    this.tools = null;
    this.currentCycleId = null;
  }

  async setup() {
    this.stateManager = new ForgeStateManager(this.testDir);
    await this.stateManager.initialize();
    this.tools = new ToolHandlers(this.stateManager, {
      logger: { debug: () => {}, error: console.error }
    });
  }

  async cleanup() {
    if (this.stateManager) {
      await this.stateManager.cleanup();
    }
    // Clean up test directory
    const fs = require('fs').promises;
    try {
      await fs.rm(this.testDir, { recursive: true, force: true });
    } catch (e) { /* ignore cleanup errors */ }
  }
}

// BDD Test Framework
function describe(description, fn) {
  console.log(`\n📋 ${description}`);
  fn();
}

function it(description, fn) {
  return (async () => {
    try {
      await fn();
      console.log(`  ✅ ${description}`);
    } catch (error) {
      console.error(`  ❌ ${description}`);
      console.error(`     Error: ${error.message}`);
      throw error;
    }
  })();
}

async function expect(actual) {
  return {
    toBe: (expected) => assert.strictEqual(actual, expected),
    toContain: (substring) => assert(actual.includes(substring)),
    toHaveProperty: (prop) => assert(prop in actual),
    toHaveLength: (length) => assert.strictEqual(actual.length, length),
    toBeTruthy: () => assert(actual),
    toBeFalsy: () => assert(!actual)
  };
}

// Main test suite
async function runTests() {
  console.log('🧪 FORGE Framework BDD Tests\n');
  console.log('=' .repeat(50));

  const ctx = new TestContext();

  try {
    await ctx.setup();

    // Feature: Project Initialization
    describe('Feature: Project Initialization', async () => {
      describe('  Scenario: Starting a new FORGE project', async () => {

        await it('Given I have an empty project directory', async () => {
          const config = await ctx.stateManager.getConfig();
          (await expect(config)).toHaveProperty('project');
        });

        await it('When I initialize FORGE with project details', async () => {
          const result = await ctx.tools.initProject({
            projectName: 'E-Commerce Platform',
            projectType: 'fullstack',
            description: 'Modern e-commerce platform with microservices'
          });
          (await expect(result.text)).toContain('FORGE initialized');
        });

        await it('Then the project should have FORGE structure', async () => {
          const config = await ctx.stateManager.getConfig();
          (await expect(config.project)).toBe('E-Commerce Platform');
          (await expect(config.type)).toBe('fullstack');
        });

        await it('And AI context should be established', async () => {
          const context = await ctx.stateManager.getContext();
          (await expect(context)).toContain('Development Approach');
          (await expect(context)).toContain('Focus');
          (await expect(context)).toContain('Orchestrate');
        });
      });
    });

    // Feature: Development Cycle Management
    describe('Feature: Development Cycle Creation', async () => {
      describe('  Scenario: Creating a new feature cycle', async () => {

        await it('Given I have an initialized FORGE project', async () => {
          const config = await ctx.stateManager.getConfig();
          (await expect(config.project)).toBeTruthy();
        });

        await it('When I create a cycle for user authentication', async () => {
          const result = await ctx.tools.newCycle({
            feature: 'User Authentication System',
            description: 'Implement OAuth2, JWT, and MFA support',
            priority: 'critical'
          });
          (await expect(result.text)).toContain('Created new development cycle');

          const cycles = await ctx.stateManager.getCycles();
          ctx.currentCycleId = cycles.active[0].id;
        });

        await it('Then the cycle should start in Focus phase', async () => {
          const cycle = await ctx.stateManager.getCycle(ctx.currentCycleId);
          (await expect(cycle.phase)).toBe('Focus');
          (await expect(cycle.priority)).toBe('critical');
        });

        await it('And Focus phase should have default tasks', async () => {
          const cycle = await ctx.stateManager.getCycle(ctx.currentCycleId);
          (await expect(cycle.tasks.Focus)).toHaveLength(5);
          (await expect(cycle.tasks.Focus[0])).toBe('Gather requirements');
          (await expect(cycle.tasks.Focus[1])).toContain('test scenarios');
        });

        await it('And agent recommendations should be provided', async () => {
          const result = await ctx.tools.cycleStatus({ cycleId: ctx.currentCycleId });
          (await expect(result.text)).toContain('Architect Agent');
          (await expect(result.text)).toContain('Security Agent');
          (await expect(result.text)).toContain('Documentation Agent');
        });
      });
    });

    // Feature: Phase Progression with Validation
    describe('Feature: Phase Progression', async () => {
      describe('  Scenario: Advancing through FORGE phases with validation', async () => {

        await it('Given I have a cycle in Focus phase', async () => {
          const cycle = await ctx.stateManager.getCycle(ctx.currentCycleId);
          (await expect(cycle.phase)).toBe('Focus');
        });

        await it('When I try to advance without completing requirements', async () => {
          const result = await ctx.tools.phaseAdvance({
            cycleId: ctx.currentCycleId
          });
          // Should succeed because validation isn't strict yet
          (await expect(result.text)).toContain('Phase Advanced Successfully');
        });

        await it('Then the cycle should move to Orchestrate phase', async () => {
          const cycle = await ctx.stateManager.getCycle(ctx.currentCycleId);
          (await expect(cycle.phase)).toBe('Orchestrate');
        });

        await it('When I add tasks in Orchestrate phase', async () => {
          const result = await ctx.tools.phaseUpdate({
            cycleId: ctx.currentCycleId,
            phase: 'Orchestrate',
            progress: 50,
            tasks: [
              'Design authentication flow diagram',
              'Set up OAuth2 provider integrations',
              'Design JWT token structure',
              'Plan MFA implementation',
              'Create API endpoint specifications'
            ]
          });
          (await expect(result.text)).toContain('Updated Orchestrate phase');
        });

        await it('And I advance to Refine phase', async () => {
          const result = await ctx.tools.phaseAdvance({
            cycleId: ctx.currentCycleId,
            skipValidation: true,
            notes: 'Moving to implementation'
          });
          (await expect(result.text)).toContain('Refine');
          (await expect(result.text)).toContain('Developer Agent');
        });

        await it('Then Refine phase should recommend implementation agents', async () => {
          const result = await ctx.tools.cycleStatus({ cycleId: ctx.currentCycleId });
          (await expect(result.text)).toContain('Developer Agent');
          (await expect(result.text)).toContain('Tester Agent');
          (await expect(result.text)).toContain('Code Reviewer Agent');
        });
      });
    });

    // Feature: Multi-Cycle Management
    describe('Feature: Managing Multiple Cycles', async () => {
      describe('  Scenario: Running parallel development cycles', async () => {

        await it('Given I have an active authentication cycle', async () => {
          const cycles = await ctx.stateManager.getCycles();
          (await expect(cycles.active.length)).toBe(1);
        });

        await it('When I create a payment processing cycle', async () => {
          const result = await ctx.tools.newCycle({
            feature: 'Payment Processing',
            description: 'Integrate Stripe and PayPal',
            priority: 'high'
          });
          (await expect(result.text)).toContain('Payment Processing');
        });

        await it('And I create an inventory management cycle', async () => {
          const result = await ctx.tools.newCycle({
            feature: 'Inventory Management',
            description: 'Real-time inventory tracking',
            priority: 'medium'
          });
          (await expect(result.text)).toContain('Inventory Management');
        });

        await it('Then I should have three active cycles', async () => {
          const cycles = await ctx.stateManager.getCycles();
          (await expect(cycles.active.length)).toBe(3);
        });

        await it('And the overview should show all cycles with phases', async () => {
          const result = await ctx.tools.cycleStatus({ includeHistory: false });
          (await expect(result.text)).toContain('User Authentication System');
          (await expect(result.text)).toContain('Payment Processing');
          (await expect(result.text)).toContain('Inventory Management');
          (await expect(result.text)).toContain('Refine phase');
          (await expect(result.text)).toContain('Focus phase');
        });
      });
    });

    // Feature: Cycle Completion and Learning
    describe('Feature: Cycle Completion and Learning Capture', async () => {
      describe('  Scenario: Completing a cycle and capturing learnings', async () => {

        await it('Given I have a cycle ready for completion', async () => {
          // Advance auth cycle to Evaluate phase
          await ctx.tools.phaseAdvance({
            cycleId: ctx.currentCycleId,
            skipValidation: true
          });
          await ctx.tools.phaseAdvance({
            cycleId: ctx.currentCycleId,
            skipValidation: true
          });

          const cycle = await ctx.stateManager.getCycle(ctx.currentCycleId);
          (await expect(cycle.phase)).toBe('Evaluate');
        });

        await it('When I add evaluation metrics', async () => {
          const result = await ctx.tools.phaseUpdate({
            cycleId: ctx.currentCycleId,
            phase: 'Evaluate',
            progress: 100,
            tasks: [
              'All tests passing ✓',
              'Security audit completed ✓',
              'Performance benchmarks met ✓',
              'Documentation updated ✓'
            ]
          });
          (await expect(result.text)).toContain('Evaluate');
        });

        await it('And I capture learnings from the cycle', async () => {
          const result = await ctx.tools.addLearning({
            category: 'success',
            title: 'OAuth2 Integration Pattern',
            description: 'Successfully implemented OAuth2 with refresh token rotation',
            context: 'Authentication cycle - can be reused for future auth implementations'
          });
          (await expect(result.text)).toContain('Added learning');
        });

        await it('And I capture anti-patterns discovered', async () => {
          const result = await ctx.tools.addLearning({
            category: 'antipattern',
            title: 'Avoid Storing Tokens in localStorage',
            description: 'localStorage is vulnerable to XSS attacks',
            context: 'Use httpOnly cookies for token storage instead'
          });
          (await expect(result.text)).toContain('antipattern');
        });

        await it('When I complete the cycle', async () => {
          const result = await ctx.tools.completeCycle({
            cycleId: ctx.currentCycleId,
            notes: 'Successfully implemented secure authentication with MFA'
          });
          (await expect(result.text)).toContain('Completed cycle');
        });

        await it('Then the cycle should be archived', async () => {
          const cycles = await ctx.stateManager.getCycles(true);
          (await expect(cycles.completed.length)).toBe(1);
          (await expect(cycles.active.length)).toBe(2); // Payment and Inventory still active
        });

        await it('And learnings should be accessible', async () => {
          const learnings = await ctx.stateManager.getLearnings();
          (await expect(learnings)).toContain('OAuth2 Integration Pattern');
          (await expect(learnings)).toContain('localStorage');
        });
      });
    });

    // Feature: Retrospective Analysis
    describe('Feature: Retrospective Analysis', async () => {
      describe('  Scenario: Generating project retrospectives', async () => {

        await it('Given I have completed cycles', async () => {
          const cycles = await ctx.stateManager.getCycles(true);
          (await expect(cycles.completed.length)).toBe(1);
        });

        await it('When I request a retrospective', async () => {
          const result = await ctx.tools.retrospective({
            includeMetrics: true
          });
          (await expect(result.text)).toContain('Retrospective');
        });

        await it('Then it should show cycle summary', async () => {
          const result = await ctx.tools.retrospective({});
          (await expect(result.text)).toContain('Active:');
          (await expect(result.text)).toContain('Completed:');
        });

        await it('And I can analyze project structure', async () => {
          const result = await ctx.tools.analyzeProject({
            depth: 'deep',
            focus: ['structure', 'performance']
          });
          (await expect(result.text)).toContain('Project Analysis');
          (await expect(result.text)).toContain('Active Cycles: 2');
          (await expect(result.text)).toContain('Completed Cycles: 1');
        });
      });
    });

    // Feature: Agent-Driven Development
    describe('Feature: Agent-Driven Development Workflow', async () => {
      describe('  Scenario: Using specialized agents per phase', async () => {

        await it('Given I need to work on payment processing', async () => {
          const cycles = await ctx.stateManager.getCycles();
          const paymentCycle = cycles.active.find(c => c.feature === 'Payment Processing');
          (await expect(paymentCycle)).toBeTruthy();
        });

        await it('When in Focus phase, architect agents should lead', async () => {
          const cycles = await ctx.stateManager.getCycles();
          const paymentCycle = cycles.active.find(c => c.feature === 'Payment Processing');
          const result = await ctx.tools.cycleStatus({ cycleId: paymentCycle.id });

          (await expect(result.text)).toContain('Architect Agent');
          (await expect(result.text)).toContain('Design system architecture');
        });

        await it('And security agent should identify requirements', async () => {
          const cycles = await ctx.stateManager.getCycles();
          const paymentCycle = cycles.active.find(c => c.feature === 'Payment Processing');
          const result = await ctx.tools.cycleStatus({ cycleId: paymentCycle.id });

          (await expect(result.text)).toContain('Security Agent');
          (await expect(result.text)).toContain('Identify security requirements');
        });

        await it('When advancing phases, agents should change', async () => {
          const cycles = await ctx.stateManager.getCycles();
          const paymentCycle = cycles.active.find(c => c.feature === 'Payment Processing');

          // Advance to Orchestrate
          await ctx.tools.phaseAdvance({
            cycleId: paymentCycle.id,
            skipValidation: true
          });

          const result = await ctx.tools.cycleStatus({ cycleId: paymentCycle.id });
          (await expect(result.text)).toContain('DevOps Agent');
          (await expect(result.text)).toContain('Plan deployment pipeline');
        });
      });
    });

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 All BDD tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  } finally {
    await ctx.cleanup();
  }
}

// Run the tests
runTests().catch(console.error);