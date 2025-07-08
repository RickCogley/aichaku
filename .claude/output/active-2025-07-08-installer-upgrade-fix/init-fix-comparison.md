# Init.ts Fix Comparison

## Key Changes Made

### 1. Version Pinning in JSR URL

**Before:**
```typescript
const JSR_URL = `jsr:@${SCOPE}/${PACKAGE_NAME}/cli`;
// Results in: jsr:@rick/aichaku/cli
```

**After:**
```typescript
const jsrUrl = `jsr:@${SCOPE}/${PACKAGE_NAME}@${version}/cli`;
// Results in: jsr:@rick/aichaku@0.8.0/cli
```

**Why:** Without version pinning, Deno uses its cache which may contain an older version.

### 2. Cache Busting with --reload

**Before:**
```typescript
if (args.force) {
  installArgs.push("--force");
}
```

**After:**
```typescript
// For upgrades or force reinstall, add --reload to bypass cache
if (isUpgrade || args.force) {
  installArgs.push("--reload");
}

if (args.force) {
  installArgs.push("--force");
}
```

**Why:** The `--reload` flag forces Deno to download fresh from JSR, bypassing the cache entirely.

### 3. Installation Verification

**Before:**
```typescript
const { code } = await cmd.output();
return code === 0;
```

**After:**
```typescript
const { code } = await cmd.output();

if (code === 0) {
  // Verify the installation succeeded
  console.log("\n🔍 Verifying installation...");
  const installedVersion = await getCurrentVersion();
  
  if (installedVersion === version) {
    console.log(`✅ Successfully installed v${installedVersion}`);
    return true;
  } else {
    console.error(`\n⚠️  Installation verification failed!`);
    console.error(`   Expected: v${version}`);
    console.error(`   Actual: v${installedVersion || 'unknown'}`);
    console.error(`\n💡 Try manual installation:`);
    console.error(`   deno install -g --reload -A -n aichaku ${jsrUrl}`);
    return false;
  }
}
```

**Why:** Verifies that the correct version was actually installed, not just that the command succeeded.

### 4. Enhanced Error Recovery

**Before:**
```typescript
if (!initSuccess) {
  console.error("\n❌ Failed to initialize global methodologies!");
  console.log("Try running: aichaku init --global");
  Deno.exit(1);
}
```

**After:**
```typescript
if (code !== 0) {
  console.error("\n❌ Failed to initialize global methodologies!");
  console.error("\nPossible causes:");
  console.error("  • Version mismatch between CLI and methodologies");
  console.error("  • Insufficient permissions for ~/.claude directory");
  console.error("  • Network issues downloading methodologies");
  console.error("\nRecovery steps:");
  console.error("  1. Try running manually:");
  console.error("     aichaku init --global");
  console.error("  2. If that fails, uninstall and retry:");
  console.error("     deno uninstall -g aichaku");
  console.error("     rm -rf ~/.claude/methodologies");
  console.error("  3. Then run this installer again");
  return false;
}
```

**Why:** Provides clear diagnosis and actionable recovery steps.

### 5. Better Upgrade Detection

**Before:**
```typescript
// Show version info
if (currentVersion) {
  console.log(`\n📦 Current: v${currentVersion}`);
  console.log(`📦 Latest:  v${latestVersion}`);
  console.log(`\n🔄 Upgrading...`);
} else {
  console.log(`\n📦 Installing v${latestVersion}...`);
}
```

**After:**
```typescript
// Show version info
const isUpgrade = !!currentVersion;
if (isUpgrade) {
  console.log(`\n🔄 Upgrading Aichaku...`);
  console.log(`   Current: v${currentVersion}`);
  console.log(`   Target:  v${latestVersion}`);
} else {
  console.log(`\n📦 Installing Aichaku v${latestVersion}...`);
}

// Install globally with version pinning
const installSuccess = await installGlobal(latestVersion, isUpgrade);
```

**Why:** Passes upgrade context to the install function for proper handling.

### 6. Clearer Already-Installed Handling

**Before:**
```typescript
if (currentVersion && !args.force) {
  console.log(`\n✅ Aichaku v${currentVersion} is already installed!`);
  console.log(
    `\n💡 Use --force to reinstall or upgrade to v${latestVersion}`,
  );
  // ...
}
```

**After:**
```typescript
if (currentVersion && !args.force) {
  if (currentVersion === latestVersion) {
    console.log(`\n✅ Aichaku v${currentVersion} is already installed and up to date!`);
    // ...
  } else {
    console.log(`\n📦 Update available!`);
    console.log(`   Current: v${currentVersion}`);
    console.log(`   Latest:  v${latestVersion}`);
    console.log(`\n💡 Use --force to upgrade`);
    return;
  }
}
```

**Why:** Distinguishes between "already latest" and "update available" scenarios.

### 7. Error Handling Wrapper

**Before:**
```typescript
// No try-catch around main flow
```

**After:**
```typescript
try {
  // ... main installation flow ...
} catch (error) {
  console.error("\n❌ Installation failed:", error.message);
  console.error("\nPlease report this issue:");
  console.error("https://github.com/RickCogley/aichaku/issues");
  Deno.exit(1);
}
```

**Why:** Catches unexpected errors and provides guidance on reporting issues.

## Summary of Fixes

1. **Version Pinning**: Ensures the correct version is downloaded from JSR
2. **Cache Control**: Uses `--reload` to bypass Deno's cache during upgrades
3. **Verification**: Confirms the installed version matches expectations
4. **Error Messages**: Provides detailed causes and recovery steps
5. **Flow Control**: Clearly distinguishes install vs upgrade scenarios
6. **Robustness**: Handles edge cases and unexpected errors gracefully

These changes ensure that:
- Upgrades actually install the new version
- Users understand what went wrong when failures occur
- Recovery paths are clear and actionable
- The installer is idempotent and safe to run multiple times