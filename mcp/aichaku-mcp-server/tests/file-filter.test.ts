/**
 * Tests for FileFilter - Blocklist functionality
 */

import { assertEquals } from "jsr:@std/assert@1";
import { FileFilter } from "../src/utils/file-filter.ts";
import type { BlocklistConfig } from "../src/utils/file-filter.ts";

Deno.test("FileFilter - Basic exclusion patterns", async () => {
  const config: BlocklistConfig = {
    extensions: [".min.js", ".map"],
    patterns: ["**/node_modules/**", "**/dist/**"],
    files: ["package-lock.json"],
    directories: ["build"],
    paths: ["/.claude/commands/"],
    contentTypes: ["!`", "PRIVATE KEY"],
  };

  const filter = new FileFilter(config, false);

  // Test extension exclusions
  assertEquals(await filter.shouldExcludeFile("script.min.js"), true);
  assertEquals(await filter.shouldExcludeFile("script.js"), false);

  // Test pattern exclusions
  assertEquals(
    await filter.shouldExcludeFile("project/node_modules/lib/file.js"),
    true,
  );
  assertEquals(await filter.shouldExcludeFile("project/dist/bundle.js"), true);
  assertEquals(await filter.shouldExcludeFile("project/src/file.js"), false);

  // Test file exclusions
  assertEquals(await filter.shouldExcludeFile("package-lock.json"), true);
  assertEquals(await filter.shouldExcludeFile("package.json"), false);

  // Test directory exclusions
  assertEquals(await filter.shouldExcludeFile("project/build/output.js"), true);
  assertEquals(await filter.shouldExcludeFile("project/src/output.js"), false);

  // Test path exclusions
  assertEquals(
    await filter.shouldExcludeFile("/home/user/.claude/commands/test.md"),
    true,
  );
  assertEquals(
    await filter.shouldExcludeFile("/home/user/.claude/config.json"),
    false,
  );
});

Deno.test("FileFilter - Content-based exclusions", async () => {
  const config: BlocklistConfig = {
    contentTypes: ["!`", "PRIVATE KEY", "API_KEY"],
  };

  const filter = new FileFilter(config, false);

  // Test Claude command syntax
  const commandContent = `
    # Test Command
    !\`pwd\`
    Description: Get current directory
  `;
  assertEquals(await filter.shouldExcludeFile("test.md", commandContent), true);

  // Test private key content
  const keyContent = `
    -----BEGIN PRIVATE KEY-----
    MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAo...
    -----END PRIVATE KEY-----
  `;
  assertEquals(await filter.shouldExcludeFile("key.pem", keyContent), true);

  // Test normal content
  const normalContent = `
    # Normal Markdown
    This is just regular documentation.
  `;
  assertEquals(await filter.shouldExcludeFile("doc.md", normalContent), false);
});

Deno.test("FileFilter - Tool-specific exclusions", async () => {
  const config: BlocklistConfig = {
    perToolExclusions: {
      "devskim": ["**/test/**", "**/*.test.*"],
      "semgrep": ["**/node_modules/**"],
    },
  };

  const filter = new FileFilter(config, false);

  // Test tool-specific exclusions
  assertEquals(
    await filter.shouldExcludeFile(
      "src/test/unit.test.js",
      undefined,
      "devskim",
    ),
    true,
  );
  assertEquals(
    await filter.shouldExcludeFile(
      "src/test/unit.test.js",
      undefined,
      "semgrep",
    ),
    false,
  );
  assertEquals(
    await filter.shouldExcludeFile(
      "node_modules/lib/index.js",
      undefined,
      "semgrep",
    ),
    true,
  );
  assertEquals(
    await filter.shouldExcludeFile(
      "node_modules/lib/index.js",
      undefined,
      "devskim",
    ),
    false,
  );
});

