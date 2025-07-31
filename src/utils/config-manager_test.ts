/**
 * Tests for Configuration Manager
 */

import { assertEquals, assertRejects, assertThrows } from "jsr:@std/assert";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import {
  type AichakuConfig,
  ConfigManager,
  createProjectConfigManager,
  getProjectMethodology,
  isAichakuProject,
} from "./config-manager.ts";

// Test helper to create a temporary directory
async function createTempDir(): Promise<string> {
  const tempDir = await Deno.makeTempDir({ prefix: "aichaku-test-" });
  return tempDir;
}

// Test helper to create test configuration
function createTestConfig(): AichakuConfig {
  return {
    version: "2.0.0",
    project: {
      created: "2025-07-15T00:00:00.000Z",
      installedVersion: "0.29.0",
      methodology: "shape-up",
      type: "project",
      installationType: "local",
    },
    standards: {
      development: ["15-factor"],
      documentation: [],
      custom: {},
    },
    config: {
      customizations: {
        userDir: "./user",
      },
      globalVersion: "0.29.0",
    },
    markers: {
      isAichakuProject: true,
    },
  };
}

// Test helper to create legacy files
async function createLegacyFiles(projectRoot: string) {
  const aichakuDir = join(projectRoot, ".claude", "aichaku");
  await Deno.mkdir(aichakuDir, { recursive: true });

  // Create .aichaku.json
  await Deno.writeTextFile(
    join(aichakuDir, ".aichaku.json"),
    JSON.stringify({
      installedVersion: "0.29.0",
      installDate: "2025-07-15T00:00:00.000Z",
      type: "project",
      installationType: "local",
    }),
  );

  // Create aichaku-standards.json
  await Deno.writeTextFile(
    join(aichakuDir, "aichaku-standards.json"),
    JSON.stringify({
      version: "1.0.0",
      selected: ["15-factor"],
    }),
  );

  // Create aichaku.config.json
  await Deno.writeTextFile(
    join(aichakuDir, "aichaku.config.json"),
    JSON.stringify({
      version: "0.29.0",
      globalVersion: "0.29.0",
      customizations: {
        userDir: "./user",
      },
    }),
  );

  // Create .aichaku-project marker
  await Deno.writeTextFile(join(aichakuDir, ".aichaku-project"), "");
}

// Test helper to create project structure with methodology indicators
async function createProjectStructure(
  projectRoot: string,
  methodology: string,
) {
  const activeDir = join(
    projectRoot,
    "docs",
    "projects",
    "active",
    "test-project",
  );
  await Deno.mkdir(activeDir, { recursive: true });

  const methodologyFiles = {
    "shape-up": ["STATUS.md", "pitch.md"],
    "scrum": ["sprint-planning.md", "retrospective.md"],
    "kanban": ["kanban-board.md"],
    "lean": ["experiment-plan.md"],
  };

  const files = methodologyFiles[methodology as keyof typeof methodologyFiles] || [];
  for (const file of files) {
    await Deno.writeTextFile(
      join(activeDir, file),
      `# ${file}\n\nTest content`,
    );
  }
}

