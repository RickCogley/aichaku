/**
 * Help command for displaying methodology information
 */

interface HelpOptions {
  methodology?: string;
  list?: boolean;
  compare?: boolean;
  silent?: boolean;
}

interface HelpResult {
  success: boolean;
  message?: string;
  content?: string;
}

// Methodology metadata
const METHODOLOGIES = {
  "shape-up": {
    name: "Shape Up",
    icon: "🎯",
    summary: "Fixed time, variable scope - for teams building new features",
    keyIdea: "6-week cycles with betting and shaping",
    triggers: ["shape", "appetite", "bet", "pitch"],
  },
  "scrum": {
    name: "Scrum",
    icon: "🏃",
    summary: "Sprint-based agile framework with ceremonies",
    keyIdea: "2-4 week sprints with daily standups",
    triggers: ["sprint", "standup", "retrospective", "backlog"],
  },
  "kanban": {
    name: "Kanban",
    icon: "📋",
    summary: "Visual workflow management with WIP limits",
    keyIdea: "Continuous flow with pull-based work",
    triggers: ["kanban board", "WIP", "flow", "pull"],
  },
  "lean": {
    name: "Lean",
    icon: "🚀",
    summary: "Build-measure-learn for rapid validation",
    keyIdea: "MVP focus and hypothesis testing",
    triggers: ["MVP", "hypothesis", "validate", "pivot"],
  },
  "xp": {
    name: "Extreme Programming",
    icon: "💻",
    summary: "Engineering practices for quality code",
    keyIdea: "TDD, pair programming, continuous integration",
    triggers: ["pair", "TDD", "test first", "refactor"],
  },
  "scrumban": {
    name: "Scrumban",
    icon: "🔄",
    summary: "Hybrid of Scrum structure with Kanban flow",
    keyIdea: "Sprint planning with continuous delivery",
    triggers: ["bucket", "ready queue", "flow metrics"],
  },
};

// Normalize methodology name for lookup
function normalizeMethodologyName(name: string): string | undefined {
  // Check if it's a number
  const num = parseInt(name);
  if (!isNaN(num) && num >= 1 && num <= Object.keys(METHODOLOGIES).length) {
    return Object.keys(METHODOLOGIES)[num - 1];
  }

  const normalized = name.toLowerCase().replace(/[\s-_]/g, "");

  // Direct matches
  const directMatches: Record<string, string> = {
    "shapeup": "shape-up",
    "extremeprogramming": "xp",
    "extreme": "xp",
    "programming": "xp",
  };

  if (directMatches[normalized]) {
    return directMatches[normalized];
  }

  // Check if it matches any key directly
  for (const key of Object.keys(METHODOLOGIES)) {
    if (key.replace(/-/g, "") === normalized) {
      return key;
    }
  }

  // Check if it matches any display name
  for (const [key, meta] of Object.entries(METHODOLOGIES)) {
    if (meta.name.toLowerCase().replace(/[\s-_]/g, "") === normalized) {
      return key;
    }
  }

  return undefined;
}

