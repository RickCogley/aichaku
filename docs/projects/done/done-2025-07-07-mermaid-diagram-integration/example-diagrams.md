# Mermaid Diagram Examples for Aichaku

## How Mermaid Works

Mermaid diagrams are created using markdown code blocks with the `mermaid` language identifier:

````markdown
```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```
````

## Aichaku Workflow Visualization

### Overall Aichaku Flow
```mermaid
graph TB
    User[User Message] --> Detect{Detect Methodology Keywords}
    Detect -->|Found| Discuss[Discussion Phase]
    Detect -->|Not Found| Normal[Normal Response]
    
    Discuss --> Ready{User Ready?}
    Ready -->|No| Discuss
    Ready -->|Yes| Create[Create Project]
    
    Create --> Folder[Named Folder]
    Folder --> Docs[Generate Documents]
    Docs --> Diagram[Include Diagrams]
```

### Methodology Detection
```mermaid
flowchart LR
    Input[User Input] --> Keywords{Check Keywords}
    Keywords -->|"sprint"| Scrum[Scrum Mode]
    Keywords -->|"shape"| ShapeUp[Shape Up Mode]
    Keywords -->|"kanban"| Kanban[Kanban Mode]
    Keywords -->|"MVP"| Lean[Lean Mode]
    
    Scrum --> Output[Tailored Output]
    ShapeUp --> Output
    Kanban --> Output
    Lean --> Output
```

### Document Generation Pipeline
```mermaid
sequenceDiagram
    participant User
    participant Claude
    participant Aichaku
    participant FileSystem
    
    User->>Claude: "Let's shape up this feature"
    Claude->>Claude: Discuss and refine
    User->>Claude: "Create the project"
    Claude->>Aichaku: Generate documents
    Aichaku->>FileSystem: Create folder
    Aichaku->>FileSystem: Write STATUS.md
    Aichaku->>FileSystem: Write pitch.md
    Aichaku->>FileSystem: Write CHANGE-LOG.md
    Claude->>User: Project created
```

## PDF Generation Approaches

### Option 1: Pre-rendered SVG
```mermaid
graph LR
    MD[Markdown + Mermaid] -->|mermaid-cli| SVG[SVG Files]
    SVG -->|pandoc| PDF[PDF Document]
```

### Option 2: Inline Processing
```mermaid
graph LR
    MD[Markdown] -->|mermaid filter| Processed[Processed MD]
    Processed -->|pandoc| PDF[PDF Document]
```

## Benefits Visualization
```mermaid
mindmap
  root((Mermaid in Aichaku))
    Visual Clarity
      Instant understanding
      Complex relationships
      Workflow visualization
    Developer Friendly
      Text-based
      Version control
      No binary files
    Universal Support
      GitHub rendering
      Markdown viewers
      Export options
    Integration
      Native markdown
      PDF generation
      Web viewing
```

## Implementation Status
```mermaid
gantt
    title Mermaid Integration Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research & Design           :done, 2025-07-07, 1d
    Create Examples            :active, 2025-07-07, 1d
    section Implementation
    Update CLAUDE.md           :2025-07-07, 1d
    Create Templates           :2025-07-08, 1d
    PDF Script Enhancement     :2025-07-08, 1d
    section Testing
    Integration Testing        :2025-07-09, 2d
```

## Notes on PDF Generation

The key challenge is that Mermaid blocks need to be converted to images for PDF. Here's a working approach:

```bash
# Install mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Convert mermaid blocks to SVG
mmdc -i document.md -o document-with-svg.md

# Generate PDF with pandoc
pandoc document-with-svg.md -o document.pdf
```

For Aichaku integration, we could:
1. Add this to the existing PDF generation script
2. Make it optional (only if mermaid blocks detected)
3. Cache rendered diagrams for performance