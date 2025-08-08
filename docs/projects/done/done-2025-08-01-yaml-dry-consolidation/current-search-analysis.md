# Current Search Implementation Analysis

## Overview

This document analyzes the existing search implementations across Aichaku's loaders to understand what needs to be
consolidated and enhanced with fuzzy search.

## Current Search Implementations

### 1. StandardLoader.search()

**File**: `/src/utils/standard-loader.ts` (Lines 85-95)

```typescript
async search(query: string): Promise<Standard[]> {
  const all = await this.loadAll();
  const lowerQuery = query.toLowerCase();

  return all.filter((standard) =>
    standard.id.toLowerCase().includes(lowerQuery) ||
    standard.name.toLowerCase().includes(lowerQuery) ||
    (standard.description?.toLowerCase().includes(lowerQuery) ?? false) ||
    (standard.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ?? false)
  );
}
```

**Search Fields**:

- `id` (exact match)
- `name` (substring match)
- `description` (substring match)
- `tags` (array element match)

**Limitations**:

- Literal string matching only
- Case-insensitive but no fuzzy matching
- No relevance scoring
- No cross-field weighting

### 2. PrincipleLoader.search()

**File**: `/src/utils/principle-loader.ts` (Lines 286-302)

```typescript
async search(query: string): Promise<Principle[]> {
  const lowerQuery = query.toLowerCase();
  const allPrinciples = await this.loadAll();

  return allPrinciples.filter((p) => {
    return (
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.summary?.tagline?.toLowerCase().includes(lowerQuery) ||
      p.aliases?.some((alias) => alias.toLowerCase().includes(lowerQuery)) ||
      p.summary?.core_tenets?.some((tenet) =>
        tenet.text.toLowerCase().includes(lowerQuery) ||
        tenet.guidance?.toLowerCase().includes(lowerQuery)
      )
    );
  });
}
```

**Search Fields**:

- `name` (substring match)
- `description` (substring match)
- `summary.tagline` (substring match)
- `aliases` (array element match)
- `summary.core_tenets.text` (nested array match)
- `summary.core_tenets.guidance` (nested array match)

**Limitations**:

- More comprehensive than StandardLoader but still literal
- No relevance scoring
- Complex nested filtering logic
- Inconsistent with other loaders

### 3. Other Search Patterns

Looking at the grep results, several other files implement search functionality:

**Command Files with Search Logic**:

- `src/commands/standards.ts`: Uses StandardLoader.search()
- `src/commands/principles.ts`: Uses PrincipleLoader.search()
- `src/commands/methodologies.ts`: Likely has similar patterns

**Search Utilities**:

- `src/utils/dynamic-content-discovery.ts`: Has discovery but no search
- Various formatters: May have filtering logic

## Search Usage Patterns

### Command Line Interface

Current CLI search patterns:

```bash
# Standards search
aichaku standards --search "test"

# Principles search  
aichaku principles --search "simple"

# Expected but missing: cross-content search
aichaku search "agile"  # Should find standards, methodologies, principles
```

### API Usage

Current programmatic usage:

```typescript
// Load specific loader
const standardLoader = new StandardLoader();
const results = await standardLoader.search("test");

// Problem: No unified search across content types
```

## Identified Problems

### 1. Code Duplication

Each loader implements its own search logic:

- Similar filtering patterns repeated
- Different field handling approaches
- Inconsistent case handling

### 2. Inconsistent Behavior

Different search capabilities across loaders:

- StandardLoader: 4 fields
- PrincipleLoader: 6+ fields including nested objects
- No standardized interface

### 3. Poor User Experience

Literal matching creates frustration:

- "test" doesn't find "bdd", "tdd", "test-pyramid"
- "agile" doesn't find "scrum", "kanban"
- "simple" doesn't find "kiss", "yagni"

### 4. No Cross-Content Search

Users can't search across all content types:

- Must know which command to use
- Can't discover related items across categories
- No unified search experience

### 5. No Relevance Scoring

All matches are equal:

