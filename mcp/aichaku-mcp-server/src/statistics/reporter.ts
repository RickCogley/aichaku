/**
 * Statistics reporter for generating insights and analytics
 * Provides comprehensive reporting and dashboard capabilities
 */

import type {
  FileAnalysis,
  OperationPerformance,
  SessionStatistics,
  StandardsUsage,
  StatisticsConfig,
  StatisticsReport,
  ToolInvocation,
} from "./types.ts";
import type { StorageBackend } from "./storage.ts";
import { AICHAKU_BRANDING } from "../feedback-system.ts";

export class StatisticsReporter {
  private storage: StorageBackend;
  private config: StatisticsConfig;

  constructor(storage: StorageBackend, config: StatisticsConfig) {
    this.storage = storage;
    this.config = config;
  }

  /**
   * Generate comprehensive statistics report
   */
  async generateReport(
    timeRange?: { start: Date; end: Date },
  ): Promise<StatisticsReport> {
    const now = new Date();
    const defaultRange = {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      end: now,
    };

    const range = timeRange || defaultRange;

    // Collect all data
    const sessions = await this.getSessionsInRange(range);
    const invocations = await this.getInvocationsInRange(range);
    const performance = await this.getAllPerformanceData();
    const fileAnalytics = await this.getAllFileAnalytics();
    const standardsUsage = await this.getAllStandardsUsage();

    // Generate report
    const report: StatisticsReport = {
      generatedAt: now,
      timeRange: range,
      summary: this.generateSummary(sessions, invocations),
      toolUsage: this.generateToolUsageReport(invocations, performance),
      fileAnalytics: this.generateFileAnalyticsReport(fileAnalytics),
      standardsCompliance: this.generateStandardsComplianceReport(
        standardsUsage,
      ),
      performanceTrends: this.generatePerformanceTrends(invocations, range),
      recommendations: this.generateRecommendations(
        sessions,
        invocations,
        performance,
      ),
    };

    // Store the report
    const reportId = `${now.getTime()}-${Math.random().toString(36).substring(2, 8)}`;
    await this.storage.set(["stats", "reports", reportId], report);

    return report;
  }

  /**
   * Generate dashboard-style summary
   */
  async generateDashboard(): Promise<string> {
    const report = await this.generateReport();

    return this.formatDashboard(report);
  }

  /**
   * Get real-time statistics
   */
  async getRealTimeStats(): Promise<{
    activeSession: SessionStatistics | null | undefined;
    recentActivity: ToolInvocation[];
    currentPerformance: Record<string, OperationPerformance>;
  }> {
    // Get current session
    const sessions = await this.storage.list<SessionStatistics>([
      "stats",
      "sessions",
    ]);
    const activeSession = sessions
      .map((s) => s.value)
      .find((s) => !s.endTime);

    // Get recent activity (last 10 invocations)
    const invocations = await this.storage.list<ToolInvocation>([
      "stats",
      "invocations",
    ]);
    const recentActivity = invocations
      .map((i) => i.value)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Get current performance
    const performanceData = await this.storage.list<OperationPerformance>([
      "stats",
      "performance",
    ]);
    const currentPerformance = Object.fromEntries(
      performanceData.map((p) => [p.value.operationType, p.value]),
    );

    return {
      activeSession,
      recentActivity,
      currentPerformance,
    };
  }

  /**
   * Answer specific questions about usage
   */
  async answerQuestion(question: string): Promise<string> {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes("how many times") && lowerQuestion.includes("used")
    ) {
      return await this.getUsageCount();
    }

    if (
      lowerQuestion.includes("most frequent") ||
      lowerQuestion.includes("most used")
    ) {
      return await this.getMostUsedTools();
    }

    if (lowerQuestion.includes("files") && lowerQuestion.includes("reviewed")) {
      return await this.getMostReviewedFiles();
    }

    if (
      lowerQuestion.includes("how long") || lowerQuestion.includes("average")
    ) {
      return await this.getAverageOperationTimes();
    }

    if (
      lowerQuestion.includes("standards") && lowerQuestion.includes("check")
    ) {
      return await this.getStandardsChecked();
    }

    if (
      lowerQuestion.includes("success") || lowerQuestion.includes("failure")
    ) {
      return await this.getSuccessFailureRates();
    }

