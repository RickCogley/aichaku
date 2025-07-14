# Hook Installation Process in Aichaku

## Current State: Hook Scripts Are NOT Automatically Installed

### The Discovery

When someone installs Aichaku CLI globally or locally, **the hook scripts (`aichaku-hooks.ts`) are NOT automatically installed**. This is what currently happens:

```bash
# User installs Aichaku
deno install -g -A -n aichaku jsr:@rick/aichaku/cli

# User initializes Aichaku
aichaku init --global  # Installs methodologies and standards
aichaku init          # Creates project structure

# Hook scripts are NOT installed at this point!
```

### When Hook Scripts Get Installed

The hook script (`~/.claude/aichaku/hooks/aichaku-hooks.ts`) is **only created** when:

1. **User runs hook installation command**:
   ```bash
   aichaku hooks --install essential --global
   # OR
   aichaku hooks --install github --local
   ```

2. **First hook installation triggers `ensureHookScripts()`**:
   ```typescript
   // In src/commands/hooks.ts
   async function installHooks() {
     // ...
     // Ensure hook scripts are installed before installing any hooks
     if (!dryRun) {
       await ensureHookScripts();
     }
     // ...
   }
   ```

3. **The function creates the script**:
   ```typescript
   async function ensureHookScripts(): Promise<void> {
     const scriptPath = expandTilde("~/.claude/aichaku/hooks/aichaku-hooks.ts");
     const scriptDir = expandTilde("~/.claude/aichaku/hooks");
     
     // Create directory if it doesn't exist
     await ensureDir(scriptDir);
     
     // Check if script already exists
     if (await exists(scriptPath)) {
       return;
     }
     
     // Create the unified hook runner script
     const scriptContent = `#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env
     // Aichaku Hook Runner
     // This script handles all Aichaku hooks with proper TypeScript support
     ...`;
     
     await Deno.writeTextFile(scriptPath, scriptContent);
   }
   ```

## Current Installation Flow

```mermaid
graph TD
    A[User installs Aichaku CLI] --> B[aichaku init --global]
    B --> C[Installs methodologies]
    B --> D[Installs standards]
    B --> E[Creates ~/.claude structure]
    B -.->|NOT installed| F[Hook scripts]
    
    G[User runs: aichaku hooks --install] --> H[ensureHookScripts()]
    H --> I[Creates ~/.claude/aichaku/hooks/]
    H --> J[Writes aichaku-hooks.ts]
    J --> K[Installs hook configurations]
    
    style F stroke-dasharray: 5 5
```

## The Problem

1. **Hook script is embedded in source code** - The entire `aichaku-hooks.ts` content is stored as a string literal in `hooks.ts`
2. **Not included in distribution** - The hook script is not part of the JSR package files
3. **Created on-demand** - Only created when user actually installs hooks
4. **Version mismatch risk** - If user updates Aichaku but doesn't reinstall hooks, the script might be outdated

## Potential Solutions

### Option 1: Install During Init (Recommended)
```typescript
// In init.ts
export async function init(options: InitOptions = {}) {
  // ... existing init code ...
  
  if (isGlobal) {
    // Install methodologies
    // Install standards
    // NEW: Install hook scripts
    await ensureHookScripts();
  }
}
```

### Option 2: Include as Package File
- Add `aichaku-hooks.ts` to the package files
- Copy it during init like methodologies
- Keep it in sync with source

### Option 3: Download from GitHub
- Similar to how methodologies are fetched
- Ensures latest version
- Requires network access

### Option 4: Compile to Binary
- Pre-compile `aichaku-hooks` binary
- Distribute with package
- No Deno required for execution

## Current Workaround

Users must explicitly install hooks after installing Aichaku:

```bash
# Step 1: Install and initialize Aichaku
deno install -g -A -n aichaku jsr:@rick/aichaku/cli
aichaku init --global

# Step 2: Install hooks (this creates the script)
aichaku hooks --install essential --global

# Step 3: Verify
ls ~/.claude/aichaku/hooks/
# Should see: aichaku-hooks.ts
```

## Implications

1. **Documentation needs update** - Should mention hook installation step
2. **User experience gap** - Users might expect hooks to work immediately
3. **Upgrade considerations** - Hook script won't update automatically with Aichaku upgrades
4. **Testing challenges** - Hook script is generated, not distributed

## Recommendation

The hook script should be installed during `aichaku init --global` to ensure:
- Complete installation in one step
- Hook infrastructure ready for use
- Consistent version with installed Aichaku
- Better user experience

This would make the installation truly "one-time setup, works everywhere" as advertised.