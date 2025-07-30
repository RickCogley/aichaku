# User-Centered Design

## Overview

User-Centered Design (UCD) is a design philosophy and process that prioritizes the needs, wants, and limitations of end
users at every stage of the design process. Rather than forcing users to adapt to a product, UCD adapts the product to
meet user needs through iterative design and continuous user feedback.

## Core Concept

"User-centered design means understanding what your users need, how they think, and how they behave – and incorporating
that understanding into every aspect of your process." - Jesse James Garrett

UCD is characterized by:

1. **Early and continuous focus on users**
2. **Empirical measurement through testing**
3. **Iterative design based on feedback**
4. **Multidisciplinary design teams**

## The UCD Process

### 1. Understand and Specify Context of Use

```typescript
// User Research Framework
interface UserResearchPlan {
  objectives: string[];
  methods: ResearchMethod[];
  participants: ParticipantCriteria;
  timeline: Timeline;
  deliverables: Deliverable[];
}

class ContextOfUseAnalysis {
  async analyzeUsers(): Promise<UserProfile[]> {
    const profiles: UserProfile[] = [];

    // Primary users
    profiles.push({
      type: "primary",
      characteristics: {
        demographics: await this.gatherDemographics(),
        techSavviness: await this.assessTechnicalSkills(),
        domainKnowledge: await this.evaluateDomainExpertise(),
        physicalAbilities: await this.assessAccessibilityNeeds(),
        culturalFactors: await this.analyzeCulturalContext(),
      },
      goals: await this.identifyUserGoals(),
      painPoints: await this.discoverPainPoints(),
      behaviors: await this.observeBehaviors(),
    });

    // Secondary users (indirect users, administrators, etc.)
    profiles.push(...await this.identifySecondaryUsers());

    return profiles;
  }

  async analyzeTasks(): Promise<TaskAnalysis> {
    return {
      primaryTasks: await this.identifyPrimaryTasks(),
      frequency: await this.measureTaskFrequency(),
      complexity: await this.assessTaskComplexity(),
      dependencies: await this.mapTaskDependencies(),
      errors: await this.identifyCommonErrors(),
      workarounds: await this.documentCurrentWorkarounds(),
    };
  }

  async analyzeEnvironment(): Promise<EnvironmentFactors> {
    return {
      physical: {
        lighting: "Variable - outdoor to office",
        noise: "Moderate to high",
        space: "Limited desk space",
        interruptions: "Frequent",
      },
      technical: {
        devices: ["Desktop", "Tablet", "Mobile"],
        connectivity: "Variable bandwidth",
        browsers: ["Chrome", "Safari", "Firefox"],
        assistiveTech: ["Screen readers", "Voice control"],
      },
      organizational: {
        policies: await this.reviewPolicies(),
        workflow: await this.mapWorkflow(),
        collaboration: await this.analyzeTeamDynamics(),
      },
    };
  }
}
```

### 2. Specify User Requirements

```python
class UserRequirementsSpecification:
    def __init__(self, research_findings):
        self.findings = research_findings
        self.requirements = []
        
    def derive_requirements(self):
        """Transform research findings into actionable requirements"""
        
        # Functional requirements from user goals
        for goal in self.findings.user_goals:
            requirement = FunctionalRequirement(
                id=self.generate_id(),
                description=f"User shall be able to {goal.action}",
                rationale=goal.motivation,
                priority=self.calculate_priority(goal),
                success_criteria=self.define_success_criteria(goal)
            )
            self.requirements.append(requirement)
        
        # Usability requirements
        self.add_usability_requirements()
        
        # Accessibility requirements
        self.add_accessibility_requirements()
        
        return self.requirements
    
    def add_usability_requirements(self):
        """Define measurable usability goals"""
        
        usability_reqs = [
            UsabilityRequirement(
                metric="Task completion rate",
                target="95% for primary tasks",
                measurement="Usability testing with 20 users"
            ),
            UsabilityRequirement(
                metric="Time on task",
                target="< 2 minutes for frequent tasks",
                measurement="Timed task completion"
            ),
            UsabilityRequirement(
                metric="Error rate",
                target="< 1 error per session",
                measurement="Error tracking during testing"
            ),
            UsabilityRequirement(
                metric="Learnability",
                target="80% task success on first attempt",
                measurement="First-use testing"
            ),
            UsabilityRequirement(
                metric="Satisfaction",
                target="SUS score > 80",
                measurement="System Usability Scale survey"
            )
        ]
        
        self.requirements.extend(usability_reqs)
    
    def prioritize_requirements(self):
        """Use MoSCoW method for prioritization"""
        
        for req in self.requirements:
            impact = self.assess_user_impact(req)
            effort = self.estimate_implementation_effort(req)
            frequency = self.determine_usage_frequency(req)
            
            if impact == 'HIGH' and frequency == 'DAILY':
                req.priority = 'MUST'
            elif impact == 'HIGH' or frequency == 'DAILY':
                req.priority = 'SHOULD'
            elif impact == 'MEDIUM' and effort == 'LOW':
                req.priority = 'COULD'
            else:
                req.priority = 'WONT'
```

