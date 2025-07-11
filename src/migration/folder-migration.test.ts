/**
 * Tests for folder migration module
 */

import {
  assertEquals,
  assertExists,
  assertRejects,
  ensureDir,
  exists,
  join,
} from "../../deps.ts";
import { FolderMigration, runMigration } from "./folder-migration.ts";
import { Logger } from "../utils/logger.ts";

// Test helper class to access protected properties
class TestFolderMigration extends FolderMigration {
  setTestPaths(homeDir: string, oldRoot: string, newRoot: string) {
    this.homeDir = homeDir;
    this.oldRoot = oldRoot;
    this.newRoot = newRoot;
  }
}

// Create a test directory structure
async function createTestStructure(basePath: string, isProject = false) {
  const oldRoot = isProject
    ? join(basePath, ".claude")
    : join(basePath, ".claude");

  // Create old structure
  await ensureDir(join(oldRoot, "methodologies", "shape-up"));
  await ensureDir(join(oldRoot, "standards", "owasp"));
  await ensureDir(join(oldRoot, "scripts"));
  await ensureDir(join(oldRoot, "output", "active-test"));
  await ensureDir(join(oldRoot, "user"));

  // Create test files
  await Deno.writeTextFile(
    join(oldRoot, "commands.json"),
    '{"test": "command"}',
  );
  await Deno.writeTextFile(join(oldRoot, ".aichaku-project"), "test-project");
  await Deno.writeTextFile(join(oldRoot, "CLAUDE.md"), "# Test CLAUDE.md");
  await Deno.writeTextFile(
    join(oldRoot, "settings.local.json"),
    '{"test": true}',
  );

  // Add .aichaku-standards.json file for testing rename
  if (isProject) {
    await Deno.writeTextFile(
      join(oldRoot, ".aichaku-standards.json"),
      '["OWASP", "TDD"]',
    );
  }
  await Deno.writeTextFile(
    join(oldRoot, "methodologies", "shape-up", "README.md"),
    "# Shape Up",
  );
  await Deno.writeTextFile(
    join(oldRoot, "standards", "owasp", "OWASP.md"),
    "# OWASP",
  );
  await Deno.writeTextFile(
    join(oldRoot, "output", "active-test", "test.md"),
    "# Test",
  );
}

// Create a test directory structure with custom standards
async function createTestStructureWithCustomStandards(
  basePath: string,
  isProject = false,
) {
  await createTestStructure(basePath, isProject);

  const oldRoot = isProject
    ? join(basePath, ".claude")
    : join(basePath, ".claude");

  // Create legacy custom standards
  await ensureDir(join(oldRoot, "standards", "custom"));
  await Deno.writeTextFile(
    join(oldRoot, "standards", "custom", "my-custom-standard.md"),
    "# My Custom Standard",
  );
  await Deno.writeTextFile(
    join(oldRoot, "standards", "custom", "company-guidelines.md"),
    "# Company Guidelines",
  );
}

