# Pitch: Compact YAML Integration System

## Problem

The current Aichaku integration system has grown organically, resulting in
several pain points:

### 1. CLAUDE.md File Bloat

Currently, when a user selects standards like OWASP, TDD, and Diataxis, the
entire Markdown content of each standard is injected into CLAUDE.md. This
creates files that are:

- **10KB-50KB+** in size for moderate selections

- **Difficult to scan** visually

- **Slow for Claude to parse** repeatedly

- **Problematic for version control** (large diffs)

### 2. Duplicate Command Systems

We maintain two parallel systems:

- `aichaku standards` - for development standards

- `aichaku docs-standard` - for documentation standards

This duplication:

- **Confuses users** ("which command do I use?")

- **Doubles maintenance** (bug fixes needed in both places)

- **Creates inconsistent experiences** (different features in each)

### 3. Underutilized YAML Metadata

Rich YAML files exist with metadata but are only used for display:

````yaml
# Current YAML has all this useful data
name: "OWASP Top 10"
triggers: ["OWASP", "security check", "vulnerability"]
summary:

  overview: "Essential security checks"
  key_points: [...]
rules: [...]
```text

But integration just dumps the entire Markdown file instead of leveraging this
structure.

### 4. Inflexible Integration

Users can't choose how standards appear in CLAUDE.md:

- Always get full content

- No summary mode

- No checklist mode

- No way to customize

## Appetite

**6 weeks** - This is a significant architectural change that affects:

- Core CLI commands

- Configuration management

- Integration engine

- User migration

- Documentation updates

## Solution

### Core Idea: Compact YAML Configuration Block

Replace the current marker-based injection system with a single, compact YAML
block in CLAUDE.md:

```yaml
# Aichaku Configuration
aichaku:

  version: "3.0.0"

  # All methodologies always available (for reference)
  methodologies:
    shape_up:
      triggers:
        [
          "shape",
          "appetite",
          "pitch",
          "betting table",
          "6 weeks",
          "cycle",
          "bet",
          "cool-down",
        ]
      best_for: "Features with unclear solutions, fixed timeline projects, avoiding scope creep"
    scrum:
      triggers: ["sprint", "scrum", "velocity", "standup", "product owner"]
      best_for: "Teams needing predictable delivery, client visibility, regular rhythm"
    kanban:
      triggers: ["kanban", "flow", "WIP limit", "continuous", "pull"]
      best_for: "Continuous flow work, support teams, varying priorities, starting simply"
    # ... other methodologies

  # Only selected standards included
  standards:
    # Security Standards
    owasp_web:
      category: "security"
      triggers: ["OWASP", "security check", "vulnerability", "top 10"]
      focus: "Web application security verification"
      rules_count: 10
      integration_url: "~/.claude/aichaku/standards/security/owasp-web.md"

    # Development Standards
    tdd:
      category: "development"
      triggers: ["TDD", "test first", "red green refactor", "test driven"]
      focus: "Test-driven development practices"
      cycle: "Red → Green → Refactor"
      integration_url: "~/.claude/aichaku/standards/development/tdd.md"

    # Documentation Standards (merged from docs-standard)
    diataxis:
      category: "documentation"
      triggers: ["tutorial", "how-to", "reference", "explanation"]
      focus: "Four-part documentation framework"
      quadrants: [
        "Tutorials",
        "How-to guides",
        "Technical reference",
        "Explanation",
      ]
      integration_url: "~/.claude/aichaku/standards/documentation/diataxis.md"
```text

### Key Benefits

1. **Tiny Footprint**: ~2KB instead of 50KB+

2. **Fast Parsing**: YAML is structured data

3. **Smart Integration**: Claude gets triggers and can load full content on
   demand

4. **User Editable**: Users can add custom fields

5. **Clean Diffs**: Version control friendly

### Implementation Architecture

```mermaid
graph TD
    A[User: aichaku standards --add owasp,tdd] --> B[ConfigManager]
    B --> C[Update aichaku.json]
    C --> D[User: aichaku integrate]
    D --> E[Integration Engine]
    E --> F[Load selected standards metadata]
    F --> G[Generate YAML block]
    G --> H[Replace in CLAUDE.md]

    I[Claude reads CLAUDE.md] --> J[Sees compact YAML]
    J --> K[Knows triggers/focus]
    K --> L[Can load full content via integration_url if needed]
```text

### Command Unification

Merge `docs-standard` into `standards`:

```bash
# Before (confusing)
aichaku standards --add tdd
aichaku docs-standard --add diataxis

# After (unified)
aichaku standards --add tdd,diataxis
aichaku standards --list --category documentation
aichaku standards --remove diataxis
```text

### Migration Strategy

1. **Auto-detect old format** when running `integrate`

2. **Convert to new format** automatically

3. **Preserve custom content** outside YAML block

4. **Show clear migration message** explaining changes

### Advanced Features (Future Compatible)

The YAML structure enables future enhancements:

```yaml
standards:

  owasp_web:
    integration_mode: "summary" # or "full", "checklist", "custom"
    custom_template: "path/to/template"
    enabled_rules: ["A01", "A02", "A07"] # Selective rules
