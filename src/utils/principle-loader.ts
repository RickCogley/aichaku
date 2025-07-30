/**
 * Principle loader utility for Aichaku
 * Loads and validates principle definitions from YAML files
 * @module
 */

import { exists } from "jsr:@std/fs@1/exists";
import { join } from "jsr:@std/path@1";
import { parse } from "jsr:@std/yaml@1";
import { expandGlob } from "jsr:@std/fs@1/expand-glob";
import { getAichakuPaths } from "../paths.ts";
import { safeReadTextFile } from "./path-security.ts";
import type { Principle, PrincipleCategory, PrincipleWithDocs } from "../types/principle.ts";
import { PRINCIPLE_CATEGORIES } from "../types/principle.ts";

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
 * Loads and manages principles from the filesystem
 */
export class PrincipleLoader {
  private cache: Map<string, PrincipleWithDocs> = new Map();
  private principlesPath: string;

  constructor() {
    // Always use global installation path for principles
    const paths = getAichakuPaths();
    this.principlesPath = join(paths.global.root, "docs/principles");
  }

  /**
   * Load all available principles
   */
  async loadAll(): Promise<PrincipleWithDocs[]> {
    const principles: PrincipleWithDocs[] = [];

    // Check if principles directory exists
    if (!await exists(this.principlesPath)) {
      console.warn(`Principles directory not found: ${this.principlesPath}`);
      return principles;
    }

    // Load principles from each category
    for (const category of Object.keys(PRINCIPLE_CATEGORIES) as PrincipleCategory[]) {
      const categoryPath = join(this.principlesPath, category);

      if (!await exists(categoryPath)) {
        continue;
      }

      // Find all YAML files in the category
      for await (const entry of expandGlob(`${categoryPath}/*.yaml`)) {
        if (entry.isFile) {
          const principle = await this.loadPrincipleWithDocs(entry.path);
          if (principle) {
            principles.push(principle);
            // Cache by generated ID for consistent lookups
            const id = generatePrincipleId(principle.data.name);
            this.cache.set(id, principle);
          }
        }
      }
    }

    return principles;
  }

  /**
   * Load a specific principle by ID
   */
  async loadById(principleId: string): Promise<PrincipleWithDocs | null> {
    // Check cache first
    if (this.cache.has(principleId)) {
      return this.cache.get(principleId)!;
    }

    // If not in cache, load all principles to populate cache
    if (this.cache.size === 0) {
      await this.loadAll();
      // Check cache again after loading
      if (this.cache.has(principleId)) {
        return this.cache.get(principleId)!;
      }
    }

    // Try to find by filename as fallback
    for (const category of Object.keys(PRINCIPLE_CATEGORIES) as PrincipleCategory[]) {
      const yamlPath = join(this.principlesPath, category, `${principleId}.yaml`);

      if (await exists(yamlPath)) {
        const principle = await this.loadPrincipleWithDocs(yamlPath);
        if (principle) {
          const id = generatePrincipleId(principle.data.name);
          this.cache.set(id, principle);
          return principle;
        }
      }
    }

    return null;
  }

  /**
   * Load principle from YAML with associated markdown documentation
   */
  private async loadPrincipleWithDocs(yamlPath: string): Promise<PrincipleWithDocs | null> {
    try {
      // Load YAML data
      const yamlContent = await safeReadTextFile(yamlPath, this.principlesPath);
      const data = parse(yamlContent) as Principle;

      // Validate against schema
      if (!this.validatePrinciple(data)) {
        console.warn(`Invalid principle format: ${yamlPath}`);
        return null;
      }

      // Load corresponding Markdown documentation
      const mdPath = yamlPath.replace(".yaml", ".md");
      let documentation = "";

      try {
        documentation = await safeReadTextFile(mdPath, this.principlesPath);
      } catch {
        console.warn(`Missing documentation for principle: ${mdPath}`);
        // Generate basic documentation from YAML data
        documentation = this.generateBasicDocs(data);
      }

      return {
        data,
        documentation,
        path: yamlPath,
      };
    } catch (error) {
      console.error(`Failed to load principle: ${yamlPath}`, error);
      return null;
    }
  }

  /**
   * Validate principle structure
   */
  private validatePrinciple(data: unknown): data is Principle {
    // Basic validation - check required fields
    if (!data || typeof data !== "object") return false;

    const obj = data as Record<string, unknown>;

    const required = ["name", "category", "description", "history", "summary", "guidance"];
    for (const field of required) {
      if (!(field in obj)) {
        console.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate category
    const validCategories = ["software-development", "organizational", "engineering", "human-centered"];
    if (!validCategories.includes(obj.category as string)) {
      console.warn(`Invalid category: ${obj.category}`);
      return false;
    }

    // Validate nested structures
    if (!obj.history || typeof obj.history !== "object") return false;
    if (!obj.summary || typeof obj.summary !== "object") return false;
    if (!obj.guidance || typeof obj.guidance !== "object") return false;

    return true;
  }

  /**
   * Generate basic documentation from YAML data
   */
  private generateBasicDocs(principle: Principle): string {
    const lines: string[] = [];

    lines.push(`# ${principle.name}`);
    lines.push("");
    lines.push(principle.description);
    lines.push("");

    if (principle.summary.tagline) {
      lines.push(`> ${principle.summary.tagline}`);
      lines.push("");
    }

    lines.push("## Core Tenets");
    lines.push("");
    principle.summary.core_tenets.forEach((tenet) => {
      lines.push(`- **${tenet.text}**`);
      lines.push(`  ${tenet.guidance}`);
    });
    lines.push("");

    if (principle.guidance.spirit) {
      lines.push("## Philosophy");
      lines.push("");
      lines.push(principle.guidance.spirit);
      lines.push("");
    }

    if (principle.summary.anti_patterns.length > 0) {
      lines.push("## Anti-Patterns");
      lines.push("");
      principle.summary.anti_patterns.forEach((ap) => {
        lines.push(`- **Avoid**: ${ap.pattern}`);
        lines.push(`  **Instead**: ${ap.instead}`);
      });
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Get all principles for a specific category
   */
  async getByCategory(category: PrincipleCategory): Promise<PrincipleWithDocs[]> {
    const allPrinciples = await this.loadAll();
    return allPrinciples.filter((p) => p.data.category === category);
  }

  /**
   * Search principles by keyword
   */
  async search(query: string): Promise<PrincipleWithDocs[]> {
    const lowerQuery = query.toLowerCase();
    const allPrinciples = await this.loadAll();

    return allPrinciples.filter((p) => {
      const data = p.data;
      return (
        data.name.toLowerCase().includes(lowerQuery) ||
        data.description.toLowerCase().includes(lowerQuery) ||
        data.summary.tagline.toLowerCase().includes(lowerQuery) ||
        data.aliases?.some((alias) => alias.toLowerCase().includes(lowerQuery)) ||
        data.summary.core_tenets.some((tenet) =>
          tenet.text.toLowerCase().includes(lowerQuery) ||
          tenet.guidance.toLowerCase().includes(lowerQuery)
        )
      );
    });
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
