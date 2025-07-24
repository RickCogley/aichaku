# MCP + Aichaku Hooks Integration Guide

🪴 Aichaku: Automated Review Through Claude Code Hooks

## Overview

Claude Code hooks provide the perfect mechanism for automatic MCP reviews without explicit user commands.

## Hook Flow

```
File Save → PostToolUse Hook → MCP Review → Claude Sees Results → User Informed
                                     ↓
                              [If issues found]
                                     ↓
                         User asks: "Fix these issues"
                                     ↓
                            Create Fix PR → Claude Reviews → User Approves
```

## Integration Patterns

### 1. Basic Auto-Review

```json
// ~/.claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "name": "Aichaku MCP Auto Review",
        "description": "Automatically review files after editing",
        "matcher": "Write|Edit|MultiEdit",
        "command": "mcp-code-reviewer review --file \"${TOOL*INPUT*FILE_PATH}\""
      }
    ]
  }
}
```

### 2. Smart Conditional Review

```bash
#!/bin/bash
# ~/.claude/hooks/smart-mcp-review.sh

FILE="$1"
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# Check if file should be reviewed
should_review() {
  case "$FILE" in
    *.test.*|*.spec.*) return 1 ;;  # Skip test files
    *.md) return 1 ;;                # Skip markdown
    *.ts|*.js|*.py|*.go) return 0 ;; # Review code files
    *) return 1 ;;
  esac
}

if should_review; then
  # Check project standards
  if [[ -f "$PROJECT_ROOT/.claude/.aichaku-standards.json" ]]; then
    mcp-code-reviewer review \
      --file "$FILE" \
      --project "$PROJECT_ROOT" \
      --format brief
  fi
fi
```

### 3. Pre-Commit Comprehensive Review

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "name": "MCP Pre-commit Review",
        "matcher": "Bash(git commit)",
        "command": "bash -c 'if ! mcp-code-reviewer check-staged --strict; then echo \"❌ Review failed - fix issues before committing\"; exit 1; fi'"
      }
    ]
  }
}
```

## Advanced Hook Patterns

### 1. Progressive Review (Performance Optimized)

```typescript
// Hook that escalates based on findings
const progressiveReviewHook = {
  name: "Progressive MCP Review",
  command: `bash -c '
    # Quick pattern scan first
    QUICK=$(mcp-code-reviewer quick-scan "$TOOL*INPUT*FILE_PATH")
    
    if [[ $QUICK == *"HIGH"* ]]; then
      # Full scan for high-severity issues
      mcp-code-reviewer deep-scan "$TOOL*INPUT*FILE_PATH"
    elif [[ $QUICK == *"MEDIUM"* ]]; then
      # Standard scan
      mcp-code-reviewer review "$TOOL*INPUT*FILE_PATH"
    fi
  '`,
};
```

### 2. Methodology-Aware Reviews

```bash
#!/bin/bash
# Hook that detects methodology and reviews accordingly

FILE="$1"
FILENAME=$(basename "$FILE")

case "$FILENAME" in
  pitch.md)
    mcp-code-reviewer review \
      --file "$FILE" \
      --methodology shape-up \
      --check appetite,completeness
    ;;
  sprint-planning.md)
    mcp-code-reviewer review \
      --file "$FILE" \
      --methodology scrum \
      --check goals,estimation
    ;;
  *.ts|*.js)
    mcp-code-reviewer review \
      --file "$FILE" \
      --standards "$(cat .claude/.aichaku-standards.json | jq -r '.selected[]')"
    ;;
esac
```

### 3. Review with Fix Suggestions (No Auto-PR)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "name": "MCP Security Review with Fixes",
        "matcher": "Write|Edit",
        "command": "bash -c 'RESULT=$(mcp-code-reviewer review \"$TOOL*INPUT*FILE_PATH\" --suggest-fixes); if [[ $(echo $RESULT | jq \".summary.critical + .summary.high\") -gt 0 ]]; then echo \"⚠️ High severity issues found - ask Claude to create a fix PR if needed\"; fi'"
      }
    ]
  }
}
```

