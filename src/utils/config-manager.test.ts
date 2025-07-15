/**
 * Tests for the Configuration Manager
 */

import {
  assertEquals,
  assertExists,
  assertRejects,
} from "jsr:@std/assert@1.0.0";
import { join } from "jsr:@std/path@1.0.0";
import { ensureDir, exists } from "jsr:@std/fs@1.0.0";
import {
  type AichakuConfig,
  ConfigManager,
  createDefaultConfig,
} from "./config-manager.ts";

// Helper to create a temporary test directory
async function createTempDir(): Promise<string> {
  const tempDir = await Deno.makeTempDir({ prefix: "aichaku-config-test-" });
  return tempDir;
}

// Helper to create legacy files for testing
async function createLegacyFiles(projectRoot: string) {
  const aichakuDir = join(projectRoot, ".claude", "aichaku");
  await ensureDir(aichakuDir);

  // Create .aichaku.json
  await Deno.writeTextFile(
    join(aichakuDir, ".aichaku.json"),
    JSON.stringify(
      {
        version: "0.29.0",
        installedAt: "2025-07-06T23:40:43.563Z",
        installationType: "local",
        lastUpgrade: "2025-07-14T11:42:11.473Z",
      },
      null,
      2,
    ),
  );

  // Create aichaku-standards.json
  await Deno.writeTextFile(
    join(aichakuDir, "aichaku-standards.json"),
    JSON.stringify(
      {
        version: "1.0.0",
        selected: ["15-factor", "twelve-factor"],
      },
      null,
      2,
    ),
  );

  // Create aichaku.config.json
  await Deno.writeTextFile(
    join(aichakuDir, "aichaku.config.json"),
    JSON.stringify(
      {
        version: "0.28.0",
        globalVersion: "0.28.0",
        createdAt: "2025-07-13T05:34:52.123Z",
        customizations: {
          userDir: "./user",
        },
      },
      null,
      2,
    ),
  );

  // Create .aichaku-project marker
  await Deno.writeTextFile(
    join(aichakuDir, ".aichaku-project"),
    JSON.stringify(
      {
        version: "0.19.0",
        installedAt: "2025-07-06T23:40:43.563Z",
        installationType: "local",
        lastUpgrade: "2025-07-10T06:48:57.157Z",
      },
      null,
      2,
    ),
  );
}

