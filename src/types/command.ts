/**
 * Shared types for all Aichaku commands
 *
 * @module
 */

/**
 * Base interface for all configurable items in Aichaku
 * Used by methodologies, standards, principles, and agents
 */
export interface ConfigItem {
  /** Unique identifier for the item */
  id: string;
  /** Display name for the item */
  name: string;
  /** Short description of the item */
  description: string;
  /** Optional category for grouping */
  category?: string;
  /** Optional tags for filtering */
  tags?: string[];
}

/**
 * Common options for command-line interfaces
 */
export interface CommandOptions {
  /** List all available items */
  list?: boolean;
  /** Show details for an item (boolean or item ID) */
  show?: boolean | string;
  /** Add items by comma-separated IDs */
  add?: string;
  /** Remove items by comma-separated IDs */
  remove?: string;
  /** Search for items by query */
  search?: string;
  /** Show currently selected items */
  current?: boolean;
  /** Path to project directory */
  projectPath?: string;
  /** Preview changes without applying */
  dryRun?: boolean;
  /** Show detailed output */
  verbose?: boolean;
  /** Show items grouped by category */
  categories?: boolean;
  /** Create a custom item */
  createCustom?: string;
  /** Set configuration value */
  set?: string;
  /** Reset configuration to defaults */
  reset?: boolean;
}

/**
 * Interface for loading and searching configurable items
 */
export interface ItemLoader<T extends ConfigItem> {
  /** Load all available items */
  loadAll(): T[] | Promise<T[]>;
  /** Load a specific item by ID */
  loadById(id: string): T | null | Promise<T | null>;
  /** Search items by query string */
  search(query: string): T[] | Promise<T[]>;
  /** Get available categories (optional) */
  getCategories?(): string[] | Promise<string[]>;
  /** Find items by partial ID (optional - for handling ambiguous matches) */
  findByPartialId?(partialId: string): T[] | Promise<T[]>;
}

/**
 * Interface for formatting items for display
 */
export interface ItemFormatter<T extends ConfigItem> {
  formatList(items: T[]): string;
  formatDetails(item: T, verbose?: boolean): string;
  formatCurrent(selected: string[]): string;
  formatCategories?(categories: string[]): string;

  // Action operation formatters
  formatAddHeader(commandName: string): string;
  formatRemoveHeader(commandName: string): string;
  formatSearchHeader(query: string, commandName: string): string;
  formatSearchResult(item: T): string;
  formatNoResults(query: string, commandName: string): string;
}

export type ConfigKey = "methodologies" | "standards" | "principles" | "patterns" | "agents";

export interface CommandDefinition<T extends ConfigItem> {
  name: string;
  configKey: ConfigKey;
  loader: ItemLoader<T>;
  formatter: ItemFormatter<T>;
  supportedOperations?: {
    list?: boolean;
    show?: boolean;
    showDetails?: boolean; // Like principles --show <id>
    add?: boolean;
    remove?: boolean;
    search?: boolean;
    current?: boolean;
    categories?: boolean;
    createCustom?: boolean;
  };
  helpText?: {
    description: string;
    examples: string[];
  };
}
