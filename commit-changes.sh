#!/bin/bash

# Navigate to the project directory
cd /Users/scott/Projects/forge/forge-mcp

# Add all changes
git add -A

# Create commit with detailed message
git commit -m "feat: Add comprehensive FORGE framework enforcement and standards detection

## Major Enhancements

### 🔍 Standards Detection System
- Automatic detection of 40+ project configuration files
- Scans for linting, testing, formatting, security, CI/CD, and git hooks
- Generates detailed standards report on initialization
- Integrates detected tools into validation rules

### 🚫 Enhanced Framework Enforcement
- Strict phase validation with blocking issues and warnings
- Phase-specific requirements enforced before advancement
- Tool-specific guidance and recommendations
- Standards-aware validation (stricter when tools detected)

### 🛠️ New MCP Tools
- forge_checkpoint: Validate cycle compliance
- forge_guide_next: Get phase-specific guidance
- Enhanced forge_init_project with standards detection
- Improved validation with project-specific rules

### 📋 Validation Improvements
- Higher test requirements when testing framework detected
- Mandatory linting checks when linter configured
- Security scan enforcement when security tools present
- CI/CD pipeline integration recommendations

### 🧪 Comprehensive Testing
- BDD test suites for framework validation
- Standards enforcement demonstration
- Complete feature scenario tests
- Validation and guard rail tests

## Files Added/Modified
- lib/core/standards-detector.js: Standards detection engine
- lib/core/state-manager.js: Enhanced cycle parsing and formatting
- lib/tools/index.js: Enforcement tools and validation
- test/forge-bdd.test.js: BDD test suite
- test/forge-scenario.test.js: Complete workflow test
- test/forge-validation.test.js: Validation tests
- test/standards-enforcement-demo.js: Standards demo

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Show status
echo "Changes committed. Current status:"
git status

# Push to remote
echo ""
echo "Pushing to remote..."
git push origin main

echo ""
echo "✅ Changes committed and pushed successfully!"