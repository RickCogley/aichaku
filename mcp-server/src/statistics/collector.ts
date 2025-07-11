/**
 * Statistics collector for MCP tool usage
 * Tracks and aggregates usage data with privacy controls
 */

import type {
  DEFAULT_CONFIG,
  FileAnalysis,
  OperationPerformance,
  SessionStatistics,
  StandardsUsage,
  StatisticsConfig,
  ToolInvocation,
} from "./types.ts";
import type { StorageBackend } from "./storage.ts";
import type { ReviewResult } from "../types.ts";
import { DataSanitizer, FilePathAnonymizer, UserIdentifierAnonymizer } from "./privacy.ts";

export class StatisticsCollector {
  private storage: StorageBackend;
  private config: StatisticsConfig;
  private currentSession: SessionStatistics | null = null;
  private sessionStartTime: Date = new Date();
  private isInitialized = false;

  constructor(
    storage: StorageBackend,
    config: StatisticsConfig = DEFAULT_CONFIG,
  ) {
    this.storage = storage;
    this.config = config;
  }

  /**
   * Initialize the statistics collector
   */
  async init(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    await this.storage.init();

    // Load or create config
    const storedConfig = await this.storage.get<StatisticsConfig>([
      "stats",
      "config",
    ]);
    if (storedConfig) {
      this.config = { ...this.config, ...storedConfig };
    } else {
      await this.storage.set(["stats", "config"], this.config);
    }

    // Start new session
    await this.startSession();

    // Schedule cleanup
    this.scheduleCleanup();

    this.isInitialized = true;
  }

  /**
   * Start a new session
   */
  private async startSession(): Promise<void> {
    const sessionId = await this.generateSessionId();
    this.currentSession = {
      sessionId,
      startTime: new Date(),
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageOperationTime: 0,
      toolsUsed: [],
      filesReviewed: [],
      standardsChecked: [],
      methodologiesValidated: [],
      totalFindings: 0,
      findingsBySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
    };

    await this.storage.set(
      ["stats", "sessions", sessionId],
      this.currentSession,
    );
  }

  /**
   * Record a tool invocation
   */
  async recordToolInvocation(
    toolName: string,
    operationId: string,
    args: Record<string, unknown>,
    startTime: Date,
    success: boolean,
    result?: ReviewResult,
    _error?: Error,
  ): Promise<void> {
    if (!this.config.enabled || !this.isInitialized) {
      return;
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    // Sanitize arguments for privacy
    const sanitizedArgs = DataSanitizer.sanitizeArguments(args, this.config);

    // Extract result summary
    const resultSummary = result
      ? {
        findingsCount: result.findings.length,
        severity: result.summary,
        fileType: args.file ? FilePathAnonymizer.getFileType(args.file as string) : undefined,
        fileSize: await this.getFileSize(args.file as string),
      }
      : undefined;

    const invocation: ToolInvocation = {
      toolName,
      timestamp: startTime,
      duration,
      success,
      arguments: sanitizedArgs,
      resultSummary,
      sessionId: this.currentSession?.sessionId || "unknown",
      operationId,
    };

    // Store the invocation
    await this.storage.set(["stats", "invocations", operationId], invocation);

    // Update session statistics
    await this.updateSessionStats(invocation, result);

    // Update aggregated statistics
    await this.updateAggregatedStats(invocation, result);
  }

  /**
   * Update session statistics
   */
  private async updateSessionStats(
    invocation: ToolInvocation,
    result?: ReviewResult,
  ): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.totalOperations++;

    if (invocation.success) {
      this.currentSession.successfulOperations++;
    } else {
      this.currentSession.failedOperations++;
    }

    // Update average operation time
    const totalTime = this.currentSession.averageOperationTime *
        (this.currentSession.totalOperations - 1) + invocation.duration;
    this.currentSession.averageOperationTime = totalTime /
      this.currentSession.totalOperations;

    // Track tools used
    if (!this.currentSession.toolsUsed.includes(invocation.toolName)) {
      this.currentSession.toolsUsed.push(invocation.toolName);
    }

    // Track files reviewed
    if (invocation.arguments.file) {
      const filePath = await FilePathAnonymizer.anonymize(
        invocation.arguments.file as string,
        this.config,
      );
      if (!this.currentSession.filesReviewed.includes(filePath)) {
        this.currentSession.filesReviewed.push(filePath);
      }
    }

    // Track standards and methodologies
    if (result?.methodologyCompliance) {
      const methodology = result.methodologyCompliance.methodology;
      if (!this.currentSession.methodologiesValidated.includes(methodology)) {
        this.currentSession.methodologiesValidated.push(methodology);
      }
    }

    // Update findings statistics
    if (result) {
      this.currentSession.totalFindings += result.findings.length;

      for (const [severity, count] of Object.entries(result.summary)) {
        this.currentSession.findingsBySeverity[severity] += count;
      }
    }

    // Save updated session
    await this.storage.set(
      ["stats", "sessions", this.currentSession.sessionId],
      this.currentSession,
    );
  }

