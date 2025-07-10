/**
 * Tests for documentation linting command
 *
 * @module
 */

import { assertEquals } from "@std/assert";
import { DiátaxisLinter } from "../linters/diataxis-linter.ts";
import { GoogleStyleLinter } from "../linters/google-style-linter.ts";

Deno.test("DiátaxisLinter - detects tutorial document type", () => {
  const linter = new DiátaxisLinter();
  const content = `# Getting Started Tutorial

Welcome to this tutorial where you'll learn how to use our API.

## Prerequisites
- Basic knowledge of programming
- API key

## Steps
1. First, install the SDK
2. Then, configure your credentials
3. Finally, make your first API call

## Summary
You've learned the basics of using our API.
`;

  const result = linter.lint("test.md", content);

  assertEquals(result.filePath, "test.md");
  assertEquals(result.passed, true);

  // Should not have major issues for a well-structured tutorial
  const errors = result.issues.filter((i) => i.severity === "error");
  assertEquals(errors.length, 0);
});

Deno.test("DiátaxisLinter - detects mixed document types", () => {
  const linter = new DiátaxisLinter();
  const content = `# API Reference

This tutorial will teach you about our API endpoints.

## Endpoints

### GET /users
Returns a list of users.

Parameters:
- limit: Maximum number of users to return
- offset: Number of users to skip

## Why Use This API
Understanding the architecture behind our API helps you...
`;

  const result = linter.lint("test.md", content);

  // Should detect mixed types (reference + tutorial + explanation)
  const mixedTypeIssues = result.issues.filter((i) =>
    i.rule === "mixed-document-type"
  );
  assertEquals(mixedTypeIssues.length > 0, true);
});

Deno.test("DiátaxisLinter - checks for required sections", () => {
  const linter = new DiátaxisLinter();
  const content = `# How to Deploy Your Application

This guide shows you how to deploy your application to production.

## Steps
1. Build your application
2. Configure the deployment
3. Run the deployment command
`;

  const result = linter.lint("test.md", content);

  // Should warn about missing Prerequisites and Result sections
  const missingSectionIssues = result.issues.filter((i) =>
    i.rule === "missing-required-section"
  );
  assertEquals(missingSectionIssues.length > 0, true);
});

Deno.test("GoogleStyleLinter - checks sentence length", () => {
  const linter = new GoogleStyleLinter();
  const content = `# Documentation

This is a very long sentence that contains way too many words and should definitely be broken up into smaller, more digestible pieces for better readability and comprehension by readers.

Short sentences are good. They are easy to read.
`;

  const result = linter.lint("test.md", content);

  // Should warn about the long sentence
  const longSentenceIssues = result.issues.filter((i) =>
    i.rule === "sentence-too-long"
  );
  assertEquals(longSentenceIssues.length, 1);
});

Deno.test("GoogleStyleLinter - checks present tense", () => {
  const linter = new GoogleStyleLinter();
  const content = `# API Guide

The function will return a list of users.

The function returns a list of users.
`;

  const result = linter.lint("test.md", content);

  // Should suggest present tense for "will return"
  const tenseIssues = result.issues.filter((i) =>
    i.rule === "use-present-tense"
  );
  assertEquals(tenseIssues.length >= 1, true);
});

Deno.test("GoogleStyleLinter - checks for forbidden words", () => {
  const linter = new GoogleStyleLinter();
  const content = `# User Guide

Please click the button to continue.

This is obviously a simple and easy task that you can easily accomplish.

Just follow these steps.
`;

  const result = linter.lint("test.md", content);

  // Should warn about forbidden words
  const forbiddenWordIssues = result.issues.filter((i) =>
    i.rule === "forbidden-word"
  );
  assertEquals(forbiddenWordIssues.length > 0, true);
});

Deno.test("GoogleStyleLinter - checks heading case", () => {
  const linter = new GoogleStyleLinter();
  const content = `# This Is A Title Case Heading

## Another Title Case Heading That Should Be Sentence Case

### Use sentence case for headings
`;

  const result = linter.lint("test.md", content);

  // Should warn about title case in headings
  const headingCaseIssues = result.issues.filter((i) =>
    i.rule === "heading-case"
  );
  assertEquals(headingCaseIssues.length >= 1, true);
});

Deno.test("GoogleStyleLinter - checks meaningful link text", () => {
  const linter = new GoogleStyleLinter();
  const content = `# Links

For more information, [click here](https://example.com).

Read the [API documentation](https://example.com/api) for details.
`;

  const result = linter.lint("test.md", content);

  // Should error on generic link text
  const linkTextIssues = result.issues.filter((i) =>
    i.rule === "meaningful-link-text"
  );
  assertEquals(linkTextIssues.length, 1);
  assertEquals(linkTextIssues[0].severity, "error");
});

Deno.test("GoogleStyleLinter - suggests contractions", () => {
  const linter = new GoogleStyleLinter();
  const content = `# Guide

Do not use this function if you do not have permissions.

Don't use this function if you don't have permissions.
`;

  const result = linter.lint("test.md", content);

  // Should suggest contractions for conversational tone
  const contractionIssues = result.issues.filter((i) =>
    i.rule === "use-contractions"
  );
  assertEquals(contractionIssues.length >= 1, true);
});

Deno.test("Both linters - skip code blocks", () => {
  const diátaxisLinter = new DiátaxisLinter();
  const googleLinter = new GoogleStyleLinter();

  const content = `# Example

Here's how to use the API:

\`\`\`javascript
// This will contain all sorts of things that would normally trigger linters
function doSomething() {
  console.log("Please click here for more information");
  return "This is obviously a very long string that would normally trigger the sentence length checker";
}
\`\`\`

The code above shows an example.
`;

  const diátaxisResult = diátaxisLinter.lint("test.md", content);
  const googleResult = googleLinter.lint("test.md", content);

  // Should not have issues from content within code blocks
  const allIssues = [...diátaxisResult.issues, ...googleResult.issues];
  const codeBlockIssues = allIssues.filter((i) =>
    i.message.includes("click here") ||
    i.message.includes("Please") ||
    i.message.includes("obviously")
  );

  assertEquals(codeBlockIssues.length, 0);
});

Deno.test("DiátaxisLinter - checks heading hierarchy", () => {
  const linter = new DiátaxisLinter();
  const content = `# Main Title

#### Skipped Heading Levels

This jumps from H1 to H4.

## Correct Level

### Correct Sublevel
`;

  const result = linter.lint("test.md", content);

  // Should warn about skipped heading levels
  const hierarchyIssues = result.issues.filter((i) =>
    i.rule === "heading-hierarchy"
  );
  assertEquals(hierarchyIssues.length >= 1, true);
});
