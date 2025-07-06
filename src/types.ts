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
  name: string;
  description: string;
  version: string;
  author?: string;
  structure: {
    commands?: boolean;
    methods?: boolean;
    personas?: boolean;
    templates?: boolean;
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
  success: boolean;
  path: string;
  methodology: string;
  message?: string;
}

/**
 * Result returned when listing available and installed methodologies
 *
 * @public
 */
export interface ListResult {
  available: Methodology[];
  installed: {
    global: Methodology[];
    local: Methodology[];
  };
}
