/**
 * Tests for CommandExecutor - shared command infrastructure
 */

import { assertEquals, assertRejects } from "jsr:@std/assert";
import { CommandExecutor } from "./command-executor.ts";
import { parseCommonArgs } from "./parseCommonArgs.ts";
import {
  cleanup,
  CommandAssertions,
  ConsoleCapture,
  createGlobalInstallation,
  createTempDir,
  createTestProject,
} from "./test-helpers.ts";

// Mock environment for tests
const originalHome = Deno.env.get("HOME");
const originalCwd = Deno.cwd;

async function setupTestEnvironment() {
  const tempHome = await createTempDir();
  const tempProject = await createTempDir();

  // Create global installation
  await createGlobalInstallation(tempHome);

  // Create test project
  await createTestProject(tempProject, {
    methodology: "shape-up",
    standards: ["tdd"],
    principles: ["dry"],
  });

  // Mock environment
  Deno.env.set("HOME", tempHome);

  // Mock cwd to return project directory
  Object.defineProperty(Deno, "cwd", {
    value: () => tempProject,
    configurable: true,
  });

  return { tempHome, tempProject };
}

async function teardownTestEnvironment(tempHome: string, tempProject: string) {
  // Restore environment
  if (originalHome) {
    Deno.env.set("HOME", originalHome);
  } else {
    Deno.env.delete("HOME");
  }

  // Restore cwd
  Object.defineProperty(Deno, "cwd", {
    value: originalCwd,
    configurable: true,
  });

  // Cleanup directories
  await cleanup(tempHome);
  await cleanup(tempProject);
}

