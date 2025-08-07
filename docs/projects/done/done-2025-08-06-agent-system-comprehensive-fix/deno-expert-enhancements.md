# Deno Expert Agent Enhancements

## Overview

The `aichaku-deno-expert` agent requires comprehensive enhancements to provide accurate, deep Deno knowledge that aligns
with actual Deno capabilities and aichaku usage patterns.

## Key Knowledge Gaps Identified

### 1. **Markdown Formatting Capability**

**Current Gap**: Agent doesn't know that `deno fmt` formats Markdown files AND code blocks within Markdown **Reality**:
`deno fmt` automatically handles `.md` files and formats TypeScript/JavaScript code blocks inside them

### 2. **API Documentation Generation**

**Current Gap**: Agent doesn't know about `deno doc --html` generating to `@docs/api` **Reality**:
`deno doc --html --output=@docs/api` generates browsable HTML documentation (as seen in aichaku)

### 3. **Cross-Platform Compilation**

**Current Gap**: Limited knowledge of compilation targets **Reality**: Full support for x86_64 and aarch64 on Linux,
Windows, macOS

## Enhanced Agent Capabilities

### Core Deno CLI Knowledge

```yaml
deno_cli_commands:
  fmt:
    capabilities:
      - Formats TypeScript, JavaScript, JSON files
      - **Formats Markdown files including code blocks within**
      - Configurable via deno.json
    example: |
      deno fmt                    # Formats all supported files
      deno fmt --check           # Check without modifying
      deno fmt README.md         # Formats markdown and its code blocks
    
  doc:
    capabilities:
      - Generates API documentation from JSDoc comments
      - **HTML output to @docs/api directory**
      - JSON output for programmatic access
    example: |
      deno doc --html --name="Aichaku" --output=@docs/api src/
      # Creates browsable HTML documentation in @docs/api/
    
  compile:
    targets:
      - x86_64-unknown-linux-gnu
      - x86_64-pc-windows-msvc
      - x86_64-apple-darwin
      - aarch64-apple-darwin
    example: |
      deno compile --target=x86_64-apple-darwin \
        --output=dist/aichaku-macos \
        --allow-read --allow-write \
        src/main.ts
    
  test:
    coverage_workflow: |
      deno test --coverage=./coverage
      deno coverage ./coverage --html
      # Generates HTML report in coverage/html/index.html
    
  bench:
    usage: |
      Deno.bench("operation name", () => {
        // Code to benchmark
      });
      deno bench                 # Run all benchmarks
      deno bench --filter="name" # Run specific benchmarks
```

### Aichaku-Specific Patterns

```typescript
// Task definitions in deno.json (from aichaku)
{
  "tasks": {
    "dev": "deno run --watch mod.ts",
    "test": "deno test --allow-read --allow-write --allow-env --allow-run",
    "test:coverage": "deno test --coverage=coverage",
    "coverage": "deno coverage coverage --html",
    "lint": "deno lint",
    "fmt": "deno fmt",
    "check": "deno check **/*.ts",
    "compile": "deno compile --allow-all --output aichaku src/main.ts",
    "docs": "deno doc --html --name='Aichaku' --output=@docs/api src/"
  }
}
```

### Testing Patterns

```typescript
import { assertEquals, assertRejects, assertThrows } from "@std/assert";

// Standard test structure used in aichaku
Deno.test("descriptive test name", async () => {
  // AAA Pattern: Arrange, Act, Assert
  const input = prepareTestData();
  const result = await functionUnderTest(input);
  assertEquals(result, expectedOutput);
});

// Async error testing
Deno.test("handles async errors correctly", async () => {
  await assertRejects(
    async () => await failingAsyncFunction(),
    Error,
    "Expected error message",
  );
});
```

### JSR Publishing Knowledge

```json
// Complete deno.json for JSR publishing
{
  "name": "@rick/aichaku",
  "version": "0.44.1",
  "exports": {
    ".": "./mod.ts",
    "./cli": "./cli.ts"
  },
  "publish": {
    "include": ["src/", "mod.ts", "README.md", "LICENSE"],
    "exclude": ["tests/", "coverage/", "*.test.ts"]
  }
}
```

Publishing workflow:

```bash
# Pre-publish checks
deno fmt --check
deno lint
deno check **/*.ts
deno test

# Generate documentation
deno doc --html --output=@docs/api src/

# Publish
deno publish --dry-run  # Test first
deno publish           # Actual publish to JSR
```

### Import Map Management

```json
{
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.2",
    "@std/cli": "jsr:@std/cli@^1.0.3",
    "@std/fs": "jsr:@std/fs@^1.0.1",
    "@std/path": "jsr:@std/path@^1.0.2",
    "@std/yaml": "jsr:@std/yaml@^1.0.5"
  }
}
```

### Permission Model Best Practices

```typescript
// Development: Broader permissions for convenience
deno run --allow-all src/main.ts

// Production: Minimal, specific permissions
deno run \
  --allow-read=./config,./data \
  --allow-write=./output \
  --allow-net=api.example.com \
  --allow-env=API_KEY,DATABASE_URL \
  src/main.ts

// Compiled binaries embed permissions
deno compile \
  --allow-read=./config \
  --allow-write=./output \
  --output=app \
  src/main.ts
```

## Implementation Checklist

### Phase 1: Core Knowledge Updates

- [x] Add Markdown formatting capabilities to fmt knowledge
- [x] Add HTML documentation generation to doc knowledge
- [x] Add cross-platform compilation targets
- [x] Add coverage reporting workflow

### Phase 2: Testing & Quality

- [x] Add Deno.test patterns and best practices
- [x] Add Deno.bench benchmarking knowledge
- [x] Add coverage integration patterns
- [x] Add assertion library usage

### Phase 3: Ecosystem Integration

- [x] Add JSR publishing workflow
- [x] Add import map configuration
- [x] Add task automation patterns
- [x] Add permission model best practices

## Agent Update Summary

The `aichaku-deno-expert` agent has been enhanced from version 1.2.0 to 2.0.0 with:

1. **Complete CLI command knowledge** - All 10+ Deno CLI commands with options
2. **Markdown awareness** - Knows `deno fmt` handles Markdown and code blocks
3. **Documentation generation** - HTML API docs to `@docs/api` pattern
4. **Cross-compilation expertise** - All target platforms with examples
5. **Testing patterns** - Comprehensive Deno.test and Deno.bench knowledge
6. **Coverage workflows** - Complete testing to HTML report generation
7. **JSR publishing** - Full workflow from preparation to verification
8. **Task automation** - deno.json task patterns from actual usage
9. **Import maps** - Proper dependency management patterns
10. **Security model** - Granular permission best practices

## References

- Deno Format Documentation: https://docs.deno.com/runtime/reference/cli/fmt/
- Deno Doc Documentation: https://docs.deno.com/runtime/reference/cli/doc/
- JSR Publishing Guide: https://jsr.io/docs/publishing-packages
- Deno Standard Library: https://jsr.io/@std

## Next Steps

1. Update agent YAML frontmatter with enhanced capabilities
2. Test agent responses for accuracy with new knowledge
3. Validate against actual aichaku usage patterns
4. Update other technology expert agents similarly
