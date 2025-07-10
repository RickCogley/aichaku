/**
 * Linter for Diátaxis documentation framework compliance
 *
 * @module
 */

import { BaseLinter } from "./base-linter.ts";
import type { LintIssue, LintResult } from "./base-linter.ts";

/**
 * Document types in the Diátaxis framework
 */
type DiátaxisType = "tutorial" | "how-to" | "reference" | "explanation";

/**
 * Keywords and patterns that indicate each document type
 */
const DOCUMENT_TYPE_INDICATORS: Record<DiátaxisType, {
  keywords: string[];
  forbiddenKeywords: string[];
  requiredSections?: string[];
}> = {
  tutorial: {
    keywords: [
      "learn",
      "tutorial",
      "getting started",
      "first",
      "beginner",
      "introduction",
    ],
    forbiddenKeywords: [
      "reference",
      "api",
      "specification",
      "when to use",
      "why",
    ],
    requiredSections: ["Prerequisites", "Steps", "Summary"],
  },
  "how-to": {
    keywords: ["how to", "guide", "steps", "procedure", "task", "accomplish"],
    forbiddenKeywords: ["why", "theory", "background", "concept"],
    requiredSections: ["Prerequisites", "Steps", "Result"],
  },
  reference: {
    keywords: [
      "reference",
      "api",
      "specification",
      "parameters",
      "options",
      "syntax",
    ],
    forbiddenKeywords: [
      "tutorial",
      "learn",
      "getting started",
      "why",
      "concept",
    ],
    requiredSections: ["Description", "Parameters", "Returns", "Examples"],
  },
  explanation: {
    keywords: [
      "why",
      "concept",
      "theory",
      "background",
      "understanding",
      "architecture",
    ],
    forbiddenKeywords: ["steps", "how to", "procedure", "api reference"],
    requiredSections: ["Overview", "Context", "Discussion"],
  },
};

/**
 * Linter for Diátaxis documentation framework
 */
export class DiátaxisLinter extends BaseLinter {
  readonly name = "Diátaxis";

  lint(filePath: string, content: string): LintResult {
    const issues: LintIssue[] = [];
    const lines = this.splitLines(content);

    // Detect the intended document type
    const detectedType = this.detectDocumentType(content);

    if (!detectedType) {
      issues.push(this.createIssue({
        severity: "warning",
        line: 1,
        rule: "document-type-unclear",
        message:
          "Cannot determine document type (tutorial, how-to, reference, or explanation)",
        suggestion:
          "Add clear indicators of the document type in the title or introduction",
      }));
    } else {
      // Check for mixed document types
      this.checkForMixedTypes(lines, detectedType, issues);

      // Check for required sections
      this.checkRequiredSections(lines, detectedType, issues);

      // Check document focus
      this.checkDocumentFocus(lines, detectedType, issues);
    }

    // Check structural issues
    this.checkStructure(lines, issues);

    return {
      filePath,
      issues,
      passed: !issues.some((issue) => issue.severity === "error"),
    };
  }

