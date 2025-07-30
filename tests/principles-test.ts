#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run

/**
 * End-to-end test for principles functionality
 * Tests actual CLI usage
 */

import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class PrinciplesE2ETester {
  private results: TestResult[] = [];
  private aichakuPath = "./cli.ts";

  get testResults(): TestResult[] {
    return this.results;
  }

  async runAllTests(): Promise<void> {
    console.log("🪴 Aichaku Principles E2E Test Suite");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Ensure we're in the right directory
    if (!await exists(this.aichakuPath)) {
      console.error("❌ Error: Must run from aichaku root directory");
      Deno.exit(1);
    }

    // Test categories
    await this.testCLICommands();
    await this.testPrincipleSelection();
    await this.testLearnIntegration();
    await this.testEdgeCases();
    await this.testAllPrinciples();

    // Print summary
    this.printSummary();
  }

  private async runCommand(args: string[]): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    code: number;
  }> {
    const cmd = new Deno.Command("deno", {
      args: ["run", "--allow-read", "--allow-write", "--allow-env", this.aichakuPath, ...args],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await cmd.output();

    return {
      success: code === 0,
      stdout: new TextDecoder().decode(stdout),
      stderr: new TextDecoder().decode(stderr),
      code,
    };
  }

  private async testCLICommands(): Promise<void> {
    console.log("\n🧪 Testing CLI Commands\n");

    // Test list command
    await this.runTest("aichaku principles list", async () => {
      const result = await this.runCommand(["principles", "list"]);
      if (!result.success) throw new Error(`Exit code: ${result.code}`);
      assertStringIncludes(result.stdout, "Development Principles");
      assertStringIncludes(result.stdout, "software-development");
    });

    // Test show commands
    const testPrinciples = ["dry", "kiss", "unix-philosophy"];
    for (const id of testPrinciples) {
      await this.runTest(`aichaku principles show ${id}`, async () => {
        const result = await this.runCommand(["principles", "show", id]);
        if (!result.success) throw new Error(`Exit code: ${result.code}`);
        assertStringIncludes(result.stdout.toLowerCase(), id.replace("-", " "));
      });
    }

    // Test search
    await this.runTest("aichaku principles search 'simple'", async () => {
      const result = await this.runCommand(["principles", "search", "simple"]);
      if (!result.success) throw new Error(`Exit code: ${result.code}`);
      assertStringIncludes(result.stdout, "KISS");
    });

    // Test category
    await this.runTest("aichaku principles category human-centered", async () => {
      const result = await this.runCommand(["principles", "category", "human-centered"]);
      if (!result.success) throw new Error(`Exit code: ${result.code}`);
      assertStringIncludes(result.stdout, "Human-Centered");
      assertStringIncludes(result.stdout, "Accessibility First");
    });
  }

  private async testPrincipleSelection(): Promise<void> {
    console.log("\n🧪 Testing Principle Selection\n");

    // Test selection
    await this.runTest("aichaku principles --add dry,kiss", async () => {
      const result = await this.runCommand(["principles", "--add", "dry,kiss"]);
      if (!result.success) throw new Error(`Exit code: ${result.code}`);
      assertStringIncludes(result.stdout, "Selected 2 principles");
    });

    // Verify selection was saved
    await this.runTest("verify principles were saved", async () => {
      const configPath = join(Deno.cwd(), "aichaku.json");
      if (await exists(configPath)) {
        const config = JSON.parse(await Deno.readTextFile(configPath));
        const selected = config.principles?.selected || [];
        if (!selected.includes("dry") || !selected.includes("kiss")) {
          throw new Error("Principles not saved to config");
        }
      }
    });

    // Clean up
    await this.runCommand(["principles", "--add", ""]);
  }

  private async testLearnIntegration(): Promise<void> {
    console.log("\n🧪 Testing Learn Command Integration\n");

    // Test listing principles
    await this.runTest("aichaku learn --principles", async () => {
      const result = await this.runCommand(["learn", "--principles"]);
      if (!result.success) throw new Error(`Exit code: ${result.code}`);
      assertStringIncludes(result.stdout, "Development Principles");
    });

    // Test category filter
    await this.runTest("aichaku learn --principle-category software-development", async () => {
      const result = await this.runCommand(["learn", "--principle-category", "software-development"]);
      if (!result.success) throw new Error(`Exit code: ${result.code}`);
      assertStringIncludes(result.stdout, "Software Development");
      assertStringIncludes(result.stdout, "DRY");
    });

    // Test individual principle
    await this.runTest("aichaku learn accessibility-first", async () => {
      const result = await this.runCommand(["learn", "accessibility-first"]);
      if (!result.success) throw new Error(`Exit code: ${result.code}`);
      assertStringIncludes(result.stdout, "Accessibility First");
      assertStringIncludes(result.stdout, "WCAG");
    });
  }

  private async testEdgeCases(): Promise<void> {
    console.log("\n🧪 Testing Edge Cases\n");

    // Test invalid principle
    await this.runTest("show invalid principle", async () => {
      const result = await this.runCommand(["principles", "show", "invalid-xyz"]);
      if (result.success) throw new Error("Should have failed");
      assertStringIncludes(result.stdout, "not found");
    });

    // Test invalid category
    await this.runTest("invalid category", async () => {
      const result = await this.runCommand(["principles", "category", "invalid-cat"]);
      if (result.success) throw new Error("Should have failed");
      assertStringIncludes(result.stdout, "Category not found");
    });

    // Test empty search
    await this.runTest("empty search query", async () => {
      const result = await this.runCommand(["principles", "search", ""]);
      // Should show all principles or error gracefully
      assertEquals(result.code === 0 || result.code === 1, true);
    });
  }

  private async testAllPrinciples(): Promise<void> {
    console.log("\n🧪 Testing All 18 Principles\n");

    const allPrinciples = [
      // Software Development
      "unix-philosophy",
      "dry",
      "kiss",
      "yagni",
      "solid",
      "separation-of-concerns",
      // Organizational
      "agile-manifesto",
      "lean-principles",
      "conways-law",
      // Engineering
      "fail-fast",
      "defensive-programming",
      "robustness-principle",
      "premature-optimization",
      // Human-Centered
      "accessibility-first",
      "privacy-by-design",
      "user-centered-design",
      "inclusive-design",
      "ethical-design",
    ];

    for (const principle of allPrinciples) {
      await this.runTest(`verify ${principle} exists`, async () => {
        const result = await this.runCommand(["principles", "show", principle]);
        if (!result.success) throw new Error(`Principle ${principle} not found`);
      });
    }
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = performance.now();
    try {
      await testFn();
      const duration = performance.now() - start;
      this.results.push({ name, passed: true, duration });
      console.log(`  ✅ ${name} (${duration.toFixed(1)}ms)`);
    } catch (error) {
      const duration = performance.now() - start;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        name,
        passed: false,
        error: errorMessage,
        duration,
      });
      console.log(`  ❌ ${name} - ${errorMessage}`);
    }
  }

  private printSummary(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Test Summary:
  • Total Tests: ${this.results.length}
  • Passed: ${passed} ✅
  • Failed: ${failed} ❌
  • Total Duration: ${totalDuration.toFixed(1)}ms
  • Average Duration: ${(totalDuration / this.results.length).toFixed(1)}ms

${failed > 0 ? "⚠️  Some tests failed. Please review the errors above." : "🎉 All tests passed!"}
`);

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`  • ${r.name}: ${r.error}`));
    }
  }
}

// Run tests
if (import.meta.main) {
  const tester = new PrinciplesE2ETester();
  await tester.runAllTests();

  // Exit with error code if any tests failed
  const failedCount = tester.testResults.filter((r) => !r.passed).length;
  Deno.exit(failedCount > 0 ? 1 : 0);
}
