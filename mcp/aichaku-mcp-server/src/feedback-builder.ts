/**
 * Feedback Builder - Creates educational feedback for Claude
 */

import type { ClaudeGuidance, Finding, ReviewResult } from "./types.ts";

export class FeedbackBuilder {
  buildGuidance(result: ReviewResult): ClaudeGuidance {
    // Find the most critical issue to focus on
    const criticalFinding = this.findMostCriticalFinding(result.findings);

    if (!criticalFinding) {
      return this.buildGeneralGuidance(result);
    }

    // Build specific guidance based on the finding
    return this.buildSpecificGuidance(criticalFinding, result);
  }

  private findMostCriticalFinding(findings: Finding[]): Finding | null {
    // Prioritize by severity
    const severityOrder = ["critical", "high", "medium", "low", "info"];

    for (const severity of severityOrder) {
      const finding = findings.find((f) => f.severity === severity);
      if (finding) return finding;
    }

    return null;
  }

  private buildGeneralGuidance(_result: ReviewResult): ClaudeGuidance {
    return {
      reminder: "Your code passed the basic security and standards checks!",
      pattern: "No significant issues detected",
      correction: "Continue following the established patterns",
      reinforcement: "Keep up the good work with secure coding practices",
    };
  }

  private buildSpecificGuidance(
    finding: Finding,
    result: ReviewResult,
  ): ClaudeGuidance {
    const _guidance: ClaudeGuidance = {
      reminder: "",
      pattern: "",
      correction: "",
    };

    // Build guidance based on the type of issue
    switch (finding.rule) {
      case "command-injection":
        return this.buildCommandInjectionGuidance(finding, result);

      case "typescript-any":
        return this.buildTypeScriptAnyGuidance(finding, result);

      case "path-traversal":
        return this.buildPathTraversalGuidance(finding, result);

      case "owasp-a01-access-control":
        return this.buildAccessControlGuidance(finding, result);

      case "15factor-config":
        return this.build15FactorConfigGuidance(finding, result);

      default:
        return this.buildGenericGuidance(finding, result);
    }
  }

  private buildCommandInjectionGuidance(
    finding: Finding,
    result: ReviewResult,
  ): ClaudeGuidance {
    const count = result.findings.filter((f) => f.rule === finding.rule).length;

    return {
      reminder:
        `Your CLAUDE.md security standards require preventing command injection, but you have ${count} instance${
          count > 1 ? "s" : ""
        }.`,
      pattern: "Using shell variables directly in commands without proper escaping",
      correction: "Use parameter expansion to safely pass variables",

      context:
        "Command injection is one of the most critical security vulnerabilities. Attackers can execute arbitrary commands by manipulating input.",

      badExample: `// ❌ Vulnerable to command injection
bash -c "echo $USER_INPUT"
exec(\`ls \${userPath}\`)`,

      goodExample: `// ✅ Safe parameter expansion
bash -c 'echo "$1"' -- "$USER_INPUT"
exec('ls', [userPath])`,

      stepByStep: [
        "Identify all shell command executions",
        "Replace string interpolation with parameter expansion",
        "Use array arguments instead of string concatenation",
        "Validate and sanitize all user inputs",
        "Consider using built-in functions instead of shell commands",
      ],

      reflection: "What made you use string interpolation instead of safer parameter passing?",

      reinforcement:
        "Always use parameter expansion or array arguments for shell commands. This is a critical security requirement.",
    };
  }

  private buildTypeScriptAnyGuidance(
    finding: Finding,
    result: ReviewResult,
  ): ClaudeGuidance {
    const count = result.findings.filter((f) => f.rule === finding.rule).length;

    return {
      reminder:
        `Your CLAUDE.md explicitly states to avoid 'any' types, but you used it ${count} time${
          count > 1 ? "s" : ""
        }.`,
      pattern: "Using 'any' type instead of proper TypeScript types",
      correction: "Define proper interfaces or use 'unknown' with type guards",

      context:
        "TypeScript's type system prevents runtime errors and makes code self-documenting. Using 'any' disables these benefits.",

      badExample: `// ❌ Using any
const data: any = response;
function process(input: any): any { }`,

      goodExample: `// ✅ Proper types
interface ResponseData {
  id: string;
  name: string;
}
const data: ResponseData = response;

// Or with unknown
const data: unknown = response;
if (isResponseData(data)) {
  // Now data is typed
}`,

      stepByStep: [
        "Look at how the variable is used in the code",
        "Identify the properties and methods accessed",
        "Create an interface with those properties",
        "Replace 'any' with your interface",
        "Fix any resulting type errors",
      ],

      reflection:
        "What prevented you from defining a proper type? Was it time pressure or uncertainty about the structure?",

      reinforcement:
        "TypeScript is most valuable when we use its type system. Take the time to define proper types.",
    };
  }

