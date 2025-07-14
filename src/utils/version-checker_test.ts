/**
 * Tests for version checking utilities
 */

import { assertEquals, assertStringIncludes } from "@std/assert";
import { checkVersionMatch, VersionCheckResult } from "./version-checker.ts";

Deno.test("checkVersionMatch - handles no global installation", async () => {
  // Test when there's no global installation - should not warn
  const result = await checkVersionMatch();
  
  // Should have CLI version set
  assertEquals(typeof result.cliVersion, "string");
  
  // Should not show warning when no global installation exists
  assertEquals(result.isVersionMatch, true);
});

Deno.test("checkVersionMatch - returns proper structure", async () => {
  const result = await checkVersionMatch();
  
  // Check required fields exist
  assertEquals(typeof result.cliVersion, "string");
  assertEquals(typeof result.hasGlobalInstallation, "boolean");
  assertEquals(typeof result.isVersionMatch, "boolean");
  
  // Optional fields should be undefined or properly typed
  if (result.globalVersion !== undefined) {
    assertEquals(typeof result.globalVersion, "string");
  }
  
  if (result.warningMessage !== undefined) {
    assertEquals(typeof result.warningMessage, "string");
    assertStringIncludes(result.warningMessage, "Version mismatch");
  }
});

Deno.test("checkVersionMatch - warning message format", async () => {
  const result = await checkVersionMatch();
  
  // If there's a warning message, it should contain proper information
  if (result.warningMessage) {
    assertStringIncludes(result.warningMessage, "CLI version:");
    assertStringIncludes(result.warningMessage, "Global files:");
    assertStringIncludes(result.warningMessage, "aichaku upgrade --global");
  }
});