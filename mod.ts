/**
 * Aichaku (愛着) - Adaptive methodology support for Claude Code
 *
 * Helps Claude Code understand your development workflow by providing natural language
 * methodology detection and YAML-based configuration management. Install once globally,
 * use across all projects with 96% context reduction (12K→4K tokens).
 *
 * @example Quick start via CLI
 * ```bash
 * # Install from JSR
 * deno install -g -A -n aichaku jsr:@rick/aichaku/cli
 *
 * # Set up once globally
 * aichaku init --global
 * cd your-project
 * aichaku init
 * aichaku integrate
 *
 * # Now Claude understands "let's shape up a feature" or "start a sprint"
 * ```
 *
 * @example Programmatic usage
 * ```typescript
 * import { init, integrate, standards } from "jsr:@rick/aichaku";
 *
 * // Initialize project with methodologies
 * await init({ global: false });
 *
 * // Add standards and integrate
 * await standards({ add: ["tdd", "owasp-web"] });
 * await integrate();
 * ```
 *
 * @example Advanced features
 * ```typescript
 * import { hooks, review } from "jsr:@rick/aichaku";
 *
 * // Auto session summaries
 * await hooks({ install: "essential", global: true });
 *
 * // Code review with OWASP/NIST compliance
 * const results = await review("src/auth.ts");
 * ```
 *
 * ## Core Capabilities
 *
 * - **Natural Language** - Say "sprint" → Scrum, "shaping" → Shape Up
 * - **YAML Configuration** - Compact, modular, version-controlled directives
 * - **Methodology Blending** - Mix Shape Up, Scrum, Kanban, XP, Lean
 * - **Standards Integration** - OWASP, TDD, Clean Architecture, NIST-CSF
 * - **Specialized Agents** - Security, API, Documentation, Code Explorer
 * - **MCP Server** - Advanced project analysis and documentation generation
 * - **Session Management** - Auto-summaries, hooks, progress tracking
 *
 * ## Architecture
 *
 * Global installation (`~/.claude/aichaku/`) stores methodologies and config.
 * Projects reference globally, never copy files. Updates propagate instantly.
 * YAML-based config system replaces massive markdown with compact directives.
 *
 * Current version: 0.40.1
 *
 * @author Rick Cogley
 * @license MIT
 * @see {@link https://github.com/RickCogley/aichaku} Repository
 * @see {@link https://jsr.io/@rick/aichaku} JSR Package
 * @see {@link https://aichaku.esolia.deno.net/} API Documentation
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
export { mergeDocs } from "./src/commands/merge-docs.ts";
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
