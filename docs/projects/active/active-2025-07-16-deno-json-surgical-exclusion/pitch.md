# Shape Up Pitch: Surgical Deno Tool Exclusions via deno.json

## Problem

The current nagare release process fails because `deno lint` and `deno check`
scan ALL TypeScript files in the project, including problematic v2 files and
development directories that have intentional type errors. Our current
workaround disables nagare's built-in type checking entirely, which reduces
safety.

**Current pain points:**

- V2 files (`init-v2.ts`, `upgrade-v2.ts`, `migrate-v2.ts`, `config-manager.ts`)
  have type errors

- Development files in `docs/projects/`, `scratch/`, `examples/` have
  experimental code

- We're working around the tools instead of configuring them properly

- Nagare's safety checks are disabled, reducing release confidence

## Appetite

**2 days** - This is a small, focused improvement that should be straightforward
to implement.

## Solution

Configure `deno.json` with surgical exclusion patterns that make `deno lint` and
`deno check` automatically skip problematic files. This works at the tool level,
so both our custom pre-release hooks AND nagare's built-in checks will respect
the exclusions.

### Key Insight

Instead of fighting the tools, configure them to ignore what we don't want
checked. Deno's configuration system supports this natively.

## Betting Table

### What we're betting on:

1. **Deno.json exclusions work reliably** - Deno's exclude patterns are
   well-documented and stable

2. **Nagare respects deno.json config** - Since nagare uses
   `deno lint`/`deno check`, it should inherit our exclusions

3. **Surgical exclusions don't break anything** - We're only excluding known
   problematic files

### What we're not betting on:

- Rewriting the entire build system

- Fixing all the v2 file type errors

- Changing nagare's core behavior

## Rabbit Holes

- **Over-excluding**: Don't exclude too much - only the known problematic files

- **Testing edge cases**: Don't spend time testing every possible deno.json
  pattern

- **Perfectionism**: Don't try to make the exclusions cover future unknown
  issues

## No-Gos

- Don't fix the type errors in v2 files (they're intentionally deprecated)

- Don't change nagare's core functionality

- Don't disable all safety checks

## Implementation Plan

1. **Add exclusion patterns to deno.json** for:

   - `src/commands/*-v2.ts` (deprecated v2 files)

   - `src/utils/config-manager.ts` and `src/utils/migration-helper.ts` (v2
     dependencies)

   - `docs/projects/**/*.ts` (development documentation)

   - `scratch/**/*.ts` (experimental code)

   - `examples/**/*.ts` (example code)

2. **Re-enable nagare's built-in type checking** in `nagare.config.ts`

3. **Test the release process** to ensure both pre-release hooks and nagare's
   checks work

4. **Clean up pre-release hooks** to remove the explicit file lists (now handled
   by deno.json)

## Success Metrics

- ✅ Nagare release completes successfully with all checks enabled

- ✅ Both pre-release hooks and nagare built-in checks skip problematic files

- ✅ No false positives from development/experimental files

- ✅ Production files are still fully linted and type-checked

## Circuit Breaker

If deno.json exclusions don't work as expected, fall back to the current
approach of disabling nagare's built-in type checking. The release works now,
we're just making it more robust.

---

**Ready to bet?** This improves the reliability of our release process while
maintaining safety checks. The solution is surgical, well-scoped, and has a
clear fallback plan.
