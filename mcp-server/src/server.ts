#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run
/**
 * MCP Code Reviewer Server
 *
 * Provides automated security and standards review for Claude Code
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { ReviewEngine } from "./review-engine.ts";
import { StandardsManager } from "./standards-manager.ts";
import { MethodologyManager } from "./methodology-manager.ts";
import { FeedbackBuilder } from "./feedback-builder.ts";
import type { ReviewRequest, ReviewResult } from "./types.ts";

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

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: [
          {
            name: "review_file",
            description:
              "Review a file for security, standards, and methodology compliance",
            inputSchema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  description: "Path to the file to review",
                },
                content: {
                  type: "string",
                  description:
                    "File content (optional, will read from disk if not provided)",
                },
                includeExternal: {
                  type: "boolean",
                  description:
                    "Include external security scanners if available",
                  default: true,
                },
              },
              required: ["file"],
            },
          },
          {
            name: "review_methodology",
            description:
              "Check if project follows selected methodology patterns",
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
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "review_file": {
            if (!args) {
              throw new Error("Arguments are required for review_file");
            }
            const result = await this.reviewFile(
              args as unknown as ReviewRequest,
            );
            return {
              content: [
                {
                  type: "text",
                  text: this.formatReviewResult(result),
                },
              ],
            };
          }

          case "review_methodology": {
            if (!args) {
              throw new Error("Arguments are required for review_methodology");
            }
            const result = await this.reviewMethodology(
              args.projectPath as string,
              args.methodology as string,
            );
            return {
              content: [
                {
                  type: "text",
                  text: this.formatMethodologyResult(result),
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
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(standards, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async reviewFile(request: ReviewRequest): Promise<ReviewResult> {
    // Load standards and methodologies for the project
    const projectPath = this.getProjectPath(request.file);
    const standards = await this.standardsManager.getProjectStandards(
      projectPath,
    );
    const methodologies = await this.methodologyManager.getProjectMethodologies(
      projectPath,
    );

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

    return result;
  }

  private async reviewMethodology(
    projectPath: string,
    methodology?: string,
  ): Promise<ReviewResult> {
    const methodologies = methodology
      ? [methodology]
      : await this.methodologyManager.getProjectMethodologies(projectPath);

    const findings = await this.methodologyManager.checkCompliance(
      projectPath,
      methodologies,
    );

    return {
      file: projectPath,
      findings,
      summary: this.summarizeFindings(findings),
      methodologyCompliance: {
        methodology: methodologies.join(", "),
        status: findings.length === 0
          ? "passed"
          : findings.some((f) => f.severity === "critical")
          ? "failed"
          : "warnings",
        details: findings.map((f) => f.message),
      },
    };
  }

  private formatReviewResult(result: ReviewResult): string {
    let output = `🪴 Aichaku Code Review Results\n\n`;
    output += `📄 File: ${result.file}\n`;
    output += `📊 Summary: ${this.formatSummary(result.summary)}\n\n`;

    if (result.findings.length === 0) {
      output += `✅ No issues found! Great job following the standards.\n`;
      return output;
    }

    // Group findings by severity
    const grouped = this.groupBySeverity(result.findings);

    for (const [severity, findings] of Object.entries(grouped)) {
      if (findings.length === 0) continue;

      output += `\n${
        this.getSeverityIcon(severity as Severity)
      } ${severity.toUpperCase()} (${findings.length})\n`;
      output += `${"-".repeat(40)}\n`;

      for (const finding of findings) {
        output += `  • Line ${finding.line}: ${finding.message}\n`;
        output += `    Rule: ${finding.rule}`;
        if (finding.category) output += ` | Category: ${finding.category}`;
        output += `\n`;
        if (finding.suggestion) {
          output += `    💡 Suggestion: ${finding.suggestion}\n`;
        }
        output += `\n`;
      }
    }

    // Add educational feedback
    if (result.claudeGuidance) {
      output += `\n🌱 Learning Opportunity\n`;
      output += `${"-".repeat(40)}\n`;
      output += this.formatGuidance(result.claudeGuidance);
    }

    return output;
  }

  private formatMethodologyResult(result: ReviewResult): string {
    let output = `🪴 Aichaku Methodology Review\n\n`;

    if (result.methodologyCompliance) {
      const { methodology, status, details } = result.methodologyCompliance;
      const icon = status === "passed"
        ? "✅"
        : status === "warnings"
        ? "⚠️"
        : "❌";

      output += `📋 Methodology: ${methodology}\n`;
      output += `${icon} Status: ${status}\n\n`;

      if (details.length > 0) {
        output += `Details:\n`;
        for (const detail of details) {
          output += `  • ${detail}\n`;
        }
      }
    }

    return output;
  }

  private formatGuidance(guidance: ClaudeGuidance): string {
    let output = "";

    if (guidance.context) {
      output += `📖 Context: ${guidance.context}\n\n`;
    }

    output += `⚠️ Issue: ${guidance.pattern}\n`;
    output += `📌 Reminder: ${guidance.reminder}\n\n`;

    if (guidance.badExample && guidance.goodExample) {
      output += `❌ Bad Example:\n${guidance.badExample}\n\n`;
      output += `✅ Good Example:\n${guidance.goodExample}\n\n`;
    }

    if (guidance.stepByStep && guidance.stepByStep.length > 0) {
      output += `🔄 Step-by-Step Fix:\n`;
      guidance.stepByStep.forEach((step, i) => {
        output += `${i + 1}. ${step}\n`;
      });
      output += `\n`;
    }

    output += `💡 ${guidance.correction}\n`;

    if (guidance.reflection) {
      output += `\n🤔 Reflection: ${guidance.reflection}\n`;
    }

    if (guidance.reinforcement) {
      output += `\n📌 Note to self: ${guidance.reinforcement}\n`;
    }

    return output;
  }

  private formatSummary(summary: ReviewResult["summary"]): string {
    const parts = [];
    if (summary.critical > 0) parts.push(`${summary.critical} critical`);
    if (summary.high > 0) parts.push(`${summary.high} high`);
    if (summary.medium > 0) parts.push(`${summary.medium} medium`);
    if (summary.low > 0) parts.push(`${summary.low} low`);
    if (summary.info > 0) parts.push(`${summary.info} info`);

    return parts.length > 0 ? parts.join(", ") : "No issues";
  }

  private groupBySeverity(findings: Finding[]): Record<Severity, Finding[]> {
    const grouped: Record<Severity, Finding[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };

    for (const finding of findings) {
      grouped[finding.severity].push(finding);
    }

    return grouped;
  }

  private getSeverityIcon(severity: Severity): string {
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
      if (Deno.statSync(current).isDirectory) {
        try {
          Deno.statSync(`${current}/.claude`);
          return current;
        } catch {
          // Continue searching
        }

        try {
          Deno.statSync(`${current}/.git`);
          return current;
        } catch {
          // Continue searching
        }
      }

      const parent = current.split("/").slice(0, -1).join("/");
      if (parent === current) break;
      current = parent;
    }

    return ".";
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("🪴 Aichaku MCP Code Reviewer started");
  }
}

// Import type fix
import type { ClaudeGuidance, Finding, Severity } from "./types.ts";

// Start the server
if (import.meta.main) {
  const server = new MCPCodeReviewer();
  await server.start();
}
