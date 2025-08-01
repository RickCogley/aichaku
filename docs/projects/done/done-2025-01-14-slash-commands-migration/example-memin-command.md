---
allowed-tools: Read, WebFetch(domain:github.com)
description: Load global and project memory files, with smart detection
---

# Load Memory Files

I'll load and analyze the relevant memory files for this session.

## 1. Global Memory

First, let me load the global memory file that applies to all projects:

@~/.claude/CLAUDE.md

## 2. Project Memory

Now checking for project-specific memory:

@CLAUDE.md

## 3. Additional Context

Let me also check for:

- Aichaku configuration: @.claude/aichaku/aichaku.json
- Project standards: @.claude/aichaku/standards.json

## Summary

Based on the memory files loaded, here are the key points to remember:

### Git Commit Rules

- NEVER add "Co-authored-by: Claude" or AI attribution
- Use conventional commits with InfoSec comments when needed
- Run preflight checks before committing

### Security Standards

- Always perform OWASP Top 10 verification
- Use proper DevSkim and CodeQL suppression syntax
- Document security decisions in commits

### Project-Specific Rules

$ARGUMENTS

---

💡 **Note**: This command now leverages:

- `@file` syntax to load files directly
- Smart fallbacks if files don't exist
- `$ARGUMENTS` for additional context (e.g., `/memin focus on security`)
- Structured output with clear sections
