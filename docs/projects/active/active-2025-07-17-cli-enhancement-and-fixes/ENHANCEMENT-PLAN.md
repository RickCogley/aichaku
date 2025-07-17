# CLI Enhancement Plan: Contextual Guidance and Visual Aids

## Project Overview

This document outlines the comprehensive enhancement plan for Aichaku CLI commands, focusing on providing exceptional user experience through contextual guidance and visual aids.

## Problem Statement

Current CLI commands often leave users wondering:
- "What exactly did this command do?"
- "Where were files created or modified?"
- "What should I do next?"
- "How do these changes affect my project?"

## Solution Framework

### **Enhanced Command Guidance Pattern**

Every change-making command will provide:

1. **"What did I do and where" Context**
2. **"What's next" Structured Guidance**
3. **Visual Diagrams** for spatial awareness

## Implementation Strategy

### **Phase 1: Critical Bug Fixes**

#### 1.1 Legacy File Elimination
- **Issue**: `RULES-REMINDER.md` still created by `init` command
- **Location**: `src/commands/init.ts` lines 307-308 and 586-615
- **Fix**: Remove `getRulesReminderContent()` function calls
- **Impact**: Complete legacy format elimination

#### 1.2 Help Screen Bypassing
- **Issue**: Commands execute instead of showing help with `--help`
- **Affected**: `upgrade`, `integrate`, `cleanup` commands
- **Fix**: Implement proper help flag handling
- **Impact**: Consistent CLI behavior

#### 1.3 Standards Command Verification
- **Issue**: `standards --remove` functionality untested
- **Fix**: Test and verify removal works correctly
- **Impact**: Complete standards management

### **Phase 2: Enhanced Contextual Guidance**

#### 2.1 Command Audit Matrix

| Command | Current State | Enhancement Needed |
|---------|---------------|-------------------|
| `aichaku init` | Basic success message | Location context, visual diagram |
| `aichaku init --global` | Minimal feedback | Installation location, next steps |
| `aichaku upgrade` | Version info only | What changed, where, impact |
| `aichaku integrate` | Simple completion | CLAUDE.md changes, methodology count |
| `aichaku standards --add` | Good next steps | File location, configuration view |
| `aichaku standards --remove` | Unknown | Similar to --add pattern |
| `aichaku mcp --install` | Basic install info | Server locations, configuration |

#### 2.2 Contextual Information Framework

**Location Awareness Pattern:**
```
🪴 Aichaku: [Action] completed!

📁 What was modified:
   [Exact file paths and changes]
   
📊 Impact:
   [Scope of changes - global vs project]
   
✅ What's next:
   1. [Immediate next step]
   2. [Related commands]
   3. [Verification steps]
```

#### 2.3 Visual Diagrams Implementation

**Directory Tree Diagrams:**
```
📁 Installation structure:
~/.claude/aichaku/
├── docs/methodologies/     (6 methodologies)
├── docs/standards/         (14 standards)  
├── user/                   (your customizations)
└── aichaku.json           (configuration)
```

**Before/After Views:**
```
Before:  📄 CLAUDE.md (basic)
After:   📄 CLAUDE.md (+ 6 methodologies, 14 standards)
```

**Process Flow Diagrams:**
```
🔄 Integration Process:
[Analyze] → [Discover] → [Generate] → [Update] → [Verify]
              ▲
           Current step
```

### **Phase 3: Command-Specific Enhancements**

#### 3.1 Init Command Enhancement
```
🪴 Aichaku: Project initialization complete!

📁 Created in your project:
.claude/aichaku/
├── aichaku.json           (project config)
├── user/                  (customizations)
└── docs/projects/         (document output)

🌐 Connected to global installation:
~/.claude/aichaku/         (6 methodologies, 14 standards)

✅ What's next:
1. Run 'aichaku integrate' to update CLAUDE.md
2. Try 'aichaku learn' to explore methodologies
3. Add standards: 'aichaku standards --add tdd,nist-csf'

💡 Your project now understands methodology keywords!
```

