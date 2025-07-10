/**
 * Linter for Google Developer Documentation Style Guide compliance
 *
 * @module
 */

import { BaseLinter } from "./base-linter.ts";
import type { LintIssue, LintResult } from "./base-linter.ts";

/**
 * Configuration for Google style linter
 */
interface GoogleStyleConfig {
  maxSentenceWords: number;
  maxLineLength: number;
  forbiddenWords: string[];
  preferredTerms: Record<string, string>;
}

/**
 * Default configuration based on Google style guide
 */
const DEFAULT_CONFIG: GoogleStyleConfig = {
  maxSentenceWords: 20,
  maxLineLength: 100,
  forbiddenWords: [
    "please",
    "just",
    "simply",
    "easy",
    "easily",
    "simple",
    "obviously",
    "clearly",
    "basically",
  ],
  preferredTerms: {
    "click on": "click",
    "e.g.": "for example",
    "i.e.": "that is",
    "via": "through",
    "utilize": "use",
    "commence": "start",
    "terminate": "end",
    "prior to": "before",
    "subsequent to": "after",
    "in order to": "to",
    "at this point in time": "now",
    "due to the fact that": "because",
  },
};

/**
 * Linter for Google Developer Documentation Style Guide
 */
export class GoogleStyleLinter extends BaseLinter {
  readonly name = "Google Style";
  private config: GoogleStyleConfig;

  constructor(config?: Partial<GoogleStyleConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  lint(filePath: string, content: string): LintResult {
    const issues: LintIssue[] = [];
    const lines = this.splitLines(content);

    let inCodeBlock = false;
    let inFrontMatter = false;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Track code blocks
      if (this.isCodeBlockMarker(line)) {
        inCodeBlock = !inCodeBlock;
        return;
      }

      // Track front matter (YAML)
      if (index === 0 && line === "---") {
        inFrontMatter = true;
        return;
      }
      if (inFrontMatter && line === "---") {
        inFrontMatter = false;
        return;
      }

      // Skip checks for code blocks and front matter
      if (inCodeBlock || inFrontMatter) {
        return;
      }

      // Skip empty lines
      if (line.trim().length === 0) {
        return;
      }

      // Perform various checks
      this.checkSentenceLength(line, lineNumber, issues);
      this.checkTense(line, lineNumber, issues);
      this.checkVoice(line, lineNumber, issues);
      this.checkTone(line, lineNumber, issues);
      this.checkForbiddenWords(line, lineNumber, issues);
      this.checkPreferredTerms(line, lineNumber, issues);
      this.checkContractions(line, lineNumber, issues);
      this.checkCapitalization(line, lineNumber, issues);
      this.checkPunctuation(line, lineNumber, issues);
      this.checkLineLength(line, lineNumber, issues);
    });

    // Check document-level issues
    this.checkDocumentStructure(lines, issues);

