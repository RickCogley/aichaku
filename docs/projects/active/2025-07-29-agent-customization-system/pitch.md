# Agent Customization System

## Problem

The current aichaku agent system has a fundamental conflict between maintainability and customization:

1. **Destructive Updates**: Running `aichaku init` or `aichaku upgrade` completely overwrites any user customizations to
   agents, forcing users to either:
   - Never update (missing out on improvements)
   - Manually re-apply customizations after each update
   - Fork the entire project (losing the benefit of centralized updates)

2. **No Clear Customization Path**: Users who want to adjust agent behavior have no documented or supported way to do
   so. The system assumes one-size-fits-all, but real-world usage shows users need to:
   - Adjust agent tone or style for their organization
   - Add domain-specific knowledge or constraints
   - Modify delegation patterns for their workflow
   - Include custom standards or methodologies

3. **Half-Baked State**: The current implementation shows signs of incomplete design:
   - Agent files are generated from templates but treated as static
   - No separation between "core" agent behavior and "user" customizations
   - No version tracking or migration path for agent updates

## Appetite

**3 weeks** (half a standard Shape Up cycle)

This is a focused infrastructure improvement that will unlock significant user value. The scope is well-defined: create
a layered customization system that preserves user modifications while allowing core updates.

## Solution

### Core Concept: Layered Agent Configuration

Instead of monolithic agent files, implement a three-layer system:

```yaml
# Layer 1: Core Template (shipped with aichaku)
agents/templates/security-reviewer.md

# Layer 2: User Customizations (preserved across updates)
.claude/aichaku/customizations/agents/security-reviewer.yaml

# Layer 3: Generated Agent (computed from layers)
.claude/aichaku/agents/security-reviewer.md
```

### How It Works

1. **Core Templates** remain in the aichaku repository and can be updated freely
2. **User Customizations** are stored as YAML overlays that modify specific aspects:
   ```yaml
   # .claude/aichaku/customizations/agents/security-reviewer.yaml
   version: "1.0"
   extends: "security-reviewer"

   # Override specific sections
   tone:
     formality: "casual" # Override default "professional"

   # Append to existing content
   additional_context: |
     Our organization uses NIST 800-53 controls.
     Always reference control numbers in security findings.

   # Modify delegation patterns
   delegations:
     - trigger: "GDPR compliance"
       target: "compliance-officer"
       handoff: "GDPR-specific review needed"
   ```

3. **Generation Process** merges layers intelligently:
   - Start with core template
   - Apply user customizations (overrides, appends, modifications)
   - Generate final agent file with clear markers

### Key Features

1. **Non-Destructive Updates**
   - `aichaku upgrade` updates templates but preserves customizations
   - Users can see what changed in core templates
   - Conflicts are handled gracefully with user choice

2. **Clear Customization Points**
   - Documented sections that can be customized
   - Type-safe YAML schema for customizations
   - Examples and starter templates

3. **Version Compatibility**
   - Customization files include version info
   - Migration guides when template structure changes
   - Backwards compatibility for at least 2 major versions

4. **Developer Experience**
   ```bash
   # View current customizations
   aichaku agent status

   # Create a new customization
   aichaku agent customize security-reviewer

   # See what would change on upgrade
   aichaku upgrade --dry-run

   # Reset an agent to defaults
   aichaku agent reset security-reviewer
   ```

### Implementation Approach

**Week 1: Foundation**

- Design YAML schema for customizations
- Implement layer merging algorithm
- Create customization file management

**Week 2: Integration**

- Update init/upgrade commands
- Add agent customization commands
- Implement conflict resolution

**Week 3: Polish & Migration**

- Create migration tool for existing users
- Write comprehensive documentation
- Add examples and best practices
- Test with real user scenarios

## Rabbit Holes

### 1. **Over-Engineering the Merge Logic**

**Avoid**: Complex JSON Patch or diff algorithms **Instead**: Simple, predictable override and append operations

### 2. **GUI Configuration Tool**

**Avoid**: Building a visual editor for customizations **Instead**: Well-documented YAML with great examples

### 3. **Custom Agent Marketplace**

**Avoid**: Creating a sharing/distribution system **Instead**: Focus on individual user customization first

### 4. **Infinite Customization Options**

**Avoid**: Making everything customizable **Instead**: Identify key customization points that users actually need

### 5. **Complex Versioning Schemes**

**Avoid**: Semantic versioning for each agent **Instead**: Simple version tracking tied to aichaku releases

## No-Gos

1. **Breaking Existing Installations**
   - Must provide smooth migration path
   - Existing users should not lose customizations

2. **Requiring Programming Knowledge**
   - YAML customization should be accessible
   - No TypeScript/JavaScript required

3. **Compromising Security**
   - No arbitrary code execution in customizations
   - Validate all user inputs

4. **Making Updates Optional**
   - System must encourage staying current
   - Updates should be safe, not scary

5. **Fragmenting the Ecosystem**
   - Customizations should extend, not replace
   - Core behavior must remain consistent

## Nice-to-Haves (Not in Scope)

- Customization sharing between team members
- Visual diff tool for template changes
- Automated customization testing
- Per-project agent customizations
- Custom agent creation from scratch

## Success Metrics

1. **Adoption**: 50% of active users create at least one customization
2. **Retention**: 90% of users continue updating after customizing
3. **Satisfaction**: User feedback indicates the system "just works"
4. **Stability**: Zero data loss incidents during updates

## Why This Matters Now

As aichaku grows, the tension between standardization and customization will only increase. Solving this now:

1. **Unlocks Growth**: Users can adapt aichaku to their needs
2. **Enables Evolution**: We can improve agents without breaking workflows
3. **Builds Trust**: Users invest in customization when they trust updates
4. **Reduces Support**: Clear customization path reduces confusion

This is the difference between a tool people try and a tool people rely on.
