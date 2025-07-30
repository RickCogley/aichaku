# Changelog

All notable changes to aichaku (愛着) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.39.4] - 2025-07-30

### Fixed

- handle false boolean value in bare command (6f9735b)

## [0.39.3] - 2025-07-30

### Fixed

- fix --show parsing and make principles consistent (bb1f2d1)

## [0.39.2] - 2025-07-30

### Changed

- bump version to 0.39.1 (8692732)

## [0.39.1] - 2025-07-30

### Fixed

- critical fix - use global path for principles (7bbb3a9)

## [0.39.0] - 2025-07-30

### Added

- complete Week 6 - testing, polish, and release preparation (0235831)
- complete Week 5 - learn command integration (33d3797)
- complete CLAUDE.md integration for principles (1fbbfae)
- create complete principle content library (03c0693)
- implement selection and storage functionality (63e8ef3)

### Changed

- orchestrate Week 6 - testing and polish phase (3bbfa3c)
- add comprehensive branding requirements to principles system (c338d73)
- clarify principles use both YAML and Markdown files (190a67e)
- elevate nice-to-haves to core features for principles system (d9fde8c)
- shape up principles guidance system for implementation (22c0dbc)

### Fixed

- resolve type errors in test files (82650f0)
- resolve lint issues in performance test (1f1ffbf)

## [0.38.1] - 2025-07-29

### Changed

- add Shape Up pitch for agent customization system (c57eb74)

### Fixed

- prevent double agent prefix and always use fresh templates (1c630d4)

## [0.38.0] - 2025-07-29

### Added

- add core content fetching to init and upgrade commands (be44e22)

## [0.37.0] - 2025-07-29

### Added

- update MCP status display and agent templates for Claude Code enhancements (dc5f25d)
- enhance UI consistency with printFormatted across all commands (08ea911)

### Fixed

- resolve multiple issues in learn command and upgrade process (d94b19f)

## [0.36.4] - 2025-07-29

### Fixed

- resolve v0.36.3 terminal display issues (d595eb9)

## [0.36.3] - 2025-07-29

### Fixed

- complete v0.36.2 bug fixes and add consistent help formatting (d77c888)

## [0.36.2] - 2025-07-29

### Changed

- remove references to deleted docs-standard command (1158427)
- reformat all markdown files to use underscore emphasis (366604a)
- simplify markdown formatting to align with deno fmt defaults (0575336)
- add implementation summary and status for v0.36.2 release (8b436e3)
- bump version to 0.36.2 with release notes (4f4350a)
- add v0.36.0 features and GitHub Pages fix documentation (6778d69)

### Fixed

- update nagare config for simplified formatting and exclude test file (a8cb7b5)
- resolve linting errors preventing build (b4d17c2)
- complete remaining v0.36.2 bugfixes (e449697)
- complete Phase 3-6 of v0.36.2 bugfixes (7caa1a5)
- complete Phase 1 and partial Phase 2 of v0.36.2 bugfixes (65f892c)
- convert remaining docs/ links to absolute GitHub URLs (e8d6bca)
- add Jekyll config to exclude docs directory from GitHub Pages processing (0bbe2bd)
- convert relative links to absolute GitHub URLs for Pages compatibility (fec7f3c)

## [0.36.1] - 2025-07-28

### Changed

- bump version to 0.36.0 (1d4656a)

### Fixed

- include config-manager.ts in publish to resolve JSR exclusion error (81422e3)

## [0.36.0] - 2025-07-28

### Added

- complete sub-agent system with technology expert templates (4a5e2fa)
- complete sub-agent methodology focus project implementation (772750d)
- implement methodology-aware installation and merge-docs command (cc13fe8)
- complete agent template system with cross-functional configuration (ffb7c74)
- add comprehensive subfolder CLAUDE.md context files (84230de)
- integrate subfolder CLAUDE.md discovery behavioral directive (de58174)
- enhance subfolder CLAUDE.md integration (dc34813)
- implement deno fmt-based markdown workflow (d5598ef)
- establish professional markdown standards system (3e48b8a)
- add comprehensive GitHub templates system (9650d86)
- add development tooling configuration (dbfe076)

### Changed