// Help content for each methodology
const HELP_CONTENT: Record<string, string> = {
  "shape-up": `
🎯 Shape Up Methodology
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Shape Up is Basecamp's product development methodology that emphasizes
fixed time periods with variable scope. Perfect for product teams!

📊 The Basics
  • 6-week cycles (no extensions!)
  • 2-week cooldown between cycles
  • Shaping before building
  • Betting on projects, not estimating

🎯 Key Concepts
  • Appetite → How much time are we willing to spend?
  • Shaping → Define problem + rough solution upfront
  • Betting → Choose what to work on (and what not to)
  • Circuit Breaker → Hard stop at 6 weeks, no exceptions

📈 Shape Up Cycle
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │   Shaping   │→ │   Betting   │→ │   Building  │
  │  (ongoing)  │  │  (1 week)   │  │  (6 weeks)  │
  └─────────────┘  └─────────────┘  └─────────────┘
                                     ↓
  ┌─────────────┐                   ┌─────────────┐
  │  Cool-down  │←──────────────────│   Ship It!  │
  │  (2 weeks)  │                   │             │
  └─────────────┘                   └─────────────┘

✅ Best For
  • Product teams building new features
  • Teams that want clear time boundaries
  • Projects where scope can be flexible

❌ Not Ideal For
  • Maintenance work or bug fixes
  • Teams needing daily coordination
  • Projects with strict feature requirements

💡 Quick Start with Claude Code
  You: "Let's shape a new feature for user profiles"
  You: "What's our appetite for this?"
  You: "Time to bet on next cycle's work"

📚 Learn More: https://basecamp.com/shapeup
`,

  "scrum": `
🏃 Scrum Framework
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

The world's most popular agile framework. Sprint your way to success
with time-boxed iterations and regular team ceremonies.

📊 The Basics
  • 2-4 week Sprints (fixed length)
  • 3 roles: Product Owner, Scrum Master, Dev Team
  • 5 ceremonies that keep you on track
  • Deliver working software every Sprint

🏃 Key Ceremonies
  • Sprint Planning → What will we build this Sprint?
  • Daily Scrum → 15-min sync (aka standup)
  • Sprint Review → Demo what we built
  • Sprint Retrospective → How can we improve?
  • Backlog Refinement → Keep stories ready

🔄 Scrum Flow
  Product      Sprint       Sprint        Daily
  Backlog  →  Planning  →  Backlog   →  Development
     ↑                                        ↓
     ↑                                    Increment
     ↑                                        ↓
  Retrospective  ←  Sprint Review  ←  Sprint End

✅ Best For
  • Teams wanting predictable delivery
  • Projects with evolving requirements
  • Cross-functional collaboration
  • Regular stakeholder feedback

❌ Not Ideal For
  • Solo developers
  • Pure research projects
  • Continuous deployment environments

💡 Quick Start with Claude Code
  You: "Let's plan our next sprint"
  You: "Time for our daily standup"
  You: "Create a sprint retrospective"

📚 Learn More: https://scrum.org
`,

  "kanban": `
📋 Kanban Method
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Visualize your work, limit work in progress, and maximize flow.
Perfect for teams that need flexibility and continuous delivery.

📊 The Basics
  • Visual board with columns for each state
  • WIP limits prevent overload
  • Pull work when you have capacity
  • Measure and optimize flow

📋 Key Practices
  • Visualize → See all work on the board
  • Limit WIP → Don't start what you can't finish
  • Manage Flow → Track cycle time & throughput
  • Make Policies Explicit → Clear rules for all
  • Improve Collaboratively → Evolve together

📊 Kanban Board Example
  ┌─────────┬─────────┬─────────┬─────────┬─────────┐
  │ Backlog │  To Do  │  Doing  │ Review  │  Done   │
  ├─────────┼─────────┼─────────┼─────────┼─────────┤
  │ Story A │ Story C │ Story E │ Story G │ Story I │
  │ Story B │ Story D │ Story F │ Story H │ Story J │
  │   ...   │ [WIP:3] │ [WIP:2] │ [WIP:1] │   ...   │
  └─────────┴─────────┴─────────┴─────────┴─────────┘
            ← Pull when capacity available →

✅ Best For
  • Support & maintenance teams
  • Continuous delivery environments
  • Teams with unpredictable work
  • Mixed types of work (features, bugs, ops)

❌ Not Ideal For
  • Fixed deadline projects
  • Teams needing synchronized releases
  • Heavy upfront planning needs

💡 Quick Start with Claude Code
  You: "Show our kanban board"
  You: "What's our WIP limit for testing?"
  You: "Track cycle time for this feature"

📚 Learn More: https://kanban.university
`,

  "lean": `
🚀 Lean Startup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Move fast and learn faster. Build MVPs, test hypotheses, and 
pivot based on real customer feedback. Perfect for startups!

📊 The Basics
  • Build-Measure-Learn cycle
  • Minimum Viable Product (MVP)
  • Validated learning over opinions
  • Pivot or persevere decisions

🔄 The Lean Cycle
  ┌─────────┐
  │  BUILD  │ → Create MVP
  └────┬────┘
       ↓
  ┌─────────┐
  │ MEASURE │ → Collect Data
  └────┬────┘
       ↓
  ┌─────────┐
  │  LEARN  │ → Validate/Invalidate
  └────┬────┘
       ↓
    Pivot or
   Persevere?

✅ Best For
  • Startups and new products
  • High uncertainty environments  
  • Hypothesis-driven development
  • Fast iteration needs

❌ Not Ideal For
  • Well-defined requirements
  • Regulatory compliance projects
  • Infrastructure work
  • Risk-averse environments

💡 Quick Start with Claude Code
  You: "What's our riskiest assumption?"
  You: "Define an MVP to test this"
  You: "Create metrics for validation"

📚 Learn More: http://theleanstartup.com
`,

  "xp": `
💻 Extreme Programming (XP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Engineering excellence through disciplined practices. Write tests
first, pair program, and deliver quality code continuously.

📊 The Basics
  • Test-Driven Development (TDD)
  • Pair programming sessions
  • Continuous integration
  • Small, frequent releases

🔧 XP Practices
  ┌─────────────┐     ┌─────────────┐
  │ Write Test  │ → │ Test Fails  │
  └─────────────┘     └──────┬──────┘
         ↑                    ↓
  ┌─────────────┐     ┌─────────────┐
  │  Refactor   │ ← │ Test Passes │
  └─────────────┘     └─────────────┘
        TDD Cycle

  👥 Pair Programming = Driver + Navigator

✅ Best For
  • Teams prioritizing code quality
  • Complex technical challenges
  • Experienced developers
  • Safety-critical systems

❌ Not Ideal For
  • Non-technical projects
  • Distributed teams (pairing is hard)
  • Quick prototypes
  • Solo developers

💡 Quick Start with Claude Code
  You: "Let's pair on this feature"
  You: "Write the test first"
  You: "Time to refactor this code"

📚 Learn More: http://www.extremeprogramming.org
`,

  "scrumban": `
🔄 Scrumban Hybrid
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

The best of both worlds! Combine Scrum's structure with Kanban's
flow. Perfect for teams wanting flexibility with some ceremonies.

📊 The Basics
  • Planning on demand (not fixed sprints)
  • WIP limits from Kanban
  • Optional Scrum ceremonies
  • Flow metrics and forecasting

🔀 Scrumban Flow
  ┌─────────────┐
  │   Backlog   │ → Prioritized work
  └──────┬──────┘
         ↓ Planning Trigger
  ┌─────────────┬─────────────┬─────────────┐
  │   To Do     │    Doing    │    Done     │
  │  [WIP: 5]   │  [WIP: 3]   │             │
  └─────────────┴─────────────┴─────────────┘
         ← Pull when ready →

  📊 Bucket Planning: 1yr → 6mo → 3mo → Ready

✅ Best For
  • Teams transitioning methodologies
  • Mixed work types (planned + reactive)
  • Flexible planning needs
  • Evolutionary improvement

❌ Not Ideal For
  • Teams needing pure Scrum/Kanban
  • Very small teams (< 3 people)
  • Highly regulated environments
  • Fixed release schedules

💡 Quick Start with Claude Code
  You: "Set up our bucket planning"
  You: "What triggers planning?"
  You: "Show flow metrics"

📚 Learn More: https://scrumban.org
`,
};

