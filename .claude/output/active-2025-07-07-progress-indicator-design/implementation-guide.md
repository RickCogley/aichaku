# Progress Indicator Implementation Guide

## Core Implementation Strategy

### 1. Progress Engine Module

```typescript
// src/progress/engine.ts
export interface ProgressEngine {
  calculate(data: ProgressData): ProgressMetrics;
  render(metrics: ProgressMetrics, style: RenderStyle): string;
  animate(metrics: ProgressMetrics): AsyncGenerator<string>;
}

export interface ProgressMetrics {
  percentage: number;
  phase: string;
  timeElapsed: number;
  timeRemaining: number;
  status: 'on-track' | 'at-risk' | 'blocked' | 'complete';
  milestones: Milestone[];
}

export type RenderStyle = 'ascii' | 'compact' | 'minimal' | 'dashboard';
```

### 2. Methodology-Specific Renderers

```typescript
// src/progress/renderers/shape-up.ts
export class ShapeUpRenderer implements MethodologyRenderer {
  private readonly phases = ['shaping', 'building', 'cool-down'];
  
  render(metrics: ProgressMetrics, style: RenderStyle): string {
    switch (style) {
      case 'ascii':
        return this.renderAsciiBox(metrics);
      case 'compact':
        return this.renderCompactLine(metrics);
      case 'minimal':
        return this.renderMinimal(metrics);
      default:
        return this.renderCompactLine(metrics);
    }
  }
  
  private renderAsciiBox(metrics: ProgressMetrics): string {
    const { phase, percentage, timeElapsed, status } = metrics;
    const week = Math.ceil(timeElapsed / 7);
    const totalWeeks = 6;
    
    return `
┌─ Shape Up: ${metrics.projectName} ─${'─'.repeat(40 - metrics.projectName.length)}┐
│                                                  │
│  Shaping     Building         Cool-down         │
│  ${this.renderPhaseBar('shaping', phase, metrics)}      ${this.renderPhaseBar('building', phase, metrics)}       ${this.renderPhaseBar('cool-down', phase, metrics)}       │
│                                                  │
│  📍 You are here: ${phase} (${percentage}% complete)        │
│                                                  │
│  Appetite: ${totalWeeks} weeks | Elapsed: ${week} weeks        │
│  Status: ${this.getStatusDisplay(status)}                             │
└──────────────────────────────────────────────────┘`;
  }
  
  private renderPhaseBar(phaseName: string, currentPhase: string, metrics: ProgressMetrics): string {
    if (phaseName === currentPhase) {
      const filled = Math.floor(metrics.percentage / 10);
      return `[${█'.repeat(filled)}${'░'.repeat(10 - filled)}]`;
    } else if (this.phases.indexOf(phaseName) < this.phases.indexOf(currentPhase)) {
      return '[████]';
    } else {
      return '[        ]';
    }
  }
}
```

### 3. STATUS.md Integration

```typescript
// src/progress/status-integration.ts
export class StatusFileIntegration {
  private readonly MARKER_START = '<!-- AICHAKU:PROGRESS:START -->';
  private readonly MARKER_END = '<!-- AICHAKU:PROGRESS:END -->';
  
  async updateProgress(filePath: string, progress: ProgressData): Promise<void> {
    const content = await Deno.readTextFile(filePath);
    const updatedContent = this.injectProgress(content, progress);
    await Deno.writeTextFile(filePath, updatedContent);
  }
  