    return "I can help you with questions about:\n" +
      "- Tool usage frequency\n" +
      "- Most reviewed files\n" +
      "- Average operation times\n" +
      "- Standards compliance\n" +
      "- Success/failure rates";
  }

  /**
   * Private helper methods
   */

  private async getSessionsInRange(
    range: { start: Date; end: Date },
  ): Promise<SessionStatistics[]> {
    const sessions = await this.storage.list<SessionStatistics>([
      "stats",
      "sessions",
    ]);
    return sessions
      .map((s) => s.value)
      .filter((s) => s.startTime >= range.start && s.startTime <= range.end);
  }

  private async getInvocationsInRange(
    range: { start: Date; end: Date },
  ): Promise<ToolInvocation[]> {
    const invocations = await this.storage.list<ToolInvocation>([
      "stats",
      "invocations",
    ]);
    return invocations
      .map((i) => i.value)
      .filter((i) => i.timestamp >= range.start && i.timestamp <= range.end);
  }

  private async getAllPerformanceData(): Promise<OperationPerformance[]> {
    const performance = await this.storage.list<OperationPerformance>([
      "stats",
      "performance",
    ]);
    return performance.map((p) => p.value);
  }

  private async getAllFileAnalytics(): Promise<FileAnalysis[]> {
    const files = await this.storage.list<FileAnalysis>(["stats", "files"]);
    return files.map((f) => f.value);
  }

  private async getAllStandardsUsage(): Promise<StandardsUsage[]> {
    const standards = await this.storage.list<StandardsUsage>([
      "stats",
      "standards",
    ]);
    return standards.map((s) => s.value);
  }

  private generateSummary(
    sessions: SessionStatistics[],
    invocations: ToolInvocation[],
  ) {
    const totalOperations = invocations.length;
    const successfulOperations = invocations.filter((i) => i.success).length;
    const averageSessionDuration = sessions.reduce((sum, s) => {
      const duration = s.endTime ? s.endTime.getTime() - s.startTime.getTime() : 0;
      return sum + duration;
    }, 0) / sessions.length;

    const toolCounts = invocations.reduce((counts, inv) => {
      counts[inv.toolName] = (counts[inv.toolName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const fileCounts = invocations.reduce((counts, inv) => {
      if (inv.resultSummary?.fileType) {
        counts[inv.resultSummary.fileType] = (counts[inv.resultSummary.fileType] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    return {
      totalSessions: sessions.length,
      totalOperations,
      averageSessionDuration,
      overallSuccessRate: successfulOperations / totalOperations,
      mostUsedTool: Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "none",
      mostReviewedFileType: Object.entries(fileCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "none",
      mostUsedStandard: "security", // Placeholder
    };
  }

  private generateToolUsageReport(
    invocations: ToolInvocation[],
    _performance: OperationPerformance[],
  ) {
    const toolStats = invocations.reduce(
      (stats, inv) => {
        if (!stats[inv.toolName]) {
          stats[inv.toolName] = { count: 0, successCount: 0, totalDuration: 0 };
        }
        stats[inv.toolName].count++;
        if (inv.success) stats[inv.toolName].successCount++;
        stats[inv.toolName].totalDuration += inv.duration;
        return stats;
      },
      {} as Record<
        string,
        { count: number; successCount: number; totalDuration: number }
      >,
    );

    return Object.entries(toolStats).map(([toolName, stats]) => ({
      toolName,
      usageCount: stats.count,
      successRate: stats.successCount / stats.count,
      averageDuration: stats.totalDuration / stats.count,
    }));
  }

  private generateFileAnalyticsReport(fileAnalytics: FileAnalysis[]) {
    const fileTypeStats = fileAnalytics.reduce(
      (stats, file) => {
        if (!stats[file.fileType]) {
          stats[file.fileType] = {
            count: 0,
            totalIssues: 0,
            issues: [] as string[],
          };
        }
        stats[file.fileType].count += file.reviewCount;
        stats[file.fileType].totalIssues += file.commonIssues.reduce(
          (sum, issue) => sum + issue.count,
          0,
        );
        file.commonIssues.forEach((issue) => {
          if (!stats[file.fileType].issues.includes(issue.rule)) {
            stats[file.fileType].issues.push(issue.rule);
          }
        });
        return stats;
      },
      {} as Record<
        string,
        { count: number; totalIssues: number; issues: string[] }
      >,
    );

    return Object.entries(fileTypeStats).map(([fileType, stats]) => ({
      fileType,
      reviewCount: stats.count,
      averageIssues: stats.totalIssues / stats.count,
      topIssues: stats.issues.slice(0, 5),
    }));
  }

  private generateStandardsComplianceReport(standardsUsage: StandardsUsage[]) {
    return standardsUsage.map((usage) => ({
      standard: usage.standardName,
      usageCount: usage.usageCount,
      averageScore: usage.averageComplianceScore,
      improvement: 0, // Would calculate based on historical data
    }));
  }

  private generatePerformanceTrends(
    invocations: ToolInvocation[],
    range: { start: Date; end: Date },
  ) {
    const dayMs = 24 * 60 * 60 * 1000;
    const trends = [];

    const startTime = range.start.getTime();
    const endTime = range.end.getTime();

    for (
      let currentTime = startTime;
      currentTime <= endTime;
      currentTime += dayMs
    ) {
      const date = new Date(currentTime);
      const dayInvocations = invocations.filter((inv) => {
        const invDate = new Date(inv.timestamp);
        return invDate.getDate() === date.getDate() &&
          invDate.getMonth() === date.getMonth() &&
          invDate.getFullYear() === date.getFullYear();
      });

      const successCount = dayInvocations.filter((inv) => inv.success).length;
      const averageTime = dayInvocations.reduce((sum, inv) => sum + inv.duration, 0) /
        dayInvocations.length;

      trends.push({
        date: date.toISOString().split("T")[0],
        averageResponseTime: averageTime || 0,
        successRate: dayInvocations.length > 0 ? successCount / dayInvocations.length : 0,
        operationCount: dayInvocations.length,
      });
    }

    return trends;
  }

  private generateRecommendations(
    _sessions: SessionStatistics[],
    invocations: ToolInvocation[],
    performance: OperationPerformance[],
  ): string[] {
    const recommendations = [];

    // Check for slow operations
    const slowOperations = performance.filter((p) => p.averageDuration > 5000);
    if (slowOperations.length > 0) {
      recommendations.push(
        `Consider optimizing ${
          slowOperations.map((p) => p.operationType).join(", ")
        } - average duration is over 5 seconds`,
      );
    }

    // Check for high failure rates
    const failingOperations = performance.filter((p) => p.successRate < 0.8);
    if (failingOperations.length > 0) {
      recommendations.push(
        `Review ${failingOperations.map((p) => p.operationType).join(", ")} - success rate is below 80%`,
      );
    }

    // Check for underused tools
    const toolUsage = invocations.reduce((counts, inv) => {
      counts[inv.toolName] = (counts[inv.toolName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const availableTools = [
      "review_file",
      "review_methodology",
      "get_standards",
    ];
    const unusedTools = availableTools.filter((tool) => !toolUsage[tool]);

    if (unusedTools.length > 0) {
      recommendations.push(
        `Consider using ${unusedTools.join(", ")} tools for more comprehensive analysis`,
      );
    }

    // Check for frequent issues
    const commonIssues = invocations
      .filter((inv) => inv.resultSummary?.findingsCount && inv.resultSummary.findingsCount > 0)
      .reduce((issues, inv) => {
        if (inv.resultSummary?.severity) {
          Object.entries(inv.resultSummary.severity).forEach(
            ([severity, count]) => {
              issues[severity] = (issues[severity] || 0) + count;
            },
          );
        }
        return issues;
      }, {} as Record<string, number>);

    if (commonIssues.critical > 0) {
      recommendations.push(
        `Address critical security issues - ${commonIssues.critical} critical findings detected`,
      );
    }

    return recommendations;
  }

  private formatDashboard(report: StatisticsReport): string {
    const { ICON, PHASES, ACTIVITIES } = AICHAKU_BRANDING;

    return `
${ICON} Aichaku MCP Statistics Dashboard
Generated: ${report.generatedAt.toLocaleString()}
Time Range: ${report.timeRange.start.toLocaleDateString()} - ${report.timeRange.end.toLocaleDateString()}

${PHASES.HARVEST} SUMMARY
• Total Sessions: ${report.summary.totalSessions}
• Total Operations: ${report.summary.totalOperations}
• Average Session Duration: ${Math.round(report.summary.averageSessionDuration / 1000)}s
• Overall Success Rate: ${Math.round(report.summary.overallSuccessRate * 100)}%
• Most Used Tool: ${report.summary.mostUsedTool}
• Most Reviewed File Type: ${report.summary.mostReviewedFileType}

${ACTIVITIES.SCANNING} TOOL USAGE
${
      report.toolUsage.map((tool) =>
        `• ${tool.toolName}: ${tool.usageCount} uses, ${Math.round(tool.successRate * 100)}% success, ${
          Math.round(tool.averageDuration)
        }ms avg`
      ).join("\n")
    }

${ACTIVITIES.ANALYZING} FILE ANALYTICS
${
      report.fileAnalytics.map((file) =>
        `• ${file.fileType}: ${file.reviewCount} reviews, ${Math.round(file.averageIssues)} avg issues`
      ).join("\n")
    }

${ACTIVITIES.VALIDATING} STANDARDS COMPLIANCE
${
      report.standardsCompliance.map((standard) =>
        `• ${standard.standard}: ${standard.usageCount} checks, ${Math.round(standard.averageScore)}% avg score`
      ).join("\n")
    }

${ACTIVITIES.LEARNING} RECOMMENDATIONS
${report.recommendations.map((rec) => `• ${rec}`).join("\n")}
    `.trim();
  }

  // Question-specific methods
  private async getUsageCount(): Promise<string> {
    const invocations = await this.storage.list<ToolInvocation>([
      "stats",
      "invocations",
    ]);
    const sessions = await this.storage.list<SessionStatistics>([
      "stats",
      "sessions",
    ]);

    return `${AICHAKU_BRANDING.ICON} MCP Server Usage:\n` +
      `• Total operations: ${invocations.length}\n` +
      `• Total sessions: ${sessions.length}\n` +
      `• Average operations per session: ${Math.round(invocations.length / sessions.length)}`;
  }

  private async getMostUsedTools(): Promise<string> {
    const invocations = await this.storage.list<ToolInvocation>([
      "stats",
      "invocations",
    ]);
    const toolCounts = invocations.reduce((counts, inv) => {
      counts[inv.value.toolName] = (counts[inv.value.toolName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const sortedTools = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return `${AICHAKU_BRANDING.ACTIVITIES.SCANNING} Most Used Tools:\n` +
      sortedTools.map(([tool, count]) => `• ${tool}: ${count} uses`).join("\n");
  }

  private async getMostReviewedFiles(): Promise<string> {
    const files = await this.storage.list<FileAnalysis>(["stats", "files"]);
    const sortedFiles = files
      .sort((a, b) => b.value.reviewCount - a.value.reviewCount)
      .slice(0, 10);

    return `${AICHAKU_BRANDING.ACTIVITIES.ANALYZING} Most Reviewed Files:\n` +
      sortedFiles.map((f) => `• ${f.value.filePath}: ${f.value.reviewCount} reviews`).join("\n");
  }

  private async getAverageOperationTimes(): Promise<string> {
    const performance = await this.storage.list<OperationPerformance>([
      "stats",
      "performance",
    ]);

    return `${AICHAKU_BRANDING.PHASES.GROWING} Average Operation Times:\n` +
      performance.map((p) => `• ${p.value.operationType}: ${Math.round(p.value.averageDuration)}ms`)
        .join("\n");
  }

  private async getStandardsChecked(): Promise<string> {
    const standards = await this.storage.list<StandardsUsage>([
      "stats",
      "standards",
    ]);

    return `${AICHAKU_BRANDING.ACTIVITIES.VALIDATING} Standards Checked:\n` +
      standards.map((s) =>
        `• ${s.value.standardName}: ${s.value.usageCount} checks, ${
          Math.round(s.value.averageComplianceScore)
        }% avg score`
      ).join("\n");
  }

  private async getSuccessFailureRates(): Promise<string> {
    const performance = await this.storage.list<OperationPerformance>([
      "stats",
      "performance",
    ]);

    return `${AICHAKU_BRANDING.ACTIVITIES.SUCCESS} Success/Failure Rates:\n` +
      performance.map((p) => `• ${p.value.operationType}: ${Math.round(p.value.successRate * 100)}% success rate`).join(
        "\n",
      );
  }
}