Deno.test("ConfigManager - Load from consolidated config", async () => {
  const tempDir = await createTempDir();
  const aichakuDir = join(tempDir, ".claude", "aichaku");
  await ensureDir(aichakuDir);

  try {
    // Create a consolidated config file
    const config: AichakuConfig = {
      version: "2.0.0",
      project: {
        created: "2025-07-15T10:00:00.000Z",
        installedVersion: "0.29.0",
        type: "project",
      },
      standards: {
        development: ["15-factor"],
        documentation: ["diataxis"],
        custom: {},
      },
      config: {
        outputPath: "./docs/projects",
      },
      markers: {
        isAichakuProject: true,
      },
    };

    await Deno.writeTextFile(
      join(aichakuDir, "aichaku.json"),
      JSON.stringify(config, null, 2),
    );

    // Test loading
    const manager = new ConfigManager(tempDir);
    await manager.load();

    const loaded = manager.get();
    assertEquals(loaded.version, "2.0.0");
    assertEquals(loaded.project.installedVersion, "0.29.0");
    assertEquals(loaded.standards.development, ["15-factor"]);
    assertEquals(loaded.standards.documentation, ["diataxis"]);
    assertEquals(manager.isAichakuProject(), true);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("ConfigManager - Load from legacy files", async () => {
  const tempDir = await createTempDir();

  try {
    await createLegacyFiles(tempDir);

    // Test loading
    const manager = new ConfigManager(tempDir);
    await manager.load();

    const config = manager.get();
    assertEquals(config.version, "2.0.0");
    assertEquals(config.project.installedVersion, "0.29.0");
    assertEquals(config.project.lastUpdated, "2025-07-14T11:42:11.473Z");
    assertEquals(config.standards.development, ["15-factor", "twelve-factor"]);
    assertEquals(config.config.customizations?.userDir, "./user");
    assertEquals(manager.isAichakuProject(), true);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("ConfigManager - Migrate from legacy to consolidated", async () => {
  const tempDir = await createTempDir();

  try {
    await createLegacyFiles(tempDir);

    // Test migration
    const manager = new ConfigManager(tempDir);
    const migrated = await manager.migrate();
    assertEquals(migrated, true);

    // Check that consolidated file was created
    const consolidatedPath = join(
      tempDir,
      ".claude",
      "aichaku",
      "aichaku.json",
    );
    assertExists(await exists(consolidatedPath));

    // Load and verify
    await manager.load();
    const config = manager.get();
    assertEquals(config.version, "2.0.0");
    assertEquals(config.project.installedVersion, "0.29.0");
    assertEquals(config.standards.development.includes("15-factor"), true);

    // Test that re-migration returns false
    const reMigrated = await manager.migrate();
    assertEquals(reMigrated, false);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("ConfigManager - Update configuration", async () => {
  const tempDir = await createTempDir();
  const aichakuDir = join(tempDir, ".claude", "aichaku");
  await ensureDir(aichakuDir);

  try {
    // Create initial config
    const manager = new ConfigManager(tempDir);
    const initialConfig = createDefaultConfig();

    await Deno.writeTextFile(
      join(aichakuDir, "aichaku.json"),
      JSON.stringify(initialConfig, null, 2),
    );

    await manager.load();

    // Update config
    await manager.update({
      project: {
        installedVersion: "0.30.0",
        methodology: "shape-up",
      },
      standards: {
        development: ["15-factor", "twelve-factor"],
      },
    });

    // Verify updates
    const updated = manager.get();
    assertEquals(updated.project.installedVersion, "0.30.0");
    assertEquals(updated.project.methodology, "shape-up");
    assertEquals(updated.standards.development, ["15-factor", "twelve-factor"]);
    assertEquals(updated.standards.documentation, []); // Should remain unchanged
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("ConfigManager - Handle non-Aichaku project", async () => {
  const tempDir = await createTempDir();

  try {
    const manager = new ConfigManager(tempDir);

    // Should throw when no config exists
    await assertRejects(
      async () => await manager.load(),
      Error,
      "No Aichaku configuration found",
    );

    // Should throw when trying to get config before loading
    const manager2 = new ConfigManager(tempDir);
    assertRejects(
      async () => manager2.get(),
      Error,
      "Configuration not loaded",
    );
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("ConfigManager - Convenience methods", async () => {
  const tempDir = await createTempDir();
  const aichakuDir = join(tempDir, ".claude", "aichaku");
  await ensureDir(aichakuDir);

  try {
    const config: AichakuConfig = {
      version: "2.0.0",
      project: {
        created: "2025-07-15T10:00:00.000Z",
        installedVersion: "0.29.0",
        type: "project",
        methodology: "scrum",
      },
      standards: {
        development: ["15-factor", "twelve-factor"],
        documentation: ["diataxis"],
        custom: {},
      },
      config: {},
      markers: {
        isAichakuProject: true,
      },
    };

    await Deno.writeTextFile(
      join(aichakuDir, "aichaku.json"),
      JSON.stringify(config, null, 2),
    );

    const manager = new ConfigManager(tempDir);
    await manager.load();

    // Test convenience methods
    assertEquals(manager.getMethodology(), "scrum");
    assertEquals(manager.getStandards(), [
      "15-factor",
      "twelve-factor",
      "diataxis",
    ]);
    assertEquals(manager.getDevelopmentStandards(), [
      "15-factor",
      "twelve-factor",
    ]);
    assertEquals(manager.getDocumentationStandards(), ["diataxis"]);
    assertEquals(manager.getInstalledVersion(), "0.29.0");
    assertEquals(manager.getProjectType(), "project");
    assertEquals(manager.isAichakuProject(), true);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("ConfigManager - Detect methodology from project structure", async () => {
  const tempDir = await createTempDir();

  try {
    // Create project structure with Shape Up files
    const projectDir = join(
      tempDir,
      "docs",
      "projects",
      "active",
      "2025-07-15-test-project",
    );
    await ensureDir(projectDir);
    await Deno.writeTextFile(join(projectDir, "pitch.md"), "# Test Pitch");
    await Deno.writeTextFile(join(projectDir, "hill-chart.md"), "# Hill Chart");

    // Create legacy files without methodology
    await createLegacyFiles(tempDir);

    // Load and check detected methodology
    const manager = new ConfigManager(tempDir);
    await manager.load();

    const config = manager.get();
    assertEquals(config.project.methodology, "shape-up");
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("ConfigManager - Create default config", () => {
  const config = createDefaultConfig();
  assertEquals(config.version, "2.0.0");
  assertEquals(config.project.type, "project");
  assertEquals(config.markers.isAichakuProject, true);
  assertEquals(config.standards.development, []);
  assertEquals(config.standards.documentation, []);

  const globalConfig = createDefaultConfig("global");
  assertEquals(globalConfig.project.type, "global");
});
