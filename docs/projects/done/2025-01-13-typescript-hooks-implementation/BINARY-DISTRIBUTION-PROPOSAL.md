# Hook Binary Distribution Proposal

## Current MCP Distribution Model

Aichaku already distributes compiled binaries for MCP servers:

````typescript
// From src/commands/mcp.ts
const binaryName = `aichaku-code-reviewer-${VERSION}-${platformName}${ext}`;
const downloadUrl =
  `https://github.com/RickCogley/aichaku/releases/download/v${VERSION}/${binaryName}`;
```text

### How MCP Binaries Work:

1. **Pre-compiled for each platform**:

   - `aichaku-code-reviewer-0.29.0-macos-arm64`

   - `aichaku-code-reviewer-0.29.0-macos-x64`

   - `aichaku-code-reviewer-0.29.0-linux-x64`

   - `aichaku-code-reviewer-0.29.0-windows-x64.exe`

2. **Downloaded on demand**:

   ```bash
   aichaku mcp --install
   # Downloads binary to ~/.claude/mcp/aichaku-code-reviewer
````

3. **Made executable and ready to use**

## Proposed Hook Binary Distribution

### Same Model for Hooks:

1. **Compile hook binary for each platform**:

   ```bash
   # Build process (in CI/CD)
   deno compile --allow-read --allow-write --allow-env \
     --output=aichaku-hooks-${VERSION}-macos-arm64 \
     aichaku-hooks.ts
   ```

2. **Binary names**:

   - `aichaku-hooks-0.29.0-macos-arm64`

   - `aichaku-hooks-0.29.0-macos-x64`

   - `aichaku-hooks-0.29.0-linux-x64`

   - `aichaku-hooks-0.29.0-windows-x64.exe`

3. **Installation process**:

   ```typescript
   // In ensureHookScripts() - modified approach
   async function ensureHookBinary(): Promise<void> {
     const hooksDir = expandTilde("~/.claude/aichaku/hooks");
     await ensureDir(hooksDir);

     const platform = Deno.build.os;
     const arch = Deno.build.arch;

     // Download binary like MCP does
     const binaryName = `aichaku-hooks-${VERSION}-${platformName}${ext}`;
     const targetPath = join(hooksDir, `aichaku-hooks${ext}`);

     const downloadUrl =
       `https://github.com/RickCogley/aichaku/releases/download/v${VERSION}/${binaryName}`;

     // Download and install
     await downloadBinary(downloadUrl, targetPath);

     // Make executable
     if (platform !== "windows") {
       await Deno.chmod(targetPath, 0o755);
     }
   }
   ```

## Benefits of Binary Distribution

1. **No Deno Required**: Hooks run without Deno installed

2. **Faster Execution**: No TypeScript compilation overhead

3. **Consistent Versioning**: Binary matches Aichaku version

4. **Automatic Updates**: New Aichaku versions bring new hook binaries

5. **Security**: Pre-compiled code can't be tampered with

6. **Smaller Size**: Single binary vs TypeScript source

## Implementation Changes

### 1. Update hook templates to use binary:

````typescript
// Before (current)
command: `deno run --allow-read --allow-write ~/.claude/aichaku/hooks/aichaku-hooks.ts path-validator`;

// After (with binary)
command: `~/.claude/aichaku/hooks/aichaku-hooks path-validator`;
```text

### 2. Install during init:

```typescript
// In init.ts
export async function init(options: InitOptions = {}) {
  if (isGlobal) {
    // Install methodologies
    // Install standards
    // NEW: Install hook binary
    await ensureHookBinary();
  }
}
```text

### 3. Update build process:

```yaml
# .github/workflows/release.yml

- name: Build hook binaries
  run: |
    deno compile --allow-read --allow-write --allow-env \
      --target=x86_64-apple-darwin \
      --output=aichaku-hooks-${{ github.ref_name }}-macos-x64 \
      src/hooks/aichaku-hooks.ts

    deno compile --allow-read --allow-write --allow-env \
      --target=aarch64-apple-darwin \
      --output=aichaku-hooks-${{ github.ref_name }}-macos-arm64 \
      src/hooks/aichaku-hooks.ts

    # ... other platforms
```text

## User Experience Improvement

### Current Flow:

```bash
# Install Aichaku
deno install -g -A -n aichaku jsr:@rick/aichaku/cli

# Initialize (no hooks)
aichaku init --global

# Must install hooks separately (creates TypeScript file)
aichaku hooks --install essential --global
```text

### Proposed Flow:

```bash
# Install Aichaku
deno install -g -A -n aichaku jsr:@rick/aichaku/cli

# Initialize (downloads hook binary automatically)
aichaku init --global
✅ Downloading hook runner for macos-arm64...
✅ Hook infrastructure ready!

# Hooks ready to install immediately
aichaku hooks --install essential --global
```text

## Platform Support

Just like MCP servers, we'd support:

- macOS ARM64 (Apple Silicon)

- macOS x64 (Intel)

- Linux x64

- Windows x64

## Version Management

The hook binary version would be tied to Aichaku version:

- Aichaku v0.29.0 → Hook binary v0.29.0

- Ensures compatibility

- Automatic updates with `aichaku upgrade`

## Conclusion

Distributing hooks as a compiled binary (just like MCP servers) would:

1. Simplify installation (automatic during init)

2. Improve performance (no Deno overhead)

3. Ensure version consistency

4. Work on systems without Deno

5. Follow established pattern (MCP servers)

This makes hooks truly "install and forget" - they're just there and ready to
use!
````
