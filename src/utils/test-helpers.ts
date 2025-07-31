/**
 * Test utilities for command testing
 * Provides output capture and assertion helpers
 */

import { join } from "jsr:@std/path@1";

/**
 * Output capture utility for testing CLI commands
 */
export class OutputCapture {
  private originalWrite: typeof Deno.stdout.write;
  private originalError: typeof Deno.stderr.write;
  private stdoutBuffer: Uint8Array[] = [];
  private stderrBuffer: Uint8Array[] = [];

  constructor() {
    this.originalWrite = Deno.stdout.write.bind(Deno.stdout);
    this.originalError = Deno.stderr.write.bind(Deno.stderr);
  }

  /**
   * Start capturing output
   */
  start(): void {
    this.stdoutBuffer = [];
    this.stderrBuffer = [];

    // Mock stdout.write
    Deno.stdout.write = (p: Uint8Array): Promise<number> => {
      this.stdoutBuffer.push(p);
      return Promise.resolve(p.length);
    };

    // Mock stderr.write
    Deno.stderr.write = (p: Uint8Array): Promise<number> => {
      this.stderrBuffer.push(p);
      return Promise.resolve(p.length);
    };
  }

  /**
   * Stop capturing and restore original output
   */
  stop(): void {
    Deno.stdout.write = this.originalWrite;
    Deno.stderr.write = this.originalError;
  }

  /**
   * Get captured stdout as string
   */
  getStdout(): string {
    const combined = new Uint8Array(
      this.stdoutBuffer.reduce((sum, arr) => sum + arr.length, 0),
    );
    let offset = 0;
    for (const arr of this.stdoutBuffer) {
      combined.set(arr, offset);
      offset += arr.length;
    }
    return new TextDecoder().decode(combined);
  }

  /**
   * Get captured stderr as string
   */
  getStderr(): string {
    const combined = new Uint8Array(
      this.stderrBuffer.reduce((sum, arr) => sum + arr.length, 0),
    );
    let offset = 0;
    for (const arr of this.stderrBuffer) {
      combined.set(arr, offset);
      offset += arr.length;
    }
    return new TextDecoder().decode(combined);
  }

  /**
   * Get all captured output as string
   */
  getAll(): string {
    return this.getStdout() + this.getStderr();
  }

  /**
   * Clear captured buffers
   */
  clear(): void {
    this.stdoutBuffer = [];
    this.stderrBuffer = [];
  }
}

/**
 * Console capture utility for testing console.log output
 */
export class ConsoleCapture {
  private originalLog: typeof console.log;
  private originalError: typeof console.error;
  private originalWarn: typeof console.warn;
  private outputs: { type: "log" | "error" | "warn"; message: string }[] = [];

  constructor() {
    this.originalLog = console.log;
    this.originalError = console.error;
    this.originalWarn = console.warn;
  }

  /**
   * Start capturing console output
   */
  start(): void {
    this.outputs = [];

    console.log = (...args: any[]) => {
      this.outputs.push({
        type: "log",
        message: args.map((arg) => typeof arg === "string" ? arg : JSON.stringify(arg)).join(" "),
      });
    };

    console.error = (...args: any[]) => {
      this.outputs.push({
        type: "error",
        message: args.map((arg) => typeof arg === "string" ? arg : JSON.stringify(arg)).join(" "),
      });
    };

    console.warn = (...args: any[]) => {
      this.outputs.push({
        type: "warn",
        message: args.map((arg) => typeof arg === "string" ? arg : JSON.stringify(arg)).join(" "),
      });
    };
  }

  /**
   * Stop capturing and restore original console
   */
  stop(): void {
    console.log = this.originalLog;
    console.error = this.originalError;
    console.warn = this.originalWarn;
  }

  /**
   * Get all captured outputs
   */
  getOutputs(): { type: "log" | "error" | "warn"; message: string }[] {
    return [...this.outputs];
  }

  /**
   * Get captured outputs of specific type
   */
  getOutputsByType(type: "log" | "error" | "warn"): string[] {
    return this.outputs.filter((output) => output.type === type).map((output) => output.message);
  }

  /**
   * Get all captured output as a single string
   */
  getAllOutput(): string {
    return this.outputs.map((output) => output.message).join("\n");
  }

  /**
   * Clear captured outputs
   */
  clear(): void {
    this.outputs = [];
  }
}

/**
 * Create a temporary directory for testing
 */
export async function createTempDir(): Promise<string> {
  return await Deno.makeTempDir({ prefix: "aichaku-test-" });
}

/**
 * Cleanup temporary directory
 */
