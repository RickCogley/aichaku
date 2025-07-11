/**
 * Main Feedback System for Aichaku MCP
 *
 * Integrates all feedback components to provide cohesive, progressive feedback
 * to Claude Code during MCP operations.
 */

import { ProgressManager } from "./progress-manager.ts";
import { AichakuFormatter } from "./aichaku-formatter.ts";
import type { ReviewResult } from "../types.ts";

export class FeedbackSystem {
  private progressManager: ProgressManager;
  private formatter: AichakuFormatter;

  constructor() {
    this.progressManager = new ProgressManager();
    this.formatter = new AichakuFormatter();
  }

  /**
   * Start a new operation with progressive feedback
   */
  startOperation(
    operationType: string,
    context?: Record<string, unknown>,
  ): string {
    // Extract meaningful context
    const contextStr = this.extractContext(operationType, context);

    // Start progress tracking
    const operationId = this.progressManager.startOperation(
      operationType,
      contextStr,
    );

    // Additional startup feedback based on operation type
    this.showOperationSpecificFeedback(operationType, context);

    return operationId;
  }

  /**
   * Update operation progress
   */
  updateProgress(operationId: string, phase: string, details?: string): void {
    this.progressManager.updateProgress(operationId, phase, details);
  }

  /**
   * Complete an operation with results
   */
  completeOperation(operationId: string, result?: ReviewResult): void {
    // Complete progress tracking
    this.progressManager.completeOperation(operationId, true);

    // Show result summary if available
    if (result) {
      this.showResultSummary(result);
    }
  }

  /**
   * Report an operation error
   */
  reportError(operationId: string, error: Error): void {
    this.progressManager.reportError(operationId, error);
  }

  /**
   * Format review results for display
   */
  formatResults(result: ReviewResult): string {
    return this.formatter.formatReviewResults(result);
  }

  /**
   * Show server startup banner
   */
  showStartupBanner(): void {
    console.error(this.formatter.createBanner());
    console.error(this.formatter.formatStartupMessage());
    console.error(this.formatter.formatCapabilities());
  }

  /**
   * Show standards loaded message
   */
  showStandardsLoaded(standards: string[]): void {
    console.error(this.formatter.formatStandardsLoaded(standards));
  }

  /**
   * Show methodology check message
   */
  showMethodologyCheck(methodology: string): void {
    console.error(this.formatter.formatMethodologyCheck(methodology));
  }

  /**
   * Show external scanner status
   */
  showExternalScanners(
    scanners: Array<{ name: string; active: boolean }>,
  ): void {
    console.error(this.formatter.formatExternalScanners(scanners));
  }

  // Private helper methods

  private extractContext(
    operationType: string,
    context?: Record<string, unknown>,
  ): string | undefined {
    if (!context) return undefined;

    switch (operationType) {
      case "review_file":
        return (context.file as string) || (context.path as string) ||
          undefined;
      case "review_methodology":
        return (context.methodology as string) ||
          (context.projectPath as string) || undefined;
      case "get_standards":
        return context.projectPath as string || undefined;
      default:
        return (context.name as string) || (context.path as string) ||
          (context.file as string) || undefined;
    }
  }

  private showOperationSpecificFeedback(
    operationType: string,
    context?: Record<string, unknown>,
  ): void {
    switch (operationType) {
      case "review_file":
        if (context?.includeExternal) {
          console.error(this.formatter.formatExternalScannersEnabled());
        }
        break;

      case "review_methodology":
        if (context?.methodology) {
          this.showMethodologyCheck(context.methodology as string);
        }
        break;
    }
  }

  private showResultSummary(result: ReviewResult): void {
    const summary = this.formatter.formatResultSummary(result);
    console.error(summary);
  }
}

// Export singleton instance for convenience
export const feedbackSystem = new FeedbackSystem();
