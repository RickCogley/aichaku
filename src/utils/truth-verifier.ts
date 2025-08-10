/**
 * Truth Verifier - Core implementation of the Agent Truth Protocol
 *
 * Verifies file and directory operations claimed by AI agents to ensure
 * truthfulness and reliability in automated development workflows.
 *
 * @module TruthVerifier
 * @version 1.0.0
 */

/**
 * Represents the result of a single verification operation
 */
export interface VerificationResult {
  /** Whether the verification passed */
  success: boolean;
  /** The operation that was verified */
  operation: "create" | "edit" | "delete";
  /** The file or directory path that was verified */
  path: string;
  /** Human-readable message describing the result */
  message: string;
  /** Timestamp when verification was performed */
  timestamp: Date;
  /** Additional context or error details */
  details?: string;
}

/**
 * Represents a claim made by an agent about a file operation
 */
export interface Claim {
  /** Type of operation claimed */
  operation: "create" | "edit" | "delete";
  /** Path to the file or directory */
  path: string;
  /** Expected content for file operations (optional for delete) */
  expectedContent?: string;
  /** Whether this is a file or directory operation */
  type: "file" | "directory";
}

/**
 * Detailed information about a verification failure
 */
export interface VerificationFailure {
  /** The claim that failed */
  claim: Claim;
  /** Specific reason for failure */
  reason: string;
  /** Underlying error if applicable */
  error?: Error;
  /** Suggested remediation if available */
  suggestion?: string;
}

/**
 * Complete report of verification results for multiple claims
 */
export interface VerificationReport {
  /** Total number of claims verified */
  totalClaims: number;
  /** Number of successful verifications */
  successCount: number;
  /** Number of failed verifications */
  failureCount: number;
  /** Detailed results for each verification */
  results: VerificationResult[];
  /** Detailed failure information */
  failures: VerificationFailure[];
  /** Overall success rate as percentage */
  successRate: number;
  /** Time taken for entire verification process */
  duration: number;
}

/**
 * Core class for verifying agent claims about file system operations
 *
 * The TruthVerifier implements the Agent Truth Protocol by:
 * - Verifying claimed file and directory operations
 * - Extracting claims from agent responses
 * - Providing detailed verification reports
 * - Maintaining audit trails for accountability
 */
export class TruthVerifier {
  private readonly auditLog: VerificationResult[] = [];

  /**
   * Verifies a single file operation claim
   *
   * @param operation - Type of operation to verify
   * @param path - Absolute path to the file
   * @param expectedContent - Expected content for create/edit operations
   * @returns Promise resolving to verification result
   *
   * @example
   * ```typescript
   * const verifier = new TruthVerifier();
   * const result = await verifier.verifyFileOperation('create', '/path/to/file.ts', 'export const foo = "bar";');
   * console.log(result.success); // true if file exists with expected content
   * ```
   */
  async verifyFileOperation(
    operation: "create" | "edit" | "delete",
    path: string,
    expectedContent?: string,
  ): Promise<VerificationResult> {
    const timestamp = new Date();

    try {
      // Validate inputs
      if (!path || typeof path !== "string") {
        throw new Error("Invalid path provided");
      }

      // Ensure path is absolute for consistency
      const absolutePath = path.startsWith("/") ? path : Deno.cwd() + "/" + path;

      let fileExists = false;
      let actualContent = "";

      try {
        const stat = await Deno.stat(absolutePath);
        fileExists = stat.isFile;

        if (fileExists && (operation === "create" || operation === "edit")) {
          actualContent = await Deno.readTextFile(absolutePath);
        }
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
        // File doesn't exist - this is expected for delete operations
      }

      const result = this.evaluateFileOperation(
        operation,
        absolutePath,
        fileExists,
        actualContent,
        expectedContent,
        timestamp,
      );

      // Add to audit log
      this.auditLog.push(result);

      return result;
    } catch (error) {
      const failureResult: VerificationResult = {
        success: false,
        operation,
        path,
        message: `Verification failed due to error: ${(error as Error).message}`,
        timestamp,
        details: error instanceof Error ? error.stack : String(error),
      };

      this.auditLog.push(failureResult);
      return failureResult;
    }
  }