### 3. Produce Design Solutions

```javascript
// Iterative Design Process
class DesignIterator {
  constructor(requirements, constraints) {
    this.requirements = requirements;
    this.constraints = constraints;
    this.iterations = [];
  }

  async generateConcepts() {
    // Divergent thinking phase
    const concepts = await this.ideationSession({
      methods: ["brainstorming", "sketching", "6-3-5-method"],
      participants: ["designers", "users", "stakeholders"],
      duration: "2 hours",
    });

    // Concept evaluation
    const evaluated = concepts.map((concept) => ({
      ...concept,
      score: this.evaluateConcept(concept, {
        meetsRequirements: this.checkRequirements(concept),
        feasibility: this.assessFeasibility(concept),
        innovation: this.measureInnovation(concept),
        userAppeal: this.predictUserAppeal(concept),
      }),
    }));

    // Select top concepts for prototyping
    return evaluated
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  createPrototype(concept, fidelity = "low") {
    const prototype = {
      concept,
      fidelity,
      created: new Date(),
      version: this.iterations.length + 1,
    };

    switch (fidelity) {
      case "low":
        return this.createPaperPrototype(prototype);
      case "medium":
        return this.createDigitalWireframe(prototype);
      case "high":
        return this.createInteractivePrototype(prototype);
    }
  }

  createPaperPrototype(prototype) {
    return {
      ...prototype,
      artifacts: [
        "Hand-drawn screens",
        "Flow diagrams",
        "Sticky note interactions",
        "Paper cutout components",
      ],
      testingMethod: "Wizard of Oz testing",
      timeToCreate: "2-4 hours",
      modificationEase: "Very easy",
    };
  }

  createInteractivePrototype(prototype) {
    // High-fidelity prototype with real interactions
    const screens = this.designScreens(prototype.concept);
    const interactions = this.defineInteractions(screens);
    const microInteractions = this.addMicroInteractions(screens);

    return {
      ...prototype,
      screens,
      interactions,
      microInteractions,
      navigationFlow: this.createNavigationFlow(screens),
      testingMethod: "Remote usability testing",
      timeToCreate: "2-3 days",
      modificationEase: "Moderate",
    };
  }
}
```

### 4. Evaluate Designs Against Requirements

```typescript
interface UsabilityTest {
  participants: Participant[];
  tasks: Task[];
  metrics: Metric[];
  findings: Finding[];
  recommendations: Recommendation[];
}

class DesignEvaluator {
  async conductUsabilityTest(prototype: Prototype): Promise<UsabilityTest> {
    const test: UsabilityTest = {
      participants: await this.recruitParticipants(8),
      tasks: this.defineTestTasks(),
      metrics: this.defineMetrics(),
      findings: [],
      recommendations: [],
    };

    // Run test sessions
    for (const participant of test.participants) {
      const session = await this.runSession(participant, prototype);
      test.findings.push(...this.analyzeSession(session));
    }

    // Analyze results
    const analysis = this.analyzeFindings(test.findings);
    test.recommendations = this.generateRecommendations(analysis);

    return test;
  }

  defineTestTasks(): Task[] {
    return [
      {
        id: "T1",
        description: "Find and purchase a product",
        steps: [
          'Search for "wireless headphones"',
          "Filter by price under $100",
          "Select a product",
          "Add to cart",
          "Complete checkout",
        ],
        successCriteria: "Order confirmation displayed",
        timeLimit: 300, // 5 minutes
      },
      {
        id: "T2",
        description: "Update account settings",
        steps: [
          "Navigate to account settings",
          "Change email address",
          "Update notification preferences",
          "Save changes",
        ],
        successCriteria: "Success message displayed",
        timeLimit: 120, // 2 minutes
      },
    ];
  }

  analyzeSession(session: TestSession): Finding[] {
    const findings: Finding[] = [];

    // Task performance
    session.tasks.forEach((task) => {
      if (!task.completed) {
        findings.push({
          type: "task-failure",
          severity: "high",
          task: task.id,
          issue: `User unable to ${task.description}`,
          cause: task.failureReason,
          frequency: 1,
        });
      }

      if (task.time > task.timeLimit) {
        findings.push({
          type: "efficiency",
          severity: "medium",
          task: task.id,
          issue: `Task took ${task.time}s (limit: ${task.timeLimit}s)`,
          cause: task.delays,
          frequency: 1,
        });
      }

      // Error analysis
      task.errors.forEach((error) => {
        findings.push({
          type: "error",
          severity: this.assessErrorSeverity(error),
          task: task.id,
          issue: error.description,
          cause: error.cause,
          frequency: 1,
        });
      });
    });

    // Subjective feedback
    findings.push(...this.analyzeSubjectiveFeedback(session));

    return findings;
  }
}
```

