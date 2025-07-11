/**
 * Privacy utilities for statistics tracking
 * Ensures sensitive data is properly anonymized or excluded
 */

import type { StatisticsConfig } from "./types.ts";

/**
 * Hash utility for anonymizing identifiers
 */
export class PrivacyHasher {
  private static encoder = new TextEncoder();

  /**
   * Generate a consistent hash for anonymization
   */
  static async hash(input: string): Promise<string> {
    const data = this.encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Create a short hash for display purposes
   */
  static async shortHash(input: string): Promise<string> {
    const fullHash = await this.hash(input);
    return fullHash.substring(0, 8);
  }
}

/**
 * File path anonymization utilities
 */
export class FilePathAnonymizer {
  private static sensitivePatterns = [
    /\/Users\/[^\/]+/g, // User home directories
    /\/home\/[^\/]+/g, // Linux home directories
    /C:\\Users\\[^\\]+/g, // Windows user directories
    /\/tmp\/[^\/]+/g, // Temp directories with user data
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
  ];

  /**
   * Anonymize file paths while preserving useful structure
   */
  static async anonymize(
    filePath: string,
    config: StatisticsConfig,
  ): Promise<string> {
    if (!config.privacy.anonymizeFilePaths) {
      return filePath;
    }

    let anonymized = filePath;

    // Replace sensitive patterns
    for (const pattern of this.sensitivePatterns) {
      const matches = anonymized.match(pattern);
      if (matches) {
        for (const match of matches) {
          const hash = await PrivacyHasher.shortHash(match);
          anonymized = anonymized.replace(match, `<user-${hash}>`);
        }
      }
    }

    // Process async replacements
    const promises: Promise<string>[] = [];
    const placeholders: string[] = [];

    for (const pattern of this.sensitivePatterns) {
      const matches = [...filePath.matchAll(pattern)];
      for (const match of matches) {
        const placeholder = `__PLACEHOLDER_${promises.length}__`;
        placeholders.push(placeholder);
        promises.push(
          PrivacyHasher.shortHash(match[0]).then((hash) => `<user-${hash}>`),
        );
      }
    }

    if (promises.length > 0) {
      const replacements = await Promise.all(promises);
      let result = filePath;

      let i = 0;
      for (const pattern of this.sensitivePatterns) {
        result = result.replace(pattern, () => {
          return replacements[i++] || "<user-hash>";
        });
      }

      return result;
    }

    return anonymized;
  }

  /**
   * Extract file type without revealing sensitive path information
   */
  static getFileType(filePath: string): string {
    const parts = filePath.split(/[\/\\]/);
    const filename = parts[parts.length - 1];
    const extension = filename.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "ts":
      case "tsx":
        return "TypeScript";
      case "js":
      case "jsx":
        return "JavaScript";
      case "py":
        return "Python";
      case "rs":
        return "Rust";
      case "go":
        return "Go";
      case "java":
        return "Java";
      case "cpp":
      case "cc":
      case "cxx":
        return "C++";
      case "c":
        return "C";
      case "cs":
        return "C#";
      case "php":
        return "PHP";
      case "rb":
        return "Ruby";
      case "swift":
        return "Swift";
      case "kt":
        return "Kotlin";
      case "md":
        return "Markdown";
      case "yml":
      case "yaml":
        return "YAML";
      case "json":
        return "JSON";
      case "xml":
        return "XML";
      case "html":
        return "HTML";
      case "css":
        return "CSS";
      case "scss":
      case "sass":
        return "Sass";
      case "sh":
      case "bash":
        return "Shell";
      case "dockerfile":
        return "Dockerfile";
      case "sql":
        return "SQL";
      default:
        return "Unknown";
    }
  }

  /**
   * Get relative project path without revealing absolute paths
   */
  static getRelativeProjectPath(filePath: string): string {
    // Find common project markers
    const projectMarkers = [
      ".git",
      ".claude",
      "package.json",
      "Cargo.toml",
      "go.mod",
      "pyproject.toml",
    ];

    const parts = filePath.split(/[\/\\]/);
    let projectIndex = -1;

    for (let i = parts.length - 1; i >= 0; i--) {
      const _currentPath = parts.slice(0, i + 1).join("/");
      // This is a simplified check - in practice, you'd check for actual marker files
      if (
        projectMarkers.some((marker) => parts[i]?.includes(marker.split(".")[0]))
      ) {
        projectIndex = i;
        break;
      }
    }

    if (projectIndex >= 0) {
      return parts.slice(projectIndex).join("/");
    }

    // Fallback to last 3 path components
    return parts.slice(-3).join("/");
  }
}

