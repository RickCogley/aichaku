/**
 * Generate Documentation Tool
 *
 * MCP tool for generating comprehensive project documentation
 */

import {
  DocGenerator,
  type DocumentationStandard,
} from "../generation/doc-generator.ts";
import { ProjectAnalyzer } from "../analysis/project-analyzer.ts";
import { feedbackSystem } from "../feedback/feedback-system.ts";
import { StandardsManager } from "../standards-manager.ts";
import { validatePath } from "../utils/path-security.ts";
import { existsSync } from "@std/fs/exists";
import { join, resolve } from "@std/path";

export interface GenerateDocumentationArgs {
  projectPath: string;
  outputPath?: string;
  standard?: DocumentationStandard;
  overwrite?: boolean;
  includeExamples?: boolean;
  includeDiagrams?: boolean;
  autoChain?: boolean;
}

export interface GenerateDocumentationResult {
  success: boolean;
  generatedFiles?: string[];
  outputPath?: string;
  error?: string;
  nextSteps?: string[];
}

export const generateDocumentationTool = {
  name: "generate_documentation",
  description:
    "Generate comprehensive documentation following selected standards (Diátaxis, Google, etc.)",
  inputSchema: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to the project directory",
      },
      outputPath: {
        type: "string",
        description:
          "Output path for documentation (defaults to projectPath/docs)",
      },
      standard: {
        type: "string",
        enum: [
          "diataxis",
          "diataxis-google",
          "google",
          "microsoft",
          "readme-first",
          "api-first",
        ],
        description: "Documentation standard to follow",
        default: "diataxis",
      },
      overwrite: {
        type: "boolean",
        description: "Overwrite existing documentation files",
        default: false,
      },
      includeExamples: {
        type: "boolean",
        description: "Include code examples in documentation",
        default: true,
      },
      includeDiagrams: {
        type: "boolean",
        description: "Generate architecture diagrams using Mermaid",
        default: true,
      },
      autoChain: {
        type: "boolean",
        description:
          "Automatically run analyze_project first and review_file after",
        default: true,
      },
    },
    required: ["projectPath"],
  },

  async execute(
    args: GenerateDocumentationArgs,
  ): Promise<GenerateDocumentationResult> {
    const operationId = feedbackSystem.startOperation(
      "generate_documentation",
      args as unknown as Record<string, unknown>,
    );

    try {
      // Validate and resolve paths
      const resolvedProjectPath = resolve(args.projectPath);
      try {
        validatePath(resolvedProjectPath, Deno.cwd());
      } catch (error) {
        throw new Error(
          `Invalid project path: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      if (!existsSync(resolvedProjectPath)) {
        throw new Error(`Project path does not exist: ${resolvedProjectPath}`);
      }

      // Determine output path
      const outputPath = args.outputPath
        ? resolve(args.outputPath)
        : join(resolvedProjectPath, "docs");

      // Check if we should use project's selected standards
      let documentationStandard = args.standard || "diataxis";

      try {
        const standardsManager = new StandardsManager();
        const projectStandards = await standardsManager.getProjectStandards(
          resolvedProjectPath,
        );

        // Check if project has documentation-related standards
        const docStandards = projectStandards.selected.filter((s) =>
          s.toLowerCase().includes("diataxis") ||
          s.toLowerCase().includes("google") ||
          s.toLowerCase().includes("docs")
        );

        if (docStandards.length > 0) {
          // Map standard names to our documentation standards
          const standardName = docStandards[0].toLowerCase();
          if (
            standardName.includes("diataxis") && standardName.includes("google")
          ) {
            documentationStandard = "diataxis-google";
          } else if (standardName.includes("diataxis")) {
            documentationStandard = "diataxis";
          } else if (standardName.includes("google")) {
            documentationStandard = "google";
          }

          feedbackSystem.showStandardsLoaded([
            `Using ${documentationStandard} documentation standard`,
          ]);
        }
      } catch {
        // Ignore errors loading standards, use default
      }

      feedbackSystem.updateProgress(
        operationId,
        "analyzing",
        "Analyzing project structure...",
      );

      // Step 1: Analyze project (or use auto-chain)
      let projectAnalysis;

      if (args.autoChain) {
        feedbackSystem.updateProgress(
          operationId,
          "chaining",
          "Running project analysis...",
        );

        const analyzer = new ProjectAnalyzer();
        projectAnalysis = await analyzer.analyze(resolvedProjectPath);

        feedbackSystem.updateProgress(
          operationId,
          "analyzed",
          `Found ${
            projectAnalysis.languages[0]?.language || "unknown"
          } project with ${
            projectAnalysis.structure.children?.length || 0
          } top-level items`,
        );
      } else {
        // Basic analysis if not auto-chaining
        const analyzer = new ProjectAnalyzer();
        projectAnalysis = await analyzer.analyze(resolvedProjectPath);
      }

      feedbackSystem.updateProgress(
        operationId,
        "generating",
        `Generating ${documentationStandard} documentation...`,
      );

      // Step 2: Generate documentation
      const generator = new DocGenerator();
      const generatedDocs = await generator.generate({
        standard: documentationStandard,
        projectAnalysis,
        outputPath,
        overwrite: args.overwrite,
        includeExamples: args.includeExamples,
        includeDiagrams: args.includeDiagrams,
      });

      const generatedFiles = generatedDocs.map((doc) => doc.path);

      feedbackSystem.updateProgress(
        operationId,
        "generated",
        `Generated ${generatedFiles.length} documentation files`,
      );

      // Step 3: Review generated documentation if auto-chain is enabled
      const nextSteps: string[] = [];

      if (args.autoChain) {
        nextSteps.push(
          `Run 'review_file' on generated docs to check quality`,
          `Example: review_file("${generatedFiles[0]}")`,
        );
      }

      // Add helpful next steps
      nextSteps.push(
        `Preview docs: open ${join(outputPath, "index.md")}`,
        `Customize templates in ${outputPath}`,
        `Add project-specific content to generated files`,
      );

      feedbackSystem.completeOperation(operationId, {
        file: args.projectPath,
        findings: [],
        summary: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        },
        generatedFiles,
        outputPath,
      });

      return {
        success: true,
        generatedFiles,
        outputPath,
        nextSteps,
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      feedbackSystem.reportError(operationId, new Error(errorMessage));

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