## User Research Methods

### Qualitative Research

```python
class QualitativeResearch:
    def conduct_user_interview(self, participant: User) -> InterviewFindings:
        """In-depth semi-structured interview"""
        
        interview_guide = {
            'opening': [
                "Tell me about your role and typical day",
                "How do you currently handle [task]?"
            ],
            'exploration': [
                "Walk me through the last time you [used similar product]",
                "What was frustrating about that experience?",
                "What worked well?",
                "If you had a magic wand, what would you change?"
            ],
            'specific_features': [
                "How would you expect [feature] to work?",
                "What would make [task] easier for you?",
                "How often do you need to [perform action]?"
            ],
            'closing': [
                "What haven't I asked about that's important?",
                "Any other thoughts or suggestions?"
            ]
        }
        
        findings = InterviewFindings()
        
        # Conduct interview
        for section, questions in interview_guide.items():
            for question in questions:
                response = self.ask_question(participant, question)
                findings.add_response(section, question, response)
                
                # Follow-up on interesting points
                if self.needs_followup(response):
                    followup = self.generate_followup(response)
                    findings.add_response(section, followup.question, 
                                        self.ask_question(participant, followup))
        
        # Analyze themes
        findings.themes = self.extract_themes(findings.responses)
        findings.insights = self.generate_insights(findings.themes)
        
        return findings
    
    def conduct_contextual_inquiry(self, participant: User) -> ObservationFindings:
        """Observe users in their natural environment"""
        
        observation = ObservationFindings()
        
        # Pre-observation interview
        context = self.understand_context(participant)
        
        # Observation phase
        while participant.performing_tasks():
            action = self.observe_action()
            
            observation.record({
                'action': action,
                'time': self.timestamp(),
                'tools_used': self.identify_tools(action),
                'difficulties': self.note_struggles(action),
                'workarounds': self.identify_workarounds(action),
                'interruptions': self.note_interruptions()
            })
            
            # Inquiry during natural breaks
            if self.is_appropriate_time():
                self.ask_why(action)
                self.clarify_intent(action)
        
        # Post-observation debrief
        observation.debrief = self.conduct_debrief(participant)
        
        return observation
```

### Quantitative Research

```javascript
class QuantitativeResearch {
  createSurvey(researchQuestions) {
    const survey = {
      screener: this.createScreenerQuestions(),
      sections: [],
    };

    // Demographics section
    survey.sections.push({
      title: "About You",
      questions: [
        {
          type: "multiple-choice",
          question: "How long have you used similar products?",
          options: ["< 6 months", "6-12 months", "1-2 years", "> 2 years"],
          required: true,
        },
        {
          type: "multiple-select",
          question: "Which features do you use regularly?",
          options: this.getFeatureList(),
          required: true,
        },
      ],
    });

    // Behavior section
    survey.sections.push({
      title: "Your Usage",
      questions: [
        {
          type: "likert",
          question: "How satisfied are you with the current solution?",
          scale: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
          required: true,
        },
        {
          type: "ranking",
          question: "Rank these features by importance",
          items: ["Speed", "Ease of use", "Features", "Reliability", "Cost"],
          required: true,
        },
      ],
    });

    return survey;
  }

  analyzeAnalytics(timeframe) {
    const metrics = {
      userBehavior: {
        avgSessionDuration: this.calculateAvgDuration(),
        pagesPerSession: this.calculatePageViews(),
        bounceRate: this.calculateBounceRate(),
        returnRate: this.calculateReturnRate(),
      },

      taskCompletion: {
        startedCheckout: this.countStartedCheckouts(),
        completedCheckout: this.countCompletedCheckouts(),
        abandonmentRate: this.calculateAbandonmentRate(),
        abandonmentPoints: this.identifyDropoffPoints(),
      },

      navigation: {
        commonPaths: this.analyzUserFlows(),
        deadEnds: this.findDeadEndPages(),
        searchTerms: this.analyzeSearchQueries(),
        backButtonUsage: this.measureBackNavigation(),
      },
    };

    return {
      metrics,
      insights: this.generateInsights(metrics),
      recommendations: this.prioritizeImprovements(metrics),
    };
  }
}
```

## Design Artifacts

### User Personas

