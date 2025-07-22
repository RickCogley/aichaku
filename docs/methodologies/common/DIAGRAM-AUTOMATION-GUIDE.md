# Diagram Generation and Automation Guide

## Overview

This guide covers tools and techniques for automating Mermaid diagram
generation, maintaining consistency, and integrating diagrams into development
workflows.

## Table of Contents

1. [Code to Diagram Generation](#code-to-diagram-generation)
2. [Database Schema Visualization](#database-schema-visualization)
3. [API Documentation Integration](#api-documentation-integration)
4. [Architecture Documentation as Code](#architecture-documentation-as-code)
5. [CI/CD Integration](#cicd-integration)
6. [Diagram Testing and Validation](#diagram-testing-and-validation)
7. [Version Control Strategies](#version-control-strategies)
8. [Export and Publishing](#export-and-publishing)

## Code to Diagram Generation

### TypeScript/JavaScript Class Diagrams

#### Using tplant

```bash
# Install
npm install -g tplant

# Generate class diagram from TypeScript
tplant --input "src/**/*.ts" --output docs/diagrams/classes.mmd

# With specific options
tplant \
  --input "src/**/*.ts" \
  --output docs/diagrams/classes.mmd \
  --exclude "**/*.test.ts" \
  --associations \
  --show-inheritance
```

#### Custom TypeScript Parser

```typescript
// diagram-generator.ts
import * as ts from "typescript";
import * as fs from "fs";

class MermaidClassDiagramGenerator {
  private classes: Map<string, ClassInfo> = new Map();

  generateFromFile(filePath: string): string {
    const program = ts.createProgram([filePath], {});
    const sourceFile = program.getSourceFile(filePath);

    if (sourceFile) {
      ts.forEachChild(sourceFile, (node) => this.visit(node));
    }

    return this.generateMermaid();
  }

  private visit(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;
      const classInfo: ClassInfo = {
        name: className,
        properties: [],
        methods: [],
        extends: this.getExtends(node),
        implements: this.getImplements(node),
      };

      node.members.forEach((member) => {
        if (ts.isPropertyDeclaration(member)) {
          classInfo.properties.push(this.getPropertyInfo(member));
        } else if (ts.isMethodDeclaration(member)) {
          classInfo.methods.push(this.getMethodInfo(member));
        }
      });

      this.classes.set(className, classInfo);
    }
  }

  private generateMermaid(): string {
    let mermaid = "classDiagram\n";

    this.classes.forEach((classInfo, className) => {
      // Add class definition
      mermaid += `  class ${className} {\n`;

      // Add properties
      classInfo.properties.forEach((prop) => {
        mermaid += `    ${prop.visibility}${prop.name}: ${prop.type}\n`;
      });

      // Add methods
      classInfo.methods.forEach((method) => {
        mermaid +=
          `    ${method.visibility}${method.name}(${method.params}): ${method.returnType}\n`;
      });

      mermaid += "  }\n\n";

      // Add relationships
      if (classInfo.extends) {
        mermaid += `  ${classInfo.extends} <|-- ${className}\n`;
      }

      classInfo.implements.forEach((iface) => {
        mermaid += `  ${iface} <|.. ${className}\n`;
      });
    });

    return mermaid;
  }
}
```

### Python Class Diagrams

{% raw %}

```python
# py2mermaid.py
import ast
import sys
from typing import List, Dict, Set

class MermaidGenerator(ast.NodeVisitor):
    def **init**(self):
        self.classes = {}
        self.relationships = []

    def visit_ClassDef(self, node):
        class_info = {
            'name': node.name,
            'methods': [],
            'attributes': [],
            'bases': [base.id for base in node.bases if isinstance(base, ast.Name)]
        }

        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                method_info = {
                    'name': item.name,
                    'params': [arg.arg for arg in item.args.args],
                    'is*private': item.name.startswith('*')
                }
                class*info['methods'].append(method*info)
            elif isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        class_info['attributes'].append(target.id)

        self.classes[node.name] = class_info
        self.generic_visit(node)

    def generate_mermaid(self) -> str:
        lines = ['classDiagram']

        # Generate class definitions
        for class_name, info in self.classes.items():
            lines.append(f'  class {class_name} {{')

            # Add attributes
            for attr in info['attributes']:
                lines.append(f'    {attr}')

            # Add methods
            for method in info['methods']:
                visibility = '-' if method['is_private'] else '+'
                params = ', '.join(method['params'])
                lines.append(f'    {visibility}{method["name"]}({params})')

            lines.append('  }')

            # Add inheritance relationships
            for base in info['bases']:
                lines.append(f'  {base} <|-- {class_name}')

        return '\n'.join(lines)

def generate*from*file(filepath: str) -> str:
    with open(filepath, 'r') as f:
        tree = ast.parse(f.read())

    generator = MermaidGenerator()
    generator.visit(tree)
    return generator.generate_mermaid()

if **name** == '**main**':
    if len(sys.argv) > 1:
        diagram = generate*from*file(sys.argv[1])
        print(diagram)
```

{% endraw %}

### Go Structure Diagrams

```go
// go2mermaid.go
package main

import (
    "fmt"
    "go/ast"
    "go/parser"
    "go/token"
    "strings"
)

type StructInfo struct {
    Name       string
    Fields     []FieldInfo
    Methods    []MethodInfo
    Embeds     []string
}

type FieldInfo struct {
    Name string
    Type string
    Tag  string
}

type MethodInfo struct {
    Name       string
    Receiver   string
    Parameters []string
    Returns    []string
}

func GenerateMermaidFromFile(filename string) (string, error) {
    fset := token.NewFileSet()
    node, err := parser.ParseFile(fset, filename, nil, parser.ParseComments)
    if err != nil {
        return "", err
    }

    structs := make(map[string]*StructInfo)

    // Extract structs
    ast.Inspect(node, func(n ast.Node) bool {
        switch x := n.(type) {
        case *ast.TypeSpec:
            if structType, ok := x.Type.(*ast.StructType); ok {
                info := &StructInfo{Name: x.Name.Name}

                for _, field := range structType.Fields.List {
                    fieldInfo := extractFieldInfo(field)
                    if fieldInfo.Name == "" {
                        // Embedded field
                        info.Embeds = append(info.Embeds, fieldInfo.Type)
                    } else {
                        info.Fields = append(info.Fields, fieldInfo)
                    }
                }

                structs[x.Name.Name] = info
            }
        case *ast.FuncDecl:
            if x.Recv != nil && len(x.Recv.List) > 0 {
                // Method
                methodInfo := extractMethodInfo(x)
                if structInfo, ok := structs[methodInfo.Receiver]; ok {
                    structInfo.Methods = append(structInfo.Methods, methodInfo)
                }
            }
        }
        return true
    })

    return generateMermaid(structs), nil
}

func generateMermaid(structs map[string]*StructInfo) string {
    var builder strings.Builder
    builder.WriteString("classDiagram\n")

    for _, info := range structs {
        builder.WriteString(fmt.Sprintf("  class %s {\n", info.Name))

        // Fields
        for _, field := range info.Fields {
            builder.WriteString(fmt.Sprintf("    %s %s\n", field.Name, field.Type))
        }

        // Methods
        for _, method := range info.Methods {
            params := strings.Join(method.Parameters, ", ")
            returns := strings.Join(method.Returns, ", ")
            builder.WriteString(fmt.Sprintf("    %s(%s) %s\n", method.Name, params, returns))
        }

        builder.WriteString("  }\n\n")

        // Embedded relationships
        for _, embed := range info.Embeds {
            builder.WriteString(fmt.Sprintf("  %s <|-- %s : embeds\n", embed, info.Name))
        }
    }

    return builder.String()
}
```

## Database Schema Visualization

### SQL to Mermaid

```javascript
// sql2mermaid.js
const parser = require("sql-parser");

class SQLToMermaid {
  constructor() {
    this.tables = new Map();
    this.relationships = [];
  }

  parseSQL(sql) {
    const statements = parser.parse(sql);

    statements.forEach((stmt) => {
      if (stmt.type === "create_table") {
        this.parseCreateTable(stmt);
      }
    });

    return this.generateMermaid();
  }

  parseCreateTable(stmt) {
    const tableName = stmt.table;
    const columns = [];
    const foreignKeys = [];

    stmt.columns.forEach((col) => {
      const column = {
        name: col.name,
        type: col.type,
        constraints: [],
      };

      if (col.primary_key) column.constraints.push("PK");
      if (col.unique) column.constraints.push("UK");
      if (col.not_null) column.constraints.push("NOT NULL");
      if (col.references) {
        column.constraints.push("FK");
        foreignKeys.push({
          from: tableName,
          to: col.references.table,
          fromColumn: col.name,
          toColumn: col.references.column,
        });
      }

      columns.push(column);
    });

    this.tables.set(tableName, columns);
    this.relationships.push(...foreignKeys);
  }

  generateMermaid() {
    let mermaid = "erDiagram\n";

    // Define relationships
    const relationshipMap = new Map();
    this.relationships.forEach((rel) => {
      const key = `${rel.from}-${rel.to}`;
      if (!relationshipMap.has(key)) {
        relationshipMap.set(key, []);
      }
      relationshipMap.get(key).push(rel);
    });

    // Output relationships
    relationshipMap.forEach((rels, key) => {
      const [from, to] = key.split("-");
      mermaid += `  ${from} ||--o{ ${to} : "has"\n`;
    });

    mermaid += "\n";

    // Define tables
    this.tables.forEach((columns, tableName) => {
      mermaid += `  ${tableName} {\n`;
      columns.forEach((col) => {
        const constraints = col.constraints.join(" ");
        mermaid += `    ${col.type} ${col.name} ${constraints}\n`;
      });
      mermaid += "  }\n\n";
    });

    return mermaid;
  }
}

// Usage
const sql = `
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(10, 2),
  status VARCHAR(50)
);
`;

const converter = new SQLToMermaid();
console.log(converter.parseSQL(sql));
```

### Prisma Schema to Mermaid

```typescript
// prisma2mermaid.ts
import { readFileSync } from "fs";

interface Model {
  name: string;
  fields: Field[];
}

interface Field {
  name: string;
  type: string;
  isRequired: boolean;
  isUnique: boolean;
  isPrimary: boolean;
  relation?: {
    to: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
  };
}

class PrismaToMermaid {
  parseSchema(schemaPath: string): string {
    const schema = readFileSync(schemaPath, "utf-8");
    const models = this.extractModels(schema);
    return this.generateMermaid(models);
  }

  private extractModels(schema: string): Model[] {
    const models: Model[] = [];
    const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;

    let match;
    while ((match = modelRegex.exec(schema)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];
      const fields = this.extractFields(modelBody, modelName);

      models.push({
        name: modelName,
        fields,
      });
    }

    return models;
  }

  private extractFields(modelBody: string, modelName: string): Field[] {
    const fields: Field[] = [];
    const fieldRegex = /(\w+)\s+(\w+)(\[\])?(\?)?(.*)$/gm;

    let match;
    while ((match = fieldRegex.exec(modelBody)) !== null) {
      const field: Field = {
        name: match[1],
        type: match[2],
        isRequired: !match[4],
        isUnique: match[5].includes("@unique"),
        isPrimary: match[5].includes("@id"),
      };

      // Check for relations
      if (match[5].includes("@relation")) {
        const relationMatch = /@relation\(.*references:\s*\[(\w+)\]/.exec(
          match[5],
        );
        if (relationMatch) {
          field.relation = {
            to: match[2],
            type: match[3] ? "one-to-many" : "one-to-one",
          };
        }
      }

      fields.push(field);
    }

    return fields;
  }

  private generateMermaid(models: Model[]): string {
    let mermaid = "erDiagram\n";

    // Generate relationships
    const relationships = new Set<string>();
    models.forEach((model) => {
      model.fields.forEach((field) => {
        if (field.relation) {
          const relType = field.relation.type === "one-to-many"
            ? "||--o{"
            : "||--||";
          const rel =
            `  ${model.name} ${relType} ${field.relation.to} : "${field.name}"`;
          relationships.add(rel);
        }
      });
    });

    relationships.forEach((rel) => {
      mermaid += rel + "\n";
    });

    mermaid += "\n";

    // Generate entities
    models.forEach((model) => {
      mermaid += `  ${model.name} {\n`;
      model.fields.forEach((field) => {
        if (!field.relation) {
          const constraints = [];
          if (field.isPrimary) constraints.push("PK");
          if (field.isUnique) constraints.push("UK");
          const constraintStr = constraints.join(" ");

          mermaid += `    ${field.type} ${field.name} ${constraintStr}\n`;
        }
      });
      mermaid += "  }\n\n";
    });

    return mermaid;
  }
}
```

## API Documentation Integration

### OpenAPI to Sequence Diagrams

```typescript
// openapi2sequence.ts
import { OpenAPIV3 } from "openapi-types";

class OpenAPIToSequence {
  generateSequenceDiagram(
    spec: OpenAPIV3.Document,
    path: string,
    method: string,
  ): string {
    const operation = spec.paths[path]?.[method];
    if (!operation) {
      throw new Error(`Operation ${method} ${path} not found`);
    }

    let diagram = "sequenceDiagram\n";
    diagram += "  participant Client\n";
    diagram += "  participant API\n";

    // Add participants for external services
    const servers = this.extractServers(operation);
    servers.forEach((server) => {
      diagram += `  participant ${server}\n`;
    });

    diagram += "\n";

    // Request
    diagram += `  Client->>API: ${method.toUpperCase()} ${path}\n`;

    // Add request body if present
    if (operation.requestBody) {
      diagram += "  Note over Client,API: Request Body\n";
      const schema = this.getRequestBodySchema(operation.requestBody);
      if (schema) {
        diagram += `  Note right of Client: ${this.schemaToNote(schema)}\n`;
      }
    }

    // Add authentication
    if (operation.security) {
      diagram += "  API->>API: Validate Authentication\n";
    }

    // Add external service calls
    if (servers.length > 0) {
      servers.forEach((server) => {
        diagram += `  API->>${server}: External Call\n`;
        diagram += `  ${server}-->>API: Response\n`;
      });
    }

    // Response
    const responses = operation.responses;
    Object.entries(responses).forEach(([status, response]) => {
      if (status.startsWith("2")) {
        diagram += `  API-->>Client: ${status} ${response.description}\n`;

        const schema = this.getResponseSchema(response);
        if (schema) {
          diagram += `  Note right of API: ${this.schemaToNote(schema)}\n`;
        }
      } else {
        diagram += `  alt ${response.description}\n`;
        diagram += `    API-->>Client: ${status} Error\n`;
        diagram += "  end\n";
      }
    });

    return diagram;
  }

  private extractServers(operation: any): string[] {
    // Extract external service calls from operation description or extensions
    const servers: string[] = [];

    if (operation["x-external-services"]) {
      servers.push(...operation["x-external-services"]);
    }

    return servers;
  }

  private getRequestBodySchema(requestBody: any): any {
    return requestBody.content?.["application/json"]?.schema;
  }

  private getResponseSchema(response: any): any {
    return response.content?.["application/json"]?.schema;
  }

  private schemaToNote(schema: any): string {
    if (schema.type === "object" && schema.properties) {
      const props = Object.keys(schema.properties).join(", ");
      return `{${props}}`;
    }
    return schema.type || "data";
  }
}
```

### GraphQL Schema to Diagram

```typescript
// graphql2mermaid.ts
import {
  GraphQLFieldMap,
  GraphQLObjectType,
  GraphQLSchema,
  isListType,
  isNonNullType,
  isObjectType,
} from "graphql";

class GraphQLToMermaid {
  generateClassDiagram(schema: GraphQLSchema): string {
    const types = schema.getTypeMap();
    let diagram = "classDiagram\n";

    // Filter out built-in types
    const customTypes = Object.entries(types)
      .filter(([name]) => !name.startsWith("**"))
      .filter(([name]) => !["Query", "Mutation", "Subscription"].includes(name))
      .filter(([_, type]) => isObjectType(type));

    // Generate class definitions
    customTypes.forEach(([typeName, type]) => {
      if (isObjectType(type)) {
        diagram += this.generateClassDefinition(typeName, type);
      }
    });

    // Generate relationships
    customTypes.forEach(([typeName, type]) => {
      if (isObjectType(type)) {
        diagram += this.generateRelationships(typeName, type);
      }
    });

    return diagram;
  }

  private generateClassDefinition(
    typeName: string,
    type: GraphQLObjectType,
  ): string {
    let classDef = `  class ${typeName} {\n`;

    const fields = type.getFields();
    Object.entries(fields).forEach(([fieldName, field]) => {
      const fieldType = this.getFieldType(field.type);
      const isRequired = isNonNullType(field.type);
      const requiredMark = isRequired ? "!" : "?";

      classDef += `    ${fieldName}${requiredMark}: ${fieldType}\n`;
    });

    classDef += "  }\n\n";
    return classDef;
  }

  private generateRelationships(
    typeName: string,
    type: GraphQLObjectType,
  ): string {
    let relationships = "";
    const fields = type.getFields();

    Object.entries(fields).forEach(([fieldName, field]) => {
      const fieldType = this.unwrapType(field.type);

      if (isObjectType(fieldType)) {
        const isList = this.isListField(field.type);
        const relationSymbol = isList ? "||--o{" : "||--||";

        relationships +=
          `  ${typeName} ${relationSymbol} ${fieldType.name} : ${fieldName}\n`;
      }
    });

    return relationships;
  }

  private getFieldType(type: any): string {
    if (isNonNullType(type)) {
      return this.getFieldType(type.ofType);
    }

    if (isListType(type)) {
      return `[${this.getFieldType(type.ofType)}]`;
    }

    return type.name || "Unknown";
  }

  private unwrapType(type: any): any {
    if (isNonNullType(type) || isListType(type)) {
      return this.unwrapType(type.ofType);
    }
    return type;
  }

  private isListField(type: any): boolean {
    if (isListType(type)) return true;
    if (isNonNullType(type)) return this.isListField(type.ofType);
    return false;
  }
}
```

## Architecture Documentation as Code

### C4 Model Generator

```typescript
// c4-generator.ts
interface C4System {
  name: string;
  description: string;
  type: "internal" | "external";
  containers?: C4Container[];
}

interface C4Container {
  name: string;
  technology: string;
  description: string;
  components?: C4Component[];
}

interface C4Component {
  name: string;
  technology: string;
  description: string;
  dependencies?: string[];
}

class C4DiagramGenerator {
  generateContextDiagram(systems: C4System[]): string {
    let diagram = "graph TB\n";

    // Add actors
    diagram += "  User[fa:fa-user User]\n";
    diagram += "  Admin[fa:fa-user-shield Admin]\n\n";

    // Add systems
    systems.forEach((system) => {
      const style = system.type === "internal"
        ? "fill:#1168bd,stroke:#0b4884,color:#ffffff"
        : "fill:#999999,stroke:#666666,color:#ffffff";

      diagram += `  ${system.name}[${system.name}<br/>${system.description}]\n`;
      diagram += `  style ${system.name} ${style}\n`;
    });

    diagram += "\n";

    // Add relationships (simplified)
    systems.forEach((system) => {
      if (system.type === "internal") {
        diagram += `  User --> ${system.name}\n`;
        diagram += `  Admin --> ${system.name}\n`;
      }
    });

    return diagram;
  }

  generateContainerDiagram(system: C4System): string {
    if (!system.containers) return "";

    let diagram = `graph TB\n`;
    diagram += `  subgraph "${system.name}"\n`;

    system.containers.forEach((container) => {
      diagram +=
        `    ${container.name}[${container.name}<br/>${container.technology}<br/>${container.description}]\n`;
    });

    diagram += "  end\n\n";

    // Add relationships between containers
    system.containers.forEach((container, idx) => {
      if (idx > 0) {
        diagram += `  ${
          system.containers[idx - 1].name
        } --> ${container.name}\n`;
      }
    });

    return diagram;
  }

  generateComponentDiagram(container: C4Container): string {
    if (!container.components) return "";

    let diagram = `graph TB\n`;
    diagram += `  subgraph "${container.name}"\n`;

    container.components.forEach((component) => {
      diagram +=
        `    ${component.name}[${component.name}<br/>${component.technology}]\n`;
    });

    diagram += "  end\n\n";

    // Add dependencies
    container.components.forEach((component) => {
      component.dependencies?.forEach((dep) => {
        diagram += `  ${component.name} --> ${dep}\n`;
      });
    });

    return diagram;
  }
}

// Usage with YAML configuration
import * as yaml from "js-yaml";
import * as fs from "fs";

const config = yaml.load(fs.readFileSync("architecture.yaml", "utf8"));
const generator = new C4DiagramGenerator();

// Generate all levels
const contextDiagram = generator.generateContextDiagram(config.systems);
config.systems.forEach((system) => {
  if (system.type === "internal") {
    const containerDiagram = generator.generateContainerDiagram(system);
    system.containers?.forEach((container) => {
      const componentDiagram = generator.generateComponentDiagram(container);
      // Save each diagram
    });
  }
});
```

## CI/CD Integration

### GitHub Actions Workflow

{% raw %}

```yaml
# .github/workflows/diagrams.yml
name: Generate and Update Diagrams

on:
  push:
    paths:
      - "src/**/*.ts"
      - "docs/diagrams/**/*.mmd"
      - "architecture.yaml"
  pull_request:
    paths:
      - "src/**/*.ts"
      - "docs/diagrams/**/*.mmd"

jobs:
  generate-diagrams:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: |
          npm install -g @mermaid-js/mermaid-cli
          npm install -g tplant
          npm install

      - name: Generate class diagrams from code
        run: |
          tplant --input "src/**/*.ts" \
                 --output "docs/diagrams/generated/classes.mmd" \
                 --exclude "**/*.test.ts"

      - name: Generate architecture diagrams
        run: |
          node scripts/generate-c4-diagrams.js

      - name: Render Mermaid diagrams to SVG
        run: |
          for file in docs/diagrams/**/*.mmd; do
            output="${file%.mmd}.svg"
            mmdc -i "$file" -o "$output" -t dark -b transparent
          done

      - name: Generate diagram index
        run: |
          node scripts/generate-diagram-index.js > docs/diagrams/INDEX.md

      - name: Check for changes
        id: check
        run: |
          if [[ -n $(git status -s) ]]; then
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Commit and push changes
        if: steps.check.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/diagrams
          git commit -m "chore: update generated diagrams [skip ci]"
          git push
```

{% endraw %}

### GitLab CI Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - generate
  - validate
  - publish

variables:
  DIAGRAMS_PATH: "docs/diagrams"

generate-diagrams:
  stage: generate
  image: node:18
  before_script:
    - npm install -g @mermaid-js/mermaid-cli
    - npm install -g tplant
    - npm ci
  script:
    - |
        # Generate class diagrams
        tplant --input "src/**/*.ts" \
               --output "$DIAGRAMS_PATH/generated/classes.mmd"

        # Generate sequence diagrams from tests
        node scripts/extract-sequence-from-tests.js

        # Generate ER diagrams from database schema
        node scripts/sql-to-mermaid.js schema.sql > "$DIAGRAMS_PATH/generated/database.mmd"
  artifacts:
    paths:
      - $DIAGRAMS_PATH/generated/
    expire_in: 1 week

validate-diagrams:
  stage: validate
  image: node:18
  dependencies:
    - generate-diagrams
  script:
    - npm install -g @mermaid-js/mermaid-cli
    - |
        # Validate all Mermaid syntax
        for file in $DIAGRAMS_PATH/**/*.mmd; do
          echo "Validating $file"
          mmdc -i "$file" -o /tmp/test.svg || exit 1
        done
    - |
        # Check diagram consistency
        node scripts/validate-diagram-consistency.js

render-diagrams:
  stage: publish
  image: node:18
  dependencies:
    - generate-diagrams
  script:
    - npm install -g @mermaid-js/mermaid-cli
    - |
        # Render all diagrams
        for file in $DIAGRAMS_PATH/**/*.mmd; do
          output="${file%.mmd}.svg"
          mmdc -i "$file" -o "$output" -t dark -b transparent

          # Also generate PNG for documentation
          output_png="${file%.mmd}.png"
          mmdc -i "$file" -o "$output_png" -t dark -b white -w 2048
        done
  artifacts:
    paths:
      - $DIAGRAMS_PATH/**/*.svg
      - $DIAGRAMS_PATH/**/*.png
    expire_in: 1 month
```

## Diagram Testing and Validation

### Mermaid Syntax Validator

```typescript
// validate-mermaid.ts
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ValidationResult {
  file: string;
  valid: boolean;
  error?: string;
}

class MermaidValidator {
  validateFile(filePath: string): ValidationResult {
    try {
      const content = fs.readFileSync(filePath, "utf-8");

      // Basic syntax checks
      const syntaxErrors = this.checkSyntax(content);
      if (syntaxErrors.length > 0) {
        return {
          file: filePath,
          valid: false,
          error: syntaxErrors.join(", "),
        };
      }

      // Try to render (catches more complex errors)
      const tempFile = path.join("/tmp", `test-${Date.now()}.svg`);
      execSync(`mmdc -i "${filePath}" -o "${tempFile}"`, {
        stdio: "pipe",
      });

      // Clean up
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      return {
        file: filePath,
        valid: true,
      };
    } catch (error) {
      return {
        file: filePath,
        valid: false,
        error: error.message,
      };
    }
  }

  private checkSyntax(content: string): string[] {
    const errors: string[] = [];

    // Check for balanced braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push("Unbalanced braces");
    }

    // Check for balanced brackets
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push("Unbalanced brackets");
    }

    // Check for valid diagram type
    const validTypes = [
      "graph",
      "flowchart",
      "sequenceDiagram",
      "classDiagram",
      "stateDiagram",
      "erDiagram",
      "gantt",
      "pie",
      "gitGraph",
      "journey",
    ];

    const firstLine = content.trim().split("\n")[0];
    const hasValidType = validTypes.some((type) => firstLine.includes(type));

    if (!hasValidType) {
      errors.push("Invalid or missing diagram type");
    }

    return errors;
  }

  validateDirectory(dir: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    const files = this.findMermaidFiles(dir);
    files.forEach((file) => {
      results.push(this.validateFile(file));
    });

    return results;
  }

  private findMermaidFiles(dir: string): string[] {
    const files: string[] = [];

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir);

      entries.forEach((entry) => {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !entry.startsWith(".")) {
          walk(fullPath);
        } else if (entry.endsWith(".mmd") || entry.endsWith(".mermaid")) {
          files.push(fullPath);
        }
      });
    };

    walk(dir);
    return files;
  }
}

// CLI usage
if (require.main === module) {
  const validator = new MermaidValidator();
  const results = validator.validateDirectory(process.argv[2] || ".");

  const failed = results.filter((r) => !r.valid);
  if (failed.length > 0) {
    console.error("Validation failed for:");
    failed.forEach((r) => {
      console.error(`  ${r.file}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log(`✓ All ${results.length} diagrams are valid`);
  }
}
```

### Diagram Consistency Checker

```typescript
// check-consistency.ts
interface DiagramReference {
  file: string;
  line: number;
  type: "class" | "entity" | "participant" | "state";
  name: string;
}

class ConsistencyChecker {
  checkConsistency(directory: string): void {
    const references = this.collectReferences(directory);
    const issues = this.findInconsistencies(references);

    if (issues.length > 0) {
      console.error("Consistency issues found:");
      issues.forEach((issue) => console.error(`  - ${issue}`));
      process.exit(1);
    } else {
      console.log("✓ All diagrams are consistent");
    }
  }

  private collectReferences(dir: string): DiagramReference[] {
    const references: DiagramReference[] = [];
    // Implementation to parse diagrams and collect all references
    return references;
  }

  private findInconsistencies(refs: DiagramReference[]): string[] {
    const issues: string[] = [];

    // Check for naming consistency
    const nameGroups = new Map<string, DiagramReference[]>();
    refs.forEach((ref) => {
      const key = `${ref.type}:${ref.name.toLowerCase()}`;
      if (!nameGroups.has(key)) {
        nameGroups.set(key, []);
      }
      nameGroups.get(key)!.push(ref);
    });

    // Find similar but different names
    nameGroups.forEach((group, key) => {
      const names = new Set(group.map((r) => r.name));
      if (names.size > 1) {
        issues.push(`Inconsistent naming for ${key}: ${[...names].join(", ")}`);
      }
    });

    return issues;
  }
}
```

## Version Control Strategies

### Diagram Change Tracking

```bash
#!/bin/bash
# track-diagram-changes.sh

# Configure git to better handle Mermaid files
git config diff.mermaid.textconv "cat"
echo "*.mmd diff=mermaid" >> .gitattributes
echo "*.mermaid diff=mermaid" >> .gitattributes

# Create custom diff driver for better visualization
cat > .git/config << EOF
[diff "mermaid"]
    textconv = cat
    wordRegex = "[A-Za-z0-9_]+|[^[:space:]]"
EOF
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate all Mermaid diagrams before commit
echo "Validating Mermaid diagrams..."

for file in $(git diff --cached --name-only | grep -E '\.(mmd|mermaid)$'); do
    if [ -f "$file" ]; then
        # Try to render the diagram
        npx -q @mermaid-js/mermaid-cli -i "$file" -o /tmp/test.svg 2>/dev/null
        if [ $? -ne 0 ]; then
            echo "❌ Invalid Mermaid syntax in: $file"
            exit 1
        fi
        rm -f /tmp/test.svg
    fi
done

echo "✓ All diagrams validated successfully"
```

## Export and Publishing

### Multi-format Export Script

```javascript
// export-diagrams.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class DiagramExporter {
  constructor(options = {}) {
    this.formats = options.formats || ["svg", "png", "pdf"];
    this.themes = options.themes || ["default", "dark", "forest"];
  }

  exportDiagram(inputFile, outputDir) {
    const basename = path.basename(inputFile, path.extname(inputFile));

    this.formats.forEach((format) => {
      this.themes.forEach((theme) => {
        const outputFile = path.join(
          outputDir,
          `${basename}-${theme}.${format}`,
        );

        const cmd = this.buildCommand(inputFile, outputFile, format, theme);

        try {
          execSync(cmd, { stdio: "pipe" });
          console.log(`✓ Exported: ${outputFile}`);
        } catch (error) {
          console.error(`✗ Failed to export: ${outputFile}`);
        }
      });
    });
  }

  buildCommand(input, output, format, theme) {
    let cmd = `mmdc -i "${input}" -o "${output}" -t ${theme}`;

    switch (format) {
      case "png":
        cmd += " -w 2048 -s 2";
        break;
      case "pdf":
        cmd += " -p puppeteer-config.json";
        break;
      case "svg":
        cmd += " -b transparent";
        break;
    }

    return cmd;
  }

  exportAll(inputDir, outputDir) {
    const files = this.findDiagramFiles(inputDir);

    files.forEach((file) => {
      const relativeDir = path.dirname(path.relative(inputDir, file));
      const targetDir = path.join(outputDir, relativeDir);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      this.exportDiagram(file, targetDir);
    });
  }

  findDiagramFiles(dir) {
    const files = [];
    const walk = (currentDir) => {
      fs.readdirSync(currentDir).forEach((entry) => {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !entry.startsWith(".")) {
          walk(fullPath);
        } else if (entry.match(/\.(mmd|mermaid)$/)) {
          files.push(fullPath);
        }
      });
    };

    walk(dir);
    return files;
  }
}

// Usage
const exporter = new DiagramExporter({
  formats: ["svg", "png"],
  themes: ["default", "dark"],
});

exporter.exportAll("./docs/diagrams", "./docs/images");
```

### Documentation Site Integration

```javascript
// gatsby-config.js (for Gatsby)
module.exports = {
  plugins: [
    {
      resolve: "gatsby-remark-mermaid",
      options: {
        theme: "dark",
        viewport: {
          width: 1200,
          height: 800,
        },
        mermaidOptions: {
          themeCSS: `
            .node rect { fill: #1168bd; }
            .edgeLabel { background-color: #333; }
          `,
        },
      },
    },
  ],
};
```

```javascript
// vitepress config (for VitePress)
import { defineMermaidSetup } from "vitepress-plugin-mermaid";

export default {
  mermaid: defineMermaidSetup({
    startOnLoad: true,
    theme: "dark",
    flowchart: {
      useMaxWidth: true,
      curve: "basis",
    },
  }),
};
```

## Summary

This comprehensive guide covers:

1. **Automated Generation** - Convert code, schemas, and APIs to diagrams
2. **CI/CD Integration** - Automate diagram updates with your pipeline
3. **Validation** - Ensure diagram syntax and consistency
4. **Version Control** - Track and review diagram changes effectively
5. **Export Options** - Generate diagrams in multiple formats and themes

Key best practices:

- Store diagram sources (.mmd files) in version control
- Automate diagram generation from code when possible
- Validate diagrams in CI/CD pipeline
- Generate multiple formats for different use cases
- Keep diagrams close to the code they document
- Use consistent naming and styling conventions