/**
 * Display methodology help information
 */
export function help(options: HelpOptions = {}): HelpResult {
  try {
    // List all methodologies
    if (options.list) {
      const list = Object.entries(METHODOLOGIES)
        .map(([_key, meta], index) =>
          `  ${index + 1}. ${meta.icon} ${
            meta.name.padEnd(18)
          } - ${meta.summary}`
        )
        .join("\n");

      const methodNames = Object.entries(METHODOLOGIES)
        .map(([key, meta]) => `"${meta.name.toLowerCase()}", "${key}"`)
        .join(", ");

      return {
        success: true,
        content:
          `Available Methodologies:\n\n${list}\n\n📝 Get help using:\n  • Number: aichaku help 1\n  • Name: aichaku help "shape up"\n  • Code: aichaku help shape-up\n\n✨ All names work: ${methodNames}`,
      };
    }

    // Compare methodologies
    if (options.compare) {
      const comparison = `Methodology Comparison:

┌─────────────────┬──────────────────┬─────────────────┬──────────────────┐
│ Methodology     │ Cadence          │ Best For        │ Key Practice     │
├─────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ Shape Up        │ 6-week cycles    │ New features    │ Shaping & betting│
│ Scrum           │ 2-4 week sprints │ Regular delivery│ Daily standups   │
│ Kanban          │ Continuous       │ Flow work       │ WIP limits       │
│ Lean            │ Iterative        │ Validation      │ MVP testing      │
│ XP              │ 1-2 week iter.   │ Code quality    │ TDD & pairing    │
│ Scrumban        │ Flexible         │ Hybrid teams    │ Pull planning    │
└─────────────────┴──────────────────┴─────────────────┴──────────────────┘`;

      return {
        success: true,
        content: comparison,
      };
    }

    // Show specific methodology help
    if (options.methodology) {
      const normalizedName = normalizeMethodologyName(options.methodology);

      if (!normalizedName) {
        return {
          success: false,
          message:
            `Unknown methodology: ${options.methodology}. Use 'aichaku help --list' to see available options.`,
        };
      }

      const content = HELP_CONTENT[normalizedName];
      if (!content) {
        return {
          success: false,
          message: `No detailed help available for ${options.methodology} yet.`,
        };
      }

      return {
        success: true,
        content: content.trim(),
      };
    }

    // Default help about the help command
    return {
      success: true,
      content: `🪴 Aichaku - Adaptive Methodology Support
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the methodology help system. Learn how methodologies
work with Claude Code and adapt to your natural language.

🎯 Methodology Help
  aichaku help shape up     Learn about Shape Up
  aichaku help scrum        Learn about Scrum
  aichaku help --list       See all methodologies
  aichaku help --compare    Compare methodologies

💡 How It Works with Claude Code
  Say "let's shape a feature"    → Activates Shape Up mode
  Say "plan our sprint"          → Uses Scrum practices  
  Say "show the kanban board"    → Displays work tracking
  Say "write tests first"        → Applies XP principles

✨ Natural language triggers adapt methodologies to how you work!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Looking for CLI commands and options?
   Run 'aichaku --help' to see all available commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Docs: https://github.com/RickCogley/aichaku`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Help command failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
