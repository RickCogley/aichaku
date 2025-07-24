# MCP-Claude Relationship & Architecture Decisions

🪴 Aichaku: Understanding How MCP and Claude Interact

## Fundamental Relationship

**Key Principle**: MCPs are tools that Claude uses, not autonomous agents.

```
User → Claude → MCP → Results → Claude → User
       ↑                           ↓
       └───────────────────────────┘
```

### What This Means:

- **Claude invokes MCP**: Based on user requests or hooks
- **MCP returns data**: Structured findings, no interpretation
- **Claude presents results**: Formats and explains to user
- **Cost efficiency**: MCP processing doesn't use Claude API tokens

## Hooks-Based Automation

### 1. Automatic Review on File Changes

```json
// ~/.claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "name": "Auto Security Review",
        "matcher": "Write|Edit|MultiEdit",
        "command": "echo '${TOOL*INPUT*FILE*PATH}' | mcp-trigger review*file"
      }
    ]
  }
}
```

### 2. Pre-Commit Review Hook

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "name": "Pre-commit MCP Review",
        "matcher": "Bash(git commit)",
        "command": "mcp-trigger review_staged"
      }
    ]
  }
}
```

### 3. Smart Review Triggers

```typescript
// Hook that only triggers for security-sensitive files
{
  "hooks": {
    "PostToolUse": [{
      "name": "Security File Review",
      "matcher": "Write|Edit",
      "command": "bash -c 'if [[ \"${TOOL*INPUT*FILE*PATH}\" =~ \\.(ts|js|py|go)$ ]]; then mcp-trigger review*file \"${TOOL*INPUT*FILE_PATH}\"; fi'"
    }]
  }
}
```

## Advanced Capabilities: Auto-Fix PRs

### MCP Creates Fix Branches

```typescript
// In MCP server
async createFixPR(findings: Finding[]): Promise<string> {
  const fixableFinding = findings.filter(f => f.autoFix);

  if (fixableFindings.length === 0) return null;

  // Create branch
  await exec('git checkout -b mcp-fixes-${Date.now()}');

  // Apply fixes
  for (const finding of fixableFindings) {
    await applyFix(finding);
  }

  // Commit and push
  await exec('git add -A');
  await exec('git commit -m "fix: MCP auto-fixes for security issues"');
  await exec('git push -u origin HEAD');

  // Create PR
  const { stdout } = await exec('gh pr create --title "MCP Security Fixes" --body "..."');
  return extractPRUrl(stdout);
}
```

### Claude Reviews the PR

```
User: "Apply security fixes"
Claude: "I'll have MCP create fixes and review them"
  → MCP: create*fix*pr(findings)
  ← MCP: "Created PR #123"
Claude: "I'll review the proposed fixes"
  → Reviews PR changes
Claude: "The fixes look good. They address:
  - Command injection by using parameter expansion
  - Path traversal by validating paths
  Shall I merge?"
```

## Compilation Decision

### Option 1: Interpreted (Recommended for Development)

```bash
# Direct execution
deno run -A mcp-server.ts
```

**Pros**: Fast iteration, easy debugging, cross-platform **Cons**: Slightly slower startup

### Option 2: Compiled (Recommended for Distribution)

```bash
# Compile to binary
deno compile --allow-all --output mcp-code-reviewer mcp-server.ts
```

**Pros**: Faster startup, single binary, no Deno required **Cons**: Platform-specific builds, larger size

### Recommendation: **Both**

- Development: Use interpreted for fast iteration
- Distribution: Compile for end users
- Performance gain: ~200-500ms startup improvement

## Local vs Hosted Architecture

### Option 1: Local (Recommended)

```
[User Machine]
├── Claude Code
├── MCP Server (local process)
└── Security Tools (local)
```

**Pros**:

- ✅ **Privacy**: Code never leaves machine
- ✅ **Speed**: No network latency
- ✅ **Free**: No hosting costs
- ✅ **Tools**: Direct access to local scanners

**Cons**:

- ❌ Setup required per machine
- ❌ Resource usage on dev machine

### Option 2: Hosted (Deno Deploy)

```
[User Machine]          [Cloud]
├── Claude Code    →    MCP Server
└── Code files     →    (Deno Deploy)
```

**Pros**:

- ✅ Zero setup for users
- ✅ Centralized updates
- ✅ Shared compute resources

**Cons**:

- ❌ **Privacy concerns**: Sending code to cloud
- ❌ **Latency**: Network round trips
- ❌ **Cost**: Hosting and bandwidth
- ❌ **Tool access**: Can't use local scanners

### Hybrid Approach (Future)

```
Local MCP (fast path)
    ↓
[Heavy analysis needed?]
    ↓
Cloud MCP (advanced scanners)
```

## Recommended Architecture

### Phase 1: Local-First

1. **Compiled binary** for distribution
2. **Local execution** for privacy/speed
3. **Hook integration** for automation
4. **PR creation** capability

### Phase 2: Optional Cloud

1. **Opt-in cloud** for heavy analysis
2. **Local fallback** always available
3. **Privacy controls** (what to send)

### Implementation Priority

1. ✅ Local MCP with basic scanners
2. ✅ Hook-based automation
3. ✅ Compiled distribution
4. ⏳ PR creation features
5. ⏳ Optional cloud tier

## Security Considerations

### Local Benefits:

- Code never transmitted
- No API keys needed
- No attack surface
- User controls everything

### If Cloud (future):

- End-to-end encryption
- Ephemeral processing
- No code storage
- Audit logs

## Cost Analysis

### Local MCP:

- User cost: $0 (just CPU time)
- Claude API: Normal usage
- Distribution: One-time download

### Hosted MCP:

- Hosting: ~$10-50/month
- Bandwidth: Variable
- Complexity: Higher
- Privacy: Compromised

## Conclusion

**Recommendation**: Start with local-only compiled MCP

- Maximum privacy and speed
- No hosting costs
- Easy distribution
- Hook automation works perfectly
- PR creation possible

The local approach aligns with the "first line of defence" philosophy and keeps everything under user control.
