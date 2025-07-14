/**
 * Logger utility for consistent output formatting
 *
 * @module
 */

import { blue, bold, gray, green, red, yellow } from "../../deps.ts";

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /** Don't output anything */
  silent?: boolean;
  /** Show debug messages */
  verbose?: boolean;
  /** Prefix for all messages */
  prefix?: string;
}

/**
 * Simple logger for consistent output formatting
 *
 * Provides methods for different log levels (info, success, warn, error, debug)
 * with consistent formatting and color coding. Supports silent mode, verbose mode,
 * and message prefixing.
 *
 * @example
 * ```ts
 * const logger = new Logger({ prefix: "🪴 Aichaku" });
 * logger.info("Initializing...");
 * logger.success("Installation complete!");
 * logger.warn("This will overwrite existing files");
 * logger.error("Failed to connect");
 *
 * // Create child logger with additional prefix
 * const childLogger = logger.child("[hooks]");
 * childLogger.info("Installing hooks..."); // Output: "🪴 Aichaku [hooks] Installing hooks..."
 * ```
 *
 * @public
 */
export class Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = options;
  }

  /**
   * Log an info message
   * @param {string} message - The message to log
   */
  info(message: string): void {
    if (!this.options.silent) {
      console.log(this.formatMessage(message));
    }
  }

  /**
   * Log a success message in green
   * @param {string} message - The success message to log
   */
  success(message: string): void {
    if (!this.options.silent) {
      console.log(green(this.formatMessage(message)));
    }
  }

  /**
   * Log a warning message in yellow
   * @param {string} message - The warning message to log
   */
  warn(message: string): void {
    if (!this.options.silent) {
      console.warn(yellow(this.formatMessage(message)));
    }
  }

  /**
   * Log an error message in red
   * @param {string} message - The error message to log
   */
  error(message: string): void {
    if (!this.options.silent) {
      console.error(red(this.formatMessage(message)));
    }
  }

  /**
   * Log a debug message (only if verbose mode is enabled)
   * @param {string} message - The debug message to log
   */
  debug(message: string): void {
    if (!this.options.silent && this.options.verbose) {
      console.log(gray(this.formatMessage(`[DEBUG] ${message}`)));
    }
  }

  /**
   * Log a message with optional custom color formatting
   * @param {string} message - The message to log
   * @param {Function} color - Optional color function to apply
   */
  log(message: string, color?: (str: string) => string): void {
    if (!this.options.silent) {
      const formatted = this.formatMessage(message);
      console.log(color ? color(formatted) : formatted);
    }
  }

  /**
   * Format message with optional prefix
   * @param {string} message - The message to format
   * @returns {string} The formatted message
   * @private
   */
  private formatMessage(message: string): string {
    return this.options.prefix ? `${this.options.prefix} ${message}` : message;
  }

  /**
   * Create a child logger with additional prefix
   * @param {string} prefix - Additional prefix for child logger
   * @returns {Logger} New logger instance with combined prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.options,
      prefix: this.options.prefix ? `${this.options.prefix} ${prefix}` : prefix,
    });
  }

  /**
   * Log a section header with underline
   * @param {string} title - The section title to display
   */
  section(title: string): void {
    if (!this.options.silent) {
      console.log("\n" + bold(blue(title)));
      console.log("─".repeat(title.length));
    }
  }

  /**
   * Log a bulleted list item
   * @param {string} message - The list item text
   * @param {number} indent - Number of spaces to indent (default: 2)
   */
  item(message: string, indent = 2): void {
    if (!this.options.silent) {
      console.log(" ".repeat(indent) + "• " + message);
    }
  }

  /**
   * Log a progress bar indicator
   * @param {number} current - Current progress value
   * @param {number} total - Total value for 100% progress
   * @param {string} message - Optional message to display with progress
   */
  progress(current: number, total: number, message?: string): void {
    if (!this.options.silent) {
      const percentage = Math.round((current / total) * 100);
      const filled = Math.round((current / total) * 20);
      const bar = "█".repeat(filled) + "░".repeat(20 - filled);

      const progressText = `${bar} ${percentage}%`;
      const fullMessage = message
        ? `${progressText} - ${message}`
        : progressText;

      // Use carriage return to update same line (fallback to console.log if process unavailable)
      try {
        // Fallback to console.log since we can't use process in Deno
        console.log(this.formatMessage(fullMessage));
      } catch {
        console.log(this.formatMessage(fullMessage));
      }

      // Add newline when complete
      if (current === total) {
        console.log();
      }
    }
  }
}
