// deno-lint-ignore-file no-explicit-any
/**
 * Tests for Documentation Generator
 */

import { assertEquals, assertExists } from "@std/assert";
import { DocGenerator } from "./doc-generator.ts";
import type { ProjectAnalysis } from "../analysis/project-analyzer.ts";

// Mock project analysis data
const mockProjectAnalysis: ProjectAnalysis = {
  rootPath: "/test/project",
  type: "typescript-library",
  languages: [
    {
      language: "TypeScript",
      percentage: 80,
      fileCount: 20,
      extensions: [".ts"],
    },
    {
      language: "JavaScript",
      percentage: 20,
      fileCount: 5,
      extensions: [".js"],
    },
  ],
  structure: {
    name: "test-project",
    type: "directory",
    path: "/test/project",
    children: [
      {
        name: "src",
        type: "directory",
        path: "/test/project/src",
        purpose: "Source code",
      },
      {
        name: "tests",
        type: "directory",
        path: "/test/project/tests",
        purpose: "Test files",
      },
    ],
  },
  dependencies: [
    {
      name: "typescript",
      version: "^5.0.0",
      type: "dev",
      source: "package.json",
    },
    { name: "deno", version: "^1.40.0", type: "runtime", source: "deno.json" },
  ],
  entryPoints: ["index.ts", "src/main.ts"],
  apiEndpoints: [
    {
      method: "GET",
      path: "/api/users",
      file: "src/routes/users.ts",
      line: 10,
    },
    {
      method: "POST",
      path: "/api/users",
      file: "src/routes/users.ts",
      line: 25,
    },
  ],
  testFiles: ["tests/user.test.ts", "tests/api.test.ts"],
  configFiles: [
    {
      path: "tsconfig.json",
      type: "typescript",
      purpose: "TypeScript configuration",
    },
    { path: "deno.json", type: "deno", purpose: "Deno configuration" },
  ],
  hasDocumentation: false,
  existingDocs: [],
  suggestedStructure: {
    standard: "diataxis",
    sections: [
      {
        title: "Tutorials",
        path: "docs/tutorials",
        description: "Learning-oriented guides",
        template: "tutorial",
      },
      {
        title: "How-to Guides",
        path: "docs/how-to",
        description: "Task-oriented guides",
        template: "how-to",
      },
      {
        title: "Reference",
        path: "docs/reference",
        description: "Information-oriented descriptions",
        template: "reference",
      },
      {
        title: "Explanation",
        path: "docs/explanation",
        description: "Understanding-oriented guides",
        template: "explanation",
      },
    ],
  },
  architecture: {
    pattern: "Clean Architecture",
    layers: [
      {
        name: "Presentation",
        directories: ["src/controllers", "src/routes"],
        purpose: "Handle HTTP requests",
      },
      {
        name: "Business Logic",
        directories: ["src/services", "src/use-cases"],
        purpose: "Core business rules",
      },
      {
        name: "Data Access",
        directories: ["src/repositories", "src/db"],
        purpose: "Database interactions",
      },
    ],
    components: [
      {
        name: "UserController",
        type: "controller",
        path: "src/controllers/user.ts",
        dependencies: ["UserService"],
      },
      {
        name: "UserService",
        type: "service",
        path: "src/services/user.ts",
        dependencies: ["UserRepository"],
      },
    ],
  },
};

Deno.test("DocGenerator - should create instance", () => {
  const generator = new DocGenerator();
  assertExists(generator);
});

Deno.test("DocGenerator - should generate README content", () => {
  const generator = new DocGenerator();
  const readme = (generator as any).generateReadme(mockProjectAnalysis);

  assertEquals(typeof readme, "string");
  assertEquals(readme.includes("# test-project"), true);
  assertEquals(readme.includes("TypeScript"), true);
  assertEquals(readme.includes("Clean Architecture"), true);
  assertEquals(readme.includes("Getting Started"), true);
});

Deno.test("DocGenerator - should generate tutorial index", () => {
  const generator = new DocGenerator();
  const tutorialIndex = (generator as any).generateTutorialIndex(
    mockProjectAnalysis,
  );

  assertEquals(typeof tutorialIndex, "string");
  assertEquals(tutorialIndex.includes("# Tutorials"), true);
  assertEquals(tutorialIndex.includes("Getting Started"), true);
  assertEquals(tutorialIndex.includes("Prerequisites"), true);
});

Deno.test("DocGenerator - should generate getting started tutorial", () => {
  const generator = new DocGenerator();
  const tutorial = (generator as any).generateGettingStartedTutorial(
    mockProjectAnalysis,
  );

  assertEquals(typeof tutorial, "string");
  assertEquals(tutorial.includes("# Getting Started with test-project"), true);
  assertEquals(tutorial.includes("TypeScript"), true);
  assertEquals(tutorial.includes("Installation"), true);
  assertEquals(tutorial.includes("Step 1:"), true);
});

