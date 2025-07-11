/**
 * Storage abstraction for statistics data
 * Supports multiple storage backends with privacy controls
 */

/// <reference lib="deno.unstable" />

import type {
  FileAnalysis as _FileAnalysis,
  OperationPerformance as _OperationPerformance,
  SessionStatistics,
  StandardsUsage as _StandardsUsage,
  StatisticsConfig,
  StatisticsReport,
  STORAGE_KEYS as _STORAGE_KEYS,
  ToolInvocation,
} from "./types.ts";

export interface StorageBackend {
  init(): Promise<void>;
  get<T>(key: string[]): Promise<T | null>;
  set<T>(key: string[], value: T): Promise<void>;
  list<T>(prefix: string[]): Promise<Array<{ key: string[]; value: T }>>;
  delete(key: string[]): Promise<void>;
  cleanup(olderThan: Date): Promise<number>;
  close(): Promise<void>;
}

/**
 * Deno KV storage backend
 */
export class DenoKVStorage implements StorageBackend {
  private kv: Deno.Kv | null = null;
  private dbPath?: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath;
  }

  async init(): Promise<void> {
    this.kv = await Deno.openKv(this.dbPath);
  }

  async get<T>(key: string[]): Promise<T | null> {
    if (!this.kv) throw new Error("Storage not initialized");
    const result = await this.kv.get(key);
    return result.value as T | null;
  }

  async set<T>(key: string[], value: T): Promise<void> {
    if (!this.kv) throw new Error("Storage not initialized");
    await this.kv.set(key, value);
  }

  async list<T>(prefix: string[]): Promise<Array<{ key: string[]; value: T }>> {
    if (!this.kv) throw new Error("Storage not initialized");
    const results: Array<{ key: string[]; value: T }> = [];

    for await (const entry of this.kv.list({ prefix })) {
      results.push({
        key: entry.key as string[],
        value: entry.value as T,
      });
    }

    return results;
  }

  async delete(key: string[]): Promise<void> {
    if (!this.kv) throw new Error("Storage not initialized");
    await this.kv.delete(key);
  }

  async cleanup(olderThan: Date): Promise<number> {
    if (!this.kv) throw new Error("Storage not initialized");
    let deletedCount = 0;

    // Clean up invocations
    const invocations = await this.list<ToolInvocation>([
      "stats",
      "invocations",
    ]);
    for (const { key, value } of invocations) {
      if (value.timestamp < olderThan) {
        await this.delete(key);
        deletedCount++;
      }
    }

    // Clean up sessions
    const sessions = await this.list<SessionStatistics>(["stats", "sessions"]);
    for (const { key, value } of sessions) {
      if (value.startTime < olderThan) {
        await this.delete(key);
        deletedCount++;
      }
    }

    // Clean up reports
    const reports = await this.list<StatisticsReport>(["stats", "reports"]);
    for (const { key, value } of reports) {
      if (value.generatedAt < olderThan) {
        await this.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  close(): Promise<void> {
    if (this.kv) {
      this.kv.close();
      this.kv = null;
    }
    return Promise.resolve();
  }
}

/**
 * JSON file storage backend (for simpler deployments)
 */
export class JSONFileStorage implements StorageBackend {
  private data: Map<string, unknown> = new Map();
  private filePath: string;

  constructor(filePath: string = "/tmp/aichaku-stats.json") {
    this.filePath = filePath;
  }

  async init(): Promise<void> {
    try {
      const content = await Deno.readTextFile(this.filePath);
      const parsed = JSON.parse(content);

      // Convert back to Map
      for (const [key, value] of Object.entries(parsed)) {
        this.data.set(key, value);
      }
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      if (!(error instanceof Deno.errors.NotFound)) {
        console.warn("Failed to load statistics file, starting fresh:", error);
      }
    }
  }

  get<T>(key: string[]): Promise<T | null> {
    const keyStr = JSON.stringify(key);
    return Promise.resolve(this.data.get(keyStr) as T || null);
  }

  async set<T>(key: string[], value: T): Promise<void> {
    const keyStr = JSON.stringify(key);
    this.data.set(keyStr, value);
    await this.persist();
  }

  list<T>(prefix: string[]): Promise<Array<{ key: string[]; value: T }>> {
    const results: Array<{ key: string[]; value: T }> = [];

    for (const [keyStr, value] of this.data.entries()) {
      const key = JSON.parse(keyStr) as string[];
      if (this.keyMatchesPrefix(key, prefix)) {
        results.push({ key, value: value as T });
      }
    }

    return Promise.resolve(results);
  }

  async delete(key: string[]): Promise<void> {
    const keyStr = JSON.stringify(key);
    this.data.delete(keyStr);
    await this.persist();
  }

  async cleanup(olderThan: Date): Promise<number> {
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    for (const [keyStr, value] of this.data.entries()) {
      const key = JSON.parse(keyStr) as string[];

      // Check if it's a timestamped entry
      if (
        key.length >= 2 &&
        (key[1] === "invocations" || key[1] === "sessions" ||
          key[1] === "reports")
      ) {
        const timestamp = this.extractTimestamp(value);
        if (timestamp && timestamp < olderThan) {
          keysToDelete.push(keyStr);
        }
      }
    }

    for (const keyStr of keysToDelete) {
      this.data.delete(keyStr);
      deletedCount++;
    }

    if (deletedCount > 0) {
      await this.persist();
    }

    return deletedCount;
  }

  async close(): Promise<void> {
    await this.persist();
  }

  private async persist(): Promise<void> {
    const dataObj = Object.fromEntries(this.data);
    await Deno.writeTextFile(this.filePath, JSON.stringify(dataObj, null, 2));
  }

  private keyMatchesPrefix(key: string[], prefix: string[]): boolean {
    if (key.length < prefix.length) return false;
    return prefix.every((part, index) => key[index] === part);
  }

  private extractTimestamp(value: unknown): Date | null {
    if (value && typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;
      if ("timestamp" in obj && obj.timestamp) {
        return new Date(obj.timestamp as string | number);
      }
      if ("startTime" in obj && obj.startTime) {
        return new Date(obj.startTime as string | number);
      }
      if ("generatedAt" in obj && obj.generatedAt) {
        return new Date(obj.generatedAt as string | number);
      }
    }
    return null;
  }
}

/**
 * In-memory storage backend (for testing or temporary use)
 */
export class MemoryStorage implements StorageBackend {
  private data: Map<string, unknown> = new Map();

  async init(): Promise<void> {
    // Nothing to initialize for memory storage
  }

  get<T>(key: string[]): Promise<T | null> {
    const keyStr = JSON.stringify(key);
    return Promise.resolve(this.data.get(keyStr) as T || null);
  }

  set<T>(key: string[], value: T): Promise<void> {
    const keyStr = JSON.stringify(key);
    this.data.set(keyStr, value);
    return Promise.resolve();
  }

  list<T>(prefix: string[]): Promise<Array<{ key: string[]; value: T }>> {
    const results: Array<{ key: string[]; value: T }> = [];

    for (const [keyStr, value] of this.data.entries()) {
      const key = JSON.parse(keyStr) as string[];
      if (this.keyMatchesPrefix(key, prefix)) {
        results.push({ key, value: value as T });
      }
    }

    return Promise.resolve(results);
  }

  delete(key: string[]): Promise<void> {
    const keyStr = JSON.stringify(key);
    this.data.delete(keyStr);
    return Promise.resolve();
  }

  cleanup(olderThan: Date): Promise<number> {
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    for (const [keyStr, value] of this.data.entries()) {
      const key = JSON.parse(keyStr) as string[];

      // Check if it's a timestamped entry
      if (
        key.length >= 2 &&
        (key[1] === "invocations" || key[1] === "sessions" ||
          key[1] === "reports")
      ) {
        const timestamp = this.extractTimestamp(value);
        if (timestamp && timestamp < olderThan) {
          keysToDelete.push(keyStr);
        }
      }
    }

    for (const keyStr of keysToDelete) {
      this.data.delete(keyStr);
      deletedCount++;
    }

    return Promise.resolve(deletedCount);
  }

  close(): Promise<void> {
    this.data.clear();
    return Promise.resolve();
  }

  private keyMatchesPrefix(key: string[], prefix: string[]): boolean {
    if (key.length < prefix.length) return false;
    return prefix.every((part, index) => key[index] === part);
  }

  private extractTimestamp(value: unknown): Date | null {
    if (value && typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;
      if ("timestamp" in obj && obj.timestamp) {
        return new Date(obj.timestamp as string | number);
      }
      if ("startTime" in obj && obj.startTime) {
        return new Date(obj.startTime as string | number);
      }
      if ("generatedAt" in obj && obj.generatedAt) {
        return new Date(obj.generatedAt as string | number);
      }
    }
    return null;
  }
}

/**
 * Factory function to create storage backend based on config
 */
export function createStorage(config: StatisticsConfig): StorageBackend {
  switch (config.storage.type) {
    case "deno-kv":
      return new DenoKVStorage(config.storage.location);
    case "json":
      return new JSONFileStorage(config.storage.location);
    case "memory":
      return new MemoryStorage();
    default:
      throw new Error(`Unsupported storage type: ${config.storage.type}`);
  }
}
