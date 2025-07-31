/**
 * Agent type definition
 */
export interface Agent {
  /** Agent name (without aichaku- prefix) */
  name: string;

  /** Agent type: default or optional */
  type: "default" | "optional";

  /** Short description of agent's purpose */
  description: string;

  /** Color for visual identification */
  color?: string;

  /** Whether agent is methodology-aware */
  methodology_aware?: boolean;

  /** Tools available to this agent */
  tools?: string[];

  /** Technology focus (e.g., "deno", "typescript") */
  technology_focus?: string;

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
