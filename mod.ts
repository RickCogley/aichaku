/**
 * aichaku (愛着) - AI-optimized project methodology installer for Claude Code
 *
 * Brings affection and attachment to your development workflow by installing
 * AI-friendly methodologies like Shape Up into your projects.
 *
 * @module
 */

export { install } from "./src/installer.ts";
export { list } from "./src/lister.ts";
export { update } from "./src/updater.ts";
export type { InstallOptions, Methodology } from "./src/types.ts";

// Re-export version from auto-generated version.ts
export { APP_INFO, BUILD_INFO, VERSION } from "./version.ts";

/**
 * Example usage:
 * ```typescript
 * import { install } from "jsr:@rick/aichaku";
 *
 * // Install Shape Up methodology globally
 * await install("shape-up", { global: true });
 *
 * // Install to current project
 * await install("shape-up", { projectPath: "./.claude" });
 * ```
 */