  private buildPathTraversalGuidance(
    _finding: Finding,
    _result: ReviewResult,
  ): ClaudeGuidance {
    return {
      reminder:
        "Path traversal vulnerabilities can expose sensitive files outside the intended directory.",
      pattern: "Using '..' in file paths without validation",
      correction: "Validate and normalize all file paths before use",

      context:
        "Attackers use '../' sequences to access files outside the intended directory, potentially reading sensitive configuration or system files.",

      badExample: `// ❌ Vulnerable to path traversal
const filePath = join(baseDir, userInput);
const content = await Deno.readTextFile(filePath);`,

      goodExample: `// ✅ Safe path handling
const normalized = normalize(join(baseDir, userInput));
const resolved = resolve(normalized);

// Ensure path is within allowed directory
if (!resolved.startsWith(resolve(baseDir))) {
  throw new Error("Invalid path: attempted directory traversal");
}

const content = await Deno.readTextFile(resolved);`,

      stepByStep: [
        "Normalize the path to resolve '..' sequences",
        "Get the absolute path using resolve()",
        "Check that the path starts with the allowed base directory",
        "Reject any path that tries to escape the base directory",
        "Only then proceed with file operations",
      ],

      reflection:
        "Did you consider what would happen if a user provided a malicious path with directory traversal sequences?",

      reinforcement:
        "Always validate paths to ensure they stay within intended boundaries. This is an OWASP A01 vulnerability.",
    };
  }

  private buildAccessControlGuidance(
    _finding: Finding,
    _result: ReviewResult,
  ): ClaudeGuidance {
    return {
      reminder: "OWASP A01 (Broken Access Control) is the #1 web application security risk.",
      pattern: "Accessing resources based on user input without authorization checks",
      correction: "Add proper authorization middleware or checks before resource access",

      context:
        "Without proper access control, users can access resources they shouldn't, leading to data breaches and privilege escalation.",

      badExample: `// ❌ No authorization check
app.get('/api/users/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
});`,

      goodExample: `// ✅ With authorization
app.get('/api/users/:id', 
  requireAuth,  // Authentication middleware
  async (req, res) => {
    // Check if user can access this resource
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const user = await getUser(req.params.id);
    res.json(user);
});`,

      stepByStep: [
        "Identify all endpoints that access user data",
        "Add authentication middleware to verify identity",
        "Implement authorization checks for resource access",
        "Follow the principle of least privilege",
        "Log all access attempts for auditing",
      ],

      reflection: "How would an attacker try to access another user's data through this endpoint?",

      reinforcement:
        "Every resource access must verify both authentication (who you are) and authorization (what you can do).",
    };
  }

  private build15FactorConfigGuidance(
    _finding: Finding,
    _result: ReviewResult,
  ): ClaudeGuidance {
    return {
      reminder: "15-Factor apps store config in the environment, not in code.",
      pattern: "Hardcoding configuration values like URLs and ports",
      correction: "Use environment variables for all configuration",

      context:
        "Hardcoded values make it impossible to run the same code in different environments (dev, staging, production) without modification.",

      badExample: `// ❌ Hardcoded configuration
const API_URL = "http://localhost:3000"; // DevSkim: ignore DS137138
const DB_HOST = "127.0.0.1:5432";`, // DevSkim: ignore DS137138

      goodExample: `// ✅ Environment-based configuration
const API_URL = Deno.env.get("API_URL") || "http://localhost:3000"; // DevSkim: ignore DS137138
const DB_HOST = Deno.env.get("DB_HOST") || "localhost:5432"; // DevSkim: ignore DS137138

// Even better with validation
const API_URL = Deno.env.get("API_URL");
if (!API_URL) {
  throw new Error("API_URL environment variable is required");
}`,

      stepByStep: [
        "Identify all hardcoded configuration values",
        "Create environment variable names (UPPER_SNAKE_CASE)",
        "Replace hardcoded values with Deno.env.get()",
        "Provide sensible defaults for development",
        "Document required environment variables",
      ],

      reflection: "How would you deploy this code to production with different configuration?",

      reinforcement:
        "Configuration belongs in the environment, not in code. This enables the same code to run anywhere.",
    };
  }

  private buildGenericGuidance(
    finding: Finding,
    result: ReviewResult,
  ): ClaudeGuidance {
    const count = result.findings.filter((f) => f.rule === finding.rule).length;

    return {
      reminder: `Found ${count} instance${count > 1 ? "s" : ""} of ${finding.rule} violations.`,
      pattern: finding.message,
      correction: finding.suggestion ||
        "Follow the security and coding standards",

      context:
        `This issue has ${finding.severity} severity and should be addressed to maintain code quality and security.`,

      stepByStep: [
        "Review the flagged code",
        "Understand why this pattern is problematic",
        "Apply the suggested fix",
        "Test that the fix doesn't break functionality",
        "Look for similar patterns elsewhere in the codebase",
      ],

      reflection: "What can you learn from this to avoid similar issues in the future?",

      reinforcement:
        "Following established patterns and standards leads to more maintainable and secure code.",
    };
  }
}
