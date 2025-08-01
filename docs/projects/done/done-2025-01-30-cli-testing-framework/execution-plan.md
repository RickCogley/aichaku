# CLI Testing Framework - Execution Plan

## Week 1: Immediate Fixes & Foundation

### Day 1-2: Fix the Regression

1. **Fix parseArgs configuration**
   ```typescript
   // Add "show" to string array while keeping it in boolean
   string: [
     // ... existing
     "show", // Support --show <value>
   ];
   ```

2. **Manual verification checklist** (before any code changes):
   ```bash
   # Principles
   aichaku principles --show                    # Should show current selection
   aichaku principles --show agile-manifesto    # Should show principle details
   aichaku principles --show=agile-manifesto    # Should work but NOT documented for users

   # Methodologies  
   aichaku methodologies --show                 # Should show current selection
   aichaku methodologies --show shape-up        # Should error (not supported)

   # Standards
   aichaku standards --show                     # Should show current selection
   aichaku standards --show owasp-web          # Should error (not supported)
   ```

   **Note**: The `--show=value` syntax works due to parseArgs behavior but should NOT be documented in help text or
   examples. Only document `--show value` syntax.

3. **Audit other dual-use flags**
   - Search for flags that might need both boolean/string behavior
   - Document the pattern for future reference

### Day 3-5: Test Infrastructure

```typescript
// tests/utils/cli-test-helpers.ts
export async function captureOutput(fn: () => Promise<void>): Promise<string> {
  // Capture console.log output
}

export async function runCLI(args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  // Run CLI and capture output
}

export function assertContains(output: string, expected: string) {
  if (!output.includes(expected)) {
    throw new Error(`Expected output to contain "${expected}"`);
  }
}

export function assertNotContains(output: string, unexpected: string) {
  if (output.includes(unexpected)) {
    throw new Error(`Output should not contain "${unexpected}"`);
  }
}
```

## Week 2: Argument Parsing Tests

### Create tests/cli-argument-parsing.test.ts

```typescript
describe("parseArgs configuration", () => {
  // Test every flag that appears in both boolean and string arrays

  describe("--show flag", () => {
    it("parses as true when bare", () => {
      const args = parseArgs(["principles", "--show"], config);
      assertEquals(args.show, true);
    });

    it("parses as string when given value", () => {
      const args = parseArgs(["principles", "--show", "unix-philosophy"], config);
      assertEquals(args.show, "unix-philosophy");
    });

    it("parses as string with = syntax", () => {
      // Test that = syntax works but don't document it for users
      const args = parseArgs(["principles", "--show=unix-philosophy"], config);
      assertEquals(args.show, "unix-philosophy");
    });
  });
});
```

## Week 3-4: Command Output Tests

### Principles Command Tests (tests/commands/principles.test.ts)

```typescript
describe("principles command", () => {
  describe("bare command", () => {
    it("shows help when no args", async () => {
      const output = await captureOutput(() => principles({}));
      assertContains(output, "Aichaku Principles - Guiding Philosophies");
      assertContains(output, "Usage");
      assertContains(output, "--list");
    });
  });

  describe("--show variations", () => {
    it("shows current selection when bare --show", async () => {
      const output = await captureOutput(() => principles({ show: true }));
      assertContains(output, "Current Principle Selection");
      assertNotContains(output, "Usage"); // Not help
      assertNotContains(output, "Compatibility:"); // Not principle details
    });

    it("shows principle details for --show <id>", async () => {
      const output = await captureOutput(() => principles({ show: "unix-philosophy" }));
      assertContains(output, "Unix Philosophy");
      assertContains(output, "Write programs that do one thing");
      assertContains(output, "Compatibility:");
      assertNotContains(output, "Current Principle Selection");
      assertNotContains(output, "Managing Principles");
    });

    it("handles non-existent principle gracefully", async () => {
      const output = await captureOutput(() => principles({ show: "not-a-real-principle" }));
      assertContains(output, "Principle not found");
    });
  });

  // ... tests for all other flags
});
```

### Test Matrix for All Commands

| Command       | Flag     | Bare Behavior     | With Value        | Test Priority |
| ------------- | -------- | ----------------- | ----------------- | ------------- |
| principles    | --show   | Current selection | Principle details | **CRITICAL**  |
| principles    | --list   | All principles    | N/A               | High          |
| principles    | --add    | N/A               | Add principles    | High          |
| principles    | --remove | N/A               | Remove principles | Medium        |
| principles    | --clear  | Clear all         | N/A               | Medium        |
| methodologies | --show   | Current selection | N/A               | High          |
| methodologies | --list   | All methodologies | N/A               | High          |
| methodologies | --add    | N/A               | Add methodology   | High          |
| methodologies | --set    | N/A               | Replace all       | Medium        |
| standards     | --show   | Current selection | N/A               | High          |
| standards     | --list   | All standards     | N/A               | High          |
| standards     | --add    | N/A               | Add standards     | High          |

## Week 5-6: Integration Tests

### CLI Integration Tests (tests/cli-integration.test.ts)

```typescript
describe("CLI integration", () => {
  it("principles --show agile-manifesto via CLI", async () => {
    const result = await runCLI(["principles", "--show", "agile-manifesto"]);

    assertEquals(result.exitCode, 0);
    assertContains(result.stdout, "Agile Manifesto");
    assertContains(result.stdout, "Individuals and interactions");
    assertNotContains(result.stdout, "Current Principle Selection");
  });

  // Test every command variant from the matrix above
});
```

### CI/CD Integration (.GitHub/workflows/test.yml)

```yaml
name: CLI Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: denoland/setup-deno@v1
      - run: deno test --allow-all
      - run: deno run --allow-all tests/cli-integration.test.ts
```

## Definition of Done

1. **Regression Fixed**: `aichaku principles --show agile-manifesto` shows principle details
2. **All Tests Pass**: 100% of command variants have passing tests
3. **No False Positives**: Negative assertions prevent wrong behavior
4. **Fast Execution**: Full test suite runs in < 30 seconds
5. **CI/CD Integrated**: Tests run automatically on every push
6. **Documentation**: Clear patterns for adding new tests

## Testing Checklist Before Release

- [ ] Run full test suite: `deno test --allow-all`
- [ ] Manual smoke test of top 10 commands
- [ ] Check all --help outputs
- [ ] Verify error messages are helpful
- [ ] Test on fresh installation
- [ ] Test upgrade path from previous version