  /**
   * Update aggregated statistics
   */
  private async updateAggregatedStats(
    invocation: ToolInvocation,
    result?: ReviewResult,
  ): Promise<void> {
    // Update performance stats
    await this.updatePerformanceStats(invocation);

    // Update file analytics
    if (invocation.arguments.file) {
      await this.updateFileAnalytics(invocation, result);
    }

    // Update standards usage
    if (result) {
      await this.updateStandardsUsage(result);
    }
  }

  /**
   * Update performance statistics
   */
  private async updatePerformanceStats(
    invocation: ToolInvocation,
  ): Promise<void> {
    const key = ["stats", "performance", invocation.toolName];
    const existing = await this.storage.get<OperationPerformance>(key);

    const performance: OperationPerformance = existing || {
      operationType: invocation.toolName,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      successRate: 0,
      totalInvocations: 0,
      recentPerformance: [],
    };

    // Update metrics
    performance.totalInvocations++;
    performance.minDuration = Math.min(
      performance.minDuration,
      invocation.duration,
    );
    performance.maxDuration = Math.max(
      performance.maxDuration,
      invocation.duration,
    );

    // Update average duration
    const totalDuration = performance.averageDuration * (performance.totalInvocations - 1) +
      invocation.duration;
    performance.averageDuration = totalDuration / performance.totalInvocations;

    // Update success rate
    const successCount = performance.successRate * (performance.totalInvocations - 1) +
      (invocation.success ? 1 : 0);
    performance.successRate = successCount / performance.totalInvocations;

    // Update recent performance (keep last 50 entries)
    performance.recentPerformance.push({
      timestamp: invocation.timestamp,
      duration: invocation.duration,
      success: invocation.success,
    });

    if (performance.recentPerformance.length > 50) {
      performance.recentPerformance = performance.recentPerformance.slice(-50);
    }

    await this.storage.set(key, performance);
  }

  /**
   * Update file analytics
   */
  private async updateFileAnalytics(
    invocation: ToolInvocation,
    result?: ReviewResult,
  ): Promise<void> {
    const filePath = await FilePathAnonymizer.anonymize(
      invocation.arguments.file as string,
      this.config,
    );
    const key = ["stats", "files", filePath];
    const existing = await this.storage.get<FileAnalysis>(key);

    const fileAnalysis: FileAnalysis = existing || {
      filePath,
      fileType: FilePathAnonymizer.getFileType(
        invocation.arguments.file as string,
      ),
      fileSize: await this.getFileSize(invocation.arguments.file as string),
      reviewCount: 0,
      firstReviewed: invocation.timestamp,
      lastReviewed: invocation.timestamp,
      commonIssues: [],
      averageReviewTime: 0,
    };

    // Update metrics
    fileAnalysis.reviewCount++;
    fileAnalysis.lastReviewed = invocation.timestamp;

    // Update average review time
    const totalTime = fileAnalysis.averageReviewTime * (fileAnalysis.reviewCount - 1) +
      invocation.duration;
    fileAnalysis.averageReviewTime = totalTime / fileAnalysis.reviewCount;

    // Update common issues
    if (result?.findings) {
      for (const finding of result.findings) {
        const existingIssue = fileAnalysis.commonIssues.find((issue) =>
          issue.rule === finding.rule
        );
        if (existingIssue) {
          existingIssue.count++;
        } else {
          fileAnalysis.commonIssues.push({
            rule: finding.rule,
            severity: finding.severity,
            count: 1,
          });
        }
      }

      // Keep only top 10 most common issues
      fileAnalysis.commonIssues.sort((a, b) => b.count - a.count);
      fileAnalysis.commonIssues = fileAnalysis.commonIssues.slice(0, 10);
    }

    await this.storage.set(key, fileAnalysis);
  }

