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
    {
      path: "./mod.ts",
      patterns: {
        version: /(\| Version \| )([^\s]+)( \|)/,
      },
      updateFn: (content: string, data: { version: string }) => {
        return content.replace(
          /(\| Version \| )([^\s]+)( \|)/,
          `$1${data.version}$3`,
        );
      },
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

  release: {
    // Verify package appears on JSR after release
    verifyJsrPublish: true,

    // Auto-fix configuration for CI/CD errors
    autoFix: {
      basic: true, // Enable deterministic fixes
      ai: {
        enabled: true, // Enable AI-powered fixes
        provider: "claude-code",
        // Choose thinking level based on your plan:
        // - "think": Basic analysis (lowest token usage)
        // - "megathink": Deeper analysis (medium token usage)
        // - "ultrathink": Deepest analysis (highest token usage)
        thinkingLevel: "ultrathink", // You have the max plan
        maxAttempts: 5,
      },
      types: [
        "lint",
        "format",
        "security-scan",
        "type-check",
        "version-conflict",
      ],
    },

    // Progress visualization
    progress: {
      enabled: true,
      style: "detailed",
      showElapsedTime: true,
    },

    // GitHub Actions monitoring
    monitoring: {
      workflowFile: ".github/workflows/publish.yml",
      pollInterval: 10000, // 10 seconds
      timeout: 600000, // 10 minutes
    },
  },

  docs: {
    enabled: true,
    outputDir: "./docs/api",
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
          args: [
            "check",
            "cli.ts",
            "mod.ts",
            "src/**/*.ts",
            "mcp/*/src/**/*.ts",
            "nagare.config.ts",
            "nagare-launcher.ts",
            "version.ts",
          ],
        });
        const checkResult = await checkCmd.output();
        if (!checkResult.success) {
          throw new Error("Type check failed");
        }

        // TODO: Re-enable tests when we have test coverage // DevSkim: ignore DS176209 - Legitimate TODO for test coverage
        // console.log("🧪 Running tests...");
        // const testCmd = new Deno.Command("deno", {
        //   args: ["test", "--allow-read", "--allow-write", "--allow-env"],
        // });
        // const testResult = await testCmd.output();
        // if (!testResult.success) {
        //   throw new Error("Tests failed");
        // }

        console.log("✅ All pre-release checks passed");
      },
    ],
    postRelease: [
      async () => {
        console.log("🔨 Building and uploading binaries...");

        // Build binaries and upload them to the GitHub release
        const buildCmd = new Deno.Command("deno", {
          args: ["run", "-A", "./scripts/build-binaries.ts", "--upload"],
          stdout: "inherit",
          stderr: "inherit",
        });

        const result = await buildCmd.output();
        if (!result.success) {
          console.error("⚠️  Binary build/upload failed - continuing anyway");
          // Don't throw - this is post-release, so the release already succeeded
        } else {
          console.log("✅ Binaries uploaded to GitHub release");
        }
      },
    ],
  },
} satisfies NagareConfig;
