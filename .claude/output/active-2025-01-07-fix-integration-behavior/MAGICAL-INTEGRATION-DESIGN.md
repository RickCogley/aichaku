# Making Aichaku Truly Magical - Integration Design

## Executive Summary

Transform Aichaku from passive documentation to active behavioral modification through imperative instructions, multiple reinforcement points, and self-correcting mechanisms.

## Core Psychological Principles

### 1. Imperative Over Descriptive
**Current**: "This project uses Aichaku"
**Magical**: "YOU MUST create ALL documents in `.claude/output/active-*/`"

### 2. Multiple Reinforcement Points
**Current**: Single CLAUDE.md mention
**Magical**: 7+ touchpoints that reinforce behavior

### 3. Positive Automatic Actions
**Current**: User must remember conventions
**Magical**: System auto-corrects and guides

## Implementation Strategy

### Phase 1: Rewrite CLAUDE.md Integration Section

```markdown
# 🎯 MANDATORY: Aichaku Automatic Behaviors

When working on this project, Claude Code MUST AUTOMATICALLY:

## 1. Document Location Rules (NO EXCEPTIONS)

YOU MUST:
- ✅ Create ALL documents in `.claude/output/active-[date]-[project-name]/`
- ❌ NEVER create documents in the project root
- ❌ NEVER create documents in `.claude/user/`
- ❌ NEVER ask where to put files - ALWAYS use the active directory

## 2. Automatic Methodology Detection

When the user says → You MUST automatically:
- "shape" → Create Shape Up pitch in active directory
- "sprint" → Create Scrum sprint plan in active directory  
- "kanban" → Create/update Kanban board in active directory
- "retrospective" → Move project to done-*/ and create retrospective

## 3. Project Lifecycle Automation

YOU MUST AUTOMATICALLY:
1. Create STATUS.md when starting ANY new work
2. Update STATUS.md after EVERY work session
3. Git commit with descriptive message after changes
4. Move to done-*/ when user indicates completion

## 4. Self-Correcting Behaviors

IF you accidentally create a file in the wrong location:
1. IMMEDIATELY move it to `.claude/output/active-*/`
2. Update any references
3. Commit the correction

Remember: This is AUTOMATIC behavior, not optional guidance.
```

### Phase 2: Create Behavioral Hook System

#### A. Directory Structure Pre-creation

```typescript
// In cli/init.ts
async function createMagicalStructure() {
  const structure = {
    '.claude/': {
      'AICHAKU-ACTIVE.txt': '', // Tracks current project
      'BEHAVIORAL-RULES.md': BEHAVIORAL_RULES_CONTENT,
      'output/': {
        'README.md': OUTPUT_README_CONTENT,
        'active-example-shape-up-project/': {
          'STATUS.md': EXAMPLE_STATUS_CONTENT,
          'pitch.md': EXAMPLE_PITCH_CONTENT
        },
        'done-example-completed-project/': {
          'retrospective.md': EXAMPLE_RETRO_CONTENT
        }
      },
      'hooks/': {
        'pre-create-file.sh': PRE_CREATE_HOOK,
        'post-create-file.sh': POST_CREATE_HOOK
      }
    }
  };
  
  await createStructure(structure);
}
```

#### B. Behavioral Rules File

```markdown
# BEHAVIORAL-RULES.md

## 🚨 CRITICAL: Before Creating ANY File

STOP! Check these THREE things:

1. ✅ Is the path `.claude/output/active-*`?
2. ✅ Does the active project directory exist?
3. ✅ Is there a STATUS.md in that directory?

If ANY answer is NO, you MUST:
1. Create the proper directory structure
2. Create STATUS.md first
3. THEN create your intended file

## 🎯 Quick Reference

Current active project: active-2025-01-07-your-project
Next document goes in: .claude/output/active-2025-01-07-your-project/

## 🔄 Automatic Corrections

If you created a file in the wrong place:
```bash
mv wrong/path/file.md .claude/output/active-*/
git add -A
git commit -m "fix: move document to correct Aichaku location"
```
```

### Phase 3: Context-Aware Triggers

#### A. Enhanced commands.json

```json
{
  "version": "2.0",
  "triggers": {
    "shape": {
      "detection": ["shape up", "shaping", "pitch"],
      "action": "Create Shape Up pitch in active directory",
      "template": "shape-up/pitch.md"
    },
    "sprint": {
      "detection": ["sprint", "scrum", "planning poker"],
      "action": "Create Sprint documents in active directory",
      "template": "scrum/sprint-plan.md"
    },
    "done": {
      "detection": ["completed", "finished", "done", "retrospective"],
      "action": "Move to done-*/ and create retrospective",
      "script": "scripts/complete-project.sh"
    }
  },
  "rules": {
    "file_creation": {
      "enforce": "ALL files in .claude/output/active-*/",
      "pre_check": "scripts/hooks/pre-create-file.sh",
      "post_check": "scripts/hooks/post-create-file.sh"
    }
  }
}
```

