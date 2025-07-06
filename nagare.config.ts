import type { NagareConfig } from "@rick/nagare/types";
import { TemplateFormat } from "@rick/nagare/types";

export default {
  project: {
    name: "Aichaku",
    description:
      "AI-optimized project methodology installer for Claude Code - brings affection (愛着) to your development workflow",
    repository: "https://github.com/RickCogley/aichaku",
    homepage: "https://github.com/RickCogley/aichaku",
    license: "MIT",
    author: "Rick Cogley",
  },

  versionFile: {
    path: "./version.ts",
    template: TemplateFormat.TYPESCRIPT,
  },

  updateFiles: [
    {
      path: "./deno.json",
      updateFn: (content: string, data: { version: string }) => {
        // Parse the JSON to safely update only the top-level version
        try {
          const config = JSON.parse(content);
          config.version = data.version;
          return JSON.stringify(config, null, 2);
        } catch (_error) {
          // Fallback to regex if JSON parsing fails
          return content.replace(
            /^(\s*"version":\s*)"[^"]+"/m,
            `$1"${data.version}"`,
          );
        }
      },
    },
    {
      path: "./README.md",
      // Using built-in handler for standard badge format
    },
  ],

  releaseNotes: {
    includeCommitHashes: true,
    maxDescriptionLength: 120,
  },

  github: {
    owner: "RickCogley",
    repo: "aichaku",
    createRelease: true,
  },

  options: {
    tagPrefix: "v",
    gitRemote: "origin",
  },

  docs: {
    enabled: true,
    outputDir: "./docs",
    includePrivate: false,
  },

  hooks: {
    preRelease: [
      async () => {
        console.log("🔍 Running format check...");
        const fmtCheck = new Deno.Command("deno", {
          args: ["fmt", "--check"],
        });
        const fmtResult = await fmtCheck.output();
        if (!fmtResult.success) {
          throw new Error("Format check failed");
        }

        console.log("🔍 Running linter...");
        const lintCmd = new Deno.Command("deno", {
          args: ["lint"],
        });
        const lintResult = await lintCmd.output();
        if (!lintResult.success) {
          throw new Error("Lint check failed");
        }

        console.log("🔍 Running type check...");
        const checkCmd = new Deno.Command("deno", {
          args: ["check", "**/*.ts"],
        });
        const checkResult = await checkCmd.output();
        if (!checkResult.success) {
          throw new Error("Type check failed");
        }

        console.log("🧪 Running tests...");
        const testCmd = new Deno.Command("deno", {
          args: ["test", "--allow-read", "--allow-write", "--allow-env"],
        });
        const testResult = await testCmd.output();
        if (!testResult.success) {
          throw new Error("Tests failed");
        }

        console.log("✅ All pre-release checks passed");
      },
    ],
  },
} satisfies NagareConfig;
