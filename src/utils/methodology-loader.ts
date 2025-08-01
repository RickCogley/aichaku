/**
 * Dynamic methodology loader using dynamic content discovery
 * Consolidates YAML parsing patterns to reduce duplication
 */

import { getAichakuPaths } from "../paths.ts";
import type { ItemLoader } from "../types/command.ts";
import { type FuzzySearchItem, smartSearch } from "./fuzzy-search.ts";
import { type ContentMetadata, discoverContent } from "./dynamic-content-discovery.ts";

/**
 * Methodology item extending ConfigItem and FuzzySearchItem
 */
export interface Methodology extends FuzzySearchItem {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  bestFor: string;
  principles: string[];
  teamSize: string;
  cycleLength?: string;
  phases?: string[];
  templates?: Record<string, string>;
}

// MethodologyYaml interface removed - now using dynamic content discovery

/**
 * Methodology loader implementation using dynamic content discovery
 */
export class MethodologyLoader implements ItemLoader<Methodology> {
  private basePath: string;
  private cache: Map<string, Methodology> = new Map();
  private lastLoad: number = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds

  constructor() {
    const paths = getAichakuPaths();
    this.basePath = paths.global.root;
  }

  async loadAll(): Promise<Methodology[]> {
    await this.ensureCache();
    return Array.from(this.cache.values());
  }

  async loadById(id: string): Promise<Methodology | null> {
    await this.ensureCache();
    return this.cache.get(id) || null;
  }

  async search(query: string): Promise<Methodology[]> {
    const all = await this.loadAll();
    return smartSearch(all, query, "methodologies");
  }

  async getCategories(): Promise<string[]> {
    const methodologies = await this.loadAll();
    const categories = new Set<string>();

    for (const methodology of methodologies) {
      if (methodology.category) {
        categories.add(methodology.category);
      }
    }

    return Array.from(categories).sort();
  }

  /**
   * Ensure cache is loaded and fresh
   */
  private async ensureCache(): Promise<void> {
    const now = Date.now();
    if (this.cache.size > 0 && (now - this.lastLoad) < this.CACHE_TTL) {
      return; // Cache is fresh
    }

    await this.loadFromContentDiscovery();
    this.lastLoad = now;
  }

  /**
   * Load methodologies using dynamic content discovery
   */
  private async loadFromContentDiscovery(): Promise<void> {
    this.cache.clear();

    const discovered = await discoverContent("methodologies", this.basePath, true);

    for (const item of discovered.items) {
      try {
        const methodology = this.metadataToMethodology(item);
        if (methodology) {
          this.cache.set(methodology.id, methodology);
        }
      } catch (error) {
        console.warn(`Failed to load methodology from ${item.path}:`, error);
      }
    }
  }

  /**
   * Convert ContentMetadata to Methodology object
   */
  private metadataToMethodology(metadata: ContentMetadata): Methodology | null {
    try {
      // Extract methodology ID from path (e.g., "shape-up/shape-up.yaml")
      const pathParts = metadata.path.split("/");
      const methodologyId = pathParts[0] || metadata.name.toLowerCase().replace(/\s+/g, "-");

      const methodology: Methodology = {
        id: methodologyId,
        name: metadata.name,
        description: metadata.description,
        category: metadata.category || this.inferCategoryFromMetadata(metadata),
        tags: metadata.tags || this.inferTagsFromMetadata(metadata),
        bestFor: this.extractBestFor(metadata.description),
        principles: this.extractPrinciples(metadata.tags || []),
        teamSize: this.inferTeamSizeFromMetadata(metadata),
        cycleLength: this.extractCycleLength(metadata.description),
        phases: this.extractPhases(metadata.description),
        templates: undefined, // Will be populated from templates discovery if needed
      };

      return methodology;
    } catch (error) {
      console.error(`Failed to convert metadata to methodology: ${metadata.path}`, error);
      return null;
    }
  }

