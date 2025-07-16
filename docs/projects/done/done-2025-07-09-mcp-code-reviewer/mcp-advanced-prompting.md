# MCP Advanced Prompting Strategy

🪴 Aichaku: Leveraging LLM Best Practices for Effective Feedback

## Overview

The MCP can use proven prompting techniques to make its feedback more effective
at changing Claude's behavior within a session.

## Enhanced Feedback Structure

```typescript
interface AdvancedClaudeGuidance {
  // Context Setting (Related Information)
  context: {
    why: string; // Why this rule exists
    impact: string; // What happens if violated
    standards: string[]; // Which standards require this
  };

  // Multi-Shot Examples
  examples: {
    bad: CodeExample[]; // What NOT to do
    good: CodeExample[]; // What TO do instead
    explanation: string; // Why good is better
  };

  // Decomposition Strategy
  subtasks: {
    immediate: string[]; // Fix these first
    dependencies: string[]; // Check these before fixing
    verification: string[]; // How to verify fixes
  };

  // Sequencing Guidance
  fixSequence: {
    order: FixStep[]; // Optimal order of fixes
    rationale: string; // Why this order
  };

  // Self-Reflection Prompt
  reflection: {
    questions: string[]; // Questions for Claude to consider
    patterns: string[]; // Patterns to watch for
  };

  // Step-by-Step Guidance
  stepByStep: {
    analysis: string; // How to analyze the problem
    approach: string; // How to approach the fix
    implementation: string; // How to implement correctly
  };
}
```

## Implementation Examples

### 1. TypeScript 'any' Violations with Advanced Prompting

```typescript
const typeScriptAnyGuidance: AdvancedClaudeGuidance = {
  context: {
    why:
      "TypeScript's type system prevents runtime errors by catching type mismatches at compile time. Using 'any' disables this protection.",
    impact:
      "Code with 'any' types is prone to runtime errors, harder to refactor, and loses IntelliSense support.",
    standards: ["CLAUDE.md", "google-typescript-style", "clean-code"],
  },

  examples: {
    bad: [{
      code:
        "const processData = (data: any) => {\n  return data.items.map((item: any) => item.name);\n}",
      issue: "No type safety - could crash if data doesn't have items array",
    }],
    good: [{
      code:
        "interface ApiResponse {\n  items: Array<{ name: string; id: number }>;\n}\n\nconst processData = (data: ApiResponse) => {\n  return data.items.map(item => item.name);\n}",
      benefit: "Type-safe, auto-completion works, refactoring is safe",
    }],
    explanation:
      "The good example defines the exact shape of data, enabling TypeScript to catch errors before runtime.",
  },

  subtasks: {
    immediate: [
      "1. Examine how each 'any' variable is used in the code",
      "2. Identify the actual properties/methods accessed",
      "3. Create interfaces based on actual usage",
    ],
    dependencies: [
      "Check if there are existing type definitions to import",
      "Verify API documentation for response shapes",
    ],
    verification: [
      "Remove all 'any' types",
      "Ensure no TypeScript errors remain",
      "Verify IntelliSense shows proper suggestions",
    ],
  },

  fixSequence: {
    order: [
      { step: "Analyze usage patterns", priority: 1 },
      { step: "Define interfaces", priority: 2 },
      { step: "Replace any with specific types", priority: 3 },
      { step: "Fix resulting type errors", priority: 4 },
    ],
    rationale:
      "Understanding usage before defining types prevents over-engineering and ensures types match actual needs",
  },

  reflection: {
    questions: [
      "What pattern led me to use 'any' initially?",
      "Could I have inferred the type from the context?",
      "What would have helped me choose the right type from the start?",
    ],
    patterns: [
      "Using 'any' for function parameters without checking usage",
      "Using 'any' for API responses instead of defining interfaces",
      "Using 'any' to silence TypeScript errors instead of fixing them",
    ],
  },

  stepByStep: {
    analysis:
      "First, trace through the code to see exactly how each 'any' typed variable is used. Look for property accesses, method calls, and operations.",
    approach:
      "Create a minimal interface that includes only the properties/methods actually used. Start specific and generalize only if needed.",
    implementation:
      "Replace 'any' with your interface, then fix any TypeScript errors that appear. These errors often reveal additional type requirements.",
  },
};
```

### 2. Security Violations with Decomposition

```typescript
const securityGuidance: AdvancedClaudeGuidance = {
  context: {
    why:
      "Command injection is the #1 security risk. Attackers can execute arbitrary commands on your server.",
    impact:
      "Complete system compromise, data theft, service disruption, legal liability.",
    standards: ["OWASP-A03", "CWE-78", "security-baseline"],
  },

  examples: {
    bad: [{
      code: 'exec(`git commit -m "${message}"`)',
      issue: "User input in message could include ; rm -rf /",
    }],
    good: [{
      code: 'execFile("git", ["commit", "-m", message])',
      benefit: "Arguments passed as array, no shell interpretation",
    }],
    explanation:
      "execFile with array arguments prevents shell interpretation of special characters",
  },

  subtasks: {
    immediate: [
      "STOP: Do not run this code until fixed",
      "Identify all exec/system calls with string interpolation",
      "List all user-controlled inputs",
    ],
    dependencies: [
      "Understand what commands actually need to run",
      "Check if there's a library API instead of shell commands",
      "Verify input validation requirements",
    ],
    verification: [
      "No string interpolation in shell commands",
      "All user input properly escaped or parameterized",
      "Security tests pass",
    ],
  },
  // ... continues with full guidance
};
```