  private injectProgress(content: string, progress: ProgressData): string {
    const renderer = this.getRenderer(progress.methodology);
    const metrics = this.calculateMetrics(progress);
    const visual = renderer.render(metrics, 'compact');
    
    const progressBlock = `
${this.MARKER_START}
Methodology: ${progress.methodology}
Phase: ${progress.phase}
Progress: ${metrics.percentage}%
Status: ${metrics.status}

Visual:
${visual}
${this.MARKER_END}`;
    
    // Replace existing block or insert after ## Progress header
    if (content.includes(this.MARKER_START)) {
      return content.replace(
        /<!-- AICHAKU:PROGRESS:START -->[\s\S]*<!-- AICHAKU:PROGRESS:END -->/,
        progressBlock
      );
    } else {
      return content.replace(
        /## Progress\n/,
        `## Progress\n${progressBlock}\n`
      );
    }
  }
}
```

### 4. CLI Commands

```typescript
// src/commands/progress.ts
export class ProgressCommand implements Command {
  async execute(args: string[]): Promise<void> {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'show':
        await this.showProgress(args.slice(1));
        break;
      case 'update':
        await this.updateProgress(args.slice(1));
        break;
      case 'dashboard':
        await this.showDashboard();
        break;
      default:
        await this.showCurrentProgress();
    }
  }
  
  private async showCurrentProgress(): Promise<void> {
    const projects = await this.findActiveProjects();
    
    for (const project of projects) {
      const progress = await this.loadProgress(project);
      const renderer = this.getRenderer(progress.methodology);
      const output = renderer.render(progress, 'compact');
      console.log(output);
    }
  }
  
  private async showDashboard(): Promise<void> {
    const projects = await this.findActiveProjects();
    
    console.log(`
╔══════════════════════════════════════════════════╗
║           Aichaku Project Status                 ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Active Projects: ${projects.length}                              ║
║                                                  ║`);
    
    for (const [index, project] of projects.entries()) {
      const progress = await this.loadProgress(project);
      const renderer = this.getRenderer(progress.methodology);
      const output = renderer.render(progress, 'minimal');
      
      console.log(`║  ${index + 1}. ${project.name} (${progress.methodology})                      ║`);
      console.log(`║     ${output}             ║`);
      console.log(`║                                                  ║`);
    }
    
    console.log(`╚══════════════════════════════════════════════════╝`);
  }
}
```

### 5. Animation Support

```typescript
// src/progress/animation.ts
export class ProgressAnimator {
  private readonly spinners = {
    'shape-up': ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    'scrum': ['◐', '◓', '◑', '◒'],
    'kanban': ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'],
    'lean': ['?', '!', '→', '✓'],
    'xp': ['🔴', '🟢', '♻️']
  };
  
