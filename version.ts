/**
 * Version information for Aichaku
 * Generated by Nagare on 2025-08-01T11:13:14.286Z
 *
 * Note: This template generates TypeScript code, not HTML.
 * The |> safe filter is used to output raw values without escaping.
 */

export const VERSION = "0.41.3";

export const BUILD_INFO = {
  buildDate: "2025-08-01T11:13:14.286Z",
  gitCommit: "d422994",
  buildEnvironment: "production",
  versionComponents: {
    major: 0,
    minor: 41,
    patch: 3,
    prerelease: null,
  },
} as const;

export const APP_INFO = {
  name: "Aichaku",
  description:
    "AI-optimized project methodology installer for Claude Code - brings affection (愛着) to your development workflow",
  repository: "https://github.com/RickCogley/aichaku",
  author: "Rick Cogley",
  homepage: "https://github.com/RickCogley/aichaku",
  license: "MIT",
} as const;
export const APP_METADATA = {} as const;
export const RELEASE_NOTES = {
  "version": "0.41.3",
  "date": "2025-08-01",
  "added": [],
  "changed": [],
  "deprecated": [],
  "removed": [],
  "fixed": [
    "prefer YAML over markdown for content metadata (d422994)",
    "eliminate duplicate search results in fuzzy search (2042fcd)",
  ],
  "security": [],
} as const;