// Create a test structure with recent custom standards (already in aichaku)
async function createTestStructureWithRecentCustomStandards(
  basePath: string,
  isProject = false,
) {
  await createTestStructure(basePath, isProject);

  const _oldRoot = isProject
    ? join(basePath, ".claude")
    : join(basePath, ".claude");
  const newRoot = isProject
    ? join(basePath, ".claude", "aichaku")
    : join(basePath, ".claude", "aichaku");

  // Create new structure first
  await ensureDir(newRoot);

  // Create recent custom standards (in aichaku/standards/custom)
  await ensureDir(join(newRoot, "standards", "custom"));
  await Deno.writeTextFile(
    join(newRoot, "standards", "custom", "recent-custom-standard.md"),
    "# Recent Custom Standard",
  );
  await Deno.writeTextFile(
    join(newRoot, "standards", "custom", "team-practices.md"),
    "# Team Practices",
  );
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

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  // Override paths for testing
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

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

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  const needed = await migration.isMigrationNeeded();
  assertEquals(needed, false);

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - global migration dry run", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  const result = await migration.migrateGlobal({ dryRun: true });

  assertEquals(result.success, true);
  assertEquals(result.itemsMigrated > 0, true);

  // Verify nothing was actually moved
  assertExists(await exists(join(testHome, ".claude", "methodologies")));
  assertEquals(
    await exists(join(testHome, ".claude", "aichaku", "methodologies")),
    false,
  );

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - global migration moves correct files", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  const result = await migration.migrateGlobal();

  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);

  // Verify files were moved to new location
  assertExists(
    await exists(join(testHome, ".claude", "aichaku", "methodologies")),
  );
  assertExists(await exists(join(testHome, ".claude", "aichaku", "standards")));
  assertExists(
    await exists(join(testHome, ".claude", "aichaku", "commands.json")),
  );
  assertExists(
    await exists(join(testHome, ".claude", "aichaku", ".aichaku-project")),
  );

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

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  const result = await migration.migrateProject(projectDir);

  assertEquals(result.success, true);

  // Verify aichaku files were moved
  assertExists(
    await exists(join(projectDir, ".claude", "aichaku", ".aichaku-project")),
  );

  // Verify standards file was renamed
  assertExists(
    await exists(join(projectDir, ".claude", "aichaku", "standards.json")),
  );
  // Verify old standards file was removed
  assertEquals(
    await exists(join(projectDir, ".claude", ".aichaku-standards.json")),
    false,
  );

  // Verify user files stayed in place
  assertExists(await exists(join(projectDir, ".claude", "CLAUDE.md")));
  assertExists(
    await exists(join(projectDir, ".claude", "settings.local.json")),
  );
  assertExists(await exists(join(projectDir, ".claude", "output")));

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - backup creation", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructure(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

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

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

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

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  // Perform migration with backup
  const result = await migration.migrateGlobal({ backup: true });
  assertEquals(result.success, true);

  // Verify new structure exists
  assertExists(
    await exists(join(testHome, ".claude", "aichaku", "methodologies")),
  );

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
    "Must specify either global migration or project path",
  );
});

// Custom standards migration tests
Deno.test("FolderMigration - isCustomStandardsMigrationNeeded detects legacy custom standards", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructureWithCustomStandards(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  const needed = await migration.isCustomStandardsMigrationNeeded();
  assertEquals(needed, true);

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - isCustomStandardsMigrationNeeded detects recent custom standards", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructureWithRecentCustomStandards(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  const needed = await migration.isCustomStandardsMigrationNeeded();
  assertEquals(needed, true);

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - migrateCustomStandardsOnly migrates legacy custom standards", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructureWithCustomStandards(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  const result = await migration.migrateCustomStandardsOnly();

  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  assertEquals(result.itemsMigrated, 1); // One custom standards directory

  // Verify files were moved to new user location
  const userStandardsPath = join(
    testHome,
    ".claude",
    "aichaku",
    "user",
    "standards",
  );
  assertExists(await exists(userStandardsPath));
  assertExists(await exists(join(userStandardsPath, "my-custom-standard.md")));
  assertExists(await exists(join(userStandardsPath, "company-guidelines.md")));

  // Verify old location was cleaned up
  assertEquals(
    await exists(join(testHome, ".claude", "standards", "custom")),
    false,
  );

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - migrateCustomStandardsOnly migrates recent custom standards", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructureWithRecentCustomStandards(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  const result = await migration.migrateCustomStandardsOnly();

  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  assertEquals(result.itemsMigrated, 1); // One custom standards directory

  // Verify files were moved to new user location
  const userStandardsPath = join(
    testHome,
    ".claude",
    "aichaku",
    "user",
    "standards",
  );
  assertExists(await exists(userStandardsPath));
  assertExists(
    await exists(join(userStandardsPath, "recent-custom-standard.md")),
  );
  assertExists(await exists(join(userStandardsPath, "team-practices.md")));

  // Verify old location was cleaned up
  assertEquals(
    await exists(join(testHome, ".claude", "aichaku", "standards", "custom")),
    false,
  );

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - migrateCustomStandardsOnly handles merge safely", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructureWithCustomStandards(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  // Create existing content in target location
  const userStandardsPath = join(
    testHome,
    ".claude",
    "aichaku",
    "user",
    "standards",
  );
  await ensureDir(userStandardsPath);
  await Deno.writeTextFile(
    join(userStandardsPath, "existing-standard.md"),
    "# Existing Standard",
  );

  const result = await migration.migrateCustomStandardsOnly();

  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);

  // Verify both old and new files exist
  assertExists(await exists(join(userStandardsPath, "existing-standard.md")));
  assertExists(await exists(join(userStandardsPath, "my-custom-standard.md")));
  assertExists(await exists(join(userStandardsPath, "company-guidelines.md")));

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - migrateCustomStandardsOnly dry run", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructureWithCustomStandards(testHome);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  migration.setTestPaths(
    testHome,
    join(testHome, ".claude"),
    join(testHome, ".claude", "aichaku"),
  );

  const result = await migration.migrateCustomStandardsOnly({ dryRun: true });

  assertEquals(result.success, true);
  assertEquals(result.itemsMigrated, 1);

  // Verify nothing was actually moved
  const userStandardsPath = join(
    testHome,
    ".claude",
    "aichaku",
    "user",
    "standards",
  );
  assertEquals(await exists(userStandardsPath), false);
  assertExists(await exists(join(testHome, ".claude", "standards", "custom")));

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - project custom standards migration", async () => {
  const testDir = await Deno.makeTempDir();
  const projectDir = join(testDir, "project");
  await createTestStructureWithCustomStandards(projectDir, true);

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  const result = await migration.migrateCustomStandardsOnly({}, projectDir);

  assertEquals(result.success, true);
  assertEquals(result.itemsMigrated, 1);

  // Verify files were moved to project user location
  const userStandardsPath = join(
    projectDir,
    ".claude",
    "aichaku",
    "user",
    "standards",
  );
  assertExists(await exists(userStandardsPath));
  assertExists(await exists(join(userStandardsPath, "my-custom-standard.md")));
  assertExists(await exists(join(userStandardsPath, "company-guidelines.md")));

  await cleanupTestDir(testDir);
});

