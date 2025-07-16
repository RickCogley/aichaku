/**
 * Dynamic content discovery for standards and methodologies
 *
 * This module provides utilities to dynamically discover available standards
 * and methodologies from the filesystem, supporting both markdown and YAML
 * metadata files.
 */

import { exists, walk } from "jsr:@std/fs@1";
import { basename, dirname, join, relative } from "jsr:@std/path@1";
import { parse as parseYaml } from "jsr:@std/yaml@1";
import { safeReadTextFile } from "./path-security.ts";

/** Type of content (methodologies or standards) */
export type ContentType = "methodologies" | "standards";

/** Metadata for a discoverable content item */
export interface ContentMetadata {
  /** Display name */
  name: string;
  /** Brief description */
  description: string;
  /** Tags for categorization */
  tags: string[];
  /** Category (for standards) or type (for methodologies) */
  category?: string;
  /** File path relative to content root */
  path: string;
  /** Subdirectory templates if any */
  templates?: string[];
}

/** Structure representing discovered content */
export interface DiscoveredContent {
  /** All discovered items grouped by category/type */
  categories: Record<string, ContentMetadata[]>;
  /** Flat list of all items */
  items: ContentMetadata[];
  /** Total count */
  count: number;
}

/**
 * Discover content dynamically from the filesystem
 * @param contentType - Type of content to discover
 * @param basePath - Base path to search in
 * @param useDocsPath - Whether to use /docs/ prefix (for new structure)
 * @returns Promise resolving to discovered content
 */
export async function discoverContent(
  contentType: ContentType,
  basePath: string,
  useDocsPath: boolean = false,
): Promise<DiscoveredContent> {
  const contentPath = useDocsPath
    ? join(basePath, "docs", contentType)
    : join(basePath, contentType);

  const categories: Record<string, ContentMetadata[]> = {};
  const items: ContentMetadata[] = [];

  // Check if the content directory exists
  if (!(await exists(contentPath))) {
    return { categories, items, count: 0 };
  }

  // Walk through the content directory looking for YAML files
  for await (
    const entry of walk(contentPath, {
      includeDirs: false,
      exts: [".yaml", ".yml"],
      skip: [/\/templates\//, /\/scripts\//, /\/archive\//, /metadata\.yaml$/],
    })
  ) {
    const relativePath = relative(contentPath, entry.path);
    const dir = dirname(relativePath);
    const category = dir === "." ? "uncategorized" : dir.split("/")[0];

    // Try to load metadata
    const metadata = await loadContentMetadata(
      entry.path,
      relativePath,
      category,
    );

    if (metadata) {
      // Check for template subdirectory
      const templatesDir = join(dirname(entry.path), "templates");
      if (await exists(templatesDir)) {
        metadata.templates = [];
        for await (
          const template of walk(templatesDir, {
            includeDirs: false,
            exts: [".md"],
          })
        ) {
          metadata.templates.push(basename(template.path));
        }
      }

      items.push(metadata);

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(metadata);
    }
  }

  return {
    categories,
    items,
    count: items.length,
  };
}

/**
 * Enhance metadata from category metadata.yaml file if it exists
 */
async function _enhanceMetadataFromYaml(
  metadata: ContentMetadata,
  category: string,
  contentPath: string,
): Promise<void> {
  const yamlPath = join(contentPath, category, "metadata.yaml");

  if (await exists(yamlPath)) {
    try {
      const yamlContent = await safeReadTextFile(yamlPath, dirname(yamlPath));
      const yamlData = parseYaml(yamlContent) as Record<string, unknown>;

      // Look for this specific standard in the YAML
      if (yamlData.standards && Array.isArray(yamlData.standards)) {
        const standardId = metadata.path.split("/").pop()?.replace(".md", "") ||
          "";
        const yamlStandard =
          (yamlData.standards as Array<Record<string, unknown>>).find((s) =>
            s.id === standardId
          );

        if (yamlStandard) {
          // Enhance with YAML metadata
          if (typeof yamlStandard.name === 'string' && !metadata.name) {
            metadata.name = yamlStandard.name;
          }
          if (typeof yamlStandard.description === 'string' && !metadata.description) {
            metadata.description = yamlStandard.description;
          }
          if (Array.isArray(yamlStandard.tags) && yamlStandard.tags.length > 0) {
            metadata.tags = [
              ...new Set([...metadata.tags, ...(yamlStandard.tags as string[])]),
            ];
          }
        }
      }
    } catch (error) {
      // Ignore YAML parsing errors for individual files
      console.warn(`Failed to parse YAML metadata for ${category}:`, error);
    }
  }
}

/**
 * Load metadata for a content file
 * @param filePath - Absolute path to the file
 * @param relativePath - Path relative to content root
 * @param category - Category/type of the content
 * @returns Promise resolving to metadata or null
 */
async function loadContentMetadata(
  filePath: string,
  relativePath: string,
  category: string,
): Promise<ContentMetadata | null> {
  try {
    const content = await safeReadTextFile(filePath, dirname(filePath));

    // Check for YAML metadata file
    if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
      return parseYamlMetadata(content, relativePath, category);
    }

    // Extract metadata from markdown
    if (filePath.endsWith(".md")) {
      return extractMarkdownMetadata(content, relativePath, category);
    }

    return null;
  } catch (error) {
    console.warn(`Failed to load metadata from ${filePath}:`, error);
    return null;
  }
}

