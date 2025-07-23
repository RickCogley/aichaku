# Shape Up Pitch: Aichaku Visual UX Enhancements

## Problem

Currently, Aichaku operates invisibly, leading to:

1. **Unclear attribution** - You don't know when Aichaku helps vs Claude Code

2. **Lost context** - No visual progress indicators for project phases

3. **Forgotten presence** - You forget Aichaku exists and remains available

## Appetite

**1 week** - This focuses on visual enhancements without changing core
functionality.

## Solution

We'll implement three visual enhancements that make Aichaku's presence clear and
helpful:

### 1. Aichaku Visual Identity

**Icon Options:**

- 🪴 **Potted Plant** - Nurturing methodologies that grow with you

- 🫶 **Hands Holding Heart** - Cherishing your workflows

- 🍵 **Teacup** - Daily ritual and comfort

- 🌱 **Seedling** - Growth from small beginnings

- 🏮 **Paper Lantern** - Warm, guiding light

**Chosen Identity:**

````text
🪴 Aichaku: [message]
```text

**Why 🪴 Potted Plant:**

- Represents 愛着 (aichaku) - the warm attachment that grows over time

- Shows ongoing nurturing and care

- Methodologies that become more valuable with use

- Perfect metaphor for workflows that grow with your team

**Implementation in CLAUDE.md:**

```markdown
### Visual Communication

When Aichaku functionality is active, prefix messages with: 🪴 Aichaku: [your
message]

Examples:

- "🪴 Aichaku: I notice you're discussing a sprint. Let me help shape this
  idea..."

- "🪴 Aichaku: Creating Shape Up project: user-authentication-redesign"

- "🪴 Aichaku: Documents created in .claude/output/"

Note: Keep language clear and technical. Use growth icons (🌱🌿🌳🍃) as subtle
visual indicators for project phases, but avoid garden metaphors in text.
```text

### 2. Project Phase Indicators

**ASCII Progress Bar Approach:**

```text
🪴 Aichaku Progress: [Planning] ━━━○━━━━━━ [Executing] ━━━━━━━━━━ [Complete]
                     ████████████
```text

**Subtle Phase Indicators:**

```text
🪴 Aichaku: Project Phase
Planning → Executing → Reviewing → Complete
Icons: 🌱     🌿         🌳         🍃

Current: Executing 🌿
```text

**For Different Methodologies:**

**Shape Up:**

```text
🪴 Aichaku Shape Up:
[Shaping] → [**Betting**] → [Building] → [Cool-down]
                ▲
Visual: 🌱→🌿→🌳→🍃 (subtle indicators)
```text

**Scrum:**

```text
🪴 Aichaku Sprint 15:
Day 6/10 ████████░░░░░░ 60% 🌿
Ceremonies: ✅ Planning | 🔄 Daily (ongoing) | ⏳ Review | ⏳ Retro
Points: 24/40 complete
```text

**Implementation Using Node Libraries:**

For CLI usage (not in Claude Code):

```typescript
import { Spinner } from "@clack/prompts";
import chalk from "chalk";

// Visual phase indicator
const phases = ["Discussion", "Shaping", "Ready", "Created"];
const current = 1;

console.log(
  chalk.blue("🪴 Aichaku:"),
  phases.map((
    p,
    i,
  ) => (i === current ? chalk.bgBlue.white(` ${p} `) : chalk.gray(p))).join(
    " → ",
  ),
);
```text

### 3. Startup Reminder System

**Option A: Automatic Reminder in CLAUDE.md**

```markdown
## 🪴 Aichaku Active

This project has Aichaku installed. I will:

- Recognize methodology keywords (sprint, shape, kanban, MVP)

- Guide you through structured workflows

- Create organized documentation in .claude/output/

Say "help with Aichaku" for more information.
```text

**Option B: First Message Enhancement** Update CLAUDE.md to include:

```markdown
### Session Start Behavior

On first methodology keyword detection each session: "🪴 Aichaku: I noticed you
mentioned [keyword]. I'm here to help structure your [methodology] workflow.
Currently in discussion mode - let me know when you're ready to create project
documentation."
```text

**Option C: Status Command** Add to Aichaku CLI:

```bash
aichaku status --startup-reminder

# Output:
🪴 Aichaku v0.6.0 Active
━━━━━━━━━━━━━━━━━━━━━
✓ Global installation: ~/.claude
✓ Methodologies: Shape Up, Scrum, Kanban, Lean, XP
✓ Claude Code integration: Active

Trigger words: sprint, shape, kanban, MVP
Documentation: .claude/output/
```text

## Rabbit Holes

1. **Complex animations**: Keep progress indicators simple - ASCII and emoji
   only

2. **Over-branding**: Don't make Aichaku too prominent vs helpful

3. **Platform differences**: Visual elements must work everywhere Claude Code
   works

4. **Customization**: Avoid making icons/colors configurable

## No-gos

1. **Rich UI components**: No HTML, CSS, or interactive elements

2. **External dependencies**: Must work without additional libraries

3. **Breaking changes**: Existing projects continue working unchanged

4. **Mandatory adoption**: Visual elements remain optional enhancements

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

1. **Clear Attribution** - You know when Aichaku helps

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

- You can see project phase instantly

- Startup reminder appears appropriately

- No confusion about what's Aichaku vs Claude Code

- Visual elements enhance, not distract
````