// Test helper to cleanup temp directory
async function cleanup(tempDir: string) {
  try {
    await Deno.remove(tempDir, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }
}

Deno.test("ConfigManager - Load from consolidated config", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);
    const aichakuDir = join(tempDir, ".claude", "aichaku");
    await Deno.mkdir(aichakuDir, { recursive: true });

    const testConfig = createTestConfig();
    await Deno.writeTextFile(
      join(aichakuDir, "aichaku.json"),
      JSON.stringify(testConfig, null, 2),
    );

    await configManager.load();
    const config = configManager.get();

    assertEquals(config.version, "2.0.0");
    assertEquals(config.project.installedVersion, "0.29.0");
    assertEquals(config.project.methodology, "shape-up");
    assertEquals(config.standards.development, ["15-factor"]);
    assertEquals(config.markers.isAichakuProject, true);
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Load from legacy files", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);
    await createLegacyFiles(tempDir);

    await configManager.load();
    const config = configManager.get();

    assertEquals(config.version, "2.0.0");
    assertEquals(config.project.installedVersion, "0.29.0");
    assertEquals(config.project.type, "project");
    assertEquals(config.standards.development, ["15-factor"]);
    assertEquals(config.markers.isAichakuProject, true);

    // Verify consolidated file was created
    const consolidatedPath = join(
      tempDir,
      ".claude",
      "aichaku",
      "aichaku.json",
    );
    assertEquals(await exists(consolidatedPath), true);
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Migrate from legacy to consolidated", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);
    await createLegacyFiles(tempDir);
    await createProjectStructure(tempDir, "shape-up");

    await configManager.load();
    const config = configManager.get();

    // Should detect methodology from project structure
    assertEquals(config.project.methodology, "shape-up");

    // Should preserve all legacy data
    assertEquals(config.project.installedVersion, "0.29.0");
    assertEquals(config.standards.development, ["15-factor"]);
    assertEquals(config.config.customizations?.userDir, "./user");
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Update configuration", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);
    const aichakuDir = join(tempDir, ".claude", "aichaku");
    await Deno.mkdir(aichakuDir, { recursive: true });

    const testConfig = createTestConfig();
    await Deno.writeTextFile(
      join(aichakuDir, "aichaku.json"),
      JSON.stringify(testConfig, null, 2),
    );

    await configManager.load();

    // Update methodology
    await configManager.setMethodology("scrum");
    assertEquals(configManager.getMethodology(), "scrum");

    // Update development standards
    await configManager.setDevelopmentStandards(["12-factor", "15-factor"]);
    assertEquals(configManager.getDevelopmentStandards(), [
      "12-factor",
      "15-factor",
    ]);

    // Update version
    await configManager.setInstalledVersion("0.30.0");
    assertEquals(configManager.getInstalledVersion(), "0.30.0");

    // Verify changes were persisted
    const configManager2 = new ConfigManager(tempDir);
    await configManager2.load();
    assertEquals(configManager2.getMethodology(), "scrum");
    assertEquals(configManager2.getDevelopmentStandards(), [
      "12-factor",
      "15-factor",
    ]);
    assertEquals(configManager2.getInstalledVersion(), "0.30.0");
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Handle non-Aichaku project", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);

    await assertRejects(
      () => configManager.load(),
      Error,
      "No Aichaku configuration found",
    );
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Convenience methods", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);
    const aichakuDir = join(tempDir, ".claude", "aichaku");
    await Deno.mkdir(aichakuDir, { recursive: true });

    const testConfig = createTestConfig();
    testConfig.standards.documentation = ["diataxis"];
    await Deno.writeTextFile(
      join(aichakuDir, "aichaku.json"),
      JSON.stringify(testConfig, null, 2),
    );

    await configManager.load();

    // Test convenience methods
    assertEquals(configManager.isAichakuProject(), true);
    assertEquals(configManager.getMethodology(), "shape-up");
    assertEquals(configManager.getInstalledVersion(), "0.29.0");
    assertEquals(configManager.getInstallationType(), "local");
    assertEquals(configManager.getDevelopmentStandards(), ["15-factor"]);
    assertEquals(configManager.getDocumentationStandards(), ["diataxis"]);
    assertEquals(configManager.getStandards(), ["15-factor", "diataxis"]);
    assertEquals(configManager.getCustomizations().userDir, "./user");
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Detect methodology from project structure", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);
    await createLegacyFiles(tempDir);
    await createProjectStructure(tempDir, "kanban");

    await configManager.load();
    const config = configManager.get();

    assertEquals(config.project.methodology, "kanban");
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Create default config", () => {
  const config = ConfigManager.createDefault("scrum");

  assertEquals(config.version, "2.0.0");
  assertEquals(config.project.methodology, "scrum");
  assertEquals(config.project.type, "project");
  assertEquals(config.project.installationType, "local");
  assertEquals(config.standards.development, []);
  assertEquals(config.standards.documentation, []);
  assertEquals(config.markers.isAichakuProject, true);
});

