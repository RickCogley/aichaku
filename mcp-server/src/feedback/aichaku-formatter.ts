/**
 * Aichaku Formatter - Handles all branding and formatting for the feedback system
 *
 * Ensures consistent use of:
 * - 🪴 Aichaku branding
 * - Growth phase indicators
 * - Activity indicators
 * - Proper formatting and structure
 */

import type { Finding, ReviewResult, Severity } from "../types.ts";

// Aichaku brand constants
export const AICHAKU_BRAND = {
  ICON: "🪴",
  NAME: "Aichaku",
  TAGLINE: "Methodology-Driven Development",

  // Growth phases
  PHASES: {
    SEED: "🌱", // Starting/initializing
    GROWING: "🌿", // Active processing
    BLOOMING: "🌸", // Success/completion
    MATURE: "🌳", // Established/stable
    HARVEST: "🍃", // Results/output
  },

  // Activity indicators
  ACTIVITIES: {
    SCANNING: "🔍",
    ANALYZING: "⚙️",
    VALIDATING: "✅",
    LEARNING: "📚",
    WARNING: "⚠️",
    ERROR: "❌",
    SUCCESS: "✨",
  },
} as const;

export class AichakuFormatter {
  /**
   * Format a branded message with consistent structure
   */
  formatBrandedMessage(indicator: string, message: string): string {
    return `${AICHAKU_BRAND.ICON} [${AICHAKU_BRAND.NAME}] ${indicator} ${message}`;
  }

  /**
   * Create startup banner
   */
  createBanner(): string {
    return `
┌─────────────────────────────────────────────────────────────┐
│  ${AICHAKU_BRAND.ICON} ${AICHAKU_BRAND.NAME} MCP Code Reviewer                           │
│  ${AICHAKU_BRAND.TAGLINE}                       │
│  Ready to enhance your code quality and security            │
└─────────────────────────────────────────────────────────────┘`;
  }

  /**
   * Format startup message
   */
  formatStartupMessage(): string {
    return this.formatBrandedMessage(
      AICHAKU_BRAND.PHASES.SEED,
      "MCP Server Starting...",
    );
  }

  /**
   * Format capabilities list
   */
  formatCapabilities(): string {
    const capabilities = [
      `${AICHAKU_BRAND.ACTIVITIES.SCANNING} review_file - Security and standards analysis`,
      `${AICHAKU_BRAND.ACTIVITIES.VALIDATING} review_methodology - Project methodology compliance`,
      `${AICHAKU_BRAND.ACTIVITIES.LEARNING} get_standards - Standards configuration lookup`,
    ];

    return `\n${AICHAKU_BRAND.ICON} Available Tools:\n` +
      capabilities.map((cap) => `  ${cap}`).join("\n") + "\n";
  }

  /**
   * Format standards loaded message
   */
  formatStandardsLoaded(standards: string[]): string {
    return this.formatBrandedMessage(
      AICHAKU_BRAND.PHASES.GROWING,
      `Standards loaded: ${standards.join(", ")}`,
    );
  }

  /**
   * Format methodology check message
   */
  formatMethodologyCheck(methodology: string): string {
    return this.formatBrandedMessage(
      AICHAKU_BRAND.ACTIVITIES.VALIDATING,
      `Checking methodology: ${methodology}`,
    );
  }

  /**
   * Format external scanners status
   */
  formatExternalScanners(
    scanners: Array<{ name: string; active: boolean }>,
  ): string {
    const lines = [
      this.formatBrandedMessage(
        AICHAKU_BRAND.ACTIVITIES.SCANNING,
        "Checking external security scanners...",
      ),
    ];

    scanners.forEach((scanner) => {
      const icon = scanner.active
        ? AICHAKU_BRAND.ACTIVITIES.SUCCESS
        : AICHAKU_BRAND.ACTIVITIES.WARNING;
      const status = scanner.active ? "active" : "not available";
      lines.push(
        this.formatBrandedMessage(
          icon,
          `External scanner ${scanner.name}: ${status}`,
        ),
      );
    });

    return lines.join("\n");
  }

  /**
   * Format external scanners enabled message
   */
  formatExternalScannersEnabled(): string {
    return this.formatBrandedMessage(
      AICHAKU_BRAND.ACTIVITIES.SCANNING,
      "External security scanners enabled",
    );
  }

