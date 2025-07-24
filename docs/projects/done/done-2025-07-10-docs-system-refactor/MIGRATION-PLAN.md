# Migration Plan: /references to /docs

## Overview

This document outlines the plan to migrate from `/references` to `/docs` and relocate auto-generated API documentation
to a subfolder.

## Current Structure

```
/references/              # Human-written documentation
├── tutorials/
├── how-to/
├── reference/
└── explanation/

/docs/                    # Auto-generated API docs
├── index.html
└── [other generated files]
```

## Proposed Structure

```
/docs/                    # All documentation (was /references)
├── tutorials/
├── how-to/
├── reference/
├── explanation/
└── api/                  # Auto-generated API docs (was /docs)
    ├── index.html
    └── [other generated files]
```

## Migration Steps

### 1. Update deno.json

```json
{
  "tasks": {
    // Change from:
    "doc": "deno doc --html --name=Aichaku ./mod.ts --output=./docs",
    // To:
    "doc": "deno doc --html --name=Aichaku ./mod.ts --output=./docs/api"
  }
}
```

### 2. File System Changes

```bash
# 1. Create new structure
mkdir -p docs/api

# 2. Move current auto-generated docs
mv docs/* docs/api/

# 3. Move references content to docs
mv references/* docs/

# 4. Remove old references directory
rmdir references

# 5. Update .gitignore
# Add: docs/api/ (since it's auto-generated)
```

### 3. Update All References

Files that need updating:

1. **README.md**
   - Change `/references/` links to `/docs/`
   - Update documentation section

2. **CONTRIBUTING.md**
   - Update documentation contribution guidelines
   - Change paths in examples

3. **All command files**
   - Update help text that mentions /references
   - Update any hardcoded paths

4. **Test files**
   - Update test paths
   - Ensure tests still pass

5. **Documentation linting**
   - Update default paths in docs-lint.ts
   - Update .diataxis file location

### 4. Update Cross-References

Search and replace needed:

```
/references/tutorials/     → /docs/tutorials/
/references/how-to/        → /docs/how-to/
/references/reference/     → /docs/reference/
/references/explanation/   → /docs/explanation/
```

### 5. CI/CD Updates

If any CI/CD pipelines reference documentation:

- Update paths in GitHub Actions
- Update documentation deployment scripts

## Benefits of This Change

1. **Convention**: `/docs` is the standard location developers expect
2. **GitHub Pages**: Works with default GitHub Pages settings
3. **Clarity**: `/docs/api/` clearly indicates auto-generated content
4. **Simplicity**: One documentation root with clear organization

## Rollback Plan

If issues arise:

```bash
# 1. Move files back
mv docs/tutorials docs/how-to docs/reference docs/explanation references/
mv docs/api/* docs/

# 2. Revert deno.json changes
git checkout -- deno.json

# 3. Revert other file changes
git checkout -- README.md CONTRIBUTING.md
```

## Testing Checklist

After migration:

- [ ] All documentation links work
- [ ] `deno task doc` generates to /docs/api/
- [ ] Documentation linting works with new paths
- [ ] All tests pass
- [ ] GitHub Pages (if used) still works
- [ ] No broken imports or references

## Timeline

1. **Immediate**: Update deno.json
2. **Next**: Move files
3. **Then**: Update all references
4. **Finally**: Test everything
5. **Verify**: Run full test suite

## Command Sequence

```bash
# Execute migration
mkdir -p docs/api
mv docs/* docs/api/ 2>/dev/null || true
mv references/* docs/
rmdir references

# Update deno.json (manually edit)

# Test
deno task doc
deno task docs:lint docs/
deno task test
```

This migration maintains all functionality while moving to a more conventional structure.
