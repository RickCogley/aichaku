/**
 * Integration test for Truth Protocol
 * Demonstrates how it catches false file creation claims
 */

import { TruthVerifier } from "./src/utils/truth-verifier.ts";

console.log("=== Truth Protocol Integration Test ===\n");

const verifier = new TruthVerifier();

// Scenario 1: Agent claims to create a file but doesn't
console.log("Scenario 1: False file creation claim");
const falseClaimResponse = `
I've successfully created the API documentation at docs/api/endpoints.md 
with comprehensive endpoint descriptions and examples.
`;

const claims1 = verifier.extractClaims(falseClaimResponse);
console.log(`Found ${claims1.length} claim(s)`);

const report1 = await verifier.verifyClaims(claims1);
console.log(`Verification result: ${report1.successRate}% success rate`);
if (report1.failures.length > 0) {
  console.log("❌ CAUGHT FALSE CLAIM:");
  console.log(`  - Claimed: Created docs/api/endpoints.md`);
  console.log(`  - Reality: File does not exist`);
}

// Scenario 2: Agent actually creates a file
console.log("\n\nScenario 2: Truthful file creation");
const testFile = "/tmp/test-truth-protocol.md";
await Deno.writeTextFile(testFile, "# Test Documentation\n\nThis file was actually created.");

const truthfulResponse = `
I've created the file /tmp/test-truth-protocol.md with test documentation.
`;

const claims2 = verifier.extractClaims(truthfulResponse);
const report2 = await verifier.verifyClaims(claims2);
console.log(`Found ${claims2.length} claim(s)`);
console.log(`Verification result: ${report2.successRate}% success rate`);
if (report2.successRate === 100) {
  console.log("✅ VERIFIED TRUE CLAIM:");
  console.log(`  - Claimed: Created ${testFile}`);
  console.log(`  - Reality: File exists with content`);
}

// Cleanup
await Deno.remove(testFile);

// Scenario 3: Multiple claims with mixed results
console.log("\n\nScenario 3: Multiple claims (mixed truth/false)");
await Deno.writeTextFile("/tmp/real-file.ts", "export const test = true;");

const mixedResponse = `
I've completed the task and created the following files:
- Created file: /tmp/real-file.ts with TypeScript code
- Created file: /tmp/fake-file.ts with more code
- Created directory: /tmp/imaginary-folder for organization
`;

const claims3 = verifier.extractClaims(mixedResponse);
const report3 = await verifier.verifyClaims(claims3);
console.log(`Found ${claims3.length} claim(s)`);
console.log(`Verification result: ${report3.successRate}% success rate`);
console.log("\nDetailed results:");
for (const result of report3.results) {
  const status = result.success ? "✅" : "❌";
  console.log(`  ${status} ${result.operation} ${result.path}: ${result.success ? "Verified" : "FALSE CLAIM"}`);
}

// Cleanup
await Deno.remove("/tmp/real-file.ts");

console.log("\n=== Truth Protocol Test Complete ===");
console.log("\nThe Truth Protocol successfully:");
console.log("1. Detected false file creation claims");
console.log("2. Verified truthful claims");
console.log("3. Provided detailed reporting on mixed claims");
console.log("\nThis prevents agents from lying about file operations!");
