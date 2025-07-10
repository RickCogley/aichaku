/**
 * TypeScript-specific patterns for code review
 */

import type { SecurityPattern } from "../types.ts";

export class TypeScriptPatterns {
  static getPatterns(): SecurityPattern[] {
    return [
      // Type Safety
      {
        pattern: /:\s*any(?:\s|;|,|\)|>)/,
        severity: "medium",
        rule: "typescript-any",
        message: "Avoid using 'any' type in TypeScript",
        suggestion: "Use proper type definitions, 'unknown', or generics",
        category: "typescript",
      },
      {
        pattern: /@ts-ignore/,
        severity: "medium",
        rule: "typescript-ignore",
        message: "@ts-ignore suppresses TypeScript errors",
        suggestion: "Fix the underlying type issue instead of ignoring",
        category: "typescript",
      },
      {
        pattern: /@ts-nocheck/,
        severity: "high",
        rule: "typescript-nocheck",
        message: "@ts-nocheck disables all type checking for the file",
        suggestion: "Remove @ts-nocheck and fix type errors properly",
        category: "typescript",
      },

      // Type Assertions
      {
        pattern: /as\s+any(?:\s|;|,|\)|>)/,
        severity: "high",
        rule: "typescript-any-assertion",
        message: "Type assertion to 'any' defeats type safety",
        suggestion: "Use proper type assertions or fix the type mismatch",
        category: "typescript",
      },
      {
        pattern: /<any>/,
        severity: "medium",
        rule: "typescript-any-generic",
        message: "Generic type parameter 'any' reduces type safety",
        suggestion: "Use a more specific type or constraint",
        category: "typescript",
      },

      // Non-null Assertions
      {
        pattern: /\w+\s*!\./,
        severity: "low",
        rule: "typescript-non-null-assertion",
        message:
          "Non-null assertion operator (!) can hide null/undefined errors",
        suggestion: "Add proper null checks or use optional chaining",
        category: "typescript",
      },
      {
        pattern: /\w+\s*!\s*;/,
        severity: "low",
        rule: "typescript-non-null-assertion-statement",
        message: "Non-null assertion in statement",
        suggestion: "Validate the value is not null/undefined",
        category: "typescript",
      },

      // Implicit Any
      {
        pattern: /function\s+\w+\s*\([^:)]+\)\s*(?:\{|=>)/,
        severity: "low",
        rule: "typescript-implicit-any-params",
        message: "Function parameters without type annotations",
        suggestion: "Add explicit parameter types",
        category: "typescript",
      },
      {
        pattern: /=>\s*\{[^:]*return[^:]*\}/,
        severity: "info",
        rule: "typescript-implicit-return",
        message: "Arrow function without return type annotation",
        suggestion: "Consider adding return type for clarity",
        category: "typescript",
      },

      // Unsafe Operations
      {
        pattern: /delete\s+\w+\.\w+/,
        severity: "low",
        rule: "typescript-delete-operator",
        message: "Delete operator can break type assumptions",
        suggestion: "Set property to undefined or use omit utility",
        category: "typescript",
      },
      {
        pattern: /Object\.assign\s*\(\s*\{\s*\}\s*,/,
        severity: "info",
        rule: "typescript-object-assign",
        message: "Object.assign may not preserve types correctly",
        suggestion: "Use spread operator {...obj} for better type inference",
        category: "typescript",
      },

      // Best Practices
      {
        pattern: /interface\s+\w+\s*\{\s*\[key:\s*string\]:\s*any/,
        severity: "medium",
        rule: "typescript-index-signature-any",
        message: "Index signature with 'any' type",
        suggestion: "Use a more specific type for the index signature",
        category: "typescript",
      },
      {
        pattern: /enum\s+\w+\s*\{/,
        severity: "info",
        rule: "typescript-enum",
        message:
          "Consider using const assertions or union types instead of enums",
        suggestion:
          "Use 'as const' or string literal unions for better tree-shaking",
        category: "typescript",
      },

      // Deprecated Patterns
      {
        pattern: /\/\/\/\s*<reference/,
        severity: "low",
        rule: "typescript-triple-slash",
        message: "Triple-slash directives are legacy",
        suggestion: "Use ES6 imports instead",
        category: "typescript",
      },
      {
        pattern: /namespace\s+\w+\s*\{/,
        severity: "low",
        rule: "typescript-namespace",
        message: "Namespaces are not recommended in modules",
        suggestion: "Use ES6 modules instead",
        category: "typescript",
      },
    ];
  }
}
