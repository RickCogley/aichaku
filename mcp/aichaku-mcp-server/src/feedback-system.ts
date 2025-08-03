/**
 * Comprehensive Feedback and Visibility System for Aichaku MCP Server
 * Provides branded, informative, and progressive feedback for Claude Code interactions
 */

import type { Finding, ReviewResult, Severity } from "./types.ts";

// Brand identity constants
export const AICHAKU_BRANDING = {
  // Primary brand elements
  ICON: "🪴",
  NAME: "Aichaku",
  TAGLINE: "Methodology-Driven Development",

  // Visual elements for different contexts
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

  // Progress indicators
  PROGRESS: {
    SPINNER: ["🌱", "🌿", "🌸", "🌳"],
    DOTS: "⋯",
    ARROW: "→",
  },

  // Console colors
  COLORS: {
    SUCCESS: "\x1b[32m",
    WARNING: "\x1b[33m",
    ERROR: "\x1b[31m",
    INFO: "\x1b[36m",
    RESET: "\x1b[0m",
    BOLD: "\x1b[1m",
    DIM: "\x1b[2m",
  },
} as const;

// Brand-consistent message formatting
export class AichakuFormatter {
  static formatBrandedMessage(phase: string, message: string): string {
    return `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${phase} ${message}`;
  }

  static startup(): string {
    return this.formatBrandedMessage(
      AICHAKU_BRANDING.PHASES.SEED,
      "MCP Server Starting...",
    );
  }

  static toolInvocation(toolName: string): string {
    return this.formatBrandedMessage(
      AICHAKU_BRANDING.ACTIVITIES.SCANNING,
      `Tool invoked: ${toolName}`,
    );
  }

  static processingFile(fileName: string): string {
    return this.formatBrandedMessage(
      AICHAKU_BRANDING.ACTIVITIES.ANALYZING,
      `Processing: ${fileName}`,
    );
  }

  static standardsLoaded(standards: string[]): string {
    return this.formatBrandedMessage(
      AICHAKU_BRANDING.PHASES.GROWING,
      `Standards loaded: ${standards.join(", ")}`,
    );
  }

  static resultsReady(findingCount: number): string {
    const icon = findingCount === 0 ? AICHAKU_BRANDING.ACTIVITIES.SUCCESS : AICHAKU_BRANDING.ACTIVITIES.WARNING;

    return this.formatBrandedMessage(
      icon,
      `Review complete: ${findingCount} findings`,
    );
  }

  static methodologyCheck(methodology: string): string {
    return this.formatBrandedMessage(
      AICHAKU_BRANDING.ACTIVITIES.VALIDATING,
      `Checking methodology: ${methodology}`,
    );
  }

  static externalScanner(scannerName: string, active: boolean): string {
    const icon = active ? AICHAKU_BRANDING.ACTIVITIES.SUCCESS : AICHAKU_BRANDING.ACTIVITIES.WARNING;
    const status = active ? "active" : "not available";

    return this.formatBrandedMessage(
      icon,
      `External scanner ${scannerName}: ${status}`,
    );
  }
}

// Progress tracking and timing
interface ProgressState {
  operation: string;
  startTime: number;
  currentPhase: string;
  estimatedDuration: number;
  lastUpdateTime: number;
}

export class FeedbackManager {
  private static timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private static progressStates: Map<string, ProgressState> = new Map();
  private static operationCounter = 0;

  static startOperation(operationType: string, context?: string): string {
    const operationId = `${operationType}-${++this.operationCounter}`;

    const state: ProgressState = {
      operation: operationType,
      startTime: Date.now(),
      currentPhase: "initializing",
      estimatedDuration: this.estimateOperationTime(operationType),
      lastUpdateTime: Date.now(),
    };

    this.progressStates.set(operationId, state);

    // Immediate feedback
    console.error(AichakuFormatter.toolInvocation(operationType));

    if (context) {
      console.error(AichakuFormatter.processingFile(context));
    }

    // Show progress indicator for longer operations
    if (state.estimatedDuration > 1500) {
      const timer = setTimeout(() => { // DevSkim: ignore DS172411
        this.showProgress(operationId);
      }, 1500);
      this.timers.set(operationId, timer);
    }

    return operationId;
  }

  static updateProgress(
    operationId: string,
    phase: string,
    details?: string,
  ): void {
    const state = this.progressStates.get(operationId);
    if (!state) return;

    const now = Date.now();
    state.currentPhase = phase;
    state.lastUpdateTime = now;

    const elapsed = now - state.startTime;

    // Show progress updates for operations taking longer than expected
    if (elapsed > 2000) {
      const message = details ? `${phase} - ${details}` : phase;
      console.error(AichakuFormatter.formatBrandedMessage(
        AICHAKU_BRANDING.PHASES.GROWING,
        message,
      ));
    }
  }