  /**
   * Format result summary
   */
  formatResultSummary(result: ReviewResult): string {
    const findingCount = result.findings.length;
    const icon = findingCount === 0
      ? AICHAKU_BRAND.ACTIVITIES.SUCCESS
      : AICHAKU_BRAND.ACTIVITIES.WARNING;

    return this.formatBrandedMessage(
      icon,
      `Review complete: ${findingCount} findings`,
    );
  }

  /**
   * Format complete review results
   */
  formatReviewResults(result: ReviewResult): string {
    const sections = [
      this.formatHeader(result),
      this.formatSummary(result),
      this.formatFindings(result),
      this.formatMethodologyCompliance(result),
      this.formatLearningOpportunity(result),
      this.formatNextSteps(result),
    ].filter(Boolean);

    return sections.join("\n\n");
  }

  // Private formatting methods

  private formatHeader(result: ReviewResult): string {
    const fileType = this.getFileType(result.file);

    return `${AICHAKU_BRAND.ICON} ${AICHAKU_BRAND.NAME} ${fileType} Review Results
📄 File: ${result.file}
${AICHAKU_BRAND.PHASES.HARVEST} Completed: ${new Date().toLocaleString()}`;
  }

  private formatSummary(result: ReviewResult): string {
    const { summary } = result;
    const total = Object.values(summary).reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      return `${AICHAKU_BRAND.ACTIVITIES.SUCCESS} Excellent work! No issues found.
${AICHAKU_BRAND.PHASES.BLOOMING} Your code meets all security and standards requirements.`;
    }

    const priorityItems = [
      summary.critical > 0 ? `${summary.critical} critical` : null,
      summary.high > 0 ? `${summary.high} high` : null,
      summary.medium > 0 ? `${summary.medium} medium` : null,
      summary.low > 0 ? `${summary.low} low` : null,
      summary.info > 0 ? `${summary.info} info` : null,
    ].filter(Boolean);

