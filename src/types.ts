/**
 * Type definitions for aichaku
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

export interface InstallResult {
  success: boolean;
  path: string;
  methodology: string;
  message?: string;
}

export interface ListResult {
  available: Methodology[];
  installed: {
    global: Methodology[];
    local: Methodology[];
  };
}