  static completeOperation(operationId: string, result: ReviewResult): void {
    const timer = this.timers.get(operationId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(operationId);
    }

    const state = this.progressStates.get(operationId);
    if (state) {
      const elapsed = Date.now() - state.startTime;
      console.error(AichakuFormatter.resultsReady(result.findings.length));

      // Show timing info for operations that took a while
      if (elapsed > 3000) {
        console.error(AichakuFormatter.formatBrandedMessage(
          AICHAKU_BRANDING.PHASES.HARVEST,
          `Operation completed in ${(elapsed / 1000).toFixed(1)}s`,
        ));
      }
    }

    this.progressStates.delete(operationId);
  }

  static reportError(operationId: string, error: Error): void {
    const timer = this.timers.get(operationId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(operationId);
    }

    console.error(AichakuFormatter.formatBrandedMessage(
      AICHAKU_BRANDING.ACTIVITIES.ERROR,
      `Operation failed: ${error.message}`,
    ));

    this.progressStates.delete(operationId);
  }

  private static estimateOperationTime(operation: string): number {
    // Estimate based on operation type
    switch (operation) {
      case "review_file":
        return 2000;
      case "review_methodology":
        return 1500;
      case "get_standards":
        return 500;
      default:
        return 1000;
    }
  }

  private static showProgress(operationId: string): void {
    const state = this.progressStates.get(operationId);
    if (!state) return;

    const elapsed = Date.now() - state.startTime;
    const progress = Math.min(elapsed / state.estimatedDuration, 0.9);

    console.error(AichakuFormatter.formatBrandedMessage(
      AICHAKU_BRANDING.PHASES.GROWING,
      `${state.currentPhase} ${this.generateProgressBar(progress)}`,
    ));
  }

  private static generateProgressBar(progress: number): string {
    const length = 10;
    const filled = Math.round(progress * length);
    const empty = length - filled;
    return `${"█".repeat(filled)}${"░".repeat(empty)} ${Math.round(progress * 100)}%`;
  }
}

// Enhanced console output management
export class ConsoleOutputManager {
  static formatServerStartup(): void {
    console.error(this.createBanner());
    console.error(AichakuFormatter.startup());
    console.error(this.formatCapabilities());
    console.error(this.formatSystemInfo());
  }

  static formatToolInvocation(
    toolName: string,
    args: Record<string, unknown>,
  ): string {
    const operationId = FeedbackManager.startOperation(
      toolName,
      (args.file as string) || (args.projectPath as string) || undefined,
    );

    // Additional context based on tool
    if (toolName === "review_file" && args.includeExternal) {
      console.error(AichakuFormatter.formatBrandedMessage(
        AICHAKU_BRANDING.ACTIVITIES.SCANNING,
        "External security scanners enabled",
      ));
    }

    return operationId;
  }

  static formatStandardsCompliance(standards: string[]): void {
    console.error(AichakuFormatter.standardsLoaded(standards));
  }

  static formatMethodologyCheck(methodology: string): void {
    console.error(AichakuFormatter.methodologyCheck(methodology));
  }

  static formatExternalScanners(
    scanners: Array<{ name: string; active: boolean }>,
  ): void {
    console.error(AichakuFormatter.formatBrandedMessage(
      AICHAKU_BRANDING.ACTIVITIES.SCANNING,
      "Checking external security scanners...",
    ));

    scanners.forEach((scanner) => {
      console.error(
        AichakuFormatter.externalScanner(scanner.name, scanner.active),
      );
    });
  }

  private static createBanner(): string {
    const colors = AICHAKU_BRANDING.COLORS;
    return `
${colors.BOLD}${colors.INFO}┌─────────────────────────────────────────────────────────────┐
│  ${AICHAKU_BRANDING.ICON} ${AICHAKU_BRANDING.NAME} MCP Code Reviewer v0.1.0                      │
│  ${AICHAKU_BRANDING.TAGLINE}                       │
│  Ready to enhance your code quality and security            │
└─────────────────────────────────────────────────────────────┘${colors.RESET}`;
  }

  private static formatCapabilities(): string {
    return this.formatSection("Available Tools", [
      `${AICHAKU_BRANDING.ACTIVITIES.SCANNING} review_file - Security and standards analysis`,
      `${AICHAKU_BRANDING.ACTIVITIES.VALIDATING} review_methodology - Project methodology compliance`,
      `${AICHAKU_BRANDING.ACTIVITIES.LEARNING} get_standards - Standards configuration lookup`,
    ]);
  }

