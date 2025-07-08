// Help Content Structure Design

interface MethodologyHelp {
  name: string;
  emoji: string;
  tagline: string;
  overview: string;
  keyConcepts: string[];
  bestFor: string[];
  notIdealFor: string[];
  aichakuImplementation: string[];
  quickStart: {
    description: string;
    examples: string[];
  };
  learnMorePrompt: string;
}

// Example content for each methodology:

const kanbanHelp: MethodologyHelp = {
  name: "Kanban",
  emoji: "📊",
  tagline: "Visual Flow Management",
  overview: "Kanban focuses on visualizing work, limiting work in progress, and maximizing flow. It's a pull-based system that helps teams deliver continuously without fixed iterations.",
  keyConcepts: [
    "Visual board with columns (To Do, In Progress, Done)",
    "Work In Progress (WIP) limits",
    "Continuous flow vs. time-boxed iterations",
    "Pull system - take work when ready",
    "Lead time and cycle time metrics"
  ],
  bestFor: [
    "Continuous delivery environments",
    "Support and maintenance teams",
    "Teams with varying work sizes",
    "When priorities change frequently",
    "DevOps and operations teams"
  ],
  notIdealFor: [
    "Fixed deadline projects",
    "Teams needing predictable velocity",
    "Heavy upfront planning requirements",
    "Regulatory environments requiring phases"
  ],
  aichakuImplementation: [
    "Generates visual board representations",
    "Tracks WIP limits in execution mode",
    "Focuses on flow metrics vs. velocity",
    "Integrates with other methodologies seamlessly"
  ],
  quickStart: {
    description: "Try these phrases with Claude Code:",
    examples: [
      "Show me our kanban board",
      "What's our WIP limit?",
      "Move task X to in progress",
      "Analyze our flow metrics"
    ]
  },
  learnMorePrompt: "Tell me more about Kanban flow metrics and how to optimize them"
};

const scrumHelp: MethodologyHelp = {
  name: "Scrum",
  emoji: "🏃",
  tagline: "Sprint-Based Agile Framework",
  overview: "Scrum organizes work into fixed-length sprints with defined roles, ceremonies, and artifacts. It emphasizes iterative development, team collaboration, and regular delivery.",
  keyConcepts: [
    "Time-boxed sprints (usually 2 weeks)",
    "Roles: Product Owner, Scrum Master, Development Team",
    "Ceremonies: Planning, Daily Standup, Review, Retrospective",
    "Artifacts: Product Backlog, Sprint Backlog, Increment",
    "Velocity tracking and estimation"
  ],
  bestFor: [
    "Product development teams",
    "Projects with evolving requirements",
    "Teams of 5-9 people",
    "When regular stakeholder feedback is needed",
    "Building new features iteratively"
  ],
  notIdealFor: [
    "Maintenance and support work",
    "Research and exploration phases",
    "Very small teams (1-2 people)",
    "Highly interrupt-driven work"
  ],
  aichakuImplementation: [
    "Generates sprint planning documents",
    "Tracks velocity and burndown",
    "Creates ceremony templates",
    "Manages sprint transitions"
  ],
  quickStart: {
    description: "Try these phrases with Claude Code:",
    examples: [
      "Let's plan our next sprint",
      "Show me the sprint backlog",
      "Time for daily standup",
      "Generate sprint retrospective"
    ]
  },
  learnMorePrompt: "Explain Scrum velocity calculation and how to improve team estimation"
};

const shapeUpHelp: MethodologyHelp = {
  name: "Shape Up",
  emoji: "🎯",
  tagline: "Fixed Time, Variable Scope",
  overview: "Shape Up uses 6-week cycles with a unique approach: shape work before committing, bet on what to build, then give teams full autonomy. No daily standups, no sprint planning.",
  keyConcepts: [
    "6-week cycles + 2-week cooldown",
    "Shaping before building",
    "Betting table for project selection",
    "Hill charts for progress tracking",
    "No backlog - deliberate forgetting"
  ],
  bestFor: [
    "Product teams building features",
    "When you need deep work time",
    "Teams that can work autonomously",
    "Reducing meeting overhead",
    "Building meaningful features, not tasks"
  ],
  notIdealFor: [
    "Highly regulated environments",
    "Teams needing daily coordination",
    "Bug fixes and maintenance",
    "Very early stage exploration"
  ],
  aichakuImplementation: [
    "Generates pitch documents",
    "Creates hill charts",
    "Tracks cycle progress",
    "Manages betting table decisions"
  ],
  quickStart: {
    description: "Try these phrases with Claude Code:",
    examples: [
      "Let's shape a new feature",
      "Create a pitch for X",
      "Show our hill chart",
      "Start a new 6-week cycle"
    ]
  },
  learnMorePrompt: "Explain Shape Up's approach to risk and how hill charts show real progress"
};

const leanHelp: MethodologyHelp = {
  name: "Lean",
  emoji: "🚀",
  tagline: "Build-Measure-Learn",
  overview: "Lean focuses on validated learning through rapid experimentation. Build MVPs, measure results, and learn from customer feedback to minimize waste and maximize value.",
  keyConcepts: [
    "Minimum Viable Product (MVP)",
    "Build-Measure-Learn cycle",
    "Validated learning",
    "Pivot or persevere decisions",
    "Innovation accounting"
  ],
  bestFor: [
    "Startups and new products",
    "Market validation",
    "High uncertainty environments",
    "Innovation projects",
    "Customer discovery phases"
  ],
  notIdealFor: [
    "Well-defined requirements",
    "Maintenance of existing systems",
    "Compliance-heavy projects",
    "Teams without customer access"
  ],
  aichakuImplementation: [
    "Creates MVP planning documents",
    "Designs experiments",
    "Tracks learning metrics",
    "Generates pivot analysis"
  ],
  quickStart: {
    description: "Try these phrases with Claude Code:",
    examples: [
      "Plan an MVP for feature X",
      "Design an experiment to test Y",
      "Analyze our learning metrics",
      "Should we pivot or persevere?"
    ]
  },
  learnMorePrompt: "Explain Lean's innovation accounting and how to measure validated learning"
};

