/**
 * Tests for the Truth Verifier implementation
 */

import { assertEquals, assertExists, assertRejects } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { type Claim, TruthVerifier, type VerificationReport } from "./truth-verifier.ts";

Deno.test("TruthVerifier - File Operations", async (t) => {
  const verifier = new TruthVerifier();
  const testDir = await Deno.makeTempDir();

  await t.step("verifies file creation success", async () => {
    const testFile = `${testDir}/test-file.ts`;
    const content = "export const test = 'hello world';";

    // Create file
    await Deno.writeTextFile(testFile, content);

    // Verify creation
    const result = await verifier.verifyFileOperation("create", testFile, content);

    assertEquals(result.success, true);
    assertEquals(result.operation, "create");
    assertEquals(result.path, testFile);
    assertEquals(result.message, `File successfully created: ${testFile}`);
  });

  await t.step("detects missing file creation", async () => {
    const missingFile = `${testDir}/missing-file.ts`;

    // Verify without creating
    const result = await verifier.verifyFileOperation("create", missingFile);

    assertEquals(result.success, false);
    assertEquals(result.operation, "create");
    assertEquals(result.message, `File was not created: ${missingFile}`);
  });

  await t.step("detects empty file creation", async () => {
    const emptyFile = `${testDir}/empty-file.ts`;

    // Create empty file
    await Deno.writeTextFile(emptyFile, "");

    // Verify creation
    const result = await verifier.verifyFileOperation("create", emptyFile);

    assertEquals(result.success, false);
    assertEquals(result.message, `File was created but is empty: ${emptyFile}`);
  });

  await t.step("verifies file edit success", async () => {
    const editFile = `${testDir}/edit-file.ts`;
    const originalContent = "const x = 1;";
    const newContent = "const x = 2;";

    // Create original file
    await Deno.writeTextFile(editFile, originalContent);

    // Edit file
    await Deno.writeTextFile(editFile, newContent);

    // Verify edit
    const result = await verifier.verifyFileOperation("edit", editFile, newContent);

    assertEquals(result.success, true);
    assertEquals(result.operation, "edit");
    assertEquals(result.message, `File successfully edited: ${editFile}`);
  });

  await t.step("verifies file deletion", async () => {
    const deleteFile = `${testDir}/delete-file.ts`;

    // Create then delete
    await Deno.writeTextFile(deleteFile, "temp content");
    await Deno.remove(deleteFile);

    // Verify deletion
    const result = await verifier.verifyFileOperation("delete", deleteFile);

    assertEquals(result.success, true);
    assertEquals(result.operation, "delete");
    assertEquals(result.message, `File successfully deleted: ${deleteFile}`);
  });

  // Cleanup
  await Deno.remove(testDir, { recursive: true });
});

Deno.test("TruthVerifier - Directory Operations", async (t) => {
  const verifier = new TruthVerifier();
  const testDir = await Deno.makeTempDir();

  await t.step("verifies directory creation", async () => {
    const newDir = `${testDir}/new-directory`;

    // Create directory
    await Deno.mkdir(newDir);

    // Verify creation
    const result = await verifier.verifyDirectoryOperation("create", newDir);

    assertEquals(result.success, true);
    assertEquals(result.operation, "create");
    assertEquals(result.message, `Directory successfully created: ${newDir}`);
  });

  await t.step("detects missing directory", async () => {
    const missingDir = `${testDir}/missing-directory`;

    // Verify without creating
    const result = await verifier.verifyDirectoryOperation("create", missingDir);

    assertEquals(result.success, false);
    assertEquals(result.message, `Directory was not created: ${missingDir}`);
  });

  await t.step("verifies directory deletion", async () => {
    const deleteDir = `${testDir}/delete-directory`;

    // Create then delete
    await Deno.mkdir(deleteDir);
    await Deno.remove(deleteDir);

    // Verify deletion
    const result = await verifier.verifyDirectoryOperation("delete", deleteDir);

    assertEquals(result.success, true);
    assertEquals(result.message, `Directory successfully deleted: ${deleteDir}`);
  });

  // Cleanup
  await Deno.remove(testDir, { recursive: true });
});

