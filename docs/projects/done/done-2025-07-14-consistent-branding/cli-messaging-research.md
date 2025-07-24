# CLI Messaging Standards Research

## Overview

CLI messages are a form of technical documentation that users interact with in
real-time. Applying documentation standards to CLI output creates better user
experiences.

## Key Standards and Guidelines

### 1. Command Line Interface Guidelines (clig.dev)

- **Human-first**: Write for humans, not parsers
- **Helpful errors**: Every error should suggest a solution
- **Quiet by default**: Only show what's necessary
- **Color with purpose**: Use color to enhance, not distract

### 2. GNU Coding Standards

- **Consistency**: Same terms throughout the program
- **Clarity**: Avoid jargon and abbreviations
- **Completeness**: Include all necessary information

### 3. POSIX Utility Conventions

- **Exit codes**: 0 for success, 1-125 for errors
- **Stderr vs stdout**: Errors to stderr, output to stdout
- **Quiet mode**: -q flag suppresses non-essential output
- **Verbose mode**: -v flag provides detailed information

### 4. Google's Technical Writing Principles Applied to CLI

- **Active voice**: "Creating file..." not "File is being created..."
- **Present tense**: For ongoing actions
- **Second person**: "Your project" not "The project"
- **Concise**: Every word should serve a purpose

## Message Type Standards

### Information Messages

- **Purpose**: Inform about current state or action
- **Tense**: Present progressive ("Checking...", "Loading...")
- **Detail**: Minimal by default, expanded with --verbose

### Success Messages

- **Purpose**: Confirm completion
- **Tense**: Past tense ("Created", "Updated")
- **Icon**: ✅ or similar positive indicator

### Error Messages

- **Purpose**: Explain failure and provide recovery path
- **Structure**: What failed + Why + How to fix
- **Example**: "Can't create directory: Permission denied. Try running with
  sudo."

### Warning Messages

- **Purpose**: Alert to potential issues
- **Action**: Always suggest what user should do
- **Icon**: ⚠️ to draw attention

## Implementation Patterns

### Progressive Disclosure

```
Default:     "Updated to v1.2.0"
Verbose:     "Updated to v1.2.0 (15 files changed)"
Debug:       "Updated to v1.2.0
              Files: 15 changed, 0 failed
              Duration: 2.3s
              Source: GitHub"
```

### Contextual Help

```
Error: "Unknown command 'inti'"
       Did you mean 'init'?

       Run 'aichaku help' for available commands.
```

### Structured Output Options

```
--format=human (default)
--format=json
--format=yaml
```

## Anti-Patterns to Avoid

1. **Chatty output**: Don't narrate every step
2. **Technical jargon**: Avoid internal error codes
3. **Dead-end errors**: Always provide next steps
4. **Inconsistent terminology**: Pick one term and stick to it
5. **Surprise changes**: Output format should be stable

## Testing Standards

- **Readability tests**: Can a new user understand?
- **Actionability tests**: Do errors guide to solution?
- **Consistency tests**: Same terms throughout?
- **Accessibility tests**: Works with screen readers?

## References

- [Command Line Interface Guidelines](https://clig.dev/)
- [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)
- [Google Technical Writing Guide](https://developers.google.com/tech-writing)
- [Microsoft Command-Line Syntax](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/command-line-syntax-key)
- [The Art of Command Line](https://github.com/jlevy/the-art-of-command-line)
