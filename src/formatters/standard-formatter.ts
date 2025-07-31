/**
 * Formatter for standard display
 */

import type { ItemFormatter } from "../types/command.ts";
import type { Standard } from "../types/standard.ts";

export class StandardFormatter implements ItemFormatter<Standard> {
  formatList(standards: Standard[]): string {
    const content = ["# 🪴 Aichaku: Available Standards\n"];

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
      content.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);
      const items = byCategory.get(category)!.sort((a, b) => a.name.localeCompare(b.name));

      for (const standard of items) {
        content.push(`### ${standard.name} (\`${standard.id}\`)`);
        content.push(standard.description || "");
        if (standard.summary?.critical) {
          content.push("\n**Key Points:**");
          const criticalLines = standard.summary.critical.split("\n").filter((line) => line.trim());
          for (const line of criticalLines.slice(0, 3)) {
            content.push(line);
          }
        }
        content.push("");
      }
    }

    content.push("\n💡 Use `aichaku standards --add <id>` to select standards");

    return content.join("\n");
  }

  formatDetails(standard: Standard, verbose?: boolean): string {
    const content = [`# 📚 ${standard.name}\n`];

    content.push(`**ID:** \`${standard.id}\``);
    content.push(`**Category:** ${standard.category || "uncategorized"}\n`);

    if (standard.description) {
      content.push(`## Description\n`);
      content.push(standard.description + "\n");
    }

    if (standard.summary?.critical) {
      content.push(`## Critical Points\n`);
      content.push(standard.summary.critical + "\n");
    }

    if (verbose) {
      for (const [key, value] of Object.entries(standard.summary || {})) {
        if (key !== "critical" && typeof value === "string") {
          const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          content.push(`## ${displayKey}\n`);
          content.push(value + "\n");
        }
      }
    }

    if (verbose && standard.integration_url) {
      content.push(`## Integration URL\n`);
      content.push(standard.integration_url);
    }

    return content.join("\n");
  }

  formatCurrent(selected: string[]): string {
    const content = [`# 🪴 Aichaku: Current Standards Selection\n`];

    if (selected.length === 0) {
      content.push("ℹ️  No standards currently selected");
      content.push("\n💡 Use `aichaku standards --add <id>` to select standards");
    } else {
      content.push(`## Active Standards (${selected.length})\n`);
      for (const id of selected) {
        content.push(`- ${id}`);
      }
      content.push("\n💡 Use `aichaku standards --list` to see available standards");
      content.push("📝 Use `aichaku standards --remove <id>` to deselect standards");
    }

    return content.join("\n");
  }

  formatCategories(categories: string[]): string {
    const content = [`# 🪴 Aichaku: Standard Categories\n`];

    for (const category of categories) {
      const displayName = category.charAt(0).toUpperCase() + category.slice(1);
      content.push(`- **${displayName}** (\`${category}\`)`);
    }

    content.push("\n💡 Use `aichaku standards --list --category <name>` to filter by category");

    return content.join("\n");
  }
}