Deno.test("TruthVerifier - Claim Extraction", async (t) => {
  const verifier = new TruthVerifier();

  await t.step("extracts file creation claims", () => {
    const text = `
      I created the file src/utils/helper.ts with utility functions.
      Also created file: /tmp/test.js for testing.
      I'll create the file docs/readme.md next.
    `;

    const claims = verifier.extractClaims(text);

    assertEquals(claims.length, 3);
    assertEquals(claims[0].operation, "create");
    assertEquals(claims[0].path, "src/utils/helper.ts");
    assertEquals(claims[0].type, "file");
  });

  await t.step("extracts file modification claims", () => {
    const text = `
      Modified file: src/index.ts to add new imports.
      I edited the file config.json with new settings.
      Updated file api/routes.ts with new endpoints.
    `;

    const claims = verifier.extractClaims(text);

    assertEquals(claims.length, 3);
    claims.forEach((claim) => {
      assertEquals(claim.operation, "edit");
      assertEquals(claim.type, "file");
    });
  });

  await t.step("extracts directory creation claims", () => {
    const text = `
      Created directory: src/components for React components.
      I made a folder tests/unit for unit tests.
      Creating directory build/dist now.
    `;

    const claims = verifier.extractClaims(text);

    assertEquals(claims.length, 3);
    claims.forEach((claim) => {
      assertEquals(claim.operation, "create");
      assertEquals(claim.type, "directory");
    });
  });

  await t.step("deduplicates repeated claims", () => {
    const text = `
      Created file: test.ts
      I created file test.ts again
      The file test.ts was created
    `;

    const claims = verifier.extractClaims(text);

    // Should only have one claim for test.ts
    assertEquals(claims.length, 1);
    assertEquals(claims[0].path, "test.ts");
  });
});

Deno.test("TruthVerifier - Batch Verification", async (t) => {
  const verifier = new TruthVerifier();
  const testDir = await Deno.makeTempDir();

  await t.step("verifies multiple claims and generates report", async () => {
    // Create some files
    await Deno.writeTextFile(`${testDir}/file1.ts`, "content1");
    await Deno.writeTextFile(`${testDir}/file2.ts`, "content2");
    // file3.ts intentionally not created

    const claims: Claim[] = [
      { operation: "create", path: `${testDir}/file1.ts`, type: "file" },
      { operation: "create", path: `${testDir}/file2.ts`, type: "file" },
      { operation: "create", path: `${testDir}/file3.ts`, type: "file" }, // Will fail
    ];

    const report = await verifier.verifyClaims(claims);

    assertEquals(report.totalClaims, 3);
    assertEquals(report.successCount, 2);
    assertEquals(report.failureCount, 1);
    assertEquals(report.successRate, 67); // 2/3 = 66.67% rounded
    assertEquals(report.failures.length, 1);
    assertEquals(report.failures[0].claim.path, `${testDir}/file3.ts`);
  });

  await t.step("handles empty claims list", async () => {
    const report = await verifier.verifyClaims([]);

    assertEquals(report.totalClaims, 0);
    assertEquals(report.successCount, 0);
    assertEquals(report.failureCount, 0);
    assertEquals(report.successRate, 100); // No claims = 100% success
  });

  // Cleanup
  await Deno.remove(testDir, { recursive: true });
});

Deno.test("TruthVerifier - Audit Log", async (t) => {
  const verifier = new TruthVerifier();
  const testDir = await Deno.makeTempDir();

  await t.step("maintains audit log of verifications", async () => {
    // Clear any previous log
    verifier.clearAuditLog();

    // Perform some operations
    await Deno.writeTextFile(`${testDir}/audit1.ts`, "test");
    await verifier.verifyFileOperation("create", `${testDir}/audit1.ts`);

    await verifier.verifyFileOperation("create", `${testDir}/missing.ts`);

    const log = verifier.getAuditLog();

    assertEquals(log.length, 2);
    assertEquals(log[0].success, true);
    assertEquals(log[1].success, false);
  });

  await t.step("can clear audit log", async () => {
    const verifier2 = new TruthVerifier();

    // Add some entries
    await verifier2.verifyFileOperation("create", "/fake/path");
    assertEquals(verifier2.getAuditLog().length, 1);

    // Clear log
    verifier2.clearAuditLog();
    assertEquals(verifier2.getAuditLog().length, 0);
  });

  // Cleanup
  await Deno.remove(testDir, { recursive: true });
});

// Run test with: deno test src/utils/truth-verifier.test.ts --allow-read --allow-write
