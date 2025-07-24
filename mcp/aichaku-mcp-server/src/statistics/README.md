# MCP Statistics Tracking System

A comprehensive, privacy-conscious statistics tracking and reporting system for
MCP tool usage in Aichaku.

## 🚀 Features

- **Real-time Usage Tracking**: Monitor tool invocations, performance, and
  success rates
- **Privacy-First Design**: Configurable anonymization and data sanitization
- **Multiple Storage Options**: Deno KV, JSON files, or in-memory storage
- **Rich Analytics**: Insights into tool usage patterns, file review frequency,
  and performance trends
- **Interactive Q&A**: Natural language queries about usage statistics
- **Export Capabilities**: JSON and CSV export formats
- **Lightweight & Fast**: Minimal overhead with efficient data structures

## 📊 What Gets Tracked

### 1. Tool Usage Statistics

- How many times each MCP tool was used
- Success/failure rates for each tool
- Average operation times
- Most frequently used tools

### 2. File Analysis

- Which files are reviewed most often
- File types and review patterns
- Common issues found in different file types
- Review frequency trends

### 3. Standards Compliance

- Which standards are being checked
- Compliance scores and trends
- Common violations and patterns
- Improvement over time

### 4. Performance Metrics

- Average response times
- Operation duration trends
- System performance indicators
- Success rate trends

### 5. Session Analytics

- Development session duration
- Operations per session
- Workflow patterns
- Productivity metrics

## 🔒 Privacy Controls

The system is designed with privacy as a core principle:

- **File Path Anonymization**: User directories and sensitive paths are hashed
- **Content Exclusion**: File contents are never stored (only metadata)
- **User ID Hashing**: User identifiers are anonymized using SHA-256
- **Configurable Retention**: Automatic cleanup of old data
- **Data Sanitization**: Sensitive data is detected and excluded

## 🛠️ Usage Examples

### Basic Usage Questions

```typescript
// Ask natural language questions
const answer = await statsManager.answerQuestion(
  "How many times was the MCP server used?",
);
const mostUsed = await statsManager.answerQuestion(
  "Which tools are used most frequently?",
);
const avgTime = await statsManager.answerQuestion(
  "What are the average operation times?",
);
```

### Generate Reports

```typescript
// Get dashboard overview
const dashboard = await statsManager.generateDashboard();

// Get real-time statistics
const realtime = await statsManager.getRealTimeStats();

// Get detailed insights
const insights = await statsManager.getInsights();

// Export data
const jsonData = await statsManager.exportData("json");
const csvData = await statsManager.exportData("csv");
```

### MCP Tool Integration

The system automatically tracks when MCP tools are used:

```bash
# Review a file - automatically tracked
claude-mcp review_file --file src/example.ts

# Get statistics dashboard
claude-mcp get_statistics --type dashboard

# Ask specific questions
claude-mcp get_statistics --question "What files are reviewed most often?"

# Export usage data
claude-mcp get_statistics --type export --format csv
```

## 🔧 Configuration

### Environment-Based Configuration

The system automatically detects the environment and applies appropriate
settings:

```typescript
// Development environment
const devConfig = {
  enabled: true,
  retentionDays: 7,
  privacy: {
    anonymizeFilePaths: false,
    excludeFileContents: true,
    hashUserIdentifiers: false,
  },
  storage: {
    type: "json",
    location: "/tmp/aichaku-dev-stats.json",
  },
};

// Production environment
const prodConfig = {
  enabled: true,
  retentionDays: 30,
  privacy: {
    anonymizeFilePaths: true,
    excludeFileContents: true,
    hashUserIdentifiers: true,
  },
  storage: {
    type: "deno-kv",
    compression: true,
  },
};
```

### Custom Configuration

```typescript
import { StatisticsManager } from "./statistics/mod.ts";

const customConfig = {
  enabled: true,
  retentionDays: 14,
  privacy: {
    anonymizeFilePaths: true,
    excludeFileContents: true,
    hashUserIdentifiers: true,
  },
  reporting: {
    enableDailyReports: true,
    enableWeeklyReports: true,
    enableRealtimeMetrics: true,
  },
  storage: {
    type: "deno-kv",
    location: "~/.aichaku/stats.db",
    compression: true,
  },
};

const statsManager = new StatisticsManager(customConfig);
```

## 📈 Sample Reports

### Dashboard Overview

```
🪴 Aichaku MCP Statistics Dashboard
Generated: 2025-01-11, 2:30:45 PM
Time Range: 2025-01-04 - 2025-01-11

🍃 SUMMARY
• Total Sessions: 15
• Total Operations: 127
• Average Session Duration: 24m
• Overall Success Rate: 94%
• Most Used Tool: review_file
• Most Reviewed File Type: TypeScript

🔍 TOOL USAGE
• review_file: 89 uses, 96% success, 1.2s avg
• review_methodology: 23 uses, 87% success, 800ms avg
• get_standards: 15 uses, 100% success, 200ms avg

⚙️ FILE ANALYTICS
• TypeScript: 67 reviews, 3.2 avg issues
• JavaScript: 23 reviews, 2.8 avg issues
• Python: 12 reviews, 4.1 avg issues

✅ STANDARDS COMPLIANCE
• security: 89 checks, 87% avg score
• style: 67 checks, 92% avg score
• methodology: 23 checks, 78% avg score

📚 RECOMMENDATIONS
• Consider optimizing review_methodology - average duration is over 5 seconds
• Address critical security issues - 12 critical findings detected
• Consider using get_standards tool for more comprehensive analysis
```