  /**
   * Detect the document type based on content
   */
  private detectDocumentType(content: string): DiátaxisType | null {
    const lowerContent = content.toLowerCase();
    const scores: Record<DiátaxisType, number> = {
      tutorial: 0,
      "how-to": 0,
      reference: 0,
      explanation: 0,
    };

    // Score based on keywords
    for (const [type, indicators] of Object.entries(DOCUMENT_TYPE_INDICATORS)) {
      for (const keyword of indicators.keywords) {
        if (lowerContent.includes(keyword)) {
          scores[type as DiátaxisType] += 1;
        }
      }
    }

    // Find the type with the highest score
    let maxScore = 0;
    let detectedType: DiátaxisType | null = null;

    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedType = type as DiátaxisType;
      }
    }

    return maxScore > 0 ? detectedType : null;
  }

  /**
   * Check for mixed document types
   */
  private checkForMixedTypes(
    lines: string[],
    primaryType: DiátaxisType,
    issues: LintIssue[],
  ): void {
    const forbidden = DOCUMENT_TYPE_INDICATORS[primaryType].forbiddenKeywords;

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();

      for (const keyword of forbidden) {
        if (lowerLine.includes(keyword)) {
          // Check if it's in a code block
          if (this.isInCodeBlock(lines, index)) {
            continue;
          }

          issues.push(this.createIssue({
            severity: "warning",
            line: index + 1,
            rule: "mixed-document-type",
            message: `${this.capitalize(primaryType)} contains ${
              this.getTypeFromKeyword(keyword)
            } material: "${keyword}"`,
            suggestion: `Consider moving ${
              this.getTypeFromKeyword(keyword)
            } content to a separate document`,
          }));
        }
      }
    });
  }

  /**
   * Check for required sections
   */
  private checkRequiredSections(
    lines: string[],
    documentType: DiátaxisType,
    issues: LintIssue[],
  ): void {
    const requiredSections =
      DOCUMENT_TYPE_INDICATORS[documentType].requiredSections || [];
    const foundSections = new Set<string>();

    // Look for section headers
    lines.forEach((line) => {
      if (this.isHeading(line)) {
        const headerText = line.replace(/^#+\s*/, "").trim();
        requiredSections.forEach((section) => {
          if (headerText.toLowerCase().includes(section.toLowerCase())) {
            foundSections.add(section);
          }
        });
      }
    });

    // Report missing sections
    requiredSections.forEach((section) => {
      if (!foundSections.has(section)) {
        issues.push(this.createIssue({
          severity: "warning",
          line: 1,
          rule: "missing-required-section",
          message: `${
            this.capitalize(documentType)
          } is missing required section: "${section}"`,
          suggestion:
            `Add a "${section}" section to follow Diátaxis guidelines`,
        }));
      }
    });
  }

  /**
   * Check document focus
   */
  private checkDocumentFocus(
    lines: string[],
    documentType: DiátaxisType,
    issues: LintIssue[],
  ): void {
    // Check specific patterns based on document type
    switch (documentType) {
      case "tutorial":
        this.checkTutorialFocus(lines, issues);
        break;
      case "how-to":
        this.checkHowToFocus(lines, issues);
        break;
      case "reference":
        this.checkReferenceFocus(lines, issues);
        break;
      case "explanation":
        this.checkExplanationFocus(lines, issues);
        break;
    }
  }

  /**
   * Check tutorial-specific focus
   */
  private checkTutorialFocus(lines: string[], issues: LintIssue[]): void {
    lines.forEach((line, index) => {
      // Tutorials should be learning-oriented, not task-oriented
      if (/\b(when you need to|in order to|to accomplish)\b/i.test(line)) {
        issues.push(this.createIssue({
          severity: "info",
          line: index + 1,
          rule: "tutorial-task-oriented",
          message: "Tutorials should focus on learning, not completing tasks",
          suggestion:
            "Rephrase to emphasize learning rather than task completion",
        }));
      }
    });
  }

  /**
   * Check how-to guide focus
   */
  private checkHowToFocus(lines: string[], issues: LintIssue[]): void {
    lines.forEach((line, index) => {
      // How-to guides should be task-oriented, not learning-oriented
      if (/\b(learn|understand|explore|discover)\b/i.test(line)) {
        issues.push(this.createIssue({
          severity: "info",
          line: index + 1,
          rule: "how-to-learning-oriented",
          message:
            "How-to guides should focus on completing tasks, not learning",
          suggestion: "Rephrase to emphasize the task rather than learning",
        }));
      }
    });
  }

  /**
   * Check reference documentation focus
   */
  private checkReferenceFocus(lines: string[], issues: LintIssue[]): void {
    let hasExamples = false;

    lines.forEach((line, index) => {
      // Reference should be descriptive, not instructional
      if (/\b(follow these steps|first,|then,|finally,)\b/i.test(line)) {
        issues.push(this.createIssue({
          severity: "warning",
          line: index + 1,
          rule: "reference-instructional",
          message: "Reference documentation should describe, not instruct",
          suggestion: "Move step-by-step instructions to a how-to guide",
        }));
      }

      if (/\b(example|usage|sample)\b/i.test(line)) {
        hasExamples = true;
      }
    });

    if (!hasExamples) {
      issues.push(this.createIssue({
        severity: "info",
        line: 1,
        rule: "reference-no-examples",
        message: "Reference documentation should include examples",
        suggestion: "Add examples showing how to use the described features",
      }));
    }
  }

  /**
   * Check explanation focus
   */
  private checkExplanationFocus(lines: string[], issues: LintIssue[]): void {
    lines.forEach((line, index) => {
      // Explanations should discuss concepts, not provide instructions
      if (/\b(step \d+|click|type|enter|run)\b/i.test(line)) {
        issues.push(this.createIssue({
          severity: "warning",
          line: index + 1,
          rule: "explanation-instructional",
          message:
            "Explanations should discuss concepts, not provide instructions",
          suggestion:
            "Move instructional content to a tutorial or how-to guide",
        }));
      }
    });
  }

  /**
   * Check general structural issues
   */
  private checkStructure(lines: string[], issues: LintIssue[]): void {
    let hasTitle = false;
    let hasIntroduction = false;
    let inCodeBlock = false;

    lines.forEach((line, index) => {
      // Track code blocks
      if (this.isCodeBlockMarker(line)) {
        inCodeBlock = !inCodeBlock;
      }

      // Check for title (H1)
      if (index === 0 || index === 1) {
        if (/^#\s+/.test(line)) {
          hasTitle = true;
        }
      }

      // Check for introduction paragraph
      if (index < 5 && !this.isHeading(line) && line.trim().length > 50) {
        hasIntroduction = true;
      }

      // Check heading hierarchy
      if (this.isHeading(line) && !inCodeBlock) {
        const level = (line.match(/^#+/) || [""])[0].length;
        if (index > 0) {
          const prevHeadingIndex = this.findPreviousHeading(lines, index - 1);
          if (prevHeadingIndex !== -1) {
            const prevLevel =
              (lines[prevHeadingIndex].match(/^#+/) || [""])[0].length;
            if (level > prevLevel + 1) {
              issues.push(this.createIssue({
                severity: "warning",
                line: index + 1,
                rule: "heading-hierarchy",
                message: `Heading jumps from level ${prevLevel} to ${level}`,
                suggestion: "Use sequential heading levels without skipping",
              }));
            }
          }
        }
      }
    });

    if (!hasTitle) {
      issues.push(this.createIssue({
        severity: "error",
        line: 1,
        rule: "missing-title",
        message: "Document is missing a title (H1 heading)",
        suggestion: "Add a descriptive title at the beginning of the document",
      }));
    }

    if (!hasIntroduction) {
      issues.push(this.createIssue({
        severity: "warning",
        line: 1,
        rule: "missing-introduction",
        message: "Document lacks a clear introduction",
        suggestion:
          "Add an introductory paragraph explaining the document's purpose",
      }));
    }
  }

  /**
   * Helper methods
   */

  private isInCodeBlock(lines: string[], lineIndex: number): boolean {
    let inCodeBlock = false;
    for (let i = 0; i < lineIndex; i++) {
      if (this.isCodeBlockMarker(lines[i])) {
        inCodeBlock = !inCodeBlock;
      }
    }
    return inCodeBlock;
  }

  private findPreviousHeading(lines: string[], startIndex: number): number {
    for (let i = startIndex; i >= 0; i--) {
      if (this.isHeading(lines[i])) {
        return i;
      }
    }
    return -1;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getTypeFromKeyword(keyword: string): string {
    for (const [type, indicators] of Object.entries(DOCUMENT_TYPE_INDICATORS)) {
      if (
        indicators.keywords.includes(keyword) ||
        indicators.forbiddenKeywords.includes(keyword)
      ) {
        return type;
      }
    }
    return "other";
  }
}
