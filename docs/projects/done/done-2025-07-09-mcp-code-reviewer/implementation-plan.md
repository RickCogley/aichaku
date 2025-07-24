# MCP Code Reviewer Implementation Plan

🪴 Aichaku: Step-by-Step Development Guide

## Phase 1: MCP Server Foundation (Week 1)

### 1.1 Project Setup

```bash
# Create MCP server project
mkdir mcp-code-reviewer
cd mcp-code-reviewer
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node
```

### 1.2 Basic MCP Server

```typescript
// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "mcp-code-reviewer",
  version: "1.0.0",
});

// Tools for code review
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "review_file",
      description: "Review a file for security, standards, and methodology compliance",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
          standards: { type: "array", items: { type: "string" } },
          context: {
            type: "string",
            description: "pre-write, pre-commit, etc.",
          },
        },
        required: ["path", "content"],
      },
    },
    {
      name: "review_project",
      description: "Review entire project against selected standards and methodologies",
      inputSchema: {
        type: "object",
        properties: {
          projectPath: { type: "string" },
        },
        required: ["projectPath"],
      },
    },
    {
      name: "list*active*standards",
      description: "Show which standards and methodologies are active",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "configure_standards",
      description: "Update project's selected standards",
      inputSchema: {
        type: "object",
        properties: {
          add: { type: "array", items: { type: "string" } },
          remove: { type: "array", items: { type: "string" } },
        },
      },
    },
  ],
}));
```

## Phase 2: Scanner Integration (Week 1-2)

### 2.1 Scanner Abstraction

```typescript
// src/scanners/base.ts
export interface ScanResult {
  tool: string;
  findings: Finding[];
  duration: number;
}

export interface Finding {
  severity: "critical" | "high" | "medium" | "low" | "info";
  rule: string;
  message: string;
  file: string;
  line: number;
  column?: number;
  suggestion?: string;
}

export abstract class Scanner {
  abstract name: string;
  abstract scan(filePath: string, content: string): Promise<ScanResult>;
}
```

### 2.2 DevSkim Integration

```typescript
// src/scanners/devskim.ts
import { exec } from "child_process";
import { promisify } from "util";

export class DevSkimScanner extends Scanner {
  name = "devskim";

  async scan(filePath: string, content: string): Promise<ScanResult> {
    const start = Date.now();
    const execAsync = promisify(exec);

    try {
      // Write content to temp file
      const tempFile = await this.writeTempFile(content, filePath);

      // Run DevSkim
      const { stdout } = await execAsync(`devskim analyze ${tempFile} -f json`);

      const results = JSON.parse(stdout);
      const findings = this.parseResults(results);

      return {
        tool: this.name,
        findings,
        duration: Date.now() - start,
      };
    } catch (error) {
      // Handle errors gracefully
      return { tool: this.name, findings: [], duration: Date.now() - start };
    }
  }
}
```

### 2.3 CodeQL Integration

```typescript
// src/scanners/codeql.ts
export class CodeQLScanner extends Scanner {
  name = "codeql";

  async scan(filePath: string, content: string): Promise<ScanResult> {
    // Similar pattern but with CodeQL-specific logic
    // Use local CodeQL database and queries
  }
}
```

## Phase 3: Standards & Methodology Engine (Week 2)

### 3.1 Unified Standards Manager

```typescript
// src/docs/standards/manager.ts
export class StandardsManager {
  private standards: Map<string, Standard> = new Map();
  private methodologies: Map<string, Methodology> = new Map();
  private globalMethodologiesPath = expandTilde("~/.claude/methodologies");

  async loadFromAichaku(projectPath: string): Promise<void> {
    const configPath = path.join(
      projectPath,
      ".claude",
      ".aichaku-standards.json",
    );
    const config = await fs.readJSON(configPath);

    // Load security/architecture standards
    for (const standardId of config.selected) {
      const standard = await this.loadStandard(standardId);
      this.standards.set(standardId, standard);
    }

    // Load methodologies
    const activeMethodologies = config.methodologies ||
      this.detectMethodologies(projectPath);
    for (const methodologyId of activeMethodologies) {
      const methodology = await this.loadMethodology(methodologyId);
      this.methodologies.set(methodologyId, methodology);
    }
  }

  private async loadMethodology(id: string): Promise<Methodology> {
    const guidePath = path.join(
      this.globalMethodologiesPath,
      id,
      `${id.toUpperCase()}-AICHAKU-GUIDE.md`,
    );

    const guideContent = await fs.readTextFile(guidePath);
    return new MethodologyChecker(id, guideContent);
  }

  getRulesForFile(filePath: string): Rule[] {
    const rules: Rule[] = [];

    // Security/standards rules
    for (const standard of this.standards.values()) {
      rules.push(...standard.getRulesForFile(filePath));
    }

    // Methodology rules
    for (const methodology of this.methodologies.values()) {
      rules.push(...methodology.getRulesForFile(filePath));
    }

    return rules;
  }
}
```

### 3.2 Methodology Implementation

