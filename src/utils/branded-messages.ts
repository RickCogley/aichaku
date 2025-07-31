/**
 * Centralized branding system for consistent Aichaku CLI messaging.
 *
 * This module provides standardized messaging methods that ensure all CLI output
 * maintains consistent branding with the 🪴 Aichaku prefix and appropriate tone.
 * Based on established CLI guidelines including Google's documentation style,
 * 12-Factor CLI principles, and Command Line Interface Guidelines.
 *
 * @example
 * ```typescript
 * import { AichakuBrand as Brand } from "./branded-messages.ts";
 *
 * Brand.log("Setting up your project...");
 * Brand.success("Project initialized!");
 * Brand.error("Can't find that file. Did you mean 'init' instead?");
 * ```
 */

/**
 * Growth phase indicators for progress visualization
 */
export type GrowthPhase = "new" | "active" | "mature" | "complete";

/**
 * Centralized branding system for Aichaku CLI commands.
 *
 * Ensures consistent messaging across all CLI interactions with proper
 * branding, tone, and user-focused language following established standards.
 */
export class AichakuBrand {
  /** Primary brand emoji */
  static readonly EMOJI = "🪴";

  /** Brand name */
  static readonly NAME = "Aichaku";

  /** Short name for version display */
  static readonly shortName = "aichaku";

  /** Brand tagline */
  static readonly tagline = "🪴 Aichaku - Adaptive Methodology Support for Claude Code";

  /** Brand prefix for major operations */
  static readonly PREFIX = `${AichakuBrand.EMOJI} ${AichakuBrand.NAME}:`;

  /**
   * Get growth phase emoji for progress indicators
   * @param phase - The current growth phase
   * @returns Appropriate emoji for the phase
   */
  private static getPhaseEmoji(phase: GrowthPhase): string {
    const emojis = {
      new: "🌱",
      active: "🌿",
      mature: "🌳",
      complete: "🍃",
    };
    return emojis[phase];
  }

  /**
   * Standard branded log message - for major operations and status updates
   * @param message - User-focused message in present tense
   */
  static log(message: string): void {
    console.log(`${AichakuBrand.PREFIX} ${message}`);
  }

  /**
   * Branded error message - solution-oriented and actionable
   * @param message - Helpful error message with next steps
   */
  static error(message: string): void {
    console.error(`${AichakuBrand.PREFIX} ${message}`);
  }

  /**
   * Success message - positive confirmation of completed task
   * @param message - Past tense confirmation message
   */
  static success(message: string): void {
    console.log(`✅ ${message}`);
  }

  /**
   * Warning message - cautious tone with actionable guidance
   * @param message - Warning with suggested action
   */
  static warning(message: string): void {
    console.log(`⚠️ ${message}`);
  }

  /**
   * Progress message with optional growth phase indicator
   * @param message - Specific ongoing action
   * @param phase - Optional growth phase for visual context
   */
  static progress(message: string, phase?: GrowthPhase): void {
    const emoji = phase ? AichakuBrand.getPhaseEmoji(phase) : "🌿";
    console.log(`${emoji} ${message}`);
  }

  /**
   * Information message - neutral status without branding prefix
   * @param message - Factual information or status
   */
  static info(message: string): void {
    console.log(message);
  }

  /**
   * Tip message - helpful guidance with lightbulb emoji
   * @param message - Helpful tip or suggestion
   */
  static tip(message: string): void {
    console.log(`💡 ${message}`);
  }

  /**
   * Debug message - detailed technical information (only in verbose mode)
   * @param message - Technical details for troubleshooting
   */
  static debug(message: string): void {
    if (Deno.env.get("DEBUG") || Deno.env.get("VERBOSE")) {
      console.log(`🔍 ${message}`);
    }
  }

  // Pre-built message templates for common scenarios

  /**
   * Welcome message for initialization
   * @param version - Current version being set up
   */
  static welcome(version?: string): string {
    const versionText = version ? ` (v${version})` : "";
    return `${AichakuBrand.PREFIX} Setting up your adaptive methodology system${versionText}...`;
  }

  /**
   * Upgrade progress message
   * @param fromVersion - Current version
   * @param toVersion - Target version
   */
  static upgrading(fromVersion: string, toVersion: string): string {
    return `${AichakuBrand.PREFIX} Growing from v${fromVersion} to v${toVersion}...`;
  }

  /**
   * Help introduction message
   */
  static helpIntro(): string {
    return `${AichakuBrand.PREFIX} Here's how I can help you grow...`;
  }

  /**
   * Format and display branded help content with markdown formatting
   * @param title - Command title (e.g., "MCP", "Integrate")
   * @param description - Brief command description
   * @param content - Main help content (usage, options, examples)
   */
  static showHelp(title: string, description: string, content: string): string {
    return `
🪴 Aichaku ${title}

${description}

${content}`;
  }

  /**
   * Project creation message
   * @param projectName - Name of project being created
   */
  static creatingProject(projectName: string): string {
    return `${AichakuBrand.PREFIX} Creating ${projectName} project...`;
  }

  /**
   * Requirements check message
   */
  static checkingRequirements(): string {
    return `${AichakuBrand.PREFIX} Checking your environment...`;
  }

  /**
   * Completion celebration message
   * @param action - What was completed
   */
  static completed(action: string): string {
    return `🎉 ${action} complete! Your system is ready to grow.`;
  }

  /**
   * Error recovery helper
   * @param problem - What went wrong
   * @param solution - Suggested fix
   */
  static errorWithSolution(problem: string, solution: string): string {
    return `${AichakuBrand.PREFIX} ${problem}\n\n💡 Try: ${solution}`;
  }

  /**
   * File operation message
   * @param action - What's being done (created, updated, etc.)
   * @param filename - Name of file
   */
  static fileOperation(action: string, filename: string): string {
    return `📄 ${action} ${filename}`;
  }

  /**
   * Network operation message
   * @param action - What's being done (downloading, fetching, etc.)
   * @param source - Where from
   */
  static networkOperation(action: string, source: string): string {
    return `🌐 ${action} from ${source}...`;
  }
}

/**
 * Shorter alias for common usage
 */
export const Brand = AichakuBrand;
