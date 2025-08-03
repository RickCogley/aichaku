# Known Issues

This document tracks known issues with external tools and workarounds when working with the Aichaku codebase.

## Claude Code Tool Issues

### MultiEdit Tool Language Specifier Doubling (Likely User Error)

**Issue**: When using the MultiEdit tool to change code block language specifiers in Markdown files, the tool may
incorrectly double the language name (e.g., `jsonjson` instead of `json`).

**Status**: After analysis, this appears to be user error due to imprecise pattern matching rather than a tool bug.

**Affects**: Claude Code MultiEdit tool when editing Markdown code blocks with ambiguous patterns

**Example of the problem**:

```markdown
# Before (intended change):
```

→ ```json

# After (incorrect result):

```jsonjson
```

**Root Cause**: When using imprecise patterns that end exactly at the triple backticks without including what follows,
the MultiEdit tool may not have clear boundaries for the replacement, leading to unexpected concatenation.

**Prevention**:

1. Include more context in patterns (e.g., include the newline or content after the backticks)
2. For precise insertions at boundaries, use the Edit tool instead of MultiEdit
3. When using MultiEdit, ensure clear boundaries in both old_string and new_string
4. Example of better pattern:
   ````json
   { "old_string": "```\n{", "new_string": "```json\n{" }
   ````

**Workaround if it occurs**:

````typescript
// Fix doubled language specifiers
[{ "old_string": "```jsonjson", "new_string": "```json" }, { "old_string": "```tomltoml", "new_string": "```toml" }, {
  "old_string": "```yamlyaml",
  "new_string": "```yaml",
}];
````

**Status**: Likely user error - Will monitor if it recurs with proper patterns

**First Observed**: 2025-08-04 in docs/core/agent-templates/security-reviewer/base.md

**GitHub Issue**: [#2](https://github.com/RickCogley/aichaku/issues/2)

---

_To add new known issues, follow the format above with clear examples and workarounds._
