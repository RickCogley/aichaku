# Verification Requirements

## Core Principle

**Never claim without proof.** Every assertion must be verifiable and verified.

## Verification Levels

### Level 1: Existence (MANDATORY)

Minimum viable verification - does it exist?

| Operation        | Verification Required    | Method                                        |
| ---------------- | ------------------------ | --------------------------------------------- |
| File Write       | File exists at path      | `fs.exists(path)`                             |
| File Edit        | File exists with changes | `fs.exists(path) && content.includes(change)` |
| Directory Create | Directory exists         | `fs.exists(path) && fs.isDirectory(path)`     |
| File Delete      | File no longer exists    | `!fs.exists(path)`                            |

### Level 2: Content (MANDATORY for documents)

For user-facing documents - is there real content?

| Check           | Requirement                | Example                          |
| --------------- | -------------------------- | -------------------------------- |
| Not empty       | Length > 0                 | `content.length > 0`             |
| Not placeholder | No "TODO" as only content  | `!content.match(/^TODO$/m)`      |
| Has structure   | Contains expected sections | `content.includes('## Problem')` |

### Level 3: Behavior (GUIDED)

For features - does it work? (Human verification required)

| Feature Type | Verification Approach   | Example                                                 |
| ------------ | ----------------------- | ------------------------------------------------------- |
| CLI Command  | Guide user to test      | "Run `aichaku --version` and tell me the output"        |
| Integration  | Step-by-step validation | "1. Check git remote\n2. Make commit\n3. Observe hooks" |
| API          | Request/response check  | "Call POST /api/users and verify 201 response"          |

## Verification Points

### 1. Immediate Verification

Right after the operation, before returning to orchestrator:

```typescript
// REQUIRED pattern for all agents
async function performOperation() {
  // Do the work
  const result = await doSomething();

  // Verify immediately
  if (!await verify(result)) {
    throw new Error("Verification failed: " + details);
  }

  // Only then report success
  return "Successfully completed and verified: " + result;
}
```

### 2. Orchestrator Checkpoint

Before passing agent response to user:

```typescript
// Orchestrator verification
function validateAgentResponse(response: AgentResponse) {
  // Extract claims
  const claims = extractClaims(response.message);

  // Verify each claim
  for (const claim of claims) {
    if (!await verifyClaim(claim)) {
      return {
        error: `Agent claimed: "${claim.text}" but verification failed`,
        actual: claim.actualState,
      };
    }
  }

  return response;
}
```

### 3. User Confirmation

For behavioral verification:

```typescript
// Guided testing pattern
function requestUserVerification() {
  return {
    message: "Implementation complete. Please verify:",
    steps: [
      {
        action: "Run: npm test",
        expected: "All tests pass",
        question: "What do you see?",
      },
    ],
    awaitingConfirmation: true,
  };
}
```

## Claim Categories

### Hard Claims (MUST verify)

These must be automatically verified:

- "Created file at X"
- "Deleted file Y"
- "Modified file Z"
- "Directory exists at W"
- "Installed package P"
- "Committed changes"

### Soft Claims (SHOULD verify)

These should be verified when possible:

- "Configuration updated"
- "Server started"
- "Database connected"
- "API endpoint available"

### Behavioral Claims (MUST guide)

These require human verification:

- "Feature works"
- "Integration complete"
- "Bug fixed"
- "Performance improved"

## Verification Language

### ❌ BANNED Phrases

Never use these without verification:

- "Should be created"
- "Probably exists"
- "I've created" (without checking)
- "Successfully completed" (without proof)
- "Files are ready"
- "Everything is working"

### ✅ REQUIRED Phrases

Always use these patterns:

- "Created and verified at /path/to/file"
- "Confirmed file exists with 127 lines"
- "Verification failed: [specific reason]"
- "Please verify by running: [command]"
- "Waiting for your confirmation that [specific check]"

## Error Handling

### When Verification Fails

1. **Report immediately** - Don't hide or retry silently
2. **Be specific** - Include path, expected vs actual
3. **Suggest fixes** - If permissions issue, say so
4. **Don't claim partial success** - It either worked or didn't

Example:

```
❌ Verification Failed:
- Attempted to create: /docs/plan.md
- Error: Permission denied
- Suggestion: Check write permissions for /docs directory
- Status: Operation not completed
```

### Verification Cascade

If one verification fails in a chain:

1. Stop immediately
2. Report what succeeded before failure
3. Report the specific failure
4. Don't continue with assumptions

## Testing the Verifiers

Verifiers themselves must be tested:

```typescript
// Test: Verifier detects missing file
test("detects non-existent file", async () => {
  const result = await verifyFile("/does/not/exist");
  assert(!result.exists);
});

// Test: Verifier detects empty file
test("detects empty file", async () => {
  await writeFile("/tmp/empty", "");
  const result = await verifyFile("/tmp/empty");
  assert(result.exists);
  assert(!result.hasContent);
});
```

## Audit Trail

Every verification should be logged:

```json
{
  "timestamp": "2025-08-09T10:30:00Z",
  "agent": "aichaku-documenter",
  "claim": "Created file at /docs/README.md",
  "verification": {
    "method": "fs.exists",
    "result": true,
    "proof": {
      "size": 1024,
      "modified": "2025-08-09T10:29:59Z"
    }
  }
}
```

## Performance Considerations

### Acceptable Overhead

- File existence check: < 10ms ✅
- Content verification: < 50ms ✅
- Directory scan: < 100ms ✅

### Unacceptable Delays

- Don't re-read large files multiple times
- Don't scan entire project for one file
- Don't verify recursively unless needed

## The Golden Rule

**If you're not sure it worked, don't say it did.**

Better to report uncertainty and ask for human verification than to claim false success.
