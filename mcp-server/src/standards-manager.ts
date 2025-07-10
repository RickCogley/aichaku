/**
 * Standards Manager - Loads and manages Aichaku standards
 */

import { join } from "@std/path";
import { exists } from "@std/fs";
import type { ProjectConfig } from "./types.ts";

export class StandardsManager {
  private standardsCache = new Map<string, ProjectConfig>();

  async getProjectStandards(projectPath: string): Promise<ProjectConfig> {
    // Check cache first
    if (this.standardsCache.has(projectPath)) {
      return this.standardsCache.get(projectPath)!;
    }

    // Look for .claude/.aichaku-standards.json
    const standardsPath = join(
      projectPath,
      ".claude",
      ".aichaku-standards.json",
    );

    if (await exists(standardsPath)) {
      try {
        const content = await Deno.readTextFile(standardsPath);
        const config = JSON.parse(content) as ProjectConfig;
        this.standardsCache.set(projectPath, config);
        return config;
      } catch (error) {
        console.error(
          `Failed to load standards from ${standardsPath}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    // Return default empty config
    const defaultConfig: ProjectConfig = {
      version: "1.0.0",
      selected: [],
    };

    return defaultConfig;
  }

  getStandardRules(standardId: string): string[] {
    // In a full implementation, this would load the actual standard rules
    // For now, return a list of rule IDs
    const standardRules: Record<string, string[]> = {
      "owasp-web": [
        "owasp-a01-access-control",
        "owasp-a02-crypto-failures",
        "owasp-a03-injection",
        "owasp-a04-insecure-design",
        "owasp-a05-security-misconfig",
        "owasp-a06-vulnerable-components",
        "owasp-a07-auth-failures",
        "owasp-a08-data-integrity",
        "owasp-a09-logging-failures",
        "owasp-a10-ssrf",
      ],
      "15-factor": [
        "15factor-codebase",
        "15factor-dependencies",
        "15factor-config",
        "15factor-backing-services",
        "15factor-build-release-run",
        "15factor-processes",
        "15factor-port-binding",
        "15factor-concurrency",
        "15factor-disposability",
        "15factor-dev-prod-parity",
        "15factor-logs",
        "15factor-admin-processes",
        "15factor-api-first",
        "15factor-telemetry",
        "15factor-auth",
      ],
      "tdd": [
        "tdd-test-first",
        "tdd-test-coverage",
        "tdd-red-green-refactor",
        "tdd-test-naming",
        "tdd-test-isolation",
      ],
      "nist-csf": [
        "nist-identify",
        "nist-protect",
        "nist-detect",
        "nist-respond",
        "nist-recover",
      ],
      "ddd": [
        "ddd-bounded-context",
        "ddd-entities",
        "ddd-value-objects",
        "ddd-aggregates",
        "ddd-domain-events",
        "ddd-ubiquitous-language",
      ],
      "solid": [
        "solid-single-responsibility",
        "solid-open-closed",
        "solid-liskov-substitution",
        "solid-interface-segregation",
        "solid-dependency-inversion",
      ],
    };

    return standardRules[standardId] || [];
  }

  isRuleEnabled(
    standardId: string,
    _ruleId: string,
    selectedStandards: string[],
  ): boolean {
    if (!selectedStandards.includes(standardId)) {
      return false;
    }

    // In a full implementation, this would check if the specific rule is enabled
    // For now, if the standard is selected, all its rules are enabled
    return true;
  }

  async loadStandardContent(standardId: string): Promise<string | null> {
    // Try to load from Aichaku's standards directory
    const homedir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
    const possiblePaths = [
      join(homedir, ".claude", "standards"),
      join(Deno.cwd(), ".claude", "standards"),
      join(Deno.cwd(), "node_modules", "@aichaku", "standards"),
    ];

    for (const basePath of possiblePaths) {
      // Standards are organized by category
      const categories = [
        "security",
        "architecture",
        "development",
        "testing",
        "devops",
      ];

      for (const category of categories) {
        const standardPath = join(basePath, category, `${standardId}.md`);
        if (await exists(standardPath)) {
          try {
            return await Deno.readTextFile(standardPath);
          } catch {
            // Continue searching
          }
        }
      }
    }

    return null;
  }

  getStandardInfo(
    standardId: string,
  ): { name: string; description: string } | null {
    const standardInfo: Record<string, { name: string; description: string }> =
      {
        "owasp-web": {
          name: "OWASP Top 10 Web",
          description: "Web application security risks",
        },
        "15-factor": {
          name: "15-Factor Apps",
          description: "Modern cloud-native principles",
        },
        "tdd": {
          name: "Test-Driven Development",
          description: "Red-green-refactor cycle",
        },
        "nist-csf": {
          name: "NIST Cybersecurity Framework",
          description: "Governance and risk management",
        },
        "ddd": {
          name: "Domain-Driven Design",
          description: "Strategic and tactical patterns",
        },
        "solid": {
          name: "SOLID Principles",
          description: "Object-oriented design principles",
        },
      };

    return standardInfo[standardId] || null;
  }
}