```typescript
interface Persona {
  name: string;
  photo: string;
  quote: string;
  demographics: Demographics;
  psychographics: Psychographics;
  goals: Goal[];
  frustrations: string[];
  scenarios: Scenario[];
  technicalProficiency: TechLevel;
}

class PersonaCreator {
  createPersona(researchData: ResearchData): Persona {
    // Analyze research data to identify patterns
    const patterns = this.identifyUserPatterns(researchData);

    // Create composite user representing a segment
    return {
      name: "Sarah Chen",
      photo: "sarah-chen.jpg",
      quote: "I need to get my work done quickly without technical hiccups",

      demographics: {
        age: 34,
        occupation: "Marketing Manager",
        location: "Urban",
        education: "Bachelor's Degree",
        income: "$75,000-$100,000",
      },

      psychographics: {
        lifestyle: "Busy professional, values efficiency",
        personality: "Detail-oriented, collaborative",
        values: ["Productivity", "Work-life balance", "Innovation"],
        influences: ["Industry blogs", "Peer recommendations", "Reviews"],
      },

      goals: [
        {
          primary: "Complete marketing campaigns on schedule",
          secondary: "Collaborate effectively with remote team",
          tertiary: "Stay updated with industry trends",
        },
      ],

      frustrations: [
        "Tools that require extensive training",
        "Switching between multiple applications",
        "Losing work due to sync issues",
        "Unclear error messages",
      ],

      scenarios: [
        {
          context: "Monday morning campaign review",
          task: "Review weekend campaign performance",
          currentApproach: "Login to 3 different tools, export data, create report",
          painPoints: ["Takes 45 minutes", "Manual data combination", "Risk of errors"],
          idealExperience: "Single dashboard with all metrics, automated reporting",
        },
      ],

      technicalProficiency: {
        level: "Intermediate",
        comfortableWith: ["Web apps", "Mobile apps", "Basic spreadsheets"],
        strugglesWidth: ["Advanced formulas", "API integrations", "Command line"],
      },
    };
  }
}
```

### Journey Mapping

```python
class JourneyMapper:
    def create_journey_map(self, persona: Persona, scenario: Scenario) -> JourneyMap:
        """Map the user's journey through a scenario"""
        
        journey = JourneyMap(
            persona=persona,
            scenario=scenario,
            phases=[]
        )
        
        # Define journey phases
        phases = [
            self.create_phase("Awareness", "User recognizes need"),
            self.create_phase("Research", "User explores solutions"),
            self.create_phase("Decision", "User chooses solution"),
            self.create_phase("Onboarding", "User starts using product"),
            self.create_phase("Regular Use", "User integrates into workflow"),
            self.create_phase("Advocacy", "User recommends to others")
        ]
        
        for phase in phases:
            # Map touchpoints
            phase.touchpoints = self.identify_touchpoints(phase)
            
            # Track emotional journey
            phase.emotions = self.map_emotions(phase)
            
            # Identify opportunities
            phase.opportunities = self.find_opportunities(phase)
            
            journey.phases.append(phase)
        
        return journey
    
    def create_phase(self, name: str, description: str) -> Phase:
        return Phase(
            name=name,
            description=description,
            user_actions=[],
            thoughts=[],
            emotions=[],
            touchpoints=[],
            pain_points=[],
            opportunities=[]
        )
    
    def visualize_journey(self, journey: JourneyMap) -> str:
        """Create visual representation of journey"""
        
        visualization = """
        Journey Map: {persona.name} - {scenario.description}
        
        PHASES:     Awareness → Research → Decision → Onboarding → Use → Advocacy
        
        ACTIONS:    Notices    Searches   Compares   Signs up     Uses    Shares
                    problem    online     options    Explores     daily   with team
        
        THOUGHTS:   "I spend   "What      "Which     "Hope this   "This   "Others
                    too much   tools are  fits our   is easy"     saves   need this"
                    time"      available" needs?"                 time!"  
        
        EMOTIONS:   😟         😐         😊         😰           😊      😍
                    Frustrated Curious    Hopeful    Anxious      Happy   Delighted
        
        TOUCHPOINTS:• Blog     • Google   • Website  • Email      • App   • Social
                    • Peers    • Reviews  • Demo     • Tutorial   • Support • Email
        
        OPPORTUNITIES:
        ↓ Better problem articulation in content
                    ↓ Improve SEO and comparison content
                               ↓ Clearer pricing and features
                                          ↓ Smoother onboarding
                                                     ↓ In-app tips
                                                              ↓ Referral program
        """
        
        return visualization
```

## Prototyping Strategies

### Progressive Fidelity

