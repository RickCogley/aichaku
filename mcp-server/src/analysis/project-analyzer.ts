/**
 * Project Analyzer
 *
 * Core logic for analyzing project structure, languages, and architecture
 */

import { existsSync } from "@std/fs/exists";
import { walk } from "@std/fs/walk";
import { extname, join, relative } from "@std/path";
import { safeReadTextFileSync } from "../../../src/utils/path-security.ts";

export interface ProjectAnalysis {
  rootPath: string;
  type: ProjectType;
  languages: LanguageInfo[];
  structure: DirectoryStructure;
  dependencies: Dependency[];
  entryPoints: string[];
  apiEndpoints: ApiEndpoint[];
  testFiles: string[];
  configFiles: ConfigFile[];
  hasDocumentation: boolean;
  existingDocs: string[];
  suggestedStructure: DocStructure;
  architecture: ArchitectureInfo;
}

export interface LanguageInfo {
  language: string;
  percentage: number;
  fileCount: number;
  extensions: string[];
}

export interface DirectoryStructure {
  name: string;
  type: "directory" | "file";
  path: string;
  children?: DirectoryStructure[];
  language?: string;
  purpose?: string;
}

export interface Dependency {
  name: string;
  version?: string;
  type: "runtime" | "dev" | "peer";
  source: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  file: string;
  line?: number;
  description?: string;
}

export interface ConfigFile {
  path: string;
  type: string;
  purpose: string;
}

export interface DocStructure {
  standard: string;
  sections: DocSection[];
}

export interface DocSection {
  title: string;
  path: string;
  description: string;
  template?: string;
}

export interface ArchitectureInfo {
  pattern?: string; // e.g., "MVC", "Clean Architecture", "Microservices"
  layers: ArchitectureLayer[];
  components: Component[];
}

export interface ArchitectureLayer {
  name: string;
  directories: string[];
  purpose: string;
}

export interface Component {
  name: string;
  type: string;
  path: string;
  dependencies: string[];
}

export type ProjectType =
  | "typescript-library"
  | "typescript-app"
  | "javascript-library"
  | "javascript-app"
  | "python-package"
  | "python-app"
  | "go-module"
  | "go-app"
  | "mixed"
  | "unknown";

export class ProjectAnalyzer {
  private fileCache = new Map<string, string>();

  async analyze(projectPath: string): Promise<ProjectAnalysis> {
    const type = this.detectProjectType(projectPath);
    const languages = await this.detectLanguages(projectPath);
    const structure = await this.analyzeStructure(projectPath);
    const dependencies = this.analyzeDependencies(projectPath, type);
    const entryPoints = await this.findEntryPoints(projectPath, type);
    const apiEndpoints = await this.findApiEndpoints(projectPath, type);
    const testFiles = await this.findTestFiles(projectPath);
    const configFiles = await this.findConfigFiles(projectPath);
    const existingDocs = await this.findExistingDocs(projectPath);
    const architecture = this.analyzeArchitecture(projectPath, structure, type);

    const suggestedStructure = this.suggestDocStructure(
      type,
      languages,
      architecture,
    );

    return {
      rootPath: projectPath,
      type,
      languages,
      structure,
      dependencies,
      entryPoints,
      apiEndpoints,
      testFiles,
      configFiles,
      hasDocumentation: existingDocs.length > 0,
      existingDocs,
      suggestedStructure,
      architecture,
    };
  }

  private detectProjectType(projectPath: string): ProjectType {
    // Check for language-specific config files
    const checks = [
      { file: "package.json", types: ["typescript", "javascript"] },
      { file: "tsconfig.json", types: ["typescript"] },
      { file: "deno.json", types: ["typescript"] },
      { file: "deno.jsonc", types: ["typescript"] },
      { file: "setup.py", types: ["python"] },
      { file: "pyproject.toml", types: ["python"] },
      { file: "requirements.txt", types: ["python"] },
      { file: "go.mod", types: ["go"] },
    ];

    const detectedTypes: string[] = [];

    for (const check of checks) {
      if (existsSync(join(projectPath, check.file))) {
        detectedTypes.push(...check.types);
      }
    }

    if (detectedTypes.length === 0) {
      return "unknown";
    }

    if (detectedTypes.length > 1) {
      return "mixed";
    }

    // Determine if library or app
    const isLibrary = this.isLibrary(projectPath, detectedTypes[0]);

    return `${detectedTypes[0]}-${
      isLibrary ? "library" : "app"
    }` as ProjectType;
  }

