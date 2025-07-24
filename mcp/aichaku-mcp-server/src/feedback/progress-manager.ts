/**
 * Progress Manager - Handles progressive disclosure timing for Aichaku MCP
 *
 * Implements the exact timing thresholds from specifications:
 * - 0ms: Immediate feedback
 * - 1.5s: Progress indicators
 * - 2s: Detailed updates
 * - 3s: Timing information
 */

import { AICHAKU_BRANDING } from "../feedback-system.ts";

export interface ProgressConfig {
  immediate: number; // 0ms
  progress: number; // 1500ms
  detailed: number; // 2000ms
  timing: number; // 3000ms
}

export const DEFAULT_PROGRESS_CONFIG: ProgressConfig = {
  immediate: 0,
  progress: 1500,
  detailed: 2000,
  timing: 3000,
};

export interface ProgressState {
  operationId: string;
  operationType: string;
  startTime: number;
  currentPhase: string;
  details?: string;
  context?: string;
  progressTimer?: number;
  detailedTimer?: number;
  timingTimer?: number;
}

export class ProgressManager {
  private states: Map<string, ProgressState> = new Map();
  private config: ProgressConfig;
  private operationCounter = 0;

  constructor(config: ProgressConfig = DEFAULT_PROGRESS_CONFIG) {
    this.config = config;
  }

  /**
   * Start tracking a new operation with progressive disclosure
   */
  startOperation(operationType: string, context?: string): string {
    const operationId = `${operationType}-${++this
      .operationCounter}-${Date.now()}`;

    const state: ProgressState = {
      operationId,
      operationType,
      startTime: Date.now(),
      currentPhase: "initializing",
      context,
    };

    this.states.set(operationId, state);

    // Immediate feedback (0ms)
    this.showImmediateFeedback(state);

    // Schedule progressive disclosure
    this.scheduleProgressiveFeedback(state);

    return operationId;
  }

  /**
   * Update the progress of an operation
   */
  updateProgress(operationId: string, phase: string, details?: string): void {
    const state = this.states.get(operationId);
    if (!state) return;

    state.currentPhase = phase;
    state.details = details;

    const elapsed = Date.now() - state.startTime;

    // Show updates based on elapsed time
    if (elapsed >= this.config.detailed) {
      this.showDetailedUpdate(state);
    }
  }

  /**
   * Complete an operation and clean up
   */
  completeOperation(operationId: string, success: boolean = true): void {
    const state = this.states.get(operationId);
    if (!state) return;

    const elapsed = Date.now() - state.startTime;

    // Clear any pending timers
    this.clearTimers(state);

    // Show completion feedback
    this.showCompletionFeedback(state, elapsed, success);

    // Clean up
    this.states.delete(operationId);
  }

  /**
   * Report an error and clean up
   */
  reportError(operationId: string, error: Error): void {
    const state = this.states.get(operationId);
    if (!state) return;

    // Clear timers
    this.clearTimers(state);

    // Show error feedback
    console.error(
      `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${AICHAKU_BRANDING.ACTIVITIES.ERROR} ` +
        `Operation failed: ${error.message}`,
    );

    // Clean up
    this.states.delete(operationId);
  }

  // Private methods for progressive disclosure

  private showImmediateFeedback(state: ProgressState): void {
    // 0ms - Immediate acknowledgment
    const icon = this.getOperationIcon(state.operationType);
    console.error(
      `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${icon} ` +
        `Tool invoked: ${state.operationType}`,
    );

    if (state.context) {
      console.error(
        `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${AICHAKU_BRANDING.ACTIVITIES.ANALYZING} ` +
          `Processing: ${state.context}`,
      );
    }
  }

