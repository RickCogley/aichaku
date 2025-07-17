import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { VERSION } from "../../mod.ts";

// Fix for the upgrade command to handle multiple metadata locations
export async function findMetadataPath(
  targetPath: string,
  isGlobal: boolean,
): Promise<{
  path: string | null;
  version: string | null;
  needsMigration: boolean;
}> {
  const home = Deno.env.get("HOME") || "";

  // Possible metadata locations in order of preference (newest to oldest)
  const possiblePaths = isGlobal
    ? [
      join(home, ".claude", "aichaku", "config.json"), // New location
      join(home, ".claude", ".aichaku.json"), // Old location
      join(home, ".aichaku", ".aichaku.json"), // Very old location
    ]
    : [
      join(targetPath, "aichaku.json"), // Current location
      join(targetPath, ".aichaku.json"), // Old project location
      join(targetPath, ".aichaku-project"), // Very old project marker
    ];

  let foundPath: string | null = null;
  let version: string | null = null;
  let needsMigration = false;

  // Check each possible path
  for (const [index, path] of possiblePaths.entries()) {
    if (await exists(path)) {
      try {
        const content = await Deno.readTextFile(path);
        const data = JSON.parse(content);

        // Extract version from the metadata
        version = data.version || null;
        foundPath = path;

        // If we found it in an old location (index > 0), we need migration
        needsMigration = index > 0;

        break; // Use the first one we find
      } catch {
        // Skip if we can't read/parse the file
        continue;
      }
    }
  }

  return { path: foundPath, version, needsMigration };
}

// Function to migrate metadata to the new location
export async function migrateMetadata(
  oldPath: string,
  _newPath: string,
  metadata: unknown,
): Promise<void> {
  const home = Deno.env.get("HOME") || "";
  const newConfigPath = join(home, ".claude", "aichaku", "config.json");

  // Ensure the directory exists
  const dir = join(home, ".claude", "aichaku");
  await Deno.mkdir(dir, { recursive: true });

  // Update metadata with current info
  const metadataObj = metadata as Record<string, unknown>;
  const updatedMetadata = {
    ...metadataObj,
    version: metadataObj.version || VERSION, // Use current version if missing
    lastUpgrade: new Date().toISOString(),
    migratedFrom: oldPath,
  };

  // Write to new location
  await Deno.writeTextFile(
    newConfigPath,
    JSON.stringify(updatedMetadata, null, 2),
  );

  // Optionally remove old file (commented out for safety)
  // await Deno.remove(oldPath);
}