  /**
   * Update standards usage statistics
   */
  private async updateStandardsUsage(result: ReviewResult): Promise<void> {
    // This would need to be enhanced based on how standards are tracked in the result
    // For now, we'll use a simplified approach
    const standards = ["security", "style", "methodology"]; // Placeholder

    for (const standard of standards) {
      const key = ["stats", "standards", standard];
      const existing = await this.storage.get<StandardsUsage>(key);

      const standardsUsage: StandardsUsage = existing || {
        standardName: standard,
        usageCount: 0,
        averageComplianceScore: 0,
        lastUsed: new Date(),
        projectsUsed: [],
        commonViolations: [],
      };

      standardsUsage.usageCount++;
      standardsUsage.lastUsed = new Date();

      // Calculate compliance score based on findings
      const _totalFindings = result.findings.length;
      const severityWeights = {
        critical: 10,
        high: 5,
        medium: 3,
        low: 1,
        info: 0,
      };
      const totalSeverity = result.findings.reduce(
        (sum, finding) => sum + severityWeights[finding.severity],
        0,
      );
      const complianceScore = Math.max(0, 100 - totalSeverity);

      // Update average compliance score
      const totalScore = standardsUsage.averageComplianceScore *
          (standardsUsage.usageCount - 1) + complianceScore;
      standardsUsage.averageComplianceScore = totalScore /
        standardsUsage.usageCount;

      // Update common violations
      for (const finding of result.findings) {
        const existingViolation = standardsUsage.commonViolations.find((v) =>
          v.rule === finding.rule
        );
        if (existingViolation) {
          existingViolation.count++;
        } else {
          standardsUsage.commonViolations.push({
            rule: finding.rule,
            count: 1,
          });
        }
      }

      // Keep only top 10 most common violations
      standardsUsage.commonViolations.sort((a, b) => b.count - a.count);
      standardsUsage.commonViolations = standardsUsage.commonViolations.slice(
        0,
        10,
      );

      await this.storage.set(key, standardsUsage);
    }
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date();
    await this.storage.set(
      ["stats", "sessions", this.currentSession.sessionId],
      this.currentSession,
    );
    this.currentSession = null;
  }

  /**
   * Get file size with privacy considerations
   */
  private async getFileSize(filePath: string): Promise<number> {
    try {
      const stat = await Deno.stat(filePath);
      return stat.size;
    } catch {
      return 0;
    }
  }

  /**
   * Generate unique session ID
   */
  private async generateSessionId(): Promise<string> {
    const timestamp = Date.now().toString(36);
    const userId = await UserIdentifierAnonymizer.getAnonymousUserId(
      this.config,
    );
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${userId}-${random}`;
  }

  /**
   * Schedule periodic cleanup of old data
   */
  private scheduleCleanup(): void {
    const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours

    setInterval(async () => {
      await this.cleanup();
    }, cleanupInterval);
  }

  /**
   * Clean up old data based on retention settings
   */
  async cleanup(): Promise<void> {
    if (!this.config.enabled) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    const deletedCount = await this.storage.cleanup(cutoffDate);

    if (deletedCount > 0) {
      console.log(
        `🪴 [Aichaku] Cleaned up ${deletedCount} old statistics entries`,
      );
    }
  }

  /**
   * Close the statistics collector
   */
  async close(): Promise<void> {
    await this.endSession();
    await this.storage.close();
  }
}
