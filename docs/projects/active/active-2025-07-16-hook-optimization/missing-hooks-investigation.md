# Missing Hooks File Investigation

## Issue Identified

The aichaku project's settings.json references a hooks file that doesn't exist
in the source code:

**Referenced Path:** `~/.claude/aichaku/hooks/aichaku-hooks.ts` **Issue:** This
file doesn't exist in the aichaku source repository

## Impact

Users cannot actually use the hooks system because:

1. The settings.json points to a non-existent file

2. Users have no way to install or access the aichaku-hooks.ts file

3. The hooks functionality appears broken for end users

## Evidence

### Settings.json References

From `/Users/rcogley/.claude/settings.json`:

````json
{
  "hooks": {
    "PreToolUse": [
      {
        "command": "deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts path-validator"
      }
    ],
    "PostToolUse": [
      {
        "command": "deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts status-updater"
      }
    ]
  }
}
```text

### Source Code Search Results

- No `aichaku-hooks.ts` file found in the repository

- Hooks-related documentation exists but not the actual implementation

- Related files found in `/scratch/` and `/docs/projects/` but not the main
  hooks file

## Required Actions

### Immediate

1. **Locate the missing hooks file** - Check if it exists elsewhere in the
   development environment

2. **Add to source control** - Include aichaku-hooks.ts in the repository

3. **Create installation process** - Users need a way to install hooks

### Medium Term

1. **Documentation updates** - Update installation guides to include hooks setup

2. **Testing** - Verify hooks work for end users

3. **Release notes** - Document hooks availability and setup

### Long Term

1. **Package hooks properly** - Include in aichaku distribution

2. **Version management** - Ensure hooks versions match aichaku versions

3. **User experience** - Make hooks installation seamless

## Investigation Results ✅

### 1. File Location Confirmed

- **File exists**: `/Users/rcogley/.claude/aichaku/hooks/aichaku-hooks.ts`
  (51,564 bytes)

- **Generated dynamically**: Created by `src/commands/hooks.ts` during
  installation

- **Not in source control**: File is generated, not committed to repository

### 2. Root Cause Analysis

The hooks system uses a **dynamic generation approach**:

1. **Template in Source**: `src/commands/hooks.ts` contains hook templates and
   generation logic

2. **Installation Process**: `ensureHookScripts()` function (lines 465-618)
   generates `aichaku-hooks.ts`

3. **User Installation**: Users must run `aichaku hooks --install <category>` to
   generate the file

### 3. Current Architecture

```text
src/commands/hooks.ts (source)
    ↓ (generates during installation)
~/.claude/aichaku/hooks/aichaku-hooks.ts (user's machine)
    ↓ (referenced by)
~/.claude/settings.json (hooks configuration)
```text

### 4. Why It's Not in Source

The file is **intentionally generated** because:

- Contains dynamic hook implementations based on templates

- Customizable per user installation

- Includes runtime logic for different hook types

- Can be updated without changing source code

## Resolution Strategy

### ✅ No Action Required

The current architecture is **working as designed**:

1. **Developer Environment**: File exists because hooks were installed locally

2. **User Experience**: Users run `aichaku hooks --install essential` to
   generate the file

3. **Distribution**: Hook templates are in source, runtime is generated

### Documentation Enhancement Needed

The installation process should be better documented:

1. **Installation Guide**: Clear steps for hook setup

2. **First-Run Experience**: Prompt users to install hooks

3. **Error Handling**: Better error messages when hooks file is missing

## Priority: Low (Working as Designed)

The hooks system is functioning correctly. The "missing file" is actually
generated during proper installation flow. This is a documentation/UX issue, not
a technical problem.
````
