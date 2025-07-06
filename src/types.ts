/**
 * Type definitions for aichaku
 *
 * @module
 */

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
