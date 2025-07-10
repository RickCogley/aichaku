/**
 * Example MCP Code Reviewer Server
 * 
 * This demonstrates the key concepts for the automated security review MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// Types for our review system
interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  rule: string;
  message: string;
  file: string;
  line: number;
  column?: number;
  suggestion?: string;
  tool: string;
}

interface ReviewResult {
  file: string;
  findings: Finding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  methodologyCompliance?: {
    methodology: string;
    status: 'passed' | 'warnings' | 'failed';
    details: string[];
  };
  claudeGuidance?: {
    reminder: string;
    pattern: string;
    correction: string;
    example?: string;
    reinforcement?: string;
    // Advanced prompting additions
    context?: string;         // Why this matters
    goodExample?: string;     // Example of correct code
    stepByStep?: string[];    // Steps to fix
    reflection?: string;      // Question for self-reflection
  };
}

// Simple security patterns (example of what we did manually)
const SECURITY_PATTERNS = [
  {
    pattern: /bash\s+-c\s+['"][^'"]*\$[^{]/,
    severity: 'critical' as const,
    rule: 'command-injection',
    message: 'Potential command injection - use parameter expansion ${VAR}',
    suggestion: 'Use bash parameter expansion: bash -c \'command "$1"\' -- "${VARIABLE}"'
  },
  {
    pattern: /\.\.(?:\/|\\)/,
    severity: 'high' as const,
    rule: 'path-traversal',
    message: 'Potential path traversal vulnerability',
    suggestion: 'Validate and normalize paths before use'
  },
  {
    pattern: /:\s*any(?:\s|;|,|\))/,
    severity: 'medium' as const,
    rule: 'typescript-any',
    message: 'Avoid using "any" type in TypeScript',
    suggestion: 'Use proper type definitions or unknown'
  },
  {
    pattern: /JSON\.parse\s*\([^)]*\)\s*as\s+\w+(?:\s|;)/,
    severity: 'low' as const,
    rule: 'unsafe-type-assertion',
    message: 'Unsafe type assertion after JSON.parse',
    suggestion: 'Validate parsed data structure before type assertion'
  }
];

// OWASP-based checks
const OWASP_CHECKS = {
  'A01-access-control': (content: string, filePath: string): Finding[] => {
    const findings: Finding[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for direct parameter usage without auth
      if (line.includes('req.params') && !content.includes('authorize') && !content.includes('auth')) {
        findings.push({
          severity: 'high',
          rule: 'OWASP-A01',
          message: 'Potential broken access control - verify authorization for direct object references',
          file: filePath,
          line: index + 1,
          tool: 'owasp-analyzer',
          suggestion: 'Add authorization checks before accessing resources'
        });
      }
    });
    
    return findings;
  },
  
  'A03-injection': (content: string, filePath: string): Finding[] => {
    const findings: Finding[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // SQL injection patterns
      if (line.match(/query\s*\(\s*['"`].*\$\{.*\}/)) {
        findings.push({
          severity: 'critical',
          rule: 'OWASP-A03',
          message: 'Potential SQL injection - use parameterized queries',
          file: filePath,
          line: index + 1,
          tool: 'owasp-analyzer',
          suggestion: 'Use parameterized queries or prepared statements'
        });
      }
    });
    
    return findings;
  }
};

class CodeReviewerServer {
  private server: Server;
  
  constructor() {
    this.server = new Server({
      name: 'mcp-code-reviewer',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
    
    this.setupHandlers();
  }
  
  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'review_file',
          description: 'Review a file for security issues and coding standards',
          inputSchema: {
            type: 'object',
            properties: {
              path: { 
                type: 'string',
                description: 'Path to the file to review'
              },
              content: { 
                type: 'string',
                description: 'File content to review'
              },
              standards: { 
                type: 'array',
                items: { type: 'string' },
                description: 'Standards to check against (e.g., owasp-web, 15-factor)'
              }
            },
            required: ['path', 'content']
          }
        },
        {
          name: 'quick_scan',
          description: 'Quick security scan for common vulnerabilities',
          inputSchema: {
            type: 'object',
            properties: {
              content: { 
                type: 'string',
                description: 'Code snippet to scan'
              }
            },
            required: ['content']
          }
        }
      ]
    }));
    
    // Handle tool execution
    this.server.setRequestHandler('tools/run', async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'review_file':
          return await this.reviewFile(args.path, args.content, args.standards);
        
        case 'quick_scan':
          return await this.quickScan(args.content);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }
  
  private async reviewFile(filePath: string, content: string, standards?: string[]): Promise<any> {
    const findings: Finding[] = [];
    
    // Run pattern-based security checks
    SECURITY_PATTERNS.forEach(({ pattern, severity, rule, message, suggestion }) => {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          findings.push({
            severity,
            rule,
            message,
            file: filePath,
            line: index + 1,
            column: line.search(pattern) + 1,
            suggestion,
            tool: 'pattern-scanner'
          });
        }
      });
    });
    
    // Run OWASP checks if requested
    if (standards?.includes('owasp-web')) {
      Object.values(OWASP_CHECKS).forEach(check => {
        findings.push(...check(content, filePath));
      });
    }
    
    // Try to run external tools if available
    const externalFindings = await this.runExternalScanners(filePath, content);
    findings.push(...externalFindings);
    
    // Generate result
    const result = this.generateReviewResult(filePath, findings);
    
    // Add Claude guidance if there are findings
    if (findings.length > 0) {
      result.claudeGuidance = this.generateClaudeGuidance(findings);
    }
    
    return {
      toolResult: this.formatResult(result)
    };
  }
  
  private async quickScan(content: string): Promise<any> {
    const findings: Finding[] = [];
    const tempPath = 'temp-scan.ts';
    
    // Quick pattern scan
    SECURITY_PATTERNS.forEach(({ pattern, severity, rule, message }) => {
      if (pattern.test(content)) {
        findings.push({
          severity,
          rule,
          message,
          file: tempPath,
          line: 1,
          tool: 'quick-scanner'
        });
      }
    });
    
    return {
      toolResult: findings.length === 0 
        ? '✅ No immediate security issues detected'
        : `⚠️ Found ${findings.length} potential issues:\n${findings.map(f => `- ${f.message}`).join('\n')}`
    };
  }
  
  private async runExternalScanners(filePath: string, content: string): Promise<Finding[]> {
    const findings: Finding[] = [];
    
    // Try DevSkim if available
    try {
      const tempFile = path.join(os.tmpdir(), `review-${Date.now()}-${path.basename(filePath)}`);
      await fs.writeFile(tempFile, content);
      
      const { stdout } = await execAsync(`devskim analyze "${tempFile}" -f json`, {
        timeout: 10000
      });
      
      const results = JSON.parse(stdout);
      if (results.matches) {
        results.matches.forEach((match: any) => {
          findings.push({
            severity: this.mapDevSkimSeverity(match.severity),
            rule: match.rule_id,
            message: match.rule_name,
            file: filePath,
            line: match.line,
            column: match.column,
            tool: 'devskim'
          });
        });
      }
      
      await fs.unlink(tempFile);
    } catch (error) {
      // DevSkim not available or error - continue silently
    }
    
    return findings;
  }
  
  private async runMethodologyChecks(filePath: string, content: string, standards?: string[]): Promise<Finding[]> {
    const findings: Finding[] = [];
    
    // Determine active methodologies from standards or use defaults
    const activeMethodologies = this.detectMethodologies(filePath, standards);
    
    // Run checks for each active methodology
    for (const methodology of activeMethodologies) {
      const checks = METHODOLOGY_CHECKS[methodology as keyof typeof METHODOLOGY_CHECKS];
      if (checks) {
        Object.values(checks).forEach(check => {
          findings.push(...check(content, filePath));
        });
      }
    }
    
    return findings;
  }
  
  private detectMethodologies(filePath: string, standards?: string[]): string[] {
    // Check if project uses specific methodologies based on file patterns
    const methodologies = new Set<string>(['general']); // Always include general
    
    if (filePath.includes('pitch.md') || filePath.includes('.claude/output/active-')) {
      methodologies.add('shape-up');
    }
    
    if (filePath.includes('sprint-planning.md') || filePath.includes('backlog.md')) {
      methodologies.add('scrum');
    }
    
    // Could also read from .aichaku-standards.json methodologies field
    
    return Array.from(methodologies);
  }
  
  private mapDevSkimSeverity(severity: string): Finding['severity'] {
    const map: Record<string, Finding['severity']> = {
      'critical': 'critical',
      'important': 'high',
      'moderate': 'medium',
      'low': 'low',
      'informational': 'info'
    };
    return map[severity.toLowerCase()] || 'medium';
  }
  
  private generateReviewResult(filePath: string, findings: Finding[]): ReviewResult {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };
    
    findings.forEach(f => {
      summary[f.severity]++;
    });
    
    // Determine methodology compliance
    let methodologyCompliance = undefined;
    const methodologyFindings = findings.filter(f => f.tool === 'methodology-reviewer');
    if (methodologyFindings.length > 0) {
      const methodology = this.detectMethodologies(filePath)[0]; // Primary methodology
      const hasErrors = methodologyFindings.some(f => f.severity === 'high' || f.severity === 'critical');
      const hasWarnings = methodologyFindings.some(f => f.severity === 'medium' || f.severity === 'low');
      
      methodologyCompliance = {
        methodology,
        status: hasErrors ? 'failed' : hasWarnings ? 'warnings' : 'passed' as 'passed' | 'warnings' | 'failed',
        details: methodologyFindings.map(f => f.message)
      };
    }
    
    return {
      file: filePath,
      findings: findings.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      summary,
      methodologyCompliance
    };
  }
  
  private generateClaudeGuidance(findings: Finding[]): ReviewResult['claudeGuidance'] | undefined {
    if (findings.length === 0) return undefined;
    
    // Count violations by type
    const violationCounts = new Map<string, number>();
    findings.forEach(f => {
      violationCounts.set(f.rule, (violationCounts.get(f.rule) || 0) + 1);
    });
    
    // Find most common violation
    const [topRule, count] = Array.from(violationCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    // Generate guidance based on pattern
    if (topRule === 'typescript-any' && count >= 3) {
      return {
        reminder: `📝 Your CLAUDE.md explicitly states to avoid 'any' types, but you used it ${count} times.`,
        pattern: "Using 'any' instead of proper TypeScript types",
        correction: "Determine the actual type from context and use it. Use 'unknown' for truly dynamic values.",
        example: "Change: const data: any = response\nTo: const data: ApiResponse = response",
        reinforcement: "I should follow the TypeScript standards in CLAUDE.md and avoid using 'any' types.",
        // Advanced prompting
        context: "TypeScript's type system prevents runtime errors. Using 'any' disables this protection and makes code harder to maintain.",
        goodExample: "interface UserData { id: string; name: string; }\nconst user: UserData = await getUser(id);",
        stepByStep: [
          "1. Look at how the variable is used (what properties/methods are accessed)",
          "2. Create an interface with those properties",
          "3. Replace 'any' with your interface",
          "4. Fix any resulting type errors"
        ],
        reflection: "What made me reach for 'any' instead of defining a proper type?"
      };
    }
    
    if (topRule.includes('injection') && count >= 1) {
      return {
        reminder: "🚫 CRITICAL: You introduced potential injection vulnerabilities. This violates security standards.",
        pattern: "Unsafe string concatenation or parameter handling",
        correction: "Always use parameterized queries, parameter expansion, or proper escaping.",
        example: "Use: bash -c 'echo \"$1\"' -- \"$VAR\" instead of bash -c \"echo $VAR\"",
        reinforcement: "I must prioritize security and prevent injection vulnerabilities as specified in the security standards.",
        // Advanced prompting
        context: "Command injection is the #1 security risk. Attackers can execute arbitrary commands, leading to complete system compromise.",
        goodExample: "// Safe approach\nconst { execFile } = require('child_process');\nexecFile('git', ['commit', '-m', userMessage]);",
        stepByStep: [
          "1. STOP - Do not run this code until fixed",
          "2. Replace string interpolation with array arguments",
          "3. Use execFile instead of exec when possible",
          "4. Validate/sanitize any user input"
        ],
        reflection: "Am I treating user input as potentially malicious in all cases?"
      };
    }
    
    if (topRule.includes('shape-up') || topRule.includes('scrum')) {
      return {
        reminder: `🎯 You missed required ${topRule.includes('shape-up') ? 'Shape Up' : 'Scrum'} elements.`,
        pattern: "Incomplete methodology compliance",
        correction: "Include all required sections for the methodology.",
        reinforcement: `I should ensure all ${topRule.includes('shape-up') ? 'Shape Up' : 'Scrum'} requirements are met.`
      };
    }
    
    // Generic guidance for other violations
    return {
      reminder: `💡 Multiple violations of ${topRule} detected (${count} times).`,
      pattern: `Repeated ${topRule} issues`,
      correction: "Review and fix all instances of this issue.",
      reinforcement: "I should be more careful to avoid these violations."
    };
  }
  
  private formatResult(result: ReviewResult): string {
    const output: string[] = [];
    
    output.push(`🔍 Code Review Results for ${result.file}`);
    output.push('=' .repeat(50));
    
    // Methodology Compliance
    if (result.methodologyCompliance) {
      const mc = result.methodologyCompliance;
      const statusIcon = mc.status === 'passed' ? '✅' : mc.status === 'warnings' ? '⚠️' : '❌';
      output.push(`\n${statusIcon} ${mc.methodology.charAt(0).toUpperCase() + mc.methodology.slice(1)} Compliance: ${mc.status.toUpperCase()}`);
      if (mc.details.length > 0) {
        mc.details.forEach(detail => output.push(`   - ${detail}`));
      }
    }
    
    // Summary
    output.push('\n📊 Summary:');
    if (result.summary.critical > 0) output.push(`   🔴 Critical: ${result.summary.critical}`);
    if (result.summary.high > 0) output.push(`   🟠 High: ${result.summary.high}`);
    if (result.summary.medium > 0) output.push(`   🟡 Medium: ${result.summary.medium}`);
    if (result.summary.low > 0) output.push(`   🟢 Low: ${result.summary.low}`);
    if (result.summary.info > 0) output.push(`   ℹ️  Info: ${result.summary.info}`);
    
    if (result.findings.length === 0) {
      output.push('\n✅ No issues found! Code looks good.');
      return output.join('\n');
    }
    
    // Detailed findings
    output.push('\n📋 Findings:\n');
    
    let lastSeverity = '';
    result.findings.forEach(finding => {
      if (finding.severity !== lastSeverity) {
        output.push(`\n${this.getSeverityIcon(finding.severity)} ${finding.severity.toUpperCase()}`);
        lastSeverity = finding.severity;
      }
      
      output.push(`\n   ${finding.file}:${finding.line}${finding.column ? ':' + finding.column : ''}`);
      output.push(`   Rule: ${finding.rule} (via ${finding.tool})`);
      output.push(`   Issue: ${finding.message}`);
      
      if (finding.suggestion) {
        output.push(`   💡 Fix: ${finding.suggestion}`);
      }
    });
    
    // Recommendations
    output.push('\n\n💡 Recommendations:');
    if (result.summary.critical > 0) {
      output.push('   1. Address critical security issues immediately');
    }
    if (result.summary.high > 0) {
      output.push('   2. Review and fix high-severity findings before deployment');
    }
    output.push('   3. Consider running additional security tools for comprehensive coverage');
    
    // Claude Guidance (for learning)
    if (result.claudeGuidance) {
      const g = result.claudeGuidance;
      output.push('\n\n🌱 Learning Opportunity - Let\'s fix this properly:');
      
      // Context (why this matters)
      if (g.context) {
        output.push(`\n📖 Context: ${g.context}`);
      }
      
      output.push(`\n⚠️ Issue: ${g.pattern}`);
      output.push(`Reminder: ${g.reminder}`);
      
      // Multi-shot examples
      if (g.example) {
        output.push(`\n❌ Bad Example:\n${g.example}`);
      }
      if (g.goodExample) {
        output.push(`\n✅ Good Example:\n${g.goodExample}`);
      }
      
      // Step-by-step thinking
      if (g.stepByStep && g.stepByStep.length > 0) {
        output.push('\n🔄 Step-by-Step Fix:');
        g.stepByStep.forEach(step => output.push(step));
      } else {
        output.push(`\n🔧 How to fix: ${g.correction}`);
      }
      
      // Self-reflection
      if (g.reflection) {
        output.push(`\n🤔 Reflection: ${g.reflection}`);
      }
      
      if (g.reinforcement) {
        output.push(`\n📌 Note to self: ${g.reinforcement}`);
      }
    }
    
    return output.join('\n');
  }
  
  private getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
      info: 'ℹ️'
    };
    return icons[severity] || '❓';
  }
  
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🪴 MCP Code Reviewer started');
  }
}

// Start the server
const server = new CodeReviewerServer();
server.start().catch(console.error);