  private static formatSystemInfo(): string {
    return this.formatSection("System Ready", [
      `${AICHAKU_BRANDING.PHASES.MATURE} Server initialized successfully`,
      `${AICHAKU_BRANDING.PHASES.GROWING} Awaiting tool invocations from Claude Code`,
    ]);
  }

  private static formatSection(title: string, items: string[]): string {
    const colors = AICHAKU_BRANDING.COLORS;
    const lines = [
      `${colors.BOLD}${AICHAKU_BRANDING.ICON} ${title}${colors.RESET}`,
      ...items.map((item) => `  ${item}`),
      "",
    ];
    return lines.join("\n");
  }
}

// Enhanced result formatting
export class ComplianceFormatter {
  static formatReviewResults(result: ReviewResult): string {
    const sections = [
      this.formatHeader(result),
      this.formatSummary(result),
      this.formatFindings(result),
      this.formatCompliance(result),
      this.formatEducationalContent(result),
      this.formatNextSteps(result),
    ].filter(Boolean);

    return sections.join("\n\n");
  }

  private static formatHeader(result: ReviewResult): string {
    const fileType = this.detectFileType(result.file);
    const reviewType = this.getReviewTypeIcon(fileType);

    return `${AICHAKU_BRANDING.ICON} ${AICHAKU_BRANDING.NAME} ${fileType} Review Results
${reviewType} File: ${result.file}
${AICHAKU_BRANDING.PHASES.HARVEST} Completed: ${new Date().toLocaleString()}`;
  }

  private static formatSummary(result: ReviewResult): string {
    const summary = result.summary;
    const total = Object.values(summary).reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      return `${AICHAKU_BRANDING.ACTIVITIES.SUCCESS} Excellent work! No issues found.
${AICHAKU_BRANDING.PHASES.BLOOMING} Your code meets all security and standards requirements.`;
    }

    const priorityItems = [
      summary.critical > 0 ? `${summary.critical} critical` : null,
      summary.high > 0 ? `${summary.high} high` : null,
      summary.medium > 0 ? `${summary.medium} medium` : null,
      summary.low > 0 ? `${summary.low} low` : null,
      summary.info > 0 ? `${summary.info} info` : null,
    ].filter(Boolean);

    return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} Summary: ${priorityItems.join(", ")}
${AICHAKU_BRANDING.PHASES.GROWING} Review Status: ${this.getOverallStatus(summary)}`;
  }

  private static formatFindings(result: ReviewResult): string {
    if (result.findings.length === 0) return "";

    const grouped = this.groupFindingsBySeverity(result.findings);
    const sections = [];

    for (const [severity, findings] of Object.entries(grouped)) {
      if (findings.length === 0) continue;

      const icon = this.getSeverityIcon(severity as Severity);
      const title = `${icon} ${severity.toUpperCase()} ISSUES (${findings.length})`;

      sections.push(title);
      sections.push("─".repeat(50));

      for (const finding of findings) {
        sections.push(this.formatFinding(finding));
      }

      sections.push(""); // Empty line between sections
    }

    return sections.join("\n");
  }

  private static formatFinding(finding: Finding): string {
    const lines = [
      `${AICHAKU_BRANDING.ACTIVITIES.SCANNING} Line ${finding.line}: ${finding.message}`,
      `  ${AICHAKU_BRANDING.PHASES.SEED} Rule: ${finding.rule}`,
      `  ${AICHAKU_BRANDING.PHASES.GROWING} Category: ${finding.category || "General"}`,
      `  ${AICHAKU_BRANDING.PHASES.MATURE} Tool: ${finding.tool}`,
    ];

    if (finding.suggestion) {
      lines.push(
        `  ${AICHAKU_BRANDING.ACTIVITIES.LEARNING} Suggestion: ${finding.suggestion}`,
      );
    }

    return lines.join("\n");
  }

  private static formatCompliance(result: ReviewResult): string {
    if (!result.methodologyCompliance) return "";

    const { methodology, status, details } = result.methodologyCompliance;
    const icon = status === "passed"
      ? AICHAKU_BRANDING.ACTIVITIES.SUCCESS
      : status === "warnings"
      ? AICHAKU_BRANDING.ACTIVITIES.WARNING
      : AICHAKU_BRANDING.ACTIVITIES.ERROR;

    const lines = [
      `${AICHAKU_BRANDING.ACTIVITIES.VALIDATING} METHODOLOGY COMPLIANCE`,
      `${icon} ${methodology}: ${status.toUpperCase()}`,
      "",
    ];

    if (details.length > 0) {
      lines.push("Details:");
      details.forEach((detail) => {
        lines.push(`  ${AICHAKU_BRANDING.PHASES.SEED} ${detail}`);
      });
    }

    return lines.join("\n");
  }

  private static formatEducationalContent(result: ReviewResult): string {
    if (!result.claudeGuidance) return "";

    const guidance = result.claudeGuidance;
    const lines = [
      `${AICHAKU_BRANDING.ACTIVITIES.LEARNING} LEARNING OPPORTUNITY`,
      `${AICHAKU_BRANDING.PHASES.BLOOMING} Issue: ${guidance.pattern}`,
      `${AICHAKU_BRANDING.PHASES.HARVEST} Solution: ${guidance.correction}`,
      "",
    ];

    if (guidance.context) {
      lines.push(
        `${AICHAKU_BRANDING.PHASES.SEED} Context: ${guidance.context}`,
      );
      lines.push("");
    }

    if (guidance.badExample && guidance.goodExample) {
      lines.push(`${AICHAKU_BRANDING.ACTIVITIES.ERROR} Problematic Pattern:`);
      lines.push(guidance.badExample);
      lines.push("");
      lines.push(`${AICHAKU_BRANDING.ACTIVITIES.SUCCESS} Recommended Pattern:`);
      lines.push(guidance.goodExample);
      lines.push("");
    }

    if (guidance.stepByStep && guidance.stepByStep.length > 0) {
      lines.push(`${AICHAKU_BRANDING.PHASES.GROWING} Step-by-Step Fix:`);
      guidance.stepByStep.forEach((step, index) => {
        lines.push(`  ${index + 1}. ${step}`);
      });
      lines.push("");
    }

    if (guidance.reflection) {
      lines.push(
        `${AICHAKU_BRANDING.PHASES.SEED} Reflection: ${guidance.reflection}`,
      );
    }

    return lines.join("\n");
  }

  private static formatNextSteps(result: ReviewResult): string {
    const hasFindings = result.findings.length > 0;
    const hasCritical = result.findings.some((f) => f.severity === "critical");

    if (!hasFindings) {
      return `${AICHAKU_BRANDING.PHASES.BLOOMING} NEXT STEPS
