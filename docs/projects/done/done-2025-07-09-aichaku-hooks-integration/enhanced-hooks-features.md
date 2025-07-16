# Enhanced Hooks Features Specification

## 1. Parse Existing Hooks

### Requirement

Add ability to parse and display hooks that are already installed in
settings.json files.

### Implementation

```bash
# Show all hooks from both global and local settings
aichaku hooks --show

# Show only global hooks
aichaku hooks --show --global

# Show only local hooks  
aichaku hooks --show --local
```

### Display Format

```
🪴 Aichaku Hook Status

📍 Global Hooks (~/.claude/settings.json):
  ✓ Aichaku Path Validator (PreToolUse)
  ✓ OWASP Security Checker (PreToolUse)
  
📍 Local Hooks (.claude/settings.json):
  ✓ Methodology Detector (onSessionStart)
  ✓ Status Updater (PostToolUse)

Total: 4 hooks active
```

## 2. Global vs Local Installation

### Requirement

Support installing hooks either globally (all projects) or locally (current
project only).

### Implementation

```bash
# Install to global settings (default)
aichaku hooks --install basic --global

# Install to local project settings
aichaku hooks --install basic --local

# If no flag specified, prompt user
aichaku hooks --install basic
> Where would you like to install these hooks?
> 1. Globally (~/.claude/settings.json) - for all projects
> 2. Locally (.claude/settings.json) - for this project only
```

### Priority Rules

- Local hooks override global hooks with same name
- Both sets of hooks are active simultaneously
- Conflict detection warns about duplicates

## 3. Individual Hook Installation

### Requirement

Allow installing individual hooks rather than just category bundles.

### Implementation

```bash
# Install single hook
aichaku hooks --install-hook path-validator

# Install multiple individual hooks
aichaku hooks --install-hook path-validator,owasp-checker

# Interactive selection
aichaku hooks --install custom
> Select hooks to install (space to toggle, enter to confirm):
> [x] Path Validator
> [ ] Status Updater
> [x] OWASP Checker
> [ ] Methodology Detector
```

## 4. Restart Reminder

### Requirement

Remind users that Claude Code must be restarted for hook changes to take effect.

### Implementation

After any hook modification operation, display:

```
✅ Hooks successfully installed!

⚠️  IMPORTANT: You must restart Claude Code for these changes to take effect.
   
To restart Claude Code:
1. Type 'exit' in your current Claude session
2. Start a new Claude session
3. Your hooks will be active in the new session

Current hooks will remain inactive until restart.
```

### Additional Features

- Add `--no-reminder` flag to suppress the message
- Check if Claude is running and show appropriate message
- Add to all operations: install, remove, update

## 5. Implementation Priority

1. **Phase 1**: Parse existing hooks (read-only)
2. **Phase 2**: Global vs local installation
3. **Phase 3**: Restart reminder
4. **Phase 4**: Individual hook installation
5. **Phase 5**: Interactive selection UI

## 6. Technical Considerations

### Settings File Management

- Preserve existing settings when modifying
- Maintain proper JSON formatting
- Handle missing settings files gracefully
- Backup before modifications

### Path Resolution

- `~/.claude/settings.json` - Global settings
- `./.claude/settings.json` - Project settings
- Handle both Unix and Windows paths

### Error Handling

- File permissions issues
- Malformed JSON in existing settings
- Missing directories
- Conflicting hooks

---

_Specification created: 2025-01-13_