    return `${AICHAKU_BRAND.ACTIVITIES.WARNING} Summary: ${priorityItems.join(", ")}
${AICHAKU_BRAND.PHASES.GROWING} Review Status: ${this.getOverallStatus(summary)}`;
  }

  private formatFindings(result: ReviewResult): string {
    if (result.findings.length === 0) return "";

    const grouped = this.groupFindingsBySeverity(result.findings);
    const sections: string[] = [];

    for (const [severity, findings] of Object.entries(grouped)) {
      if (findings.length === 0) continue;

      const icon = this.getSeverityIcon(severity as Severity);
      sections.push(
        `${icon} ${severity.toUpperCase()} ISSUES (${findings.length})`,
      );
      sections.push("─".repeat(50));

      findings.forEach((finding) => {
        sections.push(this.formatFinding(finding));
        sections.push(""); // Empty line between findings
      });
    }

    return sections.join("\n");
  }

  private formatFinding(finding: Finding): string {
    const lines = [
      `${AICHAKU_BRAND.ACTIVITIES.SCANNING} Line ${finding.line}: ${finding.message}`,
      `  ${AICHAKU_BRAND.PHASES.SEED} Rule: ${finding.rule}`,
      `  ${AICHAKU_BRAND.PHASES.GROWING} Category: ${finding.category || "General"}`,
      `  ${AICHAKU_BRAND.PHASES.MATURE} Tool: ${finding.tool}`,
    ];

    if (finding.suggestion) {
      lines.push(
        `  ${AICHAKU_BRAND.ACTIVITIES.LEARNING} Suggestion: ${finding.suggestion}`,
      );
    }

    return lines.join("\n");
  }

  private formatMethodologyCompliance(result: ReviewResult): string {
    if (!result.methodologyCompliance) return "";

    const { methodology, status, details } = result.methodologyCompliance;
    const icon = status === "passed"
      ? AICHAKU_BRAND.ACTIVITIES.SUCCESS
      : status === "warnings"
      ? AICHAKU_BRAND.ACTIVITIES.WARNING
      : AICHAKU_BRAND.ACTIVITIES.ERROR;

    const lines = [
      `${AICHAKU_BRAND.ACTIVITIES.VALIDATING} METHODOLOGY COMPLIANCE`,
      `${icon} ${methodology}: ${status.toUpperCase()}`,
    ];

    if (details.length > 0) {
      lines.push("", "Details:");
      details.forEach((detail) => {
        lines.push(`  ${AICHAKU_BRAND.PHASES.SEED} ${detail}`);
      });
    }

    return lines.join("\n");
  }

  private formatLearningOpportunity(result: ReviewResult): string {
    if (!result.claudeGuidance) return "";

    const guidance = result.claudeGuidance;
    const lines = [
      `${AICHAKU_BRAND.ACTIVITIES.LEARNING} LEARNING OPPORTUNITY`,
      `${AICHAKU_BRAND.PHASES.BLOOMING} Issue: ${guidance.pattern}`,
      `${AICHAKU_BRAND.PHASES.HARVEST} Solution: ${guidance.correction}`,
    ];

    if (guidance.context) {
      lines.push(
        "",
        `${AICHAKU_BRAND.PHASES.SEED} Context: ${guidance.context}`,
      );
    }

    if (guidance.stepByStep && guidance.stepByStep.length > 0) {
      lines.push("", `${AICHAKU_BRAND.PHASES.GROWING} Step-by-Step Fix:`);
      guidance.stepByStep.forEach((step, index) => {
        lines.push(`  ${index + 1}. ${step}`);
      });
    }

    return lines.join("\n");
  }

  private formatNextSteps(result: ReviewResult): string {
    const hasFindings = result.findings.length > 0;
    const hasCritical = result.findings.some((f) => f.severity === "critical");

    if (!hasFindings) {
      return `${AICHAKU_BRAND.PHASES.BLOOMING} NEXT STEPS
${AICHAKU_BRAND.ACTIVITIES.SUCCESS} Great job! Consider sharing your patterns with the team.
${AICHAKU_BRAND.PHASES.MATURE} Continue following these excellent practices.`;
    }

    const steps = [`${AICHAKU_BRAND.PHASES.BLOOMING} NEXT STEPS`];

    if (hasCritical) {
      steps.push(
        `${AICHAKU_BRAND.ACTIVITIES.ERROR} 1. Address critical security issues immediately`,
      );
      steps.push(
        `${AICHAKU_BRAND.ACTIVITIES.WARNING} 2. Review and fix high-priority items`,
      );
    } else {
      steps.push(
        `${AICHAKU_BRAND.ACTIVITIES.WARNING} 1. Review and address the findings above`,
      );
    }

    steps.push(
      `${AICHAKU_BRAND.ACTIVITIES.LEARNING} 2. Apply the learning opportunities to improve`,
    );
    steps.push(
      `${AICHAKU_BRAND.PHASES.MATURE} 3. Run the review again to verify fixes`,
    );

    return steps.join("\n");
  }

  // Helper methods

  private getFileType(filepath: string): string {
    const ext = filepath.split(".").pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      "ts": "TypeScript",
      "tsx": "TypeScript",
      "js": "JavaScript",
      "jsx": "JavaScript",
      "py": "Python",
      "rs": "Rust",
      "go": "Go",
      "java": "Java",
      "cs": "C#",
      "cpp": "C++",
      "c": "C",
      "md": "Markdown",
      "json": "JSON",
      "yaml": "YAML",
      "yml": "YAML",
    };
    return typeMap[ext || ""] || "Code";
  }

  private getSeverityIcon(severity: Severity): string {
    const icons: Record<Severity, string> = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🔵",
      info: "⚪",
    };
    return icons[severity];
  }

  private getOverallStatus(summary: Record<string, number>): string {
    if (summary.critical > 0) return "Needs immediate attention";
    if (summary.high > 0) return "Review recommended";
    if (summary.medium > 0) return "Minor improvements needed";
    if (summary.low > 0) return "Nearly perfect";
    return "Excellent";
  }

  private groupFindingsBySeverity(
    findings: Finding[],
  ): Record<Severity, Finding[]> {
    const grouped: Record<Severity, Finding[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };

    findings.forEach((finding) => {
      grouped[finding.severity].push(finding);
    });

    return grouped;
  }
}
