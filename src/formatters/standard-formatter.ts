/**
 * Formatter for standard display
 */

import { BaseFormatter } from "./base-formatter.ts";
import type { Standard } from "../types/standard.ts";
import { bold } from "jsr:@std/fmt@1/colors";

export class StandardFormatter extends BaseFormatter<Standard> {
  formatList(standards: Standard[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Available Standards"));
    lines.push(this.addEmptyLine());

    // Group by category
    const byCategory = new Map<string, Standard[]>();
    for (const standard of standards) {
      const category = standard.category || "uncategorized";
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(standard);
    }

    // Sort categories
    const sortedCategories = Array.from(byCategory.keys()).sort();

    for (const category of sortedCategories) {
      lines.push(this.formatSection(category.charAt(0).toUpperCase() + category.slice(1)));
      const items = byCategory.get(category)!.sort((a, b) => a.name.localeCompare(b.name));

      for (const standard of items) {
        lines.push(this.formatItem(`${standard.name} (\`${standard.id}\`)`));
        if (standard.description) {
          lines.push(`    ${standard.description}`);
        }
        if (standard.summary?.critical) {
          lines.push("");
          lines.push(`    ${bold("Key Points:")}`);
          const criticalLines = standard.summary.critical.split("\n").filter((line) => line.trim());
          for (const line of criticalLines.slice(0, 3)) {
            lines.push(`    ${line.trim()}`);
          }
        }
        lines.push("");
      }
    }

    lines.push("💡 Use `aichaku standards --add <id>` to select standards");

    return this.buildOutput(lines);
  }

  formatDetails(standard: Standard, verbose?: boolean): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Standard", standard.name));
    lines.push(this.addEmptyLine());

    lines.push(`${bold("ID:")} \`${standard.id}\``);
    lines.push(`${bold("Category:")} ${standard.category || "uncategorized"}`);
    lines.push(this.addEmptyLine());

    if (standard.description) {
      lines.push(this.formatSection("Description"));
      lines.push(standard.description);
      lines.push(this.addEmptyLine());
    }

    if (standard.summary?.critical) {
      lines.push(this.formatSection("Critical Points"));
      lines.push(standard.summary.critical);
      lines.push(this.addEmptyLine());
    }

    if (verbose) {
      for (const [key, value] of Object.entries(standard.summary || {})) {
        if (key !== "critical" && typeof value === "string") {
          const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          lines.push(this.formatSection(displayKey));
          lines.push(value);
          lines.push(this.addEmptyLine());
        }
      }
    }

    if (verbose && standard.integration_url) {
      lines.push(this.formatSection("Integration URL"));
      lines.push(standard.integration_url);
    }

    return this.buildOutput(lines);
  }

  formatCurrent(selected: string[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Current Standards Selection"));
    lines.push(this.addEmptyLine());

    if (selected.length === 0) {
      lines.push("ℹ️  No standards currently selected");
      lines.push("");
      lines.push("💡 Use `aichaku standards --add <id>` to select standards");
    } else {
      lines.push(this.formatSection(`Active Standards (${selected.length}) - In Priority Order`));
      selected.forEach((id, index) => {
        lines.push(`${index + 1}. ${id}`);
      });
      lines.push(this.addEmptyLine());
      lines.push("💡 First listed has highest priority when standards conflict");
      lines.push("📝 Use `aichaku standards --remove <id>` to deselect standards");
      lines.push("🔄 To change priority, remove and re-add in desired order");
    }

    return this.buildOutput(lines);
  }

  formatCategories(categories: string[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Standard Categories"));
    lines.push(this.addEmptyLine());

    for (const category of categories) {
      const displayName = category.charAt(0).toUpperCase() + category.slice(1);
      lines.push(this.formatOption(displayName, `\`${category}\``));
    }

    lines.push(this.addEmptyLine());
    lines.push("💡 Use `aichaku standards --list --category <name>` to filter by category");

    return this.buildOutput(lines);
  }
}
