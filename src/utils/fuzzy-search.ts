/**
 * Fuzzy search utility using Fuse.js for intelligent content matching
 * Enables searches like "test" finding "bdd", "tdd", "test-pyramid"
 */

import Fuse from "fuse.js";

/**
 * Synonym mapping for better search matching
 */
const SEARCH_SYNONYMS: Record<string, string[]> = {
  "test": ["testing", "tdd", "bdd", "test-pyramid", "unit-test", "integration-test", "e2e"],
  "testing": ["test", "tdd", "bdd", "test-pyramid", "unit-test", "integration-test", "e2e"],
  "security": ["owasp", "nist", "cybersecurity", "auth", "authentication", "authorization"],
  "architecture": ["arch", "clean-arch", "design", "pattern", "15-factor", "clean"],
  "development": ["dev", "coding", "programming", "solid", "dry", "google-style"],
  "devops": ["ci", "cd", "deployment", "dora", "continuous"],
  "documentation": ["docs", "writing", "microsoft-style", "readme"],
  "agile": ["scrum", "shape-up", "kanban", "lean", "methodology"],
  "clean": ["clean-arch", "architecture", "solid", "separation"],
  "solid": ["development", "oop", "object-oriented", "principles"],
  "dry": ["dont-repeat-yourself", "duplication", "reuse"],
};

/**
 * Base item interface for fuzzy search
 */
