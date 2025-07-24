/**
 * Statistics manager - main interface for statistics functionality
 * Coordinates collection, storage, and reporting
 */

import type {
  OperationPerformance,
  SessionStatistics,
  StatisticsConfig,
  StatisticsReport,
  ToolInvocation,
} from "./types.ts";
import { DEFAULT_CONFIG } from "./types.ts";
import type { ReviewResult } from "../types.ts";
import { StatisticsCollector } from "./collector.ts";
import { StatisticsReporter } from "./reporter.ts";
import { createStorage } from "./storage.ts";
import { AICHAKU_BRANDING } from "../feedback-system.ts";

interface RealTimeStats {
  activeSession?: {
    startTime: Date;
    totalOperations: number;
    successRate: number;
  };
  recentActivity: Array<{
    timestamp: Date;
    success: boolean;
    toolName: string;
    duration: number;
  }>;
  currentPerformance: Record<string, {
    averageDuration: number;
    successRate: number;
  }>;
}

interface InsightsReport {
  totalOperations: number;
  toolUsage: Array<{
    tool: string;
    count: number;
    averageTime: number;
    successRate: number;
  }>;
  fileAnalytics: Array<{
    file: string;
    reviewCount: number;
    averageTime: number;
    issues: number;
  }>;
  trend: string;
  recommendations: string[];
}

interface CSVReport {
  operations: Array<{
    timestamp: string;
    tool: string;
    duration: number;
    success: boolean;
    file?: string;
  }>;
  summary: {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
  };
  toolUsage: Array<{
    tool: string;
    count: number;
    averageTime: number;
    successRate: number;
  }>;
  fileAnalytics: Array<{
    file: string;
    reviewCount: number;
    averageTime: number;
    issues: number;
  }>;
}

export class StatisticsManager {
  private collector: StatisticsCollector;
  private reporter: StatisticsReporter;
  private config: StatisticsConfig;
  private isInitialized = false;

  constructor(config: StatisticsConfig = DEFAULT_CONFIG) {
    this.config = config;

    // Create storage backend
    const storage = createStorage(config);

    // Initialize components
    this.collector = new StatisticsCollector(storage, config);
    this.reporter = new StatisticsReporter(storage, config);
  }

