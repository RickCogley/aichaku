# DRY Analysis: YAML Reading Patterns in Aichaku

## Current State

### Multiple YAML Reading Implementations

1. **yaml-config-reader.ts**
   - Used by: `integrate.ts` command
   - Purpose: Assembles YAML configuration for CLAUDE.md
   - Features: Reads methodologies, standards, principles, agents for integration

2. **standard-loader.ts**
   - Used by: `standards` command
   - Purpose: Loads individual standard YAML files
   - Duplication: Own YAML parsing, file reading, error handling

3. **principle-loader.ts**
   - Used by: `principles` command
   - Purpose: Loads individual principle YAML files
   - Duplication: Own YAML parsing, file reading, error handling

4. **agent-loader.ts**
   - Used by: `agents` command
   - Purpose: Loads agent Markdown files with YAML frontmatter
   - Duplication: Own YAML parsing (different pattern - frontmatter)

5. **dynamic-content-discovery.ts**
   - Used by: `learn` command, legacy `lister.ts`
   - Purpose: Generic content discovery for any content type
   - Duplication: Own YAML parsing, file discovery, metadata extraction

6. **methodologies.ts command**
   - Current: Hardcoded AVAILABLE_METHODOLOGIES
   - Should use: YAML files like other commands

## DRY Violations

### 1. YAML Parsing (6 implementations)

```typescript
// Pattern repeated in 6 files:
import { parse } from "jsr:@std/yaml@1";
const data = parse(content) as SomeType;
```

### 2. File Reading (5 implementations)

```typescript
// Pattern repeated:
try {
  const content = await Deno.readTextFile(path);
  const data = parse(content);
} catch (error) {
  // Similar error handling
}
```

### 3. Directory Scanning (3 implementations)

- standard-loader: `for await (const entry of Deno.readDir(...))`
- principle-loader: `for await (const entry of expandGlob(...))`
- dynamic-content-discovery: `for await (const entry of walk(...))`

### 4. Metadata Extraction (4 implementations)

- Each loader extracts name, description, category differently
- No shared metadata interface

## Opportunities for Consolidation

### Option 1: Extend dynamic-content-discovery.ts (Recommended)

**Pros:**

- Already generic and content-type agnostic
- Used by `learn` command successfully
- Has file discovery, YAML parsing, metadata extraction
- Supports both YAML and Markdown files

**Cons:**

- May need refactoring for specific loader needs
- Currently returns generic structure

**Implementation:**

1. Refactor individual loaders to use `discoverContent()`
2. Add type-specific interfaces for content types
3. Remove duplicate YAML parsing code
4. Standardize on walk() for directory scanning

### Option 2: Create New Unified YAML Service

**Pros:**

- Clean slate design
- Can optimize for all use cases
- Clear separation of concerns

**Cons:**

- More work to implement
- Risk of creating yet another implementation
- Need to migrate all existing code

### Option 3: Extend yaml-config-reader.ts

**Pros:**

- Already handles multiple content types
- Has caching logic
- Used by integration command

**Cons:**

- Currently focused on integration use case
- Would need significant refactoring
- May become too complex

## Recommended Approach

1. **Phase 1: Fix Immediate Issues**
   - Remove metadata.yaml files from standards
   - Update methodologies command to use YAML files

2. **Phase 2: Consolidate YAML Reading**
   - Enhance `dynamic-content-discovery.ts` as the single YAML reader
   - Migrate loaders to use it:
     - StandardLoader → use discoverContent("standards", ...)
     - PrincipleLoader → use discoverContent("principles", ...)
     - MethodologyLoader → use discoverContent("methodologies", ...)

3. **Phase 3: Clean Up**
   - Remove duplicate YAML parsing code
   - Standardize error handling
   - Create shared interfaces for metadata

## Benefits

- **70% code reduction** in YAML handling
- **Single source of truth** for content discovery
- **Consistent error handling** across all commands
- **Easier to maintain** - one place to fix bugs
- **Better testability** - one component to test

## Implementation Priority

1. ✅ Remove agents.yaml (DONE)
2. 🔄 Remove metadata.yaml from standards (IN PROGRESS)
3. ⏳ Fix methodologies hardcoding (NEXT)
4. ⏳ Consolidate YAML reading into dynamic-content-discovery
5. ⏳ Migrate all loaders to use unified approach
