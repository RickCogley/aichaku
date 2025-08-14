# Truth Protocol Enforcement Guide

## The Problem

The Truth Protocol as implemented is just documentation - it has no enforcement mechanism. Agents can claim anything
without verification, and there's no automatic way to check their claims.

## Why It Fails

1. **Isolated Agent Context**: Task agents operate in their own context without access to verification tools
2. **Text-Only Responses**: Agents return unstructured text, not verifiable claims
3. **No Verification Loop**: Claude Code doesn't automatically verify agent claims
4. **Missing Integration**: The TruthVerifier class exists but isn't used anywhere

## Immediate Solution: Manual Verification Pattern

Until we have automated enforcement, Claude Code must follow this pattern:

### After Every Task Agent Call

```typescript
// 1. Call the Task agent
const agentResponse = await Task({
  subagent_type: "some-agent",
  prompt: "Create a file at /path/to/file.ts",
});

// 2. NEVER trust the response - always verify
const verification = await Read({
  file_path: "/path/to/file.ts",
});

// 3. Report based on verification, not claims
if (verification.exists) {
  console.log("✅ Verified: File created at /path/to/file.ts");
} else {
  console.log("❌ Failed: Agent claimed to create file but it doesn't exist");
}
```

## Short-Term Solution: Verification Commands

Modify agent templates to include verification commands in their responses:

````markdown
## Truth Protocol Response Format

When completing any file operation, end your response with:

```verification
VERIFY_COMMANDS:
- ls -la /path/to/file
- head -n 10 /path/to/file
- git status --short
```
````

This allows Claude Code to:

1. Parse the verification commands
2. Execute them automatically
3. Report actual results

````
## Medium-Term Solution: Structured Agent Responses

Modify the Task agent system to return structured data:

```typescript
interface TaskAgentResponse {
  // Human-readable message
  message: string;
  
  // Claims about what was done
  claims: Array<{
    type: "file_created" | "file_modified" | "file_deleted";
    path: string;
    size?: number;
    checksum?: string;
  }>;
  
  // Verification commands to run
  verifications: string[];
  
  // Confidence level
  confidence: "verified" | "claimed" | "attempted";
}
````

## Long-Term Solution: MCP Server for Truth

Create an MCP server that enforces the Truth Protocol:

```typescript
// mcp-truth-enforcer/server.ts
class TruthEnforcerServer {
  async handleAgentResponse(response: unknown) {
    const claims = this.extractClaims(response);
    const verifications = await this.verifyClaims(claims);

    return {
      original: response,
      verified: verifications,
      trustScore: this.calculateTrustScore(verifications),
    };
  }

  private async verifyClaims(claims: Claim[]) {
    const results = [];
    for (const claim of claims) {
      if (claim.type === "file_created") {
        const exists = await fs.exists(claim.path);
        results.push({
          claim,
          verified: exists,
          evidence: exists ? await fs.stat(claim.path) : null,
        });
      }
    }
    return results;
  }
}
```

## Implementation Checklist

### For Claude Code (Immediate)

- [ ] Never report agent claims without verification
- [ ] Always use Read tool after file creation claims
- [ ] Always use Bash tool to verify state changes
- [ ] Report verification failures to users

### For Agent Templates (This Week)

- [ ] Add verification command sections to all agents
- [ ] Include file size and checksum in creation claims
- [ ] Add confidence levels to all claims
- [ ] Document verification patterns in each agent

### For Aichaku System (This Month)

- [ ] Integrate TruthVerifier class into CLI
- [ ] Add verification hooks to agent communication
- [ ] Create MCP server for truth enforcement
- [ ] Add metrics for truth protocol compliance

## Verification Patterns by Operation

### File Creation

```bash
# After claimed file creation
ls -la /path/to/file
file /path/to/file
head -n 20 /path/to/file
```

### File Modification

```bash
# After claimed file modification
git diff /path/to/file
diff /path/to/file.backup /path/to/file
md5sum /path/to/file
```

### Test Execution

```bash
# After claimed test run
npm test -- --listTests
npm test -- --verbose 2>&1 | tail -50
echo "Exit code: $?"
```

### Build/Compile

```bash
# After claimed build
ls -la dist/
find . -name "*.js" -newer timestamp
echo "Build artifacts: $(find dist -type f | wc -l)"
```

## Metrics for Success

Track these metrics to ensure Truth Protocol effectiveness:

1. **Claim Verification Rate**: % of agent claims that are verified
2. **False Claim Rate**: % of claims that fail verification
3. **Verification Time**: Average time to verify claims
4. **User Trust Score**: Survey of user confidence in agent claims

## Conclusion

The Truth Protocol requires enforcement, not just documentation. Until automated enforcement is built, manual
verification is mandatory. Every claim must be verified before reporting to users.

Remember: **Trust is earned through verification, not promised through protocols.**
