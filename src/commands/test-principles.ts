/**
 * Test command for principle integration
 * Tests the principle-aware agent system
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { PrincipleLoader } from "../utils/principle-loader.ts";
import { generateMethodologyAwareAgents } from "../utils/agent-generator.ts";
import { printFormatted } from "../utils/terminal-formatter.ts";

interface TestPrinciplesOptions {
  projectPath?: string;
  help?: boolean;
}

export async function testPrinciples(options: TestPrinciplesOptions): Promise<void> {
  if (options.help) {
    const help = {
      title: "🧪 Test Principle Integration",
      description: "Test the principle-aware agent system",
      usage: "aichaku test-principles [options]",
      options: [
        { flag: "--help", description: "Show this help message" },
        { flag: "--project-path", description: "Custom project path" },
      ],
      examples: [
        { command: "aichaku test-principles", description: "Test principle integration" },
      ],
    };

    printFormatted(JSON.stringify(help, null, 2));
    return;
  }

  console.log("🪴 Aichaku: Testing Principle Integration\n");

  // Test 1: Load all principles
  console.log("📚 Loading principles...");
  const loader = new PrincipleLoader();
  const principles = await loader.loadAll();

  console.log(`✅ Loaded ${principles.length} principles`);

  // Group by category
  const byCategory = principles.reduce((acc, p) => {
    const cat = p.category || "uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p.name);
    return acc;
  }, {} as Record<string, string[]>);

  for (const [category, names] of Object.entries(byCategory)) {
    console.log(`\n  ${category}:`);
    names.forEach((name) => console.log(`    - ${name}`));
  }

  // Test 2: Generate test agents with principles
  console.log("\n\n🤖 Generating principle-aware agents...");

  const testPrinciples = [
    "dry",
    "solid",
    "kiss",
    "yagni", // software-development
    "conways-law",
    "agile-manifesto", // organizational
    "fail-fast",
    "defensive-programming", // engineering
    "user-centered-design",
    "accessibility-first", // human-centered
  ];

  const testStandards = ["tdd", "conventional-commits", "owasp-web"];
  const testMethodologies = ["shape-up"];

  const outputPath = join(Deno.cwd(), ".test-agents");

  try {
    const result = await generateMethodologyAwareAgents({
      selectedMethodologies: testMethodologies,
      selectedStandards: testStandards,
      selectedPrinciples: testPrinciples,
      selectedAgents: [], // No optional agents for test
      outputPath,
      agentPrefix: "test-aichaku-",
    });

    console.log(`\n✅ Generated ${result.generated} agents`);

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:");
      result.errors.forEach((err) => console.log(`  - ${err}`));
    }

    // Test 3: Verify principle integration in generated agents
    console.log("\n\n🔍 Verifying principle integration...");

    const agentTypes = ["orchestrator", "security-reviewer", "principle-coach"];

    for (const agentType of agentTypes) {
      const agentPath = join(outputPath, `test-aichaku-${agentType}.md`);

      if (await exists(agentPath)) {
        const content = await Deno.readTextFile(agentPath);
        const hasPrinciples = content.includes("## Principle-Aware Guidance");
        const hasYaml = content.includes("principles:");

        console.log(`\n  ${agentType}:`);
        console.log(`    - Has principle section: ${hasPrinciples ? "✅" : "❌"}`);
        console.log(`    - Has principle YAML: ${hasYaml ? "✅" : "❌"}`);

        // Count principles
        const principleMatches = content.match(/^\s{4}[a-z-]+:$/gm) || [];
        console.log(`    - Principle count: ${principleMatches.length}`);
      }
    }

    // Cleanup test directory
    console.log("\n\n🧹 Cleaning up test artifacts...");
    try {
      await Deno.remove(outputPath, { recursive: true });
      console.log("✅ Test cleanup complete");
    } catch {
      console.log("⚠️  Could not clean up test directory");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }

  console.log("\n\n✨ Principle integration test complete!");
}
