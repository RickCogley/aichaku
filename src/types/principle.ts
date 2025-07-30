/**
 * Type definitions for the Aichaku principles system
 * @module
 */

/**
 * Represents a guiding principle or philosophy
 */
export interface Principle {
  // Metadata
  name: string;
  category: PrincipleCategory;
  description: string;
  aliases?: string[]; // Alternative names

  // Historical Context
  history: {
    origin: string; // When and where it originated
    originators: string[]; // Key figures
    evolution: string; // How it has evolved
    significance: string; // Why it matters
  };

  // Core content
  summary: {
    tagline: string; // One-line summary
    core_tenets: Array<{
      text: string;
      guidance: string;
    }>;
    anti_patterns: Array<{
      pattern: string;
      instead: string;
    }>;
    key_practices?: string[];
  };

  // Guidance
  guidance: {
    spirit: string; // The underlying philosophy
    questions_to_ask: string[]; // Self-check questions
    when_to_apply: string[];
    exceptions: string[];
    common_mistakes: string[];
  };

  // Examples
  examples: {
    good: Array<{
      description: string;
      code?: string;
      explanation: string;
    }>;
    bad: Array<{
      description: string;
      code?: string;
      problem: string;
    }>;
    real_world: Array<{
      project: string;
      description: string;
      link?: string;
    }>;
  };

  // Compatibility
  compatibility: {
    works_well_with: string[];
    potential_conflicts: string[];
    complements: string[];
  };

  // References
  references: {
    foundational: string[]; // Original texts/papers
    modern: string[]; // Contemporary interpretations
    tools: string[]; // Tools that embody the principle
  };
}

/**
 * Categories of principles
 */
export type PrincipleCategory =
  | "software-development"
  | "organizational"
  | "engineering"
  | "human-centered";

/**
 * Principle with associated documentation
 */
export interface PrincipleWithDocs {
  data: Principle;
  documentation: string; // Markdown content
  path: string; // File path
}

/**
 * Compatibility report between principles
 */
export interface CompatibilityReport {
  conflicts: Array<[string, string, string]>; // [principle1, principle2, reason]
  synergies: Array<[string, string]>; // [principle1, principle2]
  score: number; // 0-100 compatibility score
}

/**
 * Principle selection in configuration
 */
export interface PrincipleConfig {
  selected: string[]; // IDs of selected principles
  // Future: customization options
}

/**
 * Category metadata for display
 */
export interface CategoryInfo {
  id: PrincipleCategory;
  name: string;
  emoji: string;
  description: string;
}

/**
 * Standard category definitions
 */
export const PRINCIPLE_CATEGORIES: Record<PrincipleCategory, CategoryInfo> = {
  "software-development": {
    id: "software-development",
    name: "Software Development",
    emoji: "💻",
    description: "Programming philosophies and coding principles",
  },
  "organizational": {
    id: "organizational",
    name: "Organizational",
    emoji: "🏢",
    description: "Team and process principles",
  },
  "engineering": {
    id: "engineering",
    name: "Engineering",
    emoji: "⚙️",
    description: "Technical practices and engineering approaches",
  },
  "human-centered": {
    id: "human-centered",
    name: "Human-Centered",
    emoji: "👥",
    description: "User-focused and accessibility principles",
  },
};