  /**
   * Verifies a single directory operation claim
   *
   * @param operation - Type of operation to verify (create or delete)
   * @param path - Absolute path to the directory
   * @returns Promise resolving to verification result
   *
   * @example
   * ```typescript
   * const verifier = new TruthVerifier();
   * const result = await verifier.verifyDirectoryOperation('create', '/path/to/directory');
   * console.log(result.success); // true if directory exists
   * ```
   */
  async verifyDirectoryOperation(
    operation: "create" | "delete",
    path: string,
  ): Promise<VerificationResult> {
    const timestamp = new Date();

    try {
      // Validate inputs
      if (!path || typeof path !== "string") {
        throw new Error("Invalid path provided");
      }

      // Ensure path is absolute for consistency
      const absolutePath = path.startsWith("/") ? path : Deno.cwd() + "/" + path;

      let directoryExists = false;

      try {
        const stat = await Deno.stat(absolutePath);
        directoryExists = stat.isDirectory;
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
        // Directory doesn't exist
      }

      const result = this.evaluateDirectoryOperation(
        operation,
        absolutePath,
        directoryExists,
        timestamp,
      );

      // Add to audit log
      this.auditLog.push(result);

      return result;
    } catch (error) {
      const failureResult: VerificationResult = {
        success: false,
        operation,
        path,
        message: `Directory verification failed due to error: ${(error as Error).message}`,
        timestamp,
        details: error instanceof Error ? error.stack : String(error),
      };

      this.auditLog.push(failureResult);
      return failureResult;
    }
  }

  /**
   * Extracts file and directory operation claims from agent response text
   *
   * Parses natural language and structured text to identify claimed operations.
   * Supports various formats including:
   * - "Created file: /path/to/file.ts"
   * - "I'll create the file src/utils/helper.ts"
   * - File operation descriptions in structured text
   *
   * @param text - Agent response text to parse
   * @returns Array of extracted claims
   *
   * @example
   * ```typescript
   * const text = "I created the file src/utils/helper.ts with the following content...";
   * const claims = verifier.extractClaims(text);
   * console.log(claims[0].operation); // 'create'
   * console.log(claims[0].path); // 'src/utils/helper.ts'
   * ```
   */
  extractClaims(text: string): Claim[] {
    const claims: Claim[] = [];

    // Pattern for explicit file operations
    const fileOperationPatterns = [
      // "Created file: path" or "Create file: path"
      /(?:created?|made|generated)\s+(?:file|the file)\s*:?\s*([^\s\n]+)/gi,
      // "I'll create the file path"
      /(?:i'll|i will|will)\s+create\s+(?:the\s+)?file\s+([^\s\n]+)/gi,
      // "Creating file path" - must explicitly mention "file"
      /creating\s+file\s+([^\s\n]+)/gi,
      // "Modified file: path" or "Edited file: path"
      /(?:modified|edited|updated)\s+(?:file|the file)\s*:?\s*([^\s\n]+)/gi,
      // "Deleted file: path"
      /deleted\s+(?:file|the file)\s*:?\s*([^\s\n]+)/gi,
    ];

    // Pattern for directory operations
    const directoryOperationPatterns = [
      // "Created directory: path"
      /(?:created?|made)\s+(?:directory|folder)\s*:?\s*([^\s\n]+)/gi,
      // "Creating directory path"
      /creating\s+(?:directory|folder)\s+([^\s\n]+)/gi,
      // "I made a folder path"
      /(?:i\s+)?made\s+a\s+(?:directory|folder)\s+([^\s\n]+)/gi,
      // "Deleted directory: path"
      /deleted\s+(?:directory|folder)\s*:?\s*([^\s\n]+)/gi,
    ];

    // Extract file operations
    for (const pattern of fileOperationPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const path = match[1].trim();
        let operation: "create" | "edit" | "delete";

        if (match[0].toLowerCase().includes("delet")) {
          operation = "delete";
        } else if (
          match[0].toLowerCase().includes("modif") ||
          match[0].toLowerCase().includes("edit") ||
          match[0].toLowerCase().includes("updat")
        ) {
          operation = "edit";
        } else {
          operation = "create";
        }

        claims.push({
          operation,
          path: this.normalizePath(path),
          type: "file",
        });
      }
    }

    // Extract directory operations
    for (const pattern of directoryOperationPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const path = match[1].trim();
        const operation = match[0].toLowerCase().includes("delet") ? "delete" : "create";

        claims.push({
          operation,
          path: this.normalizePath(path),
          type: "directory",
        });
      }
    }

