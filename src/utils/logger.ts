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
 * Simple logger for consistent output
 */
export class Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = options;
  }

  /**
   * Log an info message
   */
  info(message: string): void {
    if (!this.options.silent) {
      console.log(this.formatMessage(message));
    }
  }

  /**
   * Log a success message
   */
  success(message: string): void {
    if (!this.options.silent) {
      console.log(green(this.formatMessage(message)));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string): void {
    if (!this.options.silent) {
      console.warn(yellow(this.formatMessage(message)));
    }
  }

  /**
   * Log an error message
   */
  error(message: string): void {
    if (!this.options.silent) {
      console.error(red(this.formatMessage(message)));
    }
  }

  /**
   * Log a debug message (only if verbose)
   */
  debug(message: string): void {
    if (!this.options.silent && this.options.verbose) {
      console.log(gray(this.formatMessage(`[DEBUG] ${message}`)));
    }
  }

  /**
   * Log with custom formatting
   */
  log(message: string, color?: (str: string) => string): void {
    if (!this.options.silent) {
      const formatted = this.formatMessage(message);
      console.log(color ? color(formatted) : formatted);
    }
  }

  /**
   * Format message with prefix
   */
  private formatMessage(message: string): string {
    return this.options.prefix ? `${this.options.prefix} ${message}` : message;
  }

  /**
   * Create a child logger with additional prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.options,
      prefix: this.options.prefix ? `${this.options.prefix} ${prefix}` : prefix,
    });
  }

  /**
   * Log a section header
   */
  section(title: string): void {
    if (!this.options.silent) {
      console.log("\n" + bold(blue(title)));
      console.log("─".repeat(title.length));
    }
  }

  /**
   * Log a list item
   */
  item(message: string, indent = 2): void {
    if (!this.options.silent) {
      console.log(" ".repeat(indent) + "• " + message);
    }
  }

  /**
   * Log a progress indicator
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