Deno.test("runMigration - convenience function with customStandardsOnly", async () => {
  const testDir = await Deno.makeTempDir();
  const testHome = join(testDir, "home");
  await createTestStructureWithCustomStandards(testHome);

  // Override HOME environment for test
  const originalHome = Deno.env.get("HOME");
  Deno.env.set("HOME", testHome);

  try {
    const logger = new Logger({ silent: true });
    const result = await runMigration({
      customStandardsOnly: true,
      logger,
    });

    assertEquals(result.success, true);
    assertEquals(result.itemsMigrated, 1);
  } finally {
    // Restore original HOME
    if (originalHome) {
      Deno.env.set("HOME", originalHome);
    } else {
      Deno.env.delete("HOME");
    }
  }

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - standards file rename", async () => {
  const testDir = await Deno.makeTempDir();
  const projectDir = join(testDir, "project");
  await createTestStructure(projectDir, true);

  // Verify the .aichaku-standards.json file exists
  const oldStandardsPath = join(
    projectDir,
    ".claude",
    ".aichaku-standards.json",
  );
  assertExists(await exists(oldStandardsPath));

  // Read the content before migration
  const originalContent = await Deno.readTextFile(oldStandardsPath);
  assertEquals(originalContent, '["OWASP", "TDD"]');

  const migration = new TestFolderMigration(new Logger({ silent: true }));
  const result = await migration.migrateProject(projectDir);

  assertEquals(result.success, true);

  // Verify the file was renamed and content preserved
  const newStandardsPath = join(
    projectDir,
    ".claude",
    "aichaku",
    "standards.json",
  );
  assertExists(await exists(newStandardsPath));
  const newContent = await Deno.readTextFile(newStandardsPath);
  assertEquals(newContent, originalContent);

  // Verify old file was removed
  assertEquals(await exists(oldStandardsPath), false);

  await cleanupTestDir(testDir);
});

Deno.test("FolderMigration - dry run shows rename for standards file", async () => {
  const testDir = await Deno.makeTempDir();
  const projectDir = join(testDir, "project");
  await createTestStructure(projectDir, true);

  const logs: string[] = [];
  const logger = new Logger({ silent: true });
  // Capture log messages
  logger.info = (message: string) => logs.push(message);

  const migration = new TestFolderMigration(logger);
  const result = await migration.migrateProject(projectDir, { dryRun: true });

  assertEquals(result.success, true);

  // Verify that the rename action is mentioned in logs
  const renameLog = logs.find((log) =>
    log.includes("rename") &&
    log.includes(".aichaku-standards.json") &&
    log.includes("standards.json")
  );
  assertEquals(renameLog !== undefined, true);

  // Verify nothing was actually changed
  assertExists(
    await exists(join(projectDir, ".claude", ".aichaku-standards.json")),
  );
  assertEquals(
    await exists(join(projectDir, ".claude", "aichaku", "standards.json")),
    false,
  );

  await cleanupTestDir(testDir);
});
