# Fix Security Tests - Pitch

## Problem
The Security Tests GitHub Action is failing on every commit due to formatting issues in CLAUDE.md. The formatter is complaining about line breaks and whitespace in the Aichaku integration section that was added by the `aichaku integrate` command.

## Appetite
2 weeks (but actually just a few minutes)

## Solution
The CLAUDE.md file has formatting issues where long lines are being broken up incorrectly. The formatter wants to reformat these lines but the file isn't being formatted before commit.

### Rough Sketch
1. Run `deno fmt` on CLAUDE.md to fix formatting
2. Commit the formatted version
3. Security tests should pass

## Rabbit Holes
- Don't try to fix the integrate command itself right now
- Don't modify the content, just the formatting
- Don't change the security test configuration

## No-gos
- We're NOT disabling the security tests
- We're NOT changing the formatter rules
- We're NOT modifying the content of CLAUDE.md

## Nice to Have
- Consider fixing the integrate command in a future iteration to output properly formatted content