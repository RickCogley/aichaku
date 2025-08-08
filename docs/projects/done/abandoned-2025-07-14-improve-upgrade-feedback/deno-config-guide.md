# Deno App Configuration and Metadata Guide

This guide shows you how to implement configuration and metadata management for Deno/TypeScript applications, covering
both development and installed application scenarios.

## Overview

Application configuration involves two distinct scenarios:

1. **Development configuration**: Project metadata and build-time settings
2. **User configuration**: Runtime settings for installed applications

Think of this like the difference between an architect's blueprint (development) and how each homeowner arranges their
furniture (user configuration).

## Development Configuration

### Set Up Project Metadata

Create a `deno.json` file in your project root to define project metadata and tooling configuration:

```json
{
  "name": "@myorg/app-name",
  "version": "1.0.0",
  "exports": "./mod.ts",
  "tasks": {
    "dev": "deno run --allow-net --allow-env --watch main.ts",
    "test": "deno test --allow-read",
    "build": "deno compile --allow-net --allow-env main.ts"
  },
  "imports": {
    "@std/": "https://deno.land/std@0.210.0/",
    "@config/": "./config/"
  },
  "compilerOptions": {
    "strict": true,
    "jsx": "react"
  }
}
```

### Create a Configuration Schema

Define and validate your configuration structure using TypeScript and runtime validation:

```typescript
// config/schema.ts
import { z } from "https://deno.land/x/zod/mod.ts";

export const ConfigSchema = z.object({
  app: z.object({
    port: z.string().regex(/^\d+$/),
    environment: z.enum(["development", "staging", "production"]),
  }),
  database: z.object({
    url: z.string().url(),
    poolSize: z.number().min(1).max(100).default(10),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;
```

### Implement Layered Configuration

Build your configuration from multiple sources with clear precedence:

```typescript
// config/loader.ts
export async function loadConfig(): Promise<Config> {
  // Start with defaults
  let config = getDefaultConfig();

  // Layer in config files (if they exist)
  try {
    const fileConfig = await Deno.readTextFile("./config.json");
    config = { ...config, ...JSON.parse(fileConfig) };
  } catch {
    // File is optional
  }

  // Override with environment variables (highest priority)
  config = mergeWithEnvVars(config);

  // Validate the final result
  return ConfigSchema.parse(config);
}
```

### Handle Secrets Securely

Never log sensitive values and keep secrets separate from regular configuration:

```typescript
// config/secrets.ts
export class SecretManager {
  private secrets = new Map<string, string>();

  async loadFromEnv() {
    const dbPassword = Deno.env.get("DB_PASSWORD");
    if (dbPassword) {
      this.secrets.set("db.password", dbPassword);
      console.log("✓ Database password loaded"); // Don't log the value
    }
  }

  get(key: string): string | undefined {
    return this.secrets.get(key);
  }
}
```

## User Configuration for Installed Applications

### Determine Configuration Paths

Follow platform conventions for configuration file locations:

```typescript
// config/paths.ts
import { join } from "@std/path/mod.ts";

export function getConfigDir(): string {
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");

  // Follow XDG Base Directory spec on Unix-like systems
  const xdgConfig = Deno.env.get("XDG*CONFIG*HOME");
  if (xdgConfig) return join(xdgConfig, "theapp");

  // Platform-specific defaults
  switch (Deno.build.os) {
    case "darwin":
      return join(home!, "Library", "Application Support", "theapp");
    case "windows":
      return join(Deno.env.get("APPDATA")!, "theapp");
    default: // linux, etc
      return join(home!, ".config", "theapp");
  }
}

export function getDataDir(): string {
  const xdgData = Deno.env.get("XDG*DATA*HOME");
  if (xdgData) return join(xdgData, "theapp");

  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");

  switch (Deno.build.os) {
    case "darwin":
      return join(home!, "Library", "Application Support", "theapp", "data");
    case "windows":
      return join(Deno.env.get("LOCALAPPDATA")!, "theapp");
    default:
      return join(home!, ".local", "share", "theapp");
  }
}
```

### Structure User Configuration

Organize configuration files by purpose:

```
~/.config/theapp/
├── config.json         # User preferences
├── credentials.json    # Encrypted sensitive data
└── profiles/          # Multiple configuration profiles
    ├── default.json
    └── work.json

~/.local/share/theapp/
├── cache/             # Temporary data
├── logs/              # Application logs
└── data.db            # User data
```

### Implement Configuration Manager

Create a manager class to handle loading, saving, and migrating user configuration:

```typescript
// config/user-config.ts
interface UserConfig {
  version: string;
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    autoUpdate: boolean;
  };
  features: {
    telemetry: boolean;
    experimental: boolean;
  };
  lastUsed: {
    profile?: string;
    workspace?: string;
  };
}

export class UserConfigManager {
  private configPath: string;
  private config: UserConfig;

  constructor() {
    this.configPath = join(getConfigDir(), "config.json");
    this.config = this.getDefaults();
  }

  private getDefaults(): UserConfig {
    return {
      version: "1.0",
      preferences: {
        theme: "auto",
        language: "en",
        autoUpdate: true,
      },
      features: {
        telemetry: false, // Privacy by default
        experimental: false,
      },
      lastUsed: {},
    };
  }

  async load(): Promise<void> {
    try {
      const data = await Deno.readTextFile(this.configPath);
      const loaded = JSON.parse(data);

      // Merge with defaults to handle missing fields
      this.config = { ...this.getDefaults(), ...loaded };

      // Handle version migrations
      await this.migrate();
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
      // First run - create config
      await this.save();
    }
  }

  async save(): Promise<void> {
    await Deno.mkdir(getConfigDir(), { recursive: true });
    await Deno.writeTextFile(
      this.configPath,
      JSON.stringify(this.config, null, 2),
    );
  }

  get(): UserConfig {
    return this.config;
  }

  set(updates: Partial<UserConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
```

