# Permanent Documentation Generation Strategy

## 🧠 The Documentation Population Problem

Critical challenge identified:

- **Project documents** (`.claude/output/active-*`) are conversation-context
  driven

- **Permanent documents** (`/references`) need to reflect actual system state

- **Gap**: How to bridge between ephemeral project work and persistent system
  knowledge

## 🎯 Three-Strategy Approach

### Strategy 1: Analysis-Based Generation (Existing Projects)

For when Aichaku is installed on mature codebases:

````typescript
// Bootstrap permanent docs from existing code
async function analyzeAndGenerate(projectPath: string) {
  // 1. Code Structure Analysis
  const structure = await analyzeProjectStructure(projectPath);
  const frameworks = await detectFrameworks(structure);
  const patterns = await identifyArchitecturalPatterns(structure);

  // 2. API Discovery
  const apis = await discoverAPIs(projectPath);
  const endpoints = await extractRESTEndpoints(apis);
  const schemas = await extractGraphQLSchemas(apis);

  // 3. Data Model Analysis
  const dataModels = await analyzeDataModels(projectPath);
  const dbSchemas = await extractDatabaseSchemas(dataModels);

  // 4. Security Pattern Detection
  const securityPatterns = await analyzeSecurityPatterns(projectPath);

  // Generate permanent docs based on analysis
  await generatePermanentDocs({
    structure,
    frameworks,
    patterns,
    apis,
    endpoints,
    schemas,
    dataModels,
    dbSchemas,
    securityPatterns,
  });
}
```text

### Strategy 2: Gradual Accumulation (Ongoing Projects)

For building permanent knowledge through project work:

```typescript
// Link project completion to permanent doc updates
async function completeProject(projectPath: string, outputDir: string) {
  const projectLearnings = await extractProjectLearnings(outputDir);
  const permanentImpacts = await analyzePermanentImpacts(projectLearnings);

  // Suggest updates to permanent docs
  for (const impact of permanentImpacts) {
    await suggestPermanentDocUpdate(impact);
  }

  // Update ADRs with new decisions
  await updateArchitectureDecisions(projectLearnings.decisions);
}
```text

### Strategy 3: Hybrid Bootstrap + Continuous Updates

The best approach combines both strategies.

## 🔄 Implementation Flow

### Phase 1: Initial Bootstrap

```mermaid
flowchart TD
    A[Install Aichaku] --> B{Existing Project?}
    B -->|Yes| C[Code Analysis]
    B -->|No| D[Template Generation]
    C --> E[Generate Permanent Docs]
    D --> E
    E --> F[Review & Customize]
    F --> G[Establish Baseline]
```text

### Phase 2: Continuous Updates (Methodology-Agnostic)

```mermaid
flowchart TD
    A[Complete ANY Methodology Cycle] --> B[Extract Learnings]
    B --> C[Analyze Permanent Impact]
    C --> D{Updates Needed?}
    D -->|Yes| E[Suggest Updates]
    D -->|No| F[Continue]
    E --> G[User Review]
    G --> H[Apply Updates]
    H --> I[Update Permanent Docs]
```text

## 🛠️ Technical Implementation

### Code Analysis Engine

```typescript
class CodeAnalyzer {
  async analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
    return {
      structure: await this.analyzeStructure(projectPath),
      dependencies: await this.analyzeDependencies(projectPath),
      apis: await this.discoverAPIs(projectPath),
      dataModels: await this.analyzeDataModels(projectPath),
      security: await this.analyzeSecurityPatterns(projectPath),
      documentation: await this.findExistingDocs(projectPath),
    };
  }

  async generatePermanentDocs(analysis: ProjectAnalysis): Promise<void> {
    // Generate Arc42 architecture from structure
    await this.generateArchitectureDocs(analysis.structure);

    // Generate API docs from discovered endpoints
    await this.generateAPIDocs(analysis.apis);

    // Generate data model docs
    await this.generateDataModelDocs(analysis.dataModels);

    // Generate security docs from patterns
    await this.generateSecurityDocs(analysis.security);
  }
}
```text

### Methodology-Agnostic Project Completion Handler

```typescript
class PermanentDocManager {
  // Works with ANY methodology (Shape Up, Scrum, Kanban, Lean, etc.)
  async handleProjectCompletion(
    projectDir: string,
    methodology: string,
  ): Promise<void> {
    const projectLearnings = await this.extractLearnings(
      projectDir,
      methodology,
    );
    const impacts = await this.analyzePermanentImpacts(projectLearnings);

    console.log(
      `🪴 Aichaku: Analyzing ${methodology} project completion for permanent doc updates...`,
    );

    for (const impact of impacts) {
      await this.suggestUpdate(impact);
    }
  }

