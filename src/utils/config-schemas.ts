/**
 * Zod schemas for runtime validation of configuration data
 * Provides type-safe parsing and validation for all config structures
 *
 * @module
 */

import { z } from "zod";

/**
 * Schema for project configuration in aichaku.json
 */
export const ProjectConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  selected: z.object({
    methodologies: z.array(z.string()).default([]),
    standards: z.array(z.string()).default([]),
    principles: z.array(z.string()).default([]),
    patterns: z.array(z.string()).default([]),
    agents: z.array(z.string()).default([]),
  }).default({
    methodologies: [],
    standards: [],
    principles: [],
    patterns: [],
    agents: [],
  }),
  metadata: z.object({
    lastUpdated: z.string().datetime().optional(),
    projectPath: z.string().optional(),
    migrationVersion: z.string().optional(),
  }).optional(),
}).strict();

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

/**
 * Schema for methodology configuration
 */
export const MethodologySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  best_for: z.string().optional(),
  templates: z.record(z.string()).optional(),
  phases: z.record(z.unknown()).optional(),
  integration_url: z.string().optional(),
});

export type Methodology = z.infer<typeof MethodologySchema>;

/**
 * Schema for standard configuration
 */
export const StandardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  summary: z.union([
    z.string(),
    z.record(z.unknown()),
  ]).optional(),
  integration_url: z.string().optional(),
});

export type Standard = z.infer<typeof StandardSchema>;

/**
 * Schema for principle configuration
 */
export const PrincipleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  summary: z.object({
    tagline: z.string().optional(),
    core_tenets: z.array(z.object({
      text: z.string(),
    })).optional(),
  }).optional(),
  integration_url: z.string().optional(),
});

export type Principle = z.infer<typeof PrincipleSchema>;

/**
 * Schema for agent configuration
 */
export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  type: z.string().optional(),
  purpose: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  bestFor: z.array(z.string()).optional(),
  contextAwareness: z.object({
    methodologies: z.array(z.string()).optional(),
    standards: z.array(z.string()).optional(),
    principles: z.array(z.string()).optional(),
  }).optional(),
});

export type Agent = z.infer<typeof AgentSchema>;

/**
 * Schema for CLI arguments
 */
export const CLIArgsSchema = z.object({
  _: z.array(z.string()).default([]),
  help: z.boolean().optional(),
  version: z.boolean().optional(),
  list: z.boolean().optional(),
  show: z.union([z.boolean(), z.string()]).optional(),
  add: z.string().optional(),
  remove: z.string().optional(),
  search: z.string().optional(),
  current: z.boolean().optional(),
  projectPath: z.string().optional(),
  dryRun: z.boolean().optional(),
  verbose: z.boolean().optional(),
  force: z.boolean().optional(),
  global: z.boolean().optional(),
  skipGitHooks: z.boolean().optional(),
  noEmoji: z.boolean().optional(),
  json: z.boolean().optional(),
});

export type CLIArgs = z.infer<typeof CLIArgsSchema>;

/**
 * Validate and parse project configuration
 */
export function validateProjectConfig(data: unknown): ProjectConfig {
  return ProjectConfigSchema.parse(data);
}

/**
 * Validate and parse CLI arguments with safe defaults
 */
export function validateCLIArgs(args: unknown): CLIArgs {
  try {
    return CLIArgsSchema.parse(args);
  } catch (error) {
    // Provide safe defaults for invalid args
    console.error("Invalid CLI arguments, using defaults:", error);
    return {
      _: [],
      help: true,
    };
  }
}

/**
 * Safe parse with error handling
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fallback?: T,
): T | undefined {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  return undefined;
}
