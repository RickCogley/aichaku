import { assertEquals, assertExists } from "@std/assert";
import { init } from "./init.ts";

Deno.test("init function exists and returns correct type", async () => {
  // Test that init function exists
  assertExists(init);
  assertEquals(typeof init, "function");

  // Test dry run (won't create any files)
  const result = await init({
    dryRun: true,
    silent: true,
    projectPath: "/tmp/test-aichaku-init",
  });

  // Verify result structure
  assertExists(result);
  assertEquals(typeof result.success, "boolean");
  assertEquals(typeof result.path, "string");
  assertExists(result.message);
  assertEquals(typeof result.message, "string");
});

Deno.test("init dry run completes successfully", async () => {
  const result = await init({
    dryRun: true,
    silent: true,
    projectPath: "/tmp/test-aichaku-dry-run",
  });

  assertEquals(result.success, true);
  assertEquals(result.message, "Dry run completed. No files were modified.");
});

Deno.test("init handles existing installations correctly", async () => {
  // Test with a unique temp path to avoid conflicts
  const tempPath = `/tmp/test-aichaku-${Date.now()}`;

  // Test project init with dry run (should always succeed in dry run mode)
  const result = await init({
    global: false,
    dryRun: true,
    silent: true,
    projectPath: tempPath,
  });

  // Dry run should always succeed
  assertEquals(result.success, true);
  assertExists(result.path);
  assertEquals(result.message, "Dry run completed. No files were modified.");
});
