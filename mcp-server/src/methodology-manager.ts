/**
 * Methodology Manager - Handles methodology compliance checks
 */

import { join } from "@std/path";
import { exists } from "@std/fs";
import type { Finding } from "./types.ts";

export class MethodologyManager {
  private methodologyCache = new Map<string, string[]>();

  async getProjectMethodologies(projectPath: string): Promise<string[]> {
    // Check cache first
    if (this.methodologyCache.has(projectPath)) {
      return this.methodologyCache.get(projectPath)!;
    }

    // Look for .claude/aichaku/aichaku-standards.json (new path) or .claude/.aichaku-standards.json (legacy)
    const newConfigPath = join(
      projectPath,
      ".claude",
      "aichaku",
      "aichaku-standards.json",
    );
    const legacyConfigPath = join(
      projectPath,
      ".claude",
      ".aichaku-standards.json",
    );

    // Check new path first, then legacy
    const configPath = (await exists(newConfigPath))
      ? newConfigPath
      : legacyConfigPath;

    if (await exists(configPath)) {
      try {
        const content = await Deno.readTextFile(configPath);
        const config = JSON.parse(content);
        const methodologies = config.methodologies || [];
        this.methodologyCache.set(projectPath, methodologies);
        return methodologies;
      } catch (error) {
        console.error(
          `Failed to load methodologies from ${configPath}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    // Try to detect from project structure
    const detected = await this.detectMethodology(projectPath);
    return detected;
  }

  private async detectMethodology(projectPath: string): Promise<string[]> {
    const methodologies: string[] = [];

    // Check for Shape Up indicators
    if (
      await exists(join(projectPath, "pitch.md")) ||
      await exists(
        join(
          projectPath,
          ".claude",
          "aichaku",
          "output",
          "active-*",
          "pitch.md",
        ),
      ) ||
      await exists(
        join(projectPath, ".claude", "output", "active-*", "pitch.md"),
      )
    ) {
      methodologies.push("shape-up");
    }

    // Check for Scrum indicators
    if (
      await exists(join(projectPath, "sprint-planning.md")) ||
      await exists(
        join(
          projectPath,
          ".claude",
          "aichaku",
          "output",
          "active-*",
          "sprint-*.md",
        ),
      ) ||
      await exists(
        join(projectPath, ".claude", "output", "active-*", "sprint-*.md"),
      )
    ) {
      methodologies.push("scrum");
    }

    // Check for Kanban indicators
    if (
      await exists(join(projectPath, "kanban-board.md")) ||
      await exists(join(projectPath, ".claude", "aichaku", "kanban.json")) ||
      await exists(join(projectPath, ".claude", "kanban.json"))
    ) {
      methodologies.push("kanban");
    }

    return methodologies;
  }

  async checkCompliance(
    projectPath: string,
    methodologies: string[],
  ): Promise<Finding[]> {
    const findings: Finding[] = [];

    for (const methodology of methodologies) {
      switch (methodology) {
        case "shape-up":
          findings.push(...await this.checkShapeUpCompliance(projectPath));
          break;
        case "scrum":
          findings.push(...await this.checkScrumCompliance(projectPath));
          break;
        case "kanban":
          findings.push(...await this.checkKanbanCompliance(projectPath));
          break;
        case "lean":
          findings.push(...await this.checkLeanCompliance(projectPath));
          break;
        case "xp":
          findings.push(...await this.checkXPCompliance(projectPath));
          break;
      }
    }

    return findings;
  }

  private async checkShapeUpCompliance(
    projectPath: string,
  ): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Check for pitch document
    const pitchExists = await exists(join(projectPath, "pitch.md")) ||
      await exists(
        join(
          projectPath,
          ".claude",
          "aichaku",
          "output",
          "active-*",
          "pitch.md",
        ),
      ) ||
      await exists(
        join(projectPath, ".claude", "output", "active-*", "pitch.md"),
      );

    if (!pitchExists) {
      findings.push({
        severity: "medium",
        rule: "shape-up-pitch",
        message: "Shape Up: No pitch document found",
        file: projectPath,
        line: 1,
        suggestion: "Create a pitch.md with problem, appetite, and solution",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    // Check for fixed time boundaries
    const hasActiveProjects = await this.checkActiveProjects(projectPath);
    if (hasActiveProjects) {
      // Check if projects have clear appetite markers
      findings.push(...this.checkAppetiteMarkers(projectPath));
    }

    // Check for cool-down documentation
    const hasCooldown = await exists(
      join(
        projectPath,
        ".claude",
        "aichaku",
        "output",
        "done-*",
        "*CHANGE-LOG.md",
      ),
    ) || await exists(
      join(projectPath, ".claude", "output", "done-*", "*CHANGE-LOG.md"),
    );
    if (!hasCooldown && hasActiveProjects) {
      findings.push({
        severity: "low",
        rule: "shape-up-cooldown",
        message: "Shape Up: Consider documenting cool-down activities",
        file: projectPath,
        line: 1,
        suggestion: "Create change logs for completed cycles",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    return findings;
  }

  private async checkScrumCompliance(projectPath: string): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Check for sprint planning
    const sprintPlanExists =
      await exists(join(projectPath, "sprint-planning.md")) ||
      await exists(
        join(
          projectPath,
          ".claude",
          "aichaku",
          "output",
          "active-*",
          "sprint-*.md",
        ),
      ) ||
      await exists(
        join(projectPath, ".claude", "output", "active-*", "sprint-*.md"),
      );

    if (!sprintPlanExists) {
      findings.push({
        severity: "medium",
        rule: "scrum-sprint-planning",
        message: "Scrum: No sprint planning document found",
        file: projectPath,
        line: 1,
        suggestion: "Create sprint-planning.md with goals and backlog items",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    // Check for retrospective documentation
    const retroExists = await exists(join(projectPath, "retrospective.md")) ||
      await exists(
        join(
          projectPath,
          ".claude",
          "aichaku",
          "output",
          "done-*",
          "retrospective.md",
        ),
      ) ||
      await exists(
        join(projectPath, ".claude", "output", "done-*", "retrospective.md"),
      );

    if (!retroExists) {
      findings.push({
        severity: "low",
        rule: "scrum-retrospective",
        message: "Scrum: No retrospective documentation found",
        file: projectPath,
        line: 1,
        suggestion: "Document sprint retrospectives for continuous improvement",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    return findings;
  }

  private async checkKanbanCompliance(projectPath: string): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Check for board visualization
    const boardExists = await exists(join(projectPath, "kanban-board.md")) ||
      await exists(join(projectPath, ".claude", "kanban.json"));

    if (!boardExists) {
      findings.push({
        severity: "medium",
        rule: "kanban-board",
        message: "Kanban: No board visualization found",
        file: projectPath,
        line: 1,
        suggestion: "Create kanban-board.md to visualize work flow",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    // Check for WIP limits documentation
    const hasWIPLimits = this.checkForWIPLimits(projectPath);
    if (!hasWIPLimits && boardExists) {
      findings.push({
        severity: "low",
        rule: "kanban-wip-limits",
        message: "Kanban: No WIP limits defined",
        file: projectPath,
        line: 1,
        suggestion: "Define work-in-progress limits for each column",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    return findings;
  }

  private async checkLeanCompliance(projectPath: string): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Check for MVP documentation
    const mvpExists = await exists(join(projectPath, "mvp.md")) ||
      await exists(
        join(
          projectPath,
          ".claude",
          "aichaku",
          "output",
          "active-*",
          "experiment-*.md",
        ),
      ) ||
      await exists(
        join(projectPath, ".claude", "output", "active-*", "experiment-*.md"),
      );

    if (!mvpExists) {
      findings.push({
        severity: "low",
        rule: "lean-mvp",
        message: "Lean: No MVP or experiment documentation found",
        file: projectPath,
        line: 1,
        suggestion: "Document your minimum viable product or experiments",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    // Check for metrics/validation
    const hasMetrics = this.checkForMetrics(projectPath);
    if (!hasMetrics) {
      findings.push({
        severity: "low",
        rule: "lean-metrics",
        message: "Lean: No validation metrics defined",
        file: projectPath,
        line: 1,
        suggestion: "Define success metrics for your experiments",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    return findings;
  }

  private async checkXPCompliance(projectPath: string): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Check for test coverage
    const hasTests = await exists(join(projectPath, "tests")) ||
      await exists(join(projectPath, "test")) ||
      await exists(join(projectPath, "__tests__"));

    if (!hasTests) {
      findings.push({
        severity: "high",
        rule: "xp-test-coverage",
        message: "XP: No test directory found",
        file: projectPath,
        line: 1,
        suggestion: "Create a test directory and write tests first (TDD)",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    // Check for pair programming logs
    const pairLogs = await exists(
      join(projectPath, ".claude", "aichaku", "pair-programming.md"),
    ) || await exists(
      join(projectPath, ".claude", "pair-programming.md"),
    );
    if (!pairLogs) {
      findings.push({
        severity: "info",
        rule: "xp-pair-programming",
        message: "XP: Consider documenting pair programming sessions",
        file: projectPath,
        line: 1,
        suggestion: "Track pair programming for knowledge sharing",
        tool: "aichaku-methodology",
        category: "methodology",
      });
    }

    return findings;
  }

  private async checkActiveProjects(projectPath: string): Promise<boolean> {
    try {
      // Check new path first
      const newOutputPath = join(projectPath, ".claude", "aichaku", "output");
      if (await exists(newOutputPath)) {
        for await (const entry of Deno.readDir(newOutputPath)) {
          if (entry.isDirectory && entry.name.startsWith("active-")) {
            return true;
          }
        }
      }

      // Check legacy path
      const legacyOutputPath = join(projectPath, ".claude", "output");
      if (await exists(legacyOutputPath)) {
        for await (const entry of Deno.readDir(legacyOutputPath)) {
          if (entry.isDirectory && entry.name.startsWith("active-")) {
            return true;
          }
        }
      }
    } catch {
      // Ignore errors
    }
    return false;
  }

  private checkAppetiteMarkers(_projectPath: string): Finding[] {
    const findings: Finding[] = [];
    // Simplified check - in reality would parse pitch documents
    // for appetite declarations
    return findings;
  }

  private checkForWIPLimits(_projectPath: string): boolean {
    // Simplified check - would parse kanban board for WIP limits
    return false;
  }

  private checkForMetrics(_projectPath: string): boolean {
    // Simplified check - would look for metrics documentation
    return false;
  }
}