  async *animate(
    progress: ProgressData,
    message: string
  ): AsyncGenerator<string> {
    const spinner = this.spinners[progress.methodology] || this.spinners['shape-up'];
    let frame = 0;
    
    while (true) {
      const spin = spinner[frame % spinner.length];
      const renderer = this.getRenderer(progress.methodology);
      const bar = renderer.render(progress, 'minimal');
      
      yield `${spin} ${bar} ${message}`;
      
      frame++;
      await this.sleep(100);
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 6. Color Support Detection

```typescript
// src/progress/color.ts
export class ColorSupport {
  private supportsColor: boolean;
  
  constructor() {
    this.supportsColor = this.detectColorSupport();
  }
  
  private detectColorSupport(): boolean {
    // Check for NO_COLOR env var
    if (Deno.env.get('NO_COLOR')) return false;
    
    // Check for FORCE_COLOR
    if (Deno.env.get('FORCE_COLOR')) return true;
    
    // Check if running in TTY
    if (!Deno.isatty(Deno.stdout.rid)) return false;
    
    // Check TERM env var
    const term = Deno.env.get('TERM');
    if (!term || term === 'dumb') return false;
    
    return true;
  }
  
  color(text: string, color: 'green' | 'yellow' | 'red' | 'cyan'): string {
    if (!this.supportsColor) return text;
    
    const colors = {
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m'
    };
    
    return `${colors[color]}${text}${colors.reset}`;
  }
}
```

## Integration Points

### 1. With Existing Commands

```typescript
// Update src/commands/init.ts
async execute() {
  // ... existing init logic ...
  
  // Initialize progress tracking
  const progress = new ProgressData({
    methodology: detectedMethodology,
    phase: 'planning',
    percentage: 0,
    status: 'on-track'
  });
  
  await this.statusIntegration.createInitialStatus(projectPath, progress);
}
```

### 2. With Methodology Detection

```typescript
// Update methodology detection to include progress hints
export function detectMethodology(input: string): MethodologyInfo {
  const info = existingDetection(input);
  
  // Add progress-related hints
  if (input.includes('week') && info.methodology === 'shape-up') {
    info.progressHint = {
      unit: 'weeks',
      total: 6,
      phases: ['shaping', 'building', 'cool-down']
    };
  } else if (input.includes('sprint') && info.methodology === 'scrum') {
    info.progressHint = {
      unit: 'days',
      total: 10, // Assuming 2-week sprints
      phases: ['planning', 'execution', 'review']
    };
  }
  
  return info;
}
```

### 3. With Settings System

```typescript
// Add to settings.local.json structure
{
  "progress": {
    "style": "ascii",  // or "compact", "minimal"
    "autoUpdate": true,
    "showInStatus": true,
    "animations": false  // Claude Code doesn't support well
  }
}
```

## Testing Strategy

```typescript
// src/progress/progress_test.ts
Deno.test("Shape Up progress calculation", () => {
  const progress = new ProgressData({
    methodology: 'shape-up',
    phase: 'building',
    startDate: new Date('2025-01-01'),
    currentDate: new Date('2025-01-22'), // 3 weeks later
  });
  
  const metrics = engine.calculate(progress);
  
  assertEquals(metrics.percentage, 50); // 3 weeks of 6
  assertEquals(metrics.phase, 'building');
  assertEquals(metrics.status, 'on-track');
});

Deno.test("Progress bar rendering", () => {
  const metrics = {
    percentage: 60,
    phase: 'building',
    status: 'on-track'
  };
  
  const output = renderer.render(metrics, 'minimal');
  
  assertStringIncludes(output, '██████░░░░');
  assertStringIncludes(output, '60%');
});

Deno.test("STATUS.md integration", async () => {
  const tempFile = await Deno.makeTempFile();
  await Deno.writeTextFile(tempFile, "# Status\n\n## Progress\n\n## Details");
  
  await statusIntegration.updateProgress(tempFile, progressData);
  
  const content = await Deno.readTextFile(tempFile);
  assertStringIncludes(content, '<!-- AICHAKU:PROGRESS:START -->');
  assertStringIncludes(content, 'Visual:');
});
```

## Performance Considerations

1. **Caching**: Cache progress calculations for 1 minute
2. **Lazy Loading**: Only load renderers when needed
3. **Minimal File I/O**: Batch STATUS.md updates
4. **No Animations in CI**: Detect CI environment and disable

## Security Considerations

1. **Path Validation**: Ensure STATUS.md paths are within project
2. **Content Sanitization**: Escape user input in progress displays
3. **No External Calls**: All progress calculation is local
4. **File Permissions**: Respect existing file permissions

## Rollout Plan

### Phase 1: Core Engine (Week 1)
- Progress calculation engine
- Basic ASCII renderers
- STATUS.md integration

### Phase 2: Methodology Support (Week 2)
- Shape Up renderer
- Scrum renderer
- Kanban renderer
- Lean & XP renderers

### Phase 3: CLI Integration (Week 3)
- Progress command
- Dashboard view
- Settings integration
- Auto-update hooks

### Phase 4: Polish (Week 4)
- Color support
- Animations (where supported)
- Performance optimization
- Documentation

## Example Usage After Implementation

```bash
# Show progress for current directory
$ aichaku progress
Shape Up [Building ████████░░░░] Week 3.5/6 - auth-system

# Update progress
$ aichaku progress update --week 4
✓ Progress updated to Week 4/6 (67%)

# Show all projects dashboard
$ aichaku progress dashboard
╔══════════════════════════════════════════════════╗
║           Aichaku Project Status                 ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Active Projects: 3                              ║
║                                                  ║
║  1. auth-system (Shape Up)                       ║
║     [████████████░░░░░░] Week 4/6               ║
║                                                  ║
║  2. sprint-15 (Scrum)                           ║
║     [██████░░░░░░░░░░░] Day 6/10               ║
║                                                  ║
║  3. support-flow (Kanban)                       ║
║     [Ready:5|Doing:2*|Review:1] Normal          ║
║                                                  ║
╚══════════════════════════════════════════════════╝

# Auto-update STATUS.md on work completion
$ aichaku complete building
✓ Phase complete! Moving to cool-down
✓ STATUS.md updated with progress
```