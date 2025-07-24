#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run
/**
 * MCP Code Reviewer Server
 *
 * Provides automated security and standards review for Claude Code
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  type CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { ReviewEngine } from "./review-engine.ts";
import { StandardsManager } from "./standards-manager.ts";
import { MethodologyManager } from "./methodology-manager.ts";
import { FeedbackBuilder } from "./feedback-builder.ts";
import { AichakuFormatter, ConsoleOutputManager } from "./feedback-system.ts";
import { feedbackSystem } from "./feedback/feedback-system.ts";
import type { ReviewRequest, ReviewResult } from "./types.ts";
import { existsSync } from "@std/fs/exists";
import { detectEnvironmentConfig, StatisticsManager } from "./statistics/mod.ts";
import { type AnalyzeProjectArgs, analyzeProjectTool } from "./tools/analyze-project.ts";
import { type GenerateDocumentationArgs, generateDocumentationTool } from "./tools/generate-documentation.ts";
import { type CreateDocTemplateArgs, createDocTemplateTool } from "./tools/create-doc-template.ts";
// Note: integrate command moved to main CLI

const PACKAGE_JSON = {
  name: "@aichaku/mcp-code-reviewer",
  version: "0.1.0",
  description: "MCP server for automated code review with Aichaku standards",
};

class MCPCodeReviewer {
  private server: Server;
  private reviewEngine: ReviewEngine;
  private standardsManager: StandardsManager;
  private methodologyManager: MethodologyManager;
  private feedbackBuilder: FeedbackBuilder;
  private statisticsManager: StatisticsManager;

  constructor() {
    this.server = new Server(
      {
        name: PACKAGE_JSON.name,
        version: PACKAGE_JSON.version,
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    // Initialize components
    this.reviewEngine = new ReviewEngine();
    this.standardsManager = new StandardsManager();
    this.methodologyManager = new MethodologyManager();
    this.feedbackBuilder = new FeedbackBuilder();
    this.statisticsManager = new StatisticsManager(detectEnvironmentConfig());

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: [
          {
            name: "review_file",
            description: "Review a file for security, standards, and methodology compliance",
            inputSchema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  description: "Path to the file to review",
                },
                content: {
                  type: "string",
                  description: "File content (optional, will read from disk if not provided)",
                },
                includeExternal: {
                  type: "boolean",
                  description: "Include external security scanners if available",
                  default: true,
                },
              },
              required: ["file"],
            },
          },
          {
            name: "review_methodology",
            description: "Check if project follows selected methodology patterns",
            inputSchema: {
              type: "object",
              properties: {
                projectPath: {
                  type: "string",
                  description: "Path to the project root",
                },
                methodology: {
                  type: "string",
                  description: "Methodology to check (e.g., shape-up, scrum)",
                },
              },
              required: ["projectPath"],
            },
          },
          {
            name: "get_standards",
            description: "Get currently selected standards for the project",
            inputSchema: {
              type: "object",
              properties: {
                projectPath: {
                  type: "string",
                  description: "Path to the project root",
                },
              },
              required: ["projectPath"],
            },
          },
          {
            name: "get_statistics",
            description: "Get usage statistics and analytics for MCP tool usage",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["dashboard", "realtime", "insights", "export"],
                  description: "Type of statistics to retrieve",
                  default: "dashboard",
                },
                format: {
                  type: "string",
                  enum: ["json", "csv"],
                  description: "Export format (only for type=export)",
                  default: "json",
                },
                question: {
                  type: "string",
                  description: "Specific question to answer about usage",
                },
              },
            },
          },
          analyzeProjectTool,
          generateDocumentationTool,
          createDocTemplateTool,
          {
            name: "send_feedback",
            description: "Send feedback message that appears visibly in Claude Code console",
            inputSchema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "The feedback message to display",
                },
                level: {
                  type: "string",
                  enum: ["info", "success", "warning", "error"],
                  description: "The feedback level/type",
                  default: "info",
                },
              },
              required: ["message"],
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const { name, arguments: args } = request.params;

        // Declare these outside try block so they're available in catch
        let operationId: string | undefined;
        let startTime = new Date();

        try {
          // Enhanced feedback for tool invocations using new system
          operationId = feedbackSystem.startOperation(name, args);
          startTime = new Date();

          switch (name) {
            case "review_file": {
              if (!args) {
                throw new Error("Arguments are required for review_file");
              }
              const result = await this.reviewFile(
                args as unknown as ReviewRequest,
                operationId,
              );

              // Record statistics
              await this.statisticsManager.recordInvocation(
                name,
                operationId,
                args as Record<string, unknown>,
                startTime,
                true,
                result,
              );

              return {
                content: [
                  {
                    type: "text",
                    text: feedbackSystem.formatResults(result),
                  },
                ],
              };
            }

            case "review_methodology": {
              if (!args) {
                throw new Error(
                  "Arguments are required for review_methodology",
                );
              }
              const result = await this.reviewMethodology(
                args.projectPath as string,
                args.methodology as string,
                operationId,
              );

              // Record statistics
              await this.statisticsManager.recordInvocation(
                name,
                operationId,
                args as Record<string, unknown>,
                startTime,
                true,
                result,
              );

              return {
                content: [
                  {
                    type: "text",
                    text: feedbackSystem.formatResults(result),
                  },
                ],
              };
            }

            case "get_standards": {
              if (!args) {
                throw new Error("Arguments are required for get_standards");
              }
              const standards = await this.standardsManager.getProjectStandards(
                args.projectPath as string,
              );

              // Record statistics
              await this.statisticsManager.recordInvocation(
                name,
                operationId,
                args as Record<string, unknown>,
                startTime,
                true,
              );

              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(standards, null, 2),
                  },
                ],
              };
            }

            case "analyze_project": {
              if (!args) {
                throw new Error("Arguments are required for analyze_project");
              }
              const result = await analyzeProjectTool.execute(
                args as unknown as AnalyzeProjectArgs,
              );

              // Record statistics
              await this.statisticsManager.recordInvocation(
                name,
                operationId,
                args as Record<string, unknown>,
                startTime,
                result.success,
                undefined, // AnalyzeProjectResult is not compatible with ReviewResult
              );

              return {
                content: [
                  {
                    type: "text",
                    text: result.success ? JSON.stringify(result.analysis, null, 2) : `Error: ${result.error}`,
                  },
                ],
              };
            }

            case "generate_documentation": {
              if (!args) {
                throw new Error(
                  "Arguments are required for generate_documentation",
                );
              }
              const result = await generateDocumentationTool.execute(
                args as unknown as GenerateDocumentationArgs,
              );

              // Record statistics
              await this.statisticsManager.recordInvocation(
                name,
                operationId,
                args as Record<string, unknown>,
                startTime,
                result.success,
                undefined, // GenerateDocumentationResult is not compatible with ReviewResult
              );

              if (result.success) {
                const summary = [
                  `✅ Successfully generated documentation`,
                  `📁 Output path: ${result.outputPath}`,
                  `📄 Generated ${result.generatedFiles?.length || 0} files`,
                  ``,
                  `Next steps:`,
                  ...(result.nextSteps || []).map((step) => `  - ${step}`),
                ].join("\n");

                return {
                  content: [
                    {
                      type: "text",
                      text: summary,
                    },
                  ],
                };
              } else {
                return {
                  content: [
                    {
                      type: "text",
                      text: `❌ Error: ${result.error}`,
                    },
                  ],
                };
              }
            }

            case "create_doc_template": {
              if (!args) {
                throw new Error(
                  "Arguments are required for create_doc_template",
                );
              }
              const result = await createDocTemplateTool.execute(
                args as unknown as CreateDocTemplateArgs,
              );

              // Record statistics
              await this.statisticsManager.recordInvocation(
                name,
                operationId,
                args as Record<string, unknown>,
                startTime,
                result.success,
                undefined, // CreateDocTemplateResult is not compatible with ReviewResult
              );

              if (result.success) {
                return {
                  content: [
                    {
                      type: "text",
                      text: `✅ Created template at: ${result.filePath}`,
                    },
                  ],
                };
              } else {
                return {
                  content: [
                    {
                      type: "text",
                      text: `❌ Error: ${result.error}`,
                    },
                  ],
                };
              }
            }

            case "get_statistics": {
              const type = (args?.type as string) || "dashboard";
              const format = (args?.format as string) || "json";
              const question = args?.question as string;

              let result: string;

              switch (type) {
                case "dashboard":
                  result = await this.statisticsManager.generateDashboard();
                  break;
                case "realtime":
                  result = await this.statisticsManager.getRealTimeStats();
                  break;
                case "insights":
                  result = await this.statisticsManager.getInsights();
                  break;
                case "export":
                  result = await this.statisticsManager.exportData(
                    format as "json" | "csv",
                  );
                  break;
                default:
                  if (question) {
                    result = await this.statisticsManager.answerQuestion(
                      question,
                    );
                  } else {
                    result = await this.statisticsManager.generateDashboard();
                  }
              }

              // Record statistics for this operation too
              await this.statisticsManager.recordInvocation(
                name,
                operationId,
                args as Record<string, unknown>,
                startTime,
                true,
              );

              return {
                content: [
                  {
                    type: "text",
                    text: result,
                  },
                ],
              };
            }

            // Note: integrate_aichaku has been moved to the main CLI

            case "send_feedback": {
              if (!args) {
                throw new Error("Arguments are required for send_feedback");
              }

              const message = args.message as string;
              const level = (args.level as string) || "info";

              // Validate level
              const validLevels = ["info", "success", "warning", "error"];
              if (!validLevels.includes(level)) {
                throw new Error(
                  `Invalid feedback level: ${level}. Must be one of: ${validLevels.join(", ")}`,
                );
              }

              // Format the feedback message with appropriate emoji/icon
              let icon = "ℹ️";
              switch (level) {
                case "success":
                  icon = "✅";
                  break;
                case "warning":
                  icon = "⚠️";
                  break;
                case "error":
                  icon = "❌";
                  break;
                case "info":
                default:
                  icon = "ℹ️";
                  break;
              }

              const formattedMessage = `${icon} [${level.toUpperCase()}] ${message}`;

              // Record statistics
              await this.statisticsManager.recordInvocation(
                name,
                operationId,
                args as Record<string, unknown>,
                startTime,
                true,
              );

              // Return the message as visible content that will appear in Claude Code
              return {
                content: [
                  {
                    type: "text",
                    text: formattedMessage,
                  },
                ],
              };
            }

            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        } catch (error) {
          const errorOperationId = operationId || `${name}-error`;
          const errorStartTime = startTime || new Date();

          feedbackSystem.reportError(
            errorOperationId,
            error instanceof Error ? error : new Error(String(error)),
          );

          // Record failed operation statistics
          await this.statisticsManager.recordInvocation(
            name,
            errorOperationId,
            args as Record<string, unknown> || {},
            errorStartTime,
            false,
            undefined,
            error instanceof Error ? error : new Error(String(error)),
          );

          return {
            content: [
              {
                type: "text",
                text: `${
                  AichakuFormatter.formatBrandedMessage(
                    "❌",
                    `Error: ${error instanceof Error ? error.message : String(error)}`,
                  )
                }`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  private async reviewFile(
    request: ReviewRequest,
    operationId?: string,
  ): Promise<ReviewResult> {
    // Load standards and methodologies for the project
    const projectPath = this.getProjectPath(request.file);
    const standards = await this.standardsManager.getProjectStandards(
      projectPath,
    );
    const methodologies = await this.methodologyManager.getProjectMethodologies(
      projectPath,
    );

    // Enhanced feedback for standards and methodologies using new system
    feedbackSystem.showStandardsLoaded(standards.selected);
    if (methodologies.length > 0) {
      methodologies.forEach((m) => feedbackSystem.showMethodologyCheck(m));
    }

    if (operationId) {
      feedbackSystem.updateProgress(
        operationId,
        "analyzing",
        "Running security and standards checks",
      );
    }

    // Run the review
    const result = await this.reviewEngine.review({
      ...request,
      standards: request.standards || standards.selected,
      methodologies: request.methodologies || methodologies,
    });

    // Add educational feedback if issues found
    if (result.findings.length > 0) {
      result.claudeGuidance = this.feedbackBuilder.buildGuidance(result);
    }

    if (operationId) {
      feedbackSystem.completeOperation(operationId, result);
    }

    return result;
  }

  private async reviewMethodology(
    projectPath: string,
    methodology?: string,
    operationId?: string,
  ): Promise<ReviewResult> {
    const methodologies = methodology
      ? [methodology]
      : await this.methodologyManager.getProjectMethodologies(projectPath);

    if (operationId) {
      feedbackSystem.updateProgress(
        operationId,
        "checking methodology",
        methodologies.join(", "),
      );
    }

    const findings = await this.methodologyManager.checkCompliance(
      projectPath,
      methodologies,
    );

    const result = {
      file: projectPath,
      findings,
      summary: this.summarizeFindings(findings),
      methodologyCompliance: {
        methodology: methodologies.join(", "),
        status:
          (findings.length === 0
            ? "passed"
            : findings.some((f) => f.severity === "critical")
            ? "failed"
            : "warnings") as "passed" | "warnings" | "failed",
        details: findings.map((f) => f.message),
      },
    };

    if (operationId) {
      feedbackSystem.completeOperation(operationId, result);
    }

    return result;
  }

  private summarizeFindings(findings: Finding[]): ReviewResult["summary"] {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const finding of findings) {
      summary[finding.severity]++;
    }

    return summary;
  }

  private getProjectPath(filePath: string): string {
    // Walk up to find .claude directory or git root
    let current = filePath;
    while (current !== "/") {
      // Security: Use existsSync for safe path checking
      try {
        const stat = Deno.statSync(current);
        if (stat.isDirectory) {
          if (existsSync(`${current}/.claude`)) {
            return current;
          }
          if (existsSync(`${current}/.git`)) {
            return current;
          }
        }
      } catch {
        // Path doesn't exist or not accessible, continue
      }

      const parent = current.split("/").slice(0, -1).join("/");
      if (parent === current) break;
      current = parent;
    }

    return ".";
  }

  async start() {
    const transport = new StdioServerTransport();

    // Initialize statistics manager
    await this.statisticsManager.init();

    // Show startup banner using new feedback system
    feedbackSystem.showStartupBanner();

    await this.server.connect(transport);

    // Additional startup feedback for backward compatibility
    ConsoleOutputManager.formatServerStartup();
  }
}

// Import type fix
import type { Finding } from "./types.ts";

// Start the server
if (import.meta.main) {
  const server = new MCPCodeReviewer();
  await server.start();
}
