# Update: Emphasize Folder Structure in Methodologies

## Problem

Users don't know to create structured folders for changes. It's mentioned in PLANNING-MODE.md but not prominent enough.

## Solution

Add a clear "ALWAYS START HERE" section to all core mode files:

```markdown
## 📁 ALWAYS START WITH STRUCTURE

Before any new work, create your change folder: .claude/output/active-YYYY-MM-DD-descriptive-name/

This happens automatically when you say:

- "Let's add..."
- "I want to change..."
- "Help me implement..."
- "We need to fix..."
- "Can we improve..."

STATUS.md tracks your progress through Planning → Execution → Improvement
```

## Files to Update

1. `/methodologies/common/PLANNING-MODE.md`
2. `/methodologies/common/EXECUTION-MODE.md`
3. `/methodologies/common/IMPROVEMENT-MODE.md`
4. `/methodologies/BLENDING-GUIDE.md`

## Key Point

This should feel invisible to users - they just ask for something, and Claude Code creates the structure naturally.
