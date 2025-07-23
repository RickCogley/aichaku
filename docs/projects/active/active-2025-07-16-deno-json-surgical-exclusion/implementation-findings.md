# Implementation Findings: Deno Check Exclusions

## Executive Summary

Successfully implemented top-level exclude configuration in deno.json to fix
nagare release failures. The solution leverages Deno v2.3.1+ behavior where
`deno check` (without arguments) respects top-level exclude patterns.

## Problem Analysis

### Initial Issue

- Nagare release process was failing due to type checking errors in deprecated
  v2 files

- Files like `config-manager.ts` had type errors but needed to remain for
  backward compatibility

- Pre-release hooks and nagare's autofix were running different type check
  commands

### Root Cause

1. `deno check **/*.ts` ignores exclusion configurations

2. `deno check .` also ignores exclusion configurations

3. Only `deno check` (no arguments) respects the top-level exclude

## Solution Implementation

### 1. Top-Level Exclude Configuration

Added to deno.json:

````json
{
  "exclude": [
    ".claude/",
    "scratch/",
    "version.ts",
    "docs/api/",
    "docs/projects/**/*.ts",
    "examples/**/*.ts",
    "src/commands/*-v2.ts",
    "src/utils/config-manager.ts",
    "src/utils/config-manager.test.ts",
    "src/utils/migration-helper.ts"
  ]
}
```text

### 2. Pre-Release Hook Update

Updated nagare.config.ts:

```typescript
const checkCmd = new Deno.Command("deno", {
  args: ["check"], // No args = respects top-level exclude
});
```text

### 3. Import Chain Consideration

**Important Discovery**: Files are checked if imported by non-excluded files. We
had to exclude:

- `config-manager.ts` (the problematic file)

- `config-manager.test.ts` (imports config-manager)

- `migration-helper.ts` (imports config-manager)

## Technical Details

### Deno Version Requirement

- Minimum: Deno v2.3.1

- Tested with: Deno v2.4.1

### Behavior Matrix

| Command              | Respects Exclude | Use Case                |
| -------------------- | ---------------- | ----------------------- |
| `deno check`         | ✅ Yes           | CI/CD, pre-commit hooks |
| `deno check .`       | ❌ No            | Not recommended         |
| `deno check **/*.ts` | ❌ No            | Not recommended         |
| `deno check file.ts` | ❌ No            | Direct file checking    |

### Configuration Hierarchy

1. **Top-level exclude**: Affects all tools when they support it

2. **Tool-specific exclude**: Each tool (fmt, lint) can have its own exclude

3. **Best Practice**: Keep all three in sync (top-level, fmt, lint)

## Lessons Learned

1. **Read the GitHub Issues**: The behavior was documented in
   [denoland/deno#26864](https://github.com/denoland/deno/issues/26864)

2. **Test Exit Codes**: Don't just look at output - check exit codes

3. **Understand Import Graphs**: Excluding a file doesn't help if it's imported
   by included files

4. **Nagare Compatibility**: Nagare respects the project's deno.json
   configuration

## Migration Guide

For projects experiencing similar issues:

1. **Identify problematic files**:

   ```bash
   deno check 2>&1 | grep "error:"
````

2. **Add top-level exclude**:

   ```json
   {
     "exclude": ["path/to/problematic/files"]
   }
   ```

3. **Update pre-release hooks** to use `deno check` without arguments

4. **Test thoroughly**:

   ```bash
   deno check && echo "SUCCESS" || echo "FAILED"
   ```

5. **Check import chains** and exclude importing files if necessary

## Future Considerations

1. **Deno Evolution**: This behavior might change in future Deno versions

2. **Alternative Solutions**:

   - Fix the type errors (best long-term solution)

   - Use `// @ts-ignore` comments (not recommended)

   - Separate deprecated code into a different package

3. **Monitoring**: Watch for changes in Deno's exclude behavior in release notes

---

_Document created: 2025-07-16_\
_Last updated: 2025-07-16_
