import type { ListResult } from "./types.ts";

/**
 * List available and installed methodologies
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
