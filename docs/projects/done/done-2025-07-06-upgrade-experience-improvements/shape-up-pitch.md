# Pitch: Smart Upgrade Experience

## Problem

Users naturally assume that upgrading the CLI (`deno install...`) also upgrades
the methodologies. But these are separate:

- CLI tool = the program
- Methodologies = the data/content

This leads to confusion where users have v0.5.0 CLI but v0.4.0 methodologies.

## Appetite

Small batch - 1-2 hours. This is a quality-of-life improvement that prevents
confusion.

## Solution

### 1. Smart Upgrade Command

When running `aichaku upgrade`, detect version mismatch:

```typescript
// In upgrade command
const cliVersion = VERSION; // e.g., "0.5.0"
const globalMetadata = await readGlobalMetadata();
const methodologyVersion = globalMetadata.version; // e.g., "0.4.0"

if (cliVersion !== methodologyVersion) {
  console.log(`
⚠️  Version mismatch detected!
   CLI version:          v${cliVersion}
   Methodology version:  v${methodologyVersion}

Your CLI has been updated but methodologies are outdated.
Would you like to update methodologies now? [Y/n]: `);

  // If yes, run init --global --force
}
```

### 2. Post-Install Message

Create a postinstall script or message that appears after `deno install`:

```
✅ Aichaku CLI updated to v0.5.0!

📝 Next step: Update your global methodologies
   Run: aichaku init --global --force

This ensures your methodologies match your CLI version.
```

### 3. Version Status Command (Bonus)

Add `aichaku status` or enhance `--version`:

```
$ aichaku status
Aichaku Status:
  CLI Version:         v0.5.0 ✓
  Global Methods:      v0.4.0 ⚠️  (update available)

Run 'aichaku init --global --force' to update methodologies
```

## Rabbit Holes (NOT doing)

- Auto-updating methodologies without asking
- Complex version dependency management
- Breaking changes detection

## No-gos

- Don't auto-update without user consent
- Don't make upgrade more complex
