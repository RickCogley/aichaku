# Market Validation: Is Adaptive Methodology Support Needed?

## Status: ACTIVE - PLANNING MODE

## Date: 2025-07-06

## The Fundamental Question

**Will people actually use this?**

## Target Users & Use Cases

### 1. Small Teams / Startups

- **Need**: Flexibility as they discover what works
- **Pain**: Rigid methodology tools that don't fit their reality
- **Aichaku Value**: Start with startup-friendly Lean, naturally evolve to Scrum as they grow

### 2. Consultants / Freelancers

- **Need**: Adapt to each client's terminology
- **Pain**: Context switching between client methodologies
- **Aichaku Value**: Speak the client's language while using best practices

### 3. Hybrid Organizations

- **Need**: Different methodologies for different projects
- **Pain**: Teams use inconsistent approaches
- **Aichaku Value**: Common foundation with flexible implementation

### 4. Methodology Transitions

- **Need**: Gradual change from one method to another
- **Pain**: Big bang methodology changes fail
- **Aichaku Value**: Gentle introduction of new concepts

## The Reality Check

### What Users Really Want

Based on your insight:

- **Flexibility in execution** ✅
- **Consistency in key outputs** ✅ (like change control logs)
- **Familiar terminology** ✅
- **Not another rigid system** ✅

### Potential Concerns

1. **"Jack of all trades, master of none"**
   - Risk: Superficial implementation of each methodology
   - Mitigation: Deep, practical templates for each

2. **"Our organization requires strict Scrum"**
   - Risk: Too flexible for regulated environments
   - Mitigation: Add `methodology-lock.json` option

3. **"This enables chaos"**
   - Risk: Teams cherry-pick without discipline
   - Mitigation: AI guides toward coherent practices

## Proposed Solution: Flexibility Levels

### 1. Adaptive Mode (Default)

```json
{
  "mode": "adaptive",
  "primary": null,
  "blending": "enabled"
}
```

- Full methodology blending
- Natural language detection
- Best for most users

### 2. Guided Mode

```json
{
  "mode": "guided",
  "primary": "scrum",
  "blending": "suggestions"
}
```

- Favors one methodology
- Suggests others when relevant
- Good for organizations with preferences

### 3. Strict Mode

```json
{
  "mode": "strict",
  "primary": "scrum",
  "blending": "disabled",
  "required": ["daily-standup", "retrospective"]
}
```

- Enforces methodology rules
- No blending
- For regulated environments

## Validation Approach

### MVP Testing

1. Release with adaptive mode only
2. Gather usage data:
   - Which methodologies get used together?
   - What blending happens naturally?
   - Where do users get confused?

### Success Metrics

- Users complete projects without methodology friction
- Natural blending occurs (Shape Up + Scrum standup)
- Positive feedback on flexibility
- No "methodology paralysis"

## The Bet

**Hypothesis**: Developers using AI for project management want methodology guidance that adapts to their language, not
forces them into rigid frameworks.

**Risk**: Low - worst case, it works like current single-methodology tools

**Reward**: High - could become the standard for AI-assisted project management

## Your Insight Applied

> "it's ok to have some changes to how projects are documented, so long as certain things are 'set in stone'"

This is exactly right. Aichaku should:

- Be flexible about HOW you work
- Be consistent about WHAT you deliver
- Let organizations define their "set in stone" requirements

## Decision

**Proceed with adaptive approach, but:**

1. Start simple (adaptive only)
2. Add configuration later based on usage
3. Always respect organizational requirements
4. Focus on practical value, not methodology purity

## Next Steps

1. Build MVP with adaptive behavior
2. Test with real projects
3. Iterate based on what actually helps
4. Add strict mode if users request it

The key insight: **Aichaku succeeds if it reduces methodology friction, not if it enforces methodology purity.**
