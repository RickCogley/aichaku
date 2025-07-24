/**
 * File Filter - Centralized file exclusion/blocklist logic
 *
 * InfoSec: Protects sensitive files from being processed by review tools
 */

import { basename, resolve } from "jsr:@std/path@1";

// Simple glob matching function
function minimatch(filePath: string, pattern: string): boolean {
  // Handle simple cases first
  if (pattern === filePath) return true;
  if (pattern === "*") return true;
  if (pattern === "**") return true;

  // Convert glob pattern to regex - process * and ? BEFORE escaping
  const regexPattern = pattern
    .replace(/\*\*/g, "__DOUBLESTAR__") // Temporarily replace **
    .replace(/\*/g, "__STAR__") // Temporarily replace *
    .replace(/\?/g, "__QUESTION__") // Temporarily replace ?
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape regex special chars AFTER glob processing
    .replace(/__DOUBLESTAR__/g, ".*") // ** matches any number of directories
    .replace(/__STAR__/g, "[^/]*") // * matches any characters except /
    .replace(/__QUESTION__/g, "[^/]"); // ? matches any single character except /

  try {
    const regex = new RegExp("^" + regexPattern + "$");
    return regex.test(filePath);
  } catch (error) {
    // If regex fails, fall back to simple string matching
    console.warn(`FileFilter: Invalid pattern ${pattern}: ${error}`);
    return filePath.includes(pattern.replace(/\*/g, ""));
  }
}

export interface BlocklistConfig {
  extensions?: string[];
  patterns?: string[];
  files?: string[];
  directories?: string[];
  paths?: string[];
  contentTypes?: string[];
  maxFileSize?: string;
  perToolExclusions?: Record<string, string[]>;
}

export interface ReviewerConfig {
  exclude?: BlocklistConfig;
  noDefaultExclusions?: boolean;
}

export class FileFilter {
  private config: BlocklistConfig;
  private defaultExclusions: BlocklistConfig;

  constructor(config: BlocklistConfig = {}, useDefaults = true) {
    this.defaultExclusions = {
      extensions: [
        ".min.js",
        ".min.css",
        ".map",
        ".lock",
        ".secret",
        ".key",
        ".token",
        ".env",
        ".pem",
        ".crt",
        ".der",
        ".p12",
        ".pfx",
        ".jks",
      ],
      patterns: [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/.git/**",
        "**/coverage/**",
        "**/*.generated.*",
        "**/vendor/**",
        "**/__pycache__/**",
        "**/target/**",
        "**/.next/**",
        "**/.nuxt/**",
        "**/out/**",
        "**/*.bundle.*",
        "**/*.chunk.*",
        "**/.DS_Store",
        "**/Thumbs.db",
        // Claude commands protection
        "**/.claude/commands/**",
        "**/.claude/user/**",
        // Sensitive files
        "**/*.secret",
        "**/*.key",
        "**/*.token",
        "**/.env*",
        "**/secrets/**",
        "**/credentials/**",
      ],
      files: [
        "package-lock.json",
        "yarn.lock",
        "poetry.lock",
        "Gemfile.lock",
        "Pipfile.lock",
        "composer.lock",
        "go.sum",
        "Cargo.lock",
        "pnpm-lock.yaml",
        "bun.lockb",
        // Claude settings
        "settings.json",
        "claude.json",
        ".claude-config.json",
      ],
      directories: [
        "node_modules",
        ".git",
        "dist",
        "build",
        "vendor",
        "__pycache__",
        "coverage",
        "target",
        ".next",
        ".nuxt",
        "out",
        "tmp",
        "temp",
        // Claude directories
        "commands",
        "user",
      ],
      paths: [
        "/.claude/commands/",
        "/.claude/user/",
        "/tmp/",
        "/temp/",
        "/.env",
        "/.secret",
        "/secrets/",
        "/credentials/",
        "/keys/",
      ],
      contentTypes: [
        "!`", // Claude command execution syntax
        "!bash", // Bash command indicators
        "!sh", // Shell command indicators
        "!zsh", // Zsh command indicators
        "-----BEGIN", // PEM/certificate files
        "PRIVATE KEY", // Private key files
        "API_KEY", // API key patterns
        "SECRET", // Secret patterns
        "PASSWORD", // Password patterns
        "TOKEN", // Token patterns
      ],
      maxFileSize: "1MB",
      perToolExclusions: {
        "devskim": [
          "**/.claude/commands/**",
          "**/test/**",
          "**/spec/**",
          "**/*.test.*",
          "**/*.spec.*",
        ],
        "semgrep": [
          "**/.claude/commands/**",
          "**/node_modules/**",
          "**/vendor/**",
        ],
        "aichaku-patterns": [
          "**/.claude/commands/**",
          "**/secrets/**",
          "**/credentials/**",
        ],
        "aichaku-owasp": [
          "**/.claude/commands/**",
          "**/test/**",
          "**/mock/**",
        ],
      },
    };

    this.config = useDefaults ? this.mergeConfig(this.defaultExclusions, config) : config;
  }

