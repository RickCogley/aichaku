import { assertEquals, assertExists } from "jsr:@std/assert@1";
import { AgentLoader } from "./agent-loader.ts";

Deno.test("AgentLoader - loadById with fuzzy search", async (t) => {
  const loader = new AgentLoader();

  await t.step("Exact match with full ID", async () => {
    const agent = await loader.loadById("aichaku-deno-expert");
    assertExists(agent);
    assertEquals(agent?.id, "aichaku-deno-expert");
  });

  await t.step("Exact match without prefix", async () => {
    const agent = await loader.loadById("deno-expert");
    assertExists(agent);
    assertEquals(agent?.id, "aichaku-deno-expert");
  });

  await t.step("Case insensitive exact match", async () => {
    const agent = await loader.loadById("DENO-EXPERT");
    assertExists(agent);
    assertEquals(agent?.id, "aichaku-deno-expert");
  });

  await t.step("Whitespace trimming", async () => {
    const agent = await loader.loadById("  deno-expert  ");
    assertExists(agent);
    assertEquals(agent?.id, "aichaku-deno-expert");
  });

  await t.step("Fuzzy match - single word agents", async () => {
    const agent1 = await loader.loadById("orchestrator");
    assertExists(agent1);
    assertEquals(agent1?.id, "aichaku-orchestrator");

    const agent2 = await loader.loadById("documenter");
    assertExists(agent2);
    assertEquals(agent2?.id, "aichaku-documenter");
  });

  await t.step("Non-existent agent returns null", async () => {
    const agent = await loader.loadById("nonexistent-agent-xyz");
    assertEquals(agent, null);
  });
});

Deno.test("AgentLoader - findByPartialId for ambiguous matches", async (t) => {
  const loader = new AgentLoader();

  await t.step("Find all agents with 'expert' in name", async () => {
    const matches = await loader.findByPartialId("expert");
    assertExists(matches);
    // Should find multiple expert agents
    const expertAgents = matches.filter((a) => a.id.includes("expert"));
    assertEquals(expertAgents.length > 1, true, "Should find multiple expert agents");
  });

  await t.step("Find agents matching 'test'", async () => {
    const matches = await loader.findByPartialId("test");
    assertExists(matches);
    // Should find at least test-expert
    const hasTestExpert = matches.some((a) => a.id === "aichaku-test-expert");
    assertEquals(hasTestExpert, true, "Should find test-expert");
  });

  await t.step("Partial match 'coach' finds coach agents", async () => {
    const matches = await loader.findByPartialId("coach");
    assertExists(matches);
    const coachAgents = matches.filter((a) => a.id.includes("coach"));
    assertEquals(coachAgents.length >= 2, true, "Should find methodology-coach and principle-coach");
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
