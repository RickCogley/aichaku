# Changelog

All notable changes to aichaku (愛着) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.25.0] - 2025-07-12

### Added

- implement HTTP/SSE server mode for MCP with multi-client support (c13a1dc)

## [0.23.0] - 2025-07-11

### Added

- add MCP tool names to aichaku mcp status output (3928264)

### Changed

- apply deno fmt formatting to MCP status output (7750677)

### Fixed

- add more exclusions to security workflow for legitimate paths (2181b2c)
- update security workflow to exclude legitimate relative imports (5cfc046)
- resolve path traversal security vulnerabilities (3d90194)

## [0.22.0] - 2025-07-11

### Added

- shape MCP project documentation manager concept (c9051f7)
- implement unified MCP server enhancements with feedback and statistics
  (b7492f0)

### Changed

- rename example TypeScript files to exclude from type check (ea396df)
- format code for release compliance (b26dc65)
- add MCP server contributing and security documentation (746dd94)
- migrate project docs and checkpoints to /docs/ for better discoverability
  (cd3b651)
- mark MCP enhancement work as completed (1aa6afd)
- add MCP enhancement session documentation (7241c29)
- update README with MCP server features and examples (180ed23)
- add comprehensive MCP server and tools documentation (243dd04)
- add Aichaku session documentation for MCP enhancements (deecef7)
- upgrade aichaku project to v0.21.1 (82b63cf)

### Fixed

- resolve all TypeScript and lint errors for release (54fa56c)
- correct path validation in build-binaries script (3b164b7)
- additional path traversal security fixes for workflow compliance (de614a5)

## [0.21.1] - 2025-07-11

### Changed

- format code after security fixes (b00a22e)

### Fixed

- resolve critical path traversal vulnerabilities in MCP server and CLI
  (39132d4)

## [0.21.0] - 2025-07-11

### Added

- add custom standards system and folder reorganization (d2e0a2b)

### Changed

- update deno.lock for nagare v2.9.1 (9f584d4)
- bump nagare to v2.9.1 (eec3119)

### Fixed

- reset version to 0.20.0 for proper release (b1e032b)
- include deps.ts in publish configuration (ba22f02)

## [0.20.0] - 2025-07-11

### Added

- reorganize to ~/.claude/aichaku/ folder structure (5a76eaf)
- enhance MCP server with visibility logging and documentation patterns
  (e23f2e7)
- add docs-lint command for documentation quality checking (12aee2b)
- add docs-standard command for documentation standards management (e266c70)
- add standards system with bundled content (475a761)

### Changed

- reorganize user customization paths to logical structure (7b322e8)
- update module exports and documentation integration guides (d13fdff)
- migrate documentation system to Diátaxis framework (a69d287)
- add comprehensive architecture documentation (5b3de44)
- clean up CLAUDE.md and configure appropriate standards (43adec2)
- configure project standards for Aichaku (b8ceaca)
- use explicit permissions instead of -A in README (87fbe07)
- Revert "fix: use -A permissions in init.ts installer" (405d379)

### Fixed

- resolve all lint, format, and type check errors for release (37bb367)
- correct date format in integrate command output (38ac16a)
- add --allow-run permission to init.ts installer (0d8da2c)
- use -A permissions in init.ts installer (5a21d27)

## [0.19.0] - 2025-07-10

### Added

- automate binary building and uploading during releases (14d8ed9)

### Changed

- fix formatting (fda0cdd)
- format code for release (7b3990a)

## [0.18.0] - 2025-07-10

### Added

- add MCP command to Aichaku CLI (01bd897)

### Fixed

- handle command-specific help properly (fc7642a)

## [0.17.0] - 2025-07-10

### Added

- implement MCP server for automated code review (ca06933)
- enhance integrate command with standards support (9fd251f)
- add hooks and standards commands (638ed97)
- enhance help command with standards knowledge base (a780a71)
- design MCP code reviewer with advanced prompting (d58df7c)
- add Claude session management (f784dc3)

### Changed