export interface FuzzySearchItem {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

/**
 * Fuzzy search configuration for different content types
 */
interface FuzzySearchConfig {
  /** Keys to search in */
  keys: (string | { name: string; weight: number })[];
  /** Threshold for fuzzy matching (0.0 = exact match, 1.0 = match anything) */
  threshold: number;
  /** Whether to include score in results */
  includeScore: boolean;
  /** Maximum number of results to return */
  limit?: number;
}

/**
 * Default configurations for different content types
 */
const DEFAULT_CONFIGS: Record<string, FuzzySearchConfig> = {
  methodologies: {
    keys: [
      { name: "id", weight: 0.4 },
      { name: "name", weight: 0.3 },
      { name: "description", weight: 0.2 },
      { name: "tags", weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    limit: 10,
  },
  standards: {
    keys: [
      { name: "id", weight: 0.4 },
      { name: "name", weight: 0.3 },
      { name: "description", weight: 0.15 },
      { name: "category", weight: 0.1 },
      { name: "tags", weight: 0.05 },
    ],
    threshold: 0.3,
    includeScore: true,
    limit: 15,
  },
  principles: {
    keys: [
      { name: "id", weight: 0.4 },
      { name: "name", weight: 0.3 },
      { name: "description", weight: 0.2 },
      { name: "tags", weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
    limit: 10,
  },
  agents: {
    keys: [
      { name: "id", weight: 0.4 },
      { name: "name", weight: 0.3 },
      { name: "description", weight: 0.2 },
      { name: "tags", weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    limit: 8,
  },
};

/**
 * Enhanced fuzzy search result with score and highlighting
 */
export interface FuzzySearchResult<T extends FuzzySearchItem> {
  item: T;
  score?: number;
  matches?: unknown[]; // Simplified for compatibility
}

/**
 * Fuzzy search engine for Aichaku content
 */
export class FuzzySearchEngine<T extends FuzzySearchItem> {
  private fuse: Fuse<T>;
  private config: FuzzySearchConfig;

  constructor(items: T[], contentType: string, customConfig?: Partial<FuzzySearchConfig>) {
    this.config = {
      ...DEFAULT_CONFIGS[contentType] || DEFAULT_CONFIGS.standards,
      ...customConfig,
    };

    this.fuse = new Fuse(items, {
      keys: this.config.keys,
      threshold: this.config.threshold,
      includeScore: this.config.includeScore,
      includeMatches: true,
      ignoreLocation: true,
      findAllMatches: true,
    });
  }

  /**
   * Perform fuzzy search with intelligent matching
   */
  search(query: string): FuzzySearchResult<T>[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.config.limit ? this.fuse.search(query, { limit: this.config.limit }) : this.fuse.search(query);

    return results.map((result) => ({
      item: result.item,
      score: result.score,
      matches: result.matches as unknown[],
    }));
  }

  /**
   * Search with fallback to literal matching for backwards compatibility
   */
  searchWithFallback(query: string, literalSearchFn: (query: string) => T[]): T[] {
    const fuzzyResults = this.search(query);

    // If fuzzy search returns good results (score < 0.5), use those
    const goodFuzzyResults = fuzzyResults.filter((r) => (r.score || 1) < 0.5);
    if (goodFuzzyResults.length > 0) {
      return goodFuzzyResults.map((r) => r.item);
    }

    // Otherwise fall back to literal search
    const literalResults = literalSearchFn(query);
    if (literalResults.length > 0) {
      return literalResults;
    }

    // If no literal results, return all fuzzy results
    return fuzzyResults.map((r) => r.item);
  }

  /**
   * Update the search index with new items
   */
  updateIndex(items: T[]): void {
    this.fuse.setCollection(items);
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(partialQuery: string, maxSuggestions: number = 5): string[] {
    if (!partialQuery.trim()) {
      return [];
    }

    const results = this.search(partialQuery);
    const suggestions = new Set<string>();

    for (const result of results.slice(0, maxSuggestions)) {
      // Add the item name as a suggestion
      suggestions.add(result.item.name);

      // Add relevant tags as suggestions
      if (result.item.tags) {
        for (const tag of result.item.tags) {
          if (tag.toLowerCase().includes(partialQuery.toLowerCase()) && suggestions.size < maxSuggestions) {
            suggestions.add(tag);
          }
        }
      }

      if (suggestions.size >= maxSuggestions) break;
    }

    return Array.from(suggestions);
  }
}

/**
 * Create a fuzzy search engine for the given content type
 */
export function createFuzzySearch<T extends FuzzySearchItem>(
  items: T[],
  contentType: string,
  customConfig?: Partial<FuzzySearchConfig>,
): FuzzySearchEngine<T> {
  return new FuzzySearchEngine(items, contentType, customConfig);
}

/**
 * Expand query with synonyms for better matching
 */
function expandQueryWithSynonyms(query: string): string[] {
  const lowerQuery = query.toLowerCase().trim();
  const queries = [lowerQuery];

  // Add synonyms if available
  if (SEARCH_SYNONYMS[lowerQuery]) {
    queries.push(...SEARCH_SYNONYMS[lowerQuery]);
  }

  // Check if query is a synonym of any key
  for (const [key, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
    if (synonyms.includes(lowerQuery)) {
      queries.push(key, ...synonyms);
      break;
    }
  }

  return [...new Set(queries)]; // Remove duplicates
}

/**
 * Smart search that combines exact matching with fuzzy search and synonym expansion
 * Examples:
 * - "test" matches "tdd", "bdd", "test-pyramid"
 * - "security" matches "owasp-web", "nist-csf"
 * - "clean" matches "clean-arch"
 */
export function smartSearch<T extends FuzzySearchItem>(
  items: T[],
  query: string,
  contentType: string,
): T[] {
  const expandedQueries = expandQueryWithSynonyms(query);
  const allResults = new Set<T>();

  // Search with each expanded query
  for (const expandedQuery of expandedQueries) {
    const engine = createFuzzySearch(items, contentType);

    const results = engine.searchWithFallback(expandedQuery, (q) => {
      // Fallback literal search
      const lowerQuery = q.toLowerCase();
      return items.filter((item) =>
        item.id.toLowerCase().includes(lowerQuery) ||
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category?.toLowerCase().includes(lowerQuery) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    });

    results.forEach((result) => allResults.add(result));
  }

  return Array.from(allResults);
}
