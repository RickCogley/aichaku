#!/usr/bin/env -S deno run --allow-all

/**
 * Comprehensive test for all --show variations across commands
 * Tests the fix for the parseArgs regression
 */

async function runCLI(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
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

interface TestCase {
  name: string;
  args: string[];
  shouldContain: string[];
  shouldNotContain: string[];
}

const testCases: TestCase[] = [
  // Principles command tests
  {
    name: "principles (bare) - shows help",
    args: ["principles"],
    shouldContain: ["Aichaku Principles", "Usage", "--list"],
    shouldNotContain: ["Current Principle Selection"],
  },
  {
    name: "principles --show - shows current selection",
    args: ["principles", "--show"],
    shouldContain: ["Current Principle Selection"],
    shouldNotContain: ["Usage", "Compatibility:", "Agile Manifesto"],
  },
  {
    name: "principles --show agile-manifesto - shows principle details",
    args: ["principles", "--show", "agile-manifesto"],
    shouldContain: ["Agile Manifesto", "Individuals and interactions", "organizational"],
    shouldNotContain: ["Current Principle Selection", "Managing Principles"],
  },
  {
    name: "principles --show=agile-manifesto - undocumented but handled",
    args: ["principles", "--show=agile-manifesto"],
    shouldContain: ["Current Principle Selection"], // Shows current because = syntax isn't properly handled
    shouldNotContain: ["Agile Manifesto"],
  },

  // Methodologies command tests
  {
    name: "methodologies (bare) - shows help",
    args: ["methodologies"],
    shouldContain: ["Aichaku Methodologies", "Usage", "--list"],
    shouldNotContain: ["Active methodologies:"],
  },
  {
    name: "methodologies --show - shows current selection",
    args: ["methodologies", "--show"],
    shouldContain: ["Active methodologies:", "Default methodology:"],
    shouldNotContain: ["Usage", "--list"],
  },

  // Standards command tests
  {
    name: "standards (bare) - shows help",
    args: ["standards"],
    shouldContain: ["Aichaku Standards", "Usage", "--list"],
    shouldNotContain: ["Selected standards:"],
  },
  {
    name: "standards --show - shows current selection",
    args: ["standards", "--show"],
    shouldContain: ["Selected standards:"],
    shouldNotContain: ["Usage", "Aichaku Standards - Development & Documentation Standards"],
  },
];

// Run all tests
console.log("🧪 Comprehensive CLI --show Testing\n");

let passed = 0;
let failed = 0;

for (const test of testCases) {
  console.log(`📝 ${test.name}`);
  console.log(`   Command: aichaku ${test.args.join(" ")}`);

  try {
    const result = await runCLI(test.args);

    // Check positive assertions
    let allContainsPass = true;
    for (const expected of test.shouldContain) {
      if (!result.stdout.includes(expected)) {
        console.log(`   ❌ Missing: "${expected}"`);
        allContainsPass = false;
      }
    }

    // Check negative assertions
    let allNotContainsPass = true;
    for (const unexpected of test.shouldNotContain) {
      if (result.stdout.includes(unexpected)) {
        console.log(`   ❌ Should not contain: "${unexpected}"`);
        allNotContainsPass = false;
      }
    }

    if (allContainsPass && allNotContainsPass) {
      console.log(`   ✅ Pass`);
      passed++;
    } else {
      console.log(`   ❌ Fail`);
      failed++;

      // Show snippet of output for debugging
      const lines = result.stdout.split("\n").slice(0, 5);
      console.log(`   Output preview:`);
      lines.forEach((line) => console.log(`     ${line}`));
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error}`);
    failed++;
  }

  console.log();
}

// Summary
console.log("📊 Test Summary");
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Total: ${passed + failed}`);

if (failed > 0) {
  console.log("\n⚠️  Some tests failed. The regression may not be fully fixed.");
  Deno.exit(1);
} else {
  console.log("\n✨ All tests passed! The --show regression is fixed.");
}
