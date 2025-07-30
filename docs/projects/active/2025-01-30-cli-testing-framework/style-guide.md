# CLI Testing Style Guide

## Command Syntax Documentation

### User-Facing Documentation Rules

1. **Only document the space-separated syntax** for flags with values:
   - ✅ CORRECT: `aichaku principles --show unix-philosophy`
   - ❌ AVOID: `aichaku principles --show=unix-philosophy`

2. **Rationale**: While parseArgs supports both syntaxes, we want to maintain consistency and simplicity in our
   documentation. The `=` syntax adds unnecessary complexity for users.

3. **Testing**: We SHOULD test that both syntaxes work (for robustness), but only document one.

### Examples in Documentation

```bash
# Help text should show:
aichaku principles --show <id>          # ✅ Correct
aichaku principles --show=<id>          # ❌ Don't document this

# Examples should use:
aichaku principles --show unix-philosophy    # ✅ Correct
aichaku principles --show=unix-philosophy    # ❌ Don't show this
```

### Internal Testing

```typescript
// Test both syntaxes internally for robustness
it("supports both --flag value and --flag=value syntax", () => {
  // Test space-separated (documented)
  const args1 = parseArgs(["--show", "unix-philosophy"]);
  assertEquals(args1.show, "unix-philosophy");

  // Test equals syntax (undocumented but supported)
  const args2 = parseArgs(["--show=unix-philosophy"]);
  assertEquals(args2.show, "unix-philosophy");
});
```

## Help Text Patterns

### Consistent Flag Documentation

```typescript
// In help text generation
const helpText = `
Options:
  --show              Show currently selected items
  --show <id>         Show details about a specific item
  --add <ids>         Add items (comma-separated)
  --remove <ids>      Remove items (comma-separated)
`;
```

Never show:

- `--show=<id>`
- `--add=<ids>`
- Multiple syntax options for the same flag

## Test Assertion Patterns

### Negative Assertions Are Critical

```typescript
// Always include what should NOT appear
it("shows principle details, not current selection", async () => {
  const output = await runCommand(["principles", "--show", "dry"]);

  // Positive assertions
  assertContains(output, "DRY (Don't Repeat Yourself)");

  // Negative assertions - CRITICAL for catching regressions
  assertNotContains(output, "Current Principle Selection");
  assertNotContains(output, "Managing Principles");
});
```

### Command Behavior Matrix

Document expected behavior clearly:

| Command    | Flag   | Input  | Expected Output       | Should NOT Contain  |
| ---------- | ------ | ------ | --------------------- | ------------------- |
| principles | --show | (bare) | Current selection     | "Usage", "Options"  |
| principles | --show | dry    | DRY principle details | "Current Principle" |
| principles | (bare) | none   | Help text             | Principle details   |

## Error Message Standards

### Helpful Error Messages

```typescript
// When principle not found
"❌ Principle 'not-found' does not exist. Run 'aichaku principles --list' to see available principles.";

// Not just:
"Principle not found";
```

### Suggest Next Actions

Always provide a path forward:

- Show available options
- Suggest the correct command
- Reference help with specific flags
