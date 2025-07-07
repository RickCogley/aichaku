# Stop Asking to Create Files - Pitch

## Problem
Two issues with current Aichaku directives:
1. Despite clear directives saying "YOU MUST NEVER: ❌ Wait for permission to create standard documents", Claude Code still asks "Would you like me to create STATUS.md?" and similar questions
2. CLAUDE.md directs to create "CHANGE-LOG.md" but it should use descriptive naming like "YYYY-MM-DD-Project-Name-CHANGE-LOG.md" for better recognition when shared as PDFs

## Appetite
2 weeks

## Solution
Strengthen the CLAUDE.md directives with more emphatic language and repetition to override Claude Code's default polite behavior.

### Rough Sketch

**Enhanced Directives:**
```markdown
### CRITICAL: NO ASKING, JUST CREATE

YOU MUST create files WITHOUT asking. This includes but is not limited to:
- STATUS.md - CREATE IT IMMEDIATELY
- pitch.md - CREATE IT IMMEDIATELY
- Any methodology document - CREATE IT IMMEDIATELY
- Any supporting file - CREATE IT IMMEDIATELY

NEVER use phrases like:
- "Would you like me to create..."
- "Shall I create..."
- "Should I make..."
- "Do you want me to..."

ALWAYS use phrases like:
- "Creating STATUS.md..."
- "Writing pitch.md..."
- "Generating documentation..."

This is MANDATORY. Users expect files to appear automatically.
```

**Fix Change Log Naming:**
```markdown
**Completing Work:**
1. Create change log with descriptive name: 
   `YYYY-MM-DD-{Project-Name}-CHANGE-LOG.md`
   Example: `2025-07-07-Fix-Security-Tests-CHANGE-LOG.md`
2. Rename folder: active-* → complete-*
3. Ask: "Work appears complete. Shall I commit and push?"
```

## Rabbit Holes
- Don't try to change Claude Code's core personality
- Don't make it create files the user didn't implicitly request
- Don't remove all confirmations (keep important ones like git push)

## No-gos
- We're NOT changing when to ask for git operations
- We're NOT removing completion confirmations
- We're NOT making it create files outside of Aichaku patterns

## Nice to Have
- Multiple reinforcement points in CLAUDE.md
- Clear examples of correct behavior
- Specific list of files that should be automatic