```javascript
class ProgressivePrototyping {
  // Start with low fidelity
  createPaperPrototype() {
    return {
      materials: ["Paper", "Markers", "Sticky notes", "Scissors"],
      time: "2-4 hours",
      cost: "Minimal",

      advantages: [
        "Quick to create and modify",
        "No technical skills required",
        "Encourages broad feedback",
        "Users not distracted by visuals",
      ],

      limitations: [
        "No real interactions",
        "Limited to simple flows",
        "Requires facilitator",
        "Not scalable for remote testing",
      ],

      bestFor: "Early concept validation",

      example: `
                [Hand-drawn homepage]
                ┌─────────────────┐
                │  □ Logo  Search │
                ├─────────────────┤
                │                 │
                │  Welcome Text   │
                │                 │
                │ [Sign Up] [Login]│
                │                 │
                │ ○ ○ ○ Features │
                └─────────────────┘
            `,
    };
  }

  createDigitalWireframe() {
    return {
      tools: ["Figma", "Sketch", "Adobe XD"],
      time: "1-2 days",

      components: {
        layout: "Grayscale boxes and lines",
        content: "Lorem ipsum or real content",
        interactions: "Basic click-through",
        annotations: "Descriptions of functionality",
      },

      testingCapabilities: [
        "Information architecture validation",
        "Flow testing",
        "Content prioritization",
        "Basic usability",
      ],
    };
  }

  createHighFidelityPrototype() {
    return {
      includes: [
        "Visual design (colors, typography, imagery)",
        "Micro-interactions and animations",
        "Real or realistic content",
        "Multiple device sizes",
        "State variations (hover, active, disabled)",
        "Error states and edge cases",
      ],

      tools: ["Figma", "Framer", "ProtoPie", "Principle"],
      time: "1-2 weeks",

      interactivity: {
        navigation: "Fully functional",
        forms: "Input validation and feedback",
        animations: "Transitions and micro-interactions",
        gestures: "Swipe, pinch, long-press",
        data: "Dynamic content from APIs",
      },

      testingValue: "Near-realistic user experience testing",
    };
  }
}
```

## Usability Testing

### Test Planning and Execution

```typescript
class UsabilityTestOrchestrator {
  planTest(objectives: string[]): TestPlan {
    return {
      objectives,
      methodology: this.selectMethodology(objectives),
      participants: this.defineParticipantCriteria(),
      tasks: this.createTestTasks(objectives),
      metrics: this.selectMetrics(objectives),
      logistics: this.planLogistics(),
    };
  }

  selectMethodology(objectives: string[]): TestMethodology {
    if (objectives.includes("early concept validation")) {
      return {
        type: "Moderated in-person",
        setting: "Lab or conference room",
        duration: "60 minutes per session",
        tools: ["Screen recording", "Note-taking app"],
      };
    } else if (objectives.includes("large sample size")) {
      return {
        type: "Unmoderated remote",
        setting: "Participant's environment",
        duration: "20-30 minutes",
        tools: ["UserTesting", "Maze", "Lookback"],
      };
    }

    return {
      type: "Moderated remote",
      setting: "Video conference",
      duration: "45 minutes",
      tools: ["Zoom", "Miro for collaboration"],
    };
  }

  createTestTasks(objectives: string[]): TestTask[] {
    const tasks: TestTask[] = [];

    // Critical path testing
    tasks.push({
      id: "critical-1",
      scenario: "You need to [primary user goal]",
      specificTask: "Using the prototype, please [specific action]",
      successCriteria: ["Completes within 2 minutes", "No critical errors"],
      dataToCollect: ["Time", "Errors", "Path taken", "Verbal feedback"],
    });

    // Feature discovery
    tasks.push({
      id: "discovery-1",
      scenario: "You want to customize your experience",
      specificTask: "Find where you can change your preferences",
      successCriteria: ["Finds settings", "Understands options"],
      dataToCollect: ["Time to find", "Places looked", "Confidence level"],
    });

    return tasks;
  }

  moderateSession(participant: Participant, prototype: Prototype): SessionData {
    const session = new SessionData(participant);

    // Introduction (5 min)
    this.explainProcess(participant);
    this.getConsent(participant);
    this.startRecording();

    // Background questions (5 min)
    session.background = this.askBackgroundQuestions(participant);

    // Task completion (30 min)
    for (const task of this.tasks) {
      session.addTaskResult(
        this.observeTaskCompletion(participant, task, prototype),
      );

      // Post-task questions
      session.addTaskFeedback(
        this.askPostTaskQuestions(participant, task),
      );
    }

    // Overall feedback (10 min)
    session.overallFeedback = this.gatherOverallFeedback(participant);

    // Wrap-up (5 min)
    this.thankParticipant(participant);
    this.provideCompensation(participant);

    return session;
  }
}
```

### Analysis and Reporting