  /**
   * Get detailed exclusion reason for a file
   * InfoSec: Primary security gate with detailed reporting
   */
  async getExclusionReason(
    filePath: string,
    content?: string,
    tool?: string,
  ): Promise<{ shouldExclude: boolean; reason: string }> {
    try {
      // Security: Resolve path to prevent traversal attacks
      const resolvedPath = resolve(filePath);

      // Check file extension exclusions
      if (this.config.extensions?.some((ext) => resolvedPath.endsWith(ext))) {
        const ext = this.config.extensions.find((ext) => resolvedPath.endsWith(ext));
        return {
          shouldExclude: true,
          reason: `File extension excluded: ${ext}`,
        };
      }

      // Check glob pattern exclusions
      const matchedPattern = this.config.patterns?.find((pattern) => minimatch(resolvedPath, pattern));
      if (matchedPattern) {
        return {
          shouldExclude: true,
          reason: `File path matches exclusion pattern: ${matchedPattern}`,
        };
      }

      // Check specific file exclusions
      const fileName = basename(resolvedPath);
      if (this.config.files?.includes(fileName)) {
        return {
          shouldExclude: true,
          reason: `File name excluded: ${fileName}`,
        };
      }

      // Check directory exclusions
      const matchedDir = this.config.directories?.find((dir) => resolvedPath.includes(`/${dir}/`));
      if (matchedDir) {
        return {
          shouldExclude: true,
          reason: `File in excluded directory: ${matchedDir}`,
        };
      }

      // Check path exclusions
      const matchedPath = this.config.paths?.find((path) => resolvedPath.includes(path));
      if (matchedPath) {
        return {
          shouldExclude: true,
          reason: `File path contains excluded path: ${matchedPath}`,
        };
      }

      // Check content-based exclusions
      if (content) {
        const matchedContent = this.config.contentTypes?.find((pattern) => content.includes(pattern));
        if (matchedContent) {
          return {
            shouldExclude: true,
            reason: `File content contains excluded pattern: ${matchedContent}`,
          };
        }
      }

      // Check tool-specific exclusions
      if (tool && this.config.perToolExclusions?.[tool]) {
        const toolExclusions = this.config.perToolExclusions[tool];
        const matchedToolPattern = toolExclusions.find((pattern) => minimatch(resolvedPath, pattern));
        if (matchedToolPattern) {
          return {
            shouldExclude: true,
            reason: `File excluded for tool ${tool}: ${matchedToolPattern}`,
          };
        }
      }

      // Check file size exclusions
      if (this.config.maxFileSize) {
        try {
          const stats = await Deno.stat(resolvedPath);
          const maxSize = this.parseSize(this.config.maxFileSize);
          if (stats.size > maxSize) {
            return {
              shouldExclude: true,
              reason: `File size (${stats.size} bytes) exceeds maximum (${this.config.maxFileSize})`,
            };
          }
        } catch {
          // If we can't stat the file, don't exclude it based on size
        }
      }

      return { shouldExclude: false, reason: "" };
    } catch (error) {
      // If path resolution fails, exclude the file for security
      const errorMsg = `Failed to process path ${filePath}: ${error}`;
      console.warn(`FileFilter: ${errorMsg}`);
      return { shouldExclude: true, reason: `Security: ${errorMsg}` };
    }
  }

  /**
   * Check if a file should be excluded from processing
   * InfoSec: Primary security gate for file processing
   */
  async shouldExcludeFile(
    filePath: string,
    content?: string,
    tool?: string,
  ): Promise<boolean> {
    const result = await this.getExclusionReason(filePath, content, tool);
    return result.shouldExclude;
  }