```typescript
// src/methodologies/shape-up.ts
export class ShapeUpMethodology implements Methodology {
  id = "shape-up";

  rules: Rule[] = [
    {
      id: "appetite-boundaries",
      check: async (file, content, context) => {
        const findings: Finding[] = [];

        if (file.path.includes("pitch.md")) {
          // Check for appetite definition
          if (!content.match(/appetite:\s*(\d+)\s*weeks?/i)) {
            findings.push({
              severity: "medium",
              rule: "shape-up-appetite",
              message: "Pitch missing appetite definition",
              suggestion: 'Add "Appetite: 6 weeks" or "Appetite: 2 weeks"',
            });
          }

          // Check for required sections
          const required = [
            "problem",
            "appetite",
            "solution",
            "rabbit holes",
            "no-gos",
          ];
          const missing = required.filter((s) => !content.toLowerCase().includes(s));

          if (missing.length > 0) {
            findings.push({
              severity: "low",
              rule: "shape-up-structure",
              message: `Missing Shape Up sections: ${missing.join(", ")}`,
              suggestion: "Add all required pitch sections",
            });
          }
        }

        // Check for scope creep in active projects
        if (file.path.includes("/active-") && context?.projectAge > 42) {
          // 6 weeks
          findings.push({
            severity: "high",
            rule: "shape-up-timebound",
            message: "Project exceeding 6-week appetite",
            suggestion: "Complete or properly scope down",
          });
        }

        return findings;
      },
    },
  ];
}
```

### 3.3 OWASP Implementation

```typescript
// src/docs/standards/owasp.ts
export class OWASPStandard implements Standard {
  id = "owasp-web";

  rules: Rule[] = [
    {
      id: "A01-access-control",
      check: async (file, content) => {
        // Check for authorization bypasses
        const findings: Finding[] = [];

        // Example: Direct object references
        if (
          content.includes("req.params.id") && !content.includes("authorize")
        ) {
          findings.push({
            severity: "high",
            rule: "A01-2021",
            message: "Potential broken access control - verify authorization",
            file: file.path,
            line: file.getLineNumber("req.params.id"),
          });
        }

        return findings;
      },
    },
    // More OWASP rules...
  ];
}
```

## Phase 4: Review Engine (Week 2-3)

### 4.1 Review Orchestrator

```typescript
// src/review/engine.ts
export class ReviewEngine {
  constructor(
    private scanners: Scanner[],
    private standards: StandardsManager,
  ) {}

  async reviewFile(path: string, content: string): Promise<ReviewResult> {
    // Run scanners in parallel
    const scanPromises = this.scanners.map((s) => s.scan(path, content));
    const scanResults = await Promise.all(scanPromises);

    // Apply standards rules
    const standardFindings = await this.applyStandards(path, content);

    // Aggregate and deduplicate
    const allFindings = this.aggregateFindings([
      ...scanResults.flatMap((r) => r.findings),
      ...standardFindings,
    ]);

    // Prioritize by severity
    const prioritized = this.prioritizeFindings(allFindings);

    return {
      file: path,
      findings: prioritized,
      summary: this.generateSummary(prioritized),
    };
  }
}
```

### 4.2 Result Formatting

```typescript
// src/review/formatter.ts
export class ReviewFormatter {
  formatForMCP(result: ReviewResult): string {
    const output: string[] = [];

    // Summary
    output.push(`🔍 Code Review Results for ${result.file}`);
    output.push(`Found ${result.findings.length} issues\n`);

    // Group by severity
    const bySeverity = this.groupBySeverity(result.findings);

    for (const [severity, findings] of bySeverity) {
      output.push(
        `${this.getSeverityIcon(severity)} ${severity.toUpperCase()}`,
      );

      for (const finding of findings) {
        output.push(`  ${finding.file}:${finding.line} - ${finding.message}`);
        if (finding.suggestion) {
          output.push(`    💡 Suggestion: ${finding.suggestion}`);
        }
      }
    }

    return output.join("\n");
  }
}
```

## Phase 5: MCP Integration (Week 3)

### 5.1 Tool Handlers

```typescript
// src/handlers/review.ts
server.setRequestHandler("tools/run", async (request) => {
  if (request.params.name === "review_file") {
    const { path, content, standards } = request.params.arguments;

    // Load standards if specified
    if (standards) {
      await standardsManager.loadSpecific(standards);
    }

    // Run review
    const result = await reviewEngine.reviewFile(path, content);

    // Format response
    return {
      toolResult: formatter.formatForMCP(result),
    };
  }
});
```

### 5.2 Hook-Based Automation

