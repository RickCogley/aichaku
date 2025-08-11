# Implementation Plan: Fix Upgrade Process and Messaging

## Phase 1: Fix Force Overwrite (CRITICAL)

### Files to modify:

- `src/commands/upgrade.ts`
- `src/commands/content-fetcher.ts`

### Changes:

1. **In upgrade.ts** (~line 345-350):

```typescript
// Determine if we should force overwrite (when upgrading versions)
const shouldForceOverwrite = metadata.version !== VERSION || options.force;

const fetchSuccess = await fetchCore(
  paths.global.core,
  VERSION,
  {
    silent: options.silent,
    overwrite: shouldForceOverwrite, // Force when versions differ
  },
);
```

2. **Apply same logic to methodologies and standards fetching**

## Phase 2: Improve Version Mismatch Messaging

### In upgrade.ts (~line 155-170):

**Current:**

```typescript
console.warn(`⚠️  Version mismatch detected:`);
console.warn(`   CLI version:    v${VERSION}`);
console.warn(`   Global files:   v${metadata.version}\n`);
console.warn(`   Run 'aichaku upgrade --global' to update global files to match CLI.\n`);
```

**Change to:**

```typescript
console.warn(`⚠️  Upgrade available:`);
console.warn(`   Global files:   v${metadata.version}`);
console.warn(`   CLI version:    v${VERSION}\n`);
// Remove the "Run 'aichaku upgrade' message - they're already running it!
```

## Phase 3: Update "Growing" Message

### In upgrade.ts (~line 200):

**Current:**

```typescript
Brand.success(`🪴 Aichaku: Growing from v${metadata.version} to v${VERSION}...`);
```

**Change to:**

```typescript
Brand.success(`🪴 Aichaku: Seeding global files from v${metadata.version} to v${VERSION} to match CLI…`);
```

## Phase 4: Add Real Tree Output

### In upgrade.ts (at end of upgrade function, ~line 450):

**Replace:**

```typescript
console.log(`📁 Installation location: ${targetPath}/`);
console.log(`   ├── methodologies/ (${methodologyCount} files verified/updated)`);
console.log(`   ├── standards/ (${standardsCount} files verified/updated)`);
console.log(`   ├── user/ (preserved - your customizations)`);
console.log(`   └── config.json (metadata updated to v${VERSION})`);
```

**With:**

```typescript
console.log(`📁 Global installation location: ${targetPath}/`);

// Try to use tree command if available
try {
  const treeCmd = new Deno.Command("tree", {
    args: ["-L", "2", "--dirsfirst", targetPath],
  });
  const output = await treeCmd.output();
  if (output.success) {
    const treeOutput = new TextDecoder().decode(output.stdout);
    // Skip first line (it's the path again) and indent the rest
    const lines = treeOutput.split("\n").slice(1);
    console.log(lines.map((line) => "   " + line).join("\n"));
  } else {
    throw new Error("tree command failed");
  }
} catch {
  // Fallback to manual structure if tree isn't available
  console.log(`   ├── methodologies/`);
  console.log(`   ├── standards/`);
  console.log(`   ├── docs/`);
  console.log(`   │   └── core/`);
  console.log(`   ├── user/`);
  console.log(`   └── aichaku.json`);
}
```

## Phase 5: Update Final Message

**Current:**

```typescript
console.log(`\n💡 All your projects now have the latest methodologies!`);
```

**Change to:**

```typescript
console.log(`\n💡 All your projects now have the latest Aichaku core files!`);
```

## Phase 6: Track Updated vs Verified Files

In `content-fetcher.ts`, maintain separate counts:

- `updatedCount` - files that were actually downloaded and overwritten
- `verifiedCount` - files that existed and were skipped

Then report accurately: "23 files updated, 27 files verified"

## Testing Checklist

- [ ] Test upgrade from older version (should overwrite all files)
- [ ] Test upgrade when already on latest (should skip gracefully)
- [ ] Test with --force flag (should still work)
- [ ] Test tree output on system with tree command
- [ ] Test tree fallback on system without tree command
- [ ] Verify Truth Protocol files are updated without --force
- [ ] Check all messaging is clear and helpful
