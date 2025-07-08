# Aichaku Init.ts Installer Analysis

## Problem Summary

The init.ts installer failed to properly upgrade Aichaku from v0.7.0 to v0.8.0, despite reporting "Successfully installed". The issues were:

1. **Version Pinning Problem**: The installer doesn't specify a version when running `deno install`, which causes Deno to use the cached version
2. **Error Handling**: When the global init failed, it showed an error but didn't provide actionable steps
3. **Confusing Success Messages**: Said "Successfully installed v0.8.0" but actually kept v0.7.0
4. **Force Flag Not Effective**: The --force flag doesn't guarantee a fresh download from JSR

## Root Causes Identified

### 1. Missing Version Specification in Install Command

```typescript
// Current implementation (line 85-96)
const installArgs = [
  "install",
  "-g",
  ...PERMISSIONS,
  "-n",
  PACKAGE_NAME,
];

if (args.force) {
  installArgs.push("--force");
}

installArgs.push(JSR_URL);  // This is just "jsr:@rick/aichaku/cli"
```

**Problem**: Without a version suffix, Deno uses its cache. The JSR_URL should include the version:
- Current: `jsr:@rick/aichaku/cli`
- Should be: `jsr:@rick/aichaku@0.8.0/cli`

### 2. Misleading Success Message

```typescript
// Line 186
console.log(`\n✅ Aichaku v${latestVersion} installed successfully!`);
```

**Problem**: This message appears even if the installation didn't actually update to the latest version. The installer assumes success without verifying the actual installed version.

### 3. Poor Error Recovery

When the global init fails (line 179-184), the error handling is minimal:
```typescript
if (!initSuccess) {
  console.error("\n❌ Failed to initialize global methodologies!");
  console.log("Try running: aichaku init --global");
  Deno.exit(1);
}
```

**Problem**: This doesn't explain WHY it failed or provide proper recovery steps.

### 4. Version Detection Issues

The `getCurrentVersion()` function (lines 51-69) runs `aichaku --version` but doesn't validate if this matches what was supposedly just installed.

## Why The Upgrade Failed

1. **Deno Cache**: When you run `deno install jsr:@rick/aichaku/cli`, Deno checks its cache first
2. **No Version Pin**: Without `@0.8.0` in the URL, Deno uses the cached v0.7.0
3. **Force Flag Limitation**: `--force` only overwrites the binary, doesn't force re-download
4. **Init Failure**: The v0.7.0 binary tried to initialize v0.8.0 methodologies, causing version mismatch

## Proper Fix Design

### 1. Always Specify Version

```typescript
const JSR_URL = `jsr:@${SCOPE}/${PACKAGE_NAME}@${latestVersion}/cli`;
```

### 2. Add --reload Flag

```typescript
const installArgs = [
  "install",
  "-g",
  "--reload",  // Force fresh download
  ...PERMISSIONS,
  "-n",
  PACKAGE_NAME,
];
```

### 3. Verify Installation

```typescript
// After install, verify the version
const installedVersion = await getCurrentVersion();
if (installedVersion !== latestVersion) {
  console.error(`\n⚠️  Installation verification failed!`);
  console.error(`Expected: v${latestVersion}`);
  console.error(`Actual: v${installedVersion || 'unknown'}`);
  // Provide recovery steps
}
```

### 4. Better Error Messages

```typescript
if (!initSuccess) {
  console.error("\n❌ Failed to initialize global methodologies!");
  console.error("\nPossible causes:");
  console.error("• Version mismatch between CLI and methodologies");
  console.error("• Insufficient permissions for ~/.claude directory");
  console.error("• Network issues downloading methodologies");
  console.error("\nRecovery steps:");
  console.error("1. Try manual installation:");
  console.error(`   deno install -g --reload -A -n aichaku jsr:@rick/aichaku@${latestVersion}/cli`);
  console.error("2. Then run: aichaku init --global");
  console.error("3. If issues persist, uninstall first:");
  console.error("   deno uninstall -g aichaku");
  console.error("   rm -rf ~/.claude/methodologies");
}
```

### 5. Upgrade vs Fresh Install Flow

```typescript
// Clear distinction between flows
if (currentVersion) {
  console.log(`\n🔄 Upgrading Aichaku...`);
  console.log(`   Current: v${currentVersion}`);
  console.log(`   Target:  v${latestVersion}`);
  
  // For upgrades, always use --reload
  installArgs.push("--reload");
} else {
  console.log(`\n📦 Installing Aichaku v${latestVersion}...`);
}
```

## Recommended Implementation Changes

1. **Version Pinning**: Always include version in JSR URL
2. **Cache Busting**: Use `--reload` flag for upgrades
3. **Verification**: Check actual installed version after installation
4. **Clear Messaging**: Distinguish between install/upgrade/already-latest
5. **Recovery Path**: Provide clear steps when things go wrong
6. **Idempotency**: Make the installer safe to run multiple times

## User Experience Improvements

1. Show progress indicators during each step
2. Clearly indicate what's being downloaded/installed
3. Provide estimated time for operations
4. Show before/after versions for upgrades
5. Offer rollback instructions if upgrade fails

## Security Considerations

1. Validate the fetched version matches expected
2. Use checksums for methodology downloads
3. Ensure proper file permissions after installation
4. Never expose system paths in error messages