### Question Answering

```
Q: "How many times was the MCP server used during development sessions?"
A: 🪴 MCP Server Usage:
   • Total operations: 127
   • Total sessions: 15
   • Average operations per session: 8

Q: "Which tools are used most frequently?"
A: 🔍 Most Used Tools:
   • review_file: 89 uses
   • review_methodology: 23 uses
   • get_standards: 15 uses

Q: "What files are reviewed most often?"
A: ⚙️ Most Reviewed Files:
   • <user-a1b2c3d4>/src/server.ts: 12 reviews
   • <user-a1b2c3d4>/src/types.ts: 8 reviews
   • <user-a1b2c3d4>/src/utils.ts: 7 reviews
```

## 🏗️ Architecture

The system consists of several key components:

### 1. `StatisticsManager` - Main Interface

- Coordinates all statistics functionality
- Provides high-level API for tracking and reporting
- Handles configuration and initialization

### 2. `StatisticsCollector` - Data Collection

- Records tool invocations and results
- Tracks performance metrics
- Manages session data

### 3. `StatisticsReporter` - Analytics & Reporting

- Generates comprehensive reports
- Answers natural language questions
- Provides insights and recommendations

### 4. `StorageBackend` - Data Persistence

- Supports multiple storage options (Deno KV, JSON, Memory)
- Handles data cleanup and retention
- Provides efficient data access

### 5. `Privacy Controls` - Data Protection

- Anonymizes sensitive information
- Sanitizes user data
- Configurable privacy settings

## 🔄 Data Flow

1. **Tool Invocation**: MCP tool is called
2. **Data Collection**: Statistics collector records the operation
3. **Privacy Processing**: Data is anonymized and sanitized
4. **Storage**: Data is persisted using the configured backend
5. **Reporting**: Analytics are generated on-demand
6. **Cleanup**: Old data is automatically removed

## 🎯 Use Cases

### Development Teams

- Track code review patterns
- Monitor tool adoption
- Identify productivity bottlenecks
- Measure improvement over time

### Individual Developers

- Understand personal workflow patterns
- Track learning progress
- Identify areas for improvement
- Monitor tool effectiveness

### Organizations

- Assess tool ROI
- Track compliance with standards
- Monitor security posture
- Generate usage reports

## 🔐 Security Considerations

### Data Minimization

- Only essential metadata is collected
- File contents are never stored
- User identifiers are hashed

### Access Control

- Statistics are stored locally
- No external data transmission
- User controls all data

### Compliance

- GDPR-friendly design
- Configurable data retention
- Easy data deletion

## 🚀 Getting Started

1. **Enable Statistics**: Configure the system for your environment
2. **Use MCP Tools**: Statistics are automatically collected
3. **View Reports**: Check the dashboard or ask questions
4. **Export Data**: Generate reports in JSON or CSV format

## 📚 API Reference

### StatisticsManager Methods

```typescript
// Initialize the system
await statsManager.init();

// Record a tool invocation
await statsManager.recordInvocation(
  toolName,
  operationId,
  args,
  startTime,
  success,
  result,
  error,
);

// Generate reports
const dashboard = await statsManager.generateDashboard();
const insights = await statsManager.getInsights();
const realtime = await statsManager.getRealTimeStats();

// Answer questions
const answer = await statsManager.answerQuestion(
  "What's the average response time?",
);

// Export data
const jsonData = await statsManager.exportData("json");
const csvData = await statsManager.exportData("csv");

// Configuration
const config = statsManager.getConfig();
await statsManager.updateConfig({ retentionDays: 60 });

// Cleanup
await statsManager.cleanup();
await statsManager.close();
```

## 🔧 Advanced Configuration

### Custom Storage Location

```typescript
const config = {
  storage: {
    type: "deno-kv",
    location: "/custom/path/stats.db",
  },
};
```

### Privacy Settings

```typescript
const config = {
  privacy: {
    anonymizeFilePaths: true,
    excludeFileContents: true,
    hashUserIdentifiers: true,
  },
};
```

### Reporting Options

```typescript
const config = {
  reporting: {
    enableDailyReports: true,
    enableWeeklyReports: true,
    enableRealtimeMetrics: true,
  },
};
```

## 🤝 Contributing

The statistics system is designed to be extensible. To add new metrics or
reporting features:

1. Extend the `ToolInvocation` or `StatisticsReport` types
2. Update the collector to gather new data
3. Add reporting logic to the reporter
4. Update the privacy controls if needed

## 🐛 Troubleshooting

### Common Issues

**Statistics not being recorded**

- Check if statistics are enabled in configuration
- Verify storage backend is accessible
- Check for initialization errors

**Performance issues**

- Reduce retention days to limit data size
- Use memory storage for temporary tracking
- Enable compression for large datasets

**Privacy concerns**

- Review privacy settings
- Enable full anonymization
- Verify data sanitization

### Debug Mode

```typescript
const config = {
  enabled: true,
  debug: true, // Enable debug logging
  storage: {
    type: "memory", // Use memory storage for testing
  },
};
```

## 📄 License

Part of the Aichaku methodology-driven development system. See the main project
license for details.