- add Shape Up methodology selection and untrack settings.local.json (c1d1176)
- update .gitignore to exclude local agent files and scratch directories (5568530)
- add ephemerals to gitignore (6ebdc01)
- add methodologies command to CLI exports and fix TypeScript capitalization (55c2d6f)
- final formatting cleanup from pre-commit hook execution (508494f)
- clean up formatting artifacts from pre-commit hook improvements (5f2e9ec)
- add session work checkpoint (94d390a)
- add pre-commit hook determinism checkpoint (9a5f621)
- update deterministic behavior testing checkpoint (7b2fb7d)
- create checkpoint for deterministic behavior testing session (63d4d3d)
- verify pre-commit hook fix for staged-only formatting (96ba10b)
- add comprehensive analysis checkpoint (484133c)
- apply DRY principle to documentation standards templates (4d3e7e4)
- fix microsoft-style.md rendering issues with DRY approach (f9e1442)
- remove obsolete reference documentation (5bade73)
- apply DRY principle to manage-custom-standards.md (2fbf787)
- rewrite configure-project.md with correct workflow (0e65b35)
- update .editorconfig for markdown formatting consistency (ee570a7)
- Revert "style: apply professional markdown formatting to all documentation" (1548e67)
- organize root directory files into appropriate locations (005d4ff)
- apply professional markdown formatting to all documentation (3783ea6)
- add session checkpoint for GitHub Markdown standards implementation (dbff015)
- remove archived methodology files (531dbe2)
- add session checkpoint for dependency updates (b1543e8)
- bump aichaku version (276a01b)

### Fixed

- use custom format-check script in GitHub Actions (996f6d2)
- prevent markdown linter from checking entire repository (cc0dd77)
- resolve markdown formatting conflicts between deno fmt and markdownlint (d8ee724)
- limit markdown linter to staged files only (be7e309)
- remove malformed checkpoint file (dfcfb10)
- limit markdown linting to staged files only (ba9d452)
- improve pre-commit hook to only format staged files (a56cddc)
- correct markdownlint emphasis style to match standards (632b3e0)
- update markdown formatting workflow and hooks (d380933)
- add language specifications to code blocks in core documentation (367fc31)

## [0.35.7] - 2025-07-20

### Changed

- bump nagare version (fe75db4)

## [0.35.6] - 2025-07-20

### Changed

- format checkpoint documentation (b229ae7)
- add session checkpoint for nagare postRelease hook fix (4fc710d)

### Fixed

- correct postRelease hook to build binaries before upload (6cc095c)

## [0.35.5] - 2025-07-20

### Changed

- update lock file and format checkpoint documentation (5435dfc)
- update all dependencies to latest versions (18969d6)
- checkpoint before exit (eff71b5)
- upgrade aichaku (c5b47cb)

## [0.35.4] - 2025-07-18

### Changed

- remove trailing whitespace from upgrade.ts (377cc12)
- update local aichaku.json from upgrade testing (802c744)

### Fixed

- clean up legacy metadata fields during project upgrades (d24f94f)

## [0.35.3] - 2025-07-18

### Changed

- format upgrade.ts code for standards migration (ff1d8ad)
- update local aichaku project files from testing (054d108)

### Fixed

- standards command now discovers built-in standards correctly (fefe729)
- migrate standards configuration during project upgrades (f516def)

## [0.35.2] - 2025-07-18

### Changed

- update local aichaku.json from upgrade testing (119355c)

### Fixed

- recreate .aichaku-behavior file during project upgrades (a6af92b)

## [0.35.1] - 2025-07-18

### Fixed

- complete .aichaku-behavior preservation in upgrade command (a6b6a22)
- preserve .aichaku-behavior files during cleanup operations (139631c)
- remove Markdown formatting from CLI output (b9e8024)

## [0.35.0] - 2025-07-18

### Added

- add comprehensive location context to upgrade commands (2a6b6e0)

### Fixed

- improve project upgrade completion message accuracy (7c293c5)

## [0.34.1] - 2025-07-18

### Changed

- update project configuration after upgrade testing (0eb2f82)
- add Shape Up project for contextual guidance implementation (b4b7595)

### Fixed

- critical upgrade command overhaul - proper file management and legacy cleanup (3150b2a)

## [0.34.0] - 2025-07-17

### Added

- add enhanced contextual guidance demonstration (90baab5)
- implement foundation fixes for senior engineer quality standards (0714218)

### Changed

- add comprehensive foundation quality documentation across core sections (fef4663)
- update project documentation and central docs with foundation improvements (6aec75c)
- foundation fixes completion - senior engineer quality standards (20fc5a3)

### Fixed

- apply deno fmt to resolve release-blocking formatting issues (5d87e36)
- complete configuration cleanup and integration improvements (dd1548d)
- resolve pre-flight testing issues for TypeScript compliance (313a05b)

## [0.33.0] - 2025-07-17

### Added

- complete architecture consolidation and legacy format purge (94d94fd)
- add automatic binary cleanup to build script (7218efd)

### Fixed

- prevent creation of separate aichaku-standards.json file (cdc1164)
- restore missing aichaku.json metadata file (9fcd606)

