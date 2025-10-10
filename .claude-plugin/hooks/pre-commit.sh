#!/bin/bash
# FORGE Pre-Commit Hook
# Validates FORGE workflow compliance before allowing commits

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 FORGE Pre-Commit Validation${NC}"

# Check if .forge directory exists
if [ ! -d ".forge" ]; then
  echo -e "${YELLOW}⚠️  FORGE not initialized in this project${NC}"
  echo -e "${YELLOW}   Run /forge-init to initialize FORGE${NC}"
  exit 0  # Don't block commits in non-FORGE projects
fi

# Check if there are active cycles
if [ ! -d ".forge/cycles/active" ] || [ -z "$(ls -A .forge/cycles/active 2>/dev/null)" ]; then
  echo -e "${GREEN}✅ No active cycles - commit allowed${NC}"
  exit 0
fi

# Get list of modified files
MODIFIED_FILES=$(git diff --cached --name-only)

# Check if committing PRD or test scenarios in Focus phase
if echo "$MODIFIED_FILES" | grep -q "^docs/prd/\|^docs/testing/"; then
  echo -e "${GREEN}✅ Documentation update detected${NC}"
  echo -e "${GREEN}   Committing PRD or test scenarios${NC}"
fi

# Check if committing code without tests
if echo "$MODIFIED_FILES" | grep -qE "\.(js|ts|py|go|rb|java)$"; then
  if ! echo "$MODIFIED_FILES" | grep -qE "test|spec|_test\."; then
    echo -e "${YELLOW}⚠️  Code changes without corresponding tests${NC}"
    echo -e "${YELLOW}   FORGE recommends Test-Driven Development${NC}"
    echo -e "${YELLOW}   Consider adding tests before committing${NC}"
    # Warning only, don't block
  else
    echo -e "${GREEN}✅ Code and tests modified together${NC}"
  fi
fi

# Check commit message format (encourage descriptive messages)
COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")
if [ -z "$COMMIT_MSG" ]; then
  echo -e "${BLUE}💡 Tip: Write descriptive commit messages${NC}"
  echo -e "${BLUE}   FORGE encourages clear 'why' over 'what'${NC}"
fi

echo -e "${GREEN}✅ FORGE pre-commit validation passed${NC}"
echo -e "${BLUE}📝 Remember: Commit frequently in FORGE cycles${NC}"

exit 0
