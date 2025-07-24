# Hook Visibility Solution

## The Problem

- PostToolUse hooks run silently in Claude Code
- Output is not shown in the console
- Developers don't see that hooks are working

## Proposed Solution

### 1. Create a "feedback" PreToolUse hook

```typescript
// Runs BEFORE Write/Edit operations
async function aichakuFeedback(input: HookInput): Promise<void> {
  const filePath = input.tool * input?.file * path || input.tool_input?.path;

  if (filePath && typeof filePath === "string") {
    // Show what Aichaku is monitoring
    console.error(`🪴 Aichaku: Monitoring ${path.basename(filePath)}`);

    // Check if it's a project file
    if (filePath.includes("/docs/projects/active/")) {
      console.error(`   📁 Active project detected - will update STATUS.md`);
    }

    // Check if it's a markdown file
    if (filePath.endsWith(".md")) {
      console.error(`   📖 Documentation file - will review standards`);
    }

    // Check if it's TypeScript/JavaScript
    if (filePath.match(/\.(ts|js|tsx|jsx)$/)) {
      console.error(`   📚 Code file - will check JSDoc`);
    }
  }

  // Exit 0 to not block operation
  Deno.exit(0);
}
```

### 2. Use stderr for output

- Claude Code shows stderr output from hooks
- Use `console.error()` instead of `console.log()`

### 3. Keep PostToolUse hooks for actual work

- PreToolUse: Show what will happen
- PostToolUse: Do the actual work (silently)

## Implementation Plan

1. Add `aichaku-feedback` hook to PreToolUse
2. Update existing hooks to use stderr for critical messages
3. Test with different file types
4. Ensure developers see "🪴 Aichaku is working" messages
