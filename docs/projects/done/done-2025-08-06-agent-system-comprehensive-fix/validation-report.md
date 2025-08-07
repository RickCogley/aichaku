# Agent System Fix Plan - Validation Report

## Executive Summary

After comprehensive review using multiple specialized agents, the 4-week timeline is **achievable** for fixing the
existing system. Key issues to fix:

- ID generation creating wrong format (full names instead of kebab-case)
- Path discovery not finding agent templates correctly
- Display formatting showing duplicate information
- Integration not copying agent files properly

## Critical Findings

### 1. ✅ **Agent System Exists But Has Bugs**

**Reality**: The agent system is **implemented and functional** **Issues**: ID generation, path discovery, and display
formatting bugs

```typescript
// agent-loader.ts exists and works
const agent = this.metadataToAgent(item);
// But generates wrong IDs like "Aichaku Deno Expert"
```

**Impact**: This is bug fixing, not new development.

### 2. ⚠️ **Namespacing Strategy Needs Revision**

**Current Plan**:

- Default agents: `aichaku-*` prefix
- Optional agents: Simple names like `deno-expert`

**Risk Identified**: Simple names could conflict with other MCP servers

**Recommendation**: Consider namespacing ALL agents:

- Core: `aichaku-orchestrator`
- Optional: `aichaku-deno-expert` (not just `deno-expert`)

Alternative: Keep current plan but document collision risks.

### 3. ❌ **Path Discovery Not Integrated**

**Assumption**: "Path discovery will work" **Reality**: `dynamic-content-discovery.ts` exists but `agent-loader.ts`
doesn't use it

```typescript
// Current - hardcoded paths that won't work
const defaultPath = join(installPath, "agents", "default");

// Needed - integration with existing discovery
const contentDirs = await discoverContentDirectories();
```

**Impact**: Major refactoring needed to integrate existing path discovery.

### 4. ⚠️ **Init/Upgrade Feedback Missing**

**Finding**: The `init` and `upgrade` commands **do not mention agents at all**

- No "Installing default agents..." message
- No feedback about agent system
- Users won't know agents were installed

**Required**: Add explicit feedback during init/upgrade:

```typescript
Brand.progress("Installing default agents...");
Brand.success("✓ Installed 3 default agents");
```

### 5. 🚨 **Security Vulnerabilities**

**Critical Issues Found**:

1. **YAML Injection Risk**: No schema validation
2. **Agent ID Injection**: No validation before file operations
3. **File Permissions**: World-readable agent files

**Required Fixes**:

```typescript
// Validate agent IDs
if (!/^[a-zA-Z0-9_-]+$/.test(agentId)) {
  throw new Error("Invalid agent ID");
}

// Restrict file permissions
await Deno.writeTextFile(path, content, { mode: 0o600 });
```

### 6. ❌ **TypeScript Complexity Underestimated**

**Missing Infrastructure**:

- No BaseCommand class exists
- No consistent command pattern
- Complex type system needed for agents

**Required New Files**:

```typescript
// All must be created from scratch
src / types / agent.ts;
src / utils / base - command.ts;
src / utils / agent - loader.ts;
src / commands / agents.ts;
src / formatters / agent - formatter.ts;
```

## Revised Timeline Estimate

### Realistic 8-Week Timeline

#### Weeks 1-2: Foundation

- Create TypeScript type system
- Build BaseCommand pattern
- Implement path discovery integration

#### Weeks 3-4: Core Implementation

- Build agent loader from scratch
- Create agent command
- Implement ID normalization

#### Weeks 5-6: Integration

- Fix `aichaku integrate` to copy agents
- Add init/upgrade feedback
- Implement security hardening

#### Weeks 7-8: Testing & Polish

- Write comprehensive tests
- Handle edge cases
- Documentation
- Migration for broken installations

## Recommendations

### 1. **Adjust Scope or Timeline**

**Option A**: Keep 4-week timeline, reduce scope:

- Fix only ID generation and display
- Defer integration and full implementation

**Option B**: Accept 8-week timeline for full fix:

- Complete implementation as planned
- Include security hardening
- Comprehensive testing

### 2. **Address Security First**

Before any release:

- Implement YAML schema validation
- Add agent ID sanitization
- Set restrictive file permissions

### 3. **Fix User Feedback**

Add explicit agent feedback to init/upgrade:

```typescript
console.log("🪴 Installing default agents:");
console.log("  ✓ aichaku-orchestrator");
console.log("  ✓ aichaku-documenter");
console.log("  ✓ aichaku-security-reviewer");
```

### 4. **Consider Simpler Namespacing**

To reduce confusion and implementation time:

- Use `aichaku-` prefix for ALL agents
- Simpler, consistent, no collision risks

### 5. **Create Quality Gates**

Add to Definition of Done:

- Security review passed
- User feedback verified
- Integration tests passing
- Migration tested from broken state

## Conclusion

The agent system requires **targeted bug fixes**, not rebuilding. The 4-week estimate is **appropriate** for fixing ID
generation, path discovery, display formatting, and integration issues while adding security hardening and user
feedback.

**Critical Path Items**:

1. TypeScript type system design (Week 1)
2. Agent loader implementation (Week 2-3)
3. Security hardening (Week 4)
4. Integration with existing commands (Week 5-6)
5. Testing and edge cases (Week 7-8)

The plan's architecture is sound, but the timeline and scope assumptions need adjustment to reflect the reality that
this is new development, not a fix.