  private scheduleProgressiveFeedback(state: ProgressState): void {
    // 1.5s - Show progress indicator
    state.progressTimer = setTimeout(() => {
      if (this.states.has(state.operationId)) {
        this.showProgressIndicator(state);
      }
    }, this.config.progress) as unknown as number;

    // 2s - Show detailed updates
    state.detailedTimer = setTimeout(() => {
      if (this.states.has(state.operationId)) {
        this.showDetailedUpdate(state);
      }
    }, this.config.detailed) as unknown as number;

    // 3s - Show timing information
    state.timingTimer = setTimeout(() => {
      if (this.states.has(state.operationId)) {
        this.showTimingInfo(state);
      }
    }, this.config.timing) as unknown as number;
  }

  private showProgressIndicator(state: ProgressState): void {
    const elapsed = Date.now() - state.startTime;
    const phase = this.getPhaseIcon(elapsed);

    console.error(
      `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${phase} ` +
        `${state.currentPhase} ${this.generateProgressBar(elapsed)}`,
    );
  }

  private showDetailedUpdate(state: ProgressState): void {
    const message = state.details ? `${state.currentPhase} - ${state.details}` : state.currentPhase;

    console.error(
      `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${AICHAKU_BRANDING.PHASES.GROWING} ` +
        message,
    );
  }

  private showTimingInfo(state: ProgressState): void {
    const elapsed = Date.now() - state.startTime;
    console.error(
      `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${AICHAKU_BRANDING.PHASES.MATURE} ` +
        `Still processing... (${(elapsed / 1000).toFixed(1)}s elapsed)`,
    );
  }

  private showCompletionFeedback(
    _state: ProgressState,
    elapsed: number,
    success: boolean,
  ): void {
    const icon = success ? AICHAKU_BRANDING.ACTIVITIES.SUCCESS : AICHAKU_BRANDING.ACTIVITIES.WARNING;
    const phase = success ? AICHAKU_BRANDING.PHASES.HARVEST : AICHAKU_BRANDING.PHASES.HARVEST;

    // Always show completion
    console.error(
      `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${icon} ` +
        `Operation completed${success ? " successfully" : " with warnings"}`,
    );

    // Show timing only if it took more than 3s
    if (elapsed >= this.config.timing) {
      console.error(
        `${AICHAKU_BRANDING.ICON} [${AICHAKU_BRANDING.NAME}] ${phase} ` +
          `Completed in ${(elapsed / 1000).toFixed(1)}s`,
      );
    }
  }

  private clearTimers(state: ProgressState): void {
    if (state.progressTimer) clearTimeout(state.progressTimer);
    if (state.detailedTimer) clearTimeout(state.detailedTimer);
    if (state.timingTimer) clearTimeout(state.timingTimer);
  }

  private getOperationIcon(operationType: string): string {
    switch (operationType) {
      case "review_file":
        return AICHAKU_BRANDING.ACTIVITIES.SCANNING;
      case "review_methodology":
        return AICHAKU_BRANDING.ACTIVITIES.VALIDATING;
      case "get_standards":
        return AICHAKU_BRANDING.ACTIVITIES.LEARNING;
      default:
        return AICHAKU_BRANDING.ACTIVITIES.ANALYZING;
    }
  }

  private getPhaseIcon(elapsed: number): string {
    if (elapsed < 1000) return AICHAKU_BRANDING.PHASES.SEED;
    if (elapsed < 2000) return AICHAKU_BRANDING.PHASES.GROWING;
    if (elapsed < 3000) return AICHAKU_BRANDING.PHASES.BLOOMING;
    return AICHAKU_BRANDING.PHASES.MATURE;
  }

  private generateProgressBar(elapsed: number): string {
    // Estimate progress based on typical operation time
    const estimatedDuration = 2500; // Average operation time
    const progress = Math.min(elapsed / estimatedDuration, 0.95);

    const length = 10;
    const filled = Math.round(progress * length);
    const empty = length - filled;

    return `${"█".repeat(filled)}${"░".repeat(empty)} ${Math.round(progress * 100)}%`;
  }
}