```typescript
// Example hook configurations for automatic review

// 1. Review on file save
const saveHook = {
  name: "MCP Auto Review on Save",
  type: "PostToolUse",
  matcher: "Write|Edit|MultiEdit",
  command: "mcp-reviewer-hook --file '${TOOL*INPUT*FILE_PATH}' --action save",
};

// 2. Review before commit
const commitHook = {
  name: "MCP Pre-commit Review",
  type: "PreToolUse",
  matcher: "Bash(git commit)",
  command: "mcp-reviewer-hook --action pre-commit --check-staged",
};

// 3. Smart security-only review
const securityHook = {
  name: "MCP Security Focus",
  type: "PostToolUse",
  matcher: "Write|Edit",
  command:
    'bash -c \'case "${TOOL*INPUT*FILE*PATH}" in *.ts|*.js|*.py|*.go) mcp-reviewer-hook --file "${TOOL*INPUT*FILE*PATH}" --security-only ;; esac\'',
};
```

### 5.3 Configuration

```typescript
// src/config/loader.ts
export class ConfigLoader {
  static async load(): Promise<Config> {
    // Check multiple locations
    const locations = [
      path.join(process.env.HOME, ".config", "mcp-code-reviewer.json"),
      path.join(process.cwd(), ".mcp-code-reviewer.json"),
    ];

    for (const loc of locations) {
      if (await fs.pathExists(loc)) {
        return await fs.readJSON(loc);
      }
    }

    // Return defaults
    return {
      scanners: {
        devskim: { enabled: true },
        codeql: { enabled: false }, // Requires setup
        semgrep: { enabled: true },
      },
      review: {
        automatic: true,
        threshold: "medium",
      },
    };
  }
}
```

## Phase 6: Compilation & Distribution (Week 3-4)

### 6.1 Compilation Strategy

```bash
# Development mode (interpreted)
deno task dev

# Compile for distribution
deno task build

# Build script (scripts/build.ts)
import { build } from "https://deno.land/x/dnt/mod.ts";

// Multi-platform builds
const platforms = [
  { os: "darwin", arch: "x86_64" },
  { os: "darwin", arch: "aarch64" },
  { os: "linux", arch: "x86_64" },
  { os: "windows", arch: "x86_64" }
];

for (const platform of platforms) {
  await Deno.run({
    cmd: [
      "deno", "compile",
      "--allow-read",
      "--allow-write",
      "--allow-run",
      "--allow-env",
      "--target", `${platform.arch}-${platform.os}`,
      "--output", `dist/mcp-code-reviewer-${platform.os}-${platform.arch}`,
      "src/server.ts"
    ]
  }).status();
}
```

## Phase 7: Testing & Deployment (Week 4)

### 6.1 Test Suite

```typescript
// tests/review.test.ts
describe("Review Engine", () => {
  it("detects OWASP A01 violations", async () => {
    const content = `
      app.get('/user/:id', (req, res) => {
        const user = db.getUser(req.params.id);
        res.json(user);
      });
    `;

    const result = await engine.reviewFile("test.js", content);

    expect(result.findings).toContainEqual(
      expect.objectContaining({
        rule: "A01-2021",
        severity: "high",
      }),
    );
  });
});
```

### 7.2 Installation Script

```bash
#!/bin/bash
# install.sh

echo "🪴 Installing MCP Code Reviewer..."

# Detect platform
OS=$(uname -s)
ARCH=$(uname -m)

case "$OS-$ARCH" in
  Darwin-x86_64) BINARY="mcp-code-reviewer-macos-intel" ;;
  Darwin-arm64) BINARY="mcp-code-reviewer-macos-arm" ;;
  Linux-x86_64) BINARY="mcp-code-reviewer-linux" ;;
  *) echo "Unsupported platform"; exit 1 ;;
esac

# Download binary from GitHub releases
URL="https://github.com/aichaku/mcp-code-reviewer/releases/latest/download/$BINARY"
curl -fsSL "$URL" -o mcp-code-reviewer
chmod +x mcp-code-reviewer
sudo mv mcp-code-reviewer /usr/local/bin/

# Configure Claude Code
claude code config add-mcp mcp-code-reviewer

# Install hooks
echo "Installing automated review hooks..."
aichaku hooks --install mcp-review

echo "✅ MCP Code Reviewer installed!"
echo "🔒 Privacy: All reviews happen locally on your machine"
echo "💡 Optional: Install security tools for enhanced scanning:"
echo "   npm install -g @microsoft/devskim-cli"
echo "   brew install codeql"
echo "   pip install semgrep"
```

## Milestones & Deliverables

### Week 1

- [ ] Basic MCP server running
- [ ] DevSkim integration working
- [ ] Simple file review capability

### Week 2

- [ ] All scanners integrated
- [ ] Standards engine loading Aichaku config
- [ ] OWASP rules implemented

### Week 3

- [ ] Review engine complete
- [ ] MCP handlers polished
- [ ] Performance optimizations

### Week 4

- [ ] Comprehensive test suite
- [ ] Documentation complete
- [ ] Published to npm/JSR

## Success Metrics

1. **Performance**: Review completes in <5s for typical file
2. **Accuracy**: <5% false positive rate
3. **Coverage**: Detects 80%+ of OWASP Top 10 patterns
4. **Usability**: Zero-config for Aichaku users
5. **Reliability**: 99%+ uptime during coding sessions
