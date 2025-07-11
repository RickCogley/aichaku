/**
 * TypeScript-specific patterns for code review
 */

import type { SecurityPattern } from "../types.ts";

export class TypeScriptPatterns {
  static getPatterns(): SecurityPattern[] {
    return [
      // Type Safety
      {
        id: "typescript-any",
        name: "Avoid using 'any' type in TypeScript",
        pattern: /:\s*any(?:\s|;|,|\)|>)/,
        severity: "medium",
        description: "Avoid using 'any' type in TypeScript",
        fix: "Use proper type definitions, 'unknown', or generics",
        category: "typescript",
      },
      {
        id: "typescript-ignore",
        name: "@ts-ignore suppresses TypeScript errors",
        pattern: /@ts-ignore/,
        severity: "medium",
        description: "@ts-ignore suppresses TypeScript errors",
        fix: "Fix the underlying type issue instead of ignoring",
        category: "typescript",
      },
      {
        id: "typescript-nocheck",
        name: "@ts-nocheck disables all type checking for the file",
        pattern: /@ts-nocheck/,
        severity: "high",
        description: "@ts-nocheck disables all type checking for the file",
        fix: "Remove @ts-nocheck and fix type errors properly",
        category: "typescript",
      },

      // Type Assertions
      {
        id: "typescript-any-assertion",
        name: "Type assertion to 'any' defeats type safety",
        pattern: /as\s+any(?:\s|;|,|\)|>)/,
        severity: "high",
        description: "Type assertion to 'any' defeats type safety",
        fix: "Use proper type assertions or fix the type mismatch",
        category: "typescript",
      },
      {
        id: "typescript-any-generic",
        name: "Generic type parameter 'any' reduces type safety",
        pattern: /<any>/,
        severity: "medium",
        description: "Generic type parameter 'any' reduces type safety",
        fix: "Use a more specific type or constraint",
        category: "typescript",
      },

      // Non-null Assertions
      {
        id: "typescript-non-null-assertion",
        name: "Non-null assertion operator (!) can hide null/undefined errors",
        pattern: /\w+\s*!\./,
        severity: "low",
        description:
          "Non-null assertion operator (!) can hide null/undefined errors",
        fix: "Add proper null checks or use optional chaining",
        category: "typescript",
      },
      {
        id: "typescript-non-null-assertion-statement",
        name: "Non-null assertion in statement",
        pattern: /\w+\s*!\s*;/,
        severity: "low",
        description: "Non-null assertion in statement",
        fix: "Validate the value is not null/undefined",
        category: "typescript",
      },

      // Implicit Any
      {
        id: "typescript-implicit-any-params",
        name: "Function parameters without type annotations",
        pattern: /function\s+\w+\s*\([^:)]+\)\s*(?:\{|=>)/,
        severity: "low",
        description: "Function parameters without type annotations",
        fix: "Add explicit parameter types",
        category: "typescript",
      },
      {
        id: "typescript-implicit-return",
        name: "Arrow function without return type annotation",
        pattern: /=>\s*\{[^:]*return[^:]*\}/,
        severity: "info",
        description: "Arrow function without return type annotation",
        fix: "Consider adding return type for clarity",
        category: "typescript",
      },

      // Unsafe Operations
      {
        id: "typescript-delete-operator",
        name: "Delete operator can break type assumptions",
        pattern: /delete\s+\w+\.\w+/,
        severity: "low",
        description: "Delete operator can break type assumptions",
        fix: "Set property to undefined or use omit utility",
        category: "typescript",
      },
      {
        id: "typescript-object-assign",
        name: "Object.assign may not preserve types correctly",
        pattern: /Object\.assign\s*\(\s*\{\s*\}\s*,/,
        severity: "info",
        description: "Object.assign may not preserve types correctly",
        fix: "Use spread operator {...obj} for better type inference",
        category: "typescript",
      },

      // Best Practices
      {
        id: "typescript-index-signature-any",
        name: "Index signature with 'any' type",
        pattern: /interface\s+\w+\s*\{\s*\[key:\s*string\]:\s*any/,
        severity: "medium",
        description: "Index signature with 'any' type",
        fix: "Use a more specific type for the index signature",
        category: "typescript",
      },
      {
        id: "typescript-enum",
        name: "Consider using const assertions or union types instead of enums",
        pattern: /enum\s+\w+\s*\{/,
        severity: "info",
        description:
          "Consider using const assertions or union types instead of enums",
        fix: "Use 'as const' or string literal unions for better tree-shaking",
        category: "typescript",
      },

      // Deprecated Patterns
      {
        id: "typescript-triple-slash",
        name: "Triple-slash directives are legacy",
        pattern: /\/\/\/\s*<reference/,
        severity: "low",
        description: "Triple-slash directives are legacy",
        fix: "Use ES6 imports instead",
        category: "typescript",
      },
      {
        id: "typescript-namespace",
        name: "Namespaces are not recommended in modules",
        pattern: /namespace\s+\w+\s*\{/,
        severity: "low",
        description: "Namespaces are not recommended in modules",
        fix: "Use ES6 modules instead",
        category: "typescript",
      },
    ];
  }
}
