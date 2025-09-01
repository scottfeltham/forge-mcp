/**
 * Basic tests for FORGE MCP Server
 */

const { ForgeStateManager } = require('../lib/core/state-manager');
const { createMCPServer } = require('../lib/core/mcp-server');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function createTestDirectory() {
  const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-mcp-test-'));
  return testDir;
}

async function cleanupTestDirectory(testDir) {
  await fs.rmdir(testDir, { recursive: true });
}

// Test State Manager
async function testStateManager() {
  console.log('🧪 Testing State Manager...');
  
  const testDir = await createTestDirectory();
  const stateManager = new ForgeStateManager(testDir);
  
  try {
    // Test initialization
    await stateManager.initialize();
    
    // Check .forge directory was created
    const forgeDir = path.join(testDir, '.forge');
    const stats = await fs.stat(forgeDir);
    console.assert(stats.isDirectory(), 'FORGE directory should be created');
    
    // Test cycle creation
    const cycle = await stateManager.createCycle('test-feature', {
      description: 'Test feature for validation',
      priority: 'high'
    });
    
    console.assert(cycle.id === 'test-feature', 'Cycle ID should match');
    console.assert(cycle.feature === 'test-feature', 'Cycle feature should match');
    console.assert(cycle.priority === 'high', 'Cycle priority should match');
    
    // Test cycle retrieval
    const cycles = await stateManager.getCycles();
    console.assert(cycles.active.length === 1, 'Should have one active cycle');
    
    // Test learning system
    const learning = await stateManager.addLearning(
      'success',
      'Test Learning',
      'This is a test learning entry',
      'Testing context'
    );
    
    console.assert(learning.title === 'Test Learning', 'Learning title should match');
    
    console.log('✅ State Manager tests passed');
    
  } catch (error) {
    console.error('❌ State Manager test failed:', error.message);
    throw error;
  } finally {
    await stateManager.cleanup();
    await cleanupTestDirectory(testDir);
  }
}

// Test MCP Server
async function testMCPServer() {
  console.log('🧪 Testing MCP Server...');
  
  const testDir = await createTestDirectory();
  
  try {
    const server = await createMCPServer({
      baseDir: testDir,
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: console.error }
    });
    
    // Test initialize request
    const initRequest = {
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      },
      id: 1
    };
    
    const initResponse = await server.handleRequest(initRequest);
    console.assert(initResponse.serverInfo.name === 'forge-mcp-server', 'Server name should match');
    
    // Test resources list
    const resourcesRequest = {
      method: 'resources/list',
      params: {},
      id: 2
    };
    
    const resourcesResponse = await server.handleRequest(resourcesRequest);
    console.assert(Array.isArray(resourcesResponse.resources), 'Should return resources array');
    
    // Test tools list
    const toolsRequest = {
      method: 'tools/list', 
      params: {},
      id: 3
    };
    
    const toolsResponse = await server.handleRequest(toolsRequest);
    console.assert(Array.isArray(toolsResponse.tools), 'Should return tools array');
    console.assert(toolsResponse.tools.length > 0, 'Should have available tools');
    
    // Test tool execution
    const toolCallRequest = {
      method: 'tools/call',
      params: {
        name: 'forge_init_project',
        arguments: {
          projectName: 'test-project',
          projectType: 'web'
        }
      },
      id: 4
    };
    
    const toolCallResponse = await server.handleRequest(toolCallRequest);
    console.assert(toolCallResponse.content[0].type === 'text', 'Tool should return text response');
    
    console.log('✅ MCP Server tests passed');
    
  } catch (error) {
    console.error('❌ MCP Server test failed:', error.message);
    throw error;
  } finally {
    await cleanupTestDirectory(testDir);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting FORGE MCP Server tests...\n');
  
  try {
    await testStateManager();
    await testMCPServer();
    
    console.log('\n✅ All tests passed! FORGE MCP Server is working correctly.');
  } catch (error) {
    console.log('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };