#!/bin/bash
# Aichaku Document Generator
# Creates new markdown documents following professional formatting standards
# Usage: ./scripts/new-doc.sh "Document Title" path/to/file.md [methodology]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}🪴 Aichaku:${NC} $1"
}

print_error() {
    echo -e "${RED}❌ Error:${NC} $1" >&2
}

print_info() {
    echo -e "${BLUE}ℹ️  Info:${NC} $1"
}

# Validate arguments
if [ $# -lt 2 ] || [ $# -gt 3 ]; then
    print_error "Usage: $0 \"Document Title\" path/to/file.md [methodology]"
    echo
    echo "Examples:"
    echo "  $0 \"Setup Guide\" docs/how-to/setup.md"
    echo "  $0 \"Feature Pitch\" docs/projects/active/my-project/pitch.md shape-up"
    exit 1
fi

TITLE="$1"
FILEPATH="$2"
METHODOLOGY="${3:-}"
DATE=$(date +%Y-%m-%d)
DIRNAME=$(dirname "$FILEPATH")

# Validate file extension
if [[ ! "$FILEPATH" =~ \.md$ ]]; then
    print_error "File must have .md extension"
    exit 1
fi

# Create directory if it doesn't exist
if [ ! -d "$DIRNAME" ]; then
    print_info "Creating directory: $DIRNAME"
    mkdir -p "$DIRNAME"
fi

# Check if file already exists
if [ -f "$FILEPATH" ]; then
    print_error "File already exists: $FILEPATH"
    echo "Use a different name or remove the existing file first."
    exit 1
fi

# Generate methodology-specific content
methodology_section=""
if [ -n "$METHODOLOGY" ]; then
    case "$METHODOLOGY" in
        "shape-up")
            methodology_section="
## Appetite

- Time: [2 weeks / 6 weeks]
- Team: [Size and composition]

## Problem

What specific problem does this solve?

## Solution

High-level approach to solving the problem.

## Rabbit Holes

Potential complexity traps to avoid:

- [Risk 1]: [How to avoid]
- [Risk 2]: [Mitigation strategy]

## No-gos

What we explicitly won't do in this cycle."
            ;;
        "scrum")
            methodology_section="
## Sprint Goal

Clear, concise objective for this sprint.

## User Stories

### Story 1: [Title]

**As a** [user type]  
**I want** [goal]  
**So that** [benefit]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Definition of Done

- [ ] Code review completed
- [ ] Tests written and passing
- [ ] Documentation updated"
            ;;
        "kanban")
            methodology_section="
## Workflow States

```mermaid
graph LR
    Backlog --> Todo
    Todo --> InProgress[In Progress]
    InProgress --> Review
    Review --> Done
```

## Work in Progress Limits

- To Do: No limit
- In Progress: [X] items
- Review: [Y] items

## Definition of Done

- [ ] Requirements met
- [ ] Quality standards upheld"
            ;;
        *)
            methodology_section="
## Methodology: $METHODOLOGY

This document follows the $METHODOLOGY approach."
            ;;
    esac
fi

# Generate the document
cat > "$FILEPATH" << EOF
# $TITLE

Brief description of what this document covers.$methodology_section

## Overview

Provide context and background information here.

## Key Points

- Use proper list formatting with blank lines
- *Emphasize* important points with asterisks
- Maintain consistent structure throughout

## Implementation

When showing commands or code, always specify the language:

\`\`\`bash
# Example command
echo "Always use language specifications"
\`\`\`

\`\`\`text
Expected output or configuration examples
\`\`\`

## Results

Describe expected outcomes and success criteria.

## Next Steps

- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3

## Related Documentation

- [Link to related docs](url) - Brief description

---

*Created: $DATE*$([ -n "$METHODOLOGY" ] && echo "  
*Methodology: $METHODOLOGY*")
EOF

# Set executable permissions if this is a script
if [[ "$FILEPATH" =~ \.sh$ ]]; then
    chmod +x "$FILEPATH"
    print_info "Made script executable"
fi

print_status "Created $FILEPATH with professional formatting standards"

# Run linting check
if command -v npx >/dev/null 2>&1; then
    print_info "Running markdown lint check..."
    if npx markdownlint-cli2 --config .markdownlint-cli2.jsonc --no-globs "$FILEPATH" 2>/dev/null; then
        print_status "✅ Document passes all linting checks"
    else
        print_error "⚠️  Document has linting issues. Run: npx markdownlint-cli2 --config .markdownlint-cli2.jsonc --no-globs \"$FILEPATH\""
    fi
else
    print_info "Install markdownlint-cli2 to automatically validate new documents"
fi

print_info "Document ready for editing: $FILEPATH"