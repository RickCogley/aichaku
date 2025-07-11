/**
 * Windows Process Handler
 * Handles process management on Windows systems
 */

import type { ProcessHandler, ProcessInfo } from "../process-manager.ts";

export class WindowsProcessHandler implements ProcessHandler {
  /**
   * Start a process in the background on Windows
   */
  start(command: string, args: string[]): Promise<number> {
    try {
      // Use Windows Start command to run detached
      const startCmd = new Deno.Command("cmd", {
        args: ["/c", "start", "/b", command, ...args],
        stdout: "piped",
        stderr: "piped",
        stdin: "null",
      });

      startCmd.spawn();

      // On Windows, we need to get the PID differently
      // Start command doesn't directly return the child PID
      // So we'll use a different approach

      // Start the process directly and get its PID
      const directProcess = new Deno.Command(command, {
        args,
        stdout: "piped",
        stderr: "piped",
        stdin: "null",
      });

      const child = directProcess.spawn();
      const pid = child.pid;

      // Detach the process
      child.unref();

      return Promise.resolve(pid);
    } catch (error) {
      throw new Error(`Failed to start process: ${error}`);
    }
  }

  /**
   * Stop a process by PID on Windows
   */
  async stop(pid: number): Promise<boolean> {
    try {
      // Use taskkill to stop the process
      const cmd = new Deno.Command("taskkill", {
        args: ["/F", "/PID", pid.toString()],
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      return output.success;
    } catch {
      // Process might not exist
      return true;
    }
  }

  /**
   * Check if a process is running on Windows
   */
  async isRunning(pid: number): Promise<boolean> {
    try {
      // Use tasklist to check if process exists
      const cmd = new Deno.Command("tasklist", {
        args: ["/FI", `PID eq ${pid}`, "/FO", "CSV"],
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        return false;
      }

      const text = new TextDecoder().decode(output.stdout);
      // Check if the output contains the PID (not just the header)
      const lines = text.trim().split("\n");
      return lines.length > 1 && lines[1].includes(pid.toString());
    } catch {
      return false;
    }
  }

  /**
   * Get detailed process information on Windows
   */
  async getProcessInfo(pid: number): Promise<ProcessInfo | null> {
    try {
      // Use WMIC to get detailed process info
      const cmd = new Deno.Command("wmic", {
        args: [
          "process",
          "where",
          `ProcessId=${pid}`,
          "get",
          "ProcessId,Name,CreationDate,WorkingSetSize,PageFileUsage",
          "/FORMAT:CSV",
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        return null;
      }

      const text = new TextDecoder().decode(output.stdout);
      const lines = text.trim().split("\n");

      if (lines.length < 3) {
        return null;
      }

      // Parse CSV output (skip first two lines - they're headers)
      const data = lines[2].split(",");
      if (data.length < 5) {
        return null;
      }

      const [, creationDate, name, , , workingSet] = data;

      // Parse Windows date format (YYYYMMDDHHmmss.ffffff+000)
      const startTime = this.parseWindowsDate(creationDate);

      // Get CPU usage using different command
      const cpuUsage = await this.getCPUUsage(pid);

      return {
        pid,
        command: name,
        startTime,
        memoryUsage: parseInt(workingSet) || 0,
        cpuUsage,
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse Windows WMI date format
   */
  private parseWindowsDate(dateStr: string): Date {
    if (!dateStr || dateStr.length < 14) {
      return new Date();
    }

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-based
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(8, 10));
    const minute = parseInt(dateStr.substring(10, 12));
    const second = parseInt(dateStr.substring(12, 14));

    return new Date(year, month, day, hour, minute, second);
  }

  /**
   * Get CPU usage for a process on Windows
   */
  private async getCPUUsage(pid: number): Promise<number> {
    try {
      // Use typeperf to get CPU usage
      const cmd = new Deno.Command("typeperf", {
        args: [
          `\\Process(*#${pid})\\% Processor Time`,
          "-sc",
          "1",
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        return 0;
      }

      const text = new TextDecoder().decode(output.stdout);
      const lines = text.trim().split("\n");

      // Find the data line (last line usually)
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (line.includes(",") && !line.includes("Processor Time")) {
          const parts = line.split(",");
          if (parts.length >= 2) {
            const value = parseFloat(parts[1].replace(/"/g, ""));
            return isNaN(value) ? 0 : value;
          }
        }
      }

      return 0;
    } catch {
      return 0;
    }
  }
}