Deno.test("ConfigManager - Create global config", () => {
  const config = ConfigManager.createGlobal("0.29.0");

  assertEquals(config.version, "2.0.0");
  assertEquals(config.project.type, "global");
  assertEquals(config.project.installationType, "global");
  assertEquals(config.project.installedVersion, "0.29.0");
  assertEquals(config.config.globalVersion, "0.29.0");
});

Deno.test("ConfigManager - Verify integrity", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);
    const aichakuDir = join(tempDir, ".claude", "aichaku");
    await Deno.mkdir(aichakuDir, { recursive: true });

    const testConfig = createTestConfig();
    await Deno.writeTextFile(
      join(aichakuDir, "aichaku.json"),
      JSON.stringify(testConfig, null, 2),
    );

    await configManager.load();
    const integrity = configManager.verifyIntegrity();

    assertEquals(integrity.valid, true);
    assertEquals(integrity.errors, []);
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Factory functions", async () => {
  const tempDir = await createTempDir();

  try {
    const aichakuDir = join(tempDir, ".claude", "aichaku");
    await Deno.mkdir(aichakuDir, { recursive: true });

    const testConfig = createTestConfig();
    await Deno.writeTextFile(
      join(aichakuDir, "aichaku.json"),
      JSON.stringify(testConfig, null, 2),
    );

    const manager = createProjectConfigManager(tempDir);
    await manager.load();
    assertEquals(manager.isAichakuProject(), true);

    const isProject = await isAichakuProject(tempDir);
    assertEquals(isProject, true);

    const methodology = await getProjectMethodology(tempDir);
    assertEquals(methodology, "shape-up");
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Error handling for invalid config", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);

    // Test getting config before loading
    assertThrows(
      () => configManager.get(),
      Error,
      "Configuration not loaded. Call load() first.",
    );

    // Test updating config before loading
    await assertRejects(
      () =>
        configManager.update({
          project: {
            created: "2025-07-15T00:00:00.000Z",
            methodology: "scrum",
          },
        }),
      Error,
      "Configuration not loaded",
    );

    // Test saving config before loading
    await assertRejects(
      () => configManager.save(),
      Error,
      "No configuration to save",
    );
  } finally {
    await cleanup(tempDir);
  }
});

Deno.test("ConfigManager - Cleanup legacy files", async () => {
  const tempDir = await createTempDir();

  try {
    const configManager = new ConfigManager(tempDir);
    await createLegacyFiles(tempDir);

    await configManager.load();

    // Verify legacy files exist
    const aichakuDir = join(tempDir, ".claude", "aichaku");
    assertEquals(await exists(join(aichakuDir, ".aichaku.json")), true);
    assertEquals(
      await exists(join(aichakuDir, "aichaku-standards.json")),
      true,
    );
    assertEquals(await exists(join(aichakuDir, "aichaku.config.json")), true);
    assertEquals(await exists(join(aichakuDir, ".aichaku-project")), true);

    // Clean up legacy files
    await configManager.cleanupLegacyFiles();

    // Verify legacy files are removed
    assertEquals(await exists(join(aichakuDir, ".aichaku.json")), false);
    assertEquals(
      await exists(join(aichakuDir, "aichaku-standards.json")),
      false,
    );
    assertEquals(await exists(join(aichakuDir, "aichaku.config.json")), false);
    assertEquals(await exists(join(aichakuDir, ".aichaku-project")), false);

    // Verify consolidated file still exists
    assertEquals(await exists(join(aichakuDir, "aichaku.json")), true);
  } finally {
    await cleanup(tempDir);
  }
});
