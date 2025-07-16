# Technical Implementation Plan

## Overview

This document provides detailed technical specifications for implementing the
compact YAML integration system.

## Phase 1: Command Unification (Week 1-2)

### 1.1 Merge Documentation Standards

**Current State:**

- `src/commands/docs-standard.ts` - Hardcoded standards
- `src/commands/standards.ts` - Dynamic discovery
- `src/utils/dynamic-content-discovery.ts` - Already supports dynamic category
  discovery!

**Actions:**

1. Move documentation standards to `/docs/standards/documentation/`
2. Remove hardcoded categories - use dynamic discovery from filesystem
3. Remove `docs-standard.ts` command entirely
4. Update CLI router to deprecate `docs-standard` with helpful message

**Code Changes:**

```typescript
// In standards.ts - Remove hardcoded categories, use dynamic discovery
import { discoverContent } from "../utils/dynamic-content-discovery.ts";

// Replace hardcoded categories with dynamic discovery
async function getAvailableCategories(basePath: string): Promise<string[]> {
  const discovered = await discoverContent("standards", basePath, true);
  return Object.keys(discovered.categories).sort();
}

// Add deprecation handler in cli.ts
case "docs-standard":
  console.log("⚠️  'docs-standard' is deprecated. Use 'standards --category documentation' instead.");
  await standardsCommand.parse(["--category", "documentation", ...args]);
  break;
```

### 1.2 Configuration Migration

**Current:**

```typescript
// Multiple files
.claude/aichaku/standards.json
.claude/aichaku/doc-standards.json
```

**New Structure in aichaku.json:**

```typescript
{
  "standards": {
    "selected": ["owasp-web", "tdd", "diataxis"],  // All standards
    "custom": { ... }
  }
}
```

**Migration Function:**

```typescript
async function migrateStandardsConfig(config: AichakuConfig): Promise<void> {
  const oldStandardsPath = join(config.basePath, "standards.json");
  const oldDocStandardsPath = join(config.basePath, "doc-standards.json");

  if (await exists(oldStandardsPath) || await exists(oldDocStandardsPath)) {
    const standards = await safeReadJson(oldStandardsPath) || [];
    const docStandards = await safeReadJson(oldDocStandardsPath) || [];

    // Merge into unified config
    config.standards.selected = [...standards, ...docStandards];

    // Remove old files
    await safeRemove(oldStandardsPath);
    await safeRemove(oldDocStandardsPath);

    console.log("✅ Migrated to unified standards configuration");
  }
}
```

## Phase 2: YAML Integration Engine (Week 3-4)

### 2.1 YAML Structure Definition

```typescript
interface AichakuYamlConfig {
  aichaku: {
    version: string;
    methodologies: {
      [key: string]: {
        triggers: string[];
        best_for: string;
      };
    };
    standards: {
      [key: string]: {
        category: string;
        triggers: string[];
        focus: string;
        integration_url: string;
        // Custom fields from YAML
        [key: string]: any;
      };
    };
  };
}
```

### 2.2 YAML Block Detection and Replacement

````typescript
const YAML_BLOCK_START = "```yaml\n# Aichaku Configuration";
const YAML_BLOCK_END = "```";

function findYamlBlock(content: string): { start: number; end: number } | null {
  const startIdx = content.indexOf(YAML_BLOCK_START);
  if (startIdx === -1) return null;

  const endIdx = content.indexOf(
    YAML_BLOCK_END,
    startIdx + YAML_BLOCK_START.length,
  );
  if (endIdx === -1) return null;

  return {
    start: startIdx,
    end: endIdx + YAML_BLOCK_END.length,
  };
}

function replaceYamlBlock(
  content: string,
  yamlConfig: AichakuYamlConfig,
): string {
  const block = findYamlBlock(content);
  const yamlString = generateYamlString(yamlConfig);

  if (block) {
    // Replace existing block
    return content.slice(0, block.start) +
      yamlString +
      content.slice(block.end);
  } else {
    // Append new block
    return content + "\n\n" + yamlString;
  }
}
````

