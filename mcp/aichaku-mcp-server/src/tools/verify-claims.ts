/**
 * Truth Protocol Verification Tool
 *
 * Verifies claims made by AI agents about file operations and state changes
 */

import { existsSync } from "@std/fs/exists";
import { resolve } from "@std/path/resolve";

export interface VerifyClaim {
  type: "file_created" | "file_modified" | "file_deleted" | "command_executed";
  path?: string;
  expectedContent?: string;
  expectedSize?: number;
  expectedChecksum?: string;
  command?: string;
  expectedOutput?: string;
}

export interface VerificationResult {
  claim: VerifyClaim;
  verified: boolean;
  evidence: {
    exists?: boolean;
    size?: number;
    checksum?: string;
    modifiedTime?: Date;
    output?: string;
  };
  message: string;
}

export interface VerifyClaimsArgs {
  /** Claims to verify */
  claims: VerifyClaim[];
  /** Project root path for relative paths */
  projectPath?: string;
  /** Include detailed evidence in response */
  detailed?: boolean;
}

export interface VerifyClaimsResult {
  verified: number;
  failed: number;
  results: VerificationResult[];
  trustScore: number; // 0-100
  summary: string;
}

/**
 * Verify agent claims about file operations
 */
async function verifyClaimsFunction(args: VerifyClaimsArgs): Promise<VerifyClaimsResult> {
  const results: VerificationResult[] = [];
  let verified = 0;
  let failed = 0;

  for (const claim of args.claims) {
    const result = await verifySingleClaim(claim, args.projectPath);
    results.push(result);

    if (result.verified) {
      verified++;
    } else {
      failed++;
    }
  }

  const trustScore = args.claims.length > 0 ? Math.round((verified / args.claims.length) * 100) : 100;

  const summary = generateSummary(verified, failed, trustScore);

  return {
    verified,
    failed,
    results: args.detailed ? results : results.map(stripDetails),
    trustScore,
    summary,
  };
}

async function verifySingleClaim(
  claim: VerifyClaim,
  projectPath?: string,
): Promise<VerificationResult> {
  switch (claim.type) {
    case "file_created":
      return await verifyFileCreated(claim, projectPath);
    case "file_modified":
      return await verifyFileModified(claim, projectPath);
    case "file_deleted":
      return await verifyFileDeleted(claim, projectPath);
    case "command_executed":
      return await verifyCommandExecuted(claim);
    default:
      return {
        claim,
        verified: false,
        evidence: {},
        message: `Unknown claim type: ${(claim as unknown as {type: string}).type}`,
      };
  }
}

async function verifyFileCreated(
  claim: VerifyClaim,
  projectPath?: string,
): Promise<VerificationResult> {
  if (!claim.path) {
    return {
      claim,
      verified: false,
      evidence: {},
      message: "No path provided for file creation claim",
    };
  }

  const fullPath = projectPath ? resolve(projectPath, claim.path) : resolve(claim.path);

  const exists = await existsSync(fullPath);

  if (!exists) {
    return {
      claim,
      verified: false,
      evidence: { exists: false },
      message: `File not found: ${claim.path}`,
    };
  }

  const stat = await Deno.stat(fullPath);
  const evidence: VerificationResult["evidence"] = {
    exists: true,
    size: stat.size,
    modifiedTime: stat.mtime,
  };

  // Check size if expected
  if (claim.expectedSize !== undefined && stat.size !== claim.expectedSize) {
    return {
      claim,
      verified: false,
      evidence,
      message: `File size mismatch: expected ${claim.expectedSize}, got ${stat.size}`,
    };
  }

  // Check content/checksum if expected
  if (claim.expectedChecksum) {
    const content = await Deno.readTextFile(fullPath);
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    evidence.checksum = hash;

    if (hash !== claim.expectedChecksum) {
      return {
        claim,
        verified: false,
        evidence,
        message: `Checksum mismatch: expected ${claim.expectedChecksum}, got ${hash}`,
      };
    }
  }

  return {
    claim,
    verified: true,
    evidence,
    message: `✅ File created: ${claim.path} (${stat.size} bytes)`,
  };
}

