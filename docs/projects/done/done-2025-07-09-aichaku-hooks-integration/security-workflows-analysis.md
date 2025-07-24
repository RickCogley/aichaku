# SECURITY_WORKFLOWS.md Analysis and Recommendations

## Current Location

`/Users/rcogley/dev/aichaku/.github/SECURITY_WORKFLOWS.md`

## Content Analysis

This file documents GitHub Actions security workflows specifically configured for Aichaku:

### Key Components

1. **5 Security Workflows**:
   - publish.yml - Secure release to JSR
   - security.yml - Daily vulnerability scanning
   - codeql.yml - Code quality and security analysis
   - devskim.yml - Microsoft security linting
   - dependency-review.yml - Supply chain security

2. **Aichaku-Specific Section** (Lines 69-77):
   - Path Security focus (critical for file operations)
   - Input Validation (preventing injection in templates)
   - No Network Operations (reduced attack surface)
   - Documentation Security (safe template generation)

3. **Detailed Configuration**:
   - Workflow triggers and schedules
   - Security rationale for each workflow
   - Maintenance guidelines

## Recommendation: Keep in Aichaku

### Rationale

1. **Specificity**: The entire document is tailored to Aichaku's security needs
2. **Context**: References Aichaku's unique requirements vs. Nagare/Salty
3. **Integration**: Could become part of Aichaku's security guidance modules
4. **Discoverability**: Currently hidden, should be more visible

### Proposed Solution

1. **Move to**: `.claude/methodologies/security/SECURITY-WORKFLOWS.md`

2. **Make Discoverable**:

   ```bash
   aichaku help security-workflows
   aichaku guidance security-workflows
   ```

3. **Hook Integration**:

   ```json
   {
     "PostToolUse": [
       {
         "name": "Security Workflow Check",
         "matcher": "Write",
         "command": "if [[ '${TOOL*INPUT*FILE*PATH}' =~ \\.github/workflows/ ]]; then aichaku validate-security-workflow '${TOOL*INPUT*FILE*PATH}'; fi"
       }
     ]
   }
   ```

4. **Module Format**:

   ```markdown
   ---
   id: security-workflows
   title: GitHub Actions Security Configuration
   tags: [security, ci-cd, github-actions]
   methodologies: [all]
   ---

   [Current content with minor formatting updates]
   ```

## Benefits of Keeping in Aichaku

1. **Complete Security Story**: Pairs with OWASP/ISO guidance
2. **Actionable**: Users can copy workflow configurations
3. **Educational**: Teaches security automation principles
4. **Maintenance**: Updates with Aichaku's security posture

## Implementation Steps

1. Move file to new location
2. Add to security guidance catalog
3. Create help command integration
4. Reference in main documentation
5. Create hook for workflow validation

## Alternative Consideration

If you strongly prefer moving to Nagare:

1. **Extract Generic Parts**: Security workflow principles
2. **Keep Aichaku-Specific**: The section about Aichaku's adaptations
3. **Cross-Reference**: Nagare could reference Aichaku's specific needs
4. **Shared Module**: Create a shared security workflow guide both tools reference

However, given the file's specific focus on Aichaku's security requirements and workflows, keeping it within Aichaku and
making it part of the modular guidance system seems most appropriate.