**Note**: PR creation is ALWAYS manual. The hook can suggest fixes but won't create PRs automatically. Users must
explicitly ask: "Create a PR to fix these issues".

## Installation Commands

### 1. Install MCP Reviewer

```bash
# Install compiled binary
curl -fsSL https://aichaku.dev/install-mcp.sh | sh

# Or via npm
npm install -g @aichaku/mcp-code-reviewer
```

### 2. Install Aichaku Hooks

```bash
# Install MCP integration hooks
aichaku hooks --install mcp-review

# This creates:
# - Basic auto-review hook
# - Pre-commit validation hook
# - Smart conditional review hook
```

### 3. Configure Standards

```bash
# Select standards for automatic review
aichaku standards --add owasp-web,15-factor,tdd

# Integrate with CLAUDE.md
aichaku integrate

# MCP will now use these standards automatically
```

## Hook Templates from Aichaku

When you run `aichaku hooks --install mcp-review`, it creates:

### 1. mcp-auto-review

```json
{
  "name": "Aichaku MCP Auto Review",
  "type": "PostToolUse",
  "matcher": "Write|Edit|MultiEdit",
  "command": "mcp-review-trigger \"${TOOL*INPUT*FILE_PATH}\" --auto"
}
```

### 2. mcp-pre-commit

```json
{
  "name": "Aichaku MCP Pre-commit",
  "type": "PreToolUse",
  "matcher": "Bash(git commit)",
  "command": "mcp-review-trigger --pre-commit --fail-on-high"
}
```

### 3. mcp-smart-review

```json
{
  "name": "Aichaku MCP Smart Review",
  "type": "PostToolUse",
  "matcher": "Write|Edit",
  "command": "~/.claude/hooks/aichaku-smart-review.sh \"${TOOL*INPUT*FILE_PATH}\""
}
```

## Performance Considerations

### 1. Debouncing

```bash
# Prevent multiple reviews on rapid saves
LAST_REVIEW="/tmp/mcp-last-review-$(echo $FILE | md5)"
if [[ -f "$LAST_REVIEW" ]]; then
  LAST*TIME=$(stat -f %m "$LAST*REVIEW" 2>/dev/null || stat -c %Y "$LAST_REVIEW")
  NOW=$(date +%s)
  if (( NOW - LAST_TIME < 5 )); then
    exit 0  # Skip if reviewed within 5 seconds
  fi
fi
touch "$LAST_REVIEW"
```

### 2. Incremental Review

```bash
# Only review changed portions
mcp-code-reviewer review \
  --file "$FILE" \
  --incremental \
  --baseline "$(git rev-parse HEAD)"
```

### 3. Background Processing

```bash
# Non-blocking review
{
  mcp-code-reviewer review "$FILE" \
    --output ~/.claude/reviews/$(date +%s).json \
    --notify-on-high &
} 2>/dev/null
```

## Troubleshooting

### Hook Not Triggering

```bash
# Check hook is registered
cat ~/.claude/settings.json | jq '.hooks'

# Test hook manually
TOOL*INPUT*FILE_PATH="test.ts" bash -c 'your-hook-command'
```

### MCP Not Found

```bash
# Verify MCP is in PATH
which mcp-code-reviewer

# Add to PATH if needed
export PATH="$PATH:~/.claude/bin"
```

### Performance Issues

```bash
# Use lightweight mode
mcp-code-reviewer config set mode lightweight

# Disable certain scanners
mcp-code-reviewer config disable codeql
```

## Best Practices

1. **Start Simple**: Begin with basic post-save reviews
2. **Add Gradually**: Layer on pre-commit and smart reviews
3. **Monitor Performance**: Use time limits and debouncing
4. **Customize by Project**: Different hooks for different projects
5. **User Control**: Always provide opt-out mechanisms

## Future Enhancements

1. **Hook Conditions**: Review based on file patterns, project type
2. **Review Caching**: Skip unchanged files
3. **Team Sharing**: Shared hook configurations
4. **AI Learning**: Hooks that adapt based on user preferences