  private isLibrary(projectPath: string, language: string): boolean {
    switch (language) {
      case "typescript":
      case "javascript": {
        const packageJsonPath = join(projectPath, "package.json");
        if (existsSync(packageJsonPath)) {
          try {
            const content = safeReadTextFileSync(packageJsonPath, projectPath);
            const pkg = JSON.parse(content);
            return !!(pkg.main || pkg.module || pkg.exports);
          } catch {
            // Ignore parse errors
          }
        }
        return existsSync(join(projectPath, "index.ts")) ||
          existsSync(join(projectPath, "index.js")) ||
          existsSync(join(projectPath, "mod.ts"));
      }

      case "python":
        return existsSync(join(projectPath, "setup.py")) ||
          existsSync(join(projectPath, "pyproject.toml"));

      case "go":
        return !existsSync(join(projectPath, "main.go"));

      default:
        return false;
    }
  }

  private async detectLanguages(projectPath: string): Promise<LanguageInfo[]> {
    const languageMap = new Map<
      string,
      { count: number; extensions: Set<string> }
    >();
    let totalFiles = 0;

    for await (
      const entry of walk(projectPath, {
        includeDirs: false,
        skip: [/node_modules/, /\.git/, /dist/, /build/, /vendor/],
      })
    ) {
      const ext = extname(entry.path).toLowerCase();
      const language = this.getLanguageFromExtension(ext);

      if (language) {
        totalFiles++;
        const info = languageMap.get(language) ||
          { count: 0, extensions: new Set() };
        info.count++;
        info.extensions.add(ext);
        languageMap.set(language, info);
      }
    }

    return Array.from(languageMap.entries())
      .map(([language, info]) => ({
        language,
        percentage: Math.round((info.count / totalFiles) * 100),
        fileCount: info.count,
        extensions: Array.from(info.extensions),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  private getLanguageFromExtension(ext: string): string | null {
    const extensionMap: Record<string, string> = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript",
      ".js": "JavaScript",
      ".jsx": "JavaScript",
      ".mjs": "JavaScript",
      ".cjs": "JavaScript",
      ".py": "Python",
      ".pyw": "Python",
      ".pyi": "Python",
      ".go": "Go",
      ".java": "Java",
      ".kt": "Kotlin",
      ".rs": "Rust",
      ".c": "C",
      ".cpp": "C++",
      ".cc": "C++",
      ".cxx": "C++",
      ".h": "C/C++",
      ".hpp": "C++",
      ".cs": "C#",
      ".rb": "Ruby",
      ".php": "PHP",
      ".swift": "Swift",
      ".m": "Objective-C",
      ".scala": "Scala",
      ".r": "R",
      ".jl": "Julia",
      ".lua": "Lua",
      ".dart": "Dart",
      ".elm": "Elm",
      ".clj": "Clojure",
      ".ex": "Elixir",
      ".exs": "Elixir",
    };

    return extensionMap[ext] || null;
  }

  private async analyzeStructure(
    projectPath: string,
  ): Promise<DirectoryStructure> {
    const structure: DirectoryStructure = {
      name: projectPath.split("/").pop() || "root",
      type: "directory",
      path: projectPath,
      children: [],
    };

    const entries = [];
    for await (const entry of Deno.readDir(projectPath)) {
      if (
        entry.name.startsWith(".") && entry.name !== ".github" &&
        entry.name !== ".claude"
      ) {
        continue;
      }
      if (
        ["node_modules", "dist", "build", "__pycache__", "vendor"].includes(
          entry.name,
        )
      ) {
        continue;
      }
      entries.push(entry);
    }

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const fullPath = join(projectPath, entry.name);

      if (entry.isDirectory) {
        const child = await this.analyzeStructure(fullPath);
        child.purpose = this.inferDirectoryPurpose(entry.name, fullPath);
        structure.children!.push(child);
      } else {
        const ext = extname(entry.name);
        structure.children!.push({
          name: entry.name,
          type: "file",
          path: fullPath,
          language: this.getLanguageFromExtension(ext) || undefined,
        });
      }
    }

    return structure;
  }

  private inferDirectoryPurpose(name: string, _path: string): string {
    const purposeMap: Record<string, string> = {
      "src": "Source code",
      "lib": "Library code",
      "test": "Test files",
      "tests": "Test files",
      "spec": "Test specifications",
      "docs": "Documentation",
      "doc": "Documentation",
      "examples": "Example code",
      "demo": "Demo applications",
      "scripts": "Build/utility scripts",
      "tools": "Development tools",
      "config": "Configuration files",
      "api": "API endpoints",
      "models": "Data models",
      "views": "View components",
      "controllers": "Controller logic",
      "services": "Business services",
      "utils": "Utility functions",
      "helpers": "Helper functions",
      "components": "UI components",
      "pages": "Page components",
      "routes": "Route definitions",
      "middleware": "Middleware functions",
      "database": "Database related",
      "db": "Database related",
      "migrations": "Database migrations",
      "public": "Public assets",
      "static": "Static assets",
      "assets": "Project assets",
      "vendor": "Third-party code",
      "pkg": "Package code",
      "cmd": "Command-line apps",
      "internal": "Internal packages",
    };

    return purposeMap[name.toLowerCase()] || "Project files";
  }

  private analyzeDependencies(
    projectPath: string,
    projectType: ProjectType,
  ): Dependency[] {
    const dependencies: Dependency[] = [];

    if (
      projectType.includes("typescript") || projectType.includes("javascript")
    ) {
      // Parse package.json
      const packageJsonPath = join(projectPath, "package.json");
      if (existsSync(packageJsonPath)) {
        try {
          const content = safeReadTextFileSync(packageJsonPath, projectPath);
          const pkg = JSON.parse(content);

          for (
            const [name, version] of Object.entries(pkg.dependencies || {})
          ) {
            dependencies.push({
              name,
              version: version as string,
              type: "runtime",
              source: "package.json",
            });
          }

          for (
            const [name, version] of Object.entries(pkg.devDependencies || {})
          ) {
            dependencies.push({
              name,
              version: version as string,
              type: "dev",
              source: "package.json",
            });
          }

          for (
            const [name, version] of Object.entries(pkg.peerDependencies || {})
          ) {
            dependencies.push({
              name,
              version: version as string,
              type: "peer",
              source: "package.json",
            });
          }
        } catch {
          // Ignore parse errors
        }
      }

      // Parse import_map.json or deno.json
      const denoConfigPaths = ["deno.json", "deno.jsonc", "import_map.json"];
      for (const configFile of denoConfigPaths) {
        const configPath = join(projectPath, configFile);
        if (existsSync(configPath)) {
          try {
            const content = safeReadTextFileSync(configPath, projectPath);
            const config = JSON.parse(content);

            if (config.imports) {
              for (const [name, spec] of Object.entries(config.imports)) {
                dependencies.push({
                  name,
                  version: spec as string,
                  type: "runtime",
                  source: configFile,
                });
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    if (projectType.includes("python")) {
      // Parse requirements.txt
      const requirementsPath = join(projectPath, "requirements.txt");
      if (existsSync(requirementsPath)) {
        try {
          const content = safeReadTextFileSync(requirementsPath, projectPath);
          const lines = content.split("\n").filter((line) =>
            line.trim() && !line.startsWith("#")
          );

          for (const line of lines) {
            const match = line.match(/^([^=<>!~]+)([=<>!~].+)?$/);
            if (match) {
              dependencies.push({
                name: match[1].trim(),
                version: match[2]?.trim(),
                type: "runtime",
                source: "requirements.txt",
              });
            }
          }
        } catch {
          // Ignore read errors
        }
      }

      // Parse pyproject.toml
      const pyprojectPath = join(projectPath, "pyproject.toml");
      if (existsSync(pyprojectPath)) {
        try {
          const content = safeReadTextFileSync(pyprojectPath, projectPath);
          // Basic TOML parsing for dependencies
          const depMatch = content.match(
            /\[tool\.poetry\.dependencies\]([\s\S]*?)(?=\[|$)/,
          );
          if (depMatch) {
            const depSection = depMatch[1];
            const depLines = depSection.split("\n").filter((line) =>
              line.includes("=")
            );

            for (const line of depLines) {
              const [name, version] = line.split("=").map((s) =>
                s.trim().replace(/['"]/g, "")
              );
              if (name && !name.startsWith("python")) {
                dependencies.push({
                  name,
                  version,
                  type: "runtime",
                  source: "pyproject.toml",
                });
              }
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    if (projectType.includes("go")) {
      // Parse go.mod
      const goModPath = join(projectPath, "go.mod");
      if (existsSync(goModPath)) {
        try {
          const content = safeReadTextFileSync(goModPath, projectPath);
          const requireRegex = /require\s+([^\s]+)\s+([^\s]+)/g;
          let match;

          while ((match = requireRegex.exec(content)) !== null) {
            dependencies.push({
              name: match[1],
              version: match[2],
              type: "runtime",
              source: "go.mod",
            });
          }
        } catch {
          // Ignore read errors
        }
      }
    }

    return dependencies;
  }

  private async findEntryPoints(
    projectPath: string,
    projectType: ProjectType,
  ): Promise<string[]> {
    const entryPoints: string[] = [];

    // Common entry point files
    const commonEntryPoints = [
      "main.ts",
      "main.js",
      "main.py",
      "main.go",
      "index.ts",
      "index.js",
      "index.py",
      "app.ts",
      "app.js",
      "app.py",
      "server.ts",
      "server.js",
      "server.py",
      "cli.ts",
      "cli.js",
      "cli.py",
      "mod.ts",
      "mod.js",
      "__main__.py",
      "__init__.py",
    ];

    for (const file of commonEntryPoints) {
      const fullPath = join(projectPath, file);
      if (existsSync(fullPath)) {
        entryPoints.push(relative(projectPath, fullPath));
      }

      // Also check in src directory
      const srcPath = join(projectPath, "src", file);
      if (existsSync(srcPath)) {
        entryPoints.push(relative(projectPath, srcPath));
      }
    }

    // Check package.json for entry points
    if (
      projectType.includes("typescript") || projectType.includes("javascript")
    ) {
      const packageJsonPath = join(projectPath, "package.json");
      if (existsSync(packageJsonPath)) {
        try {
          const content = safeReadTextFileSync(packageJsonPath, projectPath);
          const pkg = JSON.parse(content);

          if (pkg.main && !entryPoints.includes(pkg.main)) {
            entryPoints.push(pkg.main);
          }

          if (pkg.bin) {
            if (typeof pkg.bin === "string") {
              entryPoints.push(pkg.bin);
            } else if (typeof pkg.bin === "object") {
              Object.values(pkg.bin).forEach((binPath) => {
                if (
                  typeof binPath === "string" && !entryPoints.includes(binPath)
                ) {
                  entryPoints.push(binPath);
                }
              });
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    // Check for Go cmd directory
    if (projectType.includes("go")) {
      const cmdDir = join(projectPath, "cmd");
      if (existsSync(cmdDir)) {
        for await (const entry of Deno.readDir(cmdDir)) {
          if (entry.isDirectory) {
            const mainPath = join(cmdDir, entry.name, "main.go");
            if (existsSync(mainPath)) {
              entryPoints.push(relative(projectPath, mainPath));
            }
          }
        }
      }
    }

    return [...new Set(entryPoints)];
  }

  private async findApiEndpoints(
    projectPath: string,
    projectType: ProjectType,
  ): Promise<ApiEndpoint[]> {
    const endpoints: ApiEndpoint[] = [];

    // This is a simplified version - in practice, you'd use proper AST parsing
    const patterns = {
      express: [
        /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      ],
      fastapi: [
        /@app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /@router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      ],
      gin: [
        /router\.(GET|POST|PUT|DELETE|PATCH)\s*\(\s*"([^"]+)"/g,
        /r\.(GET|POST|PUT|DELETE|PATCH)\s*\(\s*"([^"]+)"/g,
      ],
    };

    const fileExtensions = this.getFileExtensionsForType(projectType);

    for await (
      const entry of walk(projectPath, {
        includeDirs: false,
        exts: fileExtensions,
        skip: [/node_modules/, /\.git/, /dist/, /build/, /vendor/, /test/],
      })
    ) {
      try {
        const content = safeReadTextFileSync(entry.path, projectPath);
        const relativePath = relative(projectPath, entry.path);

        for (const patternSet of Object.values(patterns)) {
          for (const pattern of patternSet) {
            let match;
            const regex = new RegExp(pattern);

            while ((match = regex.exec(content)) !== null) {
              const lineNumber =
                content.substring(0, match.index).split("\n").length;
              endpoints.push({
                method: match[1].toUpperCase(),
                path: match[2],
                file: relativePath,
                line: lineNumber,
              });
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }

    return endpoints;
  }

  private getFileExtensionsForType(projectType: ProjectType): string[] {
    if (projectType.includes("typescript")) return [".ts", ".tsx"];
    if (projectType.includes("javascript")) {
      return [".js", ".jsx", ".mjs", ".cjs"];
    }
    if (projectType.includes("python")) return [".py"];
    if (projectType.includes("go")) return [".go"];
    return [".ts", ".js", ".py", ".go"];
  }

  private async findTestFiles(projectPath: string): Promise<string[]> {
    const testFiles: string[] = [];

    for await (
      const entry of walk(projectPath, {
        includeDirs: false,
        skip: [/node_modules/, /\.git/, /dist/, /build/, /vendor/],
      })
    ) {
      const relativePath = relative(projectPath, entry.path);
      const fileName = entry.name.toLowerCase();

      // Common test file patterns
      if (
        fileName.endsWith(".test.ts") ||
        fileName.endsWith(".test.js") ||
        fileName.endsWith(".spec.ts") ||
        fileName.endsWith(".spec.js") ||
        fileName.endsWith("_test.go") ||
        fileName.endsWith("_test.py") ||
        fileName.startsWith("test_") && fileName.endsWith(".py") ||
        relativePath.includes("test/") ||
        relativePath.includes("tests/") ||
        relativePath.includes("__tests__/") ||
        relativePath.includes("spec/")
      ) {
        testFiles.push(relativePath);
      }
    }

    return testFiles;
  }

  private async findConfigFiles(projectPath: string): Promise<ConfigFile[]> {
    const configPatterns = [
      {
        pattern: "package.json",
        type: "npm",
        purpose: "Node.js package configuration",
      },
      {
        pattern: "tsconfig.json",
        type: "typescript",
        purpose: "TypeScript compiler configuration",
      },
      {
        pattern: "deno.json",
        type: "deno",
        purpose: "Deno runtime configuration",
      },
      {
        pattern: "deno.jsonc",
        type: "deno",
        purpose: "Deno runtime configuration",
      },
      {
        pattern: ".eslintrc*",
        type: "eslint",
        purpose: "JavaScript/TypeScript linting",
      },
      { pattern: ".prettierrc*", type: "prettier", purpose: "Code formatting" },
      {
        pattern: "webpack.config.*",
        type: "webpack",
        purpose: "Module bundling",
      },
      {
        pattern: "vite.config.*",
        type: "vite",
        purpose: "Build tool configuration",
      },
      {
        pattern: "rollup.config.*",
        type: "rollup",
        purpose: "Module bundling",
      },
      {
        pattern: "babel.config.*",
        type: "babel",
        purpose: "JavaScript transpilation",
      },
      {
        pattern: ".babelrc*",
        type: "babel",
        purpose: "JavaScript transpilation",
      },
      {
        pattern: "jest.config.*",
        type: "jest",
        purpose: "Jest testing framework",
      },
      {
        pattern: "vitest.config.*",
        type: "vitest",
        purpose: "Vitest testing framework",
      },
      {
        pattern: "pytest.ini",
        type: "pytest",
        purpose: "Python testing configuration",
      },
      {
        pattern: "setup.py",
        type: "setuptools",
        purpose: "Python package setup",
      },
      {
        pattern: "setup.cfg",
        type: "setuptools",
        purpose: "Python package configuration",
      },
      {
        pattern: "pyproject.toml",
        type: "python",
        purpose: "Python project configuration",
      },
      {
        pattern: "requirements*.txt",
        type: "pip",
        purpose: "Python dependencies",
      },
      {
        pattern: "Pipfile",
        type: "pipenv",
        purpose: "Python dependency management",
      },
      { pattern: "poetry.lock", type: "poetry", purpose: "Poetry lock file" },
      { pattern: "go.mod", type: "go", purpose: "Go module definition" },
      { pattern: "go.sum", type: "go", purpose: "Go module checksums" },
      { pattern: "Makefile", type: "make", purpose: "Build automation" },
      {
        pattern: "Dockerfile",
        type: "docker",
        purpose: "Container definition",
      },
      {
        pattern: "docker-compose.*",
        type: "docker",
        purpose: "Multi-container Docker applications",
      },
      {
        pattern: ".github/workflows/*",
        type: "github-actions",
        purpose: "CI/CD workflows",
      },
      { pattern: ".gitlab-ci.yml", type: "gitlab-ci", purpose: "GitLab CI/CD" },
      {
        pattern: ".travis.yml",
        type: "travis",
        purpose: "Travis CI configuration",
      },
      {
        pattern: "circle.yml",
        type: "circle-ci",
        purpose: "Circle CI configuration",
      },
      { pattern: ".env*", type: "env", purpose: "Environment variables" },
      { pattern: "README*", type: "docs", purpose: "Project documentation" },
      { pattern: "LICENSE*", type: "legal", purpose: "License information" },
    ];

    const configFiles: ConfigFile[] = [];

    for (const config of configPatterns) {
      // Handle glob patterns
      if (config.pattern.includes("*")) {
        const basePattern = config.pattern.replace(/\*/g, "");

        if (config.pattern.includes("/")) {
          // Directory pattern like .github/workflows/*
          const parts = config.pattern.split("/");
          const dirPath = join(projectPath, ...parts.slice(0, -1));

          if (existsSync(dirPath)) {
            for await (const entry of Deno.readDir(dirPath)) {
              if (entry.isFile) {
                configFiles.push({
                  path: relative(projectPath, join(dirPath, entry.name)),
                  type: config.type,
                  purpose: config.purpose,
                });
              }
            }
          }
        } else {
          // File pattern like .eslintrc*
          for await (const entry of Deno.readDir(projectPath)) {
            if (entry.isFile && entry.name.startsWith(basePattern)) {
              configFiles.push({
                path: entry.name,
                type: config.type,
                purpose: config.purpose,
              });
            }
          }
        }
      } else {
        // Exact file match
        const filePath = join(projectPath, config.pattern);
        if (existsSync(filePath)) {
          configFiles.push({
            path: config.pattern,
            type: config.type,
            purpose: config.purpose,
          });
        }
      }
    }

    return configFiles;
  }

  private async findExistingDocs(projectPath: string): Promise<string[]> {
    const docFiles: string[] = [];
    const docDirs = ["docs", "doc", "documentation"];

    // Check for documentation directories
    for (const dir of docDirs) {
      const docPath = join(projectPath, dir);
      if (existsSync(docPath)) {
        for await (
          const entry of walk(docPath, {
            includeDirs: false,
            exts: [".md", ".mdx", ".rst", ".txt", ".adoc"],
          })
        ) {
          docFiles.push(relative(projectPath, entry.path));
        }
      }
    }

    // Check for root-level documentation
    const rootDocs = [
      "README.md",
      "README.rst",
      "README.txt",
      "CONTRIBUTING.md",
      "CHANGELOG.md",
      "CHANGES.md",
      "CODE_OF_CONDUCT.md",
      "SECURITY.md",
      "ARCHITECTURE.md",
      "DESIGN.md",
      "API.md",
      "USAGE.md",
      "GUIDE.md",
    ];

    for (const doc of rootDocs) {
      const docPath = join(projectPath, doc);
      if (existsSync(docPath)) {
        docFiles.push(doc);
      }
    }

    return docFiles;
  }

  private analyzeArchitecture(
    projectPath: string,
    structure: DirectoryStructure,
    _projectType: ProjectType,
  ): ArchitectureInfo {
    const layers: ArchitectureLayer[] = [];
    const components: Component[] = [];

    // Detect common architecture patterns
    const pattern = this.detectArchitecturePattern(structure);

    // Analyze layers based on directory structure
    const layerPatterns = [
      {
        dirs: ["controllers", "routes", "handlers", "api"],
        name: "Presentation",
        purpose: "Handle HTTP requests and responses",
      },
      {
        dirs: ["services", "business", "domain", "core"],
        name: "Business Logic",
        purpose: "Core business rules and logic",
      },
      {
        dirs: ["models", "entities", "schemas"],
        name: "Domain Models",
        purpose: "Data structures and entities",
      },
      {
        dirs: ["repositories", "dao", "db", "database"],
        name: "Data Access",
        purpose: "Database interactions",
      },
      {
        dirs: ["middleware", "interceptors", "filters"],
        name: "Middleware",
        purpose: "Cross-cutting concerns",
      },
      {
        dirs: ["utils", "helpers", "common", "shared"],
        name: "Utilities",
        purpose: "Shared utility functions",
      },
      {
        dirs: ["config", "configuration"],
        name: "Configuration",
        purpose: "Application configuration",
      },
    ];

    for (const layerPattern of layerPatterns) {
      const directories = this.findDirectories(structure, layerPattern.dirs);
      if (directories.length > 0) {
        layers.push({
          name: layerPattern.name,
          directories: directories.map((d) => relative(projectPath, d)),
          purpose: layerPattern.purpose,
        });
      }
    }

    // Find main components
    const componentDirs = [
      "components",
      "modules",
      "features",
      "pages",
      "views",
    ];
    for (const dir of componentDirs) {
      const directories = this.findDirectories(structure, [dir]);
      for (const dirPath of directories) {
        const dirStructure = this.findDirectoryNode(structure, dirPath);
        if (dirStructure?.children) {
          for (const child of dirStructure.children) {
            if (child.type === "directory") {
              components.push({
                name: child.name,
                type: dir.slice(0, -1), // Remove 's' from plural
                path: relative(projectPath, child.path),
                dependencies: [], // Would need AST analysis for real dependencies
              });
            }
          }
        }
      }
    }

    return { pattern, layers, components };
  }

  private detectArchitecturePattern(
    structure: DirectoryStructure,
  ): string | undefined {
    const hasDir = (name: string): boolean => {
      return this.findDirectories(structure, [name]).length > 0;
    };

    // Clean Architecture
    if (hasDir("domain") && hasDir("application") && hasDir("infrastructure")) {
      return "Clean Architecture";
    }

    // Hexagonal Architecture
    if (hasDir("core") && hasDir("ports") && hasDir("adapters")) {
      return "Hexagonal Architecture";
    }

    // MVC
    if (hasDir("models") && hasDir("views") && hasDir("controllers")) {
      return "MVC";
    }

    // Layered Architecture
    if (hasDir("presentation") && hasDir("business") && hasDir("data")) {
      return "Layered Architecture";
    }

    // Microservices (if multiple service directories)
    const serviceDirs = this.findDirectories(structure, ["services"]);
    if (serviceDirs.length > 0) {
      const serviceNode = this.findDirectoryNode(structure, serviceDirs[0]);
      if (
        serviceNode?.children &&
        serviceNode.children.filter((c) => c.type === "directory").length > 3
      ) {
        return "Microservices";
      }
    }

    // Feature-based
    if (hasDir("features") || hasDir("modules")) {
      return "Feature-based";
    }

    return undefined;
  }

  private findDirectories(
    structure: DirectoryStructure,
    names: string[],
  ): string[] {
    const results: string[] = [];

    const search = (node: DirectoryStructure) => {
      if (node.type === "directory") {
        if (names.includes(node.name.toLowerCase())) {
          results.push(node.path);
        }

        if (node.children) {
          for (const child of node.children) {
            search(child);
          }
        }
      }
    };

    search(structure);
    return results;
  }

  private findDirectoryNode(
    structure: DirectoryStructure,
    path: string,
  ): DirectoryStructure | null {
    if (structure.path === path) {
      return structure;
    }

    if (structure.children) {
      for (const child of structure.children) {
        const found = this.findDirectoryNode(child, path);
        if (found) return found;
      }
    }

    return null;
  }

  private suggestDocStructure(
    _projectType: ProjectType,
    _languages: LanguageInfo[],
    _architecture: ArchitectureInfo,
  ): DocStructure {
    // Default to Diátaxis framework
    const sections: DocSection[] = [
      {
        title: "Tutorials",
        path: "docs/tutorials",
        description: "Learning-oriented guides for new users",
        template: "tutorial",
      },
      {
        title: "How-to Guides",
        path: "docs/how-to",
        description: "Task-oriented guides for specific problems",
        template: "how-to",
      },
      {
        title: "Reference",
        path: "docs/reference",
        description: "Information-oriented technical descriptions",
        template: "reference",
      },
      {
        title: "Explanation",
        path: "docs/explanation",
        description: "Understanding-oriented conceptual guides",
        template: "explanation",
      },
    ];

    // Add architecture documentation if complex pattern detected
    if (_architecture.pattern) {
      sections.push({
        title: "Architecture",
        path: "docs/architecture",
        description: `${_architecture.pattern} architecture documentation`,
        template: "architecture",
      });
    }

    // Add API documentation if endpoints found
    sections.push({
      title: "API Documentation",
      path: "docs/api",
      description: "API endpoints and usage",
      template: "api",
    });

    return {
      standard: "diataxis",
      sections,
    };
  }
}
