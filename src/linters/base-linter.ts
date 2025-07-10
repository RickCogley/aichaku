/**
 * Base linter class for all documentation linters
 *
 * @module
 */

/**
 * Represents a linting issue found in documentation
 */
export interface LintIssue {
  /** Type of issue (error, warning, info) */
  severity: "error" | "warning" | "info";
  /** Line number where the issue was found (1-indexed) */
  line: number;
  /** Column number where the issue starts (1-indexed) */
  column?: number;
  /** Rule that was violated */
  rule: string;
  /** Human-readable message describing the issue */
  message: string;
  /** Suggested fix for the issue */
  suggestion?: string;
}

/**
 * Result of linting a documentation file
 */
export interface LintResult {
  /** Path to the file that was linted */
  filePath: string;
  /** Issues found during linting */
  issues: LintIssue[];
  /** Whether the file passed linting (no errors) */
  passed: boolean;
}

/**
 * Base class for all documentation linters
 */
export abstract class BaseLinter {
  /**
   * Name of the linter
   */
  abstract readonly name: string;

  /**
   * Lint a documentation file
   * @param filePath Path to the file to lint
   * @param content Content of the file
   * @returns Linting result
   */
  abstract lint(
    filePath: string,
    content: string,
  ): Promise<LintResult> | LintResult;

  /**
   * Split content into lines for processing
   * @param content File content
   * @returns Array of lines
   */
  protected splitLines(content: string): string[] {
    return content.split("\n");
  }

  /**
   * Count words in a string
   * @param text Text to count words in
   * @returns Number of words
   */
  protected countWords(text: string): number {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Check if a sentence uses present tense
   * @param sentence Sentence to check
   * @returns True if sentence appears to use past or future tense
   */
  protected usesPastOrFutureTense(sentence: string): boolean {
    // Common past tense indicators
    const pastTensePatterns = [
      /\b(was|were|had|did|would|could|should|might)\b/i,
      /\b\w+ed\b/i, // Simple past tense verbs
    ];

    // Common future tense indicators
    const futureTensePatterns = [
      /\bwill\s+\w+/i,
      /\bgoing\s+to\s+\w+/i,
      /\bshall\s+\w+/i,
    ];

    const allPatterns = [...pastTensePatterns, ...futureTensePatterns];
    return allPatterns.some((pattern) => pattern.test(sentence));
  }

  /**
   * Check if a sentence uses passive voice
   * @param sentence Sentence to check
   * @returns True if sentence appears to use passive voice
   */
  protected usesPassiveVoice(sentence: string): boolean {
    // Common passive voice patterns
    const passivePatterns = [
      /\b(is|are|was|were|been|being)\s+\w+ed\b/i,
      /\b(is|are|was|were|been|being)\s+\w+en\b/i,
      /\bby\s+\w+\s+\w+ed\b/i,
    ];

    return passivePatterns.some((pattern) => pattern.test(sentence));
  }

  /**
   * Extract sentences from a line of text
   * @param line Line of text
   * @returns Array of sentences
   */
  protected extractSentences(line: string): string[] {
    // Simple sentence splitting - can be improved
    return line.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  }

  /**
   * Check if a line is a heading (Markdown)
   * @param line Line to check
   * @returns True if line is a heading
   */
  protected isHeading(line: string): boolean {
    return /^#{1,6}\s+/.test(line);
  }

  /**
   * Check if a line is a code block marker
   * @param line Line to check
   * @returns True if line is a code block marker
   */
  protected isCodeBlockMarker(line: string): boolean {
    return /^```/.test(line);
  }

  /**
   * Check if a line is part of a list
   * @param line Line to check
   * @returns True if line is a list item
   */
  protected isListItem(line: string): boolean {
    return /^(\s*[-*+]|\s*\d+\.)\s+/.test(line);
  }

  /**
   * Create a lint issue
   * @param params Issue parameters
   * @returns Lint issue
   */
  protected createIssue(params: {
    severity: LintIssue["severity"];
    line: number;
    column?: number;
    rule: string;
    message: string;
    suggestion?: string;
  }): LintIssue {
    return {
      severity: params.severity,
      line: params.line,
      column: params.column,
      rule: params.rule,
      message: params.message,
      suggestion: params.suggestion,
    };
  }
}
