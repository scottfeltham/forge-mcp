#!/usr/bin/env node

/**
 * FORGE Standards Detection and Enforcement Demo
 *
 * Demonstrates how FORGE detects existing project standards
 * and enforces them during development cycles
 */

const { ForgeStateManager } = require('../lib/core/state-manager');
const { ToolHandlers } = require('../lib/tools/index');
const { StandardsDetector } = require('../lib/core/standards-detector');
const path = require('path');
const fs = require('fs').promises;

async function createMockProject(testDir) {
  // Create a realistic project structure with various standards
  await fs.mkdir(testDir, { recursive: true });

  // Package.json with test scripts and linting
  const packageJson = {
    'name': 'mock-ecommerce-api',
    'version': '1.0.0',
    'scripts': {
      'test': 'jest --coverage',
      'test:unit': 'jest --testPathPattern=unit',
      'test:integration': 'jest --testPathPattern=integration',
      'lint': 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
      'security:audit': 'npm audit',
      'security:scan': 'snyk test',
      'build': 'webpack --mode production',
      'start': 'node dist/server.js'
    },
    'devDependencies': {
      'jest': '^29.0.0',
      'eslint': '^8.0.0',
      'snyk': '^1.0.0'
    }
  };
  await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // ESLint configuration
  const eslintConfig = {
    'extends': ['eslint:recommended', '@typescript-eslint/recommended'],
    'rules': {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'max-len': ['error', { 'code': 120 }]
    },
    'parserOptions': {
      'ecmaVersion': 2022,
      'sourceType': 'module'
    }
  };
  await fs.writeFile(path.join(testDir, '.eslintrc.json'), JSON.stringify(eslintConfig, null, 2));

  // Jest configuration
  const jestConfig = {
    'collectCoverage': true,
    'coverageThreshold': {
      'global': {
        'statements': 80,
        'branches': 75,
        'functions': 80,
        'lines': 80
      }
    },
    'testEnvironment': 'node',
    'testMatch': ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js']
  };
  await fs.writeFile(path.join(testDir, 'jest.config.json'), JSON.stringify(jestConfig, null, 2));

  // Prettier configuration
  const prettierConfig = {
    'semi': true,
    'trailingComma': 'es5',
    'singleQuote': true,
    'printWidth': 120,
    'tabWidth': 2
  };
  await fs.writeFile(path.join(testDir, '.prettierrc.json'), JSON.stringify(prettierConfig, null, 2));

  // GitHub Actions CI/CD
  await fs.mkdir(path.join(testDir, '.github', 'workflows'), { recursive: true });
  const githubWorkflow = `
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run tests
        run: npm test
      - name: Security audit
        run: npm run security:audit
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Deploying to production"
`;
  await fs.writeFile(path.join(testDir, '.github', 'workflows', 'ci.yml'), githubWorkflow);

  // Security policy
  const securityPolicy = `
# Security Policy

## Reporting Security Vulnerabilities

Please report security vulnerabilities to security@company.com

## Security Scanning

- Run \`npm run security:audit\` before every commit
- Use Snyk for dependency scanning
- Follow OWASP security guidelines
`;
  await fs.writeFile(path.join(testDir, 'SECURITY.md'), securityPolicy);

  // Pre-commit hooks with Husky
  await fs.mkdir(path.join(testDir, '.husky'), { recursive: true });
  const preCommitHook = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:unit
`;
  await fs.writeFile(path.join(testDir, '.husky', 'pre-commit'), preCommitHook);

  // README with documentation standards
  const readme = `
# E-Commerce API

## Development Standards

This project follows strict development standards:

### Code Quality
- ESLint for linting (extends recommended rules)
- Prettier for code formatting
- Jest for testing with 80% coverage requirement

### Security
- Regular dependency audits
- Snyk scanning for vulnerabilities
- Security policy documented

### CI/CD
- GitHub Actions for automated testing
- Pre-commit hooks for quality gates
- Automated deployment on main branch

## Getting Started

1. Install dependencies: \`npm install\`
2. Run tests: \`npm test\`
3. Start development: \`npm run dev\`
`;
  await fs.writeFile(path.join(testDir, 'README.md'), readme);

  // TypeScript configuration (optional)
  const tsConfig = {
    'compilerOptions': {
      'target': 'ES2022',
      'module': 'commonjs',
      'strict': true,
      'esModuleInterop': true,
      'skipLibCheck': true,
      'forceConsistentCasingInFileNames': true
    }
  };
  await fs.writeFile(path.join(testDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
}

async function demonstrateStandardsEnforcement() {
  console.log(`\x1b[1m\x1b[35m
╔════════════════════════════════════════════════════════════╗
║         FORGE Standards Detection & Enforcement Demo       ║
║                                                            ║
║     Showing integration with existing project standards    ║
╚════════════════════════════════════════════════════════════╝
\x1b[0m`);

  const testDir = path.join(__dirname, `standards-demo-${Date.now()}`);

  try {
    // 1. Create mock project with standards
    console.log('\n\x1b[1m\x1b[34m━━━ 1. CREATING MOCK PROJECT WITH STANDARDS ━━━\x1b[0m');
    await createMockProject(testDir);
    console.log('✅ Created project with:');
    console.log('   • package.json with test scripts');
    console.log('   • .eslintrc.json with linting rules');
    console.log('   • jest.config.json with coverage thresholds');
    console.log('   • .prettierrc.json formatting rules');
    console.log('   • GitHub Actions CI/CD pipeline');
    console.log('   • Security policy and Snyk configuration');
    console.log('   • Pre-commit hooks with Husky');

    // 2. Initialize FORGE and detect standards
    console.log('\n\x1b[1m\x1b[34m━━━ 2. FORGE INITIALIZATION WITH STANDARDS DETECTION ━━━\x1b[0m');
    const stateManager = new ForgeStateManager(testDir);
    await stateManager.initialize();
    const tools = new ToolHandlers(stateManager, {
      logger: { debug: () => {}, error: console.error }
    });

    const initResult = await tools.initProject({
      projectName: 'E-Commerce API',
      projectType: 'api',
      description: 'RESTful API for e-commerce platform with microservices architecture'
    });

    console.log(initResult.text);

    // 3. Create a development cycle
    console.log('\n\x1b[1m\x1b[34m━━━ 3. CREATING DEVELOPMENT CYCLE ━━━\x1b[0m');
    const cycleResult = await tools.newCycle({
      feature: 'Product Search API',
      description: 'Implement full-text search API for products with filters and pagination',
      priority: 'high'
    });

    const cycles = await stateManager.getCycles();
    const cycleId = cycles.active[0].id;

    // 4. Show standards integration in validation
    console.log('\n\x1b[1m\x1b[34m━━━ 4. STANDARDS-ENHANCED VALIDATION ━━━\x1b[0m');

    // Try to advance to Refine phase quickly to show enhanced validation
    await tools.phaseAdvance({ cycleId, skipValidation: true }); // Focus -> Orchestrate
    await tools.phaseAdvance({ cycleId, skipValidation: true }); // Orchestrate -> Refine

    // Now try to advance from Refine without meeting enhanced standards
    console.log('\n\x1b[33mTrying to advance from Refine phase without meeting standards...\x1b[0m');
    const refineAdvance = await tools.phaseAdvance({ cycleId });
    console.log(refineAdvance.text);

    // 5. Complete tasks to meet detected standards
    console.log('\n\x1b[1m\x1b[34m━━━ 5. COMPLETING TASKS WITH DETECTED STANDARDS ━━━\x1b[0m');

    await tools.phaseUpdate({
      cycleId,
      phase: 'Refine',
      progress: 90,
      tasks: [
        'Implement search API endpoints ✓',
        'Write unit tests (Jest framework) ✓',
        'Write integration tests ✓',
        'Write E2E tests ✓',
        'Run ESLint and fix all issues ✓',
        'Complete code review ✓',
        'Run security scan (Snyk) ✓'
      ]
    });

    console.log('✅ Updated Refine phase with standards compliance:');
    console.log('   • 4 tests written (exceeds 3 minimum for detected Jest framework)');
    console.log('   • ESLint checks completed');
    console.log('   • Security scan with Snyk performed');
    console.log('   • Code review completed');

    // 6. Show successful advancement with standards
    console.log('\n\x1b[1m\x1b[34m━━━ 6. SUCCESSFUL ADVANCEMENT WITH STANDARDS ━━━\x1b[0m');
    const successAdvance = await tools.phaseAdvance({ cycleId });
    console.log(successAdvance.text);

    // 7. Show Generate phase with CI/CD integration
    console.log('\n\x1b[1m\x1b[34m━━━ 7. GENERATE PHASE WITH CI/CD INTEGRATION ━━━\x1b[0m');
    const generateStatus = await tools.cycleStatus({ cycleId });
    console.log('Current phase guidance:');
    console.log(generateStatus.text);

    // 8. View the standards report
    console.log('\n\x1b[1m\x1b[34m━━━ 8. DETAILED STANDARDS REPORT ━━━\x1b[0m');
    try {
      const standardsReport = await fs.readFile(path.join(testDir, '.forge', 'standards-report.json'), 'utf8');
      const standards = JSON.parse(standardsReport);

      console.log('\x1b[36m📊 DETECTED STANDARDS SUMMARY:\x1b[0m');
      console.log(`• Linting: ${standards.standards.linting.map(l => l.tool).join(', ')}`);
      console.log(`• Testing: ${standards.standards.testing.map(t => t.framework || 'Scripts').join(', ')}`);
      console.log(`• Security: ${standards.standards.security.map(s => s.type).join(', ')}`);
      console.log(`• CI/CD: ${standards.standards.ci_cd.map(c => c.platform).join(', ')}`);
      console.log(`• Git Hooks: ${standards.standards.git.map(g => g.tool).join(', ')}`);

      console.log('\n\x1b[36m🔧 FORGE INTEGRATION:\x1b[0m');
      Object.entries(standards.forgeIntegration).forEach(([phase, actions]) => {
        if (actions.length > 0) {
          console.log(`• ${phase}: ${actions.length} integrated checks`);
        }
      });
    } catch (error) {
      console.log('Could not read standards report');
    }

    console.log(`\n\x1b[1m\x1b[32m
╔════════════════════════════════════════════════════════════╗
║              STANDARDS ENFORCEMENT DEMONSTRATION           ║
║                         COMPLETED                          ║
║                                                            ║
║  ✅ Detected 7 different types of project standards       ║
║  ✅ Integrated standards into FORGE validation            ║
║  ✅ Enhanced phase requirements based on detected tools   ║
║  ✅ Enforced higher quality gates when tools present      ║
║  ✅ Provided tool-specific guidance and actions           ║
╚════════════════════════════════════════════════════════════╝
\x1b[0m`);

    console.log('\n\x1b[1m\x1b[36m📋 STANDARDS ENFORCEMENT FEATURES:\x1b[0m');
    console.log('  • 🔍 Automatic detection of 40+ standard configuration files');
    console.log('  • 📊 Enhanced validation requirements when standards detected');
    console.log('  • 🛠️  Tool-specific enforcement (ESLint, Jest, Snyk, etc.)');
    console.log('  • 🚫 Stricter blocking rules for projects with quality tools');
    console.log('  • 📈 Higher test coverage requirements when framework detected');
    console.log('  • 🔒 Security scan enforcement when security tools present');
    console.log('  • 🔄 CI/CD pipeline integration recommendations');

  } catch (error) {
    console.error('\n\x1b[31m❌ Standards enforcement demo failed:\x1b[0m', error);
    process.exit(1);
  } finally {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Run the demonstration
demonstrateStandardsEnforcement().catch(console.error);