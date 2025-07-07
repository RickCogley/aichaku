import { assertEquals, assertExists } from "@std/assert";
import { integrate } from "./integrate.ts";

Deno.test("integrate function exists and returns correct type", async () => {
  // Test that integrate function exists
  assertExists(integrate);
  assertEquals(typeof integrate, "function");

  // Test dry run (won't create any files)
  const result = await integrate({
    dryRun: true,
    silent: true,
    projectPath: "/tmp/test-aichaku-integrate",
  });

  // Verify result structure
  assertExists(result);
  assertEquals(typeof result.success, "boolean");
  assertEquals(typeof result.path, "string");
  assertExists(result.message);
  assertEquals(typeof result.message, "string");
});

Deno.test("integrate dry run completes successfully", async () => {
  const result = await integrate({
    dryRun: true,
    silent: true,
    projectPath: "/tmp/test-integrate-dry-run",
  });

  assertEquals(result.success, true);
  assertEquals(result.action, "skipped");
  assertEquals(result.message, "Dry run completed. No files were modified.");
});

Deno.test("integrate returns correct path", async () => {
  const testPath = "/tmp/test-integrate-path";
  const result = await integrate({
    dryRun: true,
    silent: true,
    projectPath: testPath,
  });

  assertEquals(result.path, `${testPath}/CLAUDE.md`);
});