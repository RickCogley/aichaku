/**
 * Statistics module exports
 * Provides comprehensive statistics tracking and reporting for MCP tool usage
 */

export * from "./types.ts";
export * from "./storage.ts";
export * from "./privacy.ts";
export * from "./collector.ts";
export * from "./reporter.ts";
export * from "./manager.ts";

import { getStatsManager } from "./manager.ts";

// Configuration utilities
export { DEFAULT_CONFIG } from "./types.ts";
export { createStorage } from "./storage.ts";

// Main interfaces
export { closeGlobalStats, getStatsManager, initGlobalStats, StatisticsManager } from "./manager.ts";

// Privacy utilities
export { DataSanitizer, FilePathAnonymizer, UserIdentifierAnonymizer } from "./privacy.ts";

/**
 * Create a statistics manager with custom configuration
 */
export async function createStatisticsManager(
  config: Partial<import("./types.ts").StatisticsConfig> = {},
) {
  const { DEFAULT_CONFIG } = await import("./types.ts");
  const { StatisticsManager } = await import("./manager.ts");

  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  return new StatisticsManager(fullConfig);
}

/**
 * Quick setup for common configurations
 */
export const StatisticsPresets = {
  // Development preset - full featured, short retention
  development: {
    enabled: true,
    retentionDays: 7,
    privacy: {
      anonymizeFilePaths: false,
      excludeFileContents: true,
      hashUserIdentifiers: false,
    },
    reporting: {
      enableDailyReports: true,
      enableWeeklyReports: true,
      enableRealtimeMetrics: true,
    },
    storage: {
      type: "json" as const,
      location: "/tmp/aichaku-dev-stats.json",
    },
  },

  // Production preset - privacy-focused, longer retention
  production: {
    enabled: true,
    retentionDays: 30,
    privacy: {
      anonymizeFilePaths: true,
      excludeFileContents: true,
      hashUserIdentifiers: true,
    },
    reporting: {
      enableDailyReports: false,
      enableWeeklyReports: true,
      enableRealtimeMetrics: false,
    },
    storage: {
      type: "deno-kv" as const,
      compression: true,
    },
  },

  // Team preset - balanced approach for team environments
  team: {
    enabled: true,
    retentionDays: 14,
    privacy: {
      anonymizeFilePaths: true,
      excludeFileContents: true,
      hashUserIdentifiers: true,
    },
    reporting: {
      enableDailyReports: true,
      enableWeeklyReports: true,
      enableRealtimeMetrics: true,
    },
    storage: {
      type: "deno-kv" as const,
      location: "~/.aichaku/stats.db",
    },
  },

  // Minimal preset - basic tracking only
  minimal: {
    enabled: true,
    retentionDays: 3,
    privacy: {
      anonymizeFilePaths: true,
      excludeFileContents: true,
      hashUserIdentifiers: true,
    },
    reporting: {
      enableDailyReports: false,
      enableWeeklyReports: false,
      enableRealtimeMetrics: false,
    },
    storage: {
      type: "memory" as const,
    },
  },

  // Disabled preset - no tracking
  disabled: {
    enabled: false,
    retentionDays: 0,
    privacy: {
      anonymizeFilePaths: true,
      excludeFileContents: true,
      hashUserIdentifiers: true,
    },
    reporting: {
      enableDailyReports: false,
      enableWeeklyReports: false,
      enableRealtimeMetrics: false,
    },
    storage: {
      type: "memory" as const,
    },
  },
} as const;

/**
 * Environment-based configuration detection
 */
export function detectEnvironmentConfig(): import("./types.ts").StatisticsConfig {
  const env = Deno.env.get("AICHAKU_ENV") || "development";
  const preset = StatisticsPresets[env as keyof typeof StatisticsPresets] ||
    StatisticsPresets.development;

  return preset;
}

/**
 * CLI helper functions
 */
export const StatisticsCLI = {
  /**
   * Generate a simple usage report
   */
  async generateUsageReport(): Promise<string> {
    const manager = getStatsManager();
    return await manager.generateDashboard();
  },

  /**
   * Answer a question about usage
   */
  async askQuestion(question: string): Promise<string> {
    const manager = getStatsManager();
    return await manager.answerQuestion(question);
  },

  /**
   * Export data in different formats
   */
  async exportData(format: "json" | "csv" = "json"): Promise<string> {
    const manager = getStatsManager();
    return await manager.exportData(format);
  },

  /**
   * Get real-time statistics
   */
  async getRealTimeStats(): Promise<string> {
    const manager = getStatsManager();
    return await manager.getRealTimeStats();
  },

  /**
   * Clean up old data
   */
  async cleanup(): Promise<string> {
    const manager = getStatsManager();
    return await manager.cleanup();
  },

  /**
   * Get usage insights
   */
  async getInsights(): Promise<string> {
    const manager = getStatsManager();
    return await manager.getInsights();
  },
};
