#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-hrtime

/**
 * Performance testing for principles functionality
 */

import { PrincipleLoader } from "../src/utils/principle-loader.ts";
import { ConfigManager } from "../src/utils/config-manager.ts";

interface PerformanceResult {
  operation: string;
  duration: number;
  passed: boolean;
  threshold: number;
}

class PerformanceTester {
  private results: PerformanceResult[] = [];
  private loader = new PrincipleLoader();
  private configManager = new ConfigManager(Deno.cwd());

  get testResults(): PerformanceResult[] {
    return this.results;
  }

  async runAllTests(): Promise<void> {
    console.log("🏃 Aichaku Principles Performance Test Suite");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Warm up (first load is always slower)
    await this.loader.loadAll();

    // Run performance tests
    await this.testPrincipleLoading();
    await this.testCachePerformance();
    await this.testSearchPerformance();
    await this.testConfigOperations();

    // Print results
    this.printResults();
  }

  private async testPrincipleLoading(): Promise<void> {
    console.log("\n⚡ Testing Principle Loading Performance\n");

    // Test loading all principles
    await this.measurePerformance("Load all principles", 100, async () => {
      await this.loader.loadAll();
    });

    // Test loading individual principles
    const testPrinciples = ["dry", "kiss", "yagni", "solid", "unix-philosophy"];
    for (const id of testPrinciples) {
      await this.measurePerformance(`Load principle: ${id}`, 50, async () => {
        await this.loader.loadById(id);
      });
    }

    // Test loading by category
    await this.measurePerformance("Load by category: software-development", 75, async () => {
      const all = await this.loader.loadAll();
      all.filter((p) => p.category === "software-development");
    });
  }

  private async testCachePerformance(): Promise<void> {
    console.log("\n💾 Testing Cache Performance\n");

    // First load (cache miss)
    await this.loader.loadById("accessibility-first");

    // Second load (cache hit)
    await this.measurePerformance("Cached principle load", 5, async () => {
      await this.loader.loadById("accessibility-first");
    });

    // Load multiple cached principles
    const cached = ["dry", "kiss", "yagni"];
    for (const id of cached) {
      await this.loader.loadById(id); // Ensure cached
    }

    await this.measurePerformance("Load 3 cached principles", 15, async () => {
      for (const id of cached) {
        await this.loader.loadById(id);
      }
    });
  }

  private async testSearchPerformance(): Promise<void> {
    console.log("\n🔍 Testing Search Performance\n");

    const allPrinciples = await this.loader.loadAll();

    // Test simple search
    await this.measurePerformance("Search: 'simple'", 10, () => {
      const query = "simple";
      allPrinciples.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    });

    // Test complex search
    await this.measurePerformance("Search: 'design pattern architecture'", 20, () => {
      const terms = ["design", "pattern", "architecture"];
      allPrinciples.filter((p) => {
        const content = `${p.name} ${p.description}`.toLowerCase();
        return terms.some((term) => content.includes(term));
      });
    });
  }

  private async testConfigOperations(): Promise<void> {
    console.log("\n⚙️  Testing Configuration Performance\n");

    // Test loading config
    await this.measurePerformance("Load config", 20, async () => {
      await this.configManager.load();
    });

    // Test updating config
    await this.measurePerformance("Update config", 30, async () => {
      await this.configManager.update({
        principles: { selected: ["dry", "kiss", "yagni"] },
      });
    });

    // Clean up
    await this.configManager.update({
      principles: { selected: [] },
    });
  }

  private async measurePerformance(
    operation: string,
    thresholdMs: number,
    fn: () => Promise<void> | void,
  ): Promise<void> {
    // Run multiple times and take average
    const runs = 5;
    const durations: number[] = [];

    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      await fn();
      const duration = performance.now() - start;
      durations.push(duration);
    }

    // Calculate average, excluding outliers
    durations.sort((a, b) => a - b);
    const trimmed = durations.slice(1, -1); // Remove highest and lowest
    const avgDuration = trimmed.reduce((sum, d) => sum + d, 0) / trimmed.length;

    const passed = avgDuration <= thresholdMs;
    this.results.push({
      operation,
      duration: avgDuration,
      passed,
      threshold: thresholdMs,
    });

    const icon = passed ? "✅" : "❌";
    const status = passed ? "PASS" : "FAIL";
    console.log(
      `  ${icon} ${operation}: ${avgDuration.toFixed(2)}ms (${status} - threshold: ${thresholdMs}ms)`,
    );
  }

  private printResults(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Performance Test Summary:
  • Total Operations: ${this.results.length}
  • Passed: ${passed} ✅
  • Failed: ${failed} ❌
  • Average Duration: ${(totalDuration / this.results.length).toFixed(2)}ms

${failed > 0 ? "⚠️  Some operations exceeded performance thresholds." : "🎉 All operations meet performance targets!"}
`);

    if (failed > 0) {
      console.log("❌ Slow Operations:");
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          const overBy = ((r.duration - r.threshold) / r.threshold * 100).toFixed(0);
          console.log(`  • ${r.operation}: ${r.duration.toFixed(2)}ms (${overBy}% over threshold)`);
        });
    }
  }
}

// Run tests
if (import.meta.main) {
  const tester = new PerformanceTester();
  await tester.runAllTests();

  const failed = tester.testResults.filter((r) => !r.passed).length;
  Deno.exit(failed > 0 ? 1 : 0);
}