    return {
      filePath,
      issues,
      passed: !issues.some((issue) => issue.severity === "error"),
    };
  }

  /**
   * Check sentence length
   */
  private checkSentenceLength(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    // Skip headings and list items
    if (this.isHeading(line) || this.isListItem(line)) {
      return;
    }

    const sentences = this.extractSentences(line);

    sentences.forEach((sentence) => {
      const wordCount = this.countWords(sentence);

      if (wordCount > this.config.maxSentenceWords) {
        issues.push(this.createIssue({
          severity: "warning",
          line: lineNumber,
          rule: "sentence-too-long",
          message:
            `Sentence too long (${wordCount} words, max ${this.config.maxSentenceWords})`,
          suggestion: "Break this sentence into shorter, clearer sentences",
        }));
      }
    });
  }

  /**
   * Check for present tense usage
   */
  private checkTense(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    // Skip headings
    if (this.isHeading(line)) {
      return;
    }

    const sentences = this.extractSentences(line);

    sentences.forEach((sentence) => {
      if (this.usesPastOrFutureTense(sentence)) {
        // Check for common future tense patterns
        const futureMatch = sentence.match(/\bwill\s+(\w+)/i);
        if (futureMatch) {
          issues.push(this.createIssue({
            severity: "warning",
            line: lineNumber,
            rule: "use-present-tense",
            message: `Use present tense: "will ${futureMatch[1]}" → "${
              futureMatch[1]
            }s"`,
            suggestion:
              "Documentation should use present tense to describe current behavior",
          }));
        } else {
          issues.push(this.createIssue({
            severity: "info",
            line: lineNumber,
            rule: "use-present-tense",
            message: "Consider using present tense",
            suggestion:
              "Documentation should describe what the software does, not what it will do",
          }));
        }
      }
    });
  }

  /**
   * Check for active voice
   */
  private checkVoice(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    // Skip headings
    if (this.isHeading(line)) {
      return;
    }

    const sentences = this.extractSentences(line);

    sentences.forEach((sentence) => {
      if (this.usesPassiveVoice(sentence)) {
        issues.push(this.createIssue({
          severity: "warning",
          line: lineNumber,
          rule: "use-active-voice",
          message: "Use active voice instead of passive voice",
          suggestion:
            "Rewrite the sentence with the subject performing the action",
        }));
      }
    });
  }

  /**
   * Check for conversational tone
   */
  private checkTone(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    // Check for overly formal language
    const formalPatterns = [
      /\b(shall|furthermore|however|nevertheless|therefore|hence|thus)\b/i,
      /\b(aforementioned|herein|thereof|whereas|whereby)\b/i,
    ];

    formalPatterns.forEach((pattern) => {
      const match = line.match(pattern);
      if (match) {
        issues.push(this.createIssue({
          severity: "info",
          line: lineNumber,
          rule: "conversational-tone",
          message: `"${match[0]}" is too formal`,
          suggestion: "Use simpler, more conversational language",
        }));
      }
    });
  }

  /**
   * Check for forbidden words
   */
  private checkForbiddenWords(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    const lowerLine = line.toLowerCase();

    this.config.forbiddenWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(lowerLine)) {
        issues.push(this.createIssue({
          severity: "warning",
          line: lineNumber,
          rule: "forbidden-word",
          message: `Avoid using "${word}"`,
          suggestion: word === "please"
            ? "Remove unnecessary politeness"
            : word === "easy" || word === "simple"
            ? "Don't make assumptions about difficulty"
            : "Use more precise language",
        }));
      }
    });
  }

  /**
   * Check for preferred terms
   */
  private checkPreferredTerms(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    const lowerLine = line.toLowerCase();

    Object.entries(this.config.preferredTerms).forEach(([avoid, prefer]) => {
      if (lowerLine.includes(avoid)) {
        issues.push(this.createIssue({
          severity: "info",
          line: lineNumber,
          rule: "preferred-term",
          message: `Use "${prefer}" instead of "${avoid}"`,
          suggestion: "Use simpler, clearer terminology",
        }));
      }
    });
  }

  /**
   * Check contractions usage
   */
  private checkContractions(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    // Google style guide recommends using contractions for a conversational tone
    const expandedForms = [
      /\bdo not\b/i,
      /\bcannot\b/i,
      /\bwill not\b/i,
      /\bshould not\b/i,
      /\bwould not\b/i,
      /\bis not\b/i,
      /\bare not\b/i,
    ];

    const contractionMap: Record<string, string> = {
      "do not": "don't",
      "cannot": "can't",
      "will not": "won't",
      "should not": "shouldn't",
      "would not": "wouldn't",
      "is not": "isn't",
      "are not": "aren't",
    };

    expandedForms.forEach((pattern) => {
      const match = line.match(pattern);
      if (match) {
        const expanded = match[0].toLowerCase();
        const contraction = contractionMap[expanded];
        if (contraction) {
          issues.push(this.createIssue({
            severity: "info",
            line: lineNumber,
            rule: "use-contractions",
            message:
              `Consider using contraction: "${expanded}" → "${contraction}"`,
            suggestion: "Contractions make documentation more conversational",
          }));
        }
      }
    });
  }

  /**
   * Check capitalization
   */
  private checkCapitalization(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    // Check for title case in headings (Google prefers sentence case)
    if (this.isHeading(line)) {
      const headingText = line.replace(/^#+\s*/, "");
      const words = headingText.split(/\s+/);
      let titleCaseCount = 0;

      words.forEach((word) => {
        // Skip short words and special cases
        if (word.length > 3 && /^[A-Z]/.test(word) && !/^[A-Z]+$/.test(word)) {
          titleCaseCount++;
        }
      });

      if (titleCaseCount > 2) {
        issues.push(this.createIssue({
          severity: "warning",
          line: lineNumber,
          rule: "heading-case",
          message: "Use sentence case for headings, not title case",
          suggestion: "Capitalize only the first word and proper nouns",
        }));
      }
    }

    // Check for unnecessary capitalization
    const unnecessaryCaps = /\b(The|A|An)\s+[A-Z]\w+\b/g;
    const matches = line.matchAll(unnecessaryCaps);

    for (const match of matches) {
      // Skip if it's likely a proper noun or at the start of a sentence
      if (match.index && match.index > 0 && line[match.index - 1] !== ".") {
        issues.push(this.createIssue({
          severity: "info",
          line: lineNumber,
          column: match.index + 1,
          rule: "unnecessary-capitalization",
          message: `Unnecessary capitalization: "${match[0]}"`,
          suggestion:
            "Only capitalize proper nouns and the first word of sentences",
        }));
      }
    }
  }

  /**
   * Check punctuation
   */
  private checkPunctuation(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    // Check for Oxford comma (Google style recommends it)
    const missingOxfordComma = /\b(\w+),\s*(\w+)\s+and\s+(\w+)\b/;
    const match = line.match(missingOxfordComma);

    if (match) {
      issues.push(this.createIssue({
        severity: "info",
        line: lineNumber,
        rule: "oxford-comma",
        message: "Use the Oxford comma before 'and' in a series",
        suggestion: `"${match[1]}, ${match[2]}, and ${match[3]}"`,
      }));
    }

    // Check for double spaces
    if (/  +/.test(line)) {
      issues.push(this.createIssue({
        severity: "warning",
        line: lineNumber,
        rule: "double-spaces",
        message: "Remove extra spaces",
        suggestion: "Use single spaces between words",
      }));
    }
  }

  /**
   * Check line length
   */
  private checkLineLength(
    line: string,
    lineNumber: number,
    issues: LintIssue[],
  ): void {
    if (line.length > this.config.maxLineLength) {
      issues.push(this.createIssue({
        severity: "info",
        line: lineNumber,
        rule: "line-too-long",
        message:
          `Line too long (${line.length} characters, max ${this.config.maxLineLength})`,
        suggestion: "Consider breaking long lines for better readability",
      }));
    }
  }

  /**
   * Check document structure
   */
  private checkDocumentStructure(lines: string[], issues: LintIssue[]): void {
    // Check for meaningful link text
    lines.forEach((line, index) => {
      const genericLinkPattern = /\[(?:click here|here|this|link)\]\(/i;
      if (genericLinkPattern.test(line)) {
        issues.push(this.createIssue({
          severity: "error",
          line: index + 1,
          rule: "meaningful-link-text",
          message: "Use meaningful link text",
          suggestion:
            "Link text should describe the destination, not use generic phrases",
        }));
      }
    });

    // Check for proper list punctuation
    let _inList = false;
    lines.forEach((line, index) => {
      if (this.isListItem(line)) {
        _inList = true;

        // Check if list items are properly punctuated
        const listContent = line.replace(/^(\s*[-*+]|\s*\d+\.)\s+/, "").trim();
        if (listContent.length > 0) {
          // Full sentences should end with periods
          if (/^[A-Z]/.test(listContent) && listContent.split(" ").length > 3) {
            if (!/[.!?]$/.test(listContent)) {
              issues.push(this.createIssue({
                severity: "info",
                line: index + 1,
                rule: "list-punctuation",
                message: "Full sentences in lists should end with periods",
                suggestion: "Add a period at the end of this list item",
              }));
            }
          }
        }
      } else if (line.trim() === "") {
        _inList = false;
      }
    });
  }
}
