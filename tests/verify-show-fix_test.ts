#!/usr/bin/env -S deno run --allow-all

import { parseArgs } from "jsr:@std/cli@1/parse-args";

console.log("🧪 Testing --show flag parsing with fixed configuration\n");

// Configuration from cli.ts (after fix)
const config = {
  boolean: [
    "show", // ... other flags
  ],
  string: [
    "show", // NOW included in both arrays
    // ... other flags
  ],
};

// Test cases
const tests = [
  {
    name: "Bare --show",
    args: ["principles", "--show"],
    expected: { command: "principles", show: true },
  },
  {
    name: "--show with value (space)",
    args: ["principles", "--show", "agile-manifesto"],
    expected: { command: "principles", show: "agile-manifesto" },
  },
  {
    name: "--show with value (equals)",
    args: ["principles", "--show=agile-manifesto"],
    expected: { command: "principles", show: "agile-manifesto" },
  },
];

// Run tests
let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = parseArgs(test.args, config);
  const showValue = result.show;
  const command = result._[0];

  const testPassed = command === test.expected.command &&
    showValue === test.expected.show;

  if (testPassed) {
    console.log(`✅ ${test.name}`);
    console.log(`   Args: ${test.args.join(" ")}`);
    console.log(`   Result: command="${command}", show=${JSON.stringify(showValue)}\n`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   Args: ${test.args.join(" ")}`);
    console.log(`   Expected: command="${test.expected.command}", show=${JSON.stringify(test.expected.show)}`);
    console.log(`   Got: command="${command}", show=${JSON.stringify(showValue)}\n`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

// Now test actual CLI behavior
console.log("🔍 Testing actual CLI behavior:\n");

async function runCLI(args: string[]) {
  const command = new Deno.Command("deno", {
    args: ["run", "--allow-all", "cli.ts", ...args],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();
  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
}

// Test 1: Bare principles --show (should show current selection)
console.log("Test 1: aichaku principles --show");
const test1 = await runCLI(["principles", "--show"]);
if (test1.stdout.includes("Current Principle Selection")) {
  console.log("✅ Shows current selection\n");
} else if (test1.stdout.includes("Usage")) {
  console.log("❌ Shows help instead of current selection\n");
} else {
  console.log("❌ Unexpected output\n");
}

// Test 2: principles --show agile-manifesto (should show principle details)
console.log("Test 2: aichaku principles --show agile-manifesto");
const test2 = await runCLI(["principles", "--show", "agile-manifesto"]);
if (test2.stdout.includes("Agile Manifesto") && test2.stdout.includes("Individuals and interactions")) {
  console.log("✅ Shows principle details\n");
} else if (test2.stdout.includes("Current Principle Selection")) {
  console.log("❌ Shows current selection instead of principle details\n");
} else {
  console.log("❌ Unexpected output\n");
}

// Test 3: methodologies --show (should show current selection)
console.log("Test 3: aichaku methodologies --show");
const test3 = await runCLI(["methodologies", "--show"]);
if (
  test3.stdout.includes("Current Methodology Selection") || test3.stdout.includes("No methodologies currently selected")
) {
  console.log("✅ Shows current selection\n");
} else {
  console.log("❌ Unexpected output\n");
}

// Test 4: standards --show (should show current selection)
console.log("Test 4: aichaku standards --show");
const test4 = await runCLI(["standards", "--show"]);
if (test4.stdout.includes("Current Standards Selection") || test4.stdout.includes("No standards currently selected")) {
  console.log("✅ Shows current selection\n");
} else {
  console.log("❌ Unexpected output\n");
}

console.log("✨ Testing complete!");
