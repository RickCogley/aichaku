/**
 * Linter for Microsoft Writing Style Guide compliance
 *
 * @module
 */

import { BaseLinter } from "./base-linter.ts";
import type { LintIssue, LintResult } from "./base-linter.ts";

/**
 * Linter for Microsoft Writing Style Guide
 *
 * This is a placeholder for future implementation.
 * The Microsoft Writing Style Guide includes:
 * - Clear, simple writing
 * - Accessibility-first approach
 * - Inclusive language
 * - Task-oriented documentation
 */
export class MicrosoftStyleLinter extends BaseLinter {
  readonly name = "Microsoft Style";

  lint(filePath: string, _content: string): LintResult {
    const issues: LintIssue[] = [];

    // Placeholder - Microsoft style guide implementation coming soon
    issues.push(this.createIssue({
      severity: "info",
      line: 1,
      rule: "not-implemented",
      message: "Microsoft Style Guide linting is not yet implemented",
      suggestion: "This linter will be added in a future version",
    }));

    return {
      filePath,
      issues,
      passed: true,
    };
  }
}
