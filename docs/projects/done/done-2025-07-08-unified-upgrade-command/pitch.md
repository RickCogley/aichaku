# Unified Upgrade Command

## Problem

The current upgrade experience is unnecessarily complex:

```bash
# After upgrading global CLI, users must run TWO commands:
aichaku upgrade          # Updates project metadata (what metadata??)
aichaku integrate --force  # Updates CLAUDE.md (sounds like a workaround)
```

Users naturally run `aichaku upgrade` expecting everything to be upgraded, but they get:
- Confusing messages about running another command
- No clear understanding of what "metadata" means
- Frustration at needing two commands for one conceptual task

## Solution

### 1. Unified Upgrade Command

Make `aichaku upgrade` do what users expect - upgrade EVERYTHING:

```bash
# In a project:
aichaku upgrade

# This should:
1. Update project metadata (.aichaku.json) if needed
2. Automatically update CLAUDE.md with latest directives
3. Show what changed
```

### 2. Surgical CLAUDE.md Updates with Markers

Replace the ham-handed approach with precise, marker-based updates:

```markdown
<!-- AICHAKU:START -->
## Methodologies

This project uses the globally installed Aichaku adaptive methodology system...
[All the Aichaku content]
<!-- AICHAKU:END -->
```

Benefits:
- Clean updates - only touch content between markers
- Version tracking - can show diffs
- User edits preserved - anything outside markers is untouched
- Clear boundaries - obvious what's managed by Aichaku

## Implementation

### Phase 1: Unified Command

```typescript
// In src/commands/upgrade.ts
export async function upgrade(options: UpgradeOptions): Promise<UpgradeResult> {
  // ... existing upgrade logic ...
  
  // NEW: If upgrading a project (not global), also update CLAUDE.md
  if (!options.global && !options.dryRun) {
    const claudeMdPath = join(targetPath, "../CLAUDE.md");
    if (await exists(claudeMdPath)) {
      console.log("📄 Updating CLAUDE.md with latest directives...");
      await integrate({ 
        projectPath: join(targetPath, ".."),
        force: true,
        silent: options.silent 
      });
    }
  }
  
  return result;
}
```

### Phase 2: Marker-Based Updates

```typescript
// In src/commands/integrate.ts
const MARKER_START = "<!-- AICHAKU:START -->";
const MARKER_END = "<!-- AICHAKU:END -->";

export async function integrate(options: IntegrateOptions): Promise<IntegrateResult> {
  const content = await Deno.readTextFile(claudeMdPath);
  
  // Check for markers
  const startIdx = content.indexOf(MARKER_START);
  const endIdx = content.indexOf(MARKER_END);
  
  if (startIdx !== -1 && endIdx !== -1) {
    // Surgical replacement
    const before = content.slice(0, startIdx);
    const after = content.slice(endIdx + MARKER_END.length);
    const newContent = `${before}${MARKER_START}\n${METHODOLOGY_SECTION}\n${MARKER_END}${after}`;
    
    await Deno.writeTextFile(claudeMdPath, newContent);
    return { action: "updated", message: "Updated Aichaku section" };
  } else if (content.includes("aichaku") && !options.force) {
    // Old format detected
    return { 
      action: "skipped", 
      message: "Legacy Aichaku section found. Use --force to upgrade to marker format" 
    };
  } else {
    // First time - add with markers
    const newSection = `${MARKER_START}\n${METHODOLOGY_SECTION}\n${MARKER_END}`;
    // ... insert at appropriate location ...
  }
}
```

## Benefits

1. **Intuitive**: `upgrade` upgrades everything, as expected
2. **Single command**: No need to remember two commands
3. **Backward compatible**: `integrate` still works for special cases
4. **Clear messaging**: Users understand what's happening

## Migration

- Keep `integrate` command for:
  - Initial setup
  - Forcing re-integration
  - Special cases
- But normal upgrade flow is just: `aichaku upgrade`

## Success Metrics

- Users run one command instead of two
- No confusion about what to run after global upgrade
- "Upgrade" means "upgrade everything"