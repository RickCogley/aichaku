import type { ConfigItem } from "./command.ts";

/**
 * Agent type definition - extends ConfigItem for consistency with other commands
 */
export interface Agent extends ConfigItem {
  /** Agent name (without aichaku- prefix) - inherited from ConfigItem */
  // name: string; // Already defined in ConfigItem

  /** Agent ID - same as name for agents */
  // id: string; // Already defined in ConfigItem

  /** Short description of agent's purpose - inherited from ConfigItem */
  // description: string; // Already defined in ConfigItem

  /** Agent type: default or optional */
  type: "default" | "optional";

  /** Color for visual identification */
  color?: string;

  /** Whether agent is methodology-aware */
  methodology_aware?: boolean;

  /** Tools available to this agent */
  tools?: string[];

  /** Technology focus (e.g., "deno", "typescript") */
  technology_focus?: string;

  /** Model to use for this agent (opus, sonnet, haiku) */
  model?: "opus" | "sonnet" | "haiku";

  /** Usage examples */
  examples?: AgentExample[];

  /** Delegation patterns to other agents */
  delegations?: AgentDelegation[];
}

/**
 * Example usage of an agent
 */
export interface AgentExample {
  context: string;
  user: string;
  assistant: string;
  commentary: string;
}

/**
 * Delegation pattern to another agent
 */
export interface AgentDelegation {
  trigger: string;
  target: string;
  handoff: string;
}
