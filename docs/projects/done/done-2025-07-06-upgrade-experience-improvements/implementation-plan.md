# Implementation Plan: Upgrade Experience

## Phase 1: Enhance Upgrade Command (30 min)

### Modify `src/commands/upgrade.ts`

1. Check both CLI and methodology versions

2. Detect mismatches

3. Prompt user to update if needed

````typescript
// At the start of upgrade command
if (!isGlobal) {
  // Check global version
  const globalPath = join(Deno.env.get("HOME") || "", ".claude");
  const globalMetadata = await readMetadata(join(globalPath, ".aichaku.json"));

  if (globalMetadata && globalMetadata.version !== VERSION) {
    console.log(`
⚠️  Version mismatch detected!
   CLI version:          v${VERSION}
   Global methodologies: v${globalMetadata.version}

Your methodologies are outdated. Update them first:

  aichaku init --global --force

Then run 'aichaku upgrade' again.`);

    return {
      success: false,
      message: "Please update global methodologies first",
      action: "error",
    };
  }
}
```text

## Phase 2: Add Version Status (20 min)

### Enhance `--version` flag in CLI

Instead of just showing CLI version, show full status:

```typescript
if (args.version) {
  console.log(`Aichaku v${VERSION}`);

  // Check global installation
  const globalPath = join(Deno.env.get("HOME") || "", ".claude");
  try {
    const metadata = JSON.parse(
      await Deno.readTextFile(join(globalPath, ".aichaku.json")),
    );

    if (metadata.version !== VERSION) {
      console.log(`
⚠️  Global methodologies: v${metadata.version} (outdated)
   Run: aichaku init --global --force`);
    } else {
      console.log(`✓ Global methodologies: v${metadata.version}`);
    }
  } catch {
    console.log("ℹ️  No global installation found");
  }

  Deno.exit(0);
}
```text

## Phase 3: Post-Install Message (30 min)

### Option A: Add to README install instructions

Make it crystal clear in docs

### Option B: Create install wrapper script

```bash
#!/bin/bash
deno install -g -A -n aichaku --force "$@"
echo ""
echo "✅ Aichaku CLI installed!"
echo ""
echo "📝 Don't forget to update methodologies:"
echo "   aichaku init --global --force"
```text

### Option C: First-run detection

When CLI version > methodology version, show reminder

## Phase 4: Test & Refine (20 min)

1. Test upgrade from 0.4.0 → 0.5.0

2. Test fresh install

3. Refine messages for clarity
````