### 2.3 Metadata Loading from YAML Files

```typescript
async function loadStandardMetadata(
  standardId: string,
): Promise<StandardMetadata> {
  // Find the standard's location
  const standardPath = await findStandardPath(standardId);
  const yamlPath = standardPath.replace(".md", ".yaml");

  if (await exists(yamlPath)) {
    const yamlContent = await Deno.readTextFile(yamlPath);
    const metadata = parse(yamlContent) as any;

    return {
      id: standardId,
      category: metadata.category,
      triggers: metadata.triggers || [],
      focus: metadata.summary?.overview || metadata.description,
      integration_url: `~/.claude/aichaku/${standardPath}`,
      // Include custom fields
      ...extractCustomFields(metadata),
    };
  }

  // Fallback for standards without YAML
  return generateBasicMetadata(standardId, standardPath);
}
```

## Phase 3: Migration System (Week 4)

### 3.1 Old Format Detection

```typescript
function hasOldFormat(content: string): boolean {
  return content.includes("<!-- AICHAKU:METHODOLOGY:START -->") ||
    content.includes("<!-- AICHAKU:STANDARDS:START -->") ||
    content.includes("<!-- AICHAKU:DOC-STANDARDS:START -->");
}

function extractCustomContent(content: string): string {
  // Extract content outside marker regions
  const markers = [
    { start: "<!-- AICHAKU:START -->", end: "<!-- AICHAKU:END -->" },
    {
      start: "<!-- AICHAKU:METHODOLOGY:START -->",
      end: "<!-- AICHAKU:METHODOLOGY:END -->",
    },
    {
      start: "<!-- AICHAKU:STANDARDS:START -->",
      end: "<!-- AICHAKU:STANDARDS:END -->",
    },
    {
      start: "<!-- AICHAKU:DOC-STANDARDS:START -->",
      end: "<!-- AICHAKU:DOC-STANDARDS:END -->",
    },
  ];

  let customContent = content;

  // Remove all marked sections
  for (const marker of markers) {
    const regex = new RegExp(
      `${escapeRegex(marker.start)}[\\s\\S]*?${escapeRegex(marker.end)}`,
      "g",
    );
    customContent = customContent.replace(regex, "");
  }

  return customContent.trim();
}
```

### 3.2 Migration Process

```typescript
async function migrateClaudeMd(filePath: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);

  if (!hasOldFormat(content)) {
    console.log("✅ CLAUDE.md already using new format");
    return;
  }

  // Backup original
  await Deno.writeTextFile(`${filePath}.backup`, content);
  console.log(`📦 Backed up original to ${filePath}.backup`);

  // Extract custom content
  const customContent = extractCustomContent(content);

  // Extract selected standards from old format
  const selectedStandards = extractSelectedStandards(content);

  // Generate new YAML config
  const yamlConfig = await generateYamlConfig(selectedStandards);

  // Build new content
  const newContent = customContent + "\n\n" + generateYamlString(yamlConfig);

  // Write new format
  await Deno.writeTextFile(filePath, newContent);

  console.log(`
✅ Migration complete!

- Reduced size from ${formatBytes(content.length)} to ${
    formatBytes(newContent.length)
  }
- Preserved your custom content
- Selected standards: ${selectedStandards.join(", ")}

Your original file is backed up at ${filePath}.backup
  `);
}
```

## Phase 4: Testing Strategy (Week 5)

### 4.1 Unit Tests

```typescript
// Test YAML block detection
Deno.test("findYamlBlock detects configuration", () => {
  const content =
    `# CLAUDE.md\n\n\`\`\`yaml\n# Aichaku Configuration\naichaku:\n  version: "3.0.0"\n\`\`\``;
  const block = findYamlBlock(content);
  assertNotEquals(block, null);
});

