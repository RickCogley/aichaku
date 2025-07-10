/**
 * Review Engine - Core review logic
 */

import type {
  Finding,
  ReviewRequest,
  ReviewResult,
  SecurityPattern,
} from "./types.ts";
import { ScannerController } from "./scanner-controller.ts";
import { SecurityPatterns } from "./patterns/security-patterns.ts";
import { TypeScriptPatterns } from "./patterns/typescript-patterns.ts";

export class ReviewEngine {
  private scannerController: ScannerController;
  private patterns: SecurityPattern[] = [];

  constructor() {
    this.scannerController = new ScannerController();
    this.loadPatterns();
  }

  async initialize() {
    await this.scannerController.initialize();
  }

  private loadPatterns() {
    // Load built-in patterns
    this.patterns.push(
      ...SecurityPatterns.getPatterns(),
      ...TypeScriptPatterns.getPatterns(),
    );
  }

  async review(request: ReviewRequest): Promise<ReviewResult> {
    const findings: Finding[] = [];

    // Get file content
    const content = request.content || await this.readFile(request.file);

    // 1. Run pattern-based checks
    findings.push(...this.runPatternChecks(content, request.file));

    // 2. Run standard-specific checks
    if (request.standards && request.standards.length > 0) {
      findings.push(
        ...this.runStandardsChecks(
          content,
          request.file,
          request.standards,
        ),
      );
    }

    // 3. Run methodology checks if requested
    if (request.methodologies && request.methodologies.length > 0) {
      findings.push(
        ...this.runMethodologyChecks(
          content,
          request.file,
          request.methodologies,
        ),
      );
    }

    // 4. Run external scanners if available and requested
    if (request.includeExternal !== false) {
      findings.push(
        ...await this.scannerController.runAvailableScanners(
          request.file,
          content,
        ),
      );
    }

    // Deduplicate findings
    const uniqueFindings = this.deduplicateFindings(findings);

    // Sort by severity and line number
    uniqueFindings.sort((a, b) => {
      const severityOrder = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        info: 4,
      };
      const severityDiff = severityOrder[a.severity] -
        severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return a.line - b.line;
    });