    // Remove duplicates
    return this.deduplicateClaims(claims);
  }

  /**
   * Verifies multiple claims and generates a comprehensive report
   *
   * @param claims - Array of claims to verify
   * @returns Promise resolving to detailed verification report
   *
   * @example
   * ```typescript
   * const claims = verifier.extractClaims(agentResponse);
   * const report = await verifier.verifyClaims(claims);
   * console.log(`Success rate: ${report.successRate}%`);
   * ```
   */
  async verifyClaims(claims: Claim[]): Promise<VerificationReport> {
    const startTime = Date.now();
    const results: VerificationResult[] = [];
    const failures: VerificationFailure[] = [];

    for (const claim of claims) {
      let result: VerificationResult;

      try {
        if (claim.type === "file") {
          result = await this.verifyFileOperation(
            claim.operation,
            claim.path,
            claim.expectedContent,
          );
        } else {
          result = await this.verifyDirectoryOperation(
            claim.operation as "create" | "delete",
            claim.path,
          );
        }

        results.push(result);

        if (!result.success) {
          failures.push({
            claim,
            reason: result.message,
            suggestion: this.generateSuggestion(claim, result),
          });
        }
      } catch (error) {
        const failureResult: VerificationResult = {
          success: false,
          operation: claim.operation,
          path: claim.path,
          message: `Verification error: ${(error as Error).message}`,
          timestamp: new Date(),
        };

        results.push(failureResult);
        failures.push({
          claim,
          reason: (error as Error).message,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const duration = Date.now() - startTime;

    return {
      totalClaims: claims.length,
      successCount,
      failureCount: results.length - successCount,
      results,
      failures,
      successRate: claims.length > 0 ? Math.round((successCount / claims.length) * 100) : 100,
      duration,
    };
  }

  /**
   * Retrieves the complete audit log of all verifications
   *
   * @returns Array of all verification results
   */
  getAuditLog(): readonly VerificationResult[] {
    return [...this.auditLog];
  }

  /**
   * Clears the audit log
   */
  clearAuditLog(): void {
    this.auditLog.length = 0;
  }

  // Private helper methods

  private evaluateFileOperation(
    operation: "create" | "edit" | "delete",
    path: string,
    fileExists: boolean,
    actualContent: string,
    expectedContent: string | undefined,
    timestamp: Date,
  ): VerificationResult {
    switch (operation) {
      case "create":
        if (!fileExists) {
          return {
            success: false,
            operation,
            path,
            message: `File was not created: ${path}`,
            timestamp,
          };
        }

        if (actualContent.trim() === "") {
          return {
            success: false,
            operation,
            path,
            message: `File was created but is empty: ${path}`,
            timestamp,
            details: "Empty files may indicate incomplete operations",
          };
        }

        if (expectedContent && !actualContent.includes(expectedContent.trim())) {
          return {
            success: false,
            operation,
            path,
            message: `File content does not match expected content: ${path}`,
            timestamp,
            details: `Expected content not found in file`,
          };
        }

        return {
          success: true,
          operation,
          path,
          message: `File successfully created: ${path}`,
          timestamp,
        };

      case "edit":
        if (!fileExists) {
          return {
            success: false,
            operation,
            path,
            message: `File to edit does not exist: ${path}`,
            timestamp,
          };
        }

        if (expectedContent && !actualContent.includes(expectedContent.trim())) {
          return {
            success: false,
            operation,
            path,
            message: `File was not properly edited: ${path}`,
            timestamp,
            details: "Expected changes not found in file content",
          };
        }

        return {
          success: true,
          operation,
          path,
          message: `File successfully edited: ${path}`,
          timestamp,
        };

      case "delete":
        if (fileExists) {
          return {
            success: false,
            operation,
            path,
            message: `File still exists after claimed deletion: ${path}`,
            timestamp,
          };
        }

        return {
          success: true,
          operation,
          path,
          message: `File successfully deleted: ${path}`,
          timestamp,
        };

      default:
        return {
          success: false,
          operation,
          path,
          message: `Unknown operation: ${operation}`,
          timestamp,
        };
    }
  }

  private evaluateDirectoryOperation(
    operation: "create" | "delete",
    path: string,
    directoryExists: boolean,
    timestamp: Date,
  ): VerificationResult {
    switch (operation) {
      case "create":
        if (!directoryExists) {
          return {
            success: false,
            operation,
            path,
            message: `Directory was not created: ${path}`,
            timestamp,
          };
        }

        return {
          success: true,
          operation,
          path,
          message: `Directory successfully created: ${path}`,
          timestamp,
        };

      case "delete":
        if (directoryExists) {
          return {
            success: false,
            operation,
            path,
            message: `Directory still exists after claimed deletion: ${path}`,
            timestamp,
          };
        }

        return {
          success: true,
          operation,
          path,
          message: `Directory successfully deleted: ${path}`,
          timestamp,
        };

      default:
        return {
          success: false,
          operation,
          path,
          message: `Unknown directory operation: ${operation}`,
          timestamp,
        };
    }
  }

  private normalizePath(path: string): string {
    // Remove quotes and clean up the path
    const cleaned = path.replace(/['"]/g, "").trim();

    // Handle relative paths by making them relative to current working directory
    if (!cleaned.startsWith("/")) {
      return cleaned;
    }

    return cleaned;
  }

  private deduplicateClaims(claims: Claim[]): Claim[] {
    const seen = new Set<string>();
    return claims.filter((claim) => {
      const key = `${claim.operation}:${claim.type}:${claim.path}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private generateSuggestion(claim: Claim, result: VerificationResult): string {
    if (claim.operation === "create" && !result.success) {
      return `Ensure the file/directory creation was completed successfully at path: ${claim.path}`;
    }

    if (claim.operation === "delete" && !result.success) {
      return `Verify that the file/directory was actually removed from path: ${claim.path}`;
    }

    if (claim.operation === "edit" && !result.success) {
      return `Check that the file modifications were saved properly at path: ${claim.path}`;
    }

    return "Review the operation and ensure it was completed as claimed.";
  }
}
