/**
 * Standard loader utility using dynamic content discovery
 * Consolidates YAML parsing patterns to reduce duplication
 */

import { getAichakuPaths } from "../paths.ts";
import type { Standard } from "../types/standard.ts";
import type { ItemLoader } from "../types/command.ts";
import { smartSearch } from "./fuzzy-search.ts";
import { type ContentMetadata, discoverContent } from "./dynamic-content-discovery.ts";

export class StandardLoader implements ItemLoader<Standard> {
  private basePath: string;

  constructor() {
    const paths = getAichakuPaths();
    this.basePath = paths.global.root;
  }

  async loadAll(): Promise<Standard[]> {
    const discovered = await discoverContent("standards", this.basePath, true);

    // Convert ContentMetadata to Standard objects
    const standards: Standard[] = [];
    for (const item of discovered.items) {
      const standard = this.metadataToStandard(item);
      if (standard) {
        standards.push(standard);
      }
    }

    return standards;
  }

  /**
   * Convert ContentMetadata to Standard object
   */
  private metadataToStandard(metadata: ContentMetadata): Standard | null {
    try {
      // The path will be like "development/tdd.yaml"
      const id = metadata.path.split("/").pop()?.replace(".yaml", "") ||
        metadata.name.toLowerCase().replace(/\s+/g, "-");

      const standard: Standard = {
        id,
        name: metadata.name,
        description: metadata.description,
        category: metadata.category,
        tags: metadata.tags,
      };

      return standard;
    } catch {
      return null;
    }
  }

  async loadById(id: string): Promise<Standard | null> {
    const all = await this.loadAll();
    return all.find((standard) => standard.id === id) || null;
  }

  async search(query: string): Promise<Standard[]> {
    const all = await this.loadAll();
    return smartSearch(all, query, "standards");
  }

  async getCategories(): Promise<string[]> {
    const discovered = await discoverContent("standards", this.basePath, true);
    return Object.keys(discovered.categories).sort();
  }
}
