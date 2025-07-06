#!/usr/bin/env -S deno run -A
/**
 * Nagare launcher script for aichaku
 * This script ensures nagare runs with the correct configuration
 */

import { cli } from "@rcogley/nagare";

// Run nagare CLI with command line arguments
await cli();