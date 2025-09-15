/**
 * Standards and Rules Detection for FORGE Framework
 *
 * Automatically detects project standards, linting rules, testing frameworks,
 * and coding conventions to integrate into FORGE validation
 */

const fs = require('fs').promises;
const path = require('path');

class StandardsDetector {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.detectedStandards = {
      linting: [],
      testing: [],
      formatting: [],
      documentation: [],
      security: [],
      ci_cd: [],
      git: [],
      custom: []
    };
  }

  async detectAllStandards() {
    console.log('🔍 Scanning project for standards and rules...');

    // Check for various configuration files
    await this.detectLintingStandards();
    await this.detectTestingFrameworks();
    await this.detectFormattingRules();
    await this.detectDocumentationStandards();
    await this.detectSecurityPolicies();
    await this.detectCICDPipelines();
    await this.detectGitHooks();
    await this.detectCustomStandards();

    return this.generateStandardsReport();
  }

  async detectLintingStandards() {
    const linters = [
      { file: '.eslintrc.json', name: 'ESLint', type: 'JavaScript/TypeScript' },
      { file: '.eslintrc.js', name: 'ESLint', type: 'JavaScript/TypeScript' },
      { file: '.eslintrc.yml', name: 'ESLint', type: 'JavaScript/TypeScript' },
      { file: 'tslint.json', name: 'TSLint', type: 'TypeScript' },
      { file: '.pylintrc', name: 'Pylint', type: 'Python' },
      { file: 'pyproject.toml', name: 'Black/Ruff', type: 'Python', section: 'tool.ruff' },
      { file: '.rubocop.yml', name: 'RuboCop', type: 'Ruby' },
      { file: '.golangci.yml', name: 'GolangCI', type: 'Go' },
      { file: 'rustfmt.toml', name: 'Rustfmt', type: 'Rust' },
      { file: '.swiftlint.yml', name: 'SwiftLint', type: 'Swift' }
    ];

    for (const linter of linters) {
      if (await this.fileExists(linter.file)) {
        const config = await this.readConfig(linter.file);
        this.detectedStandards.linting.push({
          tool: linter.name,
          configFile: linter.file,
          language: linter.type,
          rules: this.extractLintRules(config, linter.name)
        });
      }
    }
  }

  async detectTestingFrameworks() {
    const testConfigs = [
      { file: 'jest.config.js', framework: 'Jest', coverage: true },
      { file: 'jest.config.json', framework: 'Jest', coverage: true },
      { file: 'vitest.config.js', framework: 'Vitest', coverage: true },
      { file: 'karma.conf.js', framework: 'Karma', coverage: false },
      { file: 'mocha.opts', framework: 'Mocha', coverage: false },
      { file: '.mocharc.json', framework: 'Mocha', coverage: false },
      { file: 'pytest.ini', framework: 'Pytest', coverage: true },
      { file: 'tox.ini', framework: 'Tox', coverage: true },
      { file: 'phpunit.xml', framework: 'PHPUnit', coverage: true }
    ];

    // Check package.json for test scripts
    const packageJson = await this.readConfig('package.json');
    if (packageJson && packageJson.scripts) {
      const testScripts = Object.entries(packageJson.scripts)
        .filter(([key, value]) => key.includes('test') || value.includes('test'));

      if (testScripts.length > 0) {
        this.detectedStandards.testing.push({
          source: 'package.json',
          scripts: Object.fromEntries(testScripts),
          coverageRequired: testScripts.some(([_, v]) => v.includes('coverage'))
        });
      }
    }

    // Check for test framework configs
    for (const config of testConfigs) {
      if (await this.fileExists(config.file)) {
        const content = await this.readConfig(config.file);
        this.detectedStandards.testing.push({
          framework: config.framework,
          configFile: config.file,
          coverageEnabled: config.coverage,
          thresholds: this.extractCoverageThresholds(content, config.framework)
        });
      }
    }
  }

  async detectFormattingRules() {
    const formatters = [
      { file: '.prettierrc', name: 'Prettier' },
      { file: '.prettierrc.json', name: 'Prettier' },
      { file: '.prettierrc.js', name: 'Prettier' },
      { file: '.editorconfig', name: 'EditorConfig' },
      { file: '.clang-format', name: 'ClangFormat' },
      { file: 'setup.cfg', name: 'Python Formatting', section: 'flake8' }
    ];

    for (const formatter of formatters) {
      if (await this.fileExists(formatter.file)) {
        const config = await this.readConfig(formatter.file);
        this.detectedStandards.formatting.push({
          tool: formatter.name,
          configFile: formatter.file,
          rules: config
        });
      }
    }
  }

  async detectDocumentationStandards() {
    const docTools = [
      { file: 'jsdoc.json', name: 'JSDoc', type: 'API' },
      { file: '.jsdoc.json', name: 'JSDoc', type: 'API' },
      { file: 'typedoc.json', name: 'TypeDoc', type: 'API' },
      { file: 'mkdocs.yml', name: 'MkDocs', type: 'Project' },
      { file: 'docusaurus.config.js', name: 'Docusaurus', type: 'Project' },
      { file: 'sphinx-conf.py', name: 'Sphinx', type: 'API' },
      { file: 'README.md', name: 'README', type: 'Project' },
      { file: 'CONTRIBUTING.md', name: 'Contributing Guide', type: 'Process' },
      { file: 'CODE_OF_CONDUCT.md', name: 'Code of Conduct', type: 'Community' }
    ];

    for (const doc of docTools) {
      if (await this.fileExists(doc.file)) {
        this.detectedStandards.documentation.push({
          tool: doc.name,
          file: doc.file,
          type: doc.type
        });
      }
    }
  }

  async detectSecurityPolicies() {
    const securityFiles = [
      { file: 'SECURITY.md', type: 'policy' },
      { file: '.snyk', type: 'scanner' },
      { file: '.gitleaks.toml', type: 'secrets' },
      { file: 'dependabot.yml', type: 'dependencies' },
      { file: '.github/dependabot.yml', type: 'dependencies' },
      { file: 'audit-ci.json', type: 'audit' }
    ];

    for (const sec of securityFiles) {
      if (await this.fileExists(sec.file)) {
        this.detectedStandards.security.push({
          file: sec.file,
          type: sec.type,
          active: true
        });
      }
    }

    // Check for security in package.json scripts
    const packageJson = await this.readConfig('package.json');
    if (packageJson && packageJson.scripts) {
      const securityScripts = Object.entries(packageJson.scripts)
        .filter(([key, value]) =>
          key.includes('security') ||
          key.includes('audit') ||
          value.includes('audit') ||
          value.includes('snyk')
        );

      if (securityScripts.length > 0) {
        this.detectedStandards.security.push({
          source: 'package.json',
          scripts: Object.fromEntries(securityScripts)
        });
      }
    }
  }

  async detectCICDPipelines() {
    const cicdFiles = [
      { file: '.github/workflows', type: 'GitHub Actions', isDir: true },
      { file: '.gitlab-ci.yml', type: 'GitLab CI' },
      { file: 'Jenkinsfile', type: 'Jenkins' },
      { file: '.circleci/config.yml', type: 'CircleCI' },
      { file: '.travis.yml', type: 'Travis CI' },
      { file: 'azure-pipelines.yml', type: 'Azure DevOps' },
      { file: 'bitbucket-pipelines.yml', type: 'Bitbucket' },
      { file: '.drone.yml', type: 'Drone CI' }
    ];

    for (const ci of cicdFiles) {
      if (ci.isDir) {
        if (await this.directoryExists(ci.file)) {
          const workflows = await this.listFiles(ci.file);
          this.detectedStandards.ci_cd.push({
            platform: ci.type,
            workflows: workflows.filter(f => f.endsWith('.yml') || f.endsWith('.yaml')),
            path: ci.file
          });
        }
      } else if (await this.fileExists(ci.file)) {
        const config = await this.readConfig(ci.file);
        this.detectedStandards.ci_cd.push({
          platform: ci.type,
          configFile: ci.file,
          stages: this.extractCIStages(config, ci.type)
        });
      }
    }
  }

  async detectGitHooks() {
    const gitHooksPath = path.join(this.projectPath, '.git', 'hooks');
    const huskyPath = path.join(this.projectPath, '.husky');
    const preCommitConfig = '.pre-commit-config.yaml';

    // Check for Husky
    if (await this.directoryExists('.husky')) {
      const hooks = await this.listFiles('.husky');
      this.detectedStandards.git.push({
        tool: 'Husky',
        hooks: hooks.filter(f => !f.startsWith('_')),
        path: '.husky'
      });
    }

    // Check for pre-commit
    if (await this.fileExists(preCommitConfig)) {
      const config = await this.readConfig(preCommitConfig);
      this.detectedStandards.git.push({
        tool: 'pre-commit',
        configFile: preCommitConfig,
        hooks: config.repos ? config.repos.length : 0
      });
    }

    // Check package.json for git hooks
    const packageJson = await this.readConfig('package.json');
    if (packageJson && packageJson.husky) {
      this.detectedStandards.git.push({
        tool: 'Husky (package.json)',
        hooks: Object.keys(packageJson.husky.hooks || {})
      });
    }
  }

  async detectCustomStandards() {
    // Check for FORGE-specific standards
    const customFiles = [
      'STANDARDS.md',
      'CODING_STANDARDS.md',
      '.forge/standards.yaml',
      '.forge/rules.json',
      'forge.config.json',
      'forge.config.yaml'
    ];

    for (const file of customFiles) {
      if (await this.fileExists(file)) {
        const content = await this.readConfig(file);
        this.detectedStandards.custom.push({
          file,
          content: typeof content === 'string' ? { raw: content } : content
        });
      }
    }
  }

  async generateStandardsReport() {
    const report = {
      summary: {
        hasLinting: this.detectedStandards.linting.length > 0,
        hasTesting: this.detectedStandards.testing.length > 0,
        hasFormatting: this.detectedStandards.formatting.length > 0,
        hasDocumentation: this.detectedStandards.documentation.length > 0,
        hasSecurity: this.detectedStandards.security.length > 0,
        hasCICD: this.detectedStandards.ci_cd.length > 0,
        hasGitHooks: this.detectedStandards.git.length > 0,
        hasCustomRules: this.detectedStandards.custom.length > 0
      },
      standards: this.detectedStandards,
      recommendations: this.generateRecommendations(),
      forgeIntegration: this.generateForgeIntegration()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.detectedStandards.linting.length === 0) {
      recommendations.push({
        category: 'linting',
        priority: 'high',
        message: 'No linting configuration detected. Consider adding ESLint, Pylint, or language-specific linter.'
      });
    }

    if (this.detectedStandards.testing.length === 0) {
      recommendations.push({
        category: 'testing',
        priority: 'critical',
        message: 'No testing framework detected. FORGE requires test-driven development.'
      });
    }

    if (!this.detectedStandards.testing.some(t => t.coverageRequired || t.coverageEnabled)) {
      recommendations.push({
        category: 'testing',
        priority: 'high',
        message: 'Code coverage not configured. Consider enabling coverage reporting.'
      });
    }

    if (this.detectedStandards.security.length === 0) {
      recommendations.push({
        category: 'security',
        priority: 'high',
        message: 'No security scanning detected. Consider adding dependency scanning and secret detection.'
      });
    }

    if (this.detectedStandards.git.length === 0) {
      recommendations.push({
        category: 'git',
        priority: 'medium',
        message: 'No git hooks detected. Consider adding pre-commit hooks for quality checks.'
      });
    }

    return recommendations;
  }

  generateForgeIntegration() {
    const integration = {
      focusPhase: [],
      orchestratePhase: [],
      refinePhase: [],
      generatePhase: [],
      evaluatePhase: []
    };

    // Focus Phase - Documentation and standards review
    if (this.detectedStandards.documentation.length > 0) {
      integration.focusPhase.push('Review existing documentation standards');
      integration.focusPhase.push('Ensure PRD follows documentation guidelines');
    }

    // Orchestrate Phase - CI/CD planning
    if (this.detectedStandards.ci_cd.length > 0) {
      integration.orchestratePhase.push('Align task breakdown with CI/CD pipeline stages');
      integration.orchestratePhase.push('Plan tests to match existing test suites');
    }

    // Refine Phase - Linting and testing
    if (this.detectedStandards.linting.length > 0) {
      integration.refinePhase.push('Run linting before marking tasks complete');
      integration.refinePhase.push('Fix all linting errors before code review');
    }

    if (this.detectedStandards.testing.length > 0) {
      const coverageThreshold = this.detectedStandards.testing
        .find(t => t.thresholds)?.thresholds;
      if (coverageThreshold) {
        integration.refinePhase.push(`Maintain code coverage above ${coverageThreshold}%`);
      }
    }

    // Generate Phase - Build and security
    if (this.detectedStandards.security.length > 0) {
      integration.generatePhase.push('Run security scans before deployment');
      integration.generatePhase.push('Ensure no vulnerable dependencies');
    }

    // Evaluate Phase - Metrics from CI/CD
    if (this.detectedStandards.ci_cd.length > 0) {
      integration.evaluatePhase.push('Collect metrics from CI/CD pipeline');
      integration.evaluatePhase.push('Review build success rates');
    }

    return integration;
  }

  // Utility methods
  async fileExists(filePath) {
    try {
      await fs.access(path.join(this.projectPath, filePath));
      return true;
    } catch {
      return false;
    }
  }

  async directoryExists(dirPath) {
    try {
      const stats = await fs.stat(path.join(this.projectPath, dirPath));
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async readConfig(filePath) {
    try {
      const fullPath = path.join(this.projectPath, filePath);
      const content = await fs.readFile(fullPath, 'utf8');

      if (filePath.endsWith('.json')) {
        return JSON.parse(content);
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        // Simple YAML parsing (would need js-yaml in production)
        return content; // Return raw for now
      } else if (filePath.endsWith('.js')) {
        // For JS configs, return as string for analysis
        return content;
      }

      return content;
    } catch (error) {
      return null;
    }
  }

  async listFiles(dirPath) {
    try {
      const files = await fs.readdir(path.join(this.projectPath, dirPath));
      return files;
    } catch {
      return [];
    }
  }

  extractLintRules(config, linterName) {
    if (!config) return {};

    if (linterName === 'ESLint' && typeof config === 'object') {
      return {
        extends: config.extends || [],
        rules: Object.keys(config.rules || {}).length,
        plugins: config.plugins || []
      };
    }

    return { detected: true };
  }

  extractCoverageThresholds(config, framework) {
    if (!config) return null;

    if (framework === 'Jest' && typeof config === 'object') {
      return config.coverageThreshold?.global?.statements || null;
    }

    return null;
  }

  extractCIStages(config, platform) {
    if (!config) return [];

    if (platform === 'GitHub Actions' && typeof config === 'object') {
      return Object.keys(config.jobs || {});
    }

    return [];
  }
}

module.exports = { StandardsDetector };