# MCP Feedback Loop Design

🪴 Aichaku: Teaching Claude Through Review Feedback

## Concept: Educational Review Results

The MCP doesn't just report problems - it helps Claude learn and adjust within
the session.

## How It Works

```typescript
interface ReviewResult {
  findings: Finding[];
  summary: Summary;
  // NEW: Educational feedback for Claude
  claudeGuidance: {
    reminder: string; // What Claude should remember
    pattern: string; // The pattern to avoid
    correction: string; // How to fix it going forward
    example: string; // Correct example
  };
}
```

## Example Implementation

### MCP Generates Dynamic Feedback

```typescript
class ReviewEngine {
  generateClaudeGuidance(findings: Finding[]): ClaudeGuidance {
    // Analyze patterns in findings
    const patterns = this.detectPatterns(findings);

    // Example: Many TypeScript 'any' violations
    if (patterns.includes("typescript-any-overuse")) {
      return {
        reminder:
          "I notice you used 'any' type 7 times, despite CLAUDE.md saying to avoid it. Please use proper types.",
        pattern: "Replacing proper types with 'any'",
        correction:
          "For each 'any', determine the actual type from usage context",
        example:
          "Instead of 'const data: any', use 'const data: UserData' or 'const data: unknown'",
      };
    }

    // Example: Missing authorization checks
    if (patterns.includes("missing-auth-checks")) {
      return {
        reminder:
          "Multiple endpoints are missing authorization. CLAUDE.md requires auth checks on all user data access.",
        pattern: "Direct parameter usage without authorization",
        correction: "Add authorization middleware or checks before data access",
        example: "if (!user.can('read', resource)) throw new ForbiddenError();",
      };
    }

    return this.buildGuidance(patterns);
  }
}
```

### MCP Response Structure

```json
{
  "toolResult": {
    "findings": [...],
    "summary": {
      "critical": 0,
      "high": 3,
      "medium": 5
    },
    "claudeGuidance": {
      "reminder": "🚨 You introduced 5 'any' types despite CLAUDE.md explicitly stating to avoid them. This violates the project's TypeScript standards.",
      "pattern": "Using 'any' instead of proper types",
      "correction": "Review each 'any' and replace with the actual type. Use 'unknown' if type is truly dynamic.",
      "example": "Change: const result: any = await fetch()\nTo: const result: ApiResponse = await fetch()"
    }
  }
}
```

## Claude's Response Flow

### Before (Without Guidance)

```
Claude: Here's the code you requested
MCP: Found 5 issues with 'any' types
Claude: I see there are some type issues
[Claude might make the same mistake again]
```

### After (With Guidance)

```
Claude: Here's the code you requested
MCP: Found 5 issues + guidance
Claude: I apologize - I used 'any' types despite your CLAUDE.md 
        explicitly forbidding them. Let me fix these and remember
        to use proper types going forward:
        [Shows fixes]
        
        I'll be more careful to follow your TypeScript standards.
[Claude adjusts behavior for rest of session]
```

## Advanced Pattern Learning

### 1. Violation Tracking

```typescript
class PatternTracker {
  private violations = new Map<string, ViolationInfo>();

  track(finding: Finding) {
    const key = finding.rule;
    const info = this.violations.get(key) || { count: 0, examples: [] };
    info.count++;
    info.examples.push(finding);
    this.violations.set(key, info);
  }

  getMostCommonViolation(): string {
    return Array.from(this.violations.entries())
      .sort((a, b) => b[1].count - a[1].count)[0][0];
  }
}
```

### 2. Contextual Guidance

```typescript
generateContextualGuidance(violations: Map<string, ViolationInfo>): string {
  const topViolation = this.getMostCommonViolation(violations);
  const count = violations.get(topViolation).count;
  
  if (count > 5) {
    return `CRITICAL PATTERN: You've made the same ${topViolation} mistake ${count} times. ` +
           `This suggests you may have misunderstood the requirement. ` +
           `Please re-read the ${this.getRelevantSection(topViolation)} section of CLAUDE.md`;
  }
  
  return this.getStandardGuidance(topViolation);
}
```

## Implementation in MCP Tools

### review_file Tool

```typescript
server.setRequestHandler("tools/run", async (request) => {
  if (request.params.name === "review_file") {
    const result = await reviewEngine.reviewFile(path, content);

    // Add Claude guidance based on findings
    if (result.findings.length > 0) {
      result.claudeGuidance = guidanceEngine.generate(
        result.findings,
        projectStandards,
        previousViolations,
      );
    }

    return { toolResult: result };
  }
});
```

## Guidance Templates

### Security Violations

```typescript
const SECURITY_GUIDANCE = {
  "command-injection": {
    reminder:
      "You introduced command injection vulnerabilities. This is a CRITICAL security issue.",
    pattern: "Passing unsanitized user input to shell commands",
    correction: 'Use parameter expansion: bash -c \'cmd "$1"\' -- "$VAR"',
    severity: "critical",
  },
  "sql-injection": {
    reminder:
      "SQL injection detected. Your CLAUDE.md requires parameterized queries.",
    pattern: "String concatenation in SQL queries",
    correction:
      "Use parameterized queries: query('SELECT * FROM users WHERE id = ?', [id])",
  },
};
```

### Methodology Violations

```typescript
const METHODOLOGY_GUIDANCE = {
  "shape-up-appetite": {
    reminder: "Shape Up requires defining appetite upfront. You missed this.",
    pattern: "Creating pitch without time bounds",
    correction: "Add 'Appetite: 6 weeks' or 'Appetite: 2 weeks' section",
  },
  "scrum-no-estimate": {
    reminder: "Scrum stories need estimates. Your team uses story points.",
    pattern: "User stories without point estimates",
    correction: "Add story points to each story (1, 2, 3, 5, 8, 13)",
  },
};
```

## Benefits

1. **In-Session Learning**: Claude adjusts behavior immediately
2. **Reduced Repetition**: Same mistakes less likely
3. **Educational**: Claude explains what it learned
4. **Project Alignment**: Reinforces CLAUDE.md requirements
5. **Pattern Recognition**: Identifies systematic issues

## Example Full Response

```json
{
  "toolResult": {
    "reviewComplete": true,
    "file": "auth.ts",
    "findings": [
      {
        "severity": "high",
        "rule": "typescript-any",
        "line": 42,
        "message": "Avoid 'any' type"
      }
      // ... more findings
    ],
    "summary": {
      "critical": 0,
      "high": 5,
      "medium": 2
    },
    "claudeGuidance": {
      "reminder": "📝 Your CLAUDE.md specifically states 'NEVER use any type in TypeScript'. You used it 5 times in this file.",
      "pattern": "Using 'any' to bypass type checking",
      "correction": "Determine actual types from usage and apply them. Use generics for truly dynamic cases.",
      "example": "Replace: const data: any\nWith: const data: UserResponse | ErrorResponse",
      "reinforcement": "I should be more careful to follow your TypeScript standards and avoid 'any' types as specified in CLAUDE.md."
    }
  }
}
```

## Future Enhancements

1. **Persistent Learning**: Save patterns between sessions
2. **Team Patterns**: Share common violations across team
3. **Adaptive Guidance**: Adjust tone based on repetition
4. **Positive Reinforcement**: Praise when standards followed
5. **Learning Metrics**: Track improvement over time

This creates a true feedback loop where the MCP doesn't just find problems but
actively helps Claude learn and improve within the session!