export async function cleanup(tempDir: string): Promise<void> {
  try {
    await Deno.remove(tempDir, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Create a test project with Aichaku configuration
 */
export async function createTestProject(tempDir: string, options?: {
  methodology?: string;
  standards?: string[];
  principles?: string[];
}): Promise<void> {
  const aichakuDir = join(tempDir, ".claude", "aichaku");
  await Deno.mkdir(aichakuDir, { recursive: true });

  const config = {
    version: "2.0.0",
    project: {
      created: new Date().toISOString(),
      installedVersion: "0.39.4",
      methodology: options?.methodology || "shape-up",
      type: "project",
      installationType: "local",
    },
    standards: {
      development: options?.standards || ["tdd"],
      documentation: [],
      custom: {},
    },
    principles: {
      selected: options?.principles || ["dry"],
    },
    config: {
      customizations: {},
      globalVersion: "0.39.4",
    },
    markers: {
      isAichakuProject: true,
    },
  };

  await Deno.writeTextFile(
    join(aichakuDir, "aichaku.json"),
    JSON.stringify(config, null, 2),
  );
}

/**
 * Mock the global Aichaku installation for testing
 */
export async function createGlobalInstallation(homeDir: string): Promise<void> {
  const globalDir = join(homeDir, ".claude", "aichaku");
  await Deno.mkdir(globalDir, { recursive: true });

  // Create global standards
  await Deno.mkdir(join(globalDir, "docs", "standards", "development"), { recursive: true });

  // Create mock standards files
  await Deno.writeTextFile(
    join(globalDir, "docs", "standards", "development", "tdd.yaml"),
    `name: Test-Driven Development
id: tdd
category: development
summary:
  critical: |
    - Write failing tests FIRST before any implementation
    - Follow Red-Green-Refactor cycle strictly
    - Test behavior, not implementation details
  test_structure: AAA (Arrange-Act-Assert) pattern
`,
  );

  // Create mock principles
  await Deno.mkdir(join(globalDir, "docs", "principles", "software-development"), { recursive: true });

  await Deno.writeTextFile(
    join(globalDir, "docs", "principles", "software-development", "dry.yaml"),
    `name: DRY (Don't Repeat Yourself)
id: dry
category: software-development
description: "Don't repeat yourself - avoid code duplication"
history:
  origin: "Test history"
  significance: "Test significance"
summary:
  tagline: "Every piece of knowledge should have a single, authoritative representation"
  core_tenets:
    - text: "Avoid code duplication"
      guidance: "Extract common functionality into reusable components"
guidance:
  spirit: "Test guidance spirit"
  questions_to_ask:
    - "Test question"
`,
  );

  // Create mock methodologies
  await Deno.mkdir(join(globalDir, "methodologies"), { recursive: true });

  await Deno.writeTextFile(
    join(globalDir, "methodologies", "shape-up.yml"),
    `name: Shape Up
id: shape-up
summary:
  key_concepts:
    - "Fixed time, variable scope"
    - "6-week cycles with 2-week cooldown"
  cycle_length: "6 weeks"
  best_for: "Complex features"
`,
  );
}

/**
 * Assertion helpers for command testing
 */
export class CommandAssertions {
  /**
   * Assert that output contains expected text
   */
  static assertOutputContains(output: string, expected: string, message?: string): void {
    if (!output.includes(expected)) {
      throw new Error(message || `Expected output to contain "${expected}", but got: ${output}`);
    }
  }

  /**
   * Assert that output does NOT contain expected text (negative assertion)
   */
  static assertOutputNotContains(output: string, unexpected: string, message?: string): void {
    if (output.includes(unexpected)) {
      throw new Error(message || `Expected output to NOT contain "${unexpected}", but it was found in: ${output}`);
    }
  }

  /**
   * Assert that output matches a regex pattern
   */
  static assertOutputMatches(output: string, pattern: RegExp, message?: string): void {
    if (!pattern.test(output)) {
      throw new Error(message || `Expected output to match pattern ${pattern}, but got: ${output}`);
    }
  }

  /**
   * Assert that output contains all expected strings
   */
  static assertOutputContainsAll(output: string, expected: string[], message?: string): void {
    const missing = expected.filter((exp) => !output.includes(exp));
    if (missing.length > 0) {
      throw new Error(message || `Expected output to contain all of [${missing.join(", ")}], but got: ${output}`);
    }
  }

  /**
   * Assert that output is empty or only whitespace
   */
  static assertOutputEmpty(output: string, message?: string): void {
    if (output.trim() !== "") {
      throw new Error(message || `Expected empty output, but got: ${output}`);
    }
  }

  /**
   * Assert that command succeeded (no error output)
   */
  static assertCommandSuccess(capture: ConsoleCapture, message?: string): void {
    const errors = capture.getOutputsByType("error");
    if (errors.length > 0) {
      throw new Error(message || `Expected command to succeed, but got errors: ${errors.join(", ")}`);
    }
  }

  /**
   * Assert that command failed with specific error
   */
  static assertCommandError(capture: ConsoleCapture, expectedError: string, message?: string): void {
    const errors = capture.getOutputsByType("error");
    const hasExpectedError = errors.some((error) => error.includes(expectedError));
    if (!hasExpectedError) {
      throw new Error(message || `Expected error containing "${expectedError}", but got: ${errors.join(", ")}`);
    }
  }
}
