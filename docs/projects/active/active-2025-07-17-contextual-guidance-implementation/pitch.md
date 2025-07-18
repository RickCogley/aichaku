# Pitch: Enhanced Contextual Guidance for Upgrade Commands

## Problem

**Raw idea**: Users don't know where files are actually installed during
`aichaku upgrade --global`

**What's going wrong**:

- Current upgrade output tells users WHAT happened but not WHERE it happened
- Missing spatial awareness causes user confusion and reduces confidence
- Contradicts our "what did I do and where" principle from foundation quality
  work
- Users reported this exact issue during v0.34.0 upgrade testing

**Real user feedback**:

```
❯ aichaku upgrade --global
🪴 Aichaku: Growing from v0.33.0 to v0.34.0...
✅ User customizations detected - will be preserved
🌿 Updating methodology files...
✨ Methodologies ready (49 files verified/updated)
```

**Missing**: WHERE are these 49 files? What directory structure was updated?

### ✅ VALIDATION UPDATE (v0.34.1 Testing)

**User tested the fixed upgrade command and confirmed the exact problem:**

```
🌿 Updating methodology files...
✨ Methodologies ready (49 files verified/updated)
🌿 Updating standards library...  
✨ Standards ready (45 files verified/updated)
```

**User feedback**: _"does not say WHERE the files are located. It's like a black
box, the users gets no feedback about the folder the files have been installed
in, which I think is really disconcerting."_

**Validation confirms**: Our problem identification was 100% accurate. The
upgrade mechanics work, but the missing location context remains the core UX
issue.

## Appetite

**6 weeks** - This is a medium-sized improvement that enhances existing
functionality rather than building new features.

**Why this appetite**:

- Leverages existing visual guidance framework from foundation work
- Improves user experience without changing core upgrade logic
- Addresses immediate user feedback from recent release
- Can be implemented across all upgrade scenarios (global, project, CLI)

## Solution

**Apply our visual guidance framework to upgrade commands** using the existing
utilities in `src/utils/visual-guidance.ts`.

### Core enhancement

Transform upgrade output from "what happened" to "what happened and where":

**Before (current)**:

```
🪴 Aichaku: Growing from v0.33.0 to v0.34.0...
✨ Methodologies ready (49 files verified/updated)
```

**After (enhanced)**:

```
🪴 Aichaku: Growing from v0.33.0 to v0.34.0...

📁 **What was updated:**
Global installation: ~/.claude/aichaku/
├── methodologies/    (49 files verified/updated)
├── standards/        (45 files verified/updated)  
├── user/            (preserved - your customizations)
└── aichaku.json     (metadata updated to v0.34.0)

✅ **What's next:**
1. Run 'aichaku upgrade' in each project to sync
2. Verify functionality: 'aichaku standards --show'
3. Check for new features: 'aichaku help --new'
```

### Visual guidance implementation

Use existing framework components:

1. **`createInstallationDiagram()`** - Show directory tree with file counts
2. **`generateContextualFeedback()`** - Provide "what's next" guidance
3. **`createUpgradeSummary()`** - Before/after version visualization

### Scope boundaries

**In scope**:

- Enhance `aichaku upgrade --global` output (primary user feedback)
- Enhance `aichaku upgrade` (project) output for consistency
- Apply visual guidance to CLI upgrade checking
- Consistent location awareness across all upgrade scenarios

**Out of scope**:

- Changing upgrade logic or file handling
- New upgrade features or options
- MCP server upgrade handling (separate system)
- Rollback or undo functionality

## Rabbit holes

**Avoid over-engineering the visual output**

- Don't create complex ASCII art or animations
- Stick to simple directory trees and clear text
- Don't slow down the upgrade process with elaborate displays

**Don't change existing upgrade behavior**

- Only enhance output, never modify what gets upgraded
- Preserve all existing flags and options
- Maintain backward compatibility for scripted usage

**Avoid path complexity edge cases**

- Use consistent path display (~/. notation for home directory)
- Don't try to handle every possible installation location
- Keep it simple: show the primary installation path