- No way to rank results by relevance
- Can't prioritize exact matches over fuzzy ones
- No sorting by match quality

## Current Search Performance

### StandardLoader

- Loads all standards on each search
- No caching between searches
- ~50-100 items typically loaded

### PrincipleLoader

- Has internal caching via `cache` Map
- More efficient on repeated searches
- Complex nested object searching

### Memory Usage

- Each loader loads full content into memory
- No shared caching between loaders
- Repeated YAML parsing

## Target State Analysis

### Unified Search Interface

Replace multiple implementations with single fuzzy search:

```typescript
// Current (multiple implementations)
standardLoader.search("test"); // Only standards
principleLoader.search("test"); // Only principles

// Target (unified fuzzy search)
fuzzySearch("test"); // All content types
fuzzySearch("test", { contentTypes: ["standards"] }); // Filtered
```

### Enhanced Search Fields

Consolidate and enhance searchable fields:

```typescript
interface SearchableContent {
  // Core identification
  id: string;
  name: string;
  description: string;

  // Categorization
  category: string;
  tags: string[];

  // Content type
  type: ContentType;

  // Enhanced search
  content?: string; // Full text content
  aliases?: string[]; // Alternative names
  summary?: string; // Key points
}
```

### Relevance Scoring

Implement weighted field matching:

```typescript
const searchConfig = {
  keys: [
    { name: "name", weight: 0.3 }, // Highest priority
    { name: "content", weight: 0.3 }, // Deep content matching
    { name: "description", weight: 0.2 }, // Summary importance
    { name: "tags", weight: 0.2 }, // Categorization
  ],
};
```

## Migration Strategy

### Phase 1: Implement Core Fuzzy Search

- Add fuzzy search to `dynamic-content-discovery.ts`
- Create unified `SearchableContent` interface
- Implement Fuse.js integration

### Phase 2: Update Existing Loaders

- Modify `StandardLoader.search()` to use fuzzy search
- Modify `PrincipleLoader.search()` to use fuzzy search
- Maintain backward compatibility

### Phase 3: Add Cross-Content Search

- Create new unified search command
- Enable cross-content-type queries
- Add relevance-based result ranking

### Phase 4: Optimize Performance

- Implement search result caching
- Add lazy loading for large content sets
- Profile and optimize search performance

## Test Cases for Migration

### Literal Search Compatibility

```typescript
// Ensure existing behavior works
const results = await standardLoader.search("tdd");
assert(results.some((r) => r.id === "tdd"));
```

### Fuzzy Search Enhancement

```typescript
// New fuzzy capabilities
const results = await fuzzySearch("test");
assert(results.some((r) => r.item.name.includes("bdd")));
assert(results.some((r) => r.item.name.includes("tdd")));
assert(results.some((r) => r.item.name.includes("test-pyramid")));
```

### Cross-Content Search

```typescript
// Search across all content types
const results = await fuzzySearch("agile");
const types = new Set(results.map((r) => r.item.type));
assert(types.has("methodologies"));
assert(types.has("principles"));
```

### Performance Benchmarks

```typescript
// Search performance requirements
const start = performance.now();
const results = await fuzzySearch("test");
const duration = performance.now() - start;
assert(duration < 15); // 15ms max for initial search
```

## Risk Assessment

### Low Risk

- Fuse.js is mature, stable library
- Backward compatibility maintained
- Incremental migration possible

### Medium Risk

- Search configuration tuning needed
- Performance testing required
- User expectation management

### High Risk

- Breaking changes to search behavior
- Complex cross-content-type logic
- Memory usage with large content sets

## Success Metrics

### Functional Success

- All existing search tests pass
- New fuzzy search capabilities work
- Cross-content search functions correctly

### Performance Success

- Search response time <15ms initial
- Search response time <5ms cached
- Memory usage reasonable (<2MB)

### User Experience Success

- "test" finds expected testing-related content
- "agile" finds expected methodology content
- "simple" finds expected principle content
- Search feels responsive and intuitive
