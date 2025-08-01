/**
 * Principle loader utility for Aichaku
 * Uses dynamic content discovery to load principle definitions
 * @module
 */

import { getAichakuPaths } from "../paths.ts";
import type { Principle, PrincipleCategory, PrincipleWithDocs } from "../types/principle.ts";
import { PRINCIPLE_CATEGORIES } from "../types/principle.ts";
import type { ItemLoader } from "../types/command.ts";
import { smartSearch } from "./fuzzy-search.ts";
import { type ContentMetadata, discoverContent } from "./dynamic-content-discovery.ts";

/**
 * Generate a consistent ID from a principle name
 */
function generatePrincipleId(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/[\s]+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Loads and manages principles from the filesystem using dynamic content discovery
 */
export class PrincipleLoader implements ItemLoader<Principle> {
  private cache: Map<string, PrincipleWithDocs> = new Map();
  private basePath: string;

  constructor() {
    // Always use global installation path for principles
    const paths = getAichakuPaths();
    this.basePath = paths.global.root;
  }

  /**
   * Get unique categories from all principles
   */
  async getCategories(): Promise<string[]> {
    const discovered = await discoverContent("principles", this.basePath, true);
    const principleCategories = new Set<string>();

    // Extract categories from principle paths
    discovered.items.forEach((item) => {
      const pathParts = item.path.split("/");
      if (pathParts.length > 0) {
        principleCategories.add(pathParts[0]);
      }
    });

    return Array.from(principleCategories).sort();
  }

  /**
   * Load all available principles using dynamic content discovery
   */
  async loadAll(): Promise<Principle[]> {
    const discovered = await discoverContent("principles", this.basePath, true);

    const principles: Principle[] = [];
    for (const item of discovered.items) {
      const principle = this.metadataToPrinciple(item);
      if (principle) {
        principles.push(principle);
        // Cache the full principle with docs
        const principleWithDocs: PrincipleWithDocs = {
          ...principle,
          documentation: "", // Will be loaded on demand
          path: item.path,
        };
        this.cache.set(principle.id, principleWithDocs);
      }
    }

    return principles;
  }

  /**
   * Load a specific principle by ID
   */
  async loadById(principleId: string): Promise<Principle | null> {
    // Ensure cache is loaded
    if (this.cache.size === 0) {
      await this.loadAll();
    }

    // Check cache first with exact match
    if (this.cache.has(principleId)) {
      const principleWithDocs = this.cache.get(principleId)!;
      const principle: Principle = {
        ...principleWithDocs,
        id: principleWithDocs.id,
        name: principleWithDocs.name,
        description: principleWithDocs.description,
        category: principleWithDocs.category,
      };
      return principle;
    }

    // If no exact match, try partial matching for common shortcuts
    const lowerPrincipleId = principleId.toLowerCase();
    for (const [id, principleWithDocs] of this.cache.entries()) {
      // Match if the ID starts with the search term
      // This allows "dry" to match "dry-dont-repeat-yourself"
      if (id.toLowerCase().startsWith(lowerPrincipleId + "-") || id.toLowerCase() === lowerPrincipleId) {
        const principle: Principle = {
          ...principleWithDocs,
          id: principleWithDocs.id,
          name: principleWithDocs.name,
          description: principleWithDocs.description,
          category: principleWithDocs.category,
        };
        return principle;
      }
    }

    return null;
  }

  /**
   * Convert ContentMetadata to Principle object
   */
  private metadataToPrinciple(metadata: ContentMetadata): Principle | null {
    try {
      // Extract category from path (e.g., "software-development/dry.yaml")
      const pathParts = metadata.path.split("/");
      const categoryPart = pathParts[0]; // Should be like "software-development"

      // Validate category
      if (!categoryPart || !(categoryPart in PRINCIPLE_CATEGORIES)) {
        console.warn(`Invalid principle category from path: ${metadata.path}`);
        return null;
      }

      const category = categoryPart as PrincipleCategory;
      const id = generatePrincipleId(metadata.name);

      // Create a basic principle from metadata
      // Full principle data will be loaded from YAML on demand
      const principle: Principle = {
        id,
        name: metadata.name,
        description: metadata.description,
        category,
        history: {
          origin: "Dynamic discovery",
          evolution: "Loaded from dynamic content discovery",
        },
        summary: {
          tagline: metadata.description,
          core_tenets: [],
        },
        guidance: {
          spirit: metadata.description,
        },
        aliases: metadata.tags, // Store tags as aliases for fuzzy search compatibility
      };

      return principle;
    } catch (error) {
      console.error(`Failed to convert metadata to principle: ${metadata.path}`, error);
      return null;
    }
  }

  // Validation and documentation generation methods removed -
  // now handled by dynamic content discovery

  /**
   * Get all principles for a specific category
   */
  async getByCategory(category: PrincipleCategory): Promise<Principle[]> {
    const allPrinciples = await this.loadAll();
    return allPrinciples.filter((p) => p.category === category);
  }

  /**
   * Search principles using fuzzy search
   */
  async search(query: string): Promise<Principle[]> {
    const all = await this.loadAll();

    // Convert principles to FuzzySearchItem format for search
    const searchableItems = all.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      tags: p.aliases || [],
    }));

    const searchResults = smartSearch(searchableItems, query, "principles");

    // Map search results back to full Principle objects
    return searchResults.map((result) => all.find((p) => p.id === result.id)).filter((p): p is Principle =>
      p !== undefined
    );
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