/**
 * Parse YAML metadata file
 */
function parseYamlMetadata(
  content: string,
  relativePath: string,
  category: string,
): ContentMetadata | null {
  try {
    const data = parseYaml(content) as Record<string, unknown>;
    const display = data.display as Record<string, unknown> | undefined;
    const summary = data.summary as Record<string, unknown> | undefined;

    // Extract name from YAML or derive from filename
    const name = (data.name as string) ||
      basename(relativePath, ".yaml").replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    // Get description from display section, summary, or key concepts
    let description = (display?.description as string) ||
      (data.description as string) ||
      "No description available";

    // If no description but has key concepts, use the first one
    if (description === "No description available" && summary?.key_concepts) {
      const concepts = summary.key_concepts as string[];
      if (Array.isArray(concepts) && concepts.length > 0) {
        description = concepts[0];
      }
    }

    // Extract tags from display or summary
    const tags = (display?.tags as string[]) ||
      (data.tags as string[]) ||
      [];

    return {
      name,
      description,
      tags,
      category,
      path: relativePath,
    };
  } catch (error) {
    console.warn(`Failed to parse YAML metadata:`, error);
    return null;
  }
}

/**
 * Extract metadata from markdown content
 */
function extractMarkdownMetadata(
  content: string,
  relativePath: string,
  category: string,
): ContentMetadata {
  const metadata: ContentMetadata = {
    name: "",
    description: "",
    tags: [],
    category,
    path: relativePath,
  };

  // Extract title from first H1
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.name = titleMatch[1].trim();
  } else {
    // Fall back to filename
    metadata.name = basename(relativePath, ".md")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Extract YAML frontmatter if present
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    try {
      const frontmatter = parseYaml(frontmatterMatch[1]) as Record<
        string,
        unknown
      >;
      if (typeof frontmatter.description === 'string') {
        metadata.description = frontmatter.description;
      }
      if (Array.isArray(frontmatter.tags)) {
        metadata.tags = frontmatter.tags as string[];
      }
    } catch {
      // Ignore YAML parsing errors
    }
  }

  // Extract description from first paragraph if not in frontmatter
  if (!metadata.description) {
    const descMatch = content.match(/^#\s+.+\n\n([^#\n].+)$/m);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    } else {
      metadata.description = "No description available";
    }
  }

  // Try to extract tags from content if not in frontmatter
  if (metadata.tags.length === 0) {
    // Look for common keywords in the content
    const lowerContent = content.toLowerCase();
    const possibleTags = [];

    if (lowerContent.includes("security")) possibleTags.push("security");
    if (lowerContent.includes("test")) possibleTags.push("testing");
    if (lowerContent.includes("architecture")) {
      possibleTags.push("architecture");
    }
    if (lowerContent.includes("development")) possibleTags.push("development");
    if (lowerContent.includes("devops")) possibleTags.push("devops");
    if (lowerContent.includes("documentation")) {
      possibleTags.push("documentation");
    }

    metadata.tags = possibleTags;
  }

  return metadata;
}

/**
 * Build content structure for backward compatibility
 * @param discovered - Discovered content
 * @returns Nested object structure matching the old format
 */
export function buildContentStructure(
  discovered: DiscoveredContent,
): Record<string, unknown> {
  const structure: Record<string, unknown> = {};

  for (const [category, items] of Object.entries(discovered.categories)) {
    const categoryObj: Record<string, unknown> = {};

    for (const item of items) {
      const itemPath = item.path;
      const parts = itemPath.split("/");

      // Skip the first part if it's the same as the category (avoid duplication)
      const pathParts = parts[0] === category ? parts.slice(1) : parts;

      let current = categoryObj;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }

      // Set the file
      const fileName = pathParts[pathParts.length - 1];
      current[fileName] = "";

      // Add templates if they exist
      if (item.templates && item.templates.length > 0) {
        const templatesObj: Record<string, string> = {};
        for (const template of item.templates) {
          templatesObj[template] = "";
        }
        current["templates"] = templatesObj;
      }
    }

    structure[category] = categoryObj;
  }

  return structure;
}

/**
 * Get content structure dynamically (replacement for hardcoded functions)
 * @param contentType - Type of content
 * @param basePath - Base path to search
 * @param useDocsPath - Whether to use /docs/ prefix
 * @returns Promise resolving to content structure
 */
export async function getContentStructure(
  contentType: ContentType,
  basePath: string,
  useDocsPath: boolean = false,
): Promise<Record<string, unknown>> {
  const discovered = await discoverContent(contentType, basePath, useDocsPath);
  return buildContentStructure(discovered);
}
