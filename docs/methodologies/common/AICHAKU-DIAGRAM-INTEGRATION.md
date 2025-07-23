# Integrating Mermaid Diagrams into Aichaku Methodology

## Overview

This guide shows how to seamlessly integrate the comprehensive Mermaid diagram
patterns into Aichaku's methodology-driven development approach. It provides
specific guidance for each methodology supported by Aichaku.

## Aichaku Integration Points

### 1. PLANNING MODE Integration

When users enter planning mode with methodology keywords, enhance the generated
documents with appropriate diagrams:

#### Shape Up Integration

````mermaid
graph TD
    Problem[Problem Definition] --> Appetite[Define Appetite]
    Appetite --> Solution[Solution Outline]
    Solution --> Boundaries[Set Boundaries]
    Boundaries --> Pitch[Write Pitch]

    style Problem fill:#ff9800,stroke:#f57c00
    style Appetite fill:#2196f3,stroke:#1976d2
    style Solution fill:#4caf50,stroke:#388e3c
    style Pitch fill:#9c27b0,stroke:#7b1fa2
```text

**When to Generate**:

- Problem identification triggers context diagram

- Solution shaping creates component diagrams

- Pitch writing includes user journey diagrams

#### Scrum Integration

```mermaid
graph LR
    PB[Product Backlog] --> SP[Sprint Planning]
    SP --> SB[Sprint Backlog]
    SB --> Daily[Daily Scrum]
    Daily --> Review[Sprint Review]
    Review --> Retro[Retrospective]
    Retro --> PB

    style Daily fill:#90EE90
    style Review fill:#FFB6C1
    style Retro fill:#DDA0DD
```text

**When to Generate**:

- Sprint planning creates Gantt charts

- User story breakdown generates flowcharts

- Retrospectives use journey diagrams

#### Kanban Integration

```mermaid
graph LR
    Backlog[📋 Backlog] --> Todo[📝 To Do]
    Todo --> Progress[🔄 In Progress]
    Progress --> Review[👀 Review]
    Review --> Done[✅ Done]

    Progress --> Blocked[🚫 Blocked]
    Blocked --> Progress

    style Progress fill:#FFA500
    style Blocked fill:#FF6B6B
    style Done fill:#4ECDC4
```text

**When to Generate**:

- Board setup creates state diagrams

- Flow analysis generates flow charts

- Metrics tracking uses pie charts

### 2. EXECUTION MODE Integration

During active development, automatically generate relevant diagrams:

#### Code-to-Diagram Generation

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as Git Hook
    participant Gen as Diagram Generator
    participant Docs as Documentation

    Dev->>Git: Commit Code
    Git->>Gen: Trigger Generation
    Gen->>Gen: Analyze Code Changes
    Gen->>Docs: Update Class Diagrams
    Gen->>Docs: Update Sequence Diagrams
    Docs-->>Dev: Updated Documentation
```text

#### Database Schema Updates

```mermaid
graph TD
    Schema[Database Schema] --> Migration[Run Migration]
    Migration --> Generate[Generate ER Diagram]
    Generate --> Review[Review Changes]
    Review --> Commit[Commit Updates]

    style Schema fill:#1976d2,stroke:#0d47a1,color:#ffffff
    style Generate fill:#388e3c,stroke:#2e7d32,color:#ffffff
```text

### 3. IMPROVEMENT MODE Integration

During reflection and optimization phases:

#### Retrospective Analysis

```mermaid
journey
    title Sprint Retrospective Analysis
    section What Went Well
      Team Collaboration    : 5: Team
      Code Quality         : 4: Team
      Testing Coverage     : 3: Team
    section What Went Wrong
      Communication Gaps   : 2: Team
      Technical Debt       : 1: Team
    section Action Items
      Improve Daily Standups: 4: Team
      Refactor Core Module  : 3: Team
      Add Integration Tests : 5: Team
```text

#### Performance Optimization

```mermaid
graph TD
    Measure[Measure Performance] --> Identify[Identify Bottlenecks]
    Identify --> Plan[Plan Optimization]
    Plan --> Implement[Implement Changes]
    Implement --> Test[Test Results]
    Test --> Validate{Improved?}
    Validate -->|Yes| Document[Document Changes]
    Validate -->|No| Identify

    style Measure fill:#64b5f6,stroke:#1976d2
    style Validate fill:#ffd54f,stroke:#f9a825
    style Document fill:#81c784,stroke:#388e3c
```text

## Methodology-Specific Templates

### Shape Up Templates

#### Pitch Template Enhancement

```markdown
# Shape Up Pitch: [Title]

## Problem

[Description]

## Appetite

- Time: [6 weeks / 2 weeks]

- Team: [Size]

## Solution

[High-level approach]

```mermaid
graph TD
    A[Current State] --> B[Proposed Solution]
    B --> C[Expected Outcome]

    style A fill:#ffcdd2,stroke:#d32f2f
    style B fill:#fff3e0,stroke:#f57c00
    style C fill:#c8e6c9,stroke:#388e3c
