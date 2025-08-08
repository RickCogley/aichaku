# Shape Up: Aichaku Documentation and Standards Cleanup

## Problem

Users are confused by the current aichaku interface and documentation:

1. **Standards list confusion**: The `--list` command shows "(metadata)" which looks like IDs but are actually
   categories. Users don't know what to use with `--add`.

2. **README overwhelm**: At 1000+ lines, the README is too long and marketing-heavy for developers who just want to get
   things done.

3. **Expert agents are too aggressive**: They rewrite entire files without permission, causing frustration.

4. **Outdated documentation**: JSDoc and mod.ts don't reflect current capabilities.

## Appetite

**2-3 hours** - This is focused cleanup work, not a major redesign.

## Solution

### 1. Fix Standards Display Structure

**Current confusing output:**

```
▸ Architecture Standards (metadata)
  - 15-Factor App Methodology (15-factor)
```

**New clear structure:**

```
## Architecture
  15-factor     - Modern cloud-native app methodology  
  clean-arch    - Clean Architecture principles
  ddd          - Domain-Driven Design patterns
```

The ID comes first, clearly showing what to use with `--add`.

### 2. Developer-Focused README

Rewrite focusing on:

- Under 200 lines total
- Practical command examples
- Minimal emoji usage
- Clear organization
- No version history or "added in vX.X" mentions

Structure:

1. Brief intro (3 lines max)
2. Quick start (as updated)
3. Common tasks with examples
4. Feature list (bullet points)
5. Links to full docs

### 3. Expert Agent Behavioral Rules

Add to each expert template:

```yaml
behavioral_rules:
  - Act as a knowledgeable advisor, not an autonomous rewriter
  - Suggest improvements and explain reasoning
  - For large changes, provide examples but defer implementation
  - Route major refactoring decisions back to orchestrator
  - Focus on teaching and code review, not wholesale replacement
```

### 4. Documentation Updates

- Update mod.ts JSDoc with current features
- Review all TypeScript files for Deno doc compatibility
- Use only supported tags: @module, @param, @returns, @example

## Rabbit Holes

- Don't redesign the entire formatter system
- Don't rewrite all documentation from scratch
- Don't change the fundamental command structure
- Don't add new features while fixing these issues

## No-gos

- Breaking changes to command interface
- Changing how standards/methodologies are stored
- Major architectural changes
- Adding complex new formatting systems

## Success Criteria

1. Users can immediately understand what IDs to use with `--add` commands
2. README is under 200 lines and developer-focused
3. Expert agents provide guidance without autonomously rewriting
4. All documentation is current and accurate
5. No breaking changes to existing functionality
