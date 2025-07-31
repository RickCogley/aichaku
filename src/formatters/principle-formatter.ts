/**
 * Formatter for principle display
 */

import type { ItemFormatter } from "../types/command.ts";
import type { Principle } from "../types/principle.ts";

export class PrincipleFormatter implements ItemFormatter<Principle> {
  formatList(principles: Principle[]): string {
    const content = ["# 🪴 Aichaku: Available Principles\n"];

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
      content.push(`## ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")}\n`);
      const items = byCategory.get(category)!.sort((a, b) => a.name.localeCompare(b.name));

      for (const principle of items) {
        content.push(`### ${principle.name} (\`${principle.id}\`)`);
        content.push(principle.summary?.tagline || principle.description || "");
        if (principle.summary?.core_tenets) {
          content.push("\n**Core Tenets:**");
          for (const tenet of principle.summary.core_tenets) {
            content.push(`- ${tenet.text}`);
          }
        }
        content.push("");
      }
    }

    content.push("\n💡 Use `aichaku principles --show <id>` to see full details");
    content.push("📝 Use `aichaku principles --add <id>` to select principles");

    return content.join("\n");
  }

  formatDetails(principle: Principle, verbose?: boolean): string {
    const content = [`# 🎯 ${principle.name}\n`];

    content.push(`**ID:** \`${principle.id}\``);
    content.push(`**Category:** ${principle.category || "uncategorized"}\n`);

    if (principle.summary?.tagline) {
      content.push(`## ${principle.summary.tagline}\n`);
    }

    if (principle.description) {
      content.push(`## Description\n`);
      content.push(principle.description + "\n");
    }

    if (principle.summary?.core_tenets) {
      content.push(`## Core Tenets\n`);
      for (const tenet of principle.summary.core_tenets) {
        content.push(`- ${tenet.text}`);
      }
      content.push("");
    }

    if (verbose && principle.integration_url) {
      content.push(`## Integration URL\n`);
      content.push(principle.integration_url);
    }

    return content.join("\n");
  }

  formatCurrent(selected: string[]): string {
    const content = [`# 🪴 Aichaku: Current Principle Selection\n`];

    if (selected.length === 0) {
      content.push("ℹ️  No principles currently selected");
      content.push("\n💡 Use `aichaku principles --add <id>` to select principles");
    } else {
      content.push(`## Active Principles (${selected.length}) - In Priority Order\n`);
      selected.forEach((id, index) => {
        content.push(`${index + 1}. ${id}`);
      });
      content.push("\n💡 First listed has highest priority when principles conflict");
      content.push("📝 Use `aichaku principles --remove <id>` to deselect principles");
      content.push("🔄 To change priority, remove and re-add in desired order");
    }

    return content.join("\n");
  }

  formatCategories(categories: string[]): string {
    const content = [`# 🪴 Aichaku: Principle Categories\n`];

    for (const category of categories) {
      const displayName = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
      content.push(`- **${displayName}** (\`${category}\`)`);
    }

    content.push("\n💡 Use `aichaku principles --list --category <name>` to filter by category");

    return content.join("\n");
  }
}