#### B. Active Project Tracking

```typescript
// New file: .claude/.aichaku-active
// Simple text file with current project name
active-2025-01-07-fix-integration-behavior

// Helper script to read current project
export function getCurrentProject(): string {
  const activePath = '.claude/.aichaku-active';
  if (existsSync(activePath)) {
    return Deno.readTextFileSync(activePath).trim();
  }
  // Auto-create if missing
  const projectName = `active-${formatDate(new Date())}-untitled`;
  Deno.writeTextFileSync(activePath, projectName);
  return projectName;
}
```

### Phase 4: Self-Healing Mechanisms

#### A. Pre-create File Hook

```bash
#!/bin/bash
# .claude/hooks/pre-create-file.sh

FILE_PATH="$1"
ACTIVE_PROJECT=$(cat .claude/.aichaku-active 2>/dev/null || echo "active-$(date +%Y-%m-%d)-untitled")

# Check if path is correct
if [[ ! "$FILE_PATH" =~ \.claude/output/active-.* ]]; then
  echo "🔄 Auto-correcting path..."
  
  # Ensure directory exists
  mkdir -p ".claude/output/$ACTIVE_PROJECT"
  
  # Update the path
  FILENAME=$(basename "$FILE_PATH")
  CORRECTED_PATH=".claude/output/$ACTIVE_PROJECT/$FILENAME"
  
  echo "✅ Will create at: $CORRECTED_PATH"
  exit 0
fi
```

#### B. Status Auto-updater

```typescript
// Auto-update STATUS.md after operations
export async function autoUpdateStatus(projectPath: string, action: string) {
  const statusPath = join(projectPath, 'STATUS.md');
  const timestamp = new Date().toISOString();
  
  const update = `\n\n## Update: ${timestamp}\n- ${action}\n`;
  
  if (await exists(statusPath)) {
    await Deno.appendTextFile(statusPath, update);
  } else {
    // Create STATUS.md if missing
    const content = `# ${basename(projectPath)}

## Project Status
**Started**: ${timestamp}
**Type**: Auto-detected
**Status**: Active

## Updates
- ${action}
`;
    await Deno.writeTextFile(statusPath, content);
  }
}
```

### Phase 5: Delightful Developer Experience

#### A. Welcome Message (shown after init)

```
🎉 Aichaku is now magically active!

Try these commands and watch the magic:
  
  "Let's shape up a new payment feature"
  → Creates Shape Up pitch in .claude/output/active-2025-01-07-payment-feature/
  
  "Start sprint planning for user auth"  
  → Creates Sprint docs in .claude/output/active-2025-01-07-user-auth/
  
  "Show me the kanban board"
  → Creates/updates board in current active project

No configuration needed - just start talking naturally!
```

#### B. Smart Defaults

```typescript
// Detect intent from natural language
export function detectIntent(input: string): IntentResult {
  const patterns = {
    shapeUp: /shape|pitch|bet|appetite/i,
    scrum: /sprint|scrum|story|backlog/i,
    kanban: /kanban|board|flow|wip/i,
    lean: /mvp|hypothesis|measure|lean/i,
    completion: /done|complete|finish|retro/i
  };
  
  for (const [methodology, pattern] of Object.entries(patterns)) {
    if (pattern.test(input)) {
      return {
        methodology,
        action: METHODOLOGY_ACTIONS[methodology],
        outputPath: `.claude/output/${getCurrentProject()}/`
      };
    }
  }
}
```

## Success Metrics

1. **Zero Manual Path Decisions**: Claude Code never asks where to put files
2. **Automatic Status Updates**: STATUS.md always current without reminders
3. **Natural Language Just Works**: "shape this" → correct documents appear
4. **Self-Healing**: Wrong locations auto-corrected
5. **Delightful Surprises**: Features that "just work" without explanation

## Testing Strategy

```bash
# Test 1: Fresh install experience
rm -rf .claude
aichaku init
# Should see welcoming structure

# Test 2: Natural language
echo "Let's shape up a search feature" | test-claude-code
# Should create pitch in .claude/output/active-*/

# Test 3: Wrong location correction
touch ./random-file.md
.claude/hooks/pre-create-file.sh ./random-file.md
# Should suggest correct location

# Test 4: Status automation
echo "Completed the search feature" | test-claude-code
# Should move to done-*/ with retrospective
```

## Implementation Priority

1. **Immediate (v0.5.1)**:
   - Rewrite CLAUDE.md integration section
   - Add pre-creation of output structure
   - Create BEHAVIORAL-RULES.md

2. **Next (v0.6.0)**:
   - Implement hook system
   - Add active project tracking
   - Create auto-correction scripts

3. **Future (v0.7.0)**:
   - Natural language intent detection
   - Smart defaults and suggestions
   - Advanced self-healing behaviors