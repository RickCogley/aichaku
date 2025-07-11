/**
 * Tests for documentation standards command
 * @module
 */

import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { exists } from "jsr:@std/fs@1/exists";
import { join } from "jsr:@std/path@1";
import { DOC_STANDARD_CATEGORIES, docsStandard } from "./docs-standard.ts";

// We'll create test directories in each test to ensure isolation

Deno.test("docsStandard - list all documentation standards", async () => {
  // Capture console output
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    await docsStandard({ list: true });

    // Verify output includes standard information
    assertStringIncludes(output, "Available Documentation Standards");
    assertStringIncludes(output, "diataxis-google");
    assertStringIncludes(output, "microsoft-style");
    assertStringIncludes(output, "writethedocs");
    assertStringIncludes(output, "Diátaxis + Google Style");
    assertStringIncludes(output, "Microsoft Writing Style Guide");
    assertStringIncludes(output, "Write the Docs Principles");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - search documentation standards", async () => {
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    await docsStandard({ search: "google" });

    // Should find diataxis-google
    assertStringIncludes(output, "diataxis-google");
    assertStringIncludes(output, "Diátaxis + Google Style");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - search with no results", async () => {
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    await docsStandard({ search: "nonexistent" });

    assertStringIncludes(output, "No documentation standards found matching");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - show when no standards configured", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "aichaku_test_show_no_config_" });
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    await docsStandard({ show: true, projectPath: testDir });

    assertStringIncludes(output, "No documentation standards configured");
    assertStringIncludes(output, "docs-standard --add");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - add documentation standards", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "aichaku_test_add_" });
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    // Add standards
    await docsStandard({
      add: "diataxis-google,microsoft-style",
      projectPath: testDir,
    });

    assertStringIncludes(output, "Adding documentation standards to project");
    assertStringIncludes(output, "Added diataxis-google");
    assertStringIncludes(output, "Added microsoft-style");

    // Verify config file was created
    const configPath = join(testDir, ".claude", "aichaku", "doc-standards.json");
    assertEquals(await exists(configPath), true);

    // Read and verify config
    const config = JSON.parse(await Deno.readTextFile(configPath));
    assertEquals(config.selected.length, 2);
    assertEquals(config.selected.includes("diataxis-google"), true);
    assertEquals(config.selected.includes("microsoft-style"), true);
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - add duplicate standard", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "aichaku_test_add_dup_" });
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    // First add a standard
    await docsStandard({ add: "diataxis-google", projectPath: testDir });

    // Clear output
    output = "";

    // Try to add the same standard again
    await docsStandard({ add: "diataxis-google", projectPath: testDir });

    assertStringIncludes(output, "already selected");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - add unknown standard", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "aichaku_test_add_unknown_" });
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    await docsStandard({ add: "unknown-standard", projectPath: testDir });

    assertStringIncludes(output, "Unknown documentation standard");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - remove documentation standards", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "aichaku_test_remove_" });
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    // First add standards
    await docsStandard({
      add: "diataxis-google,microsoft-style",
      projectPath: testDir,
    });

    // Clear output
    output = "";

    // Remove one standard
    await docsStandard({ remove: "microsoft-style", projectPath: testDir });

    assertStringIncludes(output, "Removing documentation standards");
    assertStringIncludes(output, "Removed microsoft-style");

    // Verify config was updated
    const configPath = join(testDir, ".claude", "aichaku", "doc-standards.json");
    const config = JSON.parse(await Deno.readTextFile(configPath));
    assertEquals(config.selected.length, 1);
    assertEquals(config.selected[0], "diataxis-google");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - remove non-selected standard", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "aichaku_test_remove_non_" });
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    await docsStandard({ remove: "writethedocs", projectPath: testDir });

    assertStringIncludes(output, "not selected");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - show selected standards", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "aichaku_test_show_" });
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    // Add standards first
    await docsStandard({ add: "diataxis-google", projectPath: testDir });

    // Clear output
    output = "";

    // Show standards
    await docsStandard({ show: true, projectPath: testDir });

    assertStringIncludes(
      output,
      "Project Documentation Standards Configuration",
    );
    assertStringIncludes(output, "diataxis-google");
    assertStringIncludes(output, "Diátaxis + Google Style");
    assertStringIncludes(output, "Templates:");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - dry run mode", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "aichaku_test_dry_run_" });
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    // First add a standard to create the config
    await docsStandard({ add: "diataxis-google", projectPath: testDir });
    
    // Clear output
    output = "";
    
    // Now test dry run
    await docsStandard({
      add: "writethedocs",
      projectPath: testDir,
      dryRun: true,
    });

    assertStringIncludes(output, "Added writethedocs");
    assertStringIncludes(output, "[Dry run - no changes made]");

    // Verify config was NOT updated
    const configPath = join(testDir, ".claude", "aichaku", "doc-standards.json");
    const config = JSON.parse(await Deno.readTextFile(configPath));
    assertEquals(config.selected.includes("writethedocs"), false);
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - show help when no options", async () => {
  const originalLog = console.log;
  let output = "";
  console.log = (msg: string) => {
    output += msg + "\n";
  };

  try {
    await docsStandard({});

    assertStringIncludes(output, "Aichaku Documentation Standards");
    assertStringIncludes(output, "Usage:");
    assertStringIncludes(output, "--list");
    assertStringIncludes(output, "--add");
    assertStringIncludes(output, "--remove");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("docsStandard - validate all defined standards", () => {
  // Ensure all standards have required fields
  for (
    const [categoryId, category] of Object.entries(DOC_STANDARD_CATEGORIES)
  ) {
    for (const [standardId, standard] of Object.entries(category.standards)) {
      // Check required fields
      assertEquals(
        typeof standard.name,
        "string",
        `${categoryId}.${standardId} missing name`,
      );
      assertEquals(
        typeof standard.description,
        "string",
        `${categoryId}.${standardId} missing description`,
      );
      assertEquals(
        Array.isArray(standard.tags),
        true,
        `${categoryId}.${standardId} missing tags`,
      );
      assertEquals(
        Array.isArray(standard.templates),
        true,
        `${categoryId}.${standardId} missing templates`,
      );

      // Check tags are non-empty
      assertEquals(
        standard.tags.length > 0,
        true,
        `${categoryId}.${standardId} has empty tags`,
      );

      // Check templates are valid
      const validTemplates = ["tutorial", "how-to", "reference", "explanation"];
      for (const template of standard.templates) {
        assertEquals(
          validTemplates.includes(template),
          true,
          `${categoryId}.${standardId} has invalid template: ${template}`,
        );
      }
    }
  }
});
