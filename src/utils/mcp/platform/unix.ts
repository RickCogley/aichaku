/**
 * Unix/macOS Process Handler
 * Handles process management on Unix-like systems
 */

import type { ProcessHandler, ProcessInfo } from "../process-manager.ts";

export class UnixProcessHandler implements ProcessHandler {
  /**
   * Start a process in the background
   */
  start(command: string, args: string[]): Promise<number> {
    try {
      // Start process detached from parent
      const process = new Deno.Command(command, {
        args,
        stdout: "piped",
        stderr: "piped",
        stdin: "null",
      });

      const child = process.spawn();

      // The subprocess will run independently
      // We need to get its PID before it detaches
      const pid = child.pid;

      // Let it run in background
      child.unref();

      return Promise.resolve(pid);
    } catch (error) {
      throw new Error(`Failed to start process: ${error}`);
    }
  }

  /**
   * Stop a process by PID
   */
  async stop(pid: number): Promise<boolean> {
    try {
      // First try SIGTERM for graceful shutdown
      Deno.kill(pid, "SIGTERM");

      // Wait up to 5 seconds for graceful shutdown
      for (let i = 0; i < 50; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (!await this.isRunning(pid)) {
          return true;
        }
      }

      // If still running, force kill
      Deno.kill(pid, "SIGKILL");

      // Wait a moment to ensure it's killed
      await new Promise((resolve) => setTimeout(resolve, 100));

      return !await this.isRunning(pid);
    } catch (error) {
      // Process might not exist
      if (error instanceof Deno.errors.NotFound) {
        return true; // Already stopped
      }
      throw error;
    }
  }

  /**
   * Check if a process is running
   */
  isRunning(pid: number): Promise<boolean> {
    try {
      // Send signal 0 to check if process exists
      Deno.kill(pid, "SIGCONT");
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }

  /**
   * Get detailed process information
   */
  async getProcessInfo(pid: number): Promise<ProcessInfo | null> {
    try {
      // Use ps command to get process info
      const cmd = new Deno.Command("ps", {
        args: ["-p", pid.toString(), "-o", "pid,comm,etime,rss,%cpu"],
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        return null;
      }

      const text = new TextDecoder().decode(output.stdout);
      const lines = text.trim().split("\n");

      if (lines.length < 2) {
        return null;
      }

      // Parse the output (skip header)
      const data = lines[1].trim().split(/\s+/);
      if (data.length < 5) {
        return null;
      }

      const [, command, etime, rss, cpu] = data;

      // Parse elapsed time to get start time
      const startTime = this.parseEtime(etime);

      return {
        pid,
        command,
        startTime,
        memoryUsage: parseInt(rss) * 1024, // Convert KB to bytes
        cpuUsage: parseFloat(cpu),
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse elapsed time format from ps command
   * Formats: [[DD-]HH:]MM:SS or [[DD-]HH:]MM:SS.ms
   */
  private parseEtime(etime: string): Date {
    const now = Date.now();
    let totalSeconds = 0;

    // Remove microseconds if present
    const cleanTime = etime.split(".")[0];

    if (cleanTime.includes("-")) {
      // Format: DD-HH:MM:SS
      const [days, rest] = cleanTime.split("-");
      totalSeconds += parseInt(days) * 86400;

      const timeParts = rest.split(":");
      if (timeParts.length === 3) {
        totalSeconds += parseInt(timeParts[0]) * 3600; // hours
        totalSeconds += parseInt(timeParts[1]) * 60; // minutes
        totalSeconds += parseInt(timeParts[2]); // seconds
      }
    } else {
      // Format: HH:MM:SS or MM:SS
      const timeParts = cleanTime.split(":");
      if (timeParts.length === 3) {
        totalSeconds += parseInt(timeParts[0]) * 3600; // hours
        totalSeconds += parseInt(timeParts[1]) * 60; // minutes
        totalSeconds += parseInt(timeParts[2]); // seconds
      } else if (timeParts.length === 2) {
        totalSeconds += parseInt(timeParts[0]) * 60; // minutes
        totalSeconds += parseInt(timeParts[1]); // seconds
      }
    }

    return new Date(now - (totalSeconds * 1000));
  }
}
