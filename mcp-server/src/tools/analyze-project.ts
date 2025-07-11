/**
 * Analyze Project Tool
 *
 * MCP tool for analyzing project structure and characteristics
 */

import {
  type ProjectAnalysis,
  ProjectAnalyzer,
} from "../analysis/project-analyzer.ts";
import { feedbackSystem } from "../feedback/feedback-system.ts";
import { validatePath } from "../../../src/utils/path-security.ts";
import { existsSync } from "@std/fs/exists";
import { resolve } from "@std/path";

export interface AnalyzeProjectArgs {
  projectPath: string;
  detailed?: boolean;
}

export interface AnalyzeProjectResult {
  success: boolean;
  analysis?: ProjectAnalysis;
  error?: string;
}

export const analyzeProjectTool = {
  name: "analyze_project",
  description:
    "Analyze project structure, languages, architecture, and dependencies",
  inputSchema: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to the project directory to analyze",
      },
      detailed: {
        type: "boolean",
        description: "Include detailed analysis of files and components",
        default: true,
      },
    },
    required: ["projectPath"],
  },

  async execute(args: AnalyzeProjectArgs): Promise<AnalyzeProjectResult> {
    const operationId = feedbackSystem.startOperation(
      "analyze_project",
      args as unknown as Record<string, unknown>,
    );

    try {
      // Validate and resolve path
      const resolvedPath = resolve(args.projectPath);
      try {
        validatePath(resolvedPath, Deno.cwd());
      } catch (error) {
        throw new Error(
          `Invalid project path: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      if (!existsSync(resolvedPath)) {
        throw new Error(`Project path does not exist: ${resolvedPath}`);
      }

      feedbackSystem.updateProgress(
        operationId,
        "analyzing",
        `Analyzing project at ${resolvedPath}`,
      );

      // Create analyzer and run analysis
      const analyzer = new ProjectAnalyzer();
      const analysis = await analyzer.analyze(resolvedPath);

      // Format analysis summary
      const summary = formatAnalysisSummary(analysis);

      feedbackSystem.updateProgress(operationId, "complete", summary);
      feedbackSystem.completeOperation(operationId, {
        file: args.projectPath,
        findings: [],
        summary: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        },
        analysis,
      });

      return {
        success: true,
        analysis,
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      feedbackSystem.reportError(operationId, new Error(errorMessage));

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

function formatAnalysisSummary(analysis: ProjectAnalysis): string {
  const { type, languages, architecture, apiEndpoints, testFiles } = analysis;

  const parts = [
    `Project type: ${type}`,
    `Primary language: ${languages[0]?.language || "Unknown"} (${
      languages[0]?.percentage || 0
    }%)`,
  ];

  if (architecture.pattern) {
    parts.push(`Architecture: ${architecture.pattern}`);
  }

  if (apiEndpoints.length > 0) {
    parts.push(`API endpoints: ${apiEndpoints.length}`);
  }

  if (testFiles.length > 0) {
    parts.push(`Test files: ${testFiles.length}`);
  }

  return parts.join(", ");
}
