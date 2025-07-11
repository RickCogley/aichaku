/**
 * Scanner Controller - Manages external security scanning tools
 */

import type { Finding, Scanner } from "./types.ts";

export class ScannerController {
  private scanners: Map<string, Scanner> = new Map();

  constructor() {
    // Ensure .NET tools are in PATH for DevSkim
    const currentPath = Deno.env.get("PATH") || "";
    const homeDir = Deno.env.get("HOME") || "";
    const dotnetToolsPath = `${homeDir}/.dotnet/tools`;
    if (homeDir && !currentPath.includes(dotnetToolsPath)) {
      Deno.env.set("PATH", `${currentPath}:${dotnetToolsPath}`);
    }

    this.initializeScanners();
  }

  private initializeScanners() {
    // Initialize scanner list with definitions
    this.scannerDefinitions = [
      {
        name: "codeql",
        command: "codeql",
        available: false,
        timeout: 30000,
        parse: this.parseCodeQLOutput.bind(this),
      },
      {
        name: "devskim",
        command: "devskim",
        available: false,
        timeout: 10000,
        parse: this.parseDevSkimOutput.bind(this),
      },
      {
        name: "semgrep",
        command: "semgrep",
        available: false,
        timeout: 20000,
        parse: this.parseSemgrepOutput.bind(this),
      },
    ];
  }

  private scannerDefinitions: Scanner[] = [];

  async initialize() {
    // Check which scanners are available
    for (const scanner of this.scannerDefinitions) {
      await this.checkScannerAvailability(scanner);
    }
  }

  private async checkScannerAvailability(scanner: Scanner) {
    try {
      const process = new Deno.Command(scanner.command, {
        args: ["--version"],
        stdout: "null",
        stderr: "null",
      });

      const { code } = await process.output();
      scanner.available = code === 0;

      if (scanner.available) {
        this.scanners.set(scanner.name, scanner);
        console.error(`✅ Scanner ${scanner.name} is available`);
      } else {
        console.error(
          `❌ Scanner ${scanner.name} returned non-zero exit code: ${code}`,
        );
      }
    } catch (error) {
      // Scanner not found
      console.error(
        `❌ Scanner ${scanner.name} is not installed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async runAvailableScanners(
    filePath: string,
    content: string,
  ): Promise<Finding[]> {
    const findings: Finding[] = [];
    const promises: Promise<Finding[]>[] = [];

    for (const [_name, scanner] of this.scanners) {
      if (scanner.available) {
        promises.push(this.runScanner(scanner, filePath, content));
      }
    }

    if (promises.length === 0) {
      console.error("ℹ️  No external scanners available");
      return findings;
    }

    // Run all scanners in parallel
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === "fulfilled") {
        findings.push(...result.value);
      } else {
        console.error(`Scanner error: ${result.reason}`);
      }
    }

    return findings;
  }

  private async runScanner(
    scanner: Scanner,
    filePath: string,
    _content: string,
  ): Promise<Finding[]> {
    try {
      // Create a temporary file for scanning
      // In a real implementation, we might pass content via stdin

      let args: string[] = [];

      switch (scanner.name) {
        case "devskim":
          args = ["analyze", "-I", filePath, "-f", "json", "-E"];
          break;
        case "semgrep":
          args = ["--json", "--no-git-ignore", filePath];
          break;
        case "codeql":
          // CodeQL requires a database, so skip for now
          console.error(
            "ℹ️  CodeQL requires a database to be built first, skipping",
          );
          return [];
      }

      const process = new Deno.Command(scanner.command, {
        args,
        stdout: "piped",
        stderr: "piped",
      });

      const { stdout, stderr, code } = await process.output();

      // DevSkim with -E flag returns the number of issues as exit code
      // Other scanners may return 1 when findings exist
      const isDevSkim = scanner.name === "devskim";
      const acceptableExitCodes = isDevSkim ? [0, 1, 2, 3, 4, 5] : [0, 1];

      if (!acceptableExitCodes.includes(code)) {
        const error = new TextDecoder().decode(stderr);
        throw new Error(`Scanner ${scanner.name} failed: ${error}`);
      }

      const output = new TextDecoder().decode(stdout);
      return scanner.parse(output, filePath);
    } catch (error) {
      console.error(
        `Error running ${scanner.name}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }
  }

  private parseDevSkimOutput(output: string, filePath: string): Finding[] {
    const findings: Finding[] = [];

    try {
      const results = JSON.parse(output);

      for (const result of results) {
        findings.push({
          severity: this.mapDevSkimSeverity(result.severity),
          rule: result.rule_id || result.rule,
          message: result.rule_name || result.message ||
            `DevSkim rule ${result.rule_id}`,
          file: filePath,
          line: result.start_line || result.line || 1,
          column: result.start_column || result.column,
          suggestion: result.fix_it || result.suggestion ||
            "Review the code for security issues",
          tool: "devskim",
          category: "security",
        });
      }
    } catch (error) {
      console.error(
        `Failed to parse DevSkim output: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return findings;
  }

  private parseSemgrepOutput(output: string, filePath: string): Finding[] {
    const findings: Finding[] = [];

    try {
      const results = JSON.parse(output);

      if (results.results) {
        for (const result of results.results) {
          findings.push({
            severity: this.mapSemgrepSeverity(result.extra.severity),
            rule: result.check_id,
            message: result.extra.message || result.message,
            file: filePath,
            line: result.start.line,
            column: result.start.col,
            suggestion: result.extra.fix,
            tool: "semgrep",
            category: "security",
          });
        }
      }
    } catch (error) {
      console.error(
        `Failed to parse Semgrep output: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return findings;
  }

  private parseCodeQLOutput(output: string, filePath: string): Finding[] {
    const findings: Finding[] = [];

    try {
      const results = JSON.parse(output);

      // CodeQL output format varies, this is simplified
      if (results.results) {
        for (const result of results.results) {
          findings.push({
            severity: this.mapCodeQLSeverity(result.severity),
            rule: result.ruleId,
            message: result.message,
            file: filePath,
            line: result.locations?.[0]?.physicalLocation?.region?.startLine ||
              1,
            column: result.locations?.[0]?.physicalLocation?.region
              ?.startColumn,
            tool: "codeql",
            category: "security",
          });
        }
      }
    } catch (error) {
      console.error(
        `Failed to parse CodeQL output: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return findings;
  }

  private mapDevSkimSeverity(severity: string): Finding["severity"] {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "important":
        return "critical";
      case "moderate":
        return "high";
      case "low":
        return "medium";
      case "informational":
        return "info";
      default:
        return "medium";
    }
  }

  private mapSemgrepSeverity(severity: string): Finding["severity"] {
    switch (severity?.toUpperCase()) {
      case "ERROR":
        return "critical";
      case "WARNING":
        return "high";
      case "INFO":
        return "medium";
      default:
        return "medium";
    }
  }

  private mapCodeQLSeverity(severity: string): Finding["severity"] {
    switch (severity?.toLowerCase()) {
      case "error":
        return "critical";
      case "warning":
        return "high";
      case "recommendation":
        return "medium";
      case "note":
        return "low";
      default:
        return "medium";
    }
  }

  getAvailableScanners(): string[] {
    return Array.from(this.scanners.keys());
  }
}
