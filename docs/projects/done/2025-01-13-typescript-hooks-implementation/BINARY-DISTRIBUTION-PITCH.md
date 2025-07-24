# Shape Up Pitch: Hook Binary Distribution System

## Problem

Currently, the Aichaku hook system has a poor user experience:

- Hook scripts are NOT installed during `aichaku init --global`
- Users must manually run `aichaku hooks --install` to create the TypeScript runner
- The hook script is embedded as a string literal in source code
- No version management - outdated scripts persist after Aichaku upgrades
- Requires Deno for execution (TypeScript compilation overhead)

This violates the "install once globally, works everywhere" promise.

## Appetite

**6 weeks** - This is a foundational improvement that enables better hook adoption.

## Solution

Distribute hooks as compiled binaries using the **existing MCP binary distribution system**:

### Core Components

1. **Reuse MCP Infrastructure**
   - Same platform detection (`macos-arm64`, `linux-x64`, etc.)
   - Same GitHub release distribution
   - Same download and installation logic

2. **Binary Compilation**

   ```bash
   # Add to build process
   deno compile --allow-read --allow-write --allow-env \
     --output=aichaku-hooks-${VERSION}-${PLATFORM} \
     src/hooks/aichaku-hooks.ts
   ```

3. **Automatic Installation During Init**

   ```typescript
   // In init.ts - add after standards installation
   if (isGlobal) {
     await installMethodologies();
     await installStandards();
     await ensureHookBinary(); // NEW
   }
   ```

4. **Update Hook Commands**

   ```typescript
   // Before: Requires Deno
   command: `deno run --allow-read --allow-write ~/.claude/aichaku/hooks/aichaku-hooks.ts path-validator`;

   // After: Direct binary execution
   command: `~/.claude/aichaku/hooks/aichaku-hooks path-validator`;
   ```

### User Experience Transformation

**Before (4 steps, confusing):**

```bash
deno install -g -A -n aichaku jsr:@rick/aichaku/cli
aichaku init --global        # No hooks installed
aichaku hooks --install essential --global  # Manual step
# Now hooks work
```

**After (2 steps, seamless):**

```bash
deno install -g -A -n aichaku jsr:@rick/aichaku/cli
aichaku init --global        # Hooks automatically installed
# Hooks ready immediately
```

## Rabbit Holes

### ❌ Custom Binary Format

Don't create a custom distribution format. Stick with the proven MCP approach.

### ❌ Multiple Hook Binaries

Don't compile separate binaries per hook. Keep the single unified runner with switches.

### ❌ Fallback to TypeScript

Don't add complexity with "if binary fails, use TypeScript" logic. Make binary distribution reliable.

## No-Gos

### ❌ Breaking Changes to Hook API

Hook command structure stays the same - only the runner changes from TypeScript to binary.

### ❌ Platform-Specific Features

No OS-specific hook functionality. Keep hooks cross-platform compatible.

### ❌ Embedded Hook Source

Don't embed the TypeScript source in binaries for "debugging". Use proper error handling and logging.

## Implementation Phases

### Phase 1: Binary Compilation (Week 1-2)

- Add `deno compile` to build process
- Generate binaries for all platforms
- Test binary execution locally

### Phase 2: Distribution (Week 3-4)

- Add binary upload to GitHub releases
- Implement `ensureHookBinary()` function
- Update `init.ts` to download binary

### Phase 3: Hook Updates (Week 5)

- Update all hook templates to use binary paths
- Add GitHub hooks to binary (todo-tracker, pr-checker, etc.)
- Test installation flow end-to-end

### Phase 4: Documentation & Release (Week 6)

- Update documentation
- Create migration guide
- Release v0.29.0 with binary hooks

## Success Metrics

1. **Zero Manual Steps**: `aichaku init --global` installs everything
2. **Performance**: Hook execution < 100ms (vs current ~500ms)
3. **Reliability**: Works on systems without Deno
4. **Version Consistency**: Hook version matches Aichaku version

## Circuit Breaker

If binary compilation fails on any platform:

- Keep current TypeScript approach as fallback
- Ship v0.29.0 with existing hook system
- Binary distribution becomes v0.30.0 goal

## Dependencies

- Existing MCP binary infrastructure ✅
- Deno compile support for target platforms ✅
- GitHub Actions for automated builds ✅

This leverages proven systems (MCP distribution) to solve a real user pain point with minimal risk.
