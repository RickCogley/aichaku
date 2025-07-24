import type { ListResult, Methodology } from "./types.ts";
import { discoverContent } from "./utils/dynamic-content-discovery.ts";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { getAichakuPaths } from "./paths.ts";

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
export async function list(): Promise<ListResult> {
  // Discover available methodologies dynamically
  const discovered = await discoverContent("methodologies", Deno.cwd(), false);

  // Convert discovered content to Methodology format
  const available: Methodology[] = [];

  for (const [_category, items] of Object.entries(discovered.categories)) {
    for (const item of items) {
      const name = item.path.split("/")[0]; // Get methodology name from path

      // Check if we already added this methodology
      if (available.some((m) => m.name === name)) {
        continue;
      }

      // Check what structure exists for this methodology
      const methodologyPath = join(Deno.cwd(), "methodologies", name);
      const structure = {
        commands: await exists(join(methodologyPath, "COMMANDS.md")),
        methods: await exists(join(methodologyPath, "methods")) ||
          await exists(
            join(methodologyPath, `${name}.md`),
          ),
        personas: false, // Personas are deprecated in the new structure
        templates: await exists(join(methodologyPath, "templates")),
        scripts: await exists(join(methodologyPath, "scripts")),
      };

      available.push({
        name,
        description: item.description ||
          `${name} methodology optimized for AI execution`,
        version: "1.0.0",
        author: "AI-optimized",
        structure,
      });
    }
  }

  // Check for installed methodologies
  const paths = getAichakuPaths();
  const installed = {
    global: [] as Methodology[],
    local: [] as Methodology[],
  };

  // Check global installation
  if (await exists(paths.global.methodologies)) {
    const globalDiscovered = await discoverContent(
      "methodologies",
      paths.global.root,
      false,
    );
    for (const methodology of available) {
      if (
        globalDiscovered.items.some((item) => item.path.startsWith(methodology.name))
      ) {
        installed.global.push(methodology);
      }
    }
  }

  // Check local installation
  const localMethodPath = join(Deno.cwd(), ".claude", "methodologies");
  if (await exists(localMethodPath)) {
    const localDiscovered = await discoverContent(
      "methodologies",
      join(Deno.cwd(), ".claude"),
      false,
    );
    for (const methodology of available) {
      if (
        localDiscovered.items.some((item) => item.path.startsWith(methodology.name))
      ) {
        installed.local.push(methodology);
      }
    }
  }

  return {
    available,
    installed,
  };
}
