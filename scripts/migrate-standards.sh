#!/bin/bash
# Script to migrate standards from /standards/ to /docs/standards/
# Preserves git history using git mv

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Base directories - detect repo root automatically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/standards"
TARGET_DIR="${REPO_ROOT}/docs/standards"

# Change to repo root
cd "$REPO_ROOT"

print_status "$GREEN" "Starting standards migration from /standards/ to /docs/standards/"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    print_status "$RED" "Error: Source directory $SOURCE_DIR does not exist"
    exit 1
fi

# Check if target parent directory exists
if [ ! -d "${REPO_ROOT}/docs" ]; then
    print_status "$RED" "Error: Parent directory ${REPO_ROOT}/docs does not exist"
    exit 1
fi

# Check if target directory already exists
if [ -d "$TARGET_DIR" ]; then
    print_status "$YELLOW" "Warning: Target directory $TARGET_DIR already exists"
    read -p "Do you want to continue? This will merge content. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "$RED" "Migration cancelled"
        exit 1
    fi
fi

# Create the target directory structure if it doesn't exist
print_status "$GREEN" "Creating target directory structure..."
mkdir -p "$TARGET_DIR"

# Move each subdirectory preserving git history
directories=(
    "architecture"
    "development"
    "devops"
    "documentation"
    "security"
    "testing"
)

print_status "$GREEN" "Moving directories with git mv to preserve history..."
for dir in "${directories[@]}"; do
    if [ -d "$SOURCE_DIR/$dir" ]; then
        print_status "$YELLOW" "Moving $dir..."
        git mv "$SOURCE_DIR/$dir" "$TARGET_DIR/$dir"
        print_status "$GREEN" "✓ Moved $dir"
    else
        print_status "$RED" "Warning: Directory $SOURCE_DIR/$dir not found"
    fi
done

# Remove the now-empty standards directory
if [ -d "$SOURCE_DIR" ] && [ -z "$(ls -A "$SOURCE_DIR")" ]; then
    print_status "$YELLOW" "Removing empty source directory..."
    rmdir "$SOURCE_DIR"
    print_status "$GREEN" "✓ Removed empty standards directory"
fi

print_status "$GREEN" "Migration complete! Standards moved to /docs/standards/"
print_status "$YELLOW" "Next steps:"
echo "1. Review the changes with: git status"
echo "2. Update references in the codebase"
echo "3. Commit the changes"