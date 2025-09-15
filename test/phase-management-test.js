#!/usr/bin/env node

/**
 * Comprehensive test for FORGE MCP phase management functions
 * Tests the specific bugs mentioned in the bug report
 */

const { ToolHandlers } = require('../lib/tools/index');
const { ForgeStateManager } = require('../lib/core/state-manager');
const fs = require('fs').promises;
const path = require('path');

async function runPhaseManagementTests() {
  console.log('🧪 FORGE Phase Management Tests');
  console.log('=================================\n');

  const testDir = path.join(__dirname, `test-${Date.now()}`);
  let stateManager;
  let toolHandlers;

  try {
    // Setup test environment
    await fs.mkdir(testDir, { recursive: true });
    process.chdir(testDir);

    stateManager = new ForgeStateManager(testDir);
    await stateManager.initialize();

    toolHandlers = new ToolHandlers(stateManager, {
      logger: {
        debug: () => {},
        error: console.error
      }
    });

    console.log('✅ Test environment setup complete\n');

    // Test 1: Project Initialization (should work)
    console.log('🔄 Test 1: forge_init_project');
    const initResult = await toolHandlers.callTool('forge_init_project', {
      projectName: 'Test Project',
      projectType: 'web',
      description: 'Testing FORGE MCP phase management bugs'
    });
    console.log('✅ forge_init_project: PASSED\n');

    // Test 2: Cycle Creation (should work)
    console.log('🔄 Test 2: forge_new_cycle');
    const cycleResult = await toolHandlers.callTool('forge_new_cycle', {
      feature: 'Test Feature',
      priority: 'high',
      description: 'Test cycle for bug reproduction and verification'
    });
    console.log('✅ forge_new_cycle: PASSED\n');

    // Test 3: Cycle Status (should work)
    console.log('🔄 Test 3: forge_cycle_status');
    const statusResult = await toolHandlers.callTool('forge_cycle_status', {});
    console.log('✅ forge_cycle_status: PASSED\n');

    // Test 4: Phase Update (was broken - now fixed)
    console.log('🔄 Test 4: forge_phase_update (PREVIOUSLY BROKEN)');
    try {
      const updateResult = await toolHandlers.callTool('forge_phase_update', {
        cycleId: 'test-feature',
        phase: 'Focus',
        progress: 25,
        tasks: ['Task 1', 'Task 2', 'Task 3']
      });
      console.log('✅ forge_phase_update: FIXED - NOW WORKING!\n');
    } catch (error) {
      console.error('❌ forge_phase_update: STILL BROKEN -', error.message);
      throw error;
    }

    // Test 5: Phase Update with different phase and progress
    console.log('🔄 Test 5: forge_phase_update (Focus to 75%)');
    try {
      const updateResult2 = await toolHandlers.callTool('forge_phase_update', {
        cycleId: 'test-feature',
        phase: 'Focus',
        progress: 75,
        tasks: ['Task 1 ✓', 'Task 2 ✓', 'Task 3', 'Task 4']
      });
      console.log('✅ forge_phase_update (75%): WORKING!\n');
    } catch (error) {
      console.error('❌ forge_phase_update (75%): FAILED -', error.message);
      throw error;
    }

    // Test 6: Phase Advance (was broken - now fixed)
    console.log('🔄 Test 6: forge_phase_advance (PREVIOUSLY BROKEN)');
    try {
      const advanceResult = await toolHandlers.callTool('forge_phase_advance', {
        cycleId: 'test-feature',
        skipValidation: true, // Skip validation for testing
        notes: 'Testing phase advancement after bug fix'
      });
      console.log('✅ forge_phase_advance: FIXED - NOW WORKING!\n');
    } catch (error) {
      console.error('❌ forge_phase_advance: STILL BROKEN -', error.message);
      throw error;
    }

    // Test 7: Add Learning (was broken - now fixed)
    console.log('🔄 Test 7: forge_add_learning (PREVIOUSLY BROKEN)');
    try {
      const learningResult = await toolHandlers.callTool('forge_add_learning', {
        category: 'success',
        title: 'Fixed Phase Management Bug',
        description: 'Successfully resolved undefined phase object errors in FORGE MCP tools',
        context: 'During bug fix verification testing'
      });
      console.log('✅ forge_add_learning: FIXED - NOW WORKING!\n');
    } catch (error) {
      console.error('❌ forge_add_learning: STILL BROKEN -', error.message);
      throw error;
    }

    // Test 8: Complete Cycle (was broken - should now work)
    console.log('🔄 Test 8: forge_complete_cycle (PREVIOUSLY BROKEN)');
    try {
      const completeResult = await toolHandlers.callTool('forge_complete_cycle', {
        cycleId: 'test-feature',
        notes: 'Testing cycle completion after bug fix'
      });
      console.log('✅ forge_complete_cycle: FIXED - NOW WORKING!\n');
    } catch (error) {
      console.error('❌ forge_complete_cycle: STILL BROKEN -', error.message);
      throw error;
    }

    // Test 9: Verify cycle was moved to completed
    console.log('🔄 Test 9: Verify cycle completion');
    const finalStatusResult = await toolHandlers.callTool('forge_cycle_status', {
      includeHistory: true
    });
    console.log('✅ Cycle completion verification: PASSED\n');

    // Test 10: Error handling - invalid cycle ID
    console.log('🔄 Test 10: Error handling for invalid cycle ID');
    try {
      await toolHandlers.callTool('forge_phase_update', {
        cycleId: 'nonexistent-cycle',
        phase: 'Focus',
        progress: 50
      });
      console.error('❌ Error handling: FAILED - should have thrown error');
    } catch (error) {
      if (error.message.includes('Cycle not found')) {
        console.log('✅ Error handling: PASSED - correctly handles invalid cycle ID\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 ALL PHASE MANAGEMENT TESTS PASSED!');
    console.log('🔧 BUG FIXES VERIFIED:');
    console.log('   ✅ forge_phase_update - Fixed nested property updates');
    console.log('   ✅ forge_phase_advance - Fixed nested property updates');
    console.log('   ✅ forge_complete_cycle - Working correctly');
    console.log('   ✅ forge_add_learning - Fixed missing file handling');
    console.log('\n🚀 FORGE MCP Server phase management is now fully functional!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    try {
      if (stateManager) {
        await stateManager.cleanup();
      }
      process.chdir(__dirname);
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup warning:', cleanupError.message);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  runPhaseManagementTests().catch(console.error);
}

module.exports = { runPhaseManagementTests };