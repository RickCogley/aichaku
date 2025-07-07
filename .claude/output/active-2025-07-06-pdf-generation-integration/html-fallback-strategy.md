# HTML Fallback Strategy for Business Communication

## Overview

While PDF is ideal for formal documents, HTML provides an excellent intermediate format that:
- Works immediately without dependencies
- Renders beautifully in browsers
- Can be converted to PDF via browser print
- **Renders natively in SharePoint** (discovered capability!)

## Implementation Strategy

### 1. Progressive Enhancement Approach

```typescript
// src/output/generator.ts
export class OutputGenerator {
  async generate(inputPath: string, format: OutputFormat): Promise<OutputResult> {
    switch (format) {
      case 'html':
        return this.generateHTML(inputPath);  // Always works
      case 'pdf':
        return await this.generatePDF(inputPath) || 
               this.generateHTMLWithPDFInstructions(inputPath);
      case 'auto':
        return this.generateBestAvailable(inputPath);
    }
  }
}
```

### 2. HTML Generation (Zero Dependencies)

```typescript
// src/output/html.ts
export class HTMLGenerator {
  async generate(mdPath: string): Promise<string> {
    const content = await Deno.readTextFile(mdPath);
    const html = await this.markdownToHTML(content);
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this.extractTitle(content)}</title>
  <style>
    ${this.getProfessionalStyles()}
  </style>
</head>
<body>
  <div class="container">
    ${html}
  </div>
  <footer>
    <p>Generated with Aichaku • ${new Date().toLocaleDateString()}</p>
  </footer>
</body>
</html>`;
  }
  
  private getProfessionalStyles(): string {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      h1, h2, h3 { color: #2c3e50; }
      code { 
        background: #f4f4f4; 
        padding: 2px 4px; 
        border-radius: 3px;
      }
      pre {
        background: #f4f4f4;
        padding: 10px;
        border-radius: 5px;
        overflow-x: auto;
      }
      blockquote {
        border-left: 4px solid #ddd;
        margin-left: 0;
        padding-left: 20px;
        color: #666;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th { background: #f4f4f4; }
      @media print {
        body { max-width: 100%; }
        .no-print { display: none; }
      }
    `;
  }
}
```

### 3. SharePoint Integration Documentation

```markdown
## SharePoint Native Rendering

Aichaku-generated markdown files render beautifully in SharePoint:

1. **Upload directly**: Drag your .md files to SharePoint
2. **Automatic rendering**: SharePoint displays formatted content
3. **Sharing**: Send SharePoint links to stakeholders
4. **Version control**: SharePoint tracks document versions

### Benefits
- No conversion needed
- Maintains formatting
- Searchable content
- Mobile-friendly viewing
```

### 4. Graceful Degradation Flow

```
┌─────────────────┐
│ Generate Output │
└────────┬────────┘
         │
         v
    ┌────────────┐     Yes    ┌─────────┐
    │ PDF Ready? ├────────────>│   PDF   │
    └─────┬──────┘             └─────────┘
          │ No
          v
    ┌────────────┐
    │    HTML    │
    └─────┬──────┘
          │
          v
┌─────────────────────┐
│ Show PDF Options:   │
│ • Browser Print     │
│ • SharePoint Upload │
│ • Install LaTeX     │
└─────────────────────┘
```

### 5. Updated Settings

```typescript
export interface OutputSettings {
  formats: {
    preferred: "pdf" | "html" | "auto";
    fallback: "html" | "none";
  };
  html: {
    style: "professional" | "minimal" | "custom";
    embedImages: boolean;
  };
  pdf: {
    engine: "xelatex" | "pdflatex" | "auto";
    attemptFallback: boolean;
  };
  sharepoint: {
    mentionCapability: boolean;
    uploadInstructions: boolean;
  };
}
```

## Implementation Priority

1. **Phase 1**: HTML generation (immediate value)
2. **Phase 2**: SharePoint documentation  
3. **Phase 3**: PDF with HTML fallback
4. **Phase 4**: Advanced features (templates, styles)

## Success Metrics

- 100% success rate for output generation
- < 1 second for HTML generation
- Clear instructions for PDF alternatives
- Business-ready output without dependencies