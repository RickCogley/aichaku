/**
 * Tests for folder migration module
 */

import { assertEquals, assertExists, assertRejects, ensureDir, exists, join } from "../../deps.ts";
import { FolderMigration, runMigration } from "./folder-migration.ts";
import { Logger } from "../utils/logger.ts";

// Create a test directory structure
async function createTestStructure(basePath: string, isProject = false) {
  const oldRoot = isProject ? join(basePath, ".claude") : join(basePath, ".claude");
  
  // Create old structure
  await ensureDir(join(oldRoot, "methodologies", "shape-up"));
  await ensureDir(join(oldRoot, "standards", "owasp"));
  await ensureDir(join(oldRoot, "scripts"));
  await ensureDir(join(oldRoot, "output", "active-test"));
  await ensureDir(join(oldRoot, "user"));
  
  // Create test files
  await Deno.writeTextFile(join(oldRoot, "commands.json"), '{"test": "command"}');
  await Deno.writeTextFile(join(oldRoot, ".aichaku-project"), "test-project");
  await Deno.writeTextFile(join(oldRoot, "CLAUDE.md"), "# Test CLAUDE.md");
  await Deno.writeTextFile(join(oldRoot, "settings.local.json"), '{"test": true}');
  await Deno.writeTextFile(join(oldRoot, "methodologies", "shape-up", "README.md"), "# Shape Up");
  await Deno.writeTextFile(join(oldRoot, "standards", "owasp", "OWASP.md"), "# OWASP");
  await Deno.writeTextFile(join(oldRoot, "output", "active-test", "test.md"), "# Test");
}

// Clean up test directory
async function cleanupTestDir(basePath: string) {
  try {
    await Deno.remove(basePath, { recursive: true });
  } catch {
    // Ignore errors
  }
}

