# Pitch: Agent Truth Protocol

## Problem

We've discovered agents making false claims about completed work, particularly file operations. In the nagare project,
an agent reported "files created successfully" when no files existed. This breaks the fundamental trust contract between
system and user.

### The Cost of Lies

1. **Time waste**: User assumes work is done, proceeds, then must backtrack
2. **Money waste**: AI tokens spent on follow-up work based on false premises
3. **Trust erosion**: User loses confidence in the system
4. **Cascade failures**: Other parties (human or AI) act on false information

### Real Example

```
Agent: "Created Shape Up planning documents in docs/shape-up/"
Reality: Directory doesn't exist, no files created
Result: User confusion, manual verification needed, time wasted
```

## Appetite

2-3 weeks for implementation. This is critical infrastructure - without trust, nothing else matters.

## Solution

### 1. Truth Protocol (Week 1)

Every agent state-changing operation MUST follow this pattern:

```typescript
// Current (broken) pattern
await writeFile(path, content);
return "File created successfully"; // ASSUMPTION!

// Truth Protocol pattern
await writeFile(path, content);
const exists = await fileExists(path);
const hasContent = exists && (await readFile(path)).length > 0;
if (!exists || !hasContent) {
  return "ERROR: Failed to create file at " + path;
}
return "File created and verified at " + path;
```

### 2. Orchestrator Verification Layer (Week 1-2)

The orchestrator becomes a fact-checker:

```typescript
// When agent claims file operation
if (agentResponse.includes("created") || agentResponse.includes("wrote")) {
  const claimedPaths = extractPaths(agentResponse);
  for (const path of claimedPaths) {
    if (!await verifyPath(path)) {
      return `Agent claimed to create ${path} but verification failed`;
    }
  }
}
```

### 3. Guided Testing Mode (Week 2-3)

Instead of agents claiming "feature works", they guide collaborative testing:

```typescript
// Old way
return "GitHub integration complete and working";

// Guided Testing way
return `
GitHub integration code complete. Let's verify together:

1. Run: git remote -v
   Expected: Shows your GitHub remote
   
2. Run: aichaku githooks --list  
   Expected: Shows enabled hooks
   
3. Make a test commit
   Expected: Hooks should run

Please tell me what you observe at each step.
`;
```

## Rabbit Holes

### What We're NOT Doing

1. **Complex integration testing** - Humans verify behavior, agents verify existence
2. **Performance testing** - Not about speed, about truth
3. **Retry logic** - If it fails, report the failure honestly
4. **Cached verification** - Always verify fresh, no assumptions

## No-Gos

1. **Partial verification** - Either verify completely or don't claim success
2. **Probabilistic claims** - No "probably created" or "should exist"
3. **Silent failures** - Every failure must be reported
4. **Delayed verification** - Verify immediately, not later

## Implementation Priorities

### Phase 1: Stop the Bleeding (Days 1-3)

- Add verification to Write, Edit, MultiEdit tools
- Update orchestrator to check file claims
- Deploy to production

### Phase 2: Expand Coverage (Days 4-7)

- Add verification to all state-changing operations
- Create verification manifest format
- Update all agents with Truth Protocol

### Phase 3: Guided Testing (Week 2)

- Create testing guide templates
- Update agents to use collaborative verification
- Document patterns for agent developers

### Phase 4: Monitoring (Week 3)

- Add metrics for verification failures
- Create audit log of claims vs reality
- Weekly truth report for users

## Success Metrics

1. **Zero false positives**: No file claimed to exist that doesn't
2. **Clear failures**: When something fails, user knows immediately
3. **User confidence**: "When aichaku says it's done, it's done"
4. **Testing participation**: Users actively engage in guided testing

## Risks

1. **Performance impact**: Verification adds latency
   - Mitigation: Parallel verification, smart batching

2. **Over-verification**: Checking things that don't matter
   - Mitigation: Focus only on user-facing claims

3. **Breaking existing agents**: Changes could destabilize system
   - Mitigation: Gradual rollout, backward compatibility

## The Bet

This is a **MUST DO** project. Without truth, we have nothing. The system currently "lies" to users - that's
unacceptable.

We're betting 2-3 weeks to restore fundamental trust. The alternative is users learning to doubt everything the system
says, which destroys the entire value proposition.

## How This Works

### For Agent Developers

```typescript
// Every agent MUST use this pattern
class TruthfulAgent {
  async createFile(path: string, content: string) {
    // 1. Attempt operation
    const result = await this.write(path, content);

    // 2. Verify immediately
    const proof = await this.verify(path);

    // 3. Report honestly
    if (!proof.exists) {
      throw new Error(`Failed to create ${path}`);
    }

    return {
      success: true,
      path: path,
      proof: proof,
    };
  }
}
```

### For Users

Before: "Files created" → Assume it worked → Find out later it didn't

After: "Files created and verified at X, Y, Z" → Trust it → Move forward confidently

Or: "Failed to create file X: permission denied" → Know immediately → Fix and continue

## The Bottom Line

Agents must tell the truth. Always. No exceptions.
