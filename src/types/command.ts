// Shared types for all Aichaku commands

export interface ConfigItem {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

export interface CommandOptions {
  list?: boolean;
  show?: boolean | string;
  add?: string;
  remove?: string;
  search?: string;
  current?: boolean;
  projectPath?: string;
  dryRun?: boolean;
  verbose?: boolean;
  categories?: boolean;
  createCustom?: string;
  set?: string;
  reset?: boolean;
}

export interface ItemLoader<T extends ConfigItem> {
  loadAll(): Promise<T[]>;
  loadById(id: string): Promise<T | null>;
  search(query: string): Promise<T[]>;
  getCategories?(): Promise<string[]>;
}

export interface ItemFormatter<T extends ConfigItem> {
  formatList(items: T[]): string;
  formatDetails(item: T, verbose?: boolean): string;
  formatCurrent(selected: string[]): string;
  formatCategories?(categories: string[]): string;
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
