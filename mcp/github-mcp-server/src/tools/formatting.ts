/**
 * Formatting utilities for better terminal output
 * Converts markdown-style formatting to Unicode-based formatting
 */

import type { GitHubWorkflowRun } from "../github/client.ts";

export const format = {
  /**
   * Convert markdown bold to plain text with better structure
   */
  bold: (text: string): string => text,

  /**
   * Create a header with Unicode styling
   */
  header: (text: string): string => `📋 ${text}`,

  /**
   * Create a subheader with proper spacing
   */
  subheader: (icon: string, text: string): string => `\n${icon} ${text}`,

  /**
   * Format a field label and value
   */
  field: (label: string, value: string): string => `${label}: ${value}`,

  /**
   * Create a separator line
   */
  separator: (length: number = 30): string => "━".repeat(length),

  /**
   * Format a link
   */
  link: (text: string, url: string): string => `🔗 ${text}: ${url}`,

  /**
   * Create a list item
   */
  listItem: (text: string): string => `  • ${text}`,

  /**
   * Convert markdown-formatted text to clean Unicode formatting
   */
  clean: (text: string): string => {
    // Remove markdown bold syntax
    let cleaned = text.replace(/\*\*(.*?)\*\*/g, "$1");

    // Replace markdown headers with Unicode styling
    cleaned = cleaned.replace(
      /^## (.+)$/gm,
      (_match, p1) => `\n${p1}\n${"─".repeat(p1.length)}`,
    );
    cleaned = cleaned.replace(
      /^# (.+)$/gm,
      (_match, p1) => `\n${p1}\n${"═".repeat(p1.length)}`,
    );

    // Replace markdown lists with Unicode bullets
    cleaned = cleaned.replace(/^- /gm, "• ");
    cleaned = cleaned.replace(/^\* /gm, "▸ ");

    return cleaned;
  },

  /**
   * Format workflow run status for clean output
   */
  workflowRun: (
    run: GitHubWorkflowRun,
    includeDetails: boolean = false,
  ): string => {
    const statusIcon = run.status === "completed"
      ? (run.conclusion === "success" ? "✅" : "❌")
      : run.status === "in_progress"
      ? "🔄"
      : "⏳";

    const duration = run.run_started_at
      ? Math.round(
        (new Date(run.updated_at).getTime() -
          new Date(run.run_started_at).getTime()) / 1000,
      )
      : 0;

    let output = `${statusIcon} ${run.name} (#${run.id})\n`;
    output += `${"─".repeat(40)}\n`;

    if (includeDetails) {
      output += `Branch: ${run.head_branch}\n`;
      output += `Status: ${run.status}${run.conclusion ? ` (${run.conclusion})` : ""}\n`;
      output += `Duration: ${duration > 0 ? `${duration}s` : "N/A"}\n`;
      output += `Started: ${new Date(run.run_started_at || run.created_at).toLocaleString()}\n`;
      output += `SHA: ${run.head_sha.substring(0, 7)}\n`;
      output += `\n🔗 View: ${run.html_url}\n`;
    } else {
      output += `  Branch: ${run.head_branch}\n`;
      output += `  Status: ${run.status}${run.conclusion ? ` (${run.conclusion})` : ""}\n`;
      output += `  Duration: ${duration > 0 ? `${duration}s` : "N/A"}\n`;
      output += `  🔗 ${run.html_url}\n`;
    }

    return output;
  },
};
