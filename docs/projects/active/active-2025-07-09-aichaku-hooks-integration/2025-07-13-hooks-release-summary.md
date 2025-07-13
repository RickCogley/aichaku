# Aichaku Hooks Feature - Release Summary

## Overview
The Aichaku hooks feature provides automated workflow enhancements through Claude Code's hook system. Users can now install pre-configured hooks that automatically trigger during their development workflow.

## Key Features Implemented

### 1. Reorganized Hook Categories
- **Essential** (4 hooks): Must-have hooks for Claude+Aichaku workflow
  - `conversation-summary`: Auto-saves conversation summaries on Stop and PreCompact events
  - `path-validator`: Ensures files are created in correct directories
  - `status-updater`: Auto-updates STATUS.md when project files change
  - `code-review`: Reviews code after edits using Aichaku MCP
  
- **Productivity** (4 hooks): Workflow enhancers
  - `template-validator`: Validates methodology document templates
  - `diagram-generator`: Ensures Mermaid diagrams are present
  - `progress-tracker`: Tracks sprint/cycle progress
  - `commit-validator`: Ensures conventional commit format

- **Security** (2 hooks): Compliance and safety checks
  - `owasp-checker`: Reminds about OWASP Top 10 considerations
  - `sensitive-file-guard`: Prevents accidental modification of sensitive files

### 2. Enhanced CLI Commands

#### Show Installed Hooks
```bash
aichaku hooks --show
```
Displays all installed Aichaku hooks from both global (`~/.claude/settings.json`) and local (`.claude/settings.json`) configurations.

#### List Available Hooks
```bash
aichaku hooks --list
```
Shows all available hooks with descriptions and installation commands at the bottom.

#### Install Hooks
```bash
# Install hook sets
aichaku hooks --install essential --global
aichaku hooks --install productivity --local

# Install individual hooks
aichaku hooks --install conversation-summary,code-review --local
```

#### Location Control
- `--global`: Install to `~/.claude/settings.json` (all projects)
- `--local`: Install to `.claude/settings.json` (current project only)
- Interactive prompts when no location specified

### 3. Conversation Summary Hook
Special implementation using script-based approach (as recommended by Anthropic support):
- Automatically installs `summarize-conversation.ts` script
- Receives transcript data via stdin
- Creates summaries in `docs/checkpoints/` directory
- Works for both Stop and PreCompact events

### 4. User Experience Improvements
- Restart reminder after all hook operations
- Clear feedback during installation/removal
- Dry-run support for previewing changes
- Comprehensive documentation in README.md

## Technical Implementation Details

### Fixed Issues
1. **Removed unused methodology-detector hook** - Was setting AICHAKU_MODE environment variable that was never used
2. **Script-based hooks** - Implemented proper script approach instead of simple echo commands
3. **Test file naming** - Renamed `test-review.ts` to `test-review_test.ts` to follow conventions and fix security scan issues

### Security Considerations
- Path validation to prevent directory traversal
- JSON parsing with comment removal for settings.json
- Proper error handling and user feedback

## Usage Examples

### Quick Start
```bash
# Install essential hooks globally
aichaku hooks --install essential --global

# Check what's installed
aichaku hooks --show

# Restart Claude Code to activate hooks
```

### Project-Specific Setup
```bash
# Install hooks for current project only
aichaku hooks --install essential,productivity --local

# View available hooks
aichaku hooks --list
```

## Benefits
1. **Automated Workflow** - Hooks run automatically during Claude Code sessions
2. **Conversation Preservation** - Never lose context with automatic summaries
3. **Quality Enforcement** - Path validation and code review ensure best practices
4. **Flexibility** - Choose global or project-specific installations
5. **Easy Management** - Simple CLI commands for all operations

## Important Notes
- Users must restart Claude Code after installing/removing hooks
- Hooks are stored in Claude's settings.json format
- The conversation-summary script is automatically installed when needed
- All hooks follow security best practices with proper input validation

This feature significantly enhances the Claude+Aichaku development experience by automating common tasks and ensuring best practices are followed throughout the development workflow.