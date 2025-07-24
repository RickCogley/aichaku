# MCP Feedback System Reference

## Overview

The Aichaku MCP (Model Context Protocol) server includes a comprehensive
feedback and visibility system designed to provide clear, branded, and
informative feedback for Claude Code's interactions with the server. This system
ensures users understand what's happening during code reviews and security
scans.

## Visual Brand Identity

### Brand Elements

The feedback system uses consistent Aichaku branding:

- **Primary Icon**: 🪴 (potted plant - representing growth and nurturing)
- **Name**: Aichaku
- **Tagline**: "Methodology-Driven Development"

### Visual Language

#### Growth Phases

- 🌱 **Seed**: Starting/initializing operations
- 🌿 **Growing**: Active processing, ongoing work
- 🌸 **Blooming**: Success states, positive outcomes
- 🌳 **Mature**: Established/stable systems
- 🍃 **Harvest**: Results and outputs

#### Activity Indicators

- 🔍 **Scanning**: File analysis, security scanning
- ⚙️ **Analyzing**: Processing and evaluation
- ✅ **Validating**: Compliance checking
- 📚 **Learning**: Educational content, guidance
- ⚠️ **Warning**: Issues requiring attention
- ❌ **Error**: Critical problems
- ✨ **Success**: Positive outcomes

## Feedback System Components

### 1. Server Startup

When the MCP server starts, it displays:

```
┌─────────────────────────────────────────────────────────────┐
│  🪴 Aichaku MCP Code Reviewer v0.1.0                      │
│  Methodology-Driven Development                       │
│  Ready to enhance your code quality and security            │
└─────────────────────────────────────────────────────────────┘

🪴 Available Tools
  🔍 review_file - Security and standards analysis
  ✅ review_methodology - Project methodology compliance
  📚 get_standards - Standards configuration lookup

🪴 System Ready
  🌳 Server initialized successfully
  🌿 Awaiting tool invocations from Claude Code
```

### 2. Tool Invocation Feedback

When Claude Code invokes a tool, the system provides immediate feedback:

```
🪴 [Aichaku] 🔍 Tool invoked: review_file
🪴 [Aichaku] ⚙️ Processing: src/example.ts
🪴 [Aichaku] 🌿 Standards loaded: NIST-CSF, TDD, GOOGLE-STYLE
🪴 [Aichaku] ✅ Checking methodology: Shape Up
```

### 3. Progress Indicators

For operations taking longer than 1.5 seconds:

```
🪴 [Aichaku] 🌿 analyzing - Running security and standards checks
🪴 [Aichaku] 🌿 analyzing ██████████░░░░░░░░░░ 50%
```

### 4. Completion Feedback

When operations complete:

```
🪴 [Aichaku] ✨ Review complete: 3 findings
🪴 [Aichaku] 🍃 Operation completed in 2.3s
```

### 5. Error Handling

For errors:

```
🪴 [Aichaku] ❌ Operation failed: File not found
```

## Result Formatting

### Review Results Structure

```
🪴 Aichaku TypeScript/JavaScript Review Results
💻 File: src/example.ts
🍃 Completed: 2025-01-11 14:30:00

⚠️ Summary: 1 high, 2 medium
🌿 Review Status: ⚠️ Review recommended

🟠 HIGH ISSUES (1)
──────────────────────────────────────────────────
🔍 Line 42: Potential command injection vulnerability
  🌱 Rule: command-injection
  🌿 Category: security
  🌳 Tool: aichaku-security-scanner
  📚 Suggestion: Use parameterized commands instead of string concatenation

🟡 MEDIUM ISSUES (2)
──────────────────────────────────────────────────
🔍 Line 15: Using 'any' type reduces type safety
  🌱 Rule: typescript-any
  🌿 Category: standards
  🌳 Tool: aichaku-typescript-patterns
  📚 Suggestion: Define proper interface or use 'unknown' with type guards

📚 LEARNING OPPORTUNITY
Issue: 🌸 Using 'any' type instead of proper TypeScript types
Solution: 🍃 Define proper interfaces or use 'unknown' with type guards

🌱 Context: TypeScript's type system prevents runtime errors and makes code self-documenting

❌ Problematic Pattern:
const data: any = response;
function process(input: any): any { }

✅ Recommended Pattern:
interface ResponseData {
  id: string;
  name: string;
}
const data: ResponseData = response;

🌿 Step-by-Step Fix:
  1. Look at how the variable is used in the code
  2. Identify the properties and methods accessed
  3. Create an interface with those properties
  4. Replace 'any' with your interface
  5. Fix any resulting type errors

🌱 Reflection: What prevented you from defining a proper type?

🌸 NEXT STEPS
⚠️ 1. Review and address the findings above
📚 2. Apply the learning opportunities to improve
🌳 3. Run the review again to verify fixes
```

