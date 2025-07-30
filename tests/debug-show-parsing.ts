#!/usr/bin/env -S deno run --allow-all

import { parseArgs } from "jsr:@std/cli@1/parse-args";

// Current configuration from cli.ts
const config = {
  boolean: [
    "show", // This is the problem - show is ONLY boolean
    // ... other boolean flags
  ],
  string: [
    "path",
    "add",
    "remove",
    // Note: "show" is NOT in string array
  ],
};

console.log("Testing parseArgs with current configuration:\n");

// Test 1: Bare --show
const test1 = parseArgs(["principles", "--show"], config);
console.log("Test 1: aichaku principles --show");
console.log("Result:", test1);
console.log("show value:", test1.show, "type:", typeof test1.show);
console.log();

// Test 2: --show with value
const test2 = parseArgs(["principles", "--show", "agile-manifesto"], config);
console.log("Test 2: aichaku principles --show agile-manifesto");
console.log("Result:", test2);
console.log("show value:", test2.show, "type:", typeof test2.show);
console.log("Note: 'agile-manifesto' is in _:", test2._);
console.log();

// Test 3: --show=value
const test3 = parseArgs(["principles", "--show=agile-manifesto"], config);
console.log("Test 3: aichaku principles --show=agile-manifesto");
console.log("Result:", test3);
console.log("show value:", test3.show, "type:", typeof test3.show);
console.log();

console.log("\n--- With Fixed Configuration ---\n");

// Fixed configuration
const fixedConfig = {
  boolean: [
    "show", // Keep in boolean for bare usage
  ],
  string: [
    "path",
    "add",
    "remove",
    "show", // ALSO add to string for value usage
  ],
};

// Test 4: Bare --show with fixed config
const test4 = parseArgs(["principles", "--show"], fixedConfig);
console.log("Test 4: aichaku principles --show (fixed)");
console.log("Result:", test4);
console.log("show value:", test4.show, "type:", typeof test4.show);
console.log();

// Test 5: --show with value with fixed config
const test5 = parseArgs(["principles", "--show", "agile-manifesto"], fixedConfig);
console.log("Test 5: aichaku principles --show agile-manifesto (fixed)");
console.log("Result:", test5);
console.log("show value:", test5.show, "type:", typeof test5.show);
console.log();
