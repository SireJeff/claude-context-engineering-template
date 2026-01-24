#!/bin/bash
#
# Claude Context Engineering - Pre-Commit Hook
#
# Validates documentation synchronization before allowing commits.
# Install with: npx claude-context hooks install
#

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
CLAUDE_DIR="$REPO_ROOT/.claude"
CONFIG_FILE="$CLAUDE_DIR/automation/config.json"

# Check if claude context is set up
if [ ! -d "$CLAUDE_DIR" ]; then
    exit 0  # No .claude directory, skip checks
fi

# Load config (if jq is available)
BLOCK_ON_STALE=false
CHECK_DRIFT=true

if command -v jq &> /dev/null && [ -f "$CONFIG_FILE" ]; then
    BLOCK_ON_STALE=$(jq -r '.hooks.pre_commit.block_on_stale // false' "$CONFIG_FILE")
    CHECK_DRIFT=$(jq -r '.hooks.pre_commit.check_drift // true' "$CONFIG_FILE")
fi

# Skip if drift check is disabled
if [ "$CHECK_DRIFT" != "true" ]; then
    exit 0
fi

echo -e "${GREEN}Claude Context: Pre-commit validation${NC}"

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

# Check if any code files are being committed
CODE_FILES=""
for file in $STAGED_FILES; do
    case "$file" in
        *.py|*.js|*.ts|*.jsx|*.tsx|*.go|*.rs|*.rb|*.java)
            CODE_FILES="$CODE_FILES $file"
            ;;
    esac
done

# If no code files, skip checks
if [ -z "$CODE_FILES" ]; then
    echo -e "${GREEN}No code files in commit, skipping drift check.${NC}"
    exit 0
fi

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo -e "${YELLOW}Warning: npx not found, skipping documentation drift check.${NC}"
    exit 0
fi

# Run drift check
DRIFT_FOUND=false
DRIFT_OUTPUT=""

for file in $CODE_FILES; do
    # Check if this file is referenced in any workflow
    if grep -r "$file" "$CLAUDE_DIR/context/workflows" &> /dev/null; then
        echo -e "  Checking: $file"

        # Simple hash-based check
        CURRENT_HASH=$(git hash-object "$file" 2>/dev/null)
        STAGED_HASH=$(git ls-files -s "$file" 2>/dev/null | awk '{print $2}')

        if [ -n "$STAGED_HASH" ]; then
            DRIFT_OUTPUT="$DRIFT_OUTPUT\n  - $file (modified, may affect documentation)"
            DRIFT_FOUND=true
        fi
    fi
done

# Report findings
if [ "$DRIFT_FOUND" = true ]; then
    echo -e "${YELLOW}Documentation may need updating:${NC}"
    echo -e "$DRIFT_OUTPUT"
    echo ""

    if [ "$BLOCK_ON_STALE" = true ]; then
        echo -e "${RED}Commit blocked: Documentation drift detected.${NC}"
        echo -e "Run ${GREEN}/verify-docs-current${NC} or ${GREEN}npx claude-context sync --check${NC}"
        echo -e "To skip this check: git commit --no-verify"
        exit 1
    else
        echo -e "${YELLOW}Warning: Consider running /verify-docs-current to check documentation.${NC}"
    fi
fi

echo -e "${GREEN}Pre-commit check complete.${NC}"
exit 0