```python
class UsabilityAnalyzer:
    def analyze_test_results(self, sessions: List[SessionData]) -> TestReport:
        """Analyze usability test data and generate insights"""
        
        report = TestReport()
        
        # Quantitative analysis
        report.metrics = self.calculate_metrics(sessions)
        
        # Qualitative analysis
        report.themes = self.identify_themes(sessions)
        
        # Issue identification
        report.issues = self.categorize_issues(sessions)
        
        # Recommendations
        report.recommendations = self.generate_recommendations(report)
        
        return report
    
    def calculate_metrics(self, sessions: List[SessionData]) -> MetricsReport:
        metrics = MetricsReport()
        
        for task in self.test_plan.tasks:
            task_metrics = {
                'completion_rate': self.calc_completion_rate(sessions, task),
                'avg_time': self.calc_avg_time(sessions, task),
                'error_rate': self.calc_error_rate(sessions, task),
                'satisfaction': self.calc_satisfaction(sessions, task),
                'paths_taken': self.analyze_paths(sessions, task)
            }
            
            metrics.add_task_metrics(task.id, task_metrics)
        
        # Overall metrics
        metrics.overall = {
            'sus_score': self.calculate_sus_score(sessions),
            'nps': self.calculate_nps(sessions),
            'overall_satisfaction': self.calc_overall_satisfaction(sessions)
        }
        
        return metrics
    
    def identify_themes(self, sessions: List[SessionData]) -> List[Theme]:
        """Extract common themes from qualitative feedback"""
        
        all_quotes = []
        for session in sessions:
            all_quotes.extend(session.get_all_quotes())
        
        # Code quotes into categories
        coded_quotes = self.code_quotes(all_quotes)
        
        # Identify patterns
        themes = []
        for category, quotes in coded_quotes.items():
            if len(quotes) >= 3:  # Theme threshold
                theme = Theme(
                    name=category,
                    frequency=len(quotes),
                    severity=self.assess_severity(quotes),
                    example_quotes=self.select_representative_quotes(quotes),
                    affected_users=self.count_affected_users(quotes),
                    impact=self.assess_impact(category, quotes)
                )
                themes.append(theme)
        
        return sorted(themes, key=lambda t: t.impact, reverse=True)
    
    def generate_recommendations(self, report: TestReport) -> List[Recommendation]:
        recommendations = []
        
        for issue in report.issues:
            if issue.severity == 'Critical':
                rec = Recommendation(
                    issue=issue,
                    priority='Immediate',
                    action=self.suggest_fix(issue),
                    effort=self.estimate_effort(issue),
                    impact=self.predict_impact(issue),
                    evidence=self.gather_evidence(issue, report)
                )
                recommendations.append(rec)
        
        return self.prioritize_recommendations(recommendations)
```

## Iterative Design Process

```javascript
class IterativeDesignManager {
  constructor() {
    this.iterations = [];
    this.currentVersion = 0;
  }

  startIteration() {
    const iteration = {
      version: ++this.currentVersion,
      startDate: new Date(),
      hypothesis: this.defineHypothesis(),
      changes: [],
      testPlan: this.createTestPlan(),
      results: null,
      decisions: [],
    };

    this.iterations.push(iteration);
    return iteration;
  }

  defineHypothesis() {
    // Based on previous iteration findings
    const lastIteration = this.getLastIteration();

    if (!lastIteration) {
      return {
        statement: "Users can complete primary tasks efficiently",
        metrics: ["Task completion > 90%", "Time on task < 3 min"],
        assumptions: ["Navigation is intuitive", "Labels are clear"],
      };
    }

    // Build on previous learnings
    const topIssue = lastIteration.results.issues[0];
    return {
      statement: `Fixing ${topIssue.description} will improve task completion`,
      metrics: [`${topIssue.metric} improves by 20%`],
      assumptions: [topIssue.proposedSolution + " addresses root cause"],
    };
  }

  implementChanges(iteration, designChanges) {
    iteration.changes = designChanges.map((change) => ({
      description: change.description,
      rationale: change.rationale,
      component: change.component,
      before: this.captureCurrentState(change.component),
      after: change.newDesign,
      effort: change.estimatedEffort,
    }));

    // Update prototype
    this.updatePrototype(iteration.changes);
  }

  async testIteration(iteration) {
    // Run usability test
    const testResults = await this.usabilityTest.run(iteration.testPlan);

    // Compare to hypothesis
    iteration.results = {
      hypothesisValidated: this.validateHypothesis(
        iteration.hypothesis,
        testResults,
      ),
      metrics: testResults.metrics,
      issues: testResults.issues,
      improvements: this.identifyImprovements(testResults),
      participantFeedback: testResults.qualitativeFeedback,
    };

    return iteration.results;
  }

  makeDecisions(iteration) {
    const decisions = [];

    // For each issue found
    iteration.results.issues.forEach((issue) => {
      const decision = {
        issue: issue,
        severity: this.assessSeverity(issue),
        action: this.determineAction(issue),
        rationale: this.explainDecision(issue),
        assignee: this.assignOwner(issue),
        timeline: this.estimateTimeline(issue),
      };

      decisions.push(decision);
    });

    iteration.decisions = decisions;
    iteration.endDate = new Date();

    // Plan next iteration based on decisions
    if (this.needsAnotherIteration(decisions)) {
      this.planNextIteration(decisions);
    }
  }
}
```

## Measuring Success

### Usability Metrics Framework