Deno.test("DocGenerator - should generate how-to index", () => {
  const generator = new DocGenerator();
  const howToIndex = (generator as any).generateHowToIndex(mockProjectAnalysis);

  assertEquals(typeof howToIndex, "string");
  assertEquals(howToIndex.includes("# How-to Guides"), true);
  assertEquals(howToIndex.includes("Common Tasks"), true);
});

Deno.test("DocGenerator - should generate API how-to for projects with endpoints", () => {
  const generator = new DocGenerator();
  const apiHowTo = (generator as any).generateApiHowTo(mockProjectAnalysis);

  assertEquals(typeof apiHowTo, "string");
  assertEquals(apiHowTo.includes("# How to Use the API"), true);
  assertEquals(apiHowTo.includes("GET /api/users"), true);
  assertEquals(apiHowTo.includes("POST /api/users"), true);
});

Deno.test("DocGenerator - should generate reference index", () => {
  const generator = new DocGenerator();
  const refIndex = (generator as any).generateReferenceIndex(
    mockProjectAnalysis,
  );

  assertEquals(typeof refIndex, "string");
  assertEquals(refIndex.includes("# Reference Documentation"), true);
  assertEquals(refIndex.includes("API Reference"), true);
});

Deno.test("DocGenerator - should generate API reference", () => {
  const generator = new DocGenerator();
  const apiRef = (generator as any).generateApiReference(mockProjectAnalysis);

  assertEquals(typeof apiRef, "string");
  assertEquals(apiRef.includes("# API Reference"), true);
  assertEquals(apiRef.includes("GET /api/users"), true);
  assertEquals(apiRef.includes("POST /api/users"), true);
  assertEquals(apiRef.includes("src/routes/users.ts"), true);
});

Deno.test("DocGenerator - should generate explanation index", () => {
  const generator = new DocGenerator();
  const explainIndex = (generator as any).generateExplanationIndex(
    mockProjectAnalysis,
  );

  assertEquals(typeof explainIndex, "string");
  assertEquals(explainIndex.includes("# Concepts and Explanation"), true);
  assertEquals(explainIndex.includes("Core Concepts"), true);
});

Deno.test("DocGenerator - should generate architecture explanation", () => {
  const generator = new DocGenerator();
  const archExplain = (generator as any).generateArchitectureExplanation(
    mockProjectAnalysis,
  );

  assertEquals(typeof archExplain, "string");
  assertEquals(archExplain.includes("# Architecture Overview"), true);
  assertEquals(archExplain.includes("Clean Architecture"), true);
  assertEquals(archExplain.includes("Presentation"), true);
  assertEquals(archExplain.includes("Business Logic"), true);
  assertEquals(archExplain.includes("Data Access"), true);
});

Deno.test("DocGenerator - should generate tree view", () => {
  const generator = new DocGenerator();
  const treeView = (generator as any).generateTreeView(
    mockProjectAnalysis.structure,
  );

  assertEquals(typeof treeView, "string");
  assertEquals(treeView.includes("├── src"), true);
  assertEquals(treeView.includes("└── tests"), true);
});

Deno.test("DocGenerator - should get correct file extension for project type", () => {
  const generator = new DocGenerator();

  assertEquals((generator as any).getFileExtension("typescript-library"), "ts");
  assertEquals((generator as any).getFileExtension("javascript-app"), "js");
  assertEquals((generator as any).getFileExtension("python-package"), "py");
  assertEquals((generator as any).getFileExtension("go-module"), "go");
  assertEquals((generator as any).getFileExtension("unknown"), "txt");
});

Deno.test("DocGenerator - should get correct language for syntax highlighting", () => {
  const generator = new DocGenerator();

  assertEquals(
    (generator as any).getLanguageForHighlight("typescript-library"),
    "typescript",
  );
  assertEquals(
    (generator as any).getLanguageForHighlight("javascript-app"),
    "javascript",
  );
  assertEquals(
    (generator as any).getLanguageForHighlight("python-package"),
    "python",
  );
  assertEquals((generator as any).getLanguageForHighlight("go-module"), "go");
  assertEquals((generator as any).getLanguageForHighlight("unknown"), "text");
});

Deno.test("DocGenerator - should generate architecture diagrams", () => {
  const generator = new DocGenerator();
  const diagrams = (generator as any).generateArchitectureDiagrams({
    projectAnalysis: mockProjectAnalysis,
    outputPath: "/test/docs",
  });

  assertEquals(Array.isArray(diagrams), true);
  assertEquals(diagrams.length > 0, true);
  assertEquals(diagrams[0].type, "diagram");
  assertEquals(diagrams[0].content.includes("mermaid"), true);
});