```text

## Rabbit Holes

- [Potential complexity traps]

## No-gos

- [What we won't do]

## Technical Approach

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: [User action]
    F->>A: [API call]
    A->>D: [Data operation]
    D-->>A: [Response]
    A-->>F: [Result]
    F-->>U: [Updated UI]
```text

#### Hill Chart Template

```markdown
# Hill Chart: [Project Name]

## Current Status

```mermaid
graph LR
    Problem[Problem<br/>Solving] --> Building[Building<br/>Solution]

    subgraph "Problem Solving (Figuring Things Out)"
        A[Point A<br/>🔴 Stuck] --> B[Point B<br/>🟡 Progress]
    end

    subgraph "Building Solution (Execution)"
        C[Point C<br/>🟢 Rolling] --> D[Point D<br/>✅ Done]
    end

    style A fill:#ffcdd2,stroke:#d32f2f
    style B fill:#fff3e0,stroke:#f57c00
    style C fill:#c8e6c9,stroke:#388e3c
    style D fill:#e8f5e8,stroke:#4caf50
```text

## Weekly Progress

- Week 1: [Status and position]

- Week 2: [Status and position]

- ...

### Scrum Templates

#### Sprint Planning Enhancement

```markdown
# Sprint Planning: Sprint [Number]

## Sprint Goal
[Clear, concise goal]

## Capacity

- Team: [X] developers

- Velocity: [Y] story points

- Sprint duration: [Z] days

## Sprint Backlog

```mermaid
graph TD
    Goal[Sprint Goal] --> US1[User Story 1]
    Goal --> US2[User Story 2]
    Goal --> US3[User Story 3]

    US1 --> T1[Task 1.1]
    US1 --> T2[Task 1.2]
    US2 --> T3[Task 2.1]
    US2 --> T4[Task 2.2]
    US3 --> T5[Task 3.1]

    style Goal fill:#2196f3,stroke:#1976d2,color:#ffffff
    style US1 fill:#4caf50,stroke:#388e3c,color:#ffffff
    style US2 fill:#4caf50,stroke:#388e3c,color:#ffffff
    style US3 fill:#4caf50,stroke:#388e3c,color:#ffffff
```text

## Timeline

```mermaid
gantt
    title Sprint [Number] Timeline
    dateFormat YYYY-MM-DD

    section Sprint Events
    Sprint Planning    :done, planning, 2024-01-08, 1d
    Daily Standups     :active, daily, 2024-01-09, 9d
    Sprint Review      :review, 2024-01-18, 1d
    Sprint Retrospective :retro, 2024-01-18, 1d

    section Development
    User Story 1       :us1, 2024-01-09, 3d
    User Story 2       :us2, 2024-01-10, 5d
    User Story 3       :us3, 2024-01-12, 4d
```text

#### User Story Template

```markdown
# User Story: [Title]

## Story
As a [user type], I want [goal] so that [benefit].

## Acceptance Criteria

- [ ] [Criterion 1]

- [ ] [Criterion 2]

- [ ] [Criterion 3]

## Flow Diagram

```mermaid
graph TD
    Start[User starts task] --> Input[Provide input]
    Input --> Validate{Valid input?}
    Validate -->|Yes| Process[Process request]
    Validate -->|No| Error[Show error]
    Error --> Input
    Process --> Success[Show success]
    Success --> End[Task complete]

    style Start fill:#e3f2fd,stroke:#1976d2
    style Success fill:#e8f5e8,stroke:#388e3c
    style Error fill:#ffebee,stroke:#d32f2f
```text

## Technical Implementation

```mermaid
sequenceDiagram
    participant U as User
    participant UI as User Interface
    participant C as Controller
    participant S as Service
    participant DB as Database

    U->>UI: [User action]
    UI->>C: [Request]
    C->>S: [Business logic]
    S->>DB: [Data operation]
    DB-->>S: [Result]
    S-->>C: [Response]
    C-->>UI: [Update]
    UI-->>U: [Feedback]
```text

### Kanban Templates

#### Board Setup Template

```markdown
# Kanban Board: [Project Name]

## Workflow States

```mermaid
stateDiagram-v2
    [*] --> Backlog
    Backlog --> Todo : Priority assigned
    Todo --> InProgress : Work starts
    InProgress --> Review : Work complete
    Review --> Done : Approved
    Review --> InProgress : Changes needed
    InProgress --> Blocked : Impediment
    Blocked --> InProgress : Impediment resolved
    Done --> [*]

    Backlog : New items<br/>Not yet prioritized
    Todo : Ready for work<br/>Prioritized
    InProgress : Active development<br/>WIP limit: 3
    Review : Code review<br/>Testing
    Blocked : Waiting<br/>Impediment exists
    Done : Completed<br/>Meets DoD
```text

## Work in Progress Limits

