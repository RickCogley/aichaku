/**
 * Aichaku (愛着) provides adaptive methodology support for Claude Code that blends
 * approaches based on how you naturally work. Rather than forcing you to choose a
 * methodology, Aichaku installs all of them and helps Claude Code adapt to your
 * terminology and context.
 *
 * | **Aichaku** | **Specifications** |
 * | :------- | :------- |
 * | Version | 0.35.7 |
 * | Repository | {@link https://github.com/RickCogley/aichaku} |
 * | JSR Package | {@link https://jsr.io/@rick/aichaku} |
 * | License | MIT |
 * | Author | Rick Cogley |
 *
 * ## Core Features
 *
 * - **🔄 Adaptive Blending** - Methodologies adapt to your natural language
 * - **📦 All-in-One Install** - Shape Up, Scrum, Kanban, Lean, XP, and Scrumban included
 * - **🧠 Context Aware** - AI responds to your terminology and needs
 * - **📁 User Customization** - Your modifications survive upgrades
 * - **🚀 Simple Lifecycle** - Just init, upgrade, and uninstall
 * - **🔄 Auto-updating** - Upgrade command always fetches latest methodology content
 * - **🔒 Security First** - Path validation, no network operations, minimal permissions
 * - **🎯 Zero Configuration** - Works out of the box with sensible defaults
 *
 * ## Quick Start
 *
 * @example Install globally via CLI
 * ```bash
 * # Install aichaku CLI globally
 * deno install -g -A -n aichaku jsr:@rick/aichaku/cli
 *
 * # Initialize global methodologies (one time)
 * aichaku init --global
 *
 * # In any project:
 * aichaku init  # Creates minimal setup
 * # Prompts to integrate with CLAUDE.md automatically
 * ```
 *
 * @example Programmatic usage
 * ```typescript
 * import { init } from "jsr:@rick/aichaku";
 *
 * // Initialize with all methodologies
 * const result = await init({
 *   global: false,
 *   force: false,
 *   silent: false
 * });
 *
 * if (result.success) {
 *   console.log(`Initialized at ${result.path}`);
 * }
 * ```
 *
 * @example Upgrade to latest version
 * ```typescript
 * import { upgrade } from "jsr:@rick/aichaku";
 *
 * // Upgrade global installation (updates all methodology files)
 * const result = await upgrade({ global: true });
 *
 * // Upgrade project (updates methodologies + CLAUDE.md)
 * const projectResult = await upgrade();
 * console.log(`Upgraded to ${projectResult.version}`);
 *
 * // Note: Upgrades always download the latest methodology files
 * // to ensure you have the most up-to-date content
 * ```
 *
 * @example Add Aichaku reference to project
 * ```typescript
 * import { integrate } from "jsr:@rick/aichaku";
 *
 * // Add to current project's CLAUDE.md
 * const result = await integrate();
 *
 * // Add to specific project
 * const result = await integrate({ projectPath: "/path/to/project" });
 * ```
 *
 * ## Adaptive System
 *
 * Aichaku uses a simple 3-mode system that adapts to your context:
 *
 * - **PLANNING MODE** - When starting something new (shaping, sprint planning)
 * - **EXECUTION MODE** - When actively working (building, coding, testing)
 * - **IMPROVEMENT MODE** - When reflecting and optimizing (retrospectives, refactoring)
 *
 * The AI blends methodologies based on your language. Say "sprint" and get Scrum
 * practices; mention "shaping" and get Shape Up principles - all seamlessly integrated.
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

// Export new command functions
export { init } from "./src/commands/init.ts";
export { upgrade } from "./src/commands/upgrade.ts";
export { uninstall } from "./src/commands/uninstall.ts";
export { integrate } from "./src/commands/integrate.ts";
export { help } from "./src/commands/help.ts";
export { learn } from "./src/commands/learn.ts";
export { standards } from "./src/commands/standards.ts";
export { methodologies } from "./src/commands/methodologies.ts";
export { docsStandard } from "./src/commands/docs-standard.ts";
export { cleanup } from "./src/commands/cleanup.ts";
export { hooks } from "./src/commands/hooks.ts";
export { review } from "./src/commands/review.ts";

// Keep legacy exports for backward compatibility
export { install } from "./src/installer.ts";
export { list } from "./src/lister.ts";
export { update } from "./src/updater.ts";

// Export types
export type {
  DocumentationStandard,
  DocumentationStandardConfig,
  InstallOptions,
  InstallResult,
  ListResult,
  Methodology,
} from "./src/types.ts";

// Re-export version from auto-generated version.ts
export { APP_INFO, BUILD_INFO, VERSION } from "./version.ts";
