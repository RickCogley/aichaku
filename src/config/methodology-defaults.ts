/**
 * Configuration-as-code: Default methodology configuration
 *
 * Centralized configuration for default methodologies to eliminate hardcoded lists.
 * Senior engineer principle: Single source of truth for configuration!
 */

export interface MethodologyDefaults {
  defaultMethodologies: string[];
  description: string;
  lastUpdated: string;
}

/**
 * Default methodology configuration
 *
 * This is the ONLY place where default methodology lists should be defined.
 * Used across yaml-config-reader, integration, and other core functionality.
 */
export const METHODOLOGY_DEFAULTS: MethodologyDefaults = {
  defaultMethodologies: [
    "shape-up",
    "scrum",
    "kanban",
    "lean",
    "xp",
    "scrumban",
  ],
  description: "Default methodologies for new installations and fallbacks",
  lastUpdated: "2025-07-17",
};

/**
 * Get default methodologies list
 */
export function getDefaultMethodologies(): string[] {
  return METHODOLOGY_DEFAULTS.defaultMethodologies;
}

/**
 * Get default methodology configuration metadata
 */
export function getMethodologyDefaults(): MethodologyDefaults {
  return METHODOLOGY_DEFAULTS;
}
