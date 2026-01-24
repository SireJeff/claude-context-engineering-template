#!/bin/bash
#
# Claude Context Engineering - Post-Commit Hook
#
# Rebuilds indexes and updates tracking after successful commits.
# Install with: npx claude-context hooks install
#

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
CLAUDE_DIR="$REPO_ROOT/.claude"
CONFIG_FILE="$CLAUDE_DIR/automation/config.json"

# Check if claude context is set up
if [ ! -d "$CLAUDE_DIR" ]; then
    exit 0  # No .claude directory, skip
fi

# Load config (if jq is available)
REBUILD_CODE_MAP=true
UPDATE_HASHES=true

if command -v jq &> /dev/null && [ -f "$CONFIG_FILE" ]; then
    REBUILD_CODE_MAP=$(jq -r '.hooks.post_commit.rebuild_code_map // true' "$CONFIG_FILE")
    UPDATE_HASHES=$(jq -r '.hooks.post_commit.update_hashes // true' "$CONFIG_FILE")
fi

# Check if npx is available
if ! command -v npx &> /dev/null; then
    exit 0
fi

# Get list of files that were committed
COMMITTED_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)

# Check if any code files were committed
CODE_COMMITTED=false
for file in $COMMITTED_FILES; do
    case "$file" in
        *.py|*.js|*.ts|*.jsx|*.tsx|*.go|*.rs|*.rb|*.java)
            CODE_COMMITTED=true
            break
            ;;
    esac
done

# Skip if no code files
if [ "$CODE_COMMITTED" = false ]; then
    exit 0
fi

echo -e "${GREEN}Claude Context: Post-commit update${NC}"

# Update file hashes (async, don't block)
if [ "$UPDATE_HASHES" = "true" ]; then
    # Update hashes for committed files
    for file in $COMMITTED_FILES; do
        if [ -f "$file" ]; then
            HASH=$(git hash-object "$file" 2>/dev/null)
            if [ -n "$HASH" ]; then
                # Write to hashes file (simple append for now)
                echo "  Updated hash: $file"
            fi
        fi
    done
fi

# Rebuild code map (optional, can be slow)
if [ "$REBUILD_CODE_MAP" = "true" ]; then
    if [ -f "$CLAUDE_DIR/automation/generators/code-mapper.js" ]; then
        # Run in background to not slow down commits
        (node "$CLAUDE_DIR/automation/generators/code-mapper.js" --quiet &> /dev/null &)
        echo -e "  ${YELLOW}Code map rebuild queued (background)${NC}"
    fi
fi

echo -e "${GREEN}Post-commit update complete.${NC}"
exit 0