/**
 * Data sanitization utilities
 */
export class DataSanitizer {
  /**
   * Sanitize tool arguments to remove sensitive data
   */
  static sanitizeArguments(
    args: Record<string, unknown>,
    config: StatisticsConfig,
  ): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(args)) {
      if (key === "file" && typeof value === "string") {
        sanitized[key] = FilePathAnonymizer.getRelativeProjectPath(value);
      } else if (key === "content" && config.privacy.excludeFileContents) {
        sanitized[key] = "<excluded>";
      } else if (typeof value === "string" && this.looksLikeSecret(value)) {
        sanitized[key] = "<redacted>";
      } else if (typeof value === "string" && this.looksLikeFilePath(value)) {
        sanitized[key] = FilePathAnonymizer.getRelativeProjectPath(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Check if a string looks like a secret (API key, token, etc.)
   */
  private static looksLikeSecret(value: string): boolean {
    // Common secret patterns
    const secretPatterns = [
      /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64 encoded
      /^[A-Fa-f0-9]{32,}$/, // Hex encoded
      /^sk-[A-Za-z0-9]{32,}$/, // OpenAI API key pattern
      /^ghp_[A-Za-z0-9]{36}$/, // GitHub personal access token
      /^gho_[A-Za-z0-9]{36}$/, // GitHub OAuth token
      /^ghu_[A-Za-z0-9]{36}$/, // GitHub user token
      /^ghs_[A-Za-z0-9]{36}$/, // GitHub server token
      /^ghr_[A-Za-z0-9]{36}$/, // GitHub refresh token
      /^xox[bpsa]-[A-Za-z0-9-]+$/, // Slack tokens
    ];

    return secretPatterns.some((pattern) => pattern.test(value));
  }

  /**
   * Check if a string looks like a file path
   */
  private static looksLikeFilePath(value: string): boolean {
    return value.includes("/") || value.includes("\\") || value.startsWith(".");
  }

  /**
   * Get file size category instead of exact size
   */
  static getFileSizeCategory(size: number): string {
    if (size < 1024) return "tiny"; // < 1KB
    if (size < 10240) return "small"; // < 10KB
    if (size < 102400) return "medium"; // < 100KB
    if (size < 1048576) return "large"; // < 1MB
    return "very-large"; // >= 1MB
  }

  /**
   * Create a privacy-compliant error message
   */
  static sanitizeError(error: Error, config: StatisticsConfig): string {
    let message = error.message;

    if (config.privacy.anonymizeFilePaths) {
      // Remove file paths from error messages
      message = message.replace(/\/[^\s]+/g, "<path>");
      message = message.replace(/[A-Z]:\\[^\s]+/g, "<path>");
    }

    if (config.privacy.excludeFileContents) {
      // Remove potential code snippets
      message = message.replace(/```[\s\S]*?```/g, "<code>");
      message = message.replace(/`[^`]+`/g, "<code>");
    }

    return message;
  }
}

/**
 * User identifier anonymization
 */
export class UserIdentifierAnonymizer {
  /**
   * Generate anonymous user ID based on environment
   */
  static async getAnonymousUserId(config: StatisticsConfig): Promise<string> {
    if (!config.privacy.hashUserIdentifiers) {
      return "user";
    }

    // Use environment-based identifier
    const identifiers = [
      Deno.env.get("USER"),
      Deno.env.get("USERNAME"),
      Deno.env.get("LOGNAME"),
      Deno.env.get("HOME"),
      Deno.env.get("USERPROFILE"),
    ].filter(Boolean);

    if (identifiers.length === 0) {
      return "anonymous";
    }

    const combined = identifiers.join("|");
    return await PrivacyHasher.shortHash(combined);
  }

  /**
   * Get machine identifier for analytics
   */
  static async getMachineId(config: StatisticsConfig): Promise<string> {
    if (!config.privacy.hashUserIdentifiers) {
      return "machine";
    }

    try {
      // Use hostname and platform as machine identifier
      const hostname = Deno.hostname();
      const platform = Deno.build.os;
      const arch = Deno.build.arch;

      const machineSignature = `${hostname}|${platform}|${arch}`;
      return await PrivacyHasher.shortHash(machineSignature);
    } catch {
      return "unknown-machine";
    }
  }
}
