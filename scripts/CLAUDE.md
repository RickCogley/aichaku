# Scripts Module Context

```yaml
module:
  name: "scripts"
  purpose: "Build automation, development tools, and deployment scripts for aichaku project"
  architecture: "build_automation"

categories:
  build_automation:
    - "build-binaries.ts: Cross-platform binary compilation for distribution"
    - "bootstrap-release.ts: Release preparation and version management"
    - "package-and-upload.ts: Distribution packaging and registry publishing"

  installation_support:
    - "install.ts: Alternative installation method and setup"
    - "cleanup-global-installation.ts: Clean removal of global installations"
    - "cleanup-all-projects.sh: Batch cleanup across multiple projects"

  migration_utilities:
    - "migrate-standards.sh: Legacy standards format migration"
    - "update-standards-references.sh: Bulk update of standards references"

  development_tools:
    - "new-doc.sh: Quick documentation file creation"
    - "mcp-client.ts: MCP server testing and debugging client"
    - "mcp-review-hook.sh: Git hook integration for automated code review"

patterns:
  build_system:
    - "Use Deno for TypeScript compilation and bundling"
    - "Cross-platform binary generation with deno compile"
    - "Version management through automated release scripts"
    - "Distribution to multiple package registries (JSR, npm)"

  automation_principles:
    - "Idempotent operations that can be run multiple times safely"
    - "Comprehensive error handling with descriptive exit codes"
    - "Progress reporting for long-running operations"
    - "Dry-run support for destructive operations"

  security_practices:
    - "Path validation for all file operations"
    - "Secure handling of API tokens and credentials"
    - "InfoSec: No hardcoded secrets or sensitive data in scripts"
    - "Minimal permissions and safe defaults"

script_purposes:
  bootstrap_release:
    purpose: "Prepare release artifacts and update version metadata"
    workflow:
      - "Version validation and increment"
      - "Changelog generation and validation"
      - "Binary compilation for target platforms"
      - "Package registry preparation"

  build_binaries:
    purpose: "Compile cross-platform binaries for distribution"
    targets:
      - "x86_64-unknown-linux-gnu: Linux AMD64"
      - "x86_64-pc-windows-msvc: Windows x64"
      - "x86_64-apple-darwin: macOS Intel"
      - "aarch64-apple-darwin: macOS Apple Silicon"

  mcp_integration:
    purpose: "MCP server development and integration testing"
    components:
      - "mcp-client.ts: Test client for MCP server development"
      - "mcp-review-hook.sh: Git hook for automated code review"

  migration_support:
    purpose: "Support migration from legacy aichaku versions"
    scope:
      - "Standards format updates and reference corrections"
      - "Folder structure migration from old layouts"
      - "Configuration format consolidation"

development_workflow:
  local_development:
    - "Use scripts for consistent development environment setup"
    - "Automated testing and validation before commits"
    - "Local binary compilation for testing distribution"

  ci_cd_integration:
    - "Scripts designed for both local and CI environment execution"
    - "Environment detection and appropriate behavior adaptation"
    - "Artifact generation and upload automation"

  release_process:
    - "Automated version management and tagging"
    - "Multi-platform binary compilation and testing"
    - "Package registry publishing with proper metadata"

testing_approach:
  script_validation:
    - "Test all scripts in clean environments"
    - "Verify cross-platform compatibility"
    - "Test error conditions and edge cases"
    - "Validate generated artifacts and distributions"

  integration_testing:
    - "Test complete build and release workflows"
    - "Verify MCP server integration and functionality"
    - "Test migration scripts against real legacy installations"

maintenance:
  dependency_management:
    - "Keep Deno and TypeScript versions current"
    - "Monitor security advisories for build dependencies"
    - "Regular testing of cross-platform compilation"

  documentation:
    - "Maintain inline documentation for complex operations"
    - "Update README files when script behavior changes"
    - "Document environment requirements and setup steps"
```
