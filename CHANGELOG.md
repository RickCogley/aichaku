# Changelog

All notable changes to aichaku (愛着) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-07-06

### Added

- Command-based CLI architecture with init, upgrade, and uninstall commands
  (0679017, c9163c7)
- User customization system that survives upgrades with dedicated user/
  directory (0679017)
- Adaptive methodology blending based on natural language detection (7c15cb6)
- Version tracking with .aichaku.json metadata file (0679017)
- Comprehensive blending guide for AI assistants (7c15cb6)
- Planning documents using Aichaku's own methodology (2767e43)

### Changed

- **BREAKING**: CLI commands restructured - use `aichaku init` instead of
  `aichaku install`
- Methodologies now support adaptive blending rather than single selection
- Directory structure enhanced with clear separation of Aichaku vs user files
- Improved error handling and user feedback throughout CLI

### Fixed

- Upgrade process now preserves user customizations
- Better path validation for security
- Clearer help messages and command documentation

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
