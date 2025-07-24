/**
 * Unified Formatting System for GitHub MCP Server
 * Based on Aichaku's formatting approach for consistent terminal output
 */

import type { GitHubRepository, GitHubWorkflowRun } from "./github/client.ts";

// Console colors for terminal output
export const COLORS = {
  SUCCESS: "\x1b[32m", // Green
  WARNING: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  INFO: "\x1b[36m", // Cyan
  RESET: "\x1b[0m", // Reset
  BOLD: "\x1b[1m", // Bold
  DIM: "\x1b[2m", // Dim
  BLUE: "\x1b[34m", // Blue
} as const;

// Status icons for different states
export const ICONS = {
  SUCCESS: "✅",
  ERROR: "❌",
  WARNING: "⚠️",
  INFO: "ℹ️",
  RUNNING: "🔄",
  PENDING: "⏳",
  WORKFLOW: "📋",
  REPO: "📦",
  LINK: "🔗",
  BRANCH: "🌿",
  RELEASE: "🚀",
  BULLET: "•",
  ARROW: "→",
} as const;

/**
 * Format utilities for clean terminal output
 */
export const format = {
  /**
   * Create a colored header
   */
  header: (text: string, icon: string = ICONS.WORKFLOW): string => {
    return `${COLORS.BOLD}${icon} ${text}${COLORS.RESET}`;
  },

  /**
   * Create a separator line
   */
  separator: (length: number = 50): string => {
    return `${COLORS.DIM}${"━".repeat(length)}${COLORS.RESET}`;
  },

  /**
   * Format a section title
   */
  section: (title: string): string => {
    return `\n${COLORS.BOLD}${title}${COLORS.RESET}\n${COLORS.DIM}${"─".repeat(title.length)}${COLORS.RESET}`;
  },

  /**
   * Format a field with label and value
   */
  field: (label: string, value: string, indent: number = 0): string => {
    const padding = " ".repeat(indent);
    return `${padding}${COLORS.DIM}${label}:${COLORS.RESET} ${value}`;
  },

  /**
   * Format a list item
   */
  listItem: (text: string, indent: number = 2): string => {
    const padding = " ".repeat(indent);
    return `${padding}${COLORS.DIM}${ICONS.BULLET}${COLORS.RESET} ${text}`;
  },

  /**
   * Format a link
   */
  link: (text: string, url: string): string => {
    return `${COLORS.BLUE}${ICONS.LINK} ${text}:${COLORS.RESET} ${url}`;
  },

  /**
   * Format success message
   */
  success: (message: string): string => {
    return `${COLORS.SUCCESS}${ICONS.SUCCESS} ${message}${COLORS.RESET}`;
  },

  /**
   * Format error message
   */
  error: (message: string): string => {
    return `${COLORS.ERROR}${ICONS.ERROR} ${message}${COLORS.RESET}`;
  },

  /**
   * Format warning message
   */
  warning: (message: string): string => {
    return `${COLORS.WARNING}${ICONS.WARNING} ${message}${COLORS.RESET}`;
  },

  /**
   * Format info message
   */
  info: (message: string): string => {
    return `${COLORS.INFO}${ICONS.INFO} ${message}${COLORS.RESET}`;
  },

  /**
   * Format workflow run status
   */
  workflowStatus: (
    status: string,
    conclusion?: string | null,
  ): { icon: string; color: string; text: string } => {
    if (status === "completed") {
      if (conclusion === "success") {
        return { icon: ICONS.SUCCESS, color: COLORS.SUCCESS, text: "Success" };
      } else if (conclusion === "failure") {
        return { icon: ICONS.ERROR, color: COLORS.ERROR, text: "Failed" };
      } else {
        return {
          icon: ICONS.WARNING,
          color: COLORS.WARNING,
          text: conclusion || "Unknown",
        };
      }
    } else if (status === "in_progress") {
      return { icon: ICONS.RUNNING, color: COLORS.INFO, text: "Running" };
    } else {
      return { icon: ICONS.PENDING, color: COLORS.DIM, text: "Pending" };
    }
  },

  /**
   * Format duration in human-readable format
   */
  duration: (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  },

  /**
   * Format a workflow run for display
   */
  workflowRun: (run: GitHubWorkflowRun, detailed: boolean = false): string => {
    const status = format.workflowStatus(run.status, run.conclusion);
    const duration = run.run_started_at
      ? Math.round(
        (new Date(run.updated_at).getTime() -
          new Date(run.run_started_at).getTime()) / 1000,
      )
      : 0;

    let output = "";

    if (detailed) {
      // Detailed view for single run
      output += `${status.color}${status.icon} ${run.name}${COLORS.RESET} (#${run.id})\n`;
      output += format.separator(40) + "\n";
      output += format.field("Branch", run.head_branch) + "\n";
      output += format.field("Status", `${status.color}${status.text}${COLORS.RESET}`) +
        "\n";
      output += format.field("Duration", format.duration(duration)) + "\n";
      output += format.field(
        "Started",
        new Date(run.run_started_at || run.created_at).toLocaleString(),
      ) + "\n";
      output += format.field("Commit", run.head_sha.substring(0, 7)) + "\n";
      output += "\n" + format.link("View on GitHub", run.html_url);
    } else {
      // Compact view for lists
      output += `${status.color}${status.icon} ${run.name}${COLORS.RESET} ${COLORS.DIM}(#${run.id})${COLORS.RESET}\n`;
      output += format.field("  Branch", run.head_branch, 2) + "\n";
      output += format.field(
        "  Status",
        `${status.color}${status.text}${COLORS.RESET}`,
        2,
      ) + "\n";
      output += format.field("  Duration", format.duration(duration), 2) + "\n";
      output += `  ${COLORS.BLUE}${ICONS.LINK}${COLORS.RESET} ${run.html_url}`;
    }

    return output;
  },

  /**
   * Format repository information
   */
  repository: (repo: GitHubRepository, detailed: boolean = false): string => {
    let output = "";

    if (detailed) {
      output += format.header(repo.full_name, ICONS.REPO) + "\n";
      output += format.separator(40) + "\n";
      output += format.field("Description", repo.description || "No description") +
        "\n";
      output += format.field("Visibility", repo.private ? "Private 🔒" : "Public 🌐") +
        "\n";
      output += format.field(
        "Default Branch",
        `${ICONS.BRANCH} ${repo.default_branch}`,
      ) +
        "\n";
      output += format.field("Language", repo.language || "Not specified") +
        "\n";

      if (repo.topics && repo.topics.length > 0) {
        output += format.field("Topics", repo.topics.join(", ")) + "\n";
      }

      output += "\n" + format.section("Links");
      output += format.listItem(`Repository: ${repo.html_url}`) + "\n";
      output += format.listItem(`Clone HTTPS: ${repo.clone_url}`) + "\n";
      output += format.listItem(`Clone SSH: ${repo.ssh_url}`);
    } else {
      // Compact view for lists
      output += `${COLORS.BOLD}${ICONS.REPO} ${repo.full_name}${COLORS.RESET}\n`;
      output += format.field("  Description", repo.description || "No description", 2) +
        "\n";
      output += format.field(
        "  Visibility",
        repo.private ? "Private 🔒" : "Public 🌐",
        2,
      ) + "\n";
      output += `  ${COLORS.BLUE}${ICONS.LINK}${COLORS.RESET} ${repo.html_url}`;
    }

    return output;
  },
};
