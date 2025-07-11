#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env
/**
 * Example: Generate Documentation
 *
 * Demonstrates how to use the documentation generation tools
 */

import { analyzeProjectTool } from "../src/tools/analyze-project.ts";
import { generateDocumentationTool } from "../src/tools/generate-documentation.ts";
import { createDocTemplateTool } from "../src/tools/create-doc-template.ts";

async function main() {
  const projectPath = Deno.args[0] || ".";

  console.log(`🪴 Aichaku: Generating documentation for ${projectPath}\n`);

  // Step 1: Analyze the project
  console.log("📊 Analyzing project structure...");
  const analysisResult = await analyzeProjectTool.execute({
    projectPath,
    detailed: true,
  });

  if (!analysisResult.success) {
    console.error(`❌ Analysis failed: ${analysisResult.error}`);
    Deno.exit(1);
  }

  const analysis = analysisResult.analysis!;
  console.log(`✅ Project type: ${analysis.type}`);
  console.log(
    `✅ Primary language: ${analysis.languages[0]?.language || "Unknown"}`,
  );
  if (analysis.architecture.pattern) {
    console.log(`✅ Architecture: ${analysis.architecture.pattern}`);
  }
  console.log();

  // Step 2: Generate comprehensive documentation
  console.log("📝 Generating documentation...");
  const docResult = await generateDocumentationTool.execute({
    projectPath,
    standard: "diataxis",
    includeExamples: true,
    includeDiagrams: true,
    autoChain: false, // We already analyzed
  });

  if (!docResult.success) {
    console.error(`❌ Documentation generation failed: ${docResult.error}`);
    Deno.exit(1);
  }

  console.log(
    `✅ Generated ${docResult.generatedFiles?.length || 0} documentation files`,
  );
  console.log(`📁 Output path: ${docResult.outputPath}`);
  console.log();

  // Step 3: Create additional templates if needed
  console.log("📄 Creating additional templates...");

  // Create a CONTRIBUTING.md if it doesn't exist
  const contributingResult = await createDocTemplateTool.execute({
    outputPath: `${projectPath}/CONTRIBUTING.md`,
    templateType: "contributing",
    projectName: projectPath.split("/").pop(),
  });

  if (contributingResult.success) {
    console.log(`✅ Created CONTRIBUTING.md`);
  }

  // Create a SECURITY.md
  const securityResult = await createDocTemplateTool.execute({
    outputPath: `${projectPath}/SECURITY.md`,
    templateType: "security",
    projectName: projectPath.split("/").pop(),
  });

  if (securityResult.success) {
    console.log(`✅ Created SECURITY.md`);
  }

  console.log("\n🎉 Documentation generation complete!");
  console.log("\n📚 Next steps:");
  docResult.nextSteps?.forEach((step) => {
    console.log(`  - ${step}`);
  });
}

// Run the example
if (import.meta.main) {
  main().catch((error) => {
    console.error("Error:", error);
    Deno.exit(1);
  });
}
