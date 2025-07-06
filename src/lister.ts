import type { ListResult } from "./types.ts";

/**
 * List available and installed methodologies
 *
 * @returns Promise containing available and installed methodologies
 *
 * @example
 * ```typescript
 * const { available, installed } = await list();
 * console.log(`Available: ${available.length} methodologies`);
 * console.log(`Installed globally: ${installed.global.length}`);
 * console.log(`Installed locally: ${installed.local.length}`);
 * ```
 *
 * @public
 */
export function list(): Promise<ListResult> {
  // TODO: Implement listing functionality
  return Promise.resolve({
    available: [
      {
        name: "shape-up",
        description: "Shape Up methodology optimized for AI execution",
        version: "1.0.0",
        author: "Basecamp (AI-optimized)",
        structure: {
          commands: true,
          methods: true,
          personas: true,
          templates: true,
          scripts: true,
        },
      },
    ],
    installed: {
      global: [],
      local: [],
    },
  });
}