Deno.test("FileFilter - Default exclusions", async () => {
  const filter = new FileFilter({}, true); // Use defaults

  // Test default extensions
  assertEquals(await filter.shouldExcludeFile("bundle.min.js"), true);
  assertEquals(await filter.shouldExcludeFile("style.min.css"), true);
  assertEquals(await filter.shouldExcludeFile("source.map"), true);

  // Test default patterns
  assertEquals(
    await filter.shouldExcludeFile("project/node_modules/lib/index.js"),
    true,
  );
  assertEquals(await filter.shouldExcludeFile("project/.git/config"), true);
  assertEquals(await filter.shouldExcludeFile("project/dist/bundle.js"), true);

  // Test Claude commands protection
  assertEquals(
    await filter.shouldExcludeFile("/home/user/.claude/commands/test.md"),
    true,
  );
  assertEquals(
    await filter.shouldExcludeFile("/home/user/.claude/user/config.json"),
    true,
  );

  // Test sensitive files
  assertEquals(await filter.shouldExcludeFile("secrets/api.key"), true);
  assertEquals(await filter.shouldExcludeFile("credentials/auth.token"), true);
});

Deno.test("FileFilter - Configuration validation", () => {
  const filter = new FileFilter({
    maxFileSize: "invalid-size",
  }, false);

  const errors = filter.validateConfig();
  assertEquals(errors.length > 0, true);
  assertEquals(errors[0].includes("Invalid file size format"), true);
});

Deno.test("FileFilter - Size-based exclusions", async () => {
  // Create a temporary large file for testing
  const tempFile = await Deno.makeTempFile();
  const largeContent = "x".repeat(2 * 1024 * 1024); // 2MB
  await Deno.writeTextFile(tempFile, largeContent);

  const config: BlocklistConfig = {
    maxFileSize: "1MB",
  };

  const filter = new FileFilter(config, false);

  // Test file size exclusion
  assertEquals(await filter.shouldExcludeFile(tempFile), true);

  // Cleanup
  await Deno.remove(tempFile);
});

Deno.test("FileFilter - Sensitive content detection", async () => {
  const filter = new FileFilter({}, true);

  // Create temp file with Claude command syntax
  const tempFile = await Deno.makeTempFile({ suffix: ".md" });
  const commandContent = `
    # Test Command
    !\`date +%Y-%m-%d\`
    Description: Get current date
    allowed-tools: Read, LS
  `;
  await Deno.writeTextFile(tempFile, commandContent);

  assertEquals(await filter.containsSensitiveContent(tempFile), true);

  // Cleanup
  await Deno.remove(tempFile);
});

Deno.test("FileFilter - Exclusion statistics", () => {
  const config: BlocklistConfig = {
    extensions: [".min.js", ".map"],
    patterns: ["**/node_modules/**"],
    files: ["package-lock.json"],
    paths: ["/.claude/commands/"],
    contentTypes: ["!`"],
  };

  const filter = new FileFilter(config, false);
  const stats = filter.getExclusionStats();

  assertEquals(stats.extensionCount, 2);
  assertEquals(stats.patternCount, 1);
  assertEquals(stats.fileCount, 1);
  assertEquals(stats.pathCount, 1);
  assertEquals(stats.contentTypeCount, 1);
  assertEquals(stats.totalPatterns, 6);
});

Deno.test("FileFilter - Security validation", () => {
  const filter = new FileFilter({
    patterns: ["(.*)+", "([a-z]+)+"], // Potential ReDoS patterns
  }, false);

  const errors = filter.validateConfig();
  assertEquals(errors.length, 2);
  assertEquals(errors[0].includes("Potentially dangerous regex pattern"), true);
});

Deno.test("FileFilter - Path traversal protection", async () => {
  const config: BlocklistConfig = {
    paths: ["/../../../etc/"],
  };

  const filter = new FileFilter(config, false);

  // Test that path traversal attempts are handled securely
  const result = await filter.shouldExcludeFile("../../../etc/passwd");
  // Should not crash and should handle the path safely
  assertEquals(typeof result, "boolean");
});

Deno.test("FileFilter - Empty configuration", async () => {
  const filter = new FileFilter({}, false);

  // Should not exclude anything with empty config
  assertEquals(await filter.shouldExcludeFile("test.js"), false);
  assertEquals(await filter.shouldExcludeFile("README.md"), false);
  assertEquals(await filter.shouldExcludeFile("package.json"), false);
});

Deno.test("FileFilter - Case sensitivity", async () => {
  const config: BlocklistConfig = {
    extensions: [".MIN.JS"],
    patterns: ["**/NODE_MODULES/**"],
  };

  const filter = new FileFilter(config, false);

  // Test case sensitivity
  assertEquals(await filter.shouldExcludeFile("script.min.js"), false); // Different case
  assertEquals(await filter.shouldExcludeFile("script.MIN.JS"), true); // Exact match
});