### Handle First Run

Create a smooth first-run experience that sets up the user's configuration:

```typescript
// app/first-run.ts
export async function handleFirstRun() {
  const configDir = getConfigDir();

  // Check if this is first run
  try {
    await Deno.stat(join(configDir, ".initialized"));
    return; // Already initialized
  } catch {
    // Continue with first run setup
  }

  console.log("Welcome to TheApp! Setting up your configuration...");

  // Create directory structure
  const dirs = [
    configDir,
    join(configDir, "profiles"),
    getDataDir(),
    join(getDataDir(), "cache"),
    join(getDataDir(), "logs"),
  ];

  for (const dir of dirs) {
    await Deno.mkdir(dir, { recursive: true });
  }

  // Initialize with defaults
  const config = new UserConfigManager();
  await config.load(); // Creates default config

  // Mark as initialized
  await Deno.writeTextFile(
    join(configDir, ".initialized"),
    new Date().toISOString(),
  );
}
```

### Implement Configuration Migrations

Handle configuration schema changes between versions:

```typescript
// config/migrations.ts
type MigrationFn = (config: any) => any;

const migrations: Record<string, MigrationFn> = {
  "0.0": (cfg) => ({
    ...cfg,
    version: "1.0",
    preferences: {
      theme: cfg.darkMode ? "dark" : "light",
      ...cfg.preferences,
    },
  }),
  "1.0": (cfg) => ({
    ...cfg,
    version: "1.1",
    features: {
      telemetry: false,
      ...cfg.features,
    },
  }),
};

export async function migrateConfig(config: any): Promise<UserConfig> {
  let current = config;
  const currentVersion = current.version || "0.0";

  // Apply migrations sequentially
  for (const [fromVersion, migrate] of Object.entries(migrations)) {
    if (currentVersion <= fromVersion) {
      current = migrate(current);
      console.log(`Migrated config from ${fromVersion} to ${current.version}`);
    }
  }

  return current;
}
```

### Define Configuration Precedence

Implement a clear precedence order for configuration sources:

```typescript
// config/complete-config.ts
export async function loadCompleteConfig() {
  // 1. Built-in defaults (lowest priority)
  let config = getAppDefaults();

  // 2. System-wide config (if exists)
  try {
    const systemConfig = await Deno.readTextFile("/etc/theapp/config.json");
    config = { ...config, ...JSON.parse(systemConfig) };
  } catch {
    // System config is optional
  }

  // 3. User config (higher priority)
  const userConfig = new UserConfigManager();
  await userConfig.load();
  config = { ...config, ...userConfig.get() };

  // 4. Environment variables (higher priority)
  config = mergeEnvOverrides(config);

  // 5. Command-line flags (highest priority)
  config = mergeCLIFlags(config, Deno.args);

  return validateConfig(config);
}
```

## Configuration Flow Diagram

```
Application Startup
        │
        ▼
┌─────────────────┐
│ First Run Check │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Exists? │
    └────┬────┘
         │
     No  │  Yes
    ┌────┴────┐
    ▼         ▼
┌──────────────────┐    ┌────────────────┐
│ Create Dirs      │    │ Load Config    │
│ Init Defaults    │    │ Apply Layers   │
└──────────────────┘    └────────────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Run App with │
            │ Final Config │
            └──────────────┘
```

## Best Practices Summary

### Do

- Follow platform conventions for file locations
- Validate configuration at startup
- Provide sensible defaults
- Support configuration layers with clear precedence
- Handle migrations between versions
- Keep secrets separate and secure
- Create configuration directories recursively

### Don't

- Log sensitive configuration values
- Hardcode paths or values
- Mix user data with configuration
- Assume configuration files exist
- Skip validation
- Store unencrypted sensitive data

## Testing Configuration

Create tests for your configuration system:

```typescript
// config/config.test.ts
Deno.test("loads default configuration", async () => {
  const config = new UserConfigManager();
  await config.load();

  assertEquals(config.get().preferences.theme, "auto");
  assertEquals(config.get().features.telemetry, false);
});

Deno.test("merges environment variables correctly", async () => {
  Deno.env.set("APP_PORT", "3000");

  const config = await loadCompleteConfig();
  assertEquals(config.app.port, "3000");

  Deno.env.delete("APP_PORT");
});

Deno.test("handles config migration", async () => {
  const oldConfig = { darkMode: true, version: "0.0" };
  const migrated = await migrateConfig(oldConfig);

  assertEquals(migrated.version, "1.1");
  assertEquals(migrated.preferences.theme, "dark");
});
```

## Troubleshooting

### Common Issues

**Configuration not loading**: Check file permissions and ensure directories exist.

**Migration failures**: Always backup user configuration before migrations.

**Cross-platform paths**: Test on all target platforms, especially Windows.

**Permission errors**: Request appropriate Deno permissions (--allow-read, --allow-write, --allow-env).

## Further Reading

- [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)
- [Deno Configuration Documentation](https://deno.land/manual/getting*started/configuration*file)
- [Application Configuration Best Practices](https://12factor.net/config)
