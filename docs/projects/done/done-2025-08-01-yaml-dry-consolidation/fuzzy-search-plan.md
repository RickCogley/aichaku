# Fuzzy Search Implementation Plan

## Overview

This document details the fuzzy search enhancement for the YAML DRY consolidation project. The goal is to replace
literal string matching with intelligent fuzzy search across all content types.

## Current Problem

Users expect modern search behavior like fzf, but our current implementations only do literal matching:

- Searching "test" doesn't find "bdd", "tdd", or "test-pyramid"
- Searching "agile" doesn't find "scrum", "kanban", "lean"
- Searching "simple" doesn't find "kiss", "yagni", "dry"

## Solution: Fuse.js Integration

### Why Fuse.js?

1. **Zero dependencies** - Perfect for Deno
2. **TypeScript support** - Native TS definitions
3. **Proven library** - Widely used, stable API
4. **Flexible scoring** - Configurable relevance algorithms
5. **Nested search** - Can search multiple fields with weights

### Implementation Strategy

#### Phase 1: Core Integration (Week 2, Days 1-2)

Enhance `dynamic-content-discovery.ts` with search capabilities:

```typescript
import Fuse from "npm:fuse.js@7";

interface SearchableContent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
  type: ContentType; // 'standards' | 'methodologies' | 'principles'
  content?: string; // Full text content for deep search
}

const SEARCH_CONFIG = {
  keys: [
    { name: "name", weight: 0.3 },
    { name: "description", weight: 0.2 },
    { name: "tags", weight: 0.2 },
    { name: "content", weight: 0.3 },
  ],
  threshold: 0.4, // Balance between precision and recall
  includeScore: true,
  shouldSort: true,
  findAllMatches: false,
  minMatchCharLength: 2,
};
```

#### Phase 2: Search API (Week 2, Days 3-4)

Create unified search interface:

```typescript
export interface SearchResult<T = SearchableContent> {
  item: T;
  score: number; // Lower is better (0 = perfect match)
  matches?: SearchMatch[]; // Highlighted match positions
}

export interface SearchOptions {
  contentTypes?: ContentType[];
  categories?: string[];
  maxResults?: number;
  minScore?: number;
}

export async function fuzzySearch(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const {
    contentTypes = ["standards", "methodologies", "principles"],
    categories,
    maxResults = 20,
    minScore = 0.8,
  } = options;

  // Load and prepare searchable content
  const content = await prepareSearchableContent(contentTypes, categories);

  // Initialize Fuse with config
  const fuse = new Fuse(content, SEARCH_CONFIG);

  // Search and filter results
  const results = fuse.search(query)
    .filter((result) => result.score! <= minScore)
    .slice(0, maxResults);

  return results;
}
```

#### Phase 3: Command Integration (Week 2, Days 5-7)

Update existing commands to use fuzzy search:

```typescript
// standards.ts
const results = await fuzzySearch(query, {
  contentTypes: ["standards"],
  categories: args.category ? [args.category] : undefined,
});

// principles.ts
const results = await fuzzySearch(query, {
  contentTypes: ["principles"],
});

// Cross-content search (new feature)
const results = await fuzzySearch("test", {
  contentTypes: ["standards", "methodologies", "principles"],
});
```

## Search Configuration

### Field Weights

- **name (0.3)**: Highest weight - exact name matches are most relevant
- **content (0.3)**: High weight - deep content matching for comprehensive results
- **description (0.2)**: Medium weight - summaries are important but secondary
- **tags (0.2)**: Medium weight - categorization tags provide context

### Threshold Tuning

- **0.0**: Exact matches only
- **0.2**: Very strict fuzzy matching
- **0.4**: Balanced (recommended) - finds related terms without noise
- **0.6**: Permissive - more matches, some false positives
- **1.0**: Match everything (not useful)

### Content Preparation

Transform all content into searchable format:

```typescript
async function prepareSearchableContent(
  contentTypes: ContentType[],
  categories?: string[],
): Promise<SearchableContent[]> {
  const searchable: SearchableContent[] = [];

  for (const type of contentTypes) {
    const items = await loadContent(type, basePath);

    for (const item of items) {
      if (categories && !categories.includes(item.category)) continue;

      searchable.push({
        id: item.id,
        name: item.name,
        description: item.description,
        tags: item.tags || [],
        category: item.category || "uncategorized",
        type,
        content: await loadFullContent(item), // Load markdown content
      });
    }
  }

  return searchable;
}
```

## Search Scenarios

