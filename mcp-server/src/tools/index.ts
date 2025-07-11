/**
 * Documentation Tools
 *
 * Export all documentation generation tools
 */

export { analyzeProjectTool } from "./analyze-project.ts";
export { generateDocumentationTool } from "./generate-documentation.ts";
export { createDocTemplateTool } from "./create-doc-template.ts";

// Re-export types
export type { AnalyzeProjectArgs, AnalyzeProjectResult } from "./analyze-project.ts";
export type {
  GenerateDocumentationArgs,
  GenerateDocumentationResult,
} from "./generate-documentation.ts";
export type {
  CreateDocTemplateArgs,
  CreateDocTemplateResult,
  TemplateType,
} from "./create-doc-template.ts";
