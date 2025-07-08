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
Lean Startup

Lean methodology focuses on validated learning:
- Build-Measure-Learn feedback loop
- Minimum Viable Product (MVP)
- Pivot or persevere decisions
- Innovation accounting

Key Concepts:
• MVP: Simplest version to test hypotheses
• Validated Learning: Test assumptions with data
• Pivot: Change strategy based on learning
• Innovation Accounting: Measure progress

Best For:
- Startups and new products
- High uncertainty environments
- Hypothesis-driven development

Not Ideal For:
- Well-defined requirements
- Regulatory compliance projects
- Infrastructure work

Quick Start:
Say "what's our hypothesis?" or "define the MVP"
`,

  "xp": `
Extreme Programming (XP)

XP emphasizes engineering excellence:
- Test-Driven Development (TDD)
- Pair programming
- Continuous integration
- Small releases

Key Concepts:
• TDD: Write tests first
• Pair Programming: Two developers, one computer
• Refactoring: Continuous code improvement
• Collective Code Ownership: Everyone owns the code

Best For:
- Teams focused on code quality
- Complex technical projects
- Experienced developers

Not Ideal For:
- Non-technical projects
- Distributed teams (for pairing)
- Quick prototypes

Quick Start:
Say "let's pair on this" or "write the test first"
`,

  "scrumban": `
Scrumban Hybrid

Scrumban combines Scrum structure with Kanban flow:
- Sprint planning from Scrum
- Continuous flow from Kanban
- WIP limits and pull system
- Optional ceremonies

Key Concepts:
• Planning on Demand: Plan when backlog is low
• Feature Freeze: Optional sprint boundaries
• Bucket Planning: Long, medium, short-term
• Flow Metrics: From Kanban

Best For:
- Teams transitioning between methods
- Mixed project types
- Flexible planning needs

Not Ideal For:
- Teams needing pure Scrum or Kanban
- Very small teams
- Highly regulated environments

Quick Start:
Say "plan with buckets" or "check flow metrics"
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
        .map(([key, meta], index) =>
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

📚 Quick Reference
  aichaku init          Initialize a project
  aichaku upgrade       Update to latest version  
  aichaku help          Show this help
  aichaku --version     Show version info

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
