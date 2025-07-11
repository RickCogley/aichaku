/**
 * Version information for Aichaku
 * Generated by Nagare on 2025-07-12T11:19:27.901Z
 * 
 * Note: This template generates TypeScript code, not HTML.
 * The |> safe filter is used to output raw values without escaping.
 */

export const VERSION = "0.26.0";

export const BUILD_INFO = {
  buildDate: "2025-07-12T11:19:27.901Z",
  gitCommit: "74146fe",
  buildEnvironment: "production",
  versionComponents: {
    major: 0,
    minor: 26,
    patch: 0,
    prerelease: null,
  },
} as const;

export const APP_INFO = {
  name: "Aichaku",
  description: "AI-optimized project methodology installer for Claude Code - brings affection (愛着) to your development workflow",
  repository: "https://github.com/RickCogley/aichaku",
  author: "Rick Cogley",
  homepage: "https://github.com/RickCogley/aichaku",
  license: "MIT",
} as const;
export const APP_METADATA = {} as const;
export const RELEASE_NOTES = {
  "version": "0.26.0",
  "date": "2025-07-12",
  "added": [],
  "changed": [
    "apply code formatting (74146fe)"
  ],
  "deprecated": [],
  "removed": [],
  "fixed": [
    "MCP HTTP server startup for installed version (10ec2ba)",
    "upgrade command metadata handling and add cleanup command (b2c3d06)"
  ],
  "security": []
} as const;