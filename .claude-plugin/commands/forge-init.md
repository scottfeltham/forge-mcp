# Initialize FORGE Framework

Initialize the FORGE development framework in your project with automatic standards detection.

## What This Does

1. **Creates FORGE directory structure** (`.forge/` directory)
2. **Detects existing standards** (linting, testing, CI/CD, security)
3. **Generates project configuration** tailored to your tech stack
4. **Sets up documentation structure** (docs/ with PRD, architecture, testing folders)
5. **Integrates with your workflow** (respects existing tools and conventions)

## Usage

Simply run:
```
/forge-init
```

Claude will then use the `forge_init_project` MCP tool to initialize FORGE in your current directory.

## What You'll Get

- `.forge/config.yaml` - Project configuration with detected standards
- `.forge/context.md` - AI assistant context for better collaboration
- `.forge/standards-report.json` - Detailed analysis of your project setup
- `docs/` - Documentation structure (prd/, architecture/, testing/, etc.)

## Standards Detection

FORGE automatically detects and integrates with:

- **Linting**: ESLint, Pylint, RuboCop, etc.
- **Testing**: Jest, Pytest, RSpec, Go test, etc.
- **CI/CD**: GitHub Actions, GitLab CI, CircleCI, etc.
- **Security**: npm audit, Snyk, SonarQube, etc.
- **Git Hooks**: Husky, pre-commit, etc.

## After Initialization

Create your first development cycle:
```
/forge-cycle
```

Check project status:
```
/forge-status
```

## Requirements

- Node.js 18+ (for the MCP server)
- Git repository (recommended)
- Write access to project directory

## Philosophy

FORGE adapts to YOUR project, not the other way around. We detect and respect your existing tools, standards, and conventions.
