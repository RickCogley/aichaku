/**
 * PID File Manager
 * Manages process ID storage for tracking running MCP server instances
 */

import { dirname, join, normalize } from "@std/path";
import { ensureDir, exists } from "@std/fs";
import {
  safeReadTextFile,
  safeRemove,
  safeWriteTextFile,
} from "../path-security.ts";

export class PIDManager {
  private pidFilePath: string;
  private baseDir: string;

  constructor(mcpDir: string) {
    // Normalize the directory path
    this.baseDir = normalize(mcpDir);
    this.pidFilePath = join(this.baseDir, "mcp-server.pid");
  }

  /**
   * Get the stored PID if it exists
   */
  async getPID(): Promise<number | null> {
    try {
      if (!await exists(this.pidFilePath)) {
        return null;
      }

      const content = await safeReadTextFile("mcp-server.pid", this.baseDir);
      const pid = parseInt(content.trim(), 10);

      if (isNaN(pid) || pid <= 0) {
        // Invalid PID file, clean it up
        await this.removePID();
        return null;
      }

      return pid;
    } catch (error) {
      console.error("Error reading PID file:", error);
      return null;
    }
  }

  /**
   * Store a PID
   */
  async setPID(pid: number): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(this.pidFilePath);
      await ensureDir(dir);

      // Write PID to file
      await safeWriteTextFile("mcp-server.pid", pid.toString(), this.baseDir);
    } catch (error) {
      throw new Error(`Failed to write PID file: ${error}`);
    }
  }

  /**
   * Remove the PID file
   */
  async removePID(): Promise<void> {
    try {
      if (await exists(this.pidFilePath)) {
        await safeRemove("mcp-server.pid", this.baseDir);
      }
    } catch (error) {
      // Log but don't throw - not critical if we can't remove
      console.error("Error removing PID file:", error);
    }
  }

  /**
   * Get additional process metadata
   */
  async getMetadata(): Promise<Record<string, unknown> | null> {
    try {
      const metaFileName = "mcp-server.meta.json";
      const metaPath = join(this.baseDir, metaFileName);
      if (!await exists(metaPath)) {
        return null;
      }

      const content = await safeReadTextFile(metaFileName, this.baseDir);
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Store additional process metadata
   */
  async setMetadata(metadata: Record<string, unknown>): Promise<void> {
    try {
      const metaFileName = "mcp-server.meta.json";
      await safeWriteTextFile(
        metaFileName,
        JSON.stringify(metadata, null, 2),
        this.baseDir,
      );
    } catch (error) {
      // Non-critical, just log
      console.error("Error writing metadata:", error);
    }
  }

  /**
   * Remove metadata file
   */
  async removeMetadata(): Promise<void> {
    try {
      const metaFileName = "mcp-server.meta.json";
      const metaPath = join(this.baseDir, metaFileName);
      if (await exists(metaPath)) {
        await safeRemove(metaFileName, this.baseDir);
      }
    } catch {
      // Non-critical
    }
  }
}
