# Known Issues

This document tracks known issues with external tools and workarounds when working with the Aichaku codebase.

## Claude Code Tool Issues

### MultiEdit Tool Language Specifier Doubling

**Issue**: When using the MultiEdit tool to change code block language specifiers in Markdown files, the tool may
incorrectly double the language name (e.g., `jsonjson` instead of `json`).

**Affects**: Claude Code MultiEdit tool when editing Markdown code blocks

**Example of the problem**:

```markdown
# Before (intended change):
```

→ ```json

# After (incorrect result):

```jsonjson
```

**Root Cause**: The MultiEdit tool sometimes incorrectly concatenates adjacent text when making replacements near
Markdown code fence markers.

**Prevention**:

1. When editing code block language specifiers, use the Edit tool instead of MultiEdit for single changes
2. If using MultiEdit, ensure there's clear separation in the old_string pattern
3. Always verify Markdown code blocks after MultiEdit operations

**Workaround if it occurs**:

````typescript
// Fix doubled language specifiers
[{ "old_string": "```jsonjson", "new_string": "```json" }, { "old_string": "```tomltoml", "new_string": "```toml" }, {
  "old_string": "```yamlyaml",
  "new_string": "```yaml",
}];
````

**Status**: Open - Will report to Anthropic if it recurs

**First Observed**: 2025-08-04 in docs/core/agent-templates/security-reviewer/base.md

---

_To add new known issues, follow the format above with clear examples and workarounds._
