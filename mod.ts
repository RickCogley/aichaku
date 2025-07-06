/**
 * Aichaku (愛着) is an AI-optimized project methodology installer for Claude Code that brings
 * affection and attachment to your development workflow by providing contextual, mode-aware
 * methodology guidance for AI pair programming.
 *
 * | **Aichaku** | **Specifications** |
 * | :------- | :------- |
 * | Version | 0.2.2 |
 * | Repository | {@link https://github.com/RickCogley/aichaku} |
 * | JSR Package | {@link https://jsr.io/@rick/aichaku} |
 * | Documentation | {@link https://aichaku.esolia.deno.net/} |
 * | License | MIT |
 * | Author | Rick Cogley |
 *
 * ## Core Features
 *
 * - **🤖 AI-First Design** - Methodologies optimized for AI pair programming
 * - **🎭 Smart Mode Detection** - Automatically detects context and switches between planning, execution, and improvement modes
 * - **📦 Multiple Methodologies** - Shape Up, Scrum, Kanban, Lean, and XP support
 * - **🔒 Security First** - Path validation, no network operations, minimal permissions
 * - **🚀 Zero Configuration** - Works out of the box with sensible defaults
 * - **📝 Rich Templates** - Comprehensive templates for each methodology
 * - **🛠️ Extensible** - Easy to add new methodologies or customize existing ones
 *
 * ## Quick Start
 *
 * @example Install globally via CLI
 * ```bash
 * # Install aichaku globally
 * deno install -A -n aichaku jsr:@rick/aichaku/cli
 *
 * # Install Shape Up methodology to your project
 * aichaku shape-up
 *
 * # Install globally for all projects
 * aichaku shape-up --global
 * ```
 *
 * @example Programmatic usage
 * ```typescript
 * import { install } from "jsr:@rick/aichaku";
 *
 * // Install Shape Up methodology locally
 * const result = await install("shape-up", {
 *   projectPath: "./.claude",
 *   force: false,
 *   silent: false
 * });
 *
 * if (result.success) {
 *   console.log(`Installed to ${result.path}`);
 * }
 * ```
 *
 * @example List available methodologies
 * ```typescript
 * import { list } from "jsr:@rick/aichaku";
 *
 * const { available, installed } = await list();
 * console.log(`Available: ${available.map(m => m.name).join(", ")}`);
 * ```
 *
 * ## Mode System
 *
 * Aichaku uses a simple 3-mode system that AI assistants can detect:
 *
 * - **PLANNING MODE** - When starting something new (bet shaping, sprint planning)
 * - **EXECUTION MODE** - When actively working (building, coding, testing)
 * - **IMPROVEMENT MODE** - When reflecting and optimizing (retrospectives, refactoring)
 *
 * ## Security
 *
 * Following OWASP principles adapted for CLI tools:
 * - All file paths are validated against directory traversal
 * - No network operations or external dependencies
 * - Conservative file permissions on generated content
 * - No storage or logging of sensitive information
 *
 * @module
 */

export { install } from "./src/installer.ts";
export { list } from "./src/lister.ts";
export { update } from "./src/updater.ts";
export type {
  InstallOptions,
  InstallResult,
  ListResult,
  Methodology,
} from "./src/types.ts";

// Re-export version from auto-generated version.ts
export { APP_INFO, BUILD_INFO, VERSION } from "./version.ts";
