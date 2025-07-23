# Shape: Help Command Improvements

## Problem

The help command works but could be more helpful:

1. No examples of actual usage with Claude Code

2. Methodology names don't match how users refer to them (e.g., "shape-up" vs
   "shape up")

3. No quick reference for common commands

4. Output is text-heavy

## Appetite

Small batch - 1 hour

## Solution

### 1. Add Usage Examples Section

Show real Claude Code interactions:

````text
Examples with Claude Code:

  "Let's shape a new feature" → Activates Shape Up mode
  "Time for our daily standup" → Uses Scrum practices
  "Show me the kanban board" → Displays work in progress
```text

### 2. Support Natural Names

- Accept "shape up", "shape-up", "shapeup"

- Accept "xp" or "extreme programming"

- Make matching case-insensitive and flexible

### 3. Add Quick Reference

```text
aichaku help
```text

Should show:

- Common commands (init, upgrade, help)

- Quick methodology list with triggers

- Link to full docs

### 4. Improve Formatting

- Use better spacing

- Add emoji indicators

- Make it scannable

## Rabbit Holes

- Don't add too many aliases

- Keep help text concise

- Don't duplicate README content

## No-gos

- No interactive help

- No external dependencies

- No network calls for help
````
