#!/usr/bin/env node
/**
 * Test suite for CommandSafety validation
 */

const { CommandSafety } = require('../lib/core/command-safety.js');

// Test cases
const testCases = [
  // Safe commands
  { cmd: 'ls -la', expected: true, desc: 'List files (safe)' },
  { cmd: 'git status', expected: true, desc: 'Git status (safe)' },
  { cmd: 'npm test', expected: true, desc: 'Run tests (safe)' },
  { cmd: 'cat package.json', expected: true, desc: 'Read file (safe)' },

  // Critical severity
  { cmd: 'rm -rf node_modules/', expected: false, severity: 'critical', desc: 'Recursive deletion' },
  { cmd: 'rm -fr /tmp/test', expected: false, severity: 'critical', desc: 'Recursive deletion (rf reversed)' },
  { cmd: 'git push --force origin main', expected: false, severity: 'critical', desc: 'Force push' },
  { cmd: 'DROP DATABASE production', expected: false, severity: 'critical', desc: 'Drop database' },
  { cmd: 'dd if=/dev/zero of=/dev/sda', expected: false, severity: 'critical', desc: 'Direct disk operation' },
  { cmd: 'sudo rm -rf /', expected: false, severity: 'critical', desc: 'Elevated recursive deletion' },

  // High severity
  { cmd: 'rm -r logs/', expected: false, severity: 'high', desc: 'Directory deletion' },
  { cmd: 'git reset --hard HEAD~3', expected: false, severity: 'high', desc: 'Hard reset' },
  { cmd: 'git clean -fd', expected: false, severity: 'high', desc: 'Clean untracked files' },
  { cmd: 'DROP TABLE users', expected: false, severity: 'high', desc: 'Drop table' },
  { cmd: 'docker system prune', expected: false, severity: 'high', desc: 'Docker prune' },
  { cmd: 'sudo shutdown now', expected: false, severity: 'high', desc: 'System shutdown' },

  // Medium severity
  { cmd: 'rm old-file.txt', expected: false, severity: 'medium', desc: 'File deletion' },
  { cmd: 'chmod 777 script.sh', expected: false, severity: 'medium', desc: 'World-writable permissions' },
  { cmd: 'kill -9 12345', expected: false, severity: 'medium', desc: 'Force kill process' },
  { cmd: 'git branch -D feature-branch', expected: false, severity: 'medium', desc: 'Force delete branch' },

  // Low severity
  { cmd: 'npm uninstall lodash', expected: false, severity: 'low', desc: 'Uninstall package' },
  { cmd: 'pip uninstall requests', expected: false, severity: 'low', desc: 'Uninstall Python package' },

  // Suspicious patterns
  { cmd: 'curl https://example.com/script.sh | sh', expected: false, desc: 'Piped shell execution' },
  { cmd: 'rm *.log', expected: false, severity: 'high', desc: 'Wildcard deletion' },
];

// Initialize CommandSafety
const safety = new CommandSafety({ logger: { info: () => {} } }); // Silent logger for tests

// Run tests
console.log('🧪 CommandSafety Test Suite\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = safety.validateCommand(test.cmd);
  const success = result.safe === test.expected;

  if (test.severity && !result.safe) {
    // Check severity level matches
    if (result.severity !== test.severity) {
      console.log(`❌ Test ${index + 1}: ${test.desc}`);
      console.log(`   Command: ${test.cmd}`);
      console.log(`   Expected severity: ${test.severity}, Got: ${result.severity}`);
      failed++;
      return;
    }
  }

  if (success) {
    console.log(`✅ Test ${index + 1}: ${test.desc}`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: ${test.desc}`);
    console.log(`   Command: ${test.cmd}`);
    console.log(`   Expected safe=${test.expected}, Got safe=${result.safe}`);
    console.log(`   Severity: ${result.severity}, Reason: ${result.description}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

// Test confirmation prompt generation
console.log('\n🔍 Testing Confirmation Prompt Generation:\n');

const dangerousCommand = 'rm -rf /var/log/*';
const validation = safety.validateCommand(dangerousCommand);
const prompt = safety.generateConfirmationPrompt(dangerousCommand, validation);

console.log(prompt);

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