## No-gos

**Don't add new upgrade flags or options** - This is purely output enhancement

**Don't change upgrade timing or performance** - Visual output should be
instantaneous

**Don't create upgrade configuration** - Keep upgrade behavior deterministic

## Solution sketch

### Enhanced upgrade flow

```typescript
// In src/commands/upgrade.ts - existing upgrade function
export async function upgrade(options: UpgradeOptions = {}) {
  // ... existing upgrade logic ...

  // NEW: Generate contextual feedback
  const context: CommandContext = {
    action: "Global installation upgraded",
    location: paths.global.root, // ~/.claude/aichaku
    installationType: "global",
    version: VERSION,
    changes: [
      `${methodologyCount} methodology files updated`,
      `${standardsCount} standards files updated`,
      "User customizations preserved",
      "Metadata updated to v" + VERSION,
    ],
  };

  const nextSteps: NextSteps = {
    immediate: ["Run 'aichaku upgrade' in each project to sync"],
    recommended: [
      "Verify functionality: 'aichaku standards --show'",
      "Check for new features: 'aichaku help --new'",
    ],
  };

  // Use existing visual guidance framework
  const installationDiagram = createInstallationDiagram(
    "global",
    paths.global.root,
    VERSION,
  );
  const contextualFeedback = generateContextualFeedback(context, nextSteps);

  Brand.success("Upgrade complete!");
  console.log(installationDiagram);
  console.log(contextualFeedback);
}
```

### Directory tree visualization

Leverage `createDirectoryTree()` from visual guidance framework:

```typescript
const structure = {
  "methodologies": [`${methodologyCount} files verified/updated`],
  "standards": [`${standardsCount} files verified/updated`],
  "user": ["preserved - your customizations"],
  "": [`aichaku.json (metadata updated to v${VERSION})`],
};

createDirectoryTree("~/.claude/aichaku", structure, {
  highlight: ["methodologies", "standards"],
});
```

## Fat marker sketches

### 1. Global upgrade with location context

```
🪴 Aichaku: Growing from v0.33.0 to v0.34.0...

📁 Global installation updated:
~/.claude/aichaku/
├── 📂✨ methodologies/     (49 files)
├── 📂✨ standards/         (45 files)  
├── 📂 user/               (preserved)
└── 📄 aichaku.json        (→ v0.34.0)

✅ Ready! All projects now have latest methodologies.
```

### 2. Project upgrade with inheritance visualization

```
🪴 Aichaku: Project synced with global v0.34.0

📁 Project configuration:
./project/.claude/aichaku/
├── 📄 aichaku.json        (→ v0.34.0)
└── 🔗 → ~/.claude/aichaku (methodologies & standards)

✅ Your project is now up to date!
```

### 3. Version mismatch detection with clear guidance

```
⚠️  Version mismatch detected:
   CLI: v0.34.0  📍 Your PATH
   Global: v0.33.0  📍 ~/.claude/aichaku

🔧 Fix: aichaku upgrade --global
```

## Technical implementation

### Files to modify

1. **`src/commands/upgrade.ts`** - Add visual guidance to main upgrade function
2. **`src/commands/upgrade-fix.ts`** - Enhance migration messaging
3. **`src/utils/visual-guidance.ts`** - Extend as needed for upgrade-specific
   visuals

### Integration points

- Use existing `Brand.*` functions for consistent messaging
- Leverage `getAichakuPaths()` for accurate path display
- Integrate with existing upgrade result interfaces
- Maintain all existing error handling and edge cases

### Testing strategy

- Update existing upgrade tests to expect enhanced output
- Add visual guidance output verification
- Test path display across different operating systems
- Verify performance impact is negligible

## Success metrics

**User confidence**: Users know exactly where their files are installed
**Support reduction**: Fewer "where did it install?" questions **Consistency**:
All upgrade commands provide location context **Framework utilization**: Visual
guidance framework proves its value

This enhancement directly addresses user feedback while leveraging our
investment in visual guidance infrastructure, providing immediate value with
minimal risk.