```text

## Technical Details

### File Structure Changes

```text
~/.claude/aichaku/
├── docs/
│   └── standards/
│       ├── security/
│       ├── development/
│       ├── documentation/   # ← Move docs standards here
│       ├── testing/
│       └── architecture/
```text

### Configuration Consolidation

```typescript
// Before: Multiple config files
standards.json
doc-standards.json

// After: Single source of truth
aichaku.json {
  standards: {
    selected: ["owasp_web", "tdd", "diataxis"],
    custom: {...}
  }
}
```text

### Integration Algorithm

```typescript
function integrate() {
  // 1. Load configuration
  const config = await loadConfig();
  const selectedStandards = config.standards.selected;

  // 2. Build YAML structure
  const yaml = {
    aichaku: {
      version: "3.0.0",
      methodologies: await loadAllMethodologies(), // Reference only
      standards: await loadSelectedStandardsMetadata(selectedStandards),
    },
  };

  // 3. Read current CLAUDE.md
  const claudeMd = await readFile("CLAUDE.md");

  // 4. Find and replace YAML block (or append if not found)
  const updated = replaceYamlBlock(claudeMd, yaml);

  // 5. Write back
  await writeFile("CLAUDE.md", updated);
}
```text

## Rabbit Holes

### 1. Over-Engineering the YAML Structure

**Danger**: Creating deeply nested, complex YAML that's hard to read/edit
**Solution**: Keep it flat and simple - just what Claude needs

### 2. Backward Compatibility Forever

**Danger**: Maintaining old marker system indefinitely **Solution**: One-time
migration, then deprecate old format

### 3. Dynamic Loading Complexity

**Danger**: Building complex systems for Claude to dynamically load content
**Solution**: Simple `integration_url` field - let Claude handle it

### 4. Custom Template System

**Danger**: Building a full template engine **Solution**: Start with predefined
modes (summary/full), add templates later if needed

### 5. Perfect Category Taxonomy

**Danger**: Endless debates about categorization **Solution**: Use existing
categories, allow multiple categories per standard

## No-Gos

### What We're NOT Doing

1. **Breaking existing installations** - Migration must be automatic

2. **Removing offline support** - Everything still works without internet

3. **Creating new file formats** - Stick with YAML/Markdown

4. **Adding network dependencies** - No remote loading of standards

5. **Complicating the basic flow** - `add` → `integrate` stays simple

6. **Forcing YAML-only** - Users can still edit CLAUDE.md manually

7. **Removing methodology content** - Still copy all /docs for reference

### Scope Boundaries

This project is ONLY about:

- Merging standards commands

- Creating compact YAML integration

- Migrating existing users

- Updating documentation

NOT about:

- Changing how methodologies work

- Adding new standards

- Building template systems

- Creating web interfaces

## Success Criteria

1. **Size Reduction**: CLAUDE.md reduced by 90%+ for typical usage

2. **Command Simplification**: Single `standards` command

3. **Clean Migration**: Existing users auto-migrated without data loss

4. **Performance**: Claude parses CLAUDE.md faster

5. **Maintainability**: 40% less code to maintain

## Working Approach

### Week 1-2: Foundation

- Merge commands into unified system

- Update ConfigManager for single config

- Create YAML generation engine

### Week 3-4: Integration

- Build new integration system

- Create migration logic

- Test with various scenarios

### Week 5: Polish

- Update all documentation

- Add comprehensive tests

- Handle edge cases

### Week 6: Release

- Beta test with users

- Fix final issues

- Release with migration guide

## Risk Mitigation

### Risk: Users Don't Understand Change

**Mitigation**:

- Clear migration messages

- Updated help command

- Example CLAUDE.md files

### Risk: Claude Can't Use New Format

**Mitigation**:

- Test extensively with Claude

- Keep integration_url for full content access

- Maintain trigger keywords

### Risk: Complex Migration Bugs

**Mitigation**:

- Backup original CLAUDE.md

- Dry-run mode for testing

- Clear rollback instructions

## Summary

This shapes a solution that:

- **Reduces CLAUDE.md size by 90%+** through compact YAML

- **Eliminates code duplication** by merging commands

- **Improves performance** for Claude

- **Maintains flexibility** for future enhancements

- **Respects existing users** through automatic migration

The appetite of 6 weeks is appropriate for this architectural change that will
significantly improve the Aichaku experience.

## Decision Required

Are we ready to bet 6 weeks on this compact YAML integration system?

### Key Trade-offs

- ✅ Much smaller CLAUDE.md files

- ✅ Unified command system

- ✅ Better performance

- ✅ Future flexibility

- ❌ One-time migration complexity

- ❌ Documentation rewrite needed

The benefits clearly outweigh the costs. This positions Aichaku for sustainable
growth while improving the user experience.
````
