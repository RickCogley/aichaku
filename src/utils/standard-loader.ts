/**
 * Standard loader utility
 */

import { getAichakuPaths } from "../paths.ts";
import { join } from "jsr:@std/path@1";
import { exists } from "jsr:@std/fs@1";
import { parse } from "jsr:@std/yaml@1";
import type { Standard } from "../types/standard.ts";
import type { ItemLoader } from "../types/command.ts";

export class StandardLoader implements ItemLoader<Standard> {
  private standardsPath: string;

  constructor() {
    const paths = getAichakuPaths();
    this.standardsPath = join(paths.global.root, "docs/standards");
  }

  async loadAll(): Promise<Standard[]> {
    const standards: Standard[] = [];

    if (!await exists(this.standardsPath)) {
      return standards;
    }

    // Read all YAML files in standards subdirectories
    for await (const categoryEntry of Deno.readDir(this.standardsPath)) {
      if (categoryEntry.isDirectory) {
        const categoryPath = join(this.standardsPath, categoryEntry.name);

        for await (const entry of Deno.readDir(categoryPath)) {
          // Skip metadata.yaml files - they contain category metadata, not standards
          if (entry.isFile && entry.name.endsWith(".yaml") && entry.name !== "metadata.yaml") {
            try {
              const content = await Deno.readTextFile(join(categoryPath, entry.name));
              const data = parse(content) as Standard;
              if (!data.id) {
                data.id = entry.name.replace(".yaml", "");
              }
              // Ensure required fields exist
              data.category = data.category || categoryEntry.name;
              data.name = data.name || data.id;
              data.description = data.description || "";
              standards.push(data);
            } catch {
              // Skip invalid files
            }
          }
        }
      }
    }

    return standards;
  }

  async loadById(id: string): Promise<Standard | null> {
    // Search for the standard in all category subdirectories
    for await (const categoryEntry of Deno.readDir(this.standardsPath)) {
      if (categoryEntry.isDirectory) {
        const filePath = join(this.standardsPath, categoryEntry.name, `${id}.yaml`);

        if (await exists(filePath)) {
          try {
            const content = await Deno.readTextFile(filePath);
            const data = parse(content) as Standard;
            if (!data.id) {
              data.id = id;
            }
            // Ensure required fields exist
            data.category = data.category || categoryEntry.name;
            data.name = data.name || data.id;
            data.description = data.description || "";
            return data;
          } catch {
            // Continue searching in other directories
          }
        }
      }
    }

    return null;
  }

  async search(query: string): Promise<Standard[]> {
    const all = await this.loadAll();
    const lowerQuery = query.toLowerCase();

    return all.filter((standard) =>
      standard.id.toLowerCase().includes(lowerQuery) ||
      standard.name.toLowerCase().includes(lowerQuery) ||
      (standard.description?.toLowerCase().includes(lowerQuery) ?? false) ||
      (standard.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ?? false)
    );
  }

  async getCategories(): Promise<string[]> {
    const standards = await this.loadAll();
    const categories = new Set<string>();

    for (const standard of standards) {
      if (standard.category) {
        categories.add(standard.category);
      }
    }

    return Array.from(categories).sort();
  }
}
