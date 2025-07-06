#!/usr/bin/env deno run -A

/**
 * Nagare launcher - Local context wrapper that bypasses CLI
 * This solves the JSR remote import limitation
 */

// Import the CLI function and types we need
import { cli } from "@rick/nagare/cli";
import type { NagareConfig as _NagareConfig } from "@rick/nagare/types";

// Import config locally (this works because we're in local context)
import config from "./nagare.config.ts";

// Define a more specific type for global with import
interface GlobalWithImport {
  import: (specifier: string) => Promise<unknown>;
}

// Store original import function
const g = globalThis as unknown as GlobalWithImport;
const originalImport = g.import;

// Override the import function to intercept config loads
g.import = function (specifier: string): Promise<unknown> {
  // Intercept attempts to import config files
  if (
    specifier.includes("nagare.config") ||
    specifier.includes("release.config") ||
    specifier.includes(".nagarerc")
  ) {
    // Return our pre-loaded config
    return Promise.resolve({ default: config });
  }
  // Otherwise use original import
  return originalImport.call(this, specifier);
};

// Now run the CLI normally - it will use our intercepted import
await cli(Deno.args);
