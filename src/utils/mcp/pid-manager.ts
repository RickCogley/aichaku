/**
 * PID File Manager
 * Manages process ID storage for tracking running MCP server instances
 */

import { dirname, join, normalize } from "@std/path";
import { ensureDir, exists } from "@std/fs";

export class PIDManager {
  private pidFilePath: string;

  constructor(mcpDir: string) {
    // Normalize the directory path
    const normalizedDir = normalize(mcpDir);
    this.pidFilePath = join(normalizedDir, "mcp-server.pid");
  }

  /**
   * Get the stored PID if it exists
   */
  async getPID(): Promise<number | null> {
    try {
      if (!await exists(this.pidFilePath)) {
        return null;
      }

      const content = await Deno.readTextFile(this.pidFilePath);
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
      await Deno.writeTextFile(this.pidFilePath, pid.toString());
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
        await Deno.remove(this.pidFilePath);
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
      const metaPath = this.pidFilePath.replace(".pid", ".meta.json");
      if (!await exists(metaPath)) {
        return null;
      }

      const content = await Deno.readTextFile(metaPath);
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
      const metaPath = this.pidFilePath.replace(".pid", ".meta.json");
      await Deno.writeTextFile(metaPath, JSON.stringify(metadata, null, 2));
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
      const metaPath = this.pidFilePath.replace(".pid", ".meta.json");
      if (await exists(metaPath)) {
        await Deno.remove(metaPath);
      }
    } catch {
      // Non-critical
    }
  }
}
