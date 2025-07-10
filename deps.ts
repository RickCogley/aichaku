/**
 * External dependencies for Aichaku
 * 
 * @module
 */

// File system operations
export { ensureDir, exists, move, copy, walk } from "jsr:@std/fs@^1.0.0";

// Path manipulation
export { join, dirname, basename, resolve, relative } from "jsr:@std/path@^1.0.0";

// Testing utilities
export { assertEquals, assertExists, assertRejects, assert } from "jsr:@std/assert@^1.0.0";

// CLI utilities - commented out for now
// export { Command } from "jsr:@cliffy/command@^0.25.0";
// export { confirm, prompt, select } from "jsr:@cliffy/prompt@^0.25.0";

// Formatting
export { bold, green, red, yellow, blue, gray, cyan, magenta } from "jsr:@std/fmt@^1.0.0/colors";