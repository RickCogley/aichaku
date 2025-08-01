# Execution Plan: YAML DRY Consolidation

## Phase 1: Immediate Fixes (Week 1)

### Task 1.1: Remove metadata.yaml from Standards

**Status**: Partially complete (loader updated, files need removal)

#### Steps:

1. ✅ Update StandardLoader to skip metadata.yaml (DONE)
2. Remove metadata.yaml files:
   ```bash
   rm ~/.claude/aichaku/docs/standards/architecture/metadata.yaml
   rm ~/.claude/aichaku/docs/standards/development/metadata.yaml
   rm ~/.claude/aichaku/docs/standards/devops/metadata.yaml
   rm ~/.claude/aichaku/docs/standards/security/metadata.yaml
   rm ~/.claude/aichaku/docs/standards/testing/metadata.yaml
   ```
3. Test commands:
   ```bash
   aichaku standards --list  # No "(metadata)" entries
   aichaku standards --show tdd
   aichaku standards --search architecture
   ```

### Task 1.2: Fix Methodologies Hardcoding

#### Step 1: Create MethodologyLoader using dynamic-content-discovery

```typescript
// src/utils/methodology-loader.ts
import { discoverContent } from "./dynamic-content-discovery.ts";
import type { ItemLoader } from "../types/command.ts";

export class MethodologyLoader implements ItemLoader<Methodology> {
  async loadAll(): Promise<Methodology[]> {
    const discovered = await discoverContent("methodologies", basePath, true);
    return discovered.items.map((item) => ({
      id: item.path.split("/")[0],
      name: item.name,
      description: item.description,
      category: item.category,
      tags: item.tags,
      // Map other fields from YAML
    }));
  }
}
```

#### Step 2: Update methodologies command

```typescript
// src/commands/methodologies.ts
import { MethodologyLoader } from "../utils/methodology-loader.ts";

// Remove: const AVAILABLE_METHODOLOGIES = { ... }
// Replace with: loader: new MethodologyLoader()
```

## Phase 2: Unified Interface (Week 2)

### Task 2.1: Design Typed Content Interface

#### Create base interfaces:

```typescript
// src/types/content.ts
export interface ContentItem {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  path?: string;
}

export interface ContentLoader<T extends ContentItem> {
  loadAll(): Promise<T[]>;
  loadById(id: string): Promise<T | null>;
  search(query: string): Promise<T[]>;
}
```

### Task 2.2: Enhance dynamic-content-discovery.ts

#### Add generic loading function:

```typescript
export async function loadContent<T extends ContentItem>(
  contentType: ContentType,
  basePath: string,
  transform?: (item: ContentMetadata) => T,
): Promise<T[]> {
  const discovered = await discoverContent(contentType, basePath, true);

  if (transform) {
    return discovered.items.map(transform);
  }

  return discovered.items as T[];
}

// Add caching
const contentCache = new Map<string, any>();

export async function loadContentCached<T extends ContentItem>(
  contentType: ContentType,
  basePath: string,
  transform?: (item: ContentMetadata) => T,
): Promise<T[]> {
  const cacheKey = `${contentType}:${basePath}`;

  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey);
  }

  const content = await loadContent(contentType, basePath, transform);
  contentCache.set(cacheKey, content);
  return content;
}
```

## Phase 3: Migration (Week 3)

### Task 3.1: Migrate StandardLoader

#### Before:

```typescript
async loadAll(): Promise<Standard[]> {
  for await (const entry of Deno.readDir(categoryPath)) {
    if (entry.isFile && entry.name.endsWith(".yaml")) {
      const content = await Deno.readTextFile(join(categoryPath, entry.name));
      const data = parse(content) as Standard;
      // ... processing
    }
  }
}
```

#### After:

```typescript
async loadAll(): Promise<Standard[]> {
  return loadContent<Standard>("standards", this.standardsPath, (item) => ({
    id: item.id || item.path.replace(".yaml", ""),
    name: item.name,
    description: item.description,
    category: item.category,
    tags: item.tags,
    summary: {}, // Load from YAML
  }));
}
```

### Task 3.2: Migrate PrincipleLoader

Similar pattern to StandardLoader migration.

## Testing Strategy

### Unit Tests

```typescript
// src/utils/dynamic-content-discovery_test.ts
Deno.test("loadContent returns typed content", async () => {
  const standards = await loadContent<Standard>("standards", testPath);
  assertEquals(standards.length, 5);
  assertEquals(standards[0].id, "tdd");
});
```

### Integration Tests

```typescript
// Test each command still works
Deno.test("standards command uses unified loader", async () => {
  const result = await standards({ list: true });
  assert(!result.message.includes("(metadata)"));
});
```

## Performance Benchmarks

### Before Consolidation

```
Command: aichaku standards --list
Time: ~120ms
File reads: 22 (17 standards + 5 metadata)
```

### After Consolidation

```
Command: aichaku standards --list
Time: ~60ms (with caching)
File reads: 17 (standards only)
```

## Rollback Plan

If issues arise:

1. Keep old implementations in separate files
2. Use feature flags to switch between old/new
3. Gradual rollout one command at a time

## Documentation Updates

1. Update developer guide with new patterns
2. Create examples for adding new content types
3. Document caching behavior
4. Add migration guide for external tools
