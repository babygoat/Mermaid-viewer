#!/bin/bash
# Hook to ensure package.json and package-lock.json are in sync before git commits
# This prevents npm ci failures in CI

# Only run for git commit commands
if [[ "$TOOL_INPUT" != *"git commit"* ]]; then
  exit 0
fi

# Check if package.json is staged for commit
if ! git diff --cached --name-only | grep -q "^package\.json$"; then
  exit 0
fi

# Check if package-lock.json is also staged
if ! git diff --cached --name-only | grep -q "^package-lock\.json$"; then
  echo "BLOCKED: package.json is staged but package-lock.json is not."
  echo "Please run 'npm install' to sync package-lock.json and stage both files."
  exit 2
fi

# Verify lock file is actually in sync by checking npm ci would work
# Use --dry-run to avoid actually installing
if ! npm ci --dry-run --ignore-scripts 2>/dev/null; then
  echo "BLOCKED: package-lock.json appears out of sync with package.json."
  echo "Please run 'npm install' to regenerate package-lock.json."
  exit 2
fi

exit 0
