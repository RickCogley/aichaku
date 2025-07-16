# Preventing Date Mistakes in Aichaku

## The Problem

Despite clear formatting guidelines, Claude frequently uses incorrect dates
(like 2025-01-10 instead of 2025-07-10) when creating project folders.

## Current Guidance

The CLAUDE.md currently says:

```
Create: `.claude/output/active-YYYY-MM-DD-{descriptive-name}/`
```

This shows the format but doesn't emphasize checking the actual date.

## Proposed Enhancement to CLAUDE.md

### Option 1: Add Explicit Date Check Reminder

```markdown
**Starting Work:**

1. ⚠️ CHECK TODAY'S DATE: Look for "Today's date:" in the environment info
2. Create: `.claude/output/active-YYYY-MM-DD-{descriptive-name}/`
   - YYYY-MM-DD must be TODAY'S actual date from environment
   - Common mistake: Using 01 instead of current month (07)
   - Example if today is 2025-07-10: `active-2025-07-10-project-name/`
```

### Option 2: Add Date Validation Section

```markdown
### 📅 DATE REMINDER

**ALWAYS check "Today's date:" in the environment info before creating
folders!**

Common mistakes to avoid:

- ❌ Using 01 (January) when it's actually 07 (July)
- ❌ Using yesterday's or tomorrow's date
- ❌ Copying dates from examples without updating

**Before creating any folder:**

1. Find "Today's date: YYYY-MM-DD" in environment
2. Use THAT exact date
3. Double-check: Is the month 01 or 07?
```

### Option 3: Visual Emphasis

```markdown
### 6. Project Lifecycle Management

**Starting Work:**

1. 🚨 **CRITICAL: Check "Today's date:" in environment info** 🚨
2. Create: `.claude/output/active-[TODAY'S-DATE]-{descriptive-name}/`
   - Replace [TODAY'S-DATE] with actual date from environment
   - Format: YYYY-MM-DD (e.g., 2025-07-10, NOT 2025-01-10)
```

## Additional Strategies

### 1. Environment Info Enhancement

Add to Claude's system prompt or environment display:

```
<env>
Working directory: /Users/rcogley/dev/aichaku
Today's date: 2025-07-10 ⚠️ USE THIS DATE FOR FOLDERS
</env>
```

### 2. Pre-Creation Reminder

Add a step before folder creation:

```markdown
**Phase 3: CREATE NAMED PROJECT** ✅ First ask yourself: "What is today's date
from the environment info?" ✅ Confirm: "Today is 2025-07-10" (example) ✅ Then
create: active-2025-07-10-{descriptive-name}/
```

### 3. Example with Current Date Reference

Instead of static examples:

```markdown
Examples (assuming today is shown as 2025-07-10 in environment):

- ✅ active-2025-07-10-new-feature/
- ❌ active-2025-01-10-new-feature/ (wrong month!)
```

## Recommendation

I recommend **Option 1** with the explicit date check reminder. It:

- Makes checking the date a required first step
- Highlights the common 01/07 confusion
- Provides a concrete example using "today"
- Doesn't add too much complexity

The key insight is that the current guide assumes I'll naturally check the
environment date, but in practice, I often default to "01" for the month or copy
from examples without updating.

## Testing the Fix

After updating CLAUDE.md:

1. Start a new conversation
2. Ask Claude to create a project
3. Verify it uses the correct current date
4. Monitor if the mistake recurs

The goal is to make it impossible to create a folder without first consciously
checking today's actual date.