// Test migration
Deno.test("migrateClaudeMd preserves custom content", async () => {
  const oldContent =
    `# My Custom Header\n\n<!-- AICHAKU:START -->old stuff<!-- AICHAKU:END -->\n\n# My Custom Footer`;
  const result = await migrateContent(oldContent);
  assert(result.includes("# My Custom Header"));
  assert(result.includes("# My Custom Footer"));
  assert(!result.includes("<!-- AICHAKU:START -->"));
});
```

### 4.2 Integration Tests

```typescript
// Test full workflow
Deno.test("integration: add standards and integrate", async () => {
  // Setup test project
  const testDir = await Deno.makeTempDir();

  // Add standards
  await runCommand(["standards", "--add", "owasp-web,tdd"]);

  // Run integrate
  await runCommand(["integrate"]);

  // Verify YAML block
  const claudeMd = await Deno.readTextFile(join(testDir, "CLAUDE.md"));
  assert(claudeMd.includes("aichaku:"));
  assert(claudeMd.includes("owasp_web:"));
  assert(claudeMd.includes("tdd:"));
});
```

### 4.3 Claude Compatibility Testing

1. **Create test CLAUDE.md files** with new format
2. **Test with Claude** to verify:
   - Trigger recognition works
   - YAML parsing is successful
   - integration_url concept works
3. **Performance testing** - measure parse time improvement

## Phase 5: Learn Command Redesign (Week 5)

### 5.1 Rename Help to Learn

**Rationale:**

- Avoid confusion with `--help` flag
- Better represents the command's purpose (educational content)
- Clearer user intent

**Implementation:**

```typescript
// In cli.ts - Update command routing
case "help":
  console.log("⚠️  'help' command renamed to 'learn' to avoid confusion with --help");
  // Fall through to learn
case "learn":
  await learnCommand.execute(args);
  break;
```

### 5.2 YAML-Driven Learn Content

**Design:** The learn command will read YAML metadata to dynamically generate
its content without duplicating information.

```typescript
interface LearnContent {
  methodologies: Map<string, MethodologyInfo>;
  standards: Map<string, StandardInfo>;
  categories: string[];
}

async function buildLearnContent(basePath: string): Promise<LearnContent> {
  // Discover all content dynamically
  const methodologies = await discoverContent("methodologies", basePath, true);
  const standards = await discoverContent("standards", basePath, true);

  // Build learn content from YAML metadata
  const content: LearnContent = {
    methodologies: new Map(),
    standards: new Map(),
    categories: Object.keys(standards.categories),
  };

  // Process each methodology's YAML
  for (const item of methodologies.items) {
    const yamlPath = item.path.replace(".md", ".yaml");
    const metadata = await loadYamlMetadata(yamlPath);
    content.methodologies.set(item.name, {
      triggers: metadata.triggers,
      best_for: metadata.best_for,
      description: metadata.description,
    });
  }

  // Process each standard's YAML
  for (const item of standards.items) {
    const yamlPath = item.path.replace(".md", ".yaml");
    const metadata = await loadYamlMetadata(yamlPath);
    content.standards.set(item.name, {
      category: item.category,
      triggers: metadata.triggers,
      focus: metadata.summary?.critical || metadata.description,
    });
  }

  return content;
}
```

### 5.3 Path Access Considerations

**Problem:** Claude Code may not have direct access to `~/.claude/aichaku/`
paths.

**Solution:** Use integration URLs that Claude can understand:

```typescript
// Instead of direct file paths
integration_url: "~/.claude/aichaku/docs/standards/security/owasp-web.md";

