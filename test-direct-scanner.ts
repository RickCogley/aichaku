// Test to verify the actual issue
import { ScannerController } from "./mcp/aichaku-mcp-server/src/scanner-controller.ts";
import { ReviewEngine } from "./mcp/aichaku-mcp-server/src/review-engine.ts";

const testCode = `
const password = "secret123";
eval(userInput);
`;

console.log("=== Direct Scanner Test ===");
const scanner = new ScannerController();
await scanner.initialize();

const findings = await scanner.runAvailableScanners(
  "test.ts",
  testCode,
);
console.log("Scanner findings:", findings.length);

console.log("\n=== Review Engine Test ===");
const engine = new ReviewEngine();
await engine.initialize();

// Need to check the actual review method signature
console.log("Review engine initialized");