  async extractLearnings(
    projectDir: string,
    methodology: string,
  ): Promise<ProjectLearnings> {
    switch (methodology) {
      case "shape-up":
        return await this.extractShapeUpLearnings(projectDir);
      case "scrum":
        return await this.extractScrumLearnings(projectDir);
      case "kanban":
        return await this.extractKanbanLearnings(projectDir);
      case "lean":
        return await this.extractLeanLearnings(projectDir);
      default:
        return await this.extractGenericLearnings(projectDir);
    }
  }

  // Shape Up specific extraction
  async extractShapeUpLearnings(projectDir: string): Promise<ProjectLearnings> {
    const pitch = await this.parsePitchDocument(projectDir);
    const decisions = await this.extractDecisionsFromCoolDown(projectDir);
    const architectureChanges = await this.extractArchitectureChanges(
      projectDir,
    );

    return { pitch, decisions, architectureChanges, methodology: "shape-up" };
  }

  // Scrum specific extraction
  async extractScrumLearnings(projectDir: string): Promise<ProjectLearnings> {
    const sprintRetrospective = await this.parseRetrospective(projectDir);
    const userStories = await this.extractCompletedUserStories(projectDir);
    const technicalDebt = await this.extractTechnicalDebt(projectDir);

    return {
      sprintRetrospective,
      userStories,
      technicalDebt,
      methodology: "scrum",
    };
  }

  // Kanban specific extraction
  async extractKanbanLearnings(projectDir: string): Promise<ProjectLearnings> {
    const completedCards = await this.extractCompletedCards(projectDir);
    const flowMetrics = await this.extractFlowMetrics(projectDir);
    const processImprovements = await this.extractProcessImprovements(
      projectDir,
    );

    return {
      completedCards,
      flowMetrics,
      processImprovements,
      methodology: "kanban",
    };
  }

  // Lean specific extraction
  async extractLeanLearnings(projectDir: string): Promise<ProjectLearnings> {
    const experiments = await this.extractExperiments(projectDir);
    const metrics = await this.extractMetrics(projectDir);
    const hypotheses = await this.extractValidatedHypotheses(projectDir);

    return { experiments, metrics, hypotheses, methodology: "lean" };
  }
}
```text

## 📋 Methodology-Specific User Experience Flows

### Shape Up Completion

1. **Cool-down Phase**: "🪴 Aichaku: Analyzing Shape Up cycle for permanent doc
   updates..."

2. **Extract Decisions**: Parse pitch outcomes and architecture decisions

3. **Update ADRs**: Add new architecture decisions to permanent records

4. **API Changes**: Update API documentation if endpoints changed

### Scrum Sprint Completion

1. **Sprint Review**: "🪴 Aichaku: Analyzing Sprint retrospective for permanent
   doc updates..."

2. **Story Analysis**: Extract technical learnings from completed user stories

3. **Update Documentation**: Reflect new features in permanent API/architecture
   docs

4. **Technical Debt**: Add to permanent technical debt tracking

### Kanban Flow Analysis

1. **Flow Metrics**: "🪴 Aichaku: Analyzing Kanban flow metrics for process
   improvements..."

2. **Card Analysis**: Extract technical patterns from completed cards

3. **Process Updates**: Update operational documentation based on flow
   improvements

4. **Bottleneck Resolution**: Document solutions in permanent operational guides

### Lean Experiment Completion

1. **Hypothesis Validation**: "🪴 Aichaku: Analyzing Lean experiment results for
   permanent doc updates..."

2. **Metric Analysis**: Extract validated assumptions for permanent
   documentation

3. **Feature Documentation**: Update permanent docs based on validated features

4. **Learning Integration**: Add validated hypotheses to permanent knowledge
   base

## 📖 Enhanced README Structure

```markdown
# Project Name

