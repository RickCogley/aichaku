/**
 * Configuration-as-code: Methodology fallback configuration
 *
 * This file defines the fallback methodology list when dynamic discovery fails.
 * As a senior engineer principle: No hardcoded lists in business logic!
 */

export interface MethodologyFallbackConfig {
  methodologies: string[];
  reason: string;
  lastUpdated: string;
}

/**
 * Fallback methodology configuration
 *
 * This should be the ONLY place where methodology names are hardcoded.
 * When adding new methodologies, update this configuration file.
 */
export const METHODOLOGY_FALLBACK_CONFIG: MethodologyFallbackConfig = {
  methodologies: [
    "shape-up",
    "scrum",
    "kanban",
    "lean",
    "xp",
    "scrumban",
  ],
  reason: "Emergency fallback when dynamic discovery fails",
  lastUpdated: "2025-07-17",
};

/**
 * Get fallback methodologies with proper error context
 */
export function getFallbackMethodologies(): string[] {
  return METHODOLOGY_FALLBACK_CONFIG.methodologies;
}

/**
 * Get fallback configuration metadata
 */
export function getFallbackConfig(): MethodologyFallbackConfig {
  return METHODOLOGY_FALLBACK_CONFIG;
}
