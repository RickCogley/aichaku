// Verify what's actually happening with the scanner
import { ScannerController } from "./src/scanner-controller.ts";

const testCode = `
const password = "secret123";
eval(userInput);
document.innerHTML = userInput;
`;

console.log("Testing scanner-controller.ts directly...");

const scanner = new ScannerController();
await scanner.initialize();

console.log("Available scanners:", scanner.getAvailableScanners());

const findings = await scanner.runAvailableScanners(
  "/tmp/test.ts",
  testCode,
);

console.log("\nFindings:", findings.length);
findings.forEach((f, i) => {
  console.log(`${i + 1}. [${f.tool}] ${f.severity}: ${f.message}`);
});