  /**
   * Check if file contains sensitive patterns
   * InfoSec: Content-based security scanning
   */
  async containsSensitiveContent(filePath: string): Promise<boolean> {
    try {
      const content = await Deno.readTextFile(filePath);

      // Check for Claude command patterns
      if (
        content.includes("!`") || content.includes("allowed-tools:") ||
        content.includes("$ARGUMENTS")
      ) {
        return true;
      }

      // Check for security-sensitive patterns
      const sensitivePatterns = [
        /-----BEGIN [A-Z ]+-----/,
        /PRIVATE KEY/,
        /API_KEY\s*[:=]\s*['"]\w+['"]/,
        /SECRET\s*[:=]\s*['"]\w+['"]/,
        /PASSWORD\s*[:=]\s*['"]\w+['"]/,
        /TOKEN\s*[:=]\s*['"]\w+['"]/,
        /aws_access_key_id/i,
        /aws_secret_access_key/i,
        /github_token/i,
        /slack_token/i,
        /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
      ];

      return sensitivePatterns.some((pattern) => pattern.test(content));
    } catch {
      return false;
    }
  }

  /**
   * Get exclusion statistics for reporting
   */
  getExclusionStats(): {
    totalPatterns: number;
    extensionCount: number;
    patternCount: number;
    fileCount: number;
    directoryCount: number;
    pathCount: number;
    contentTypeCount: number;
  } {
    return {
      totalPatterns: this.getTotalPatternCount(),
      extensionCount: this.config.extensions?.length || 0,
      patternCount: this.config.patterns?.length || 0,
      fileCount: this.config.files?.length || 0,
      directoryCount: this.config.directories?.length || 0,
      pathCount: this.config.paths?.length || 0,
      contentTypeCount: this.config.contentTypes?.length || 0,
    };
  }

  /**
   * Get human-readable exclusion summary
   */
  getExclusionSummary(): string {
    const stats = this.getExclusionStats();
    return `${stats.totalPatterns} exclusion patterns active (${stats.extensionCount} extensions, ${stats.patternCount} patterns, ${stats.fileCount} files, ${stats.pathCount} paths, ${stats.contentTypeCount} content types)`;
  }

  /**
   * Validate configuration for security issues
   * InfoSec: Prevent malicious configuration
   */
  validateConfig(): string[] {
    const errors: string[] = [];

    // Check for potential ReDoS patterns
    const patterns = [
      ...(this.config.patterns || []),
      ...(this.config.contentTypes || []),
    ];
    for (const pattern of patterns) {
      if (this.looksLikeReDoSPattern(pattern)) {
        errors.push(`Potentially dangerous regex pattern: ${pattern}`);
      }
    }

    // Validate file size format
    if (this.config.maxFileSize) {
      try {
        this.parseSize(this.config.maxFileSize);
      } catch (error) {
        errors.push(
          `Invalid file size format: ${this.config.maxFileSize} - ${error}`,
        );
      }
    }

    return errors;
  }

  private mergeConfig(
    defaults: BlocklistConfig,
    custom: BlocklistConfig,
  ): BlocklistConfig {
    return {
      extensions: [
        ...(defaults.extensions || []),
        ...(custom.extensions || []),
      ],
      patterns: [...(defaults.patterns || []), ...(custom.patterns || [])],
      files: [...(defaults.files || []), ...(custom.files || [])],
      directories: [
        ...(defaults.directories || []),
        ...(custom.directories || []),
      ],
      paths: [...(defaults.paths || []), ...(custom.paths || [])],
      contentTypes: [
        ...(defaults.contentTypes || []),
        ...(custom.contentTypes || []),
      ],
      maxFileSize: custom.maxFileSize || defaults.maxFileSize,
      perToolExclusions: {
        ...defaults.perToolExclusions,
        ...custom.perToolExclusions,
      },
    };
  }

  private parseSize(sizeStr: string): number {
    const units = {
      "B": 1,
      "KB": 1024,
      "MB": 1024 * 1024,
      "GB": 1024 * 1024 * 1024,
    };

    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
    if (!match) {
      throw new Error(
        `Invalid size format: ${sizeStr}. Expected format: "1MB", "500KB", etc.`,
      );
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase() as keyof typeof units;

    return value * units[unit];
  }

  private getTotalPatternCount(): number {
    return (
      (this.config.extensions?.length || 0) +
      (this.config.patterns?.length || 0) +
      (this.config.files?.length || 0) +
      (this.config.directories?.length || 0) +
      (this.config.paths?.length || 0) +
      (this.config.contentTypes?.length || 0)
    );
  }

  private looksLikeReDoSPattern(pattern: string): boolean {
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
}

/**
 * Create a file filter with configuration
 */
export function createFileFilter(config: ReviewerConfig = {}): FileFilter {
  return new FileFilter(config.exclude || {}, !config.noDefaultExclusions);
}

/**
 * Quick utility to check if a file should be excluded
 */
export async function shouldExcludeFile(
  filePath: string,
  config: ReviewerConfig = {},
  content?: string,
  tool?: string,
): Promise<boolean> {
  const filter = createFileFilter(config);
  return await filter.shouldExcludeFile(filePath, content, tool);
}