    return {
      file: request.file,
      findings: uniqueFindings,
      summary: this.summarizeFindings(uniqueFindings),
    };
  }

  private async readFile(filePath: string): Promise<string> {
    try {
      return await Deno.readTextFile(filePath);
    } catch (error) {
      throw new Error(
        `Failed to read file ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private runPatternChecks(content: string, filePath: string): Finding[] {
    const findings: Finding[] = [];
    const lines = content.split("\n");

    for (const pattern of this.patterns) {
      // Check if this pattern applies to the file type
      if (!this.shouldCheckPattern(pattern, filePath)) continue;

      lines.forEach((line, index) => {
        if (pattern.pattern.test(line)) {
          findings.push({
            severity: pattern.severity,
            rule: pattern.rule,
            message: pattern.message,
            file: filePath,
            line: index + 1,
            suggestion: pattern.suggestion,
            tool: "aichaku-patterns",
            category: pattern.category as Finding["category"],
          });
        }
      });
    }

    return findings;
  }

  private shouldCheckPattern(
    pattern: SecurityPattern,
    filePath: string,
  ): boolean {
    // TypeScript patterns only for .ts/.tsx files
    if (pattern.category === "typescript") {
      return /\.(ts|tsx)$/.test(filePath);
    }

    // Skip patterns for specific file types
    const extension = filePath.split(".").pop();
    if (!extension) return true;

    // Don't check security patterns in test files
    if (pattern.category === "security" && filePath.includes("test")) {
      return false;
    }

    return true;
  }

  private runStandardsChecks(
    content: string,
    filePath: string,
    standards: string[],
  ): Finding[] {
    const findings: Finding[] = [];

    for (const standard of standards) {
      switch (standard) {
        case "owasp-web":
          findings.push(...this.checkOWASP(content, filePath));
          break;
        case "15-factor":
          findings.push(...this.check15Factor(content, filePath));
          break;
        case "tdd":
          findings.push(...this.checkTDD(content, filePath));
          break;
          // Add more standards as needed
      }
    }

    return findings;
  }

  private checkOWASP(content: string, filePath: string): Finding[] {
    const findings: Finding[] = [];
    const lines = content.split("\n");

    // A01: Broken Access Control
    lines.forEach((line, index) => {
      if (
        line.includes("req.params") && !content.includes("authorize") &&
        !content.includes("auth")
      ) {
        findings.push({
          severity: "high",
          rule: "owasp-a01-access-control",
          message:
            "OWASP A01: Potential broken access control - no authorization check found",
          file: filePath,
          line: index + 1,
          suggestion:
            "Add proper authorization checks before accessing resources",
          tool: "aichaku-owasp",
          category: "security",
        });
      }
    });

    // A03: Injection
    lines.forEach((line, index) => {
      if (
        /\$\{.*\}/.test(line) &&
        (line.includes("query") || line.includes("exec"))
      ) {
        findings.push({
          severity: "critical",
          rule: "owasp-a03-injection",
          message:
            "OWASP A03: Potential injection vulnerability - template literal in query",
          file: filePath,
          line: index + 1,
          suggestion: "Use parameterized queries or prepared statements",
          tool: "aichaku-owasp",
          category: "security",
        });
      }
    });

    return findings;
  }

  private check15Factor(content: string, filePath: string): Finding[] {
    const findings: Finding[] = [];
    const lines = content.split("\n");

    // Factor III: Config
    lines.forEach((line, index) => {
      // Check for hardcoded config values
      if (/localhost:\d+/.test(line) || /127\.0\.0\.1:\d+/.test(line)) {
        findings.push({
          severity: "medium",
          rule: "15factor-config",
          message:
            "15-Factor III: Hardcoded localhost URL - use environment variables",
          file: filePath,
          line: index + 1,
          suggestion: "Use process.env.API_URL or similar environment variable",
          tool: "aichaku-15factor",
          category: "standards",
        });
      }
    });

    return findings;
  }

  private checkTDD(content: string, filePath: string): Finding[] {
    const findings: Finding[] = [];

    // For implementation files, check if there's a corresponding test file
    if (!filePath.includes("test") && !filePath.includes("spec")) {
      const testFile = filePath.replace(/\.(ts|js)$/, ".test.$1");
      const specFile = filePath.replace(/\.(ts|js)$/, ".spec.$1");

      // This is a simple check - in reality we'd check if the file exists
      if (content.includes("export") && content.includes("function")) {
        findings.push({
          severity: "info",
          rule: "tdd-test-coverage",
          message: "TDD: No test file found for this module",
          file: filePath,
          line: 1,
          suggestion: `Create a test file: ${testFile} or ${specFile}`,
          tool: "aichaku-tdd",
          category: "standards",
        });
      }
    }

    return findings;
  }

  private runMethodologyChecks(
    content: string,
    filePath: string,
    methodologies: string[],
  ): Finding[] {
    const findings: Finding[] = [];

    // Methodology checks would be more project-wide, but we can check some patterns
    for (const methodology of methodologies) {
      switch (methodology) {
        case "shape-up":
          findings.push(...this.checkShapeUp(content, filePath));
          break;
        case "scrum":
          findings.push(...this.checkScrum(content, filePath));
          break;
          // Add more methodologies
      }
    }

    return findings;
  }

  private checkShapeUp(content: string, filePath: string): Finding[] {
    const findings: Finding[] = [];

    // Check for scope creep indicators
    if (
      filePath.includes("feature") && content.includes("TODO") &&
      content.includes("nice to have")
    ) {
      findings.push({
        severity: "medium",
        rule: "shape-up-scope",
        message:
          "Shape Up: Potential scope creep - 'nice to have' found in feature",
        file: filePath,
        line: 1,
        suggestion:
          "Fixed time, variable scope - consider removing nice-to-haves",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    return findings;
  }

  private checkScrum(content: string, filePath: string): Finding[] {
    const findings: Finding[] = [];

    // Check for sprint-related patterns
    if (
      filePath.includes("sprint") && !content.includes("acceptance criteria")
    ) {
      findings.push({
        severity: "low",
        rule: "scrum-acceptance",
        message: "Scrum: Sprint work missing acceptance criteria",
        file: filePath,
        line: 1,
        suggestion: "Add clear acceptance criteria for sprint items",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    return findings;
  }

  private deduplicateFindings(findings: Finding[]): Finding[] {
    const seen = new Set<string>();
    return findings.filter((finding) => {
      const key = `${finding.file}:${finding.line}:${finding.rule}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private summarizeFindings(findings: Finding[]): ReviewResult["summary"] {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const finding of findings) {
      summary[finding.severity]++;
    }

    return summary;
  }
}
