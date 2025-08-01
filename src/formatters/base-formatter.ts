/**
 * Base formatter class providing consistent colorful branding
 * for all Aichaku formatters
 *
 * @module
 */

import { blue, bold, cyan } from "jsr:@std/fmt@1/colors";
import { AichakuBrand as Brand } from "../utils/branded-messages.ts";
import type { ConfigItem, ItemFormatter } from "../types/command.ts";

/**
 * Abstract base class for all formatters
 * Provides consistent colorful branding methods
 */
export abstract class BaseFormatter<T extends ConfigItem> implements ItemFormatter<T> {
  /**
   * Format the main header with colorful branding
   * Uses the same format as BaseCommand.showHelp()
   */
  protected formatHeader(title: string, subtitle?: string): string {
    const fullTitle = subtitle ? `${title} - ${subtitle}` : title;
    return blue(bold(`█ ${Brand.PREFIX} ${fullTitle}`));
  }

  /**
   * Format a section header with colorful branding
   */
  protected formatSection(title: string): string {
    return cyan(bold(`◆ ${title}`));
  }

  /**
   * Format a subsection with arrow indicator
   */
  protected formatSubsection(title: string): string {
    return bold(title);
  }

  /**
   * Format an option or item with bullet point
   */
  protected formatItem(text: string, indent: number = 2): string {
    const spaces = " ".repeat(indent);
    return `${spaces}• ${text}`;
  }

  /**
   * Format a bold option name
   */
  protected formatOption(name: string, description: string): string {
    return `  • ${bold(name)} - ${description}`;
  }

  /**
   * Format a separator line
   */
  protected formatSeparator(length: number = 48): string {
    return "━".repeat(length);
  }

  /**
   * Add consistent spacing
   */
  protected addEmptyLine(): string {
    return "";
  }

  /**
   * Build output from an array of lines
   */
  protected buildOutput(lines: string[]): string {
    return lines.join("\n");
  }

  /**
   * Format add operation header with colorful branding
   */
  formatAddHeader(commandName: string): string {
    return this.formatHeader(`Adding ${commandName}`, "Project Configuration");
  }

  /**
   * Format remove operation header with colorful branding
   */
  formatRemoveHeader(commandName: string): string {
    return this.formatHeader(`Removing ${commandName}`, "Project Configuration");
  }

  /**
   * Format search operation header with colorful branding
   */
  formatSearchHeader(query: string, commandName: string): string {
    return this.formatHeader(`Search Results`, `${commandName} matching "${query}"`);
  }

  /**
   * Format search result item
   */
  formatSearchResult(item: T): string {
    const lines: string[] = [];
    lines.push(this.formatItem(`${bold(item.id)}: ${item.name}`));
    lines.push(`    ${item.description}`);
    if (item.category) {
      lines.push(`    ${cyan("Category:")} ${item.category}`);
    }
    return lines.join("\n");
  }

  /**
   * Format no results message
   */
  formatNoResults(query: string, commandName: string): string {
    return this.formatHeader(`No Results`, `No ${commandName} found matching "${query}"`);
  }

  // Abstract methods that subclasses must implement
  abstract formatList(items: T[]): string;
  abstract formatDetails(item: T, verbose?: boolean): string;
  abstract formatCurrent(selected: string[]): string;
}
