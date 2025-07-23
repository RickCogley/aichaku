# Dynamic Content Fetcher

## Problem

The current content-fetcher.ts has hard-coded file structures that get out of
sync with the actual repository contents. This causes:

- False "failure" messages during upgrades (e.g., "3 files failed")

- Missing files that exist in the repo but aren't in the hard-coded list

- Maintenance burden - every file addition/removal requires code changes

- User confusion when upgrades report failures for non-existent files

## Appetite

6 weeks - This is infrastructure that affects every user's upgrade experience.

## Solution

Replace the hard-coded file structures with a dynamic system that:

1. **Fetches file listings from GitHub** at runtime

   - Use GitHub API to list directory contents

   - Build the structure dynamically from actual files

   - Cache the structure for performance

2. **Fallback to bundled manifest**

   - Include a generated manifest file with each release

   - Use as fallback if GitHub API is unavailable

   - Auto-generate during release process

3. **Better error handling**

   - Distinguish between "file doesn't exist" vs "network error"

   - Only report actual failures, not missing files

   - Provide actionable error messages

### Sketch

````typescript
// Instead of hard-coded structure:
async function fetchMethodologyStructure(
  version: string,
): Promise<FileStructure> {
  try {
    // Try GitHub API first
    return await fetchStructureFromGitHub("methodologies", version);
  } catch {
    // Fall back to bundled manifest
    return await loadBundledManifest("methodologies", version);
  }
}

// Generate manifest during build
async function generateManifest() {
  const files = await walkDirectory("./methodologies");
  await Deno.writeTextFile(
    "./manifests/methodologies.json",
    JSON.stringify(files),
  );
}
```text

## Rabbit Holes

- **Not** building a complex caching system - simple in-memory cache is enough

- **Not** trying to version individual files - whole methodology set is
  versioned together

- **Not** implementing partial updates - full methodology refresh on upgrade

- **Not** adding file watching or sync features

## No-gos

- Hard-coding any file paths

- Breaking backward compatibility

- Requiring GitHub API access (must have offline fallback)

- Increasing complexity for maintainers

## Nice-to-haves

- Progress indicator showing which files are being fetched

- Dry-run mode that shows what would be fetched

- Ability to fetch from branches/PRs for testing

- Checksum validation for downloaded files
````