Deno.test("FolderMigration - isMigrationNeeded detects old structure", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);
  
  const migration = new FolderMigration(new Logger({ silent: true }));
  // Override homeDir for testing
  (migration as any).homeDir = testHome;
  (migration as any).oldRoot = join(testHome, ".claude");
  (migration as any).newRoot = join(testHome, ".claude", "aichaku");
  
  const needed = await migration.isMigrationNeeded();
  assertEquals(needed, true);
  
  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - isMigrationNeeded returns false when new structure exists", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);
  
  // Create new structure
  await ensureDir(join(testHome, ".claude", "aichaku"));
  
  const migration = new FolderMigration(new Logger({ silent: true }));
  (migration as any).homeDir = testHome;
  (migration as any).oldRoot = join(testHome, ".claude");
  (migration as any).newRoot = join(testHome, ".claude", "aichaku");
  
  const needed = await migration.isMigrationNeeded();
  assertEquals(needed, false);
  
  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - global migration dry run", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);
  
  const migration = new FolderMigration(new Logger({ silent: true }));
  (migration as any).homeDir = testHome;
  (migration as any).oldRoot = join(testHome, ".claude");
  (migration as any).newRoot = join(testHome, ".claude", "aichaku");
  
  const result = await migration.migrateGlobal({ dryRun: true });
  
  assertEquals(result.success, true);
  assertEquals(result.itemsMigrated > 0, true);
  
  // Verify nothing was actually moved
  assertExists(await exists(join(testHome, ".claude", "methodologies")));
  assertEquals(await exists(join(testHome, ".claude", "aichaku", "methodologies")), false);
  
  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - global migration moves correct files", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);
  
  const migration = new FolderMigration(new Logger({ silent: true }));
  (migration as any).homeDir = testHome;
  (migration as any).oldRoot = join(testHome, ".claude");
  (migration as any).newRoot = join(testHome, ".claude", "aichaku");
  
  const result = await migration.migrateGlobal();
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  
  // Verify files were moved to new location
  assertExists(await exists(join(testHome, ".claude", "aichaku", "methodologies")));
  assertExists(await exists(join(testHome, ".claude", "aichaku", "standards")));
  assertExists(await exists(join(testHome, ".claude", "aichaku", "commands.json")));
  assertExists(await exists(join(testHome, ".claude", "aichaku", ".aichaku-project")));
  
  // Verify user files stayed in place
  assertExists(await exists(join(testHome, ".claude", "output")));
  assertExists(await exists(join(testHome, ".claude", "user")));
  assertExists(await exists(join(testHome, ".claude", "CLAUDE.md")));
  assertExists(await exists(join(testHome, ".claude", "settings.local.json")));
  
  // Verify old aichaku files were removed
  assertEquals(await exists(join(testHome, ".claude", "methodologies")), false);
  assertEquals(await exists(join(testHome, ".claude", "standards")), false);
  
  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - project migration", async () => {
  const testDir = await Deno.makeTempDir();
  const projectDir = join(testDir, "project");
  await createTestStructure(projectDir, true);
  
  const migration = new FolderMigration(new Logger({ silent: true }));
  const result = await migration.migrateProject(projectDir);
  
  assertEquals(result.success, true);
  
  // Verify aichaku files were moved
  assertExists(await exists(join(projectDir, ".claude", "aichaku", ".aichaku-project")));
  
  // Verify user files stayed in place
  assertExists(await exists(join(projectDir, ".claude", "CLAUDE.md")));
  assertExists(await exists(join(projectDir, ".claude", "settings.local.json")));
  assertExists(await exists(join(projectDir, ".claude", "output")));
  
  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - backup creation", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);
  
  const migration = new FolderMigration(new Logger({ silent: true }));
  (migration as any).homeDir = testHome;
  (migration as any).oldRoot = join(testHome, ".claude");
  (migration as any).newRoot = join(testHome, ".claude", "aichaku");
  
  const result = await migration.migrateGlobal({ backup: true });
  
  assertEquals(result.success, true);
  assertEquals(result.backupPath !== undefined, true);
  assertExists(await exists(result.backupPath!));
  
  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - verify migration", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);
  
  const migration = new FolderMigration(new Logger({ silent: true }));
  (migration as any).homeDir = testHome;
  (migration as any).oldRoot = join(testHome, ".claude");
  (migration as any).newRoot = join(testHome, ".claude", "aichaku");
  
  // Perform migration
  await migration.migrateGlobal();
  
  // Verify
  const verified = await migration.verifyMigration();
  assertEquals(verified, true);
  
  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - rollback with backup", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);
  
  const migration = new FolderMigration(new Logger({ silent: true }));
  (migration as any).homeDir = testHome;
  (migration as any).oldRoot = join(testHome, ".claude");
  (migration as any).newRoot = join(testHome, ".claude", "aichaku");
  
  // Perform migration with backup
  const result = await migration.migrateGlobal({ backup: true });
  assertEquals(result.success, true);
  
  // Verify new structure exists
  assertExists(await exists(join(testHome, ".claude", "aichaku", "methodologies")));
  
  // Rollback
  const rollbackSuccess = await migration.rollbackMigration(result.backupPath!);
  assertEquals(rollbackSuccess, true);
  
  // Verify old structure is restored
  assertExists(await exists(join(testHome, ".claude", "methodologies")));
  assertEquals(await exists(join(testHome, ".claude", "aichaku")), false);
  
  await cleanupTestDir(testDir);
});

Deno.test("runMigration - convenience function with project", async () => {
  const testDir = await Deno.makeTempDir();
  const projectDir = join(testDir, "project");
  await createTestStructure(projectDir, true);
  
  const logger = new Logger({ silent: true });
  const result = await runMigration({ projectPath: projectDir, logger });
  
  assertEquals(result.success, true);
  
  await cleanupTestDir(testDir);
});

Deno.test("runMigration - throws without options", async () => {
  await assertRejects(
    async () => {
      await runMigration({ global: false });
    },
    Error,
    "Must specify either global migration or project path"
  );
});