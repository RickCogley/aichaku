# CLI Testing Framework - Shape Up Pitch

## Problem

Yesterday's release exposed a critical gap in our testing strategy. Despite "extensive testing," we shipped with a
broken `--show <id>` feature in the principles command. The regression revealed that our current testing approach has
serious blind spots:

1. **Weak Assertions**: Tests only verified that text appeared somewhere in output, not that the correct command was
   executed
2. **Missing Coverage**: No tests for methodologies/standards commands
3. **Argument Parsing Gaps**: No tests for how parseArgs handles different flag combinations
4. **False Confidence**: Manual testing reported "everything works" but missed basic functionality

The user's feedback was clear: "It's embarrassing to release software after having been told everything is tested
successfully, only to have it not be working."

## Appetite

**6 weeks** - This is critical infrastructure that blocks confident releases. We need comprehensive testing before the
next release.

## Solution

### Three-Layer Testing Strategy

#### 1. Argument Parsing Tests (Week 1-2)

Test every valid argument combination for parseArgs configuration:

```typescript
// test-argument-parsing.ts
describe("CLI Argument Parsing", () => {
  it("parses --show as boolean when bare", () => {
    const args = parseArgs(["principles", "--show"], config);
    assertEquals(args.show, true);
  });

  it("parses --show with value as string", () => {
    const args = parseArgs(["principles", "--show", "unix-philosophy"], config);
    assertEquals(args.show, "unix-philosophy");
  });

  it("parses --show=value as string", () => {
    const args = parseArgs(["principles", "--show=unix-philosophy"], config);
    assertEquals(args.show, "unix-philosophy");
  });
});
```

#### 2. Command Output Tests (Week 3-4)

Test exact output with both positive and negative assertions:

```typescript
// principles-command.test.ts
describe("principles --show <id>", () => {
  it("shows specific principle details, NOT current selection", async () => {
    const output = await captureOutput(() => principles({ show: "unix-philosophy" }));

    // Positive assertions - what SHOULD appear
    assertContains(output, "Unix Philosophy");
    assertContains(output, "Write programs that do one thing");
    assertContains(output, "Compatibility:");

    // Negative assertions - what should NOT appear
    assertNotContains(output, "Current Principle Selection");
    assertNotContains(output, "Project follows");
    assertNotContains(output, "Managing Principles");
  });
});
```

#### 3. Integration Tests (Week 5-6)

Full CLI execution tests:

```typescript
// cli-integration.test.ts
describe("CLI Integration", () => {
  it("executes principles --show unix-philosophy correctly", async () => {
    const result = await runCLI(["principles", "--show", "unix-philosophy"]);

    assertEquals(result.exitCode, 0);
    assertContains(result.stdout, "Unix Philosophy");
    assertNotContains(result.stdout, "Current Principle Selection");
    assertEquals(result.stderr, "");
  });
});
```

### Test Coverage Requirements

#### Principles Command

- [ ] `aichaku principles` (bare) - shows help
- [ ] `aichaku principles --list` - lists all principles
- [ ] `aichaku principles --list --category software-development`
- [ ] `aichaku principles --show` - shows current selection
- [ ] `aichaku principles --show unix-philosophy` - shows specific principle
- [ ] `aichaku principles --show unix-philosophy --verbose`
- [ ] `aichaku principles --add dry,kiss`
- [ ] `aichaku principles --remove dry`
- [ ] `aichaku principles --clear`
- [ ] `aichaku principles --compatibility dry,kiss`

#### Methodologies Command

- [ ] `aichaku methodologies` (bare) - shows help
- [ ] `aichaku methodologies --list`
- [ ] `aichaku methodologies --show` - shows current selection
- [ ] `aichaku methodologies --add shape-up`
- [ ] `aichaku methodologies --remove shape-up`
- [ ] `aichaku methodologies --set scrum`
- [ ] `aichaku methodologies --reset`
- [ ] `aichaku methodologies --search agile`

#### Standards Command

- [ ] `aichaku standards` (bare) - shows help
- [ ] `aichaku standards --list`
- [ ] `aichaku standards --show` - shows current selection
- [ ] `aichaku standards --add owasp-web,tdd`
- [ ] `aichaku standards --remove tdd`
- [ ] `aichaku standards --categories`
- [ ] `aichaku standards --search security`

### Implementation Plan

#### Week 1-2: Foundation

- Set up test infrastructure with output capture utilities
- Create argument parsing test suite
- Fix the immediate `--show` regression with proper parseArgs config

#### Week 3-4: Command Tests

- Implement comprehensive command output tests
- Add negative assertions to prevent wrong behavior
- Test error cases and edge conditions

#### Week 5-6: Integration & Polish

- Full CLI integration test suite
- CI/CD integration
- Documentation and runbook for adding new tests

## Rabbit Holes

1. **Over-engineering the test framework** - Use Deno's built-in testing, don't build a custom framework
2. **Testing implementation details** - Focus on user-visible behavior, not internals
3. **100% code coverage** - Aim for 100% command coverage, not line coverage
4. **Complex test data** - Use simple, focused test cases

## No-gos

1. **GUI/TUI testing** - CLI only
2. **Network tests** - Mock external dependencies
3. **Third-party integration tests** - Test our code, not theirs
4. **Changing CLI interface** - Fix bugs, don't redesign
5. **Public testing API** - Internal use only

## Success Criteria

1. No CLI command can be released without comprehensive tests
2. All regressions from yesterday are fixed and tested
3. CI/CD runs all tests before allowing release
4. Confidence in releases restored - no more embarrassing bugs

## Example: How This Would Have Caught The Bug

The `--show <id>` regression would have been caught by:

```typescript
it("principles --show <id> shows principle details", async () => {
  const output = await runCLI(["principles", "--show", "agile-manifesto"]);

  // This would FAIL with current bug (shows current selection instead)
  assertContains(output, "Agile Manifesto");
  assertContains(output, "Individuals and interactions");

  // This would CATCH the bug (current selection should NOT appear)
  assertNotContains(output, "Current Principle Selection");
});
```

## Next Steps

1. Fix the immediate parseArgs configuration issue
2. Create test structure and utilities
3. Write tests for all command variations
4. Integrate with CI/CD
5. Document test patterns for future commands
