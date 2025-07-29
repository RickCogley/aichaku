#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Clean up the project node from aichaku.json files
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

async function cleanProjectNode(configPath: string): Promise<void> {
  if (!await exists(configPath)) {
    console.log(`Skipping ${configPath} - not found`);
    return;
  }

  try {
    const content = await Deno.readTextFile(configPath);
    const config = JSON.parse(content);

    if (config.project) {
      console.log(`Removing project node from ${configPath}`);
      delete config.project;

      await Deno.writeTextFile(
        configPath,
        JSON.stringify(config, null, 2) + "\n",
      );
      console.log(`✅ Updated ${configPath}`);
    } else {
      console.log(`✅ ${configPath} - no project node found`);
    }
  } catch (error) {
    console.error(`Failed to process ${configPath}:`, error);
  }
}

// Clean up in current project
const projectConfig = join(Deno.cwd(), ".claude", "aichaku", "aichaku.json");
await cleanProjectNode(projectConfig);

// Clean up global config
const globalConfig = join(Deno.env.get("HOME") || "", ".claude", "aichaku", ".aichaku.json");
await cleanProjectNode(globalConfig);

console.log("\nDone! Project nodes have been removed.");