Deno.test("CommandExecutor - Execute methodologies command", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();

  try {
    const executor = new CommandExecutor();

    capture.start();

    // Test --list option
    await executor.execute("methodologies", { list: true });

    capture.stop();

    const output = capture.getAllOutput();
    CommandAssertions.assertOutputContains(output, "shape-up", "Should show shape-up methodology");
    CommandAssertions.assertCommandSuccess(capture, "List command should succeed");
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

Deno.test("CommandExecutor - Execute standards command", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();

  try {
    const executor = new CommandExecutor();

    capture.start();

    // Test --list option
    await executor.execute("standards", { list: true });

    capture.stop();

    const output = capture.getAllOutput();
    CommandAssertions.assertOutputContains(output, "tdd", "Should show TDD standard");
    CommandAssertions.assertCommandSuccess(capture, "List command should succeed");
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

Deno.test("CommandExecutor - Execute principles command with --show", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();

  try {
    const executor = new CommandExecutor();

    capture.start();

    // Test --show with specific principle
    await executor.execute("principles", { show: "dry" });

    capture.stop();

    const output = capture.getAllOutput();
    CommandAssertions.assertOutputContains(output, "DRY", "Should show DRY principle details");
    CommandAssertions.assertOutputContains(output, "Don't Repeat Yourself", "Should show full principle name");
    CommandAssertions.assertCommandSuccess(capture, "Show command should succeed");
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

Deno.test("CommandExecutor - Handle unknown command", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();

  try {
    const executor = new CommandExecutor();

    await assertRejects(
      () => executor.execute("unknown-command", {}),
      Error,
      "Unknown command: unknown-command",
    );
  } finally {
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

Deno.test("CommandExecutor - Execute principles --list", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();

  try {
    const executor = new CommandExecutor();

    capture.start();

    await executor.execute("principles", { list: true });

    capture.stop();

    const output = capture.getAllOutput();
    CommandAssertions.assertOutputContains(output, "dry", "Should list DRY principle");
    CommandAssertions.assertCommandSuccess(capture, "List command should succeed");
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

Deno.test("CommandExecutor - Execute methodologies --current", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();

  try {
    const executor = new CommandExecutor();

    capture.start();

    await executor.execute("methodologies", { current: true });

    capture.stop();

    const output = capture.getAllOutput();
    CommandAssertions.assertOutputContains(output, "shape-up", "Should show current methodology");
    CommandAssertions.assertCommandSuccess(capture, "Current command should succeed");
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

Deno.test("CommandExecutor - Execute standards --current", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();

  try {
    const executor = new CommandExecutor();

    capture.start();

    await executor.execute("standards", { current: true });

    capture.stop();

    const output = capture.getAllOutput();
    CommandAssertions.assertOutputContains(output, "tdd", "Should show current standards");
    CommandAssertions.assertCommandSuccess(capture, "Current command should succeed");
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

Deno.test("CommandExecutor - All three commands support required operations", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();
  const executor = new CommandExecutor();

  try {
    // Test that all commands support --list
    for (const command of ["methodologies", "standards", "principles"]) {
      capture.start();

      await executor.execute(command, { list: true });

      capture.stop();

      CommandAssertions.assertCommandSuccess(capture, `${command} --list should succeed`);

      // Verify output is not empty
      const output = capture.getAllOutput();
      if (output.trim() === "") {
        throw new Error(`${command} should produce output, but got empty output`);
      }

      capture.clear();
    }

    // Test that all commands support --current
    for (const command of ["methodologies", "standards", "principles"]) {
      capture.start();

      await executor.execute(command, { current: true });

      capture.stop();

      CommandAssertions.assertCommandSuccess(capture, `${command} --current should succeed`);

      capture.clear();
    }
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

// Test parseCommonArgs utility
Deno.test("parseCommonArgs - Handle --show variations correctly", () => {
  // Test bare --show flag
  const args1 = { show: true, _: ["principles"] };
  const options1 = parseCommonArgs(args1);
  assertEquals(options1.show, true, "Bare --show should be true");

  // Test --show with value
  const args2 = { show: "dry", _: ["principles"] };
  const options2 = parseCommonArgs(args2);
  assertEquals(options2.show, "dry", "--show dry should be 'dry'");

  // Test --show with empty string (edge case from parseArgs)
  const args3 = { show: "", _: ["principles", "dry"] };
  const options3 = parseCommonArgs(args3);
  assertEquals(options3.show, "dry", "--show with empty string should pick up value from args._");
});

Deno.test("parseCommonArgs - Handle array arguments correctly", () => {
  // Test multiple --add values
  const args1 = { add: ["tdd", "bdd"], _: ["standards"] };
  const options1 = parseCommonArgs(args1);
  assertEquals(options1.add, "tdd,bdd", "Multiple --add values should be joined");

  // Test single --add value
  const args2 = { add: "tdd", _: ["standards"] };
  const options2 = parseCommonArgs(args2);
  assertEquals(options2.add, "tdd", "Single --add value should be preserved");

  // Test multiple --remove values
  const args3 = { remove: ["old1", "old2"], _: ["standards"] };
  const options3 = parseCommonArgs(args3);
  assertEquals(options3.remove, "old1,old2", "Multiple --remove values should be joined");
});

Deno.test("parseCommonArgs - Handle all option types", () => {
  const args = {
    list: true,
    show: "test-id",
    add: "new-item",
    remove: "old-item",
    search: ["query1", "query2"],
    current: true,
    path: "/test/path",
    "dry-run": true,
    verbose: true,
    categories: true,
    "create-custom": "custom-name",
    set: ["item1", "item2"],
    reset: true,
    _: ["command"],
  };

  const options = parseCommonArgs(args);

  assertEquals(options.list, true);
  assertEquals(options.show, "test-id");
  assertEquals(options.add, "new-item");
  assertEquals(options.remove, "old-item");
  assertEquals(options.search, "query1"); // Takes first search term
  assertEquals(options.current, true);
  assertEquals(options.projectPath, "/test/path");
  assertEquals(options.dryRun, true);
  assertEquals(options.verbose, true);
  assertEquals(options.categories, true);
  assertEquals(options.createCustom, "custom-name");
  assertEquals(options.set, "item1,item2");
  assertEquals(options.reset, true);
});

// Test negative assertions to catch regressions
Deno.test("CommandExecutor - Negative assertions to prevent regressions", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();

  try {
    const executor = new CommandExecutor();

    // Test that commands don't crash with empty options
    capture.start();
    await executor.execute("principles", {});
    capture.stop();

    // Should not contain error messages
    const output = capture.getAllOutput();
    CommandAssertions.assertOutputNotContains(output, "Error:", "Empty options should not cause errors");
    CommandAssertions.assertOutputNotContains(output, "undefined", "Output should not contain 'undefined'");
    CommandAssertions.assertOutputNotContains(output, "null", "Output should not contain 'null'");

    capture.clear();

    // Test that --show without value doesn't crash
    capture.start();
    await executor.execute("principles", { show: true });
    capture.stop();

    const showOutput = capture.getAllOutput();
    CommandAssertions.assertOutputNotContains(showOutput, "Error:", "Bare --show should not cause errors");
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});

// Test for specific regression: --show parsing
Deno.test("CommandExecutor - Regression test for --show parsing", async () => {
  const { tempHome, tempProject } = await setupTestEnvironment();
  const capture = new ConsoleCapture();

  try {
    const executor = new CommandExecutor();

    // This was the specific failing case
    capture.start();
    await executor.execute("principles", { show: "dry" });
    capture.stop();

    const output = capture.getAllOutput();
    CommandAssertions.assertOutputContains(output, "DRY", "Should show DRY principle");
    CommandAssertions.assertOutputNotContains(output, "Error:", "Should not produce errors");
    CommandAssertions.assertCommandSuccess(capture, "--show dry should work correctly");
  } finally {
    capture.stop();
    await teardownTestEnvironment(tempHome, tempProject);
  }
});
