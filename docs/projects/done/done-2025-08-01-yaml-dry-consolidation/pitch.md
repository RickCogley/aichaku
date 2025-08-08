# Shape Up Pitch: YAML DRY Consolidation

## Problem

Aichaku has evolved to have 6 different YAML parsing implementations, violating the DRY principle we advocate. Each
command reimplements file reading, YAML parsing, error handling, and metadata extraction. Additionally, our search
functionality is too literal - users expect fuzzy/smart search like fzf on the command line.

This creates:

- **Maintenance burden**: Bug fixes must be applied in 6 places
- **Inconsistent behavior**: Each implementation handles errors differently
- **Wasted effort**: ~70% of YAML handling code is duplicated
- **Confusion**: Developers unsure which pattern to follow
- **Poor search UX**: Searching "test" doesn't find "bdd", "tdd", or "test-pyramid"

## Appetite

**Circuit Breaker: 3 weeks**

This is significant technical debt that affects maintainability but has clear boundaries. We can phase the work to
deliver value incrementally.

## Solution

Consolidate all YAML operations around the existing `dynamic-content-discovery.ts` module, which already provides
generic content loading for any type. This creates a single source of truth for YAML operations.

### Why dynamic-content-discovery.ts?

1. **Already generic**: Handles methodologies, standards, principles, and core content
2. **Battle-tested**: Successfully used by the `learn` command
3. **Feature-complete**: Has file discovery, YAML parsing, metadata extraction
4. **Well-structured**: Clean separation between discovery and parsing

## Approach

### Phase 1: Immediate Fixes (Week 1)

Fix the pressing issues that affect users:

1. **Remove metadata.yaml files** from standards directories
   - Eliminates "(metadata)" entries in CLI
   - Updates StandardLoader to work without them

2. **Fix methodologies hardcoding**
   - Replace AVAILABLE_METHODOLOGIES constant
   - Load from YAML files like other content types

### Phase 2: Create Unified Interface (Week 2)

Enhance dynamic-content-discovery.ts:

1. **Add typed content loading**
   ```typescript
   async function loadContent<T>(
     type: ContentType,
     basePath: string,
   ): Promise<T[]>;
   ```

2. **Standardize metadata interface**
   ```typescript
   interface ContentMetadata {
     id: string;
     name: string;
     description: string;
     category?: string;
     tags?: string[];
     content?: string; // Full text for fuzzy search
   }
   ```

3. **Add fuzzy search capabilities**
   - Integrate Fuse.js for intelligent search
   - Search across name, description, tags, and content
   - Return relevance scores
   - Enable cross-content-type searches ("test" finds testing-related items)

4. **Add caching layer** for performance

### Phase 3: Migration (Week 3)

Migrate existing loaders to use unified approach:

1. **StandardLoader**: Use `loadContent<Standard>("standards", ...)`
2. **PrincipleLoader**: Use `loadContent<Principle>("principles", ...)`
3. **MethodologyLoader**: Create new loader using dynamic discovery
4. **Keep yaml-config-reader.ts**: It serves a different purpose (integration)

## Rabbit Holes

### Don't Create Another Implementation

- **Risk**: Creating a "new and better" YAML service
- **Avoid**: Enhance existing dynamic-content-discovery.ts instead

### Don't Over-Engineer Search

- **Risk**: Building complex search indexes, custom algorithms
- **Avoid**: Use proven library (Fuse.js) with sensible defaults

### Don't Over-Engineer Caching

- **Risk**: Adding complex caching, validation, transformations
- **Avoid**: Keep it simple - read, parse, cache, return

### Don't Break External APIs

- **Risk**: Changing command interfaces
- **Avoid**: Keep loader interfaces compatible

### Don't Migrate Everything

- **Risk**: Trying to consolidate configuration files too
- **Avoid**: Focus only on content YAML files

## No-Gos

- Changing the YAML file formats
- Breaking existing CLI commands
- Modifying integration behavior
- Adding new dependencies

## Success Metrics

### Immediate (End of Week 1)

- ✅ No "(metadata)" entries in standards list
- ✅ Methodologies load from YAML files
- ✅ All existing commands work unchanged

### Short-term (End of Project)

- ✅ Single YAML parsing implementation
- ✅ 70% reduction in YAML-related code
- ✅ Consistent error handling across commands
- ✅ Fuzzy search works across all content types
- ✅ Search "test" finds "bdd", "tdd", "test-pyramid"
- ✅ Search "agile" finds "scrum", "kanban", "lean"
- ✅ Search "simple" finds "kiss", "yagni", "dry"
- ✅ All tests passing

### Long-term

- ✅ Easier to add new content types
- ✅ Single place to fix YAML bugs
- ✅ New developers understand the pattern
- ✅ Faster command execution (cached reads)
- ✅ User-friendly search experience matching CLI expectations

## Technical Details

### Current State

```
6 implementations × ~100 lines each = 600 lines of YAML code
Each implements: file reading + parsing + error handling + metadata
Literal search only: "test" != "bdd"
```

### Target State

```
1 implementation × 200 lines = 200 lines of YAML code
Shared by all loaders through clean interfaces
Fuzzy search with Fuse.js integration
67% code reduction (accounting for search features)
```

### Fuzzy Search Implementation

```typescript
// Add to dynamic-content-discovery.ts
import Fuse from "npm:fuse.js@7";

interface SearchableContent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
  content?: string;
}

const searchOptions = {
  keys: [
    { name: "name", weight: 0.3 },
    { name: "description", weight: 0.2 },
    { name: "tags", weight: 0.2 },
    { name: "content", weight: 0.3 },
  ],
  threshold: 0.4, // 0 = exact match, 1 = anything
  includeScore: true,
};

export async function fuzzySearch(
  query: string,
  contentTypes: ContentType[] = ["standards", "methodologies", "principles"],
): Promise<Array<{ item: SearchableContent; score: number }>> {
  const allContent = await loadAllContent(contentTypes);
  const fuse = new Fuse(allContent, searchOptions);
  return fuse.search(query);
}
```

### Migration Example

```typescript
// Before (in standard-loader.ts)
const content = await Deno.readTextFile(filePath);
const data = parse(content) as Standard;

// Literal search
const filtered = standards.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

// After
const standards = await loadContent<Standard>("standards", basePath);

// Fuzzy search
const results = await fuzzySearch(query, ["standards"]);
// "test" now finds "bdd", "tdd", "test-pyramid"
```

## Risks

### Low Risk

- **Well-understood problem**: We know exactly what needs consolidation
- **Incremental approach**: Can deliver value each week
- **Fallback options**: Can keep some implementations if needed

### Mitigation

- **Comprehensive tests**: Before refactoring
- **Parallel implementation**: New alongside old
- **Gradual cutover**: One command at a time

## Why Now?

1. **Active development**: Multiple new features need YAML loading
2. **User confusion**: "(metadata)" entries are visible bugs
3. **Technical debt**: Getting worse with each new feature
4. **Clear solution**: dynamic-content-discovery.ts already works

This consolidation will make aichaku more maintainable, faster, and easier to extend - living up to the DRY principle we
advocate.
