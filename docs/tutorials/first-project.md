# Your First Aichaku Project

This tutorial walks you through creating a real project with Aichaku and Claude.
You'll build a simple feature from planning through completion.

## What you'll build

You'll create a user profile feature for a web application, learning how to:

- Plan the feature using a methodology

- Switch to execution mode

- Track progress with STATUS.md

- Mix methodologies when helpful

- Complete and archive the project

## Prerequisites

You should have:

- Completed the [Getting Started](getting-started.md) tutorial

- Aichaku installed and configured

- Access to Claude

- A project directory ready

## Step 1: Start the conversation

Open Claude and describe what you want to build:

````text
"I need to add user profiles to our web app. Users should be able to upload an avatar, set a bio, and choose privacy settings."
```text

Claude recognizes you're planning and enters discussion mode:

```text
🪴 Aichaku: I see you're thinking about user profiles. Let me help you explore this feature.

What's the main goal for these profiles? Are they for:

- Internal team collaboration

- Public-facing community

- Customer accounts

- Something else?
```text

Answer Claude's questions to refine the idea:

```text
"It's for our public community platform. Users want to personalize their presence and control what others can see."
```text

## Step 2: Create the project

When you're ready to formalize the plan, tell Claude:

```text
"Let's create a project for this user profile feature"
```text

Claude immediately creates the project structure:

```text
🪴 Aichaku: Creating project: user-profile-feature

✅ Created .claude/output/active-2025-07-10-user-profile-feature/
✅ Generated STATUS.md
✅ Created pitch.md (using Shape Up methodology)
```text

## Step 3: Review the generated documents

Claude creates initial documents based on your discussion:

### STATUS.md

```markdown
# Project Status

🪴 Aichaku: Shape Up Progress

[**Shaping**] → [Betting] → [Building] → [Cool-down] ▲

Week 1/6 ████░░░░░░░░░░░░░░ 17% 🌱

## Current Focus

Shaping the user profile feature solution

## Key Decisions

- Supporting avatar uploads (max 5MB)

- Bio limited to 500 characters

- Three privacy levels: public, friends, private

## Next Actions

- [ ] Complete technical approach in pitch

- [ ] Identify rabbit holes

- [ ] Estimate appetite
```text

### pitch.md

```markdown
# User Profile Feature

## Problem

Users cannot personalize their presence on the platform. They want to:

- Express their identity with avatars and bios

- Control who sees their information

- Build community connections

## Appetite

6 weeks with 2 developers

## Solution

### Core elements

1. Profile edit page

2. Avatar upload system

3. Privacy controls

4. Public profile view

[Technical details Claude gathered from conversation...]
```text

## Step 4: Refine the plan

Work with Claude to improve the pitch:

```text
"Can we add a section about what we're NOT doing? I want to keep this focused."
```text

Claude updates the pitch:

```text
🪴 Aichaku: Adding constraints section to pitch.md...

## Out of Scope

- Social media integration

- Profile themes/customization

- Follow/friend system (future cycle)

- Activity feeds
```text

## Step 5: Switch to execution

When planning is complete, tell Claude:

```text
"The pitch looks good. Let's start building."
```text

Claude transitions to execution mode:

```text
🪴 Aichaku: Switching to execution mode 🚀

✅ Updated STATUS.md to Building phase
✅ Created implementation-plan.md
✅ Set up task tracking

Current status:
[Shaping] → [Betting] → [**Building**] → [Cool-down]
                           ▲

Ready to start implementation!
```text

## Step 6: Mix methodologies

During building, you might want practices from other methodologies:

```text
"Can we use a Kanban board to track the implementation tasks?"
```text

Claude seamlessly adds Kanban elements:

```text
🪴 Aichaku: Adding Kanban board for task tracking.

✅ Created kanban-board.md
✅ Set up WIP limits
✅ Organized tasks by status

This blends nicely with Shape Up - using cycles for planning but Kanban for execution flow.
```text

### kanban-board.md

```markdown
# Implementation Kanban Board

## 📋 Backlog (8)

- [ ] Design database schema

- [ ] Create profile edit API endpoint

- [ ] Build avatar upload service

- [ ] Implement privacy controls

- [ ] Design profile edit UI

- [ ] Create public profile view

- [ ] Add form validation

- [ ] Write integration tests

## 🚧 In Progress (WIP: 2/3)

- [ ] Set up profile model (@alex)

- [ ] Create edit form component (@sam)

## 👀 Review (1)

- [ ] Database migration script

