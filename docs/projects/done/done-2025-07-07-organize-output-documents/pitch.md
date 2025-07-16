# Organize Output Documents - Pitch

## Problem

Several completed projects in `.claude/output/` are still marked with `active-`
prefix when they should be `complete-`. This creates confusion about what work
is actually ongoing versus finished.

## Appetite

2 weeks (but actually just a few minutes of work)

## Solution

1. Identify which `active-*` directories contain completed work
2. Rename them to `complete-*` to reflect their true status
3. Ensure all documents are properly organized

### Rough Sketch

```
.claude/output/
├── active-* (only truly active work)
├── complete-* (finished projects)
├── cancelled-* (stopped projects)
└── paused-* (on hold)
```

## Rabbit Holes

- Don't reorganize the internal structure of projects
- Don't modify any document content
- Don't delete anything

## No-gos

- We're NOT changing the naming convention
- We're NOT moving documents between projects
- We're NOT creating new documentation

## Nice to Have

- Consistent status across all projects
- Clear separation between active and completed work
