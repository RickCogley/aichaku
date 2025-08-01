# Shape Up Pitch: Eliminate metadata.yaml Duplication

## Problem

The aichaku standards loading architecture violates the DRY principle through metadata.yaml files that duplicate
information already present in individual standard YAML files. This creates maintenance overhead, user confusion, and
architectural inconsistency.

## Appetite

**Small batch: 1-2 weeks**

This is a targeted refactoring with clear scope boundaries. The changes are localized to the standards loader and won't
affect other systems.

## Solution

Replace the metadata.yaml approach with direct YAML file loading, following the successful patterns already established
in principles and methodologies loaders.

## How We Solved Similar Problems

### Principles Loader Success Pattern

The `PrincipleLoader` demonstrates the target architecture:

```typescript
// Discovers YAML files directly in category directories
for await (const entry of expandGlob(`${categoryPath}/*.yaml`)) {
  const principleWithDocs = await this.loadPrincipleWithDocs(entry.path);
  // No metadata.yaml needed - all info in the principle file
}
```

### Methodologies Approach

The methodologies command uses hardcoded data structures, avoiding filesystem duplication entirely:

```typescript
const AVAILABLE_METHODOLOGIES: Record<string, Methodology> = {
  "shape-up": {
    id: "shape-up",
    name: "Shape Up",
    description: "6-week cycles with appetite-based planning",
    // All metadata in one place
  },
};
```

## Current Duplication Evidence

### In metadata.yaml

```yaml
name: "Architecture Standards"
description: "Software architecture patterns and design principles"
standards:
  - id: "15-factor"
    name: "15-Factor Apps"
    description: "Modern cloud-native principles"
```

### In 15-factor.yaml (the SAME information)

```yaml
standard: 15-factor
name: "15-Factor App Methodology"
display:
  description: "Modern cloud-native application development methodology..."
```

**Result**: Users see confusing "(metadata)" entries in CLI output.

## Rabbit Holes

- **Don't rewrite the entire command infrastructure** - just the standards loader
- **Don't change the YAML file format** - the existing standard files are well-structured
- **Don't affect principles or methodologies** - they already work correctly

## No-Gos

- Adding more metadata files to principles or methodologies
- Changing the CLI interface or user experience
- Breaking existing standard file formats

## Technical Approach

### Phase 1: Standards Loader Refactor

Modify `StandardLoader.loadAll()` to:

1. **Remove metadata.yaml dependency**
   ```typescript
   // Current (BAD)
   if (entry.name !== "metadata.yaml") { ... }

   // Target (GOOD)  
   // Load all .yaml files directly like principles do
   ```

2. **Extract metadata from standard files directly**
   - Use the `name` field
   - Use the `display.description` field
   - Derive tags from content or add tags field to standards

3. **Category assignment from directory structure**
   - Category = parent directory name (already working)

### Phase 2: Cleanup

1. **Remove metadata.yaml files** from all standard directories
2. **Update tests** to reflect new loading pattern
3. **Verify CLI output** no longer shows "(metadata)" entries

## Expected Outcomes

### Immediate Benefits

- ✅ No more "(metadata)" entries in CLI
- ✅ Single source of truth for standard information
- ✅ Consistent loading patterns across loaders
- ✅ Reduced maintenance burden

### Long-term Benefits

- ✅ Easier to add new standards (one file, not two)
- ✅ Better architectural consistency
- ✅ Follows DRY principle correctly
- ✅ Simpler codebase for future developers

## Risk Assessment

### Low Risk

- **Localized changes**: Only affects standards loader
- **Proven patterns**: Copying successful principles approach
- **No breaking changes**: External interface remains the same

### Mitigation

- **Backup metadata.yaml files** before deletion
- **Thorough testing** of CLI commands
- **Gradual rollout** - implement loading first, cleanup second

## Success Metrics

1. **No "(metadata)" entries** in `aichaku standards --list` output
2. **All existing standards load correctly** with same information
3. **Code complexity reduced** (fewer files to maintain)
4. **DRY principle satisfied** - one source of truth per standard

## Why This Matters

This isn't just about code cleanliness - it's about **architectural integrity**. The current duplication:

- Confuses users with mysterious "(metadata)" entries
- Creates maintenance overhead requiring updates in two places
- Violates core software engineering principles we advocate
- Demonstrates inconsistency in our own codebase

By fixing this, we practice what we preach about clean, maintainable code architecture.

---

**Decision needed**: Proceed with implementation or explore alternatives?
