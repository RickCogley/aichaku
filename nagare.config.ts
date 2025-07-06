import type { NagareConfig } from "@rick/nagare";

const config: NagareConfig = {
  name: "aichaku",
  version: {
    structureType: "JSR",
    files: ["deno.json"],
    jsonPath: "version",
    versionFile: {
      enabled: true,
      path: "version.ts",
      template: `/**
 * Auto-generated version file by Nagare
 * DO NOT EDIT MANUALLY
 */

export const VERSION = "{{VERSION}}";
export const VERSION_INFO = {
  version: "{{VERSION}}",
  gitCommit: "{{GIT_COMMIT}}",
  buildTime: "{{BUILD_TIME}}",
};`,
    },
  },
  changelog: {
    enable: true,
    file: "CHANGELOG.md",
    template: `# Changelog

All notable changes to aichaku (愛着) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of aichaku
- Shape Up methodology installer
- Global and project-level installation support
- PDF generation scripts
- Methodology templates and personas

{{ENTRIES}}`,
  },
  github: {
    enable: true,
    repository: "RickCogley/aichaku",
    release: {
      enable: true,
      draft: false,
    },
  },
  validation: {
    enabled: true,
    preRelease: [
      {
        name: "Format Check",
        command: ["deno", "fmt", "--check"],
      },
      {
        name: "Lint",
        command: ["deno", "lint"],
      },
      {
        name: "Type Check",
        command: ["deno", "check", "**/*.ts"],
      },
      {
        name: "Tests",
        command: ["deno", "test", "--allow-read", "--allow-write", "--allow-env"],
      },
    ],
  },
};

export default config;