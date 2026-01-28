#!/bin/bash
# Hook to ensure package.json and package-lock.json are in sync
# This prevents npm ci failures in CI

# Only run for git commands
if [[ "$TOOL_INPUT" != *"git"* ]]; then
  exit 0
fi

# Function to check if files are in sync
check_sync() {
  if ! npm ci --dry-run --ignore-scripts >/dev/null 2>&1; then
    echo "⚠️  WARNING: package.json and package-lock.json are OUT OF SYNC"
    echo "   Please run 'npm install' to sync package-lock.json"

    # Block commits, but allow other git operations
    if [[ "$TOOL_INPUT" == *"git commit"* ]]; then
      echo ""
      echo "BLOCKED: Cannot commit with out-of-sync package files."
      exit 2
    fi

    # Just warn for other git operations
    echo ""
    return 1
  fi
  return 0
}

# Always check sync status (this catches existing issues)
check_sync

# Additional checks for git commit
if [[ "$TOOL_INPUT" == *"git commit"* ]]; then
  # Check if package.json is staged for commit
  if git diff --cached --name-only | grep -q "^package\.json$"; then
    # package.json is staged, ensure package-lock.json is also staged
    if ! git diff --cached --name-only | grep -q "^package-lock\.json$"; then
      echo ""
      echo "BLOCKED: package.json is staged but package-lock.json is not."
      echo "Please run 'npm install' to sync package-lock.json and stage both files."
      exit 2
    fi
  fi
fi

exit 0
