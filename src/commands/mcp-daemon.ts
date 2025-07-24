/**
 * MCP Daemon - Manages the MCP server as a background process
 */

// import { exists } from "@std/fs"; // Future use

const MCP_SERVER_PATH = `${Deno.env.get("HOME")}/.aichaku/mcp-servers/aichaku-code-reviewer`;
const PID_FILE = `${Deno.env.get("HOME")}/.aichaku/mcp-server.pid`;
const LOG_FILE = `${Deno.env.get("HOME")}/.aichaku/mcp-server.log`;
const FIFO_REQUEST = `${Deno.env.get("HOME")}/.aichaku/mcp-request.fifo`;
const FIFO_RESPONSE = `${Deno.env.get("HOME")}/.aichaku/mcp-response.fifo`;

export interface MCPDaemonOptions {
  start?: boolean;
  stop?: boolean;
  status?: boolean;
  restart?: boolean;
}

/**
 * Check if daemon is running
 */
async function isDaemonRunning(): Promise<boolean> {
  try {
    const pid = await Deno.readTextFile(PID_FILE);
    // Check if process exists
    await Deno.kill(parseInt(pid), "SIGCONT");
    return true;
  } catch {
    return false;
  }
}

/**
 * Start the MCP daemon
 */
async function startDaemon(): Promise<void> {
  if (await isDaemonRunning()) {
    console.log("✅ MCP daemon is already running");
    return;
  }

  console.log("🚀 Starting MCP daemon...");

  // Create FIFOs if they don't exist
  await createFifos();

  // Start the server in background
  const command = new Deno.Command("nohup", {
    args: [
      MCP_SERVER_PATH,
      "&",
    ],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const child = command.spawn();

  // Detach and let it run
  await Deno.writeTextFile(PID_FILE, child.pid.toString());

  console.log("✅ MCP daemon started (PID: " + child.pid + ")");
  console.log("📝 Logs: " + LOG_FILE);
}

/**
 * Stop the MCP daemon
 */
async function stopDaemon(): Promise<void> {
  if (!await isDaemonRunning()) {
    console.log("⚠️  MCP daemon is not running");
    return;
  }

  try {
    const pid = parseInt(await Deno.readTextFile(PID_FILE));
    console.log("🛑 Stopping MCP daemon (PID: " + pid + ")...");

    await Deno.kill(pid, "SIGTERM");
    await Deno.remove(PID_FILE);

    // Clean up FIFOs
    await removeFifos();

    console.log("✅ MCP daemon stopped");
  } catch (error) {
    console.error("❌ Failed to stop daemon:", error);
  }
}

/**
 * Get daemon status
 */
async function daemonStatus(): Promise<void> {
  if (await isDaemonRunning()) {
    const pid = await Deno.readTextFile(PID_FILE);
    console.log("✅ MCP daemon is running (PID: " + pid + ")");
  } else {
    console.log("❌ MCP daemon is not running");
  }
}

/**
 * Create named pipes (FIFOs)
 */
async function createFifos(): Promise<void> {
  // Remove existing FIFOs
  await removeFifos();

  // Create new FIFOs
  const mkfifo1 = new Deno.Command("mkfifo", {
    args: [FIFO_REQUEST],
  });
  await mkfifo1.output();

  const mkfifo2 = new Deno.Command("mkfifo", {
    args: [FIFO_RESPONSE],
  });
  await mkfifo2.output();
}

/**
 * Remove FIFOs
 */
async function removeFifos(): Promise<void> {
  try {
    await Deno.remove(FIFO_REQUEST);
  } catch {
    // Ignore
  }

  try {
    await Deno.remove(FIFO_RESPONSE);
  } catch {
    // Ignore
  }
}

export async function runMCPDaemonCommand(
  options: MCPDaemonOptions,
): Promise<void> {
  if (options.status) {
    await daemonStatus();
  } else if (options.stop) {
    await stopDaemon();
  } else if (options.restart) {
    await stopDaemon();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await startDaemon();
  } else if (options.start) {
    await startDaemon();
  } else {
    console.log(`
🪴 Aichaku MCP Daemon Manager

Usage:
  aichaku mcp-daemon --start     Start the MCP server daemon
  aichaku mcp-daemon --stop      Stop the MCP server daemon
  aichaku mcp-daemon --status    Check daemon status
  aichaku mcp-daemon --restart   Restart the daemon

The daemon runs the MCP server in the background, allowing
multiple clients to use it efficiently.
`);
  }
}
