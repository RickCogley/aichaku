/**
 * Type definitions for aichaku
 *
 * @module
 */

// Test comment for hook testing - edited to trigger hooks

/**
 * Represents a project methodology that can be installed by aichaku
 *
 * @public
 */
export interface Methodology {
  /** The unique identifier name of the methodology (e.g., "shape-up") */
  name: string;
  /** Human-readable description of what the methodology provides */
  description: string;
  /** Version string following semantic versioning */
  version: string;
  /** Optional author or organization that created the methodology */
  author?: string;
  /** Structure defining what components this methodology includes */
  structure: {
    /** Whether the methodology includes AI command templates */
    commands?: boolean;
    /** Whether the methodology includes method descriptions */
    methods?: boolean;
    /** Whether the methodology includes persona definitions */
    personas?: boolean;
    /** Whether the methodology includes document templates */
    templates?: boolean;
    /** Whether the methodology includes helper scripts */
    scripts?: boolean;
  };
}

/**
 * Options for installing a methodology
 *
 * @public
 */
export interface InstallOptions {
  /** Install globally to ~/.claude */
  global?: boolean;
  /** Project path for local installation */
  projectPath?: string;
  /** Force overwrite existing files */
  force?: boolean;
  /** Create symlinks instead of copying */
  symlink?: boolean;
  /** Silent mode - no console output */
  silent?: boolean;
}

/**
 * Result returned after installing a methodology
 *
 * @public
 */
export interface InstallResult {
  /** Whether the installation succeeded */
  success: boolean;
  /** The absolute path where the methodology was installed */
  path: string;
  /** The name of the methodology that was installed */
  methodology: string;
  /** Optional error or success message */
  message?: string;
}

/**
 * Result returned when listing available and installed methodologies
 *
 * @public
 */
export interface ListResult {
  /** Array of all available methodologies that can be installed */
  available: Methodology[];
  /** Currently installed methodologies by scope */
  installed: {
    /** Methodologies installed globally in ~/.claude */
    global: Methodology[];
    /** Methodologies installed in the current project */
    local: Methodology[];
  };
}

/**
 * Represents a documentation standard that can be applied to projects
 *
 * @public
 */
export interface DocumentationStandard {
  /** The unique identifier of the documentation standard */
  id: string;
  /** Human-readable name of the documentation standard */
  name: string;
  /** Description of what the documentation standard provides */
  description: string;
  /** Tags for categorizing and searching the standard */
  tags: string[];
  /** Available templates in this documentation standard */
  templates: string[];
}

/**
 * Configuration for documentation standards in a project
 *
 * @public
 */
export interface DocumentationStandardConfig {
  /** Version of the configuration format */
  version: string;
  /** List of selected documentation standard IDs */
  selected: string[];
  /** Custom documentation standards defined by the user */
  customStandards?: Record<string, {
    name: string;
    description: string;
    path: string;
    tags: string[];
  }>;
}

/**
 * Represents a Claude Code hook configuration
 *
 * @public
 */
export interface HookConfig {
  /** Optional matcher pattern for tool-specific hooks */
  matcher?: string;
  /** Array of hook commands to execute */
  hooks: Array<{
    /** Hook type (always "command" for now) */
    type: string;
    /** Command to execute */
    command: string;
  }>;
}

/**
 * Claude Code settings structure with hooks
 *
 * @public
 */
export interface ClaudeSettings {
  /** Hook configurations by event type */
  hooks?: {
    [eventType: string]: HookConfig[];
  };
  /** Other Claude Code settings */
  [key: string]: unknown;
}

/**
 * Hook template definition for Aichaku hooks
 *
 * @public
 */
export interface HookTemplate {
  /** Display name of the hook */
  name: string;
  /** Description of what the hook does */
  description: string;
  /** Event type when the hook runs */
  type: string;
  /** Optional tool matcher pattern */
  matcher?: string;
  /** Source of the hook (always "aichaku" for our hooks) */
  source: string;
  /** Command to execute */
  command: string;
}