${AICHAKU_BRANDING.ACTIVITIES.SUCCESS} Great job! Consider sharing your patterns with the team.
${AICHAKU_BRANDING.PHASES.MATURE} Continue following these excellent practices.`;
    }

    const steps = [
      `${AICHAKU_BRANDING.PHASES.BLOOMING} NEXT STEPS`,
    ];

    if (hasCritical) {
      steps.push(
        `${AICHAKU_BRANDING.ACTIVITIES.ERROR} 1. Address critical security issues immediately`,
      );
      steps.push(
        `${AICHAKU_BRANDING.ACTIVITIES.WARNING} 2. Review and fix high-priority items`,
      );
    } else {
      steps.push(
        `${AICHAKU_BRANDING.ACTIVITIES.WARNING} 1. Review and address the findings above`,
      );
    }

    steps.push(
      `${AICHAKU_BRANDING.ACTIVITIES.LEARNING} 2. Apply the learning opportunities to improve`,
    );
    steps.push(
      `${AICHAKU_BRANDING.PHASES.MATURE} 3. Run the review again to verify fixes`,
    );

    return steps.join("\n");
  }

  // Helper methods for formatting
  private static detectFileType(filepath: string): string {
    const ext = filepath.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts":
      case "js":
      case "tsx":
      case "jsx":
        return "TypeScript/JavaScript";
      case "py":
        return "Python";
      case "rs":
        return "Rust";
      case "go":
        return "Go";
      case "md":
        return "Documentation";
      case "json":
        return "Configuration";
      case "yml":
      case "yaml":
        return "YAML Configuration";
      default:
        return "Code";
    }
  }

  private static getReviewTypeIcon(fileType: string): string {
    switch (fileType) {
      case "Documentation":
        return "📖";
      case "Configuration":
        return "⚙️";
      case "YAML Configuration":
        return "📋";
      default:
        return "💻";
    }
  }

  private static getSeverityIcon(severity: Severity): string {
    switch (severity) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      case "low":
        return "🔵";
      case "info":
        return "⚪";
    }
  }

  private static getOverallStatus(
    summary: { critical: number; high: number; medium: number; low: number },
  ): string {
    if (summary.critical > 0) {
      return `${AICHAKU_BRANDING.ACTIVITIES.ERROR} Needs immediate attention`;
    }
    if (summary.high > 0) {
      return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} Review recommended`;
    }
    if (summary.medium > 0) {
      return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} Minor improvements needed`;
    }
    if (summary.low > 0) {
      return `${AICHAKU_BRANDING.PHASES.GROWING} Nearly perfect`;
    }
    return `${AICHAKU_BRANDING.ACTIVITIES.SUCCESS} Excellent`;
  }

  private static groupFindingsBySeverity(
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