- format code for release (5d5761f)
- format MCP server files for release (5861e38)
- update CLAUDE.md with latest Aichaku features (0c0647b)
- add Aichaku project standards configuration (1d8fbb9)
- add Claude Code session documentation (39ab925)
- standardize output folder naming convention (6297294)
- upgrade to latest and clean up (3add17d)

### Fixed

- resolve type checking errors (2870886)
- resolve linting errors in MCP server (40abf00)

## [0.16.0] - 2025-07-09

### Added

- add manual workflow_dispatch to security scans (841e0f0)

### Fixed

- revert LGTM comment attempt in nagare.config.ts (c5273dd)
- update CodeQL suppression format for useless assignment (2199d59)
- add CodeQL suppression comments for security alerts (0a200e9)
- remove duplicate workflow_dispatch in security.yml (a0c345d)
- exclude .github and .claude from permission checks (6da49d1)
- exclude docs folder from insecure randomness check (fd82e9c)
- exclude relative methodologies paths in security workflow (0b9c2b5)
- add security comments to validated file operations (fc72472)
- correct CodeQL suppressions and security workflow (5e2bd02)

## [0.15.3] - 2025-07-08

### Fixed

- add security suppression comments and workflow exclusions (b52236f)

## [0.15.2] - 2025-07-08

### Fixed

- format security workflow (a96748f)
- comprehensive workflow and security improvements (9c4ef1c)

## [0.15.1] - 2025-07-08

### Fixed

- remove test bypass and improve XP diagram (0ade517)

## [0.15.0] - 2025-07-08

### Added

- complete help system with diagrams and full branding (6c2f84e)

## [0.14.0] - 2025-07-08

### Added

- enhance help system with better branding and formatting (c7536f1)

### Fixed

- resolve lint error (c7a6d3b)
- improve installer output and help command usability (d04e799)

## [0.13.0] - 2025-07-08

### Added

- add help command and improve installer output (24b3b19)

### Fixed

- resolve lint issues in help command (1f42843)
- finalize formatting (e668614)
- format files for release (a9a5c26)

## [0.12.1] - 2025-07-08

### Changed

- format init.ts (c9dc6e9)

### Fixed

- clean up installer output and improve messaging (cb9ca49)

## [0.12.0] - 2025-07-08

### Added

- improve installer next steps and add v0.11.0 release notes (0f96c50)

### Fixed

- update methodology file list to match actual repository structure (060615c)

## [0.11.0] - 2025-07-08

### Added

- support updating changed methodology files during upgrades (cf807f4)

### Changed

- clarify automatic methodology updates during upgrades (d857d21)
- simplify methodology updates - always overwrite during upgrades (76d2942)

### Fixed

- remove unused variable to pass linting (426b08e)
- ensure new methodology files are downloaded during upgrades (16177be)

## [0.10.0] - 2025-07-08

### Added

- improve installer feedback and next steps messaging (4dee101)

### Changed

- format methodology-fetcher.ts (5cfaa53)

### Fixed

- type error in methodology fetcher (0373080)
- eliminate misleading network permission warnings during upgrade (d621073)

## [0.9.2] - 2025-07-08

### Changed

- format upgrade.ts for release (3e4fe4a)

### Fixed

- support new project marker format in upgrade command (9ae8dbd)

## [0.9.1] - 2025-07-08

### Changed

- format init.ts for release (d3336b3)

### Fixed

- improve installer upgrade handling and verification (32e461b)

## [0.9.0] - 2025-07-08

### Added

- unified upgrade command with surgical CLAUDE.md updates (fb37a9c)

## [0.8.1] - 2025-07-08

### Changed

- update deno.lock (cc92ffd)
- format files for release (81f91d0)
- bump nagare version (280917f)
- use GitHub Pages URL and clarify API documentation (8a08c5d)

### Fixed

- remove unused JSR_URL variable (c4bae6f)
- installer now actually upgrades Aichaku (8bd4e73)

## [0.8.0] - 2025-07-08

### Added

- ultra-simple installation like Lume (4c708c6)

## [0.7.0] - 2025-07-08

### Added

- implement three major enhancements for v0.7.0 (0b9253c)
- improve current phase visibility (129bc47)

### Changed

