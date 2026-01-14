#!/usr/bin/env node

/**
 * FORGE Framework Enforcement Demonstration
 *
 * Shows how the MCP tools enforce FORGE methodology
 */

const { ForgeStateManager } = require('../lib/core/state-manager');
const { ToolHandlers } = require('../lib/tools/index');
const path = require('path');

async function demonstrateEnforcement() {
  console.log(`\x1b[1m\x1b[35m
╔════════════════════════════════════════════════════════════╗
║           FORGE MCP Framework Enforcement Demo            ║
║                                                            ║
║     Demonstrating how MCP tools enforce methodology       ║
╚════════════════════════════════════════════════════════════╝
\x1b[0m`);

  const testDir = path.join(__dirname, `enforcement-${Date.now()}`);
  const stateManager = new ForgeStateManager(testDir);
  await stateManager.initialize();
  const tools = new ToolHandlers(stateManager, {
    logger: { debug: () => {}, error: console.error }
  });

  try {
    // Initialize project
    console.log('\n\x1b[1m\x1b[34m━━━ 1. PROJECT INITIALIZATION ━━━\x1b[0m');
    await tools.initProject({
      projectName: 'Payment System',
      projectType: 'api',
      description: 'Secure payment processing system'
    });

    // Create cycle
    console.log('\n\x1b[1m\x1b[34m━━━ 2. CYCLE CREATION WITH IMMEDIATE GUIDANCE ━━━\x1b[0m');
    const cycleResult = await tools.newCycle({
      feature: 'Credit Card Processing',
      description: 'Process credit card payments',
      priority: 'critical'
    });
    console.log(cycleResult.text);

    const cycles = await stateManager.getCycles();
    const cycleId = cycles.active[0].id;

    // Demonstrate checkpoint validation
    console.log('\n\x1b[1m\x1b[34m━━━ 3. CHECKPOINT VALIDATION (INITIAL) ━━━\x1b[0m');
    const checkpoint1 = await tools.checkpoint({ cycleId });
    console.log(checkpoint1.text);

    // Try to advance without completing requirements
    console.log('\n\x1b[1m\x1b[34m━━━ 4. ENFORCEMENT: BLOCKED ADVANCEMENT ━━━\x1b[0m');
    const advanceAttempt1 = await tools.phaseAdvance({ cycleId });
    console.log(advanceAttempt1.text);

    // Get specific guidance
    console.log('\n\x1b[1m\x1b[34m━━━ 5. AGENT-SPECIFIC GUIDANCE ━━━\x1b[0m');
    const architectGuidance = await tools.guideNext({ cycleId, agentType: 'architect' });
    console.log(architectGuidance.text);

    const securityGuidance = await tools.guideNext({ cycleId, agentType: 'security' });
    console.log('\n' + securityGuidance.text);

    // Complete some requirements
    console.log('\n\x1b[1m\x1b[34m━━━ 6. COMPLETING REQUIREMENTS ━━━\x1b[0m');
    await tools.phaseUpdate({
      cycleId,
      phase: 'Focus',
      progress: 80,
      tasks: [
        'Gather requirements ✓',
        'Define test scenarios (MANDATORY) ✓',
        'Create/Update PRD in specs/ ✓',
        'Design architecture (Architect Agent) ✓',
        'Identify risks (Security Agent) ✓'
      ]
    });

    // Update cycle with better description
    await stateManager.updateCycle(cycleId, {
      description: 'Process credit card payments securely with PCI DSS compliance, fraud detection, tokenization, and real-time authorization through payment gateways'
    });

    // Check compliance again
    console.log('\n\x1b[1m\x1b[34m━━━ 7. CHECKPOINT AFTER COMPLETION ━━━\x1b[0m');
    const checkpoint2 = await tools.checkpoint({ cycleId });
    console.log(checkpoint2.text);

    // Now advancement should work
    console.log('\n\x1b[1m\x1b[34m━━━ 8. SUCCESSFUL ADVANCEMENT ━━━\x1b[0m');
    const advanceAttempt2 = await tools.phaseAdvance({ cycleId });
    console.log(advanceAttempt2.text);

    // Show Orchestrate phase guidance
    console.log('\n\x1b[1m\x1b[34m━━━ 9. ORCHESTRATE PHASE GUIDANCE ━━━\x1b[0m');
    const orchestrateGuidance = await tools.guideNext({ cycleId });
    console.log(orchestrateGuidance.text);

    // Demonstrate enforcement in Orchestrate phase
    console.log('\n\x1b[1m\x1b[34m━━━ 10. ORCHESTRATE PHASE ENFORCEMENT ━━━\x1b[0m');
    const orchestrateCheckpoint = await tools.checkpoint({ cycleId });
    console.log(orchestrateCheckpoint.text);

    console.log(`\n\x1b[1m\x1b[32m
╔════════════════════════════════════════════════════════════╗
║                 ENFORCEMENT DEMONSTRATION COMPLETE          ║
║                                                            ║
║  ✅ Showed strict phase validation                        ║
║  ✅ Demonstrated blocking of premature advancement        ║
║  ✅ Provided specific agent guidance                      ║
║  ✅ Enforced FORGE methodology compliance                 ║
║  ✅ Guided user through proper workflow                   ║
╚════════════════════════════════════════════════════════════╝
\x1b[0m`);

    console.log('\n\x1b[1m\x1b[36m📊 ENFORCEMENT MECHANISMS DEMONSTRATED:\x1b[0m');
    console.log('  • 🚫 Phase advancement blocking until requirements met');
    console.log('  • 📋 Detailed compliance checkpoints');
    console.log('  • 🤖 Agent-specific guidance per phase');
    console.log('  • ⚠️  Clear warning and error messages');
    console.log('  • 🎯 Specific action recommendations');
    console.log('  • 🔒 Strict validation with override options');

  } catch (error) {
    console.error('\n\x1b[31m❌ Enforcement demo failed:\x1b[0m', error);
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

// Run the demonstration
demonstrateEnforcement().catch(console.error);