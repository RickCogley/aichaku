/**
 * Example usage of the MCP Statistics System
 * Demonstrates the key features and capabilities
 */

import { StatisticsManager, StatisticsPresets } from "./mod.ts";

async function demonstrateStatistics() {
  console.log("🪴 Aichaku MCP Statistics System Demo\n");

  // Create a statistics manager with development settings
  const statsManager = new StatisticsManager(StatisticsPresets.development);

  try {
    // Initialize the system
    await statsManager.init();
    console.log("✅ Statistics system initialized\n");

    // Simulate some MCP tool usage
    await simulateToolUsage(statsManager);

    // Demonstrate reporting capabilities
    await demonstrateReporting(statsManager);

    // Demonstrate Q&A functionality
    await demonstrateQuestions(statsManager);

    // Show export capabilities
    await demonstrateExports(statsManager);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await statsManager.close();
  }
}

async function simulateToolUsage(statsManager: StatisticsManager) {
  console.log("📊 Simulating MCP tool usage...\n");

  // Simulate various tool invocations
  const simulations = [
    { tool: "review_file", file: "src/server.ts", success: true, findings: 3 },
    { tool: "review_file", file: "src/types.ts", success: true, findings: 0 },
    { tool: "review_file", file: "src/utils.ts", success: true, findings: 2 },
    {
      tool: "review_methodology",
      project: "my-project",
      success: true,
      findings: 1,
    },
    {
      tool: "get_standards",
      project: "my-project",
      success: true,
      findings: 0,
    },
    {
      tool: "review_file",
      file: "src/components/header.tsx",
      success: false,
      findings: 0,
    },
    {
      tool: "review_file",
      file: "src/components/footer.tsx",
      success: true,
      findings: 1,
    },
  ];

  for (const sim of simulations) {
    const startTime = new Date();
    const operationId = `sim-${Date.now()}-${
      Math.random().toString(36).substring(2, 8)
    }`;

    // Add some realistic delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1000 + 500)
    );

    // Create mock result
    const result = sim.success
      ? {
        file: sim.file || sim.project || "unknown",
        findings: Array.from({ length: sim.findings }, (_, i) => ({
          severity: [
            "critical",
            "high",
            "medium",
            "low",
            "info",
          ][Math.floor(Math.random() * 5)] as
            | "critical"
            | "high"
            | "medium"
            | "low"
            | "info",
          rule: `rule-${i + 1}`,
          message: `Sample finding ${i + 1}`,
          file: sim.file || sim.project || "unknown",
          line: Math.floor(Math.random() * 100) + 1,
          tool: sim.tool,
          category: "security" as const,
        })),
        summary: {
          critical: sim.findings > 2 ? 1 : 0,
          high: sim.findings > 1 ? 1 : 0,
          medium: sim.findings > 0 ? 1 : 0,
          low: 0,
          info: 0,
        },
      }
      : undefined;

    // Record the operation
    await statsManager.recordInvocation(
      sim.tool,
      operationId,
      sim.file ? { file: sim.file } : { projectPath: sim.project },
      startTime,
      sim.success,
      result,
      sim.success ? undefined : new Error("Simulated error"),
    );

    console.log(
      `  ${sim.success ? "✅" : "❌"} ${sim.tool}: ${sim.file || sim.project}`,
    );
  }

  console.log("\n");
}

async function demonstrateReporting(statsManager: StatisticsManager) {
  console.log("📈 Generating reports...\n");

  // Dashboard overview
  console.log("=== DASHBOARD OVERVIEW ===");
  const dashboard = await statsManager.generateDashboard();
  console.log(dashboard);
  console.log("\n");

  // Real-time statistics
  console.log("=== REAL-TIME STATISTICS ===");
  const realtime = await statsManager.getRealTimeStats();
  console.log(realtime);
  console.log("\n");

  // Insights and recommendations
  console.log("=== INSIGHTS & RECOMMENDATIONS ===");
  const insights = await statsManager.getInsights();
  console.log(insights);
  console.log("\n");
}

async function demonstrateQuestions(statsManager: StatisticsManager) {
  console.log("❓ Answering questions about usage...\n");

  const questions = [
    "How many times was the MCP server used?",
    "Which tools are used most frequently?",
    "What files are reviewed most often?",
    "What are the average operation times?",
    "What standards are being checked?",
    "What are the success and failure rates?",
  ];

  for (const question of questions) {
    console.log(`Q: ${question}`);
    const answer = await statsManager.answerQuestion(question);
    console.log(`A: ${answer}\n`);
  }
}

async function demonstrateExports(statsManager: StatisticsManager) {
  console.log("💾 Demonstrating data export...\n");

  // JSON export
  console.log("=== JSON EXPORT (first 500 chars) ===");
  const jsonData = await statsManager.exportData("json");
  console.log(jsonData.substring(0, 500) + "...\n");

  // CSV export
  console.log("=== CSV EXPORT ===");
  const csvData = await statsManager.exportData("csv");
  console.log(csvData);
  console.log("\n");
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  demonstrateStatistics().catch(console.error);
}

// Export for use in other files
export { demonstrateStatistics };
