# Consistent Aichaku Branding

## Problem

The `aichaku init` command output lacks the distinctive 🪴 Aichaku branding that appears in other parts of the system. This is particularly important because:

- It's often the first screen new users see
- It sets the tone for the entire experience
- Brand consistency builds trust and recognition
- The current output feels generic

Current output:
```
🔍 Checking requirements...
✓ Global Aichaku found (v0.28.0)
```

Should be:
```
🪴 Aichaku: Setting up your adaptive methodology system...
✓ Global installation found (v0.28.0)
```

## Appetite

1 week - This is a small but high-impact improvement that affects every user's first impression.

## Solution

Create a centralized branding system that makes it effortless for any script or command to maintain consistent branding.

### Architectural Approach

Instead of manually adding branding to each command, create a branded messaging module:

```typescript
// src/utils/branded-messages.ts
export class AichakuBrand {
  static readonly EMOJI = "🪴";
  static readonly NAME = "Aichaku";
  
  // Branded console methods
  static log(message: string): void {
    console.log(`${this.EMOJI} ${this.NAME}: ${message}`);
  }
  
  static error(message: string): void {
    console.error(`${this.EMOJI} ${this.NAME}: ${message}`);
  }
  
  static success(message: string): void {
    console.log(`✅ ${message}`);
  }
  
  static progress(message: string, phase?: GrowthPhase): void {
    const emoji = phase ? this.getPhaseEmoji(phase) : "🌿";
    console.log(`${emoji} ${message}`);
  }
  
  // Branded message templates
  static welcome(version: string): string {
    return `${this.EMOJI} ${this.NAME}: Setting up your adaptive methodology system...`;
  }
  
  static upgrading(fromVersion: string, toVersion: string): string {
    return `${this.EMOJI} ${this.NAME}: Growing from v${fromVersion} to v${toVersion}...`;
  }
}

// Usage becomes trivial:
import { AichakuBrand as Brand } from "./utils/branded-messages.ts";

Brand.log("Setting up your project...");
Brand.success("Project initialized!");
Brand.error("Oops! Let me help you fix this...");
```

This approach ensures:
1. **Zero effort** - Developers just use Brand.log() instead of console.log()
2. **Consistency** - Branding is automatic, not manual
3. **Maintainability** - Change branding in one place
4. **Extensibility** - Easy to add new message types

### Branding Guidelines

- **Primary**: `🪴 Aichaku:` prefix for major operations
- **Secondary**: Use growth phases where appropriate (🌱→🌿→🌳→🍃)
- **Tone**: Friendly, adaptive, growing with you
- **Consistency**: Same format across all commands

### CLI Messaging Standards

Following established CLI UX principles and Google's documentation approach:

#### 1. **Clarity** (Google Style)
```typescript
// ❌ Bad: Vague
Brand.log("Processing...");

// ✅ Good: Specific
Brand.log("Fetching methodologies from GitHub...");
```

#### 2. **User-Focused** (Google Style)
```typescript
// ❌ Bad: Technical
Brand.error("ENOENT: stat() failed on path");

// ✅ Good: Helpful
Brand.error("Can't find that file. Did you mean 'init' instead of 'upgrade'?");
```

#### 3. **Progressive Disclosure** (CLI Best Practice)
```typescript
// Default: Essential info only
Brand.log("Upgraded to v0.29.0");

// Verbose: Additional context
Brand.log("Upgraded to v0.29.0 (31 files updated, 2.3s)");

// Debug: Full details
Brand.debug("Upgraded to v0.29.0\n  Files: 31 updated, 0 failed\n  Time: 2.3s\n  From: v0.28.0");
```

#### 4. **Actionable Errors** (12-Factor CLI Apps)
```typescript
// ❌ Bad: Dead end
Brand.error("Permission denied");

// ✅ Good: Next steps
Brand.error("Permission denied. Try:\n  sudo aichaku init --global\n  or check file ownership");
```

#### 5. **Consistent Voice** (Content Strategy)
- **Active voice**: "Creating project..." not "Project is being created..."
- **Present tense**: "Create" not "Created" for ongoing actions
- **You/Your**: "Your project is ready" not "The project is ready"

### Examples

```typescript
// Init command
console.log("🪴 Aichaku: Setting up your adaptive methodology system...");

// Upgrade command  
console.log("🪴 Aichaku: Growing to v0.29.0...");

// Help command
console.log("🪴 Aichaku: Here's how I can help you grow...");

// Error handling
console.error("🪴 Aichaku: Oops! Let me help you fix this...");
```

## Rabbit Holes

- **Not** redesigning the entire CLI output
- **Not** adding ASCII art or complex visuals
- **Not** changing command functionality
- **Not** creating a brand guide (just fixing inconsistency)

## No-gos

- Breaking existing scripts that parse output
- Overusing emojis (keep it tasteful)
- Making output harder to read
- Adding delays for "brand experience"

## Implementation Benefits

### For Developers
- **Drop-in replacement** - Just change `console.log` to `Brand.log`
- **Type safety** - TypeScript ensures correct usage
- **No learning curve** - Familiar console API
- **Automatic compliance** - Can't forget branding

### For Users
- **Consistent experience** - Every interaction feels cohesive
- **Clear source** - Always know messages are from Aichaku
- **Professional feel** - Polished, thoughtful interface

## Standards References

### Established CLI Guidelines We'll Follow

1. **Command Line Interface Guidelines** (by Aanand Prasad & contributors)
   - Be human-friendly
   - Make errors helpful
   - Use color purposefully
   - Support --quiet and --verbose

2. **12-Factor CLI Apps** (Heroku)
   - Explicit error codes
   - Machine-parseable output options
   - Respect environment variables
   - Clean separation of concerns

3. **Google Developer Documentation Style Guide**
   - Write for the user, not the system
   - Use present tense
   - Be concise but complete
   - Include examples

4. **Microsoft's Command-Line Syntax Standards**
   - Consistent parameter naming
   - Clear help text
   - Predictable behavior

### Message Categories and Standards

```typescript
interface MessageStandards {
  // Informational - What's happening
  info: {
    tone: "neutral, present tense",
    example: "Checking requirements..."
  },
  
  // Success - Task completed
  success: {
    tone: "positive, past tense", 
    example: "✅ Project initialized!"
  },
  
  // Warning - Attention needed
  warning: {
    tone: "cautious, actionable",
    example: "⚠️  Old version detected. Run 'upgrade' to update."
  },
  
  // Error - Task failed
  error: {
    tone: "helpful, solution-oriented",
    example: "❌ Can't write to directory. Check permissions or use sudo."
  },
  
  // Progress - Ongoing work
  progress: {
    tone: "active, specific",
    example: "📦 Downloading methodology files... (22/31)"
  }
}
```

## Migration Strategy

1. Create the branded-messages module with standards built-in
2. Create a style guide document for contributors
3. Add a lint rule to flag direct console.log usage
4. Gradually migrate existing commands
5. Set up automated testing for message standards

## Nice-to-haves

- Colored output for better visibility (if terminal supports it)
- Contextual messages based on methodology being used
- Celebration messages for milestones (first init, 10th project, etc.)
- Brand consistency in generated documentation
- Integration with existing terminal-formatter.ts
- Branded progress bars and spinners