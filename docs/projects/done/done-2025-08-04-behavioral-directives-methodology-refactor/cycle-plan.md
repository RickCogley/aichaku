# Cycle Plan: Behavioral Directives & Methodology Refactor

## Bet

**Project**: Fix conceptual inconsistencies in Aichaku's behavioral system **Appetite**: 6 weeks **Team**: Solo
development

## What We're Shipping

### Core Deliverables

1. **Methodology Triggers in Right Place**
   - Each methodology YAML contains its own triggers
   - Markdown documentation updated to match
   - No more centralized "detection" system

2. **Simplified Behavioral Directives**
   - Clear priority order: Context → Selection → Creation → Automation
   - Removed redundant phases and rules
   - Focused on what matters most

3. **Application-First CLAUDE.md**
   - Application context appears first
   - Most important information gets priority
   - Better for large configurations

4. **Consistent Language**
   - "Selection" replaces "detection" throughout
   - Documentation reflects user agency
   - Clear that users choose, we respond

## What We're NOT Shipping

- New methodology features
- Changes to existing user workflows
- Alterations to core Aichaku commands
- Methodology content changes (beyond triggers)

## Success Criteria

✅ Triggers work from methodology files ✅ CLAUDE.md shows app info first ✅ Behavioral directives are clear and focused
✅ Language consistently reflects user selection ✅ Existing configurations still work

## Timeline

- Week 1: Core refactoring (COMPLETE)
- Week 2-3: Testing and refinement
- Week 4-5: Documentation and polish
- Week 6: Cool-down and reflection