```python
class UsabilityMetricsFramework:
    def __init__(self):
        self.metrics = {
            'effectiveness': EffectivenessMetrics(),
            'efficiency': EfficiencyMetrics(),
            'satisfaction': SatisfactionMetrics(),
            'learnability': LearnabilityMetrics(),
            'accessibility': AccessibilityMetrics()
        }
    
    def measure_effectiveness(self, test_data):
        """How well users complete tasks"""
        
        return {
            'task_completion_rate': self.calculate_completion_rate(test_data),
            'error_rate': self.calculate_error_rate(test_data),
            'accuracy': self.measure_accuracy(test_data),
            'feature_adoption': self.track_feature_usage(test_data)
        }
    
    def measure_efficiency(self, test_data):
        """How quickly users complete tasks"""
        
        return {
            'time_on_task': {
                'mean': self.calculate_mean_time(test_data),
                'median': self.calculate_median_time(test_data),
                'by_experience': self.segment_by_experience(test_data)
            },
            'clicks_to_complete': self.count_interactions(test_data),
            'navigation_efficiency': self.analyze_paths(test_data),
            'cognitive_load': self.assess_cognitive_load(test_data)
        }
    
    def measure_satisfaction(self, survey_data):
        """How users feel about the experience"""
        
        sus_score = self.calculate_sus(survey_data)
        
        return {
            'sus_score': {
                'overall': sus_score,
                'benchmark': self.get_sus_benchmark(),
                'interpretation': self.interpret_sus(sus_score)
            },
            'nps': self.calculate_nps(survey_data),
            'csat': self.calculate_csat(survey_data),
            'emotional_response': self.analyze_emotional_feedback(survey_data),
            'preference': self.measure_preference(survey_data)
        }
    
    def calculate_sus(self, responses):
        """System Usability Scale calculation"""
        
        sus_total = 0
        for response in responses:
            # Odd questions (positive): score - 1
            # Even questions (negative): 5 - score
            for i, score in enumerate(response.sus_scores):
                if i % 2 == 0:  # Odd question (1, 3, 5, 7, 9)
                    sus_total += score - 1
                else:  # Even question (2, 4, 6, 8, 10)
                    sus_total += 5 - score
        
        # Multiply by 2.5 to get 0-100 scale
        sus_score = (sus_total / len(responses)) * 2.5
        
        return round(sus_score, 1)
```

### Success Criteria Definition

```typescript
interface SuccessCriteria {
  dimension: "effectiveness" | "efficiency" | "satisfaction";
  metric: string;
  target: number | string;
  current?: number | string;
  priority: "must-have" | "should-have" | "nice-to-have";
}

class SuccessCriteriaManager {
  defineProjectSuccess(): SuccessCriteria[] {
    return [
      // Must-have criteria
      {
        dimension: "effectiveness",
        metric: "Critical task completion rate",
        target: "> 95%",
        priority: "must-have",
      },
      {
        dimension: "effectiveness",
        metric: "Critical errors per session",
        target: "< 1",
        priority: "must-have",
      },

      // Should-have criteria
      {
        dimension: "efficiency",
        metric: "Average task time",
        target: "< 3 minutes",
        priority: "should-have",
      },
      {
        dimension: "satisfaction",
        metric: "SUS score",
        target: "> 80",
        priority: "should-have",
      },

      // Nice-to-have criteria
      {
        dimension: "satisfaction",
        metric: "User delight moments",
        target: "> 2 per session",
        priority: "nice-to-have",
      },
    ];
  }

  trackProgress(criteria: SuccessCriteria[], currentMetrics: Metrics): ProgressReport {
    const report = new ProgressReport();

    criteria.forEach((criterion) => {
      const current = currentMetrics[criterion.metric];
      const met = this.evaluateCriterion(criterion, current);

      report.addResult({
        criterion,
        current,
        met,
        gap: this.calculateGap(criterion.target, current),
        trend: this.analyzeTrend(criterion.metric),
        recommendation: this.suggestImprovement(criterion, current),
      });
    });

    report.summary = {
      mustHavesMet: report.getMustHaveStatus(),
      overallProgress: report.calculateOverallProgress(),
      riskItems: report.identifyRisks(),
      successProbability: report.predictSuccess(),
    };

    return report;
  }
}
```

## Implementing UCD in Organizations

### Building UCD Culture

