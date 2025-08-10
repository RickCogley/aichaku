#!/bin/bash

# Script to add Truth Protocol to remaining agents

add_truth_protocol() {
  local agent=$1
  local risk_level=$2
  local description=$3
  local file="docs/core/agent-templates/$agent/base.md"
  
  echo "Adding Truth Protocol to $agent..."
  
  # Create temporary file with Truth Protocol section
  cat > /tmp/truth-protocol-$agent.txt << 'EOF'
## Truth Protocol Implementation

**$RISK_LEVEL: $DESCRIPTION**

### Verification Requirements

1. **File Operations**: After creating or modifying ANY file:
   - Use Read tool to verify file exists
   - Report absolute path and file size
   - Never claim success without verification

2. **Command Execution**: When running commands:
   - Capture and report actual output
   - Don't assume success without checking exit codes
   - Report errors honestly

3. **State Changes**: For any system state modification:
   - Verify the change actually occurred
   - Report the actual state, not assumed state
   - Use specific verification methods appropriate to the change

### Response Patterns

**❌ PROHIBITED - No Verification:**
```
I've updated the configuration file with the new settings.
```

**✅ REQUIRED - With Verification:**
```
✅ Updated and verified: /path/to/config.yaml (1,234 bytes)
Configuration changes:
- Added database connection settings
- Updated port to 8080
- Enabled debug mode
```

### Verification Commitment

This agent commits to:
- Never claiming file operations without verification
- Always reporting actual results, not assumptions
- Being transparent about failures and limitations
- Using guided testing for complex validations

EOF

  # Replace placeholders
  sed -i '' "s/\$RISK_LEVEL/$risk_level/g" /tmp/truth-protocol-$agent.txt
  sed -i '' "s/\$DESCRIPTION/$description/g" /tmp/truth-protocol-$agent.txt
  
  # Find where to insert (after the agent description, before first ##)
  # We'll insert after the introductory paragraph
  
  # Get the line number of the first "## " heading after the YAML frontmatter
  local first_heading=$(grep -n "^## " "$file" | head -1 | cut -d: -f1)
  
  if [ -n "$first_heading" ]; then
    # Insert before the first heading
    local insert_line=$((first_heading - 1))
    
    # Create new file with Truth Protocol inserted
    head -n $insert_line "$file" > /tmp/new-$agent.md
    echo "" >> /tmp/new-$agent.md
    cat /tmp/truth-protocol-$agent.txt >> /tmp/new-$agent.md
    echo "" >> /tmp/new-$agent.md
    tail -n +$((first_heading)) "$file" >> /tmp/new-$agent.md
    
    # Replace original file
    mv /tmp/new-$agent.md "$file"
    echo "✅ Added Truth Protocol to $agent"
  else
    echo "❌ Could not find insertion point for $agent"
  fi
  
  rm -f /tmp/truth-protocol-$agent.txt
}

# Add Truth Protocol to each agent with appropriate risk level and description

# High-risk agents (lots of file operations)
add_truth_protocol "api-architect" "MEDIUM RISK" "Creates API specifications and documentation files"
add_truth_protocol "deno-expert" "HIGH RISK" "Creates and modifies Deno configuration and code files"
add_truth_protocol "golang-expert" "MEDIUM RISK" "Creates and modifies Go code files"
add_truth_protocol "python-expert" "MEDIUM RISK" "Creates and modifies Python code files"
add_truth_protocol "react-expert" "HIGH RISK" "Creates and modifies React components and configurations"
add_truth_protocol "vento-expert" "MEDIUM RISK" "Creates and modifies template files"
add_truth_protocol "lume-expert" "MEDIUM RISK" "Creates and modifies static site files"

# Medium-risk agents (some file operations)
add_truth_protocol "postgres-expert" "MEDIUM RISK" "Creates SQL files and migration scripts"
add_truth_protocol "tailwind-expert" "LOW RISK" "Modifies CSS configuration files"
add_truth_protocol "security-reviewer" "MEDIUM RISK" "Creates security reports and documentation"

# Low-risk agents (mostly advisory)
add_truth_protocol "code-explorer" "LOW RISK" "Primarily reads and analyzes files"
add_truth_protocol "methodology-coach" "LOW RISK" "Primarily advisory with occasional documentation"
add_truth_protocol "principle-coach" "LOW RISK" "Primarily advisory and educational"

echo "Done! Added Truth Protocol to all agents."