### Test-Related Content

Query: `"test"`

Expected matches:

- **Standards**: `bdd`, `tdd`, `test-pyramid`
- **Methodologies**: Any with testing phases
- **Principles**: Testing-related principles

### Agile Content

Query: `"agile"`

Expected matches:

- **Methodologies**: `scrum`, `kanban`, `lean`, `shape-up`
- **Standards**: Agile development standards
- **Principles**: Agile manifesto principles

### Simplicity Content

Query: `"simple"`

Expected matches:

- **Principles**: `kiss`, `yagni`, `dry`
- **Standards**: Simplicity-focused standards
- **Methodologies**: Lean approaches

## Performance Considerations

### Caching Strategy

```typescript
class SearchCache {
  private contentCache = new Map<string, SearchableContent[]>();
  private fuseCache = new Map<string, Fuse<SearchableContent>>();

  async getSearchEngine(contentTypes: ContentType[]): Promise<Fuse<SearchableContent>> {
    const key = contentTypes.sort().join(",");

    if (!this.fuseCache.has(key)) {
      const content = await this.getContent(contentTypes);
      const fuse = new Fuse(content, SEARCH_CONFIG);
      this.fuseCache.set(key, fuse);
    }

    return this.fuseCache.get(key)!;
  }
}
```

### Expected Performance

- **Initial search**: ~10-15ms (includes content loading)
- **Cached searches**: ~2-5ms
- **Memory usage**: ~1-2MB for full content index
- **Search capacity**: 1000+ items without performance issues

## Testing Strategy

### Unit Tests

```typescript
Deno.test("fuzzy search finds related terms", async () => {
  const results = await fuzzySearch("test");

  const names = results.map((r) => r.item.name.toLowerCase());

  assert(names.some((name) => name.includes("bdd")));
  assert(names.some((name) => name.includes("tdd")));
  assert(names.some((name) => name.includes("test-pyramid")));
});

Deno.test("search scores are reasonable", async () => {
  const results = await fuzzySearch("tdd");

  // Exact match should have best score
  const exactMatch = results.find((r) => r.item.id === "tdd");
  assert(exactMatch);
  assert(exactMatch.score < 0.1);

  // Related matches should have reasonable scores
  const relatedMatches = results.filter((r) => r.score <= 0.6);
  assert(relatedMatches.length >= 3);
});
```

### Integration Tests

```typescript
Deno.test("CLI search commands use fuzzy search", async () => {
  const output = await runCommand(["standards", "--search", "test"]);

  assert(output.includes("bdd"));
  assert(output.includes("tdd"));
  assert(output.includes("test-pyramid"));
});
```

## Migration Strategy

### Backward Compatibility

All existing search APIs remain unchanged:

```typescript
// Existing API still works
standardLoader.search("test"); // Now uses fuzzy search internally

// New API provides advanced options
fuzzySearch("test", { contentTypes: ["standards"] });
```

### Gradual Rollout

1. **Week 2 Day 1-2**: Implement core fuzzy search
2. **Week 2 Day 3-4**: Update standard-loader.ts
3. **Week 2 Day 5**: Update principle-loader.ts
4. **Week 2 Day 6**: Update methodology commands
5. **Week 2 Day 7**: Add cross-content search capabilities

## Risk Mitigation

### Dependency Risk

- Fuse.js is mature, stable library (7+ years)
- Import from npm: ensures version stability
- Zero sub-dependencies reduces risk
- Fallback: Can revert to literal search if needed

### Performance Risk

- Search caching prevents repeated computation
- Lazy loading of content reduces memory usage
- Configurable result limits prevent runaway queries
- Testing on realistic data sizes (1000+ items)

### User Experience Risk

- Threshold tuning based on user feedback
- Clear indication of fuzzy vs exact matches
- Option to disable fuzzy search if needed
- Progressive enhancement: works without breaking existing flows

## Success Criteria

### Functional

- ✅ "test" finds bdd, tdd, test-pyramid
- ✅ "agile" finds scrum, kanban, lean
- ✅ "simple" finds kiss, yagni, dry
- ✅ Cross-content-type search works
- ✅ All existing commands continue working

### Performance

- ✅ Initial search <15ms
- ✅ Cached search <5ms
- ✅ Memory usage <2MB
- ✅ Handles 1000+ items smoothly

### User Experience

- ✅ More relevant results than literal search
- ✅ Expected items appear in top 5 results
- ✅ No significant false positives
- ✅ Search feels responsive and natural
