/**
 * App Description Management Command
 *
 * Allows users to create, validate, and view their application description
 * that provides Claude Code with rich context about their specific app.
 */

import { ensureDir, exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { parse } from "jsr:@std/yaml@1";
import { copy } from "jsr:@std/fs@1/copy";
// Unused imports removed - formatting is done through BaseFormatter
import { VERSION } from "../../mod.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { Brand } from "../utils/branded-messages.ts";
import { safeReadTextFile } from "../utils/path-security.ts";
import { BaseFormatter } from "../formatters/base-formatter.ts";

interface AppDescriptionOptions {
  init?: boolean;
  validate?: boolean;
  show?: boolean;
  help?: boolean;
  projectPath?: string;
  silent?: boolean;
  type?: string;
}

interface AppDescriptionResult {
  success: boolean;
  message?: string;
  action?: "created" | "validated" | "shown" | "error";
}

// Dummy type for BaseFormatter - app-description doesn't use the item-based methods
interface AppDescriptionItem {
  id: string;
  name: string;
  description: string;
  category?: string;
}

/**
 * Formatter for app description command output
 */
class AppDescriptionFormatter extends BaseFormatter<AppDescriptionItem> {
  formatList(_items: AppDescriptionItem[]): string {
    // Not used for app-description
    return "";
  }

  formatDetails(_item: AppDescriptionItem, _verbose?: boolean): string {
    // Not used for app-description
    return "";
  }

  formatCurrent(_selected: string[]): string {
    // Not used for app-description
    return "";
  }

  formatAppTypeSelection(): string {
    const lines: string[] = [];
    lines.push(this.formatHeader("Application Type Selection"));
    lines.push(this.addEmptyLine());
    lines.push("What type of application is this?");
    lines.push(this.addEmptyLine());
    lines.push(this.formatItem("1. Web Application (React, Vue, etc.)"));
    lines.push(this.formatItem("2. API Service (REST, GraphQL, microservice)"));
    lines.push(this.formatItem("3. Static Site (Blog, docs, marketing)"));
    lines.push(this.formatItem("4. CLI Tool (Command line application)"));
    lines.push(this.formatItem("5. General/Other"));
    return this.buildOutput(lines);
  }

  formatNextSteps(): string {
    const lines: string[] = [];
    lines.push(this.addEmptyLine());
    lines.push(this.formatSection("📝 Next steps"));
    lines.push(this.formatItem("Edit .claude/aichaku/user/app-description.yaml"));
    lines.push(this.formatItem("Run 'aichaku integrate' to update CLAUDE.md"));
    lines.push(this.formatItem("Use 'aichaku app-description --validate' to check syntax"));
    return this.buildOutput(lines);
  }

  formatShowDescription(content: string): string {
    const lines: string[] = [];
    lines.push(this.formatHeader("Current App Description"));
    lines.push(this.addEmptyLine());
    lines.push(this.formatSeparator());
    lines.push(content);
    lines.push(this.formatSeparator());
    lines.push(this.addEmptyLine());
    lines.push(this.formatSection("💡 Tips"));
    lines.push(this.formatItem("To edit: .claude/aichaku/user/app-description.yaml"));
    lines.push(this.formatItem("To apply: aichaku integrate"));
    return this.buildOutput(lines);
  }
}

// Create singleton formatter instance
const formatter = new AppDescriptionFormatter();

/**
 * Manage application description for Claude Code context
 */
export async function appDescription(options: AppDescriptionOptions = {}): Promise<AppDescriptionResult> {
  const projectPath = resolveProjectPath(options.projectPath);

  const userDir = join(projectPath, ".claude", "aichaku", "user");
  const appDescPath = join(userDir, "app-description.yaml");

  // Handle explicit actions first
  if (options.validate) {
    return await validateAppDescription(appDescPath, projectPath, options);
  }

  if (options.show) {
    return await showAppDescription(appDescPath, projectPath, options);
  }

  // Default to init if no action specified
  if (!options.init && !options.validate && !options.show) {
    options.init = true;
  }

  // Default: init
  return await initAppDescription(userDir, appDescPath, options);
}

async function initAppDescription(
  userDir: string,
  appDescPath: string,
  options: AppDescriptionOptions,
): Promise<AppDescriptionResult> {
  // Check if already exists
  if (await exists(appDescPath)) {
    return {
      success: false,
      message: "🪴 Aichaku: App description already exists. Edit the existing file or delete it first.",
      action: "error",
    };
  }

  // Ensure user directory exists
  await ensureDir(userDir);

  // Determine template type
  const templateType = options.type || await promptForAppType(options.silent);
  const templateName = templateType === "base" ? "base" : templateType;

  try {
    if (!options.silent) {
      Brand.progress("Creating app description template...", "active");
    }

    // Check if running from JSR or local
    // codeql[js/incomplete-url-substring-sanitization] Safe because import.meta.url is trusted
    const isJSR = import.meta.url.startsWith("https://jsr.io") ||
      !import.meta.url.includes("/aichaku/");

    if (isJSR) {
      // Fetch template from GitHub
      const templateUrl =
        `https://raw.githubusercontent.com/RickCogley/aichaku/v${VERSION}/docs/core/templates/app-descriptions/${templateName}-template.yaml`;

      try {
        const response = await fetch(templateUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        const templateContent = await response.text();
        await Deno.writeTextFile(appDescPath, templateContent);
      } catch {
        // Fallback to basic template if fetch fails
        await Deno.writeTextFile(appDescPath, getBasicTemplate());
        if (!options.silent) {
          Brand.warning("Using basic template (network fetch failed)");
        }
      }
    } else {
      // Local development - copy from source
      const sourceTemplate = join(
        new URL(".", import.meta.url).pathname,
        "../../../docs/core/templates/app-descriptions",
        `${templateName}-template.yaml`,
      );

      try {
        await copy(sourceTemplate, appDescPath);
      } catch {
        // Fallback to basic template if file not found
        await Deno.writeTextFile(appDescPath, getBasicTemplate());
      }
    }

    if (!options.silent) {
      Brand.success(`Created app-description.yaml (${templateType} template)`);
      console.log(formatter.formatNextSteps());
    }

    return {
      success: true,
      message: "App description template created",
      action: "created",
    };
  } catch (error) {
    return {
      success: false,
      message: Brand.errorWithSolution(
        "Failed to create app description",
        error instanceof Error ? error.message : String(error),
      ),
      action: "error",
    };
  }
}

async function validateAppDescription(
  appDescPath: string,
  projectPath: string,
  options: AppDescriptionOptions,
): Promise<AppDescriptionResult> {
  if (!(await exists(appDescPath))) {
    return {
      success: false,
      message: "🪴 Aichaku: No app description found. Run 'aichaku app-description init' first.",
      action: "error",
    };
  }

  try {
    const content = await safeReadTextFile(appDescPath, projectPath);
    const parsed = parse(content) as Record<string, unknown>;

    // Basic validation
    const errors: string[] = [];

    if (!parsed.application || typeof parsed.application !== "object") {
      errors.push("Missing 'application' root key");
    } else {
      const app = parsed.application as Record<string, unknown>;
      if (!app.name) {
        errors.push("Missing required field: application.name");
      }
      if (!app.type) {
        errors.push("Missing required field: application.type");
      }
      if (!app.description) {
        errors.push("Missing required field: application.description");
      }

      // Validate type
      const validTypes = ["web-application", "api-service", "cli-tool", "mobile-app", "desktop-app", "library"];
      if (app.type && typeof app.type === "string" && !validTypes.includes(app.type)) {
        errors.push(`Invalid application.type: ${app.type}. Must be one of: ${validTypes.join(", ")}`);
      }
    }

    if (errors.length > 0) {
      if (!options.silent) {
        Brand.error("Validation failed:");
        errors.forEach((err) => {
          console.log(`  ❌ ${err}`);
        });
      }
      return {
        success: false,
        message: `Validation failed with ${errors.length} error(s)`,
        action: "validated",
      };
    }

    if (!options.silent) {
      Brand.success("App description is valid!");
    }

    return {
      success: true,
      message: "App description validated successfully",
      action: "validated",
    };
  } catch (error) {
    return {
      success: false,
      message: Brand.errorWithSolution(
        "Failed to validate app description",
        error instanceof Error ? error.message : String(error),
      ),
      action: "error",
    };
  }
}

async function showAppDescription(
  appDescPath: string,
  projectPath: string,
  options: AppDescriptionOptions,
): Promise<AppDescriptionResult> {
  if (!(await exists(appDescPath))) {
    return {
      success: false,
      message: "🪴 Aichaku: No app description found. Run 'aichaku app-description init' first.",
      action: "error",
    };
  }

  try {
    const content = await safeReadTextFile(appDescPath, projectPath);

    if (!options.silent) {
      console.log(formatter.formatShowDescription(content));
    }

    return {
      success: true,
      message: "App description displayed",
      action: "shown",
    };
  } catch (error) {
    return {
      success: false,
      message: Brand.errorWithSolution(
        "Failed to read app description",
        error instanceof Error ? error.message : String(error),
      ),
      action: "error",
    };
  }
}

async function promptForAppType(silent?: boolean): Promise<string> {
  if (silent) return "base";

  console.log(formatter.formatAppTypeSelection());
  console.log("\n[1-5, default=5]: ");

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  const choice = new TextDecoder().decode(buf.subarray(0, n || 0)).trim();

  const typeMap: Record<string, string> = {
    "1": "web-app",
    "2": "api-service",
    "3": "static-site",
    "4": "cli-tool",
    "5": "base",
  };

  return typeMap[choice] || "base";
}

function getBasicTemplate(): string {
  return `# Aichaku App Description
# This file helps Claude Code understand your specific application context

application:
  name: "My Application"
  type: "web-application" # web-application, api-service, cli-tool, mobile-app, desktop-app, library
  description: "Brief description of what this application does"
  version: "1.0.0"
  
  stack:
    language: "typescript"
    runtime: "node"
    framework: "express"
    
  architecture:
    pattern: "monolith"
    
  security:
    standards: ["owasp-web"]
`;
}
