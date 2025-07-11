/**
 * Statistics tracking types for MCP tool usage
 */

export interface ToolInvocation {
  toolName: string;
  timestamp: Date;
  duration: number; // milliseconds
  success: boolean;
  arguments: Record<string, unknown>;
  resultSummary?: {
    findingsCount?: number;
    severity?: Record<string, number>;
    fileType?: string;
    fileSize?: number;
  };
  sessionId: string;
  operationId: string;
}

export interface FileAnalysis {
  filePath: string;
  fileType: string;
  fileSize: number;
  reviewCount: number;
  firstReviewed: Date;
  lastReviewed: Date;
  commonIssues: Array<{
    rule: string;
    severity: string;
    count: number;
  }>;
  averageReviewTime: number;
}

export interface StandardsUsage {
  standardName: string;
  usageCount: number;
  averageComplianceScore: number;
  lastUsed: Date;
  projectsUsed: string[];
  commonViolations: Array<{
    rule: string;
    count: number;
  }>;
}

export interface SessionStatistics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageOperationTime: number;
  toolsUsed: string[];
  filesReviewed: string[];
  standardsChecked: string[];
  methodologiesValidated: string[];
  totalFindings: number;
  findingsBySeverity: Record<string, number>;
}

export interface OperationPerformance {
  operationType: string;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  totalInvocations: number;
  recentPerformance: Array<{
    timestamp: Date;
    duration: number;
    success: boolean;
  }>;
}

export interface StatisticsReport {
  generatedAt: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSessions: number;
    totalOperations: number;
    averageSessionDuration: number;
    overallSuccessRate: number;
    mostUsedTool: string;
    mostReviewedFileType: string;
    mostUsedStandard: string;
  };
  toolUsage: Array<{
    toolName: string;
    usageCount: number;
    successRate: number;
    averageDuration: number;
  }>;
  fileAnalytics: Array<{
    fileType: string;
    reviewCount: number;
    averageIssues: number;
    topIssues: string[];
  }>;
  standardsCompliance: Array<{
    standard: string;
    usageCount: number;
    averageScore: number;
    improvement: number; // percentage change
  }>;
  performanceTrends: Array<{
    date: string;
    averageResponseTime: number;
    successRate: number;
    operationCount: number;
  }>;
  recommendations: string[];
}

export interface StatisticsConfig {
  enabled: boolean;
  retentionDays: number;
  privacy: {
    anonymizeFilePaths: boolean;
    excludeFileContents: boolean;
    hashUserIdentifiers: boolean;
  };
  reporting: {
    enableDailyReports: boolean;
    enableWeeklyReports: boolean;
    enableRealtimeMetrics: boolean;
  };
  storage: {
    type: "deno-kv" | "json" | "memory";
    location?: string;
    compression?: boolean;
  };
}

// Storage keys for Deno KV
export const STORAGE_KEYS = {
  CONFIG: ["stats", "config"],
  SESSIONS: ["stats", "sessions"],
  TOOL_INVOCATIONS: ["stats", "invocations"],
  FILE_ANALYTICS: ["stats", "files"],
  STANDARDS_USAGE: ["stats", "standards"],
  PERFORMANCE: ["stats", "performance"],
  REPORTS: ["stats", "reports"],
} as const;

// Default configuration
export const DEFAULT_CONFIG: StatisticsConfig = {
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
    enableRealtimeMetrics: true,
  },
  storage: {
    type: "deno-kv",
    compression: true,
  },
};