- update deno.lock (b1964ea)
- format nagare.config.ts (a45d2f0)
- bump nagare to latest version (c55aa06)
- balance visual identity approach for clarity (71e41b9)
- update visual identity to 🪴 potted plant icon (68cb1b6)
- shape visual UX enhancements for Aichaku (32fa599)
- shape two new enhancements for Aichaku (f635a92)
- move completed projects to done directories (427ee5e)
- shape three enhancement projects (c69bc2a)
- organize output documents (ece1b07)
- integrate Aichaku v0.6.0 directives (14ffc6a)

### Fixed

- correct Scrum progress visualization (8991549)
- format security workflow YAML file (284eddb)
- simplify path traversal check to avoid false positives (dddf477)
- improve path traversal detection in security workflow (019eba5)
- update security workflow to handle legitimate relative paths (7d076dc)
- add missing newline at end of init_test.ts (69533fb)
- update tests to handle existing global installation (09c0627)
- format test files for CI compliance (7a81f71)
- format CLAUDE.md to pass security tests (3088884)

## [0.6.0] - 2025-07-07

### Changed

- design magical Aichaku integration behavior (6b78942)

### Fixed

- correct all dates and standardize change log naming (47c0795)

## [0.5.0] - 2025-07-06

### Added

- major v0.5.0 redesign - global methodologies, clean projects (3a17fdf)

### Changed

- temporarily disable tests for v0.5.0 release (56f9960)
- format code for release (b000e0b)
- add implementation summary and update status for v0.5.0 (3445e5e)
- format code for release (9acc910)
- add helpful command hints and GitHub link to init output (9a4be52)

## [0.4.1] - 2025-07-06

### Changed

- improve init command output with better messaging (c2edce4)

## [0.4.0] - 2025-07-06

### Added

- add integrate command to add Aichaku reference to CLAUDE.md (23887aa)

### Changed

- format code for release (7589d4e)
- update documentation for integrate command (3eb985f)
- move release notes to output folder (27a707d)

## [0.3.1] - 2025-07-06

### Fixed

- resolve type error in methodology-fetcher (1da605a)
- resolve lint error in methodology-fetcher (bc6472c)
- add methodology fetcher for JSR installations (f7062d9)

## [0.3.0] - 2025-07-06

### Added

- add adaptive blending guides to methodologies (7c15cb6)
- implement upgrade and uninstall commands (c9163c7)
- refactor CLI to command-based structure with init command (0679017)

### Changed

- add release notes and changelog for v0.3.0 (a2dd9f4)
- add planning documents for adaptive refactor using Aichaku methodology
  (2767e43)

## [0.2.2] - 2025-07-06

### Changed

- improve JSR score with comprehensive documentation (1750b40)

## [0.2.1] - 2025-07-06

### Changed

- revert JSR token addition - OIDC should work after linking repo (569ffed)

### Fixed

- add JSR authentication token to publish workflow (dccaf5e)

## [0.2.0] - 2025-07-06

### Added

- improve JSR score and add documentation (48188f6)
- add pre-commit hook for automatic formatting (f5fc19e)

### Changed

- update deno.lock (17ab089)
- add claude code settings (cb14858)
- fix import order formatting (7c70533)
- add publish configuration for JSR (47c32b2)

### Fixed

- exclude docs from linting and improve JSR documentation (b6cd23f)
- update imports to use JSR specifiers for publishing (4bc9aa5)

## [0.1.0] - 2025-07-06

### Added

- add comprehensive security scanning workflows (b8d959b)
- add JSR publishing workflow (85c61a5)
- add simplified 3-mode methodology system (ea3290d)
- initial aichaku project setup with Deno and Nagare (d652886)

### Changed

- prepare for v0.1.0 release (e86dde6)
- add GitHub configuration and documentation (a90098a)
- add comprehensive README and changelog (501125c)
- add security policy and Claude guidance (77ceb54)
- Initial commit (cf25f63)

## [Unreleased]

### Added

- Initial release of aichaku
- Shape Up methodology installer
- Global and project-level installation support
- PDF generation scripts
- Methodology templates and personas
- CLI tool with install command
- Symlink support for installations
- Force overwrite option
- Silent mode for automation