- To Do: No limit

- In Progress: 3 items

- Review: 2 items

## Definition of Done

- [ ] Code review completed

- [ ] Tests written and passing

- [ ] Documentation updated

- [ ] Deployed to staging

#### Flow Metrics Template

```markdown
# Flow Metrics: [Time Period]

## Throughput Analysis

```mermaid
graph LR
    subgraph "Throughput (Items/Week)"
        W1[Week 1<br/>5 items] --> W2[Week 2<br/>7 items]
        W2 --> W3[Week 3<br/>6 items]
        W3 --> W4[Week 4<br/>8 items]
    end

    style W1 fill:#e3f2fd
    style W2 fill:#e8f5e8
    style W3 fill:#fff3e0
    style W4 fill:#f3e5f5
```text

## Lead Time Distribution

```mermaid
pie title Lead Time Distribution
    "1-3 days" : 25
    "4-7 days" : 40
    "8-14 days" : 25
    "15+ days" : 10
```text

## Cycle Time Trend

```mermaid
graph TD
    subgraph "Cycle Time Analysis"
        A[Average: 5.2 days] --> B[Trend: Decreasing]
        B --> C[Target: <5 days]
    end

    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#fff3e0
```text

## Automated Integration

### GitHub Actions Integration

```yaml
name: Aichaku Diagram Generation
on:

  push:
    paths:

      - '.claude/output/active-*/**'

      - 'src/**/*.ts'

      - 'database/schema.sql'

jobs:

  generate-diagrams:
    runs-on: ubuntu-latest
    steps:

    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install Mermaid CLI
      run: npm install -g @mermaid-js/mermaid-cli

    - name: Generate Architecture Diagrams
      run: |
        # Find active Aichaku projects
        for project in .claude/output/active-*; do
          if [[ -d "$project" ]]; then
            echo "Processing $project"

            # Generate class diagrams from code
            if [[ -f "$project/CODE_ANALYSIS.md" ]]; then
              node scripts/generate-class-diagrams.js "$project"
            fi

            # Generate sequence diagrams from API specs
            if [[ -f "$project/API_SPEC.yaml" ]]; then
              node scripts/generate-sequence-diagrams.js "$project"
            fi

            # Generate ER diagrams from database schema
            if [[ -f "$project/DATABASE_SCHEMA.sql" ]]; then
              node scripts/generate-er-diagrams.js "$project"
            fi
          fi
        done

    - name: Render Mermaid Diagrams
      run: |
        for file in .claude/output/active-*/**/*.mmd; do
          if [[ -f "$file" ]]; then
            output="${file%.mmd}.svg"
            mmdc -i "$file" -o "$output" -t dark -b transparent
          fi
        done

    - name: Commit Generated Diagrams
      run: |
        git config user.name "github-actions[bot]"
        git config user.email "github-actions[bot]@users.noreply.github.com"
        git add .claude/output/
        git commit -m "docs: update generated diagrams for active projects" || true
        git push
```text

### VS Code Integration

```json
{
  "aichaku.diagramGeneration": {
    "autoGenerate": true,
    "triggers": ["pitch.md", "sprint-planning.md", "kanban-board.md"],
    "outputFormat": ["svg", "png"],
    "theme": "dark"
  },
  "files.associations": {
    "*.mmd": "mermaid"
  }
}
```text

## Best Practices for Aichaku Integration

### 1. Context-Aware Generation

Generate diagrams based on methodology context:

- **Shape Up**: Focus on problem-solution flows and hill charts

- **Scrum**: Emphasize sprint timelines and user story breakdowns

- **Kanban**: Show workflow states and flow metrics

- **Lean**: Highlight experiments and learning cycles

### 2. Progressive Enhancement

Start with basic diagrams and enhance based on project complexity:

- Simple projects: Basic flowcharts and state diagrams

- Complex projects: Detailed sequence diagrams and architecture views

- Large systems: Multi-level C4 diagrams and service meshes

### 3. Lifecycle Management

Align diagram updates with project phases:

- **Planning**: Architecture and flow diagrams

- **Execution**: Code-generated diagrams and progress tracking

- **Review**: Retrospective journeys and improvement flows

### 4. Consistency Across Methodologies

Maintain visual consistency while adapting to methodology specifics:

- Use consistent color schemes across all diagrams

- Standardize iconography and symbols

- Apply uniform styling for similar concepts

## Summary

This integration guide shows how to seamlessly blend comprehensive Mermaid
diagram patterns with Aichaku's methodology-driven approach. By automatically
generating contextually appropriate diagrams, teams can maintain up-to-date
visual documentation that supports their chosen methodology while following
software engineering best practices.

The result is documentation that:

- **Stays Current**: Automatically updates with code changes

- **Matches Methodology**: Provides relevant visuals for each approach

- **Scales Appropriately**: Grows in complexity with project needs

- **Maintains Quality**: Follows established patterns and best practices
````
