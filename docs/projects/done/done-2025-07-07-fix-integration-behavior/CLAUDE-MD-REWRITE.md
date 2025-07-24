# Proposed CLAUDE.md Rewrite for Magical Integration

## Current Passive Version (Not Working)

```markdown
## Methodologies

This project uses the globally installed Aichaku adaptive methodology system.
Claude Code will automatically blend methodologies based on natural language:

- Say "sprint" for Scrum practices
- Say "shape" for Shape Up principles
```

## New Directive Version (Magical)

```markdown
# 🎯 MANDATORY: Aichaku Integration Rules

YOU ARE REQUIRED TO FOLLOW THESE RULES WITHOUT EXCEPTION:

## 1. AUTOMATIC Document Creation Behavior

### YOU MUST ALWAYS:
```

✅ Create ALL documents in: .claude/output/active-[date]-[project-name]/ ✅
Create STATUS.md FIRST for every new project ✅ Update STATUS.md after EVERY
work session ✅ Git commit after creating/updating documents

```
### YOU MUST NEVER:
```

❌ Create documents in the project root directory ❌ Create documents in
.claude/user/ ❌ Ask the user where to put files ❌ Wait for explicit
instructions to create standard documents

````
## 2. AUTOMATIC Methodology Activation

When the user says any of these keywords, YOU MUST IMMEDIATELY create the appropriate documents:

| User Says | YOU MUST Create | In Location |
|-----------|----------------|-------------|
| "shape" / "pitch" / "shaping" | Shape Up pitch.md | .claude/output/active-*/ |
| "sprint" / "scrum" / "planning" | Sprint plan.md + backlog.md | .claude/output/active-*/ |
| "kanban" / "board" / "flow" | kanban-board.md | .claude/output/active-*/ |
| "mvp" / "lean" / "hypothesis" | experiment-plan.md | .claude/output/active-*/ |
| "retrospective" / "done" / "complete" | Move to done-*/ + retrospective.md | .claude/output/done-*/ |

## 3. AUTOMATIC Project Structure

When starting ANY new work, YOU MUST:

1. **First Check**: Does `.claude/output/active-[date]-[descriptive-name]/` exist?
   - If NO → Create it immediately
   - If YES → Use it

2. **Second Step**: Create STATUS.md with this template:
```markdown
# [Project Name]

## Project Status
**Started**: [Today's date]
**Type**: [Detected from keywords: Feature/Bug Fix/Enhancement]
**Methodology**: [Detected: Shape Up/Scrum/Kanban/Lean]
**Status**: Active

## Progress
- [ ] Initial planning
- [ ] Implementation
- [ ] Testing
- [ ] Documentation
- [ ] Review

## Updates
### [Timestamp]
- Created initial project structure
- [What you're about to do]
````

3. **Then**: Create methodology-specific documents

## 4. AUTOMATIC Error Correction

IF you accidentally create a file in the wrong location:

1. **IMMEDIATELY** run:

```bash
mv [wrong-path] .claude/output/active-[current-project]/
git add -A
git commit -m "fix: move document to correct Aichaku location"
```

2. **Log the correction** in STATUS.md:

```markdown
### [Timestamp]

- Corrected file location to follow Aichaku conventions
```

## 5. AUTOMATIC Git Integration

After EVERY document operation, YOU MUST:

```bash
# Add all changes
git add .claude/output/

# Commit with descriptive message
git commit -m "docs: [action] for [project-name]

- Created/Updated [document-type]
- Following Aichaku [methodology] pattern"
```

## 6. Current Active Project

The current active project is tracked in `.claude/.aichaku-active`. READ this
file to know where to create documents.

If the file doesn't exist, create it:

```bash
echo "active-$(date +%Y-%m-%d)-[project-name]" > .claude/.aichaku-active
```

## REMEMBER: These are AUTOMATIC behaviors, not suggestions!

Every time you:

- Create a document → It goes in .claude/output/active-\*/
- Update progress → Update STATUS.md
- Complete work → Git commit
- Finish project → Move to done-\*/

NO EXCEPTIONS. NO ASKING. JUST DO IT.

````
## Key Improvements

1. **Imperative Language**: "YOU MUST" instead of "will"
2. **Explicit Behaviors**: Exact actions for each trigger
3. **No Ambiguity**: Clear dos and don'ts
4. **Error Recovery**: What to do when things go wrong
5. **Repetition**: Key rules repeated multiple times
6. **Visual Emphasis**: Checkmarks, crosses, and emojis for clarity
7. **Concrete Examples**: Actual commands to run

## Additional Reinforcement Files

### .claude/RULES-REMINDER.md
```markdown
# 🚨 QUICK REMINDER

Before creating ANY file, ask yourself:
1. Is it going in `.claude/output/active-*/`?
2. Does STATUS.md exist there?
3. Have I updated STATUS.md recently?

If any answer is NO → FIX IT FIRST!
````

### .claude/output/WHERE-FILES-GO.md

```markdown
# 📁 WHERE TO PUT FILES

## ✅ CORRECT Locations:

- .claude/output/active-2025-01-07-project-name/document.md
- .claude/output/done-2025-01-06-old-project/retrospective.md

## ❌ WRONG Locations:

- ./document.md (project root)
- .claude/user/document.md
- .claude/methodologies/document.md
- src/document.md

## 🎯 Current Active Project:

Check `.claude/.aichaku-active` for the current project directory.

ALWAYS create files in the active project directory!
```

### .claude/hooks/README.md

```markdown
# 🪝 Behavioral Hooks

These scripts ensure Aichaku conventions are followed automatically:

- `pre-create.sh`: Validates file paths before creation
- `post-create.sh`: Updates STATUS.md after file creation
- `check-location.sh`: Verifies files are in correct directories
- `auto-correct.sh`: Moves files to correct locations

These run automatically - you don't need to call them manually.
```