Brief description of what this project does.

## 📚 Documentation Architecture

### 🏗️ Permanent Reference Documents

System-wide documentation that persists across all projects and methodologies:

- **[Architecture](references/architecture/)** - System design using Arc42
  framework

- **[API Reference](references/api/)** - REST/GraphQL/CLI documentation

- **[Data Models](references/data/)** - Database schemas and entity
  relationships

- **[Security](references/security/)** - Security policies, threat models,
  compliance

- **[Operations](references/operations/)** - Deployment guides and runbooks

- **[Integration](references/integration/)** - External system interfaces

- **[Decisions](references/decisions/)** - Architecture Decision Records (ADRs)

### 🚀 Project Documents

Current and past project work across all methodologies:

- **[Active Projects](.claude/output/active-*)** - Current cycles (Shape Up,
  Scrum, Kanban, Lean)

- **[Completed Projects](.claude/output/done-*)** - Historical project
  documentation

- **[Test Projects](.claude/output/test-*)** - Experimental and validation work

### 🔗 Quick Links

- **[Contributing](CONTRIBUTING.md)** - How to contribute to this project

- **[Security](SECURITY.md)** - Security policy and vulnerability reporting

- **[Support](SUPPORT.md)** - How to get help

## 🎯 Development Methodologies

This project uses [Aichaku](https://github.com/RickCogley/aichaku) for
methodology-agnostic project management:

- **Shape Up**: 6-week cycles with pitches and cool-downs

- **Scrum**: Sprint-based development with retrospectives

- **Kanban**: Continuous flow with WIP limits

- **Lean**: Experiment-driven development with hypothesis validation

All methodologies feed learnings into the permanent reference documentation.

## 🔧 Getting Started

1. **For Contributors**: Start with [Contributing](CONTRIBUTING.md)

2. **For Architecture**: See [System Architecture](references/architecture/)

3. **For API Usage**: Check [API Reference](references/api/)

4. **For Security**: Review [Security Policy](SECURITY.md)

---

_Documentation generated and maintained by
[Aichaku](https://github.com/RickCogley/aichaku)_
```text

## 🔧 MCP Integration Enhancement

The MCP server enhances this with methodology-aware analysis:

```typescript
// MCP server enhancement for methodology-agnostic permanent doc updates
class MethodologyAwareReviewer {
  async reviewProjectCompletion(projectDir: string): Promise<ReviewResult> {
    const methodology = await this.detectMethodology(projectDir);
    const learnings = await this.extractMethodologySpecificLearnings(
      projectDir,
      methodology,
    );
    const permanentImpacts = await this.analyzePermanentImpacts(learnings);

    return {
      methodology,
      learnings,
      suggestedUpdates: permanentImpacts,
      complianceStatus: await this.checkCompliance(learnings),
    };
  }
}
```text

## 🎯 Key Benefits

1. **Methodology Agnostic**: Works with Shape Up, Scrum, Kanban, Lean, and
   custom methodologies

2. **Automatic Knowledge Transfer**: Project learnings automatically feed
   permanent documentation

3. **Living Documentation**: Permanent docs stay current with actual system
   state

4. **Consistent Structure**: All methodologies contribute to the same permanent
   documentation structure

5. **Gradual Improvement**: Documentation quality improves over time through
   accumulated learnings

This creates a comprehensive knowledge management system where temporary project
work continuously enhances permanent system knowledge, regardless of which
methodology teams choose to use.
````