#### 3.2 Upgrade Command Enhancement
```
🪴 Aichaku: Upgrade complete!

📈 Version change:
   v0.32.0 → v0.33.0

📁 What was updated:
Global installation: ~/.claude/aichaku/
├── docs/methodologies/    (6 files updated)
├── docs/standards/        (14 files updated)
└── aichaku.json          (metadata updated)

Project configs: 
✅ .claude/aichaku/aichaku.json (metadata preserved)

🔄 Migration summary:
   • Standards configuration: Preserved
   • Custom methodologies: Preserved
   • User customizations: Preserved

✅ What's next:
1. Run 'aichaku integrate' to refresh CLAUDE.md
2. Test functionality: 'aichaku standards --show'
3. Explore new features: 'aichaku learn --new'

💡 All projects using this installation are now updated!
```

#### 3.3 Standards Command Enhancement
```
🪴 Aichaku: Standards updated!

📝 Added to project:
   • tdd: Test-Driven Development
   • nist-csf: NIST Cybersecurity Framework

📁 Configuration updated:
   .claude/aichaku/aichaku.json
   
📊 Your project now has:
   [██████████] 12 standards selected
   
   Security:    nist-csf, owasp-web
   Development: tdd, clean-arch, google-style
   Testing:     test-pyramid, bdd
   [... truncated for brevity]

✅ What's next:
1. Run 'aichaku integrate' to apply to CLAUDE.md
2. Verify selection: 'aichaku standards --show'
3. Learn more: 'aichaku learn tdd'

💡 Claude Code will now follow these standards in your project!
```

### **Phase 4: Visual Aid Library**

#### 4.1 ASCII Art Components
- Directory tree representations
- Progress indicators
- Process flow diagrams
- Before/after comparisons

#### 4.2 Icon System
- 🪴 Aichaku branding
- 📁 File/directory operations
- ✅ Success indicators
- 🔄 Process steps
- 💡 Helpful tips
- 📊 Data/statistics
- 🌐 Global operations
- 🏠 Project operations

## Technical Implementation

### **Enhanced Feedback Functions**

```typescript
// Enhanced feedback utility
class ContextualFeedback {
  static showCompletion(options: {
    action: string;
    location: string;
    impact: string;
    nextSteps: string[];
    diagram?: string;
  }): void {
    // Implementation for consistent feedback
  }
  
  static showDirectory(path: string, description: string): string {
    // Generate directory tree visualization
  }
  
  static showProgress(current: number, total: number, phase: string): string {
    // Generate progress indicators
  }
}
```

### **Integration Points**

- Update all command files to use contextual feedback
- Create shared utilities for diagram generation
- Implement consistent messaging patterns
- Add visual aid templates

## Success Metrics

### **User Experience Metrics**
- **Spatial Awareness**: Users know exactly where changes occurred
- **Confidence**: Clear understanding of what happened
- **Actionability**: Structured next steps for every operation
- **Visual Clarity**: Diagrams help understand file relationships

### **Technical Metrics**
- **Zero legacy files**: Complete elimination of outdated formats
- **100% help compliance**: All commands respect --help flag
- **Consistent patterns**: Unified guidance across all commands
- **Visual coverage**: All change-making commands have diagrams

## Timeline

### **Day 1: Critical Fixes**
- Remove RULES-REMINDER.md creation
- Fix help screen bypassing
- Test standards --remove functionality

### **Day 2: Contextual Guidance**
- Audit all change-making commands
- Implement enhanced feedback patterns
- Add visual diagrams

### **Day 3: Testing & Refinement**
- Comprehensive testing of all enhancements
- User experience validation
- Documentation updates

## Future Enhancements

### **Advanced Visual Aids**
- Interactive command previews
- Real-time configuration visualization
- Impact analysis diagrams

### **Smart Guidance**
- Context-aware next steps
- Personalized recommendations
- Integration with project state

---

This enhancement plan will transform the Aichaku CLI from a functional tool into an exceptional user experience that provides confidence, clarity, and actionable guidance at every step.