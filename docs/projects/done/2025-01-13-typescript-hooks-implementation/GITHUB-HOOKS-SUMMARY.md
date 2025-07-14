# GitHub Hooks Integration Summary

## What Was Added

I've created a new **"github"** category for hooks that provides GitHub workflow automation and best practices. This allows users to install all GitHub-related hooks with a single command.

## Installation

Users can now install all GitHub hooks as a set:

```bash
# Install all GitHub integration hooks globally
aichaku hooks --install github --global

# Install all GitHub hooks locally for current project
aichaku hooks --install github --local

# Or install individually
aichaku hooks --install todo-tracker --global
aichaku hooks --install pr-checker,issue-linker --local
```

## The GitHub Hook Set

The `github` category includes 5 hooks:

### 1. `todo-tracker`
- **Type**: PostToolUse (Write|Edit|MultiEdit)
- **Purpose**: Detects when you edit code/markdown files and suggests creating GitHub issues from TODOs
- **Features**: Promotes proper TODO formatting like `TODO(#123)` or `TODO(security): Fix auth`

### 2. `pr-checker`
- **Type**: SessionStart
- **Purpose**: Runs when you start Claude Code to check active PR context
- **Tips**: View PR status, check CI before changes, update PR descriptions

### 3. `issue-linker`
- **Type**: PreToolUse (Bash)
- **Purpose**: Detects git commit commands and reminds to link commits to issues
- **Syntax**: Shows proper formats like "Fixes #123" or "Refs #123"

### 4. `workflow-monitor`
- **Type**: PostToolUse (Write|Edit|MultiEdit)
- **Purpose**: Activates when editing `.github/workflows/` files
- **Guidance**: Test locally with `act`, validate syntax, handle secrets properly

### 5. `release-helper`
- **Type**: PostToolUse (Write|Edit|MultiEdit)
- **Purpose**: Detects version bumps in package.json, Cargo.toml, etc.
- **Checklist**: Update CHANGELOG, create release notes, tag versions

## Updated Files

1. **`/Users/rcogley/dev/aichaku/src/commands/hooks.ts`**:
   - Added `github` category to `HOOK_CATEGORIES`
   - Added all 5 GitHub hook templates to `HOOK_TEMPLATES`
   - Updated help text to show the new category

2. **`/Users/rcogley/.claude/aichaku/hooks/aichaku-hooks.ts`**:
   - Added 5 new hook functions
   - Added cases to the switch statement
   - All hooks provide helpful GitHub-related suggestions

## Benefits

1. **Easy Installation**: One command installs all GitHub-related hooks
2. **Workflow Integration**: Hooks activate at the right moments in your workflow
3. **MCP Ready**: Designed to work with GitHub MCP servers for automation
4. **Best Practices**: Gentle reminders for GitHub conventions and workflows

## Usage Example

```bash
# See available hook sets
aichaku hooks --list

# Install GitHub hooks globally  
aichaku hooks --install github --global

# Verify installation
aichaku hooks --show

# Start coding - hooks will activate automatically!
```

The hooks provide contextual suggestions but don't interfere with your workflow. They're designed to enhance productivity when working with GitHub repositories.