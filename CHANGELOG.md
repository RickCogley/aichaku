# Changelog

All notable changes to aichaku (愛着) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
