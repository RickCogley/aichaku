/**
 * Type definitions for the MCP Code Reviewer
 */

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  severity: Severity;
  rule: string;
  message: string;
  file: string;
  line: number;
  column?: number;
  suggestion?: string;
  tool: string;
  category?:
    | "security"
    | "methodology"
    | "standards"
    | "style"
    | "documentation";
}

export interface ReviewResult {
  file: string;
  findings: Finding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  methodologyCompliance?: MethodologyCompliance;
  claudeGuidance?: ClaudeGuidance;
  filePath?: string;
  generatedFiles?: string[];
  analysis?: unknown;
  templateType?: string;
  outputPath?: string;
}

export interface MethodologyCompliance {
  methodology: string;
  status: "passed" | "warnings" | "failed";
  details: string[];
}

export interface ClaudeGuidance {
  reminder: string; // What CLAUDE.md/standards require
  pattern: string; // What Claude did wrong
  correction: string; // How to fix it
  example?: string; // Correct approach
  reinforcement?: string; // What Claude should remember

  // Advanced prompting additions
  context?: string; // Why this matters
  goodExample?: string; // Example of correct code
  badExample?: string; // Example of problematic code
  stepByStep?: string[]; // Steps to fix
  reflection?: string; // Question for self-reflection
}

export interface SecurityPattern {
  id: string;
  name: string;
  pattern?: RegExp;
  severity: Severity;
  rule?: string;
  description: string;
  message?: string;
  fix?: string;
  suggestion?: string;
  category?: string;
  owaspMapping?: string;
  frameworks?: string[];
  checkFn?: (content: string) => Array<{ message?: string; line?: number }>;
}

export interface ProjectConfig {
  version: string;
  selected: string[]; // Selected standards
  methodologies?: string[];
  customStandards?: Record<string, CustomStandard>;
}

export interface CustomStandard {
  name: string;
  description: string;
  rules: Rule[];
}

export interface Rule {
  id: string;
  name: string;
  severity: Severity;
  check: (content: string, filePath: string) => Finding[];
}

export interface Scanner {
  name: string;
  command: string;
  available: boolean;
  timeout?: number;
  parse: (output: string, filePath: string) => Finding[];
}

export interface ReviewRequest {
  file: string;
  content?: string;
  standards?: string[];
  methodologies?: string[];
  includeExternal?: boolean; // Include external scanners
}

export interface ReviewOptions {
  threshold?: Severity;
  format?: "inline" | "summary";
  includeMethodologyChecks?: boolean;
  includeEducationalFeedback?: boolean;
  maxFindings?: number;
}
