# Shape: Display Methodology Installation Path

## Problem

The installer shows where the aichaku command is installed (`/Users/rcogley/.deno/bin/aichaku`) but doesn't show where
the methodologies are installed. Users need to know both locations for transparency and troubleshooting.

## Appetite

Small batch - 30 minutes

## Solution

Update the installer output to clearly show both:

1. Where the CLI command is installed
2. Where the methodologies are installed

### Current Output

```
✅ Successfully installed aichaku
/Users/rcogley/.deno/bin/aichaku
   • Verifying installation...
   ✓ Installation verified

🌍 Setting up global methodologies...
   ✓ User customizations preserved
   ✓ Output directories created
```

### Proposed Output

```
✅ Successfully installed aichaku
📍 CLI: /Users/rcogley/.deno/bin/aichaku
📚 Methodologies: /Users/rcogley/.claude/methodologies
   • Verifying installation...
   ✓ Installation verified

🌍 Setting up global methodologies...
   ✓ User customizations preserved
   ✓ Output directories created
```

## Implementation

1. Update `init.ts` installer to show both paths
2. Use consistent icons (📍 for location, 📚 for methodologies)
3. Keep the format clean and scannable

## Rabbit Holes

- Don't add verbose directory listings
- Don't show internal file structure
- Keep it to just the two key paths

## No-gos

- No changes to the actual installation process
- No additional file system operations
- No changes to methodology storage location
