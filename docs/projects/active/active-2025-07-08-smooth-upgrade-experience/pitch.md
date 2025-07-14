# Shape Up Pitch: Smooth Upgrade Experience

## Problem

The current Aichaku upgrade process is clunky and confusing:

1. **Version Requirement Hell** - You must specify exact version: `jsr:@rick/aichaku@0.7.0/cli`
2. **Silent Upgrades** - No feedback about what version was installed
3. **Unclear Next Steps** - After global upgrade, you don't know how to upgrade local installs
4. **Manual Version Tracking** - You must check JSR or GitHub to find latest version
5. **Inconsistent Commands** - Global uses `deno install`, local uses `aichaku upgrade`

## Appetite

**1 week** - Simple wrapper script and CLI improvements without major architecture changes.

## Solution

### 1. Ultra-Simple Installation (Achieved!)

Following Lume's pattern, you can now install with:
```bash
deno run -A https://raw.githubusercontent.com/RickCogley/aichaku/main/init.ts
```

This single command:
- Installs Aichaku CLI globally
- Sets up methodologies
- Optionally initializes the current project
- Shows version feedback
- Provides clear next steps

### 2. Verbose Installation Feedback

When installing/upgrading globally:
```text
🪴 Aichaku Global Installation
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Previous: v0.6.0
📦 New:      v0.7.0
✅ Successfully upgraded!

Next steps for your projects:
• Run 'aichaku upgrade' in each project
• Or 'aichaku integrate --force' to update CLAUDE.md
```

### 3. Enhanced Upgrade Command

Improve `aichaku upgrade` to show:
```text
🪴 Aichaku Project Upgrade
━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Project: /path/to/project
📦 Current: v0.6.0
📦 Latest:  v0.7.0

Upgrading methodologies...
✅ Shape Up guides updated
✅ Scrum templates updated
✅ CLAUDE.md refreshed

What's new in v0.7.0:
• 🪴 Visual identity with progress indicators
• 💬 Discussion-first document creation
• 📊 Mermaid diagram integration
```

### 4. Update README Documentation

Add clear upgrade instructions:
```markdown
## Upgrading

### Global CLI (Recommended)
```bash
# Always get the latest version
deno install -g -A -n aichaku --force jsr:@rick/aichaku@latest/cli
```

### Projects
After upgrading globally, update each project:
```bash
# Update methodology files and CLAUDE.md
aichaku upgrade

# Or just refresh CLAUDE.md directives
aichaku integrate --force
```
```

## Rabbit Holes

1. **Complex version detection**: Keep simple - just check JSR API
2. **Cross-platform compatibility**: Focus on Deno environments only
3. **Rollback mechanisms**: Don't build complex version management
4. **Custom install locations**: Use standard Deno patterns only

## No-gos

1. **Package managers**: No npm, brew, or other installation methods
2. **Auto-updates**: No background or scheduled updates
3. **Version conflicts**: Don't manage multiple Aichaku versions
4. **Complex configuration**: Keep upgrade process simple

## Implementation Details

### 1. Wrapper Script Enhancement

Create a wrapper that:
- Fetches latest version from JSR before installing
- Compares with current version
- Shows clear upgrade feedback
- Provides next steps

### 2. Version Detection

Add to CLI:
```typescript
async function getCurrentGlobalVersion(): Promise<string | null> {
  try {
    const result = await new Deno.Command("aichaku", {
      args: ["--version"],
    }).output();
    // Parse version from output
  } catch {
    return null;
  }
}

async function getLatestVersion(): Promise<string> {
  const response = await fetch("https://api.jsr.io/scopes/rick/packages/aichaku/versions");
  const versions = await response.json();
  return versions[0].version;
}
```

### 3. Installation Script

Create `install.ts`:
```typescript
// Detect current version
const current = await getCurrentGlobalVersion();
const latest = await getLatestVersion();

// Install with feedback
console.log(`🪴 Installing Aichaku ${latest}...`);
await installAichaku(latest);

// Show results
if (current) {
  console.log(`📦 Upgraded: ${current} → ${latest}`);
} else {
  console.log(`📦 Installed: ${latest}`);
}
```

## Benefits

1. **Frictionless Upgrades** - Just use @latest
2. **Clear Feedback** - Know exactly what happened
3. **Actionable Next Steps** - Clear instructions for projects
4. **Version Awareness** - See what's new
5. **Consistent Experience** - Same flow for install and upgrade

## Success Criteria

- You can upgrade with @latest tag
- Installation shows version feedback
- Clear instructions for updating projects
- README has simple upgrade section
- Version info included in all operations