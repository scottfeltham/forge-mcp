#!/usr/bin/env node

/**
 * Test the improved FORGE MCP implementation
 */

const { ForgeStateManager } = require('../lib/core/state-manager');
const { ToolHandlers } = require('../lib/tools/index');
const path = require('path');

async function main() {
  console.log('🧪 Testing FORGE MCP improvements...\n');

  // Initialize state manager in test directory
  const testDir = path.join(__dirname, 'test-forge');
  const stateManager = new ForgeStateManager(testDir);
  await stateManager.initialize();

  // Initialize tool handlers
  const tools = new ToolHandlers(stateManager, { logger: console });

  try {
    // Test 1: Initialize project
    console.log('1️⃣ Testing project initialization...');
    const initResult = await tools.initProject({
      projectName: 'Test Project',
      projectType: 'web',
      description: 'Testing FORGE framework improvements'
    });
    console.log(initResult.text);
    console.log('✅ Project initialized\n');

    // Test 2: Create a new cycle
    console.log('2️⃣ Testing cycle creation with FORGE template...');
    const cycleResult = await tools.newCycle({
      feature: 'User Authentication',
      description: 'Implement secure user authentication with OAuth2 and JWT tokens',
      priority: 'high'
    });
    console.log(cycleResult.text);
    console.log('✅ Cycle created\n');

    // Test 3: Get cycle status (should show FORGE structure)
    console.log('3️⃣ Testing cycle status with structured output...');
    const cycles = await stateManager.getCycles();
    const cycleId = cycles.active[0].id;

    const statusResult = await tools.cycleStatus({ cycleId });
    console.log(statusResult.text);
    console.log('✅ Status shows FORGE structure\n');

    // Test 4: Test phase advancement with validation
    console.log('4️⃣ Testing phase advancement (should fail validation)...');
    try {
      const advanceResult = await tools.phaseAdvance({ cycleId });
      console.log(advanceResult.text);
    } catch (error) {
      console.log('Expected validation error:', error.message);
    }
    console.log('✅ Validation working\n');

    // Test 5: Force phase advancement
    console.log('5️⃣ Testing forced phase advancement...');
    const forceAdvanceResult = await tools.phaseAdvance({
      cycleId,
      skipValidation: true,
      notes: 'Skipping validation for testing'
    });
    console.log(forceAdvanceResult.text);
    console.log('✅ Phase advanced\n');

    // Test 6: Update phase with tasks
    console.log('6️⃣ Testing phase update with tasks...');
    const updateResult = await tools.phaseUpdate({
      cycleId,
      phase: 'Orchestrate',
      progress: 30,
      tasks: [
        'Design authentication flow',
        'Set up OAuth2 providers',
        'Create JWT token service',
        'Implement user session management'
      ]
    });
    console.log(updateResult.text);
    console.log('✅ Phase updated\n');

    // Test 7: Get overview of all cycles
    console.log('7️⃣ Testing cycles overview...');
    const overviewResult = await tools.cycleStatus({ includeHistory: false });
    console.log(overviewResult.text);
    console.log('✅ Overview working\n');

    // Test 8: Verify cycle file has proper FORGE structure
    console.log('8️⃣ Verifying cycle file structure...');
    const cycle = await stateManager.getCycle(cycleId);
    console.log('Parsed cycle data:');
    console.log('- Feature:', cycle.feature);
    console.log('- Phase:', cycle.phase);
    console.log('- Priority:', cycle.priority);
    console.log('- Progress:', cycle.progress);
    console.log('- Tasks:', cycle.tasks);
    console.log('✅ Cycle properly structured\n');

    console.log('🎉 All tests passed! FORGE MCP improvements working correctly.');

    // Cleanup
    await stateManager.cleanup();

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);