  /**
   * Infer category from metadata
   */
  private inferCategoryFromMetadata(metadata: ContentMetadata): string {
    const name = metadata.name.toLowerCase();
    const description = metadata.description.toLowerCase();

    if (name.includes("scrum") || description.includes("sprint")) return "agile";
    if (name.includes("kanban") || description.includes("flow")) return "flow";
    if (name.includes("lean") || description.includes("mvp")) return "startup";
    if (name.includes("xp") || description.includes("pair programming")) return "technical";
    if (name.includes("scrumban")) return "hybrid";
    if (name.includes("shape")) return "iterative";

    return "methodology";
  }

  /**
   * Infer tags from metadata
   */
  private inferTagsFromMetadata(metadata: ContentMetadata): string[] {
    const tags: string[] = [];
    const name = metadata.name.toLowerCase();
    const description = metadata.description.toLowerCase();

    // Team size tags
    if (description.includes("solo")) tags.push("solo");
    if (description.includes("small") || name.includes("shape")) tags.push("small-team");
    if (name.includes("scrum") || name.includes("kanban")) tags.push("team");

    // Approach tags
    if (description.includes("structured") || name.includes("scrum")) tags.push("structured");
    if (description.includes("flexible") || name.includes("kanban")) tags.push("flexible");
    if (description.includes("experimental") || name.includes("lean")) tags.push("experimental");
    if (description.includes("continuous") || name.includes("kanban")) tags.push("continuous");
    if (description.includes("predictable") || name.includes("scrum")) tags.push("predictable");

    // Focus tags
    if (description.includes("feature") || name.includes("shape")) tags.push("feature-focused");
    if (description.includes("mvp") || name.includes("lean")) tags.push("mvp");
    if (description.includes("engineering") || name.includes("xp")) tags.push("engineering");
    if (description.includes("quality") || name.includes("xp")) tags.push("quality");
    if (description.includes("visual") || name.includes("kanban")) tags.push("visual");

    return tags.length > 0 ? tags : ["methodology"];
  }

  /**
   * Infer team size from metadata
   */
  private inferTeamSizeFromMetadata(metadata: ContentMetadata): string {
    const name = metadata.name.toLowerCase();
    const description = metadata.description.toLowerCase();

    if (name.includes("shape") || description.includes("solo")) return "1-3 people";
    if (name.includes("scrum")) return "5-9 people";
    if (name.includes("kanban")) return "Any size";
    if (name.includes("lean")) return "2-8 people";
    if (name.includes("scrumban")) return "3-7 people";
    if (name.includes("xp")) return "2-12 people";

    return "Variable";
  }

  /**
   * Extract "best for" from description
   */
  private extractBestFor(description: string): string {
    // Try to extract meaningful "best for" info from description
    if (description.toLowerCase().includes("complex")) return "Complex features";
    if (description.toLowerCase().includes("small")) return "Small teams";
    if (description.toLowerCase().includes("startup")) return "Startups";
    if (description.toLowerCase().includes("enterprise")) return "Enterprise";
    return "General development";
  }

  /**
   * Extract principles from tags
   */
  private extractPrinciples(tags: string[]): string[] {
    // Convert tags to principles-like concepts
    const principles: string[] = [];
    if (tags.includes("structured")) principles.push("Structured approach");
    if (tags.includes("flexible")) principles.push("Flexible planning");
    if (tags.includes("continuous")) principles.push("Continuous improvement");
    if (tags.includes("feature-focused")) principles.push("Feature-driven development");
    return principles.length > 0 ? principles : ["Collaborative development"];
  }

  /**
   * Extract cycle length from description
   */
  private extractCycleLength(description: string): string | undefined {
    if (description.includes("6 week")) return "6 weeks";
    if (description.includes("2 week") || description.includes("sprint")) return "2 weeks";
    if (description.includes("continuous")) return "Continuous";
    return undefined;
  }

  /**
   * Extract phases from description
   */
  private extractPhases(description: string): string[] | undefined {
    const phases: string[] = [];
    if (description.includes("planning")) phases.push("Planning");
    if (description.includes("development") || description.includes("building")) phases.push("Development");
    if (description.includes("review") || description.includes("retrospective")) phases.push("Review");
    return phases.length > 0 ? phases : undefined;
  }
}