## [0.32.0] - 2025-07-17

### Added

- add proper --help support to migrate and uninstall commands (2e4af96)
- implement methodology comparison table (1a92ed3)
- normalize standard IDs to support both old and new formats (d6f393c)

### Changed

- bump aichaku to 0.31.5 (0a0b78b)

### Fixed

- resolve upgrade metadata preservation and user experience issues (e57a0f0)

## [0.31.5] - 2025-07-17

### Changed

- restore test configuration and update CLAUDE.md (041a49b)

### Fixed

- preserve existing metadata fields during upgrade (f8fd18d)

## [0.31.4] - 2025-07-17

### Changed

- format checkpoint Markdown file (788e112)
- add checkpoint for aichaku configuration consolidation session (1bd0a3e)

### Fixed

- consolidate aichaku configuration and improve upgrade system (0f0696b)

## [0.31.3] - 2025-07-17

### Changed

- add checkpoint for upgrade command fixes (ab6630f)

### Fixed

- resolve upgrade command config file detection (63d7bd8)

## [0.31.2] - 2025-07-17

### Changed

- Revert "chore(release): bump version to 0.31.1" (d0ce53b)

## [0.31.0] - 2025-07-17

### Added

- implement dynamic content discovery for upgrade command (de6ab1d)

## [0.30.1] - 2025-07-17

### Changed

- format documentation files (49b6a88)

### Fixed

- update fetch paths to include docs/ directory prefix (524955f)

## [0.30.0] - 2025-07-16

### Added

- implement dynamic learn command to replace hard-coded help (b50a837)
- implement YAML-based configuration system (7c2f88b)
- enhance MCP server functionality (2ac8128)
- add YAML configuration infrastructure (0ba7b89)
- simplify security workflow to focus on security checks only (55a6ee0)
- add strategic documentation links to README (1b4daeb)
- add cleanup script for migrating legacy structures (85d7185)
- complete standards migration to /docs/standards/ (cc46889)

### Changed

- apply Deno formatter to source files (6643fcd)
- add project documentation for recent work (14c0102)
- format documentation and update configurations (863b477)
- optimize YAML config reader for reduced CLAUDE.md size (1c4dc85)
- update project documentation and integration (96069cd)
- reorganize methodology documentation structure (f963bae)
- implement new documentation architecture (4541921)
- remove .nojekyll (ab327b7)
- focus security workflow on security checks only (ccc79db)
- apply deno fmt formatting fixes (e33f933)
- update references and documentation for new structure (bc4f897)
- remove legacy .claude files after migration (e486cdf)
- add session checkpoint for config consolidation work (d67d6ea)
- update source code to use simplified methodology filenames (3cda661)
- migrate methodologies from root to /docs/methodologies/ (8088813)
- consolidate config files into single aichaku.json (767953a)
- migrate standards from /standards/ to /docs/standards/ (c1821f9)
- update docs/api (4f3b637)
- update API documentation for v0.29.0 (c5bcaf5)

### Fixed

- exclude config-manager.test.ts to fix type checking (9bfa2a1)
- implement top-level deno.json exclude for type checking (113c226)
- disable built-in type check in nagare autofix (a42eed1)
- update nagare config to exclude v2 files from type check (49fe0d2)
- exclude v2 files from type check in nagare config (5771486)
- remove formatting and linting from security workflow (e3926c0)
- resolve linting and type errors in codebase (d903ca7)
- format security.yml to pass deno fmt checks (99ea5ac)
- update README links to correct methodology guide filenames (b972f6e)
- escape Jekyll syntax in Jekyll rendering guide (4c54bef)
- liquid syntax to entities (645d5c0)
- replace Jekyll raw tags with HTML entities for GitHub compatibility (37a2bd2)
- remove .nojekyll file that was breaking GitHub Pages (fd03e9f)
- add .nojekyll to prevent Jekyll processing on GitHub Pages (ad8fa7d)
- resolve type errors and linting issues in migration code (e5afe22)
- resolve type errors and linting issues (86ba77e)
- update deno.json publish config to include entire docs/ directory (baae0f6)
- update YAML files to use runtime paths (eb96227)
- update standards path references in source files (2640bab)
- temporarily disable Nagare docs generation due to dependency issue (242e4b3)

## [0.29.0] - 2025-07-14

### Added

- prepare v0.29.0 release with enhanced hooks and documentation (f1a1a1e)
- implement consistent CLI branding system (7fb65ad)
- implement auto version check and complete project cleanup (b207459)
- add MCP feedback system for visible hook output (7201062)
- add visible feedback hook for developer confidence (456c32e)
- add comprehensive hooks system with TypeScript implementation (83fc0cc)

