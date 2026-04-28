---
title: "Your First Aichaku Project"
---

This tutorial walks you through creating a real project with Aichaku and Claude. You'll build a simple feature from
planning through completion.

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

```
"I need to add user profiles to our web app. Users should be able to upload an avatar, set a bio, and choose privacy settings."
```

Claude responds based on your selected methodology and enters discussion mode:

```
🪴 Aichaku: I see you're thinking about user profiles. Let me help you explore this feature.

What's the main goal for these profiles? Are they for:
- Internal team collaboration
- Public-facing community
- Customer accounts
- Something else?
```

Answer Claude's questions to refine the idea:

```
"It's for our public community platform. Users want to personalize their presence and control what others can see."
```

## Step 2: Create the project

When you're ready to formalize the plan, tell Claude:

```
"Let's create a project for this user profile feature"
```

Claude immediately creates the project structure:

```
🪴 Aichaku: Creating project: user-profile-feature

✅ Created .claude/output/active-2025-07-10-user-profile-feature/
✅ Generated STATUS.md
✅ Created pitch.md (using Shape Up methodology)
```

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
```

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
```

## Step 4: Refine the plan

Work with Claude to improve the pitch:

```
"Can we add a section about what we're NOT doing? I want to keep this focused."
```

Claude updates the pitch:

```
🪴 Aichaku: Adding constraints section to pitch.md...

## Out of Scope
- Social media integration
- Profile themes/customization
- Follow/friend system (future cycle)
- Activity feeds
```

## Step 5: Switch to execution

When planning is complete, tell Claude:

```
"The pitch looks good. Let's start building."
```

Claude transitions to execution mode:

```
🪴 Aichaku: Switching to execution mode 🚀

✅ Updated STATUS.md to Building phase
✅ Created implementation-plan.md
✅ Set up task tracking

Current status:
[Shaping] → [Betting] → [**Building**] → [Cool-down]
                           ▲

Ready to start implementation!
```

## Step 6: Mix methodologies

During building, you might want practices from other methodologies:

```
"Can we use a Kanban board to track the implementation tasks?"
```

Claude seamlessly adds Kanban elements:

```
🪴 Aichaku: Adding Kanban board for task tracking.

✅ Created kanban-board.md
✅ Set up WIP limits
✅ Organized tasks by status

This blends nicely with Shape Up - using cycles for planning but Kanban for execution flow.
```

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
```

## Step 7: Track progress

As you work, update Claude on progress:

```
"We've completed the database schema and profile model. Starting on the API endpoints now."
```

Claude updates the tracking:

```
🪴 Aichaku: Great progress! Updating project status...

✅ Moved tasks to Done column
✅ Updated STATUS.md progress

Week 2/6 ████████░░░░░░░░░░ 33% 🌿

You're on track! The backend foundation is solid.
```

## Step 8: Handle challenges

When you encounter issues:

```
"We hit a snag with avatar uploads. The image processing is more complex than expected."
```

Claude helps adapt:

```
🪴 Aichaku: Let's document this rabbit hole and find a path forward.

I'll update:
- ✅ Added to rabbit-holes.md
- ✅ Suggested simpler approach using cloud service
- ✅ Updated time estimate in STATUS.md

Would you like to explore the cloud service option or stick with custom processing?
```

## Step 9: Complete the project

When the work is done:

```
"We've finished the user profile feature. All tests pass and it's deployed to staging."
```

Claude wraps up the project:

```
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
```

## Step 10: Reflect and learn

Choose to do a retrospective:

```
"Let's do a quick retrospective"
```

Claude creates a retrospective document:

```
🪴 Aichaku: Creating retrospective for user profile feature...

✅ Created retrospective.md using Scrum's format
```

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
```

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

```
"I need to plan a sprint for bug fixes"
```

Notice how Claude adapts to Scrum terminology and templates.

### Exercise 2: Quick task

Try a simple Kanban flow:

```
"Let's set up a Kanban board for managing support tickets"
```

See how Claude creates a flow-based approach without cycles or sprints.

### Exercise 3: Methodology blend

Explicitly mix approaches:

```
"I want to use Lean experiments but track them in Scrum sprints"
```

Watch Claude seamlessly blend the methodologies.

## Common patterns

### Starting projects

```
"I need to [action] for [feature/problem]"
→ Discussion mode →
"Create a project" →
Project created
```

### Switching modes

```
"Let's start building" → Execution mode
"Time for a retrospective" → Improvement mode
"Let's plan the next cycle" → Planning mode
```

### Adding practices

```
"Can we add [practice] from [methodology]?"
→ Claude adds without disrupting flow
```

## Next steps

Now you can:

- Create projects with confidence
- Mix methodologies naturally
- Track progress effectively
- Complete work properly

Continue learning:

- Read [Configure Your Project](../how-to/configure-project.md)
- Explore [Core Concepts](../explanation/core-concepts.md)
- Study [Using MCP with Multiple Projects](../how-to/use-mcp-with-multiple-projects.md)

Remember: Aichaku adapts to how you work, not the other way around. Happy building! 🪴
