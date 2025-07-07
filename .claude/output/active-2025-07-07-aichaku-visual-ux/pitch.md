# Aichaku Visual UX Enhancements

## Problem

Currently, Aichaku operates invisibly, leading to:
1. **Unclear attribution** - Users don't know when Aichaku is helping vs Claude Code
2. **Lost context** - No visual progress indicators for project phases
3. **Forgotten presence** - Users forget Aichaku is installed and available

## Solution: Three Visual Enhancements

### 1. Aichaku Visual Identity

**Icon Options:**
- 🪴 **Potted Plant** - Nurturing methodologies that grow with you
- 🫶 **Hands Holding Heart** - Cherishing your workflows  
- 🍵 **Teacup** - Daily ritual and comfort
- 🌱 **Seedling** - Growth from small beginnings
- 🏮 **Paper Lantern** - Warm, guiding light

**Chosen Identity:**
```
🪴 Aichaku: [message]
```

**Why 🪴 Potted Plant:**
- Represents 愛着 (aichaku) - the warm attachment that grows over time
- Shows ongoing nurturing and care
- Methodologies that become more valuable with use
- Perfect metaphor for workflows that grow with your team

**Implementation in CLAUDE.md:**
```markdown
### Visual Communication

When Aichaku functionality is active, prefix messages with:
🪴 Aichaku: [your message]

Examples:
- "🪴 Aichaku: I notice you're discussing a sprint. Let me help nurture this idea..."
- "🪴 Aichaku: Growing Shape Up project: user-authentication-redesign"
- "🪴 Aichaku: Your workflow is taking root in .claude/output/"
```

### 2. Project Phase Indicators

**ASCII Progress Bar Approach:**
```
🪴 Aichaku Progress: [Seedling] ━━━○━━━━━━ [Growing] ━━━━━━━━━━ [Blooming]
                     ████████████              
```

**Emoji Phase Indicators:**
```
🪴 Aichaku: Project Growth
🌱 Seedling → 🌿 Growing → 🌳 Established → 🌺 Blooming → 🍃 Renewal

Current: 🌿 Growing
```

**For Different Methodologies:**

**Shape Up:**
```
🪴 Aichaku Shape Up: 
[🌱 Shaping] → [🌿 Betting] → [🌳 Building] → [🍃 Cool-down]
     ▲ Your project is here
```

**Scrum:**
```
🪴 Aichaku Sprint Growth:
[🌱 Planning] → [🌿 Daily] → [🌺 Review] → [🍃 Retro]
                    ▲ Growing here
```

**Implementation Using Node Libraries:**

For CLI usage (not in Claude Code):
```typescript
import { Spinner } from '@clack/prompts';
import chalk from 'chalk';

// Visual phase indicator
const phases = ['Discussion', 'Shaping', 'Ready', 'Created'];
const current = 1;

console.log(chalk.blue('🧭 Aichaku:'), 
  phases.map((p, i) => 
    i === current ? chalk.bgBlue.white(` ${p} `) : chalk.gray(p)
  ).join(' → ')
);
```

### 3. Startup Reminder System

**Option A: Automatic Reminder in CLAUDE.md**
```markdown
## 🧭 Aichaku Active

This project has Aichaku installed. I will:
- Recognize methodology keywords (sprint, shape, kanban, MVP)
- Guide you through structured workflows
- Create organized documentation in .claude/output/

Say "help with Aichaku" for more information.
```

**Option B: First Message Enhancement**
Update CLAUDE.md to include:
```markdown
### Session Start Behavior

On first methodology keyword detection each session:
"🧭 Aichaku: I noticed you mentioned [keyword]. I'm here to help structure your [methodology] workflow. Currently in discussion mode - let me know when you're ready to create project documentation."
```

**Option C: Status Command**
Add to Aichaku CLI:
```bash
aichaku status --startup-reminder

# Output:
🧭 Aichaku v0.6.0 Active
━━━━━━━━━━━━━━━━━━━━━
✓ Global installation: ~/.claude
✓ Methodologies: Shape Up, Scrum, Kanban, Lean, XP
✓ Claude Code integration: Active

Trigger words: sprint, shape, kanban, MVP
Documentation: .claude/output/
```

## Implementation Plan

### Phase 1: Visual Identity
1. Choose icon (🧭 recommended)
2. Update CLAUDE.md integration
3. Add prefix to all Aichaku-related messages

### Phase 2: Progress Indicators
1. Define phase indicators for each methodology
2. Add ASCII/emoji progress bars
3. Include in STATUS.md updates

### Phase 3: Startup Reminders
1. Add reminder section to CLAUDE.md
2. Implement first-contact message
3. Optional: Add status command to CLI

## Benefits

1. **Clear Attribution** - Users know when Aichaku is helping
2. **Visual Progress** - See project phase at a glance
3. **Better Engagement** - Reminders increase usage
4. **Professional Feel** - Consistent visual identity
5. **Reduced Confusion** - Clear separation from Claude Code

## Technical Considerations

- Keep it simple for Claude Code (ASCII/emoji only)
- Rich CLI features for direct Aichaku usage
- Consistent icon across all touchpoints
- Progress indicators in every STATUS.md update

## Success Criteria

- Every Aichaku message has clear visual identity
- Users can see project phase instantly
- Startup reminder appears appropriately
- No confusion about what's Aichaku vs Claude Code
- Visual elements enhance, not distract