import { assertEquals, assertExists } from "@std/assert";
import { init } from "./init.ts";

Deno.test("init function exists and returns correct type", async () => {
  // Test that init function exists
  assertExists(init);
  assertEquals(typeof init, "function");

  // Test dry run with global flag (doesn't check for existing installation)
  const result = await init({
    global: true,
    dryRun: true,
    silent: true,
  });

  // Verify result structure
  assertExists(result);
  assertEquals(typeof result.success, "boolean");
  assertEquals(typeof result.path, "string");
  assertExists(result.message);
  assertEquals(typeof result.message, "string");
});

Deno.test("init global dry run always succeeds", async () => {
  // Global init in dry run mode with force flag to bypass existing check
  const result = await init({
    global: true,
    dryRun: true,
    silent: true,
    force: true,
  });

  assertEquals(result.success, true);
  assertEquals(result.message, "Dry run completed. No files were modified.");
});

Deno.test("init validates result structure", async () => {
  // Test that result has correct structure regardless of success
  const result = await init({
    global: false,
    dryRun: true,
    silent: true,
    projectPath: `/tmp/test-aichaku-${Date.now()}`,
  });

  // Result should have required fields
  assertExists(result.success);
  assertEquals(typeof result.success, "boolean");
  assertExists(result.path);
  assertEquals(typeof result.path, "string");
  assertExists(result.message);
  assertEquals(typeof result.message, "string");

  // If it failed due to missing global, that's expected
  if (!result.success) {
    assertEquals(
      result.message,
      "Please install Aichaku globally first: aichaku init --global",
    );
  }
});
