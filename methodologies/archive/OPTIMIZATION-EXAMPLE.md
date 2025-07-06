# Prompt Optimization Example: Before & After

## Scenario
User: "I want to add user authentication to my app"

## BEFORE (Current Documentation Style)

Claude's internal process with current prompts:
```
*Reads through narrative descriptions*
"You are now a Shaper following the Shape Up methodology..."
"Shaping is a closed-door, creative process..."
"You combine interface design sensibility..."

*Uncertain about mode*
- Is this individual or team?
- Should I assume Shape Up?
- How much detail needed?

*Generic response*
"I'll help you shape user authentication. In Shape Up, we start by 
understanding the problem. Can you tell me more about what kind of 
authentication you need and what problems it solves for your users?"
```

**Issues**:
- Doesn't detect context
- Assumes methodology
- Vague questions
- No clear next steps

## AFTER (Optimized Prompt Style)

Claude's internal process with optimized prompts:
```
CONTEXT_DETECTION:
- Participants: 1 detected ("I", "my")
- Work type: Feature (authentication)
- Complexity: Unknown
- Methodology preference: None stated

ACTION: Assess before assuming methodology

RESPONSE:
```

Claude's actual response:

🎯 **Quick Context Check**

I notice you want to add authentication. To recommend the best approach:

**What's your situation?**
A) Solo project - I need to move fast
B) Team project - We need coordination  
C) Client work - They need visibility
D) Startup MVP - Need to validate quickly

**What's your timeline?**
- Days (urgent fix)
- 1-2 weeks (small feature)
- 3-6 weeks (full implementation)
- Exploring options

Based on your answers, I'll recommend whether to:
- **Shape Up**: Define the feature properly (2 or 6 week appetite)
- **Scrum**: Plan sprints with your team
- **Kanban**: Add to your flow
- **Lean**: Build minimal MVP first

Or would you prefer to jump straight into a specific methodology?

---

## What Changed?

### 1. Context Detection First
OLD: Assumes Shape Up
NEW: Detects individual/team, timeline, project type

### 2. Specific Questions
OLD: "Tell me more about authentication"
NEW: Multiple choice for quick answers

### 3. Adaptive Response
OLD: One-size-fits-all
NEW: Methodology recommendation based on context

### 4. Clear Next Steps
OLD: Vague exploration
NEW: Specific paths forward

## Example Continuation

User selects: "A) Solo project" and "1-2 weeks"

### OLD Approach Continues:
```
"Great! For authentication, we should think about the user journey.
What happens when users need to log in? What about password resets?
Let's explore the problem space..."
```

### NEW Approach Continues:
```
✅ Perfect fit for **Shape Up Small Batch** (2 weeks)

EXECUTING SHAPING PROTOCOL:

1️⃣ **Problem** (detected: solo, quick implementation)
   Standard auth - login/logout for your app

2️⃣ **Appetite** 
   ✓ Set to 2 weeks (small batch)

3️⃣ **Quick Solution Sketch**
   ```
   [Login Form] --submit--> [Validate] --success--> [Dashboard]
                               |
                               fail
                               ↓
                            [Error Msg]
   ```

4️⃣ **Rabbit Holes to Avoid**
   - Password complexity (use standard library)
   - Social login (skip for MVP)
   - 2FA (future enhancement)

5️⃣ **Starting Point**
   Which auth approach:
   A) Simple session-based (easiest)
   B) JWT tokens (stateless)
   C) Auth service (Auth0, Supabase)
   
   I can shape the implementation once you choose.
```

## Key Improvements

1. **Immediate Value**: Provides actionable structure right away
2. **Progressive Disclosure**: Doesn't overwhelm with all of Shape Up
3. **Decision Points**: Clear choices with implications
4. **Adapted Complexity**: Solo = simplified process
5. **Concrete Next Steps**: Pick A, B, or C to continue

## Prompt Engineering Principles Applied

### 1. Conditional Logic
```
IF solo THEN simplify
IF team THEN coordinate
IF urgent THEN kanban
```

### 2. Progressive Enhancement
Start simple, add complexity only when needed

### 3. Explicit Markers
🎯 Context check
✅ Decision made
1️⃣ Step numbers
🤔 Human decision needed

### 4. Constrained Choices
Not "tell me more" but "pick A, B, or C"

### 5. Context Preservation
Remembers: solo, 2 weeks, authentication
Applies: throughout interaction

## Result

**Before**: 3-4 back-and-forth messages to understand context
**After**: 1 message to establish context, then productive work

This optimization makes Claude Code more:
- Efficient in gathering context
- Adaptive to different situations  
- Clear about next steps
- Respectful of user's time
- Likely to provide immediate value