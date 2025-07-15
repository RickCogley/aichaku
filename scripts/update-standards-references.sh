#!/bin/bash
# Script to update all references from /standards/ to /docs/standards/

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

# Base directories
REPO_ROOT="/Users/rcogley/dev/aichaku"

# Change to repo root
cd "$REPO_ROOT"

print_status "$GREEN" "Updating standards references from /standards/ to /docs/standards/"

# Update the main source file that copies standards
print_status "$YELLOW" "Updating src/commands/init.ts..."
sed -i '' 's|"../../../standards"|"../../../docs/standards"|g' src/commands/init.ts

# Update content fetcher to fetch to the right location
print_status "$YELLOW" "Updating content fetcher references..."
# This doesn't need updating as it fetches to the target path passed to it

# Update documentation references
print_status "$YELLOW" "Updating documentation references..."
find docs -name "*.md" -type f -exec sed -i '' 's|/standards/documentation/|/docs/standards/documentation/|g' {} \;
find docs -name "*.md" -type f -exec sed -i '' 's|/standards/|/docs/standards/|g' {} \;

# Update YAML file references
print_status "$YELLOW" "Updating YAML references..."
if [ -f "docs/standards/development/tdd.yaml" ]; then
    sed -i '' 's|/standards/development/|/docs/standards/development/|g' docs/standards/development/tdd.yaml
fi

# Update nagare config if it exists
if [ -f "nagare.config.ts" ]; then
    print_status "$YELLOW" "Checking nagare.config.ts..."
    # Add any specific nagare config updates here if needed
fi

# Check for any remaining references
print_status "$YELLOW" "Checking for remaining references..."
remaining=$(grep -r "standards/" --include="*.ts" --include="*.js" --include="*.md" --include="*.yaml" --include="*.yml" . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v "docs/standards/" | grep -v "user/standards/" | grep -v "aichaku/standards/" | grep -v ".claude/standards/" | grep -v "~/.claude/standards/" | grep -v "aichaku/user/standards/" | grep -v "migration" | grep -v "custom/standards/" | grep -v "\"standards\":" | grep -v "'standards':" | grep -v "standards:" | grep -v "selectedStandards" | grep -v "standardsPath" | grep -v "standardsExist" | grep -v "fetchStandards" | grep -v "installStandards" | grep -v "copyStandards" | grep -v "targetStandards" | grep -v "sourceStandards" | grep -v "globalStandards" | grep -v "customStandards" | grep -v "buildStandards" | grep -v "docsStandards" | grep -v " standards " | grep -v "Standards " | grep -v " standards\." | grep -v "\.standards" | grep -v "standards\(" | grep -v "standards\)" | grep -v "standards\[" | grep -v "standards\]" | grep -v "standards library" | grep -v "standards from" | grep -v "standards to" | grep -v "standards:" | wc -l)

if [ "$remaining" -gt 0 ]; then
    print_status "$YELLOW" "Found $remaining potential references that may need manual review:"
    grep -r "standards/" --include="*.ts" --include="*.js" --include="*.md" --include="*.yaml" --include="*.yml" . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v "docs/standards/" | grep -v "user/standards/" | grep -v "aichaku/standards/" | grep -v ".claude/standards/" | grep -v "~/.claude/standards/" | grep -v "aichaku/user/standards/" | grep -v "migration" | grep -v "custom/standards/" | grep -v "\"standards\":" | grep -v "'standards':" | grep -v "standards:" | grep -v "selectedStandards" | grep -v "standardsPath" | grep -v "standardsExist" | grep -v "fetchStandards" | grep -v "installStandards" | grep -v "copyStandards" | grep -v "targetStandards" | grep -v "sourceStandards" | grep -v "globalStandards" | grep -v "customStandards" | grep -v "buildStandards" | grep -v "docsStandards" | grep -v " standards " | grep -v "Standards " | grep -v " standards\." | grep -v "\.standards" | grep -v "standards\(" | grep -v "standards\)" | grep -v "standards\[" | grep -v "standards\]" | grep -v "standards library" | grep -v "standards from" | grep -v "standards to" | grep -v "standards:" | head -20
fi

print_status "$GREEN" "✓ Reference updates complete!"
print_status "$YELLOW" "Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Run tests to ensure everything works"
echo "3. Commit the changes"