  /**
   * Initialize the statistics manager
   */
  async init(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      await this.collector.init();
      this.isInitialized = true;

      console.error(
        `${AICHAKU_BRANDING.ICON} [Aichaku] Statistics tracking enabled`,
      );
    } catch (error) {
      console.error(
        `${AICHAKU_BRANDING.ACTIVITIES.ERROR} [Aichaku] Failed to initialize statistics: ${error}`,
      );
    }
  }

  /**
   * Record a tool invocation
   */
  async recordInvocation(
    toolName: string,
    operationId: string,
    args: Record<string, unknown>,
    startTime: Date,
    success: boolean,
    result?: ReviewResult,
    error?: Error,
  ): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await this.collector.recordToolInvocation(
        toolName,
        operationId,
        args,
        startTime,
        success,
        result,
        error,
      );
    } catch (error) {
      console.error(
        `${AICHAKU_BRANDING.ACTIVITIES.ERROR} [Aichaku] Failed to record statistics: ${error}`,
      );
    }
  }

  /**
   * Generate dashboard report
   */
  async generateDashboard(): Promise<string> {
    if (!this.isInitialized) {
      return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} [Aichaku] Statistics tracking is not enabled`;
    }

    try {
      return await this.reporter.generateDashboard();
    } catch (error) {
      return `${AICHAKU_BRANDING.ACTIVITIES.ERROR} [Aichaku] Failed to generate dashboard: ${error}`;
    }
  }

  /**
   * Answer questions about usage
   */
  async answerQuestion(question: string): Promise<string> {
    if (!this.isInitialized) {
      return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} [Aichaku] Statistics tracking is not enabled`;
    }

    try {
      return await this.reporter.answerQuestion(question);
    } catch (error) {
      return `${AICHAKU_BRANDING.ACTIVITIES.ERROR} [Aichaku] Failed to answer question: ${error}`;
    }
  }

  /**
   * Get real-time statistics
   */
  async getRealTimeStats(): Promise<string> {
    if (!this.isInitialized) {
      return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} [Aichaku] Statistics tracking is not enabled`;
    }

    try {
      const stats = await this.reporter.getRealTimeStats();
      return this.formatRealTimeStats(stats);
    } catch (error) {
      return `${AICHAKU_BRANDING.ACTIVITIES.ERROR} [Aichaku] Failed to get real-time stats: ${error}`;
    }
  }

  /**
   * Export statistics data
   */
  async exportData(format: "json" | "csv" = "json"): Promise<string> {
    if (!this.isInitialized) {
      return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} [Aichaku] Statistics tracking is not enabled`;
    }

    try {
      const report = await this.reporter.generateReport();

      if (format === "json") {
        return JSON.stringify(report, null, 2);
      } else {
        return this.convertToCSV(report);
      }
    } catch (error) {
      return `${AICHAKU_BRANDING.ACTIVITIES.ERROR} [Aichaku] Failed to export data: ${error}`;
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(newConfig: Partial<StatisticsConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };

    if (this.isInitialized) {
      // Re-initialize with new config
      await this.close();
      await this.init();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): StatisticsConfig {
    return { ...this.config };
  }

  /**
   * Clean up old data
   */
  async cleanup(): Promise<string> {
    if (!this.isInitialized) {
      return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} [Aichaku] Statistics tracking is not enabled`;
    }

    try {
      await this.collector.cleanup();
      return `${AICHAKU_BRANDING.ACTIVITIES.SUCCESS} [Aichaku] Statistics cleanup completed`;
    } catch (error) {
      return `${AICHAKU_BRANDING.ACTIVITIES.ERROR} [Aichaku] Failed to cleanup: ${error}`;
    }
  }

  /**
   * Get usage insights
   */
  async getInsights(): Promise<string> {
    if (!this.isInitialized) {
      return `${AICHAKU_BRANDING.ACTIVITIES.WARNING} [Aichaku] Statistics tracking is not enabled`;
    }

    try {
      const report = await this.reporter.generateReport();
      return this.formatInsights(report);
    } catch (error) {
      return `${AICHAKU_BRANDING.ACTIVITIES.ERROR} [Aichaku] Failed to generate insights: ${error}`;
    }
  }

  /**
   * Close the statistics manager
   */
  async close(): Promise<void> {
    if (this.isInitialized) {
      await this.collector.close();
      this.isInitialized = false;
    }
  }

  /**
   * Helper method to format real-time stats
   */
  private formatRealTimeStats(stats: {
    activeSession: SessionStatistics | null | undefined;
    recentActivity: ToolInvocation[];
    currentPerformance: Record<string, OperationPerformance>;
  }): string {
    const { ICON, PHASES, ACTIVITIES } = AICHAKU_BRANDING;

    let output = `${ICON} Aichaku Real-Time Statistics\n\n`;

    // Active session
    if (stats.activeSession) {
      const session = stats.activeSession;
      const duration = Date.now() - session.startTime.getTime();
      output += `${PHASES.GROWING} Current Session:\n`;
      output += `• Duration: ${Math.round(duration / 1000)}s\n`;
      output += `• Operations: ${session.totalOperations}\n`;
      output += `• Success Rate: ${
        Math.round(
          (session.successfulOperations / session.totalOperations) * 100,
        )
      }%\n`;
      output += `• Tools Used: ${session.toolsUsed.join(", ")}\n\n`;
    }

    // Recent activity
    if (stats.recentActivity.length > 0) {
      output += `${ACTIVITIES.SCANNING} Recent Activity:\n`;
      stats.recentActivity.slice(0, 5).forEach((activity) => {
        const timeAgo = Math.round(
          (Date.now() - activity.timestamp.getTime()) / 1000,
        );
        const status = activity.success ? "✅" : "❌";
        output += `• ${status} ${activity.toolName} (${timeAgo}s ago, ${activity.duration}ms)\n`;
      });
      output += "\n";
    }

    // Performance summary
    if (Object.keys(stats.currentPerformance).length > 0) {
      output += `${PHASES.HARVEST} Performance Summary:\n`;
      Object.entries(stats.currentPerformance).forEach(
        ([tool, perf]) => {
          output += `• ${tool}: ${Math.round(perf.averageDuration)}ms avg, ${
            Math.round(perf.successRate * 100)
          }% success\n`;
        },
      );
    }

    return output;
  }

  /**
   * Helper method to format insights
   */
  private formatInsights(report: StatisticsReport): string {
    const { ICON, PHASES, ACTIVITIES } = AICHAKU_BRANDING;

    let output = `${ICON} Aichaku Usage Insights\n\n`;

    // Key metrics
    output += `${PHASES.HARVEST} Key Metrics:\n`;
    output += `• Total Operations: ${report.summary.totalOperations}\n`;
    output += `• Success Rate: ${Math.round(report.summary.overallSuccessRate * 100)}%\n`;
    output += `• Most Used Tool: ${report.summary.mostUsedTool}\n`;
    output += `• Most Reviewed File Type: ${report.summary.mostReviewedFileType}\n\n`;

    // Trends
    if (report.performanceTrends.length > 0) {
      const recentTrend = report.performanceTrends[report.performanceTrends.length - 1];
      const previousTrend = report.performanceTrends[report.performanceTrends.length - 2];

      output += `${PHASES.GROWING} Performance Trends:\n`;
      output += `• Recent Average Response Time: ${Math.round(recentTrend.averageResponseTime)}ms\n`;

      if (previousTrend) {
        const change = recentTrend.averageResponseTime -
          previousTrend.averageResponseTime;
        const direction = change > 0 ? "📈" : "📉";
        output += `• Performance Change: ${direction} ${Math.round(Math.abs(change))}ms\n`;
      }

      output += `• Recent Success Rate: ${Math.round(recentTrend.successRate * 100)}%\n\n`;
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      output += `${ACTIVITIES.LEARNING} Recommendations:\n`;
      report.recommendations.forEach((rec: string) => {
        output += `• ${rec}\n`;
      });
    }

    return output;
  }

  /**
   * Convert report to CSV format
   */
  private convertToCSV(report: StatisticsReport): string {
    const lines = [
      "Metric,Value",
      `Generated At,${report.generatedAt.toISOString()}`,
      `Total Sessions,${report.summary.totalSessions}`,
      `Total Operations,${report.summary.totalOperations}`,
      `Success Rate,${report.summary.overallSuccessRate}`,
      `Most Used Tool,${report.summary.mostUsedTool}`,
      `Most Reviewed File Type,${report.summary.mostReviewedFileType}`,
      "",
      "Tool,Usage Count,Success Rate,Average Duration",
      ...report.toolUsage.map((tool) =>
        `${tool.toolName},${tool.usageCount},${tool.successRate},${tool.averageDuration}`
      ),
      "",
      "File Type,Review Count,Average Issues",
      ...report.fileAnalytics.map((file) => `${file.fileType},${file.reviewCount},${file.averageIssues}`),
    ];

    return lines.join("\n");
  }
}

/**
 * Global statistics manager instance
 */
let globalStatsManager: StatisticsManager | null = null;

/**
 * Get or create global statistics manager
 */
export function getStatsManager(config?: StatisticsConfig): StatisticsManager {
  if (!globalStatsManager) {
    globalStatsManager = new StatisticsManager(config);
  }
  return globalStatsManager;
}

/**
 * Initialize global statistics manager
 */
export async function initGlobalStats(
  config?: StatisticsConfig,
): Promise<void> {
  const manager = getStatsManager(config);
  await manager.init();
}

/**
 * Close global statistics manager
 */
export async function closeGlobalStats(): Promise<void> {
  if (globalStatsManager) {
    await globalStatsManager.close();
    globalStatsManager = null;
  }
}
