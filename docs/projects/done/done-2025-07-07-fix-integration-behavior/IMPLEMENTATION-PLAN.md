# Implementation Guide: Fix Aichaku Integration

## Prerequisites

- TypeScript/Deno development environment
- Access to Aichaku codebase
- Understanding of CLI tools and file system operations
- Basic knowledge of Markdown and Git workflows

## Overview

This guide provides step-by-step instructions to transform Aichaku from a passive methodology library into an active behavioral modification system.

## Phase 1: Update CLAUDE.md Integration (Critical)

### 1.1 Rewrite METHODOLOGY_SECTION in integrate.ts

```typescript
const METHODOLOGY_SECTION = `## Methodologies - REQUIRED BEHAVIOR

This project uses Aichaku. When working on this project, you MUST:

### 1. Document Creation Rules

**ALWAYS create documents in**: \`.claude/output/active-YYYY-MM-DD-{descriptive-name}/\`

**NEVER create documents in**:
- Project root (/)
- .claude/user/ (that's for user customizations)
- Random locations

### 2. Automatic Triggers

When you hear these words, IMMEDIATELY create the project structure:
- "let's plan" / "shape this" / "create a pitch"
- "implement" / "build" / "start coding"
- "review" / "retrospective" / "how are we doing"

Don't wait to be asked - creating the structure is automatic.

### 3. Methodology Detection

Read the appropriate guide from \`~/.claude/methodologies/\`:
- "shape"/"pitch" → shape-up/SHAPE-UP-AICHAKU-GUIDE.md
- "sprint"/"scrum" → scrum/SCRUM-AICHAKU-GUIDE.md
- "kanban"/"board" → kanban/KANBAN-AICHAKU-GUIDE.md
- "mvp"/"lean" → lean/LEAN-AICHAKU-GUIDE.md
- "xp"/"tdd" → xp/XP-AICHAKU-GUIDE.md

### 4. Execution Pattern

1. Detect user intent from natural language
2. Create output directory structure immediately
3. Read relevant methodology guide
4. Apply mode (Planning/Execution/Improvement)
5. Generate documents using templates
6. Update STATUS.md as you work

REMINDER: This is automatic behavior. You expect documents to appear in the right place without asking.`;
```

## Phase 2: Pre-create Directory Structure

### 2.1 Update init.ts to create output directory

Add after line 145 (user directory creation):

```typescript
// Create output directory structure
const outputDir = join(targetPath, "output");
await ensureDir(outputDir);

// Create output README
const outputReadmePath = join(outputDir, "README.md");
await Deno.writeTextFile(outputReadmePath, getOutputReadmeContent());

// Create .aichaku-behavior quick reference
const behaviorPath = join(targetPath, ".aichaku-behavior");
await Deno.writeTextFile(behaviorPath, getBehaviorContent());
```

### 2.2 Add helper functions

```typescript
function getOutputReadmeContent(): string {
  return `# Aichaku Output Directory

This directory contains all project documentation organized by status and date.

## Structure

- \`active-*\` - Currently ongoing work
- \`done-*\` - Completed projects (rename from active- when done)

## Naming Convention

\`[status]-YYYY-MM-DD-[descriptive-kebab-case-name]\`

Examples:
- active-2025-01-07-user-authentication
- active-2025-01-07-fix-performance-issues
- done-2025-01-06-global-project-redesign

## What Goes Here

Each project directory should contain:
- STATUS.md - Current status and progress
- Planning documents (pitches, specs, backlogs)
- Progress updates
- Metrics and reviews

## For Claude Code

When you discuss new work with users, immediately create a new active-* directory here.
Don't wait to be asked. This creates expected behavior.`;
}

function getBehaviorContent(): string {
  return `# Quick Reference for Claude Code

Before ANY work:
1. Check .claude/output/ for existing active-* directories
2. Create new active-YYYY-MM-DD-{name} for new work
3. Always create STATUS.md first
4. Read methodology guides from ~/.claude/methodologies/

IMPORTANT: You create proper structure AUTOMATICALLY, not optionally.`;
}
```

## Phase 3: Update Success Messages

### 3.1 Update CLI success message (cli.ts line 135)

```typescript
console.log(`
✅ Global installation complete!

📁 Installed to: ${result.path}
📚 Methodologies: Shape Up, Scrum, Kanban, Lean, XP, Scrumban
🎯 Next: Run 'aichaku init' in any project

💡 Claude Code now automatically:
   • Creates documents in .claude/output/
   • Follows methodology patterns
   • Responds to "shape", "sprint", "kanban", etc.
`);
```

### 3.2 Update project init success (cli.ts line 146)

```typescript
console.log(`
✅ Project initialized with Aichaku!

Your project now has:
  • Access to all global methodologies
  • Pre-created output directory for documents
  • Behavioral guidelines for Claude Code
  ${result.message?.includes("CLAUDE.md") ? "• CLAUDE.md integration with clear directives" : ""}

💡 Just start talking! Say things like:
   • "Let's shape a new feature"
   • "Plan our next sprint"
   • "Show me our kanban board"
   
   Documents automatically appear in .claude/output/
`);
```

## Phase 4: Add Commands Support (Optional Enhancement)

### 4.1 Create commands.json during init

```typescript
// Create commands.json
const commandsPath = join(targetPath, "commands.json");
const commands = {
  "commands": {
    "/plan": {
      "description": "Start planning mode",
      "action": "Create .claude/output/active-{date}-{name}/ and read planning mode guide"
    },
    "/build": {
      "description": "Start execution mode", 
      "action": "Continue in current active project or create new one"
    },
    "/review": {
      "description": "Start improvement mode",
      "action": "Review current work and create metrics"
    },
    "/status": {
      "description": "Show all active projects",
      "action": "List all active-* directories with their STATUS.md"
    }
  }
};
await Deno.writeTextFile(commandsPath, JSON.stringify(commands, null, 2));
```

## Phase 5: Update Documentation

### 5.1 Update README.md with clearer expectations

Add section:

```markdown
## How It Works

After installation, Claude Code automatically:

1. **Detect your intent** - Just speak naturally
2. **Create proper structure** - Documents go in `.claude/output/`
3. **Follow methodologies** - Based on your language
4. **Track progress** - In STATUS.md files

No manual setup needed - it just works!
```

## Testing Checklist

- [ ] Fresh install with `aichaku init --global`
- [ ] Project init with `aichaku init`
- [ ] Verify output/ directory exists
- [ ] Check CLAUDE.md has directive language
- [ ] Test "let's shape a feature" creates correct structure
- [ ] Test documents go to .claude/output/, not root
- [ ] Verify .claude/user/ isn't used for output

## Rollout Plan

1. Implement Phase 1 & 2 (critical fixes)
2. Test with fresh installation
3. Update success messages (Phase 3)
4. Consider commands.json for v0.5.1
5. Update documentation

## Success Criteria

✅ You report "it just works"
✅ No manual directory creation
✅ Documents always in right place
✅ Natural language triggers work
✅ Feels magical and automatic