async function verifyFileModified(
  claim: VerifyClaim,
  projectPath?: string,
): Promise<VerificationResult> {
  if (!claim.path) {
    return {
      claim,
      verified: false,
      evidence: {},
      message: "No path provided for file modification claim",
    };
  }

  const fullPath = projectPath ? resolve(projectPath, claim.path) : resolve(claim.path);

  const exists = await existsSync(fullPath);

  if (!exists) {
    return {
      claim,
      verified: false,
      evidence: { exists: false },
      message: `File not found: ${claim.path}`,
    };
  }

  const stat = await Deno.stat(fullPath);
  const evidence: VerificationResult["evidence"] = {
    exists: true,
    size: stat.size,
    modifiedTime: stat.mtime,
  };

  // Check if file was recently modified (within last 5 minutes)
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  const wasRecentlyModified = stat.mtime && stat.mtime.getTime() > fiveMinutesAgo;

  if (!wasRecentlyModified) {
    return {
      claim,
      verified: false,
      evidence,
      message: `File not recently modified: ${claim.path}`,
    };
  }

  return {
    claim,
    verified: true,
    evidence,
    message: `✅ File modified: ${claim.path}`,
  };
}

async function verifyFileDeleted(
  claim: VerifyClaim,
  projectPath?: string,
): Promise<VerificationResult> {
  if (!claim.path) {
    return {
      claim,
      verified: false,
      evidence: {},
      message: "No path provided for file deletion claim",
    };
  }

  const fullPath = projectPath ? resolve(projectPath, claim.path) : resolve(claim.path);

  const exists = await existsSync(fullPath);

  if (exists) {
    return {
      claim,
      verified: false,
      evidence: { exists: true },
      message: `File still exists: ${claim.path}`,
    };
  }

  return {
    claim,
    verified: true,
    evidence: { exists: false },
    message: `✅ File deleted: ${claim.path}`,
  };
}

function verifyCommandExecuted(claim: VerifyClaim): VerificationResult {
  // For now, we can't verify command execution without actually running it
  // This would need integration with shell history or process monitoring
  return {
    claim,
    verified: false,
    evidence: {},
    message: "Command execution verification not yet implemented",
  };
}

function stripDetails(result: VerificationResult): VerificationResult {
  return {
    claim: result.claim,
    verified: result.verified,
    evidence: {},
    message: result.message,
  };
}

function generateSummary(verified: number, failed: number, trustScore: number): string {
  const total = verified + failed;

  if (total === 0) {
    return "No claims to verify";
  }

  if (trustScore === 100) {
    return `✅ All ${total} claims verified successfully`;
  } else if (trustScore >= 80) {
    return `⚠️ ${verified}/${total} claims verified (${trustScore}% trust score)`;
  } else {
    return `❌ Only ${verified}/${total} claims verified (${trustScore}% trust score) - verification failed`;
  }
}

// Tool definition for MCP
export const verifyClaimsTool = {
  name: "verify_claims",
  description: "Verify claims made by AI agents about file operations",
  execute: verifyClaimsFunction,
  inputSchema: {
    type: "object",
    properties: {
      claims: {
        type: "array",
        description: "List of claims to verify",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["file_created", "file_modified", "file_deleted", "command_executed"],
              description: "Type of claim to verify",
            },
            path: {
              type: "string",
              description: "File path (for file operations)",
            },
            expectedContent: {
              type: "string",
              description: "Expected file content",
            },
            expectedSize: {
              type: "number",
              description: "Expected file size in bytes",
            },
            expectedChecksum: {
              type: "string",
              description: "Expected SHA256 checksum",
            },
            command: {
              type: "string",
              description: "Command that was executed",
            },
            expectedOutput: {
              type: "string",
              description: "Expected command output",
            },
          },
          required: ["type"],
        },
      },
      projectPath: {
        type: "string",
        description: "Project root path for resolving relative paths",
      },
      detailed: {
        type: "boolean",
        description: "Include detailed evidence in response",
        default: true,
      },
    },
    required: ["claims"],
  },
};
