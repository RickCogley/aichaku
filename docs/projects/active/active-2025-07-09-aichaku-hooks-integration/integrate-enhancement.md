# Enhanced Integrate Command Design

## Overview

Update the `aichaku integrate` command to include both methodology rules AND selected standards in CLAUDE.md, creating a complete guidance system for Claude Code.

## Current State

The `integrate` command currently only adds methodology rules between markers:
```
<!-- AICHAKU:START -->
[methodology rules]
<!-- AICHAKU:END -->
```

## Enhanced Design

### Multiple Section Support

```markdown
<!-- AICHAKU:METHODOLOGY:START -->
[methodology rules - existing content]
<!-- AICHAKU:METHODOLOGY:END -->

<!-- AICHAKU:STANDARDS:START -->
## 📚 Selected Standards & Guidelines

Based on your project configuration, follow these standards:

### Security Standards
#### OWASP Top 10 Web
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- [full OWASP guidance content]

### Architecture Standards  
#### 15-Factor Apps
- Store config in environment
- Treat backing services as attached resources
- [full 15-factor guidance content]

### Testing Standards
#### Test-Driven Development
- Write test first (red)
- Make it pass (green)
- Refactor (clean)
- [full TDD guidance content]
<!-- AICHAKU:STANDARDS:END -->
```

### Implementation Steps

1. **Load Selected Standards**
   ```typescript
   const standardsConfig = await loadProjectStandards(projectPath);
   const selectedStandards = standardsConfig.selected;
   ```

2. **Fetch Standard Content**
   ```typescript
   for (const standardId of selectedStandards) {
     const content = await loadStandardContent(standardId);
     // Add to standards section
   }
   ```

3. **Update Marker System**
   - Support multiple marker pairs
   - Maintain backward compatibility
   - Update sections independently

4. **Standard Content Storage**
   ```
   ~/.claude/standards/
   ├── security/
   │   ├── owasp-web.md
   │   ├── nist-csf.md
   │   └── gdpr.md
   ├── architecture/
   │   ├── 15-factor.md
   │   └── ddd.md
   └── testing/
       ├── tdd.md
       └── bdd.md
   ```

### User Experience

```bash
# User selects standards
aichaku standards --add owasp-web,15-factor,tdd

# User integrates into CLAUDE.md
aichaku integrate

# Result: CLAUDE.md contains both methodology rules AND selected standards
# Claude Code now generates secure, cloud-native, test-driven code from the start
```

### Benefits

1. **Proactive Quality**: Code is generated correctly from the beginning
2. **Consistency**: Same standards for generation and review
3. **Customization**: Each project gets exactly the standards it needs
4. **Maintainability**: Standards can be updated independently
5. **Clarity**: Claude Code sees explicit guidance, not just abstract rules

### Integration with MCP

The MCP will read the same `.claude/.aichaku-standards.json` file to know which standards to review against, ensuring consistency between generation and review.

## Next Steps

1. Create standard content files
2. Update integrate.ts to support multiple sections
3. Implement standard content loader
4. Test with real projects