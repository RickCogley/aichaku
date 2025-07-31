/**
 * Simple argument parser for common command options
 */

import type { CommandOptions } from "../types/command.ts";

export function parseCommonArgs(args: any): CommandOptions {
  // Handle the --show quirk
  let showValue: boolean | string | undefined = args.show;

  // When --show is followed by a value, parseArgs puts the value in _
  if (showValue === "" && args._.length > 1) {
    showValue = args._[1] as string;
  } else if (showValue === "") {
    // Bare --show with no value
    showValue = true;
  }

  return {
    list: args.list as boolean | undefined,
    show: showValue,
    add: Array.isArray(args.add) ? args.add.join(",") : args.add as string | undefined,
    remove: Array.isArray(args.remove) ? args.remove.join(",") : args.remove as string | undefined,
    search: Array.isArray(args.search) ? args.search[0] : args.search as string | undefined,
    current: args.current as boolean | undefined,
    projectPath: args.path as string | undefined,
    dryRun: args["dry-run"] as boolean | undefined,
    verbose: args.verbose as boolean | undefined,
    categories: args.categories as boolean | undefined,
    createCustom: args["create-custom"] as string | undefined,
    set: Array.isArray(args.set) ? args.set.join(",") : args.set as string | undefined,
    reset: args.reset as boolean | undefined,
  };
}
