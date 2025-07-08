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
  },
  "scrum": {
    name: "Scrum",
    icon: "🏃",
    summary: "Sprint-based agile framework with ceremonies",
    keyIdea: "2-4 week sprints with daily standups",
  },
  "kanban": {
    name: "Kanban",
    icon: "📋",
    summary: "Visual workflow management with WIP limits",
    keyIdea: "Continuous flow with pull-based work",
  },
  "lean": {
    name: "Lean",
    icon: "🚀",
    summary: "Build-measure-learn for rapid validation",
    keyIdea: "MVP focus and hypothesis testing",
  },
  "xp": {
    name: "Extreme Programming",
    icon: "💻",
    summary: "Engineering practices for quality code",
    keyIdea: "TDD, pair programming, continuous integration",
  },
  "scrumban": {
    name: "Scrumban",
    icon: "🔄",
    summary: "Hybrid of Scrum structure with Kanban flow",
    keyIdea: "Sprint planning with continuous delivery",
  },
};

// Help content for each methodology
const HELP_CONTENT: Record<string, string> = {
  "shape-up": `
Shape Up Methodology

Shape Up is Basecamp's product development methodology that emphasizes:
- Fixed time periods (6 weeks) with variable scope
- Shaping work before committing to it
- Betting on projects instead of estimating
- Cool-down periods between cycles

Key Concepts:
• Appetite: How much time you want to spend
• Shaping: Defining the problem and rough solution
• Betting: Choosing what to work on
• Circuit Breaker: Hard stop at 6 weeks

Best For:
- Product teams building new features
- Teams that want clear boundaries
- Projects with flexibility in scope

Not Ideal For:
- Maintenance work or bug fixes
- Teams needing daily coordination
- Strict deadline projects

Quick Start:
Say "let's shape a new feature" or "what's our appetite for this?"
`,

  "scrum": `
Scrum Framework

Scrum is an agile framework for managing product development:
- Fixed-length iterations called Sprints (2-4 weeks)
- Defined roles: Product Owner, Scrum Master, Development Team
- Regular ceremonies for planning and reflection
- Empirical process control through transparency

Key Concepts:
• Sprint: Time-boxed iteration
• Product Backlog: Prioritized list of features
• Sprint Planning: Selecting work for the sprint
• Daily Scrum: 15-minute synchronization
• Sprint Review & Retrospective: Inspect and adapt

Best For:
- Teams needing regular delivery cadence
- Projects with changing requirements
- Cross-functional collaboration

Not Ideal For:
- Solo developers
- Exploratory research projects
- Continuous flow operations

Quick Start:
Say "let's plan our sprint" or "time for standup"
`,

  "kanban": `
Kanban Method

Kanban visualizes work and optimizes flow:
- Visual board showing work states
- Work-in-Progress (WIP) limits
- Pull-based system
- Continuous delivery

Key Concepts:
• Kanban Board: Visual representation of workflow
• WIP Limits: Maximum items in each state
• Flow Metrics: Lead time, cycle time
• Pull System: Take work when ready

Best For:
- Operations and maintenance teams
- Continuous delivery environments
- Teams with varying work types

Not Ideal For:
- Fixed deadline projects
- Teams needing synchronized work
- Large batch releases

Quick Start:
Say "show our kanban board" or "check WIP limits"
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
        .map(([_key, meta]) =>
          `  ${meta.icon} ${meta.name.padEnd(20)} - ${meta.summary}`
        )
        .join("\n");

      return {
        success: true,
        content:
          `Available Methodologies:\n\n${list}\n\nUse 'aichaku help <methodology>' for detailed information.`,
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
      const methodology = options.methodology.toLowerCase();
      const content = HELP_CONTENT[methodology];

      if (!content) {
        return {
          success: false,
          message:
            `Unknown methodology: ${options.methodology}. Use 'aichaku help --list' to see available options.`,
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
      content: `Aichaku Help System

Learn about available methodologies and how to use them with Claude Code.

Usage:
  aichaku help [methodology]     Show detailed help for a methodology
  aichaku help --list           List all available methodologies  
  aichaku help --compare        Show comparison table

Examples:
  aichaku help shape-up         Learn about Shape Up methodology
  aichaku help scrum           Learn about Scrum framework
  aichaku help --list          See all methodologies
  aichaku help --compare       Compare methodologies side-by-side

Methodologies adapt to your language. Just start talking naturally!`,
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
