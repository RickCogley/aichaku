#!/usr/bin/env -S deno run --allow-read --allow-run

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
  stop_hook_active?: boolean;
}

const decoder = new TextDecoder();  
const buffer = await Deno.stdin.readable.getReader().read();
const input = decoder.decode(buffer.value);
const hookInput: HookInput = JSON.parse(input);

// Read the conversation transcript
const transcriptContent = await Deno.readTextFile(hookInput.transcript_path);

// Generate summary based on hook event
const eventPrefix = hookInput.hook_event_name === "preCompact" ? "Pre-Compact" : "Checkpoint";
const command = new Deno.Command("claude", {
  args: ["-p", `Please confirm today's date, then create a ${eventPrefix.toLowerCase()} summary under @docs/checkpoints with a filename like checkpoint-YYYY-MM-DD-{descriptive-name}.md of this conversation:\n\n${transcriptContent}`],
  stdout: "piped",
  stderr: "piped"
});

const { stdout } = await command.output();
const summary = new TextDecoder().decode(stdout);

console.log(`${eventPrefix} Summary:\n${summary}`);
Deno.exit(0);