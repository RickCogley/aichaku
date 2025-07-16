/**
 * Configuration Loader for Reviewer Settings
 *
 * InfoSec: Secure configuration loading with validation
 */

import { parse as parseYaml } from "jsr:@std/yaml@1";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import type { ReviewerConfig } from "./file-filter.ts";

export class ConfigLoader {
  private static readonly CONFIG_PATHS = [
    ".aichaku/reviewer-config.yaml",
    ".aichaku/reviewer-config.yml",
    "reviewer-config.yaml",
    "reviewer-config.yml",
    ".reviewer-config.yaml",
    ".reviewer-config.yml",
  ];

  /**
   * Load configuration from multiple sources
   * Priority: CLI args > config file > environment > defaults
   */
  static async loadConfig(
    configPath?: string,
    cliOptions?: Partial<ReviewerConfig>,
  ): Promise<ReviewerConfig> {
    let config: ReviewerConfig = {};

    // 1. Load from config file
    if (configPath) {
      config = await this.loadConfigFile(configPath);
    } else {
      // Try to find config file in standard locations
      for (const path of this.CONFIG_PATHS) {
        if (await exists(path)) {
          config = await this.loadConfigFile(path);
          break;
        }
      }
    }

    // 2. Override with environment variables
    const envConfig = this.loadFromEnvironment();
    config = this.mergeConfig(config, envConfig);

    // 3. Override with CLI options
    if (cliOptions) {
      config = this.mergeConfig(config, cliOptions);
    }

    // 4. Validate configuration
    this.validateConfig(config);

    return config;
  }

  private static async loadConfigFile(path: string): Promise<ReviewerConfig> {
    try {
      const content = await Deno.readTextFile(path);
      const parsed = parseYaml(content) as any;

      // Extract reviewer configuration
      return parsed.reviewer || parsed;
    } catch (error) {
      console.warn(`Failed to load config file ${path}: ${error}`);
      return {};
    }
  }

  private static loadFromEnvironment(): ReviewerConfig {
    const config: ReviewerConfig = {};

    // Check for AICHAKU_REVIEWER_EXCLUDE environment variable
    const excludeEnv = Deno.env.get("AICHAKU_REVIEWER_EXCLUDE");
    if (excludeEnv) {
      try {
        const excludePatterns = excludeEnv.split(",").map((p) => p.trim());
        config.exclude = {
          patterns: excludePatterns,
        };
      } catch (error) {
        console.warn(`Failed to parse AICHAKU_REVIEWER_EXCLUDE: ${error}`);
      }
    }

    // Check for no default exclusions
    const noDefaults = Deno.env.get("AICHAKU_NO_DEFAULT_EXCLUSIONS");
    if (noDefaults === "true" || noDefaults === "1") {
      config.noDefaultExclusions = true;
    }

    return config;
  }

  private static mergeConfig(base: ReviewerConfig, override: ReviewerConfig): ReviewerConfig {
    const merged: ReviewerConfig = {
      ...base,
      ...override,
    };

    // Merge exclude configuration
    if (base.exclude || override.exclude) {
      merged.exclude = {
        extensions: [
          ...(base.exclude?.extensions || []),
          ...(override.exclude?.extensions || []),
        ],
        patterns: [
          ...(base.exclude?.patterns || []),
          ...(override.exclude?.patterns || []),
        ],
        files: [
          ...(base.exclude?.files || []),
          ...(override.exclude?.files || []),
        ],
        directories: [
          ...(base.exclude?.directories || []),
          ...(override.exclude?.directories || []),
        ],
        paths: [
          ...(base.exclude?.paths || []),
          ...(override.exclude?.paths || []),
        ],
        contentTypes: [
          ...(base.exclude?.contentTypes || []),
          ...(override.exclude?.contentTypes || []),
        ],
        maxFileSize: override.exclude?.maxFileSize || base.exclude?.maxFileSize,
        perToolExclusions: {
          ...base.exclude?.perToolExclusions,
          ...override.exclude?.perToolExclusions,
        },
      };
    }

    return merged;
  }

  private static validateConfig(config: ReviewerConfig): void {
    // Validate file size format
    if (config.exclude?.maxFileSize) {
      const sizePattern = /^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i;
      if (!sizePattern.test(config.exclude.maxFileSize)) {
        throw new Error(
          `Invalid file size format: ${config.exclude.maxFileSize}. Expected format: "1MB", "500KB", etc.`,
        );
      }
    }

    // Validate patterns for potential ReDoS
    const patterns = [
      ...(config.exclude?.patterns || []),
      ...(config.exclude?.contentTypes || []),
    ];

    for (const pattern of patterns) {
      if (this.looksLikeReDoSPattern(pattern)) {
        console.warn(`Potentially dangerous regex pattern detected: ${pattern}`);
      }
    }
  }

  private static looksLikeReDoSPattern(pattern: string): boolean {
    // Simple check for common ReDoS patterns
    const redosPatterns = [
      /\(\.\*\)\+/, // (.*)+
      /\(\.\*\)\*/, // (.*)*
      /\(\.\+\)\+/, // (.+)+
      /\(\[.*\]\+\)\+/, // ([...]+)+
      /\(\[.*\]\*\)\+/, // ([...]*)+
    ];

    return redosPatterns.some((redos) => redos.test(pattern));
  }

  /**
   * Get configuration schema for validation
   */
  static getConfigSchema(): any {
    return {
      type: "object",
      properties: {
        exclude: {
          type: "object",
          properties: {
            extensions: {
              type: "array",
              items: { type: "string" },
            },
            patterns: {
              type: "array",
              items: { type: "string" },
            },
            files: {
              type: "array",
              items: { type: "string" },
            },
            directories: {
              type: "array",
              items: { type: "string" },
            },
            paths: {
              type: "array",
              items: { type: "string" },
            },
            contentTypes: {
              type: "array",
              items: { type: "string" },
            },
            maxFileSize: {
              type: "string",
              pattern: "^\\d+(?:\\.\\d+)?\\s*(B|KB|MB|GB)$",
            },
            perToolExclusions: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
        noDefaultExclusions: {
          type: "boolean",
        },
      },
    };
  }
}