```python
class UCDCultureBuilder:
    def implement_ucd_transformation(self, organization):
        """Guide organization through UCD adoption"""
        
        transformation_plan = {
            'phase1_awareness': {
                'duration': '1-2 months',
                'activities': [
                    self.conduct_ucd_workshops(),
                    self.share_success_stories(),
                    self.identify_champions(),
                    self.run_pilot_project()
                ],
                'deliverables': [
                    'UCD awareness materials',
                    'Pilot project results',
                    'Champion network'
                ]
            },
            
            'phase2_adoption': {
                'duration': '3-6 months',
                'activities': [
                    self.establish_research_practice(),
                    self.create_design_system(),
                    self.implement_testing_program(),
                    self.train_teams()
                ],
                'deliverables': [
                    'Research repository',
                    'Design system v1',
                    'Testing protocols',
                    'Trained staff'
                ]
            },
            
            'phase3_maturity': {
                'duration': 'Ongoing',
                'activities': [
                    self.measure_ucd_impact(),
                    self.scale_practices(),
                    self.continuous_improvement(),
                    self.share_learnings()
                ],
                'deliverables': [
                    'UCD metrics dashboard',
                    'Best practices library',
                    'Case study portfolio'
                ]
            }
        }
        
        return transformation_plan
    
    def establish_research_practice(self):
        return {
            'research_ops': {
                'participant_recruitment': self.setup_recruitment_process(),
                'research_repository': self.create_knowledge_base(),
                'tools_and_methods': self.standardize_toolkit(),
                'governance': self.establish_ethics_review()
            },
            
            'team_structure': {
                'researchers': 'Dedicated or embedded',
                'research_ops': 'Coordination and support',
                'champions': 'Advocates in each team'
            },
            
            'processes': {
                'research_planning': 'Quarterly research roadmap',
                'knowledge_sharing': 'Monthly insights sessions',
                'collaboration': 'Designer-researcher pairing'
            }
        }
```

### Stakeholder Engagement

```javascript
class StakeholderEngagement {
  engageStakeholders(projectPhase) {
    const strategies = {
      "research": {
        executives: {
          approach: "High-level insights and business impact",
          format: "Executive summary with ROI data",
          frequency: "Quarterly",
          example: this.createExecutiveSummary(),
        },

        productManagers: {
          approach: "Detailed findings and recommendations",
          format: "Research reports and workshops",
          frequency: "After each study",
          example: this.createProductReport(),
        },

        developers: {
          approach: "Technical feasibility and implementation",
          format: "Design specs and prototypes",
          frequency: "Sprint planning",
          example: this.createTechnicalSpecs(),
        },
      },

      "design": {
        showcase: this.planDesignShowcase(),
        workshops: this.facilitateCoDesign(),
        reviews: this.structureDesignReviews(),
      },

      "testing": {
        observation: this.inviteToTesting(),
        results: this.shareTestResults(),
        decisions: this.facilitateDecisions(),
      },
    };

    return strategies[projectPhase];
  }

  createExecutiveSummary() {
    return {
      title: "UCD Impact on Business Metrics",
      sections: [
        {
          heading: "Key Findings",
          content: "3-5 bullet points with business impact",
        },
        {
          heading: "ROI Projection",
          content: "Reduced support costs, increased conversion",
        },
        {
          heading: "Recommendations",
          content: "Strategic decisions needed",
        },
      ],
      visualElements: ["Infographics", "Charts", "User quotes"],
      length: "2 pages maximum",
    };
  }
}
```

## Tools and Resources

### UCD Toolkit

```typescript
class UCDToolkit {
  getToolsForPhase(phase: string): ToolRecommendations {
    const tools = {
      research: {
        planning: ["Miro", "Notion", "Airtable"],
        recruiting: ["User Interviews", "Respondent.io"],
        surveying: ["Typeform", "Google Forms", "SurveyMonkey"],
        analytics: ["Google Analytics", "Hotjar", "FullStory"],
        synthesis: ["Miro", "Dovetail", "Aurelius"],
      },

      design: {
        ideation: ["Miro", "FigJam", "Whimsical"],
        wireframing: ["Figma", "Sketch", "Adobe XD"],
        prototyping: ["Figma", "Framer", "ProtoPie"],
        handoff: ["Figma", "Zeplin", "Abstract"],
      },

      testing: {
        moderated: ["Zoom", "Lookback", "UserZoom"],
        unmoderated: ["UserTesting", "Maze", "UsabilityHub"],
        accessibility: ["WAVE", "axe", "NVDA"],
        analytics: ["Hotjar", "FullStory", "LogRocket"],
      },
    };

    return {
      recommended: tools[phase],
      considerations: this.getToolSelectionCriteria(),
      integrations: this.checkIntegrations(tools[phase]),
    };
  }
}
```

## Conclusion

User-Centered Design is not just a methodology—it's a mindset that puts human needs at the forefront of product
development. By understanding users deeply, involving them throughout the process, and iterating based on real feedback,
we create products that truly serve their intended purpose.

Key principles to remember:

1. **Users are not you**: Design for actual users, not assumptions
2. **Early and often**: Involve users from the beginning and throughout
3. **Iterate relentlessly**: Each cycle brings you closer to the ideal solution
4. **Measure impact**: Use both qualitative and quantitative methods
5. **Cross-functional collaboration**: UCD requires diverse perspectives
6. **Continuous learning**: User needs evolve; so should your understanding

Remember: "Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs. Make it work for
your users.
