import { assertEquals, assertExists } from "@std/assert";
import { APP_INFO, BUILD_INFO, init, install, integrate, list, uninstall, update, upgrade, VERSION } from "../mod.ts";

Deno.test("mod.ts exports all required functions", () => {
  // Test command exports
  assertExists(init);
  assertExists(upgrade);
  assertExists(uninstall);
  assertExists(integrate);

  // Test legacy exports
  assertExists(install);
  assertExists(list);
  assertExists(update);

  // Verify they are functions
  assertEquals(typeof init, "function");
  assertEquals(typeof upgrade, "function");
  assertEquals(typeof uninstall, "function");
  assertEquals(typeof integrate, "function");
  assertEquals(typeof install, "function");
  assertEquals(typeof list, "function");
  assertEquals(typeof update, "function");
});

Deno.test("mod.ts exports version information", () => {
  // Test version exports
  assertExists(VERSION);
  assertExists(APP_INFO);
  assertExists(BUILD_INFO);

  // Verify VERSION is a string
  assertEquals(typeof VERSION, "string");

  // Verify APP_INFO structure
  assertExists(APP_INFO.name);
  assertExists(APP_INFO.description);
  assertEquals(typeof APP_INFO.name, "string");
  assertEquals(typeof APP_INFO.description, "string");

  // Verify BUILD_INFO structure
  assertExists(BUILD_INFO.versionComponents);
  assertExists(BUILD_INFO.buildDate);
  assertEquals(typeof BUILD_INFO.buildDate, "string");
});

Deno.test("VERSION matches expected format", () => {
  // Version should be in semver format
  const versionRegex = /^\d+\.\d+\.\d+$/;
  assertEquals(versionRegex.test(VERSION), true);
});
