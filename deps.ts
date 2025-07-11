/**
 * External dependencies for Aichaku
 *
 * @module
 */

// File system operations
export { copy, ensureDir, exists, move, walk } from "jsr:@std/fs@^1.0.0";

// Path manipulation
export {
  basename,
  dirname,
  join,
  relative,
  resolve,
} from "jsr:@std/path@^1.0.0";

// Testing utilities
export {
  assert,
  assertEquals,
  assertExists,
  assertRejects,
} from "jsr:@std/assert@^1.0.0";

// CLI utilities - commented out for now
// export { Command } from "jsr:@cliffy/command@^0.25.0";
// export { confirm, prompt, select } from "jsr:@cliffy/prompt@^0.25.0";

// Formatting
export {
  blue,
  bold,
  cyan,
  gray,
  green,
  magenta,
  red,
  yellow,
} from "jsr:@std/fmt@^1.0.0/colors";