### 3. Methodology Violations with Self-Reflection

```typescript
const methodologyGuidance: AdvancedClaudeGuidance = {
  context: {
    why:
      "Shape Up's appetite prevents scope creep and ensures timely delivery. Missing it defeats the methodology's purpose.",
    impact:
      "Projects drag on indefinitely, team morale drops, stakeholders lose confidence.",
    standards: ["shape-up-methodology", "project-management-best-practices"],
  },

  reflection: {
    questions: [
      "Did I read the Shape Up section in CLAUDE.md?",
      "Do I understand why appetite is critical to Shape Up?",
      "What made me skip this required element?",
      "How can I ensure I include all methodology requirements?",
    ],
    patterns: [
      "Focusing on solution before understanding constraints",
      "Skipping methodology requirements when excited about implementation",
      "Not using a checklist for required sections",
    ],
  },

  stepByStep: {
    analysis:
      "Review the Shape Up methodology requirements. Understand that appetite is not just a deadline but a core constraint that shapes the solution.",
    approach:
      "Before writing any solution, always define appetite first. It determines what's possible.",
    implementation:
      "Add 'Appetite: X weeks' section immediately after Problem. Let it guide your solution design.",
  },
};
```

## MCP Response Format

```typescript
class EnhancedReviewEngine {
  formatAdvancedGuidance(findings: Finding[]): string {
    const guidance = this.generateAdvancedGuidance(findings);

    return `
🔍 Code Review Complete

${this.formatFindings(findings)}

🎓 Learning Opportunity - Let's fix this properly:

📖 Context:
WHY this matters: ${guidance.context.why}
IMPACT if ignored: ${guidance.context.impact}
REQUIRED BY: ${guidance.context.standards.join(", ")}

📝 Examples to Learn From:
❌ AVOID:
\`\`\`typescript
${guidance.examples.bad[0].code}
\`\`\`
Problem: ${guidance.examples.bad[0].issue}

✅ INSTEAD DO:
\`\`\`typescript
${guidance.examples.good[0].code}
\`\`\`
Benefit: ${guidance.examples.good[0].benefit}

🔄 Step-by-Step Fix Process:
${guidance.subtasks.immediate.map((task, i) => `${i + 1}. ${task}`).join("\n")}

🤔 Reflection Questions:
${guidance.reflection.questions.map((q) => `• ${q}`).join("\n")}

💡 Approach:
1. Analysis: ${guidance.stepByStep.analysis}
2. Strategy: ${guidance.stepByStep.approach}
3. Implementation: ${guidance.stepByStep.implementation}

Remember: ${guidance.reflection.patterns[0]}
`;
  }
}
```

## Benefits of Advanced Prompting

### 1. **Deeper Understanding**

- Claude understands WHY, not just WHAT
- Context helps avoid future violations

### 2. **Concrete Learning**

- Examples show exact transformations
- Pattern recognition improves

### 3. **Structured Thinking**

- Decomposition prevents overwhelm
- Sequencing ensures completeness

### 4. **Behavioral Change**

- Reflection creates awareness
- Questions prompt better habits

### 5. **Practical Guidance**

- Step-by-step prevents confusion
- Clear path from problem to solution

## Example Full Response

````
🔍 Code Review Results for auth.ts

Found 5 instances of 'any' type usage

🎓 Learning Opportunity - Let's fix this properly:

📖 Context:
WHY this matters: TypeScript's type system prevents runtime errors by catching type mismatches at compile time. Using 'any' disables this protection.
IMPACT if ignored: Code with 'any' types is prone to runtime errors, harder to refactor, and loses IntelliSense support.
REQUIRED BY: CLAUDE.md, google-typescript-style, clean-code

📝 Examples to Learn From:
❌ AVOID:
```typescript
const processData = (data: any) => {
  return data.items.map((item: any) => item.name);
}
````

Problem: No type safety - could crash if data doesn't have items array

✅ INSTEAD DO:

```typescript
interface ApiResponse {
  items: Array<{ name: string; id: number }>;
}

const processData = (data: ApiResponse) => {
  return data.items.map((item) => item.name);
};
```

Benefit: Type-safe, auto-completion works, refactoring is safe

🔄 Step-by-Step Fix Process:

1. Examine how each 'any' variable is used in the code
2. Identify the actual properties/methods accessed
3. Create interfaces based on actual usage

Before you fix, check: • Are there existing type definitions to import? • What
does the API documentation say about response shapes?

🤔 Reflection Questions: • What pattern led me to use 'any' initially? • Could I
have inferred the type from the context? • What would have helped me choose the
right type from the start?

💡 Approach:

1. Analysis: First, trace through the code to see exactly how each 'any' typed
   variable is used. Look for property accesses, method calls, and operations.
2. Strategy: Create a minimal interface that includes only the
   properties/methods actually used. Start specific and generalize only if
   needed.
3. Implementation: Replace 'any' with your interface, then fix any TypeScript
   errors that appear. These errors often reveal additional type requirements.

Remember: Using 'any' for API responses instead of defining interfaces

```
## Implementation Priority

1. **Context + Examples** (High impact, easy to implement)
2. **Step-by-Step Guidance** (Helps Claude succeed)
3. **Reflection Questions** (Builds awareness)
4. **Decomposition** (For complex fixes)
5. **Sequencing** (For multi-step fixes)

This approach transforms the MCP from a critic into a teacher, dramatically improving its effectiveness at helping Claude write better code!
```
