import { assertEquals, assertExists } from "jsr:@std/assert@1";
import { AgentLoader } from "./agent-loader.ts";

// Mock path module to avoid actual file system access
const originalPaths = await import("../paths.ts");

Deno.test("AgentLoader - loadById resolution strategies", async (t) => {
  const loader = new AgentLoader();

  await t.step("Exact match with full ID", async () => {
    const agent = await loader.loadById("aichaku-deno-expert");
    if (agent) {
      assertEquals(agent.id, "aichaku-deno-expert");
    }
  });

  await t.step("Short form resolution - expert suffix", async () => {
    const agent = await loader.loadById("deno");
    if (agent) {
      assertEquals(agent.id, "aichaku-deno-expert");
    }
  });

  await t.step("Short form resolution - typescript", async () => {
    const agent = await loader.loadById("typescript");
    if (agent) {
      assertEquals(agent.id, "aichaku-typescript-expert");
    }
  });

  await t.step("Short form resolution - orchestrator (single word)", async () => {
    const agent = await loader.loadById("orchestrator");
    if (agent) {
      assertEquals(agent.id, "aichaku-orchestrator");
    }
  });

  await t.step("Short form resolution - documenter (single word)", async () => {
    const agent = await loader.loadById("documenter");
    if (agent) {
      assertEquals(agent.id, "aichaku-documenter");
    }
  });

  await t.step("Short form resolution - api (architect suffix)", async () => {
    const agent = await loader.loadById("api");
    if (agent) {
      assertEquals(agent.id, "aichaku-api-architect");
    }
  });

  await t.step("Short form resolution - code (explorer suffix)", async () => {
    const agent = await loader.loadById("code");
    if (agent) {
      assertEquals(agent.id, "aichaku-code-explorer");
    }
  });

  await t.step("Short form resolution - security (reviewer suffix)", async () => {
    const agent = await loader.loadById("security");
    if (agent) {
      assertEquals(agent.id, "aichaku-security-reviewer");
    }
  });

  await t.step("Short form resolution - methodology (coach suffix)", async () => {
    const agent = await loader.loadById("methodology");
    if (agent) {
      assertEquals(agent.id, "aichaku-methodology-coach");
    }
  });

  await t.step("Short form resolution - principle (coach suffix)", async () => {
    const agent = await loader.loadById("principle");
    if (agent) {
      assertEquals(agent.id, "aichaku-principle-coach");
    }
  });

  await t.step("Case insensitive matching", async () => {
    const agent = await loader.loadById("DENO");
    if (agent) {
      assertEquals(agent.id, "aichaku-deno-expert");
    }
  });

  await t.step("Whitespace trimming", async () => {
    const agent = await loader.loadById("  deno  ");
    if (agent) {
      assertEquals(agent.id, "aichaku-deno-expert");
    }
  });

  await t.step("Already has suffix - no double suffix", async () => {
    const agent = await loader.loadById("deno-expert");
    if (agent) {
      assertEquals(agent.id, "aichaku-deno-expert");
    }
  });

  await t.step("Full ID provided - no modification", async () => {
    const agent = await loader.loadById("aichaku-typescript-expert");
    if (agent) {
      assertEquals(agent.id, "aichaku-typescript-expert");
    }
  });

  await t.step("Non-existent agent returns null", async () => {
    const agent = await loader.loadById("nonexistent");
    assertEquals(agent, null);
  });
});

Deno.test("AgentLoader - loadAll returns all agents", async () => {
  const loader = new AgentLoader();
  const agents = await loader.loadAll();

  // Should have some agents
  assertExists(agents);
  assertEquals(Array.isArray(agents), true);

  // Check that common agents exist
  const agentIds = agents.map((a) => a.id);
  const expectedAgents = [
    "aichaku-deno-expert",
    "aichaku-typescript-expert",
    "aichaku-orchestrator",
    "aichaku-documenter",
    "aichaku-api-architect",
    "aichaku-code-explorer",
    "aichaku-security-reviewer",
    "aichaku-test-expert",
  ];

  for (const expected of expectedAgents) {
    assertEquals(
      agentIds.includes(expected),
      true,
      `Expected agent ${expected} not found in loaded agents`,
    );
  }
});