// Use content references Claude can resolve
integration_url: "aichaku://standards/security/owasp-web";
// or
integration_url: "@standards/security/owasp-web";
```

This allows Claude to request content through a protocol it understands, rather
than assuming file system access.

## YAML Extension Convention Decision

### Current Usage Analysis

- **`.yaml`**: 26 files - All Aichaku content (standards, methodologies)
- **`.yml`**: 7 files - All GitHub workflows/configs

### Recommendation: Use `.yaml` for Aichaku

**Rationale:**

1. **Consistency**: All existing Aichaku content already uses `.yaml`
2. **Official spec**: YAML officially recommends `.yaml` extension
3. **Code compatibility**: `dynamic-content-discovery.ts` already handles both
4. **Clear separation**: `.yaml` for Aichaku content, `.yml` for GitHub

**Implementation:**

- All new Aichaku files: `.yaml`
- Configuration files: `reviewer-config.yaml`, `aichaku.yaml`
- Keep GitHub workflows as `.yml` (GitHub convention)
- Update docs to consistently use `.yaml` in examples

## Phase 6: Documentation Updates (Week 5-6)

### 6.1 Update Command Help

```typescript
const standardsHelp = `
🛡️  Standards Management

Manage development and documentation standards for your project.

Usage:
  aichaku standards [options]
  aichaku standards <subcommand> [args]

Options:
  --list              List all available standards
  --category <cat>    Filter by category (security, development, documentation, etc.)
  --search <query>    Search standards by name or description

Subcommands:
  add <ids>          Add standards (comma-separated)
  remove <ids>       Remove standards
  show               Show currently selected standards

Examples:
  aichaku standards --list
  aichaku standards --category documentation
  aichaku standards add owasp-web,tdd,diataxis
  aichaku standards remove tdd

Note: 'docs-standard' command has been merged into 'standards'.
      Use '--category documentation' to see documentation standards.
`;
```

### 5.2 Update Integration Messages

```typescript
const integrationMessages = {
  migrationDetected: `
🔄 Migration Required

I've detected you're using the old integration format.
I'll automatically migrate to the new compact YAML format.

Benefits:
✅ 90% smaller file size
✅ Faster Claude parsing
✅ Cleaner diffs
✅ Better organization

Your custom content will be preserved.
`,

  success: (before: number, after: number) => `
✅ Integration Complete!

CLAUDE.md updated with compact YAML configuration.
- Size: ${formatBytes(before)} → ${formatBytes(after)} (${
    Math.round((1 - after / before) * 100)
  }% reduction)
- Format: Single YAML block
- Standards: ${getSelectedCount()} selected

Claude will now recognize your selected methodologies and standards.
`,

  firstTime: `
🎉 Welcome to Aichaku 3.0!

I've created a compact YAML configuration in your CLAUDE.md.
This new format is much smaller and faster than the old marker system.

Next steps:
1. Select your standards: aichaku standards add <ids>
2. Run integrate again: aichaku integrate
3. Start coding with Claude!
`,
};
```

## Implementation Checklist

### Week 1-2: Foundation

- [ ] Create unified standards discovery using dynamic-content-discovery.ts
- [ ] Remove hardcoded category lists
- [ ] Merge docs-standard into standards command
- [ ] Update ConfigManager for single config
- [ ] Add migration for old config files
- [ ] Update CLI router with deprecation

### Week 3-4: Integration

- [ ] Implement YAML block detection
- [ ] Create YAML generation from metadata
- [ ] Build metadata loading from YAML files
- [ ] Implement block replacement logic
- [ ] Create migration detection and process

### Week 5: Polish & Learn Command

- [ ] Rename `help` command to `learn`
- [ ] Build YAML-driven learn content system
- [ ] Implement integration URL scheme (aichaku://)
- [ ] Write comprehensive tests
- [ ] Test with Claude
- [ ] Update all documentation
- [ ] Create migration guide
- [ ] Handle edge cases

### Week 6: Release

- [ ] Beta test with users
- [ ] Test Claude's access to integration URLs
- [ ] Fix reported issues
- [ ] Update changelog
- [ ] Create release notes
- [ ] Publish new version

## Success Metrics

1. **File Size**: CLAUDE.md < 3KB for typical usage (vs 30KB+ currently)
2. **Performance**: Integration completes in < 1 second
3. **Migration**: 100% of users auto-migrated without data loss
4. **Simplicity**: Single command for all standards
5. **Compatibility**: Claude recognizes all triggers correctly
