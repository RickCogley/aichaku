/**
 * Documentation patterns for markdown linting in MCP
 */

import type { SecurityPattern } from "../types.ts";

export class DocumentationPatterns {
  static getPatterns(): SecurityPattern[] {
    return [
      // Diátaxis compliance patterns
      {
        id: "doc-diataxis-tutorial-structure",
        name: "Tutorial Structure",
        category: "documentation",
        severity: "medium",
        pattern: /^#\s+(?!Getting Started|Tutorial)/m,
        description: "Tutorials should start with 'Getting Started' or 'Tutorial'",
        fix: "Start tutorials with '# Getting Started with [Product]' or '# Tutorial: [Topic]'",
        frameworks: ["diataxis"],
      },
      {
        id: "doc-diataxis-tutorial-prerequisites",
        name: "Missing Prerequisites Section",
        category: "documentation",
        severity: "medium",
        pattern: /^#\s+Getting Started(?![\s\S]*## Prerequisites)/m,
        description: "Tutorials should include a Prerequisites section",
        fix: "Add a '## Prerequisites' section listing what readers need before starting",
        frameworks: ["diataxis"],
      },
      {
        id: "doc-diataxis-how-to-structure",
        name: "How-to Guide Structure",
        category: "documentation",
        severity: "medium",
        pattern: /^#\s+How to/m,
        description: "How-to guides should have proper structure",
        fix: "Include 'Before you begin' and 'Solution' or 'Steps' sections",
        checkFn: (content: string) => {
          if (!content.match(/^#\s+How to/m)) return [];
          const findings: Array<{ message?: string; line?: number }> = [];
          if (!content.includes("## Before you begin")) {
            findings.push({
              message: "How-to guides should include 'Before you begin' section",
              line: 1,
            });
          }
          if (
            !content.includes("## Solution") && !content.includes("## Steps")
          ) {
            findings.push({
              message: "How-to guides should include 'Solution' or 'Steps' section",
              line: 1,
            });
          }
          return findings;
        },
        frameworks: ["diataxis"],
      },

      // Google Style Guide patterns
      {
        id: "doc-google-sentence-length",
        name: "Sentence Too Long",
        category: "documentation",
        severity: "info",
        checkFn: (content: string) => {
          const findings: Array<{ message?: string; line?: number }> = [];
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            // Skip code blocks and headers
            if (line.startsWith("```") || line.startsWith("#")) return;

            const sentences = line.match(/[^.!?]+[.!?]+/g) || [];
            sentences.forEach((sentence) => {
              const wordCount = sentence.trim().split(/\s+/).length;
              if (wordCount > 25) {
                findings.push({
                  message: `Sentence has ${wordCount} words (Google style recommends < 25)`,
                  line: index + 1,
                });
              }
            });
          });
          return findings;
        },
        description: "Keep sentences under 25 words for better readability",
        fix: "Break long sentences into shorter, clearer statements",
        frameworks: ["google-style"],
      },
      {
        id: "doc-google-present-tense",
        name: "Use Present Tense",
        category: "documentation",
        severity: "info",
        pattern: /\b(will|would|should|could|might)\s+\w+/g,
        description: "Use present tense instead of future tense",
        fix: "Change 'will create' to 'creates', 'will be' to 'is'",
        frameworks: ["google-style"],
      },
      {
        id: "doc-google-second-person",
        name: "Use Second Person",
        category: "documentation",
        severity: "info",
        pattern: /\b(the user|users|one should|developers should)\b/gi,
        description: "Use 'you' instead of 'the user' or 'users'",
        fix: "Replace 'the user' with 'you', 'users should' with 'you should'",
        frameworks: ["google-style"],
      },
      {
        id: "doc-google-active-voice",
        name: "Use Active Voice",
        category: "documentation",
        severity: "info",
        pattern: /\b(is\s+\w+ed|are\s+\w+ed|was\s+\w+ed|were\s+\w+ed|been\s+\w+ed)\b/g,
        description: "Prefer active voice over passive voice",
        fix: "Change 'is configured by' to 'configure', 'are processed' to 'processes'",
        frameworks: ["google-style"],
      },

      // General documentation quality patterns
      {
        id: "doc-broken-link",
        name: "Potentially Broken Link",
        category: "documentation",
        severity: "high",
        pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
        checkFn: (content: string) => {
          const findings: Array<{ message?: string; line?: number }> = [];
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          const lines = content.split("\n");

          lines.forEach((line, index) => {
            const lineMatches = line.matchAll(linkRegex);
            for (const lineMatch of lineMatches) {
              const url = lineMatch[2];
              // Check for common broken link patterns
              if (
                url.includes("TODO") || url.includes("FIXME") || url === "#" ||
                url === ""
              ) {
                findings.push({
                  message: `Broken or placeholder link: "${url}"`,
                  line: index + 1,
                });
              }
            }
          });

          return findings;
        },
        description: "Links should point to valid targets",
        fix: "Replace placeholder links with actual URLs or remove them",
        frameworks: ["all"],
      },
      {
        id: "doc-missing-code-language",
        name: "Code Block Missing Language",
        category: "documentation",
        severity: "medium",
        pattern: /^```\s*$/m,
        description: "Code blocks should specify a language for syntax highlighting",
        fix: "Add language after ``` (e.g., ```bash, ```typescript, ```yaml)",
        frameworks: ["all"],
      },
      {
        id: "doc-inconsistent-header-levels",
        name: "Inconsistent Header Levels",
        category: "documentation",
        severity: "medium",
        checkFn: (content: string) => {
          const findings: Array<{ message?: string; line?: number }> = [];
          const lines = content.split("\n");
          let lastLevel = 0;

          lines.forEach((line, index) => {
            const headerMatch = line.match(/^(#+)\s+/);
            if (headerMatch) {
              const level = headerMatch[1].length;
              if (lastLevel > 0 && level > lastLevel + 1) {
                findings.push({
                  message: `Header jumps from level ${lastLevel} to ${level} (should increment by 1)`,
                  line: index + 1,
                });
              }
              lastLevel = level;
            }
          });

          return findings;
        },
        description: "Header levels should increment by one",
        fix: "Ensure headers follow a logical hierarchy (# → ## → ### → ####)",
        frameworks: ["all"],
      },

      // Documentation formatting patterns
      {
        id: "doc-format-trailing-whitespace",
        name: "Trailing Whitespace",
        category: "documentation",
        severity: "low",
        pattern: /[ \t]+$/gm,
        description: "Lines should not have trailing whitespace",
        fix: "Remove spaces and tabs at the end of lines",
        frameworks: ["all"],
      },
      {
        id: "doc-format-multiple-blank-lines",
        name: "Multiple Blank Lines",
        category: "documentation",
        severity: "low",
        pattern: /\n\n\n+/g,
        description: "Use single blank lines between sections",
        fix: "Replace multiple blank lines with a single blank line",
        frameworks: ["all"],
      },
    ];
  }
}
