/**
 * Configuration-as-code: Methodology template mappings
 *
 * Centralized configuration for methodology-to-template mappings.
 * Senior engineer principle: No hardcoded business logic!
 */

export interface MethodologyTemplateMap {
  [methodology: string]: string[];
}

export interface MethodologyTemplateConfig {
  templates: MethodologyTemplateMap;
  description: string;
  lastUpdated: string;
}

/**
 * Methodology template configuration
 *
 * This is the ONLY place where methodology-to-template mappings should be defined.
 * Used by upgrade commands, initialization, and template generation.
 */
export const METHODOLOGY_TEMPLATE_CONFIG: MethodologyTemplateConfig = {
  templates: {
    "shape-up": ["STATUS.md", "pitch.md", "hill-chart.md"],
    "scrum": ["sprint-planning.md", "retrospective.md"],
    "kanban": ["kanban-board.md", "flow-metrics.md"],
    "lean": ["experiment-plan.md"],
    "xp": ["test-plan.md", "pair-programming.md"],
    "scrumban": ["planning-trigger.md", "flow-metrics.md"],
  },
  description: "Template mappings for each methodology",
  lastUpdated: "2025-07-17",
};

/**
 * Get template mappings for all methodologies
 */
export function getMethodologyTemplateMap(): MethodologyTemplateMap {
  return METHODOLOGY_TEMPLATE_CONFIG.templates;
}

/**
 * Get templates for a specific methodology
 */
export function getMethodologyTemplates(methodology: string): string[] {
  return METHODOLOGY_TEMPLATE_CONFIG.templates[methodology] || [];
}

/**
 * Get template configuration metadata
 */
export function getMethodologyTemplateConfig(): MethodologyTemplateConfig {
  return METHODOLOGY_TEMPLATE_CONFIG;
}