### Changed

- add version consistency and preflight completion summary (6ee34f4)
- update MCP configuration to use user scope by default (195b97f)
- complete permanent reference docs project with superior implementation (486cab0)
- update MCP server improvements status - 90% complete (faa3db3)
- update unified MCP enhancement status with today's progress (c0be53b)
- audit and clean up active projects based on implementation status (1be1a89)
- fix project date organization (aa33696)
- fix project organization and cleanup (8b7b52d)
- add hooks visibility improvements documentation (546ce97)
- remove test file (4f2ad5b)
- complete TypeScript hooks implementation project (f6cdaec)
- test commit (ced1b97)
- document Salty aichaku upgrade process (151f5f6)
- document nagare aichaku upgrade process (bfe1a67)
- enhance branding pitch with CLI messaging standards (e0c134b)
- add Shape Up pitches for content fetcher and branding improvements (5318ceb)

### Fixed

- format version-checker test for release (bb71a35)
- resolve test failures for successful release (c00dd29)
- replace overly broad --allow-all with specific Deno permissions (9276270)
- standardize MCP SDK versions and enforce Deno 2.4.0+ requirement (7704ed5)
- format README.md to pass CI checks (2dc0fea)
- improve MCP server output clarity and documentation (2f1e9cd)
- remove erroneous .claude directory from docs/projects (d2d8571)
- update methodology file structure and improve error reporting (dadcbd6)

## [0.28.0] - 2025-07-13

### Added

- add Shape Up pitch for automatic version checking (a4eecf1)

### Changed

- upgrade local (335f793)
- apply code formatting to nagare.config.ts (34d7eb0)
- clarify upgrade process for CLI vs global files (f2b16f7)
- add cache clearing to upgrade instructions (ff57464)
- fix installation commands in README (f765dc7)

### Fixed

- update core methodology files for new project structure (072643f)
- update CLAUDE.md integration content for new paths (f732d31)
- update init command for new project structure (d1fb325)
- update CLI messages to show docs/projects path (9f7ea9c)
- update project paths from .claude/output to docs/projects (3d66270)
- use package-and-upload script in nagare postRelease hook (1a07ace)

## [0.27.0] - 2025-07-13

### Added

- implement enhanced hooks command with installation options (9059c14)

### Changed

- apply code formatting (cab0607)
- add hooks release summary and security workflow simplification project (ba1578d)
- apply code formatting (a9bf086)
- track CLI polish issues in standards integration project (c5fc4f7)
- organize completed projects and archive to done (cbd5995)
- update README with cleanup command and HTTP/SSE server details (d90d3af)

### Fixed

- resolve type errors in hooks command (5aacca1)
- disable overly broad path traversal pattern in security workflow (dee96ba)
- update security workflow to exclude legitimate file operations (ac0a19a)
- rename test-review.ts to follow test naming convention (a4dda94)
- implement proper script-based conversation summary hooks (c9a7756)
- use dynamic VERSION import in packaging script (6fe8915)

## [0.26.0] - 2025-07-12

### Changed

- apply code formatting (74146fe)

### Fixed

- MCP HTTP server startup for installed version (10ec2ba)
- upgrade command metadata handling and add cleanup command (b2c3d06)

## [0.25.0] - 2025-07-12

### Added

- implement HTTP/SSE server mode for MCP with multi-client support (c13a1dc)
- add `cleanup` command to remove legacy Aichaku files from old locations
- add metadata migration logic to handle multiple config file locations

### Changed

- update version and changelog from previous release attempt (2f3e4a9)
- temp: skip lint check for release (minor test file warnings) (fcf0dde)

### Fixed

- cast unknown to string for eval in test file (de25dd4)
- apply code formatting (41d79a0)
- resolve all lint errors for clean release (d9d2e79)
- format nagare config (31d3634)
- fix upgrade command to correctly read metadata from both old and new locations
- fix version display in upgrade command (was showing old version from legacy config file)

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
- implement unified MCP server enhancements with feedback and statistics (b7492f0)

### Changed

- rename example TypeScript files to exclude from type check (ea396df)
- format code for release compliance (b26dc65)
- add MCP server contributing and security documentation (746dd94)
- migrate project docs and checkpoints to /docs/ for better discoverability (cd3b651)
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

- resolve critical path traversal vulnerabilities in MCP server and CLI (39132d4)

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
- enhance MCP server with visibility logging and documentation patterns (e23f2e7)
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
- exclude .GitHub and .claude from permission checks (6da49d1)
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
- add planning documents for adaptive refactor using Aichaku methodology (2767e43)

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