### Success Results

```
🪴 Aichaku TypeScript/JavaScript Review Results
💻 File: src/example.ts
🍃 Completed: 2025-01-11 14:30:00

✨ Excellent work! No issues found.
🌸 Your code meets all security and standards requirements.

🌸 NEXT STEPS
✨ Great job! Consider sharing your patterns with the team.
🌳 Continue following these excellent practices.
```

## Implementation Details

### Key Classes

1. **AichakuFormatter**: Brand-consistent message formatting
2. **FeedbackManager**: Progress tracking and timing
3. **ConsoleOutputManager**: Enhanced console output
4. **ComplianceFormatter**: Result formatting

### Timing Strategy

- **Immediate feedback**: Tool invocation acknowledgment
- **1.5 second delay**: Progress indicators for longer operations
- **2 second threshold**: Progress updates for extended operations
- **3 second threshold**: Completion timing information

### Progressive Disclosure

The system reveals information progressively:

1. **Initial**: Tool invocation and basic context
2. **Progress**: For operations taking longer than expected
3. **Completion**: Results summary and timing
4. **Detailed**: Full analysis in formatted output

### External Scanner Integration

When external security scanners are used:

```
🪴 [Aichaku] 🔍 External security scanners enabled
🪴 [Aichaku] 🔍 Checking external security scanners...
🪴 [Aichaku] ✨ External scanner CodeQL: active
🪴 [Aichaku] ⚠️ External scanner DevSkim: not available
🪴 [Aichaku] ✨ External scanner Semgrep: active
```

## Console Output Design Principles

### 1. Clarity Over Verbosity

- Essential information only
- Clear visual hierarchy
- Consistent formatting

### 2. Branded Experience

- Consistent use of 🪴 Aichaku branding
- Growth-themed visual language
- Professional but friendly tone

### 3. Actionable Information

- Clear indication of what's happening
- Progress indicators for long operations
- Educational context for issues

### 4. Error Resilience

- Graceful error handling
- Clear error messages
- Helpful suggestions for resolution

## Configuration

### Environment Variables

- `AICHAKU*FEEDBACK*LEVEL`: Control feedback verbosity (minimal, standard,
  verbose)
- `AICHAKU*PROGRESS*THRESHOLD`: Milliseconds before showing progress
  (default: 1500)
- `AICHAKU*TIMING*THRESHOLD`: Milliseconds before showing timing (default: 3000)

### Customization

The feedback system is designed to be configurable while maintaining brand
consistency. Key aspects that can be customized:

- Progress thresholds
- Verbosity levels
- Color usage (for terminals supporting it)
- Message formatting detail

## Integration with Claude Code

The feedback system is designed to work seamlessly with Claude Code's console
output:

1. **stderr logging**: All feedback goes to stderr for visibility
2. **Non-blocking**: Feedback doesn't interfere with MCP communication
3. **Structured output**: Results are formatted for Claude's consumption
4. **Error handling**: Proper error reporting and recovery

## Best Practices

### For Users

1. **Monitor console output**: Watch for feedback during operations
2. **Understand the visual language**: Learn the meaning of different icons
3. **Review educational content**: Pay attention to learning opportunities
4. **Use progress indicators**: Understand when operations are taking longer

### For Developers

1. **Consistent branding**: Always use the Aichaku visual language
2. **Meaningful feedback**: Provide actionable information
3. **Error context**: Include helpful error messages
4. **Performance awareness**: Monitor operation timing

## Future Enhancements

### Planned Features

1. **Interactive feedback**: User prompts for configuration
2. **Metric tracking**: Operation performance monitoring
3. **Custom themes**: Alternative visual styles
4. **Integration hooks**: Webhook notifications for CI/CD
5. **Rich formatting**: HTML/Markdown output for reports

### Extensibility

The system is designed to be extensible:

- New feedback formatters can be added
- Custom visual themes can be implemented
- Additional progress indicators can be integrated
- New output formats can be supported

## Troubleshooting

### Common Issues

1. **No feedback visible**: Check that stderr is being monitored
2. **Progress not showing**: Verify operation timing thresholds
3. **Branding inconsistent**: Ensure all formatters use AichakuFormatter
4. **Performance issues**: Monitor feedback system overhead

### Debugging

Enable verbose logging:

```bash
AICHAKU*FEEDBACK*LEVEL=verbose aichaku mcp
```

Monitor timing:

```bash
AICHAKU*TIMING*THRESHOLD=1000 aichaku mcp
```

## Related Documentation

- [MCP Server Setup](../tutorials/setup-mcp-server.md)
- [Security Standards](../explanation/security-standards.md)
- [Methodology Integration](../how-to/methodology-integration.md)
- [API Reference](./mcp-api.md)
