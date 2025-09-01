#!/usr/bin/env node
/**
 * Test runner for FORGE MCP Server
 */

const { runTests } = require('./basic-test');

async function main() {
  console.log('FORGE MCP Server Test Suite');
  console.log('===========================\n');
  
  await runTests();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}