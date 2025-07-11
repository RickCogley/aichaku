#!/usr/bin/env -S deno run -A

import { FolderMigration } from "./src/migration/folder-migration.ts";
import { Logger } from "./src/utils/logger.ts";

const logger = new Logger({ silent: false, verbose: true });
const migration = new FolderMigration(logger);

console.log("🪴 Testing Aichaku Migration\n");

// Check if migration is needed
const projectPath = Deno.cwd();
console.log(`Project path: ${projectPath}`);

// Check global migration
const globalNeeded = await migration.isMigrationNeeded();
console.log(`Global migration needed: ${globalNeeded}`);

// Check custom standards migration
const customNeeded = await migration.isCustomStandardsMigrationNeeded();
console.log(`Custom standards migration needed: ${customNeeded}`);

// Let's do a dry run for the project
console.log("\n--- Project Migration Dry Run ---");
const result = await migration.migrateProject(projectPath, {
  dryRun: true,
  verbose: true,
});

console.log(`\nResult: ${result.success ? "✅ Success" : "❌ Failed"}`);
console.log(`Items to migrate: ${result.itemsMigrated}`);
console.log(`Items to skip: ${result.itemsSkipped}`);
if (result.errors.length > 0) {
  console.log(`Errors: ${result.errors.join(", ")}`);
}
