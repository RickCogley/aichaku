/**
 * Formatter for principle display
 */

import { BaseFormatter } from "./base-formatter.ts";
import type { Principle } from "../types/principle.ts";
import { bold } from "jsr:@std/fmt@1/colors";

export class PrincipleFormatter extends BaseFormatter<Principle> {
  formatList(principles: Principle[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Available Principles"));
    lines.push(this.addEmptyLine());

    // Group by category
    const byCategory = new Map<string, Principle[]>();
    for (const principle of principles) {
      const category = principle.category || "uncategorized";
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(principle);
    }

    // Sort categories
    const sortedCategories = Array.from(byCategory.keys()).sort();

    for (const category of sortedCategories) {
      lines.push(this.formatSection(category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")));
      const items = byCategory.get(category)!.sort((a, b) => a.name.localeCompare(b.name));

      for (const principle of items) {
        lines.push(this.formatItem(`${principle.name} (\`${principle.id}\`)`));
        if (principle.summary?.tagline || principle.description) {
          lines.push(`    ${principle.summary?.tagline || principle.description || ""}`);
        }
        if (principle.summary?.core_tenets) {
          lines.push("");
          lines.push(`    ${bold("Core Tenets:")}`);
          for (const tenet of principle.summary.core_tenets) {
            lines.push(`    - ${tenet.text}`);
          }
        }
        lines.push("");
      }
    }

    lines.push("💡 Use `aichaku principles --show <id>` to see full details");
    lines.push("📝 Use `aichaku principles --add <id>` to select principles");

    return this.buildOutput(lines);
  }

  formatDetails(principle: Principle, verbose?: boolean): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Principle", principle.name));
    lines.push(this.addEmptyLine());

    lines.push(`${bold("ID:")} \`${principle.id}\``);
    lines.push(`${bold("Category:")} ${principle.category || "uncategorized"}`);
    lines.push(this.addEmptyLine());

    if (principle.summary?.tagline) {
      lines.push(this.formatSection(principle.summary.tagline));
      lines.push(this.addEmptyLine());
    }

    if (principle.description) {
      lines.push(this.formatSection("Description"));
      lines.push(principle.description);
      lines.push(this.addEmptyLine());
    }

    if (principle.summary?.core_tenets) {
      lines.push(this.formatSection("Core Tenets"));
      for (const tenet of principle.summary.core_tenets) {
        lines.push(this.formatItem(tenet.text));
      }
      lines.push(this.addEmptyLine());
    }

    if (verbose && principle.summary) {
      for (const [key, value] of Object.entries(principle.summary)) {
        if (key !== "tagline" && key !== "core_tenets" && typeof value === "string") {
          const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          lines.push(this.formatSection(displayKey));
          lines.push(value);
          lines.push(this.addEmptyLine());
        }
      }
    }

    if (verbose && principle.integration_url) {
      lines.push(this.formatSection("Integration URL"));
      lines.push(principle.integration_url);
    }

    return this.buildOutput(lines);
  }

  formatCurrent(selected: string[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Current Principles Selection"));
    lines.push(this.addEmptyLine());

    if (selected.length === 0) {
      lines.push("ℹ️  No principles currently selected");
      lines.push("");
      lines.push("💡 Use `aichaku principles --add <id>` to select principles");
    } else {
      lines.push(this.formatSection(`Active Principles (${selected.length})`));
      selected.forEach((id, index) => {
        lines.push(`${index + 1}. ${id}`);
      });
      lines.push(this.addEmptyLine());
      lines.push("📝 Use `aichaku principles --remove <id>` to deselect principles");
    }

    return this.buildOutput(lines);
  }

  formatCategories(categories: string[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Principle Categories"));
    lines.push(this.addEmptyLine());

    for (const category of categories) {
      const displayName = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
      lines.push(this.formatOption(displayName, `\`${category}\``));
    }

    lines.push(this.addEmptyLine());
    lines.push("💡 Use `aichaku principles --list --category <name>` to filter by category");

    return this.buildOutput(lines);
  }
}