const xpHelp: MethodologyHelp = {
  name: "Extreme Programming (XP)",
  emoji: "⚡",
  tagline: "Engineering Excellence",
  overview: "XP emphasizes technical excellence through practices like pair programming, TDD, continuous integration, and refactoring. It's about writing the best code possible.",
  keyConcepts: [
    "Test-Driven Development (TDD)",
    "Pair programming",
    "Continuous integration",
    "Refactoring",
    "Simple design and YAGNI"
  ],
  bestFor: [
    "Engineering-focused teams",
    "Complex technical projects",
    "When code quality is critical",
    "Teams embracing collaboration",
    "Rapid feedback environments"
  ],
  notIdealFor: [
    "Non-technical projects",
    "Distributed teams (for pairing)",
    "Teams resistant to TDD",
    "Very small teams"
  ],
  aichakuImplementation: [
    "Generates test templates",
    "Creates refactoring plans",
    "Tracks technical debt",
    "Manages pair rotation"
  ],
  quickStart: {
    description: "Try these phrases with Claude Code:",
    examples: [
      "Create TDD template for feature X",
      "Plan refactoring for module Y",
      "Set up pair programming session",
      "Review our technical practices"
    ]
  },
  learnMorePrompt: "Explain XP's approach to sustainable pace and how it prevents burnout"
};

const scrumbanHelp: MethodologyHelp = {
  name: "Scrumban",
  emoji: "🔄",
  tagline: "Best of Both Worlds",
  overview: "Scrumban combines Scrum's structure with Kanban's flow. Use sprints for planning and reviews, but manage daily work with Kanban boards and WIP limits.",
  keyConcepts: [
    "Sprint planning without estimates",
    "Kanban board for daily work",
    "WIP limits within sprints",
    "On-demand planning triggers",
    "Flow metrics + velocity"
  ],
  bestFor: [
    "Teams transitioning from Scrum",
    "Mixed feature and maintenance work",
    "When you need some structure",
    "Evolving team processes",
    "Balancing predictability and flexibility"
  ],
  notIdealFor: [
    "Teams wanting pure methodology",
    "Very small projects",
    "When simplicity is key",
    "Strict Scrum environments"
  ],
  aichakuImplementation: [
    "Hybrid board generation",
    "Flexible planning tools",
    "Combined metrics tracking",
    "Smooth methodology blending"
  ],
  quickStart: {
    description: "Try these phrases with Claude Code:",
    examples: [
      "Show our scrumban board",
      "Plan next sprint with WIP limits",
      "Track both velocity and flow",
      "Trigger planning for low backlog"
    ]
  },
  learnMorePrompt: "Explain how Scrumban balances predictability with continuous flow"
};

// Command output formatters

function formatMethodologyHelp(help: MethodologyHelp): string {
  return `
${help.emoji} ${help.name} - ${help.tagline}

OVERVIEW:
${help.overview}

KEY CONCEPTS:
${help.keyConcepts.map(c => `• ${c}`).join('\n')}

BEST FOR:
${help.bestFor.map(b => `• ${b}`).join('\n')}

NOT IDEAL FOR:
${help.notIdealFor.map(n => `• ${n}`).join('\n')}

HOW AICHAKU IMPLEMENTS IT:
${help.aichakuImplementation.map(i => `• ${i}`).join('\n')}

QUICK START:
${help.quickStart.description}
${help.quickStart.examples.map(e => `  "${e}"`).join('\n')}

💡 LEARN MORE:
For deeper insights, ask Claude Code:
"${help.learnMorePrompt}"
`;
}

// List all methodologies
function formatMethodologyList(methodologies: MethodologyHelp[]): string {
  return `
📚 Available Methodologies:

${methodologies.map(m => `  ${m.emoji} ${m.name.padEnd(15)} - ${m.tagline}`).join('\n')}

Use 'aichaku help [methodology]' for detailed information.
`;
}

// Comparison table
function formatComparisonTable(): string {
  return `
📊 Methodology Comparison:

┌─────────────┬─────────────┬──────────────┬─────────────────────┐
│ Methodology │ Iteration   │ Planning     │ Best For            │
├─────────────┼─────────────┼──────────────┼─────────────────────┤
│ Scrum       │ 2-4 weeks   │ Heavy        │ Product teams       │
│ Kanban      │ Continuous  │ Light        │ Support/DevOps      │
│ Shape Up    │ 6 weeks     │ Shaping      │ Feature building    │
│ Lean        │ Continuous  │ Experiments  │ Startups/Innovation │
│ XP          │ 1-2 weeks   │ Light        │ Engineering teams   │
│ Scrumban    │ Flexible    │ Moderate     │ Transition/Mixed    │
└─────────────┴─────────────┴──────────────┴─────────────────────┘

For detailed information: aichaku help [methodology]
`;
}

export {
  type MethodologyHelp,
  kanbanHelp,
  scrumHelp,
  shapeUpHelp,
  leanHelp,
  xpHelp,
  scrumbanHelp,
  formatMethodologyHelp,
  formatMethodologyList,
  formatComparisonTable
};