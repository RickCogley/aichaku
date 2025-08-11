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

## Phase 4: Add Tree Output Using Deno's Walk

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
await displayCustomTree(targetPath);
```

### Add Tree Display Function Using Deno's Walk

Add this helper function to upgrade.ts:

```typescript
import { walk } from "jsr:@std/fs/walk";

/**
 * Display a tree view of the installation directory using Deno's walk function.
 * This provides a consistent cross-platform tree display with custom formatting.
 */
async function displayCustomTree(rootPath: string): Promise<void> {
  const tree: Map<string, string[]> = new Map();
  const maxDepth = 3; // Show 3 levels deep to see agents and important subdirs

  // Collect all paths using Deno's walk
  for await (const entry of walk(rootPath, { maxDepth, includeDirs: true, includeFiles: true })) {
    const relativePath = entry.path.replace(rootPath + "/", "");
    const parts = relativePath.split("/");

    // Skip the root itself
    if (parts.length === 0 || relativePath === "") continue;

    // Build parent path
    const parentPath = parts.slice(0, -1).join("/");
    if (!tree.has(parentPath)) {
      tree.set(parentPath, []);
    }

    // Add to parent's children
    const name = parts[parts.length - 1];
    const children = tree.get(parentPath)!;
    children.push(entry.isDirectory ? name + "/" : name);
  }

  // Display tree recursively
  function printTree(path: string, prefix: string, isLast: boolean): void {
    const children = tree.get(path) || [];
    children.sort((a, b) => {
      // Directories first
      const aIsDir = a.endsWith("/");
      const bIsDir = b.endsWith("/");
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    children.forEach((child, index) => {
      const isLastChild = index === children.length - 1;
      const connector = isLastChild ? "└── " : "├── ";
      const name = child.endsWith("/") ? child.slice(0, -1) : child;

      // Special highlighting for important directories
      let displayName = name;
      if (name === "agent-templates") {
        displayName = `${name}/ (${tree.get(path + "/" + name)?.length || 0} agents)`;
      } else if (name === "methodologies") {
        displayName = `${name}/ (${tree.get(path + "/" + name)?.length || 0} items)`;
      } else if (name === "standards") {
        displayName = `${name}/ (${tree.get(path + "/" + name)?.length || 0} items)`;
      }

      console.log(`   ${prefix}${connector}${displayName}`);

      // Recurse for directories
      if (child.endsWith("/")) {
        const newPrefix = prefix + (isLastChild ? "    " : "│   ");
        const childPath = path ? path + "/" + name : name;
        printTree(childPath, newPrefix, isLastChild);
      }
    });
  }

  // Start printing from root
  printTree("", "", false);
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
