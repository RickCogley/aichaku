# MCP Prompting Techniques Summary

🪴 Aichaku: How Advanced Prompting Makes Reviews More Effective

## Techniques Incorporated

### 1. **Multi-Shot Prompting** ✅

Shows both bad and good examples side-by-side:

```
❌ Bad: const data: any = response
✅ Good: const data: ApiResponse = response
```

Claude learns by seeing the contrast.

### 2. **Context & Related Information** ✅

Explains WHY rules exist:

```
Context: TypeScript's type system prevents runtime errors. 
Using 'any' disables this protection and makes code harder to maintain.
```

Understanding the "why" creates lasting behavior change.

### 3. **Decomposition** ✅

Breaks complex fixes into manageable subtasks:

```
Step-by-Step Fix:
1. Look at how the variable is used
2. Create an interface with those properties
3. Replace 'any' with your interface
4. Fix any resulting type errors
```

Prevents overwhelm and ensures completeness.

### 4. **Sequencing** ✅

For security issues, emphasizes order:

```
1. STOP - Do not run this code until fixed
2. Replace string interpolation with array arguments
3. Use execFile instead of exec when possible
4. Validate/sanitize any user input
```

Critical issues get proper priority.

### 5. **Self-Reflection** ✅

Prompts introspection with targeted questions:

```
🤔 Reflection: What made me reach for 'any' instead of defining a proper type?
🤔 Reflection: Am I treating user input as potentially malicious in all cases?
```

Builds awareness of patterns.

### 6. **Step-by-Step Thinking** ✅

Guides through the thought process:

```
1. Analysis: First, trace through the code...
2. Strategy: Create a minimal interface...
3. Implementation: Replace 'any' with your interface...
```

Models good problem-solving approach.

## Example: Complete Enhanced Feedback

When Claude uses 'any' types:

```
🌱 Learning Opportunity - Let's fix this properly:

📖 Context: TypeScript's type system prevents runtime errors. Using 'any' 
disables this protection and makes code harder to maintain.

⚠️ Issue: Using 'any' instead of proper TypeScript types
Reminder: 📝 Your CLAUDE.md explicitly states to avoid 'any' types, but you used it 5 times.

❌ Bad Example:
const data: any = response

✅ Good Example:
interface UserData { id: string; name: string; }
const user: UserData = await getUser(id);

🔄 Step-by-Step Fix:
1. Look at how the variable is used (what properties/methods are accessed)
2. Create an interface with those properties
3. Replace 'any' with your interface
4. Fix any resulting type errors

🤔 Reflection: What made me reach for 'any' instead of defining a proper type?

📌 Note to self: I should follow the TypeScript standards in CLAUDE.md and avoid using 'any' types.
```

## Impact on Claude's Behavior

### Before (Simple Feedback)

```
MCP: "Found 5 'any' types"
Claude: "I'll fix those type issues"
[May make same mistake again]
```

### After (Advanced Prompting)

```
MCP: [Detailed guidance with examples, context, and steps]
Claude: "I understand now - using 'any' defeats TypeScript's purpose.
         Let me properly type these by examining usage patterns first..."
[Less likely to repeat mistake]
```

## Implementation Benefits

1. **Faster Learning**: Examples show exactly what to do
2. **Deeper Understanding**: Context explains why it matters
3. **Practical Guidance**: Steps prevent confusion
4. **Behavioral Change**: Reflection creates awareness
5. **Better Code**: Claude produces higher quality on first try

## Key Insight

By using these prompting techniques, the MCP becomes more than a reviewer - it
becomes an effective teacher that helps Claude internalize best practices and
write better code throughout the session.

The combination of:

- **WHY** (context)
- **WHAT** (examples)
- **HOW** (steps)
- **REFLECT** (questions)

Creates a powerful learning loop that improves code quality in real-time.