## ✅ Done (0)
```text

## Step 7: Track progress

As you work, update Claude on progress:

```text
"We've completed the database schema and profile model. Starting on the API endpoints now."
```text

Claude updates the tracking:

```text
🪴 Aichaku: Great progress! Updating project status...

✅ Moved tasks to Done column
✅ Updated STATUS.md progress

Week 2/6 ████████░░░░░░░░░░ 33% 🌿

You're on track! The backend foundation is solid.
```text

## Step 8: Handle challenges

When you encounter issues:

```text
"We hit a snag with avatar uploads. The image processing is more complex than expected."
```text

Claude helps adapt:

```text
🪴 Aichaku: Let's document this rabbit hole and find a path forward.

I'll update:

- ✅ Added to rabbit-holes.md

- ✅ Suggested simpler approach using cloud service

- ✅ Updated time estimate in STATUS.md

Would you like to explore the cloud service option or stick with custom processing?
```text

## Step 9: Complete the project

When the work is done:

```text
"We've finished the user profile feature. All tests pass and it's deployed to staging."
```text

Claude wraps up the project:

```text
🪴 Aichaku: Excellent! Let's complete this project properly.

✅ Updated STATUS.md to Complete
✅ Created 2025-07-10-User-Profile-Feature-CHANGE-LOG.md
✅ Generated completion summary

[Shaping] → [Betting] → [Building] → [**Cool-down**]
                                          ▲

Week 6/6 ████████████████████ 100% 🍃

Would you like to:

1. Do a retrospective on this cycle?

2. Archive the project?

3. Start planning the next feature?
```text

## Step 10: Reflect and learn

Choose to do a retrospective:

```text
"Let's do a quick retrospective"
```text

Claude creates a retrospective document:

```text
🪴 Aichaku: Creating retrospective for user profile feature...

✅ Created retrospective.md using Scrum's format
```text

### retrospective.md

```markdown
# User Profile Feature Retrospective

## What went well? 🌟

- Clean API design

- Good privacy control implementation

- Effective use of Kanban board mid-cycle

## What could improve? 🔧

- Avatar upload complexity underestimated

- Need better upfront technical research

- Testing took longer than expected

## Action items 📋

- [ ] Research cloud services for future uploads

- [ ] Add technical spike to shaping phase

- [ ] Budget more time for testing
```text

## What you learned

In this tutorial, you:

- ✅ Started with natural conversation

- ✅ Let ideas develop before creating documents

- ✅ Used Shape Up as primary methodology

- ✅ Mixed in Kanban for execution

- ✅ Tracked progress throughout

- ✅ Completed with proper documentation

- ✅ Reflected with a retrospective

## Key takeaways

### The natural flow

Notice how you never:

- Memorized commands

- Configured complex settings

- Worried about file placement

- Switched tools

Everything flowed naturally through conversation.

### Methodology flexibility

You started with Shape Up but borrowed:

- Kanban board for task tracking

- Scrum retrospective for learning

This mixing is encouraged - real teams work this way.

### Document artifacts

Every phase produced useful documents:

- Planning → pitch.md

- Execution → kanban-board.md

- Completion → CHANGE-LOG.md

- Reflection → retrospective.md

These become your project history.

## Try it yourself

### Exercise 1: Different methodology

Start a new project using Scrum:

```text
"I need to plan a sprint for bug fixes"
```text

Notice how Claude adapts to Scrum terminology and templates.

### Exercise 2: Quick task

Try a simple Kanban flow:

```text
"Let's set up a Kanban board for managing support tickets"
```text

See how Claude creates a flow-based approach without cycles or sprints.

### Exercise 3: Methodology blend

Explicitly mix approaches:

```text
"I want to use Lean experiments but track them in Scrum sprints"
```text

Watch Claude seamlessly blend the methodologies.

## Common patterns

### Starting projects

```text
"I need to [action] for [feature/problem]"
→ Discussion mode →
"Create a project" →
Project created
```text

### Switching modes

```text
"Let's start building" → Execution mode
"Time for a retrospective" → Improvement mode
"Let's plan the next cycle" → Planning mode
```text

### Adding practices

```text
"Can we add [practice] from [methodology]?"
→ Claude adds without disrupting flow
```text

## Next steps

Now you can:

- Create projects with confidence

- Mix methodologies naturally

- Track progress effectively

- Complete work properly

Continue learning:

- Read [Configure Your Project](../how-to/configure-project.md)

- Explore [Core Concepts](../explanation/core-concepts.md)

- Study
  [Using MCP with Multiple Projects](../how-to/use-mcp-with-multiple-projects.md)

Remember: Aichaku adapts to how you work, not the other way around. Happy
building! 🪴
````
