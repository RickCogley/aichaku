# Execution Plan

## Implementation Sequence

### Phase 1: Methodology Triggers ✅

1. **Update YAML Files**
   - Added triggers to shape-up.yaml
   - Added triggers to scrum.yaml
   - Added triggers to kanban.yaml
   - Added triggers to lean.yaml
   - Added `creates` field for primary template

2. **Update Markdown Files**
   - Updated TRIGGERS line in each methodology .md file
   - Ensured consistency with YAML

### Phase 2: Behavioral Directives ✅

1. **Remove Old Concepts**
   - Deleted methodology_detection section
   - Removed redundant discussion phases
   - Eliminated overlapping rules

2. **Create New Structure**
   - context_awareness (highest priority)
   - respect_user_selection (critical)
   - project_creation (simple workflow)
   - automation (automatic behaviors)

3. **Update Summary**
   - Added clear 5-step principle
   - Emphasized user agency
   - Removed detection language

### Phase 3: CLAUDE.md Reordering ✅

1. **yaml-config-reader.ts Changes**
   - Modified merge order to put app description first
   - Fixed aichaku version placement
   - Updated has_user_customizations logic

2. **integrate.ts Fixes**
   - Corrected config paths (added /docs/)
   - Removed doc_standards from output
   - Fixed path resolution

### Phase 4: Documentation Updates ✅

1. **methodologies/README.md**
   - Changed "detects" to "responds to selection"
   - Updated Quick Start section
   - Fixed "Smart Context Detection" header

2. **KNOWN_ISSUES.md**
   - Documented MultiEdit tool issue
   - Added prevention strategies
   - Included workarounds

## Technical Details

### Key Files Modified

- `/docs/methodologies/*/[methodology].yaml` - Added triggers
- `/docs/methodologies/*/[methodology].md` - Updated TRIGGERS line
- `/docs/core/behavioral-directives.yaml` - Complete rewrite
- `/src/utils/yaml-config-reader.ts` - Reordered merging
- `/src/commands/integrate.ts` - Fixed paths
- `/docs/methodologies/README.md` - Updated language

### Testing Checklist

- [x] Run `aichaku integrate` - Works correctly
- [x] Check CLAUDE.md structure - App info first
- [x] Verify triggers in methodologies - Present and correct
- [x] Test with fresh installation (updated global files)
- [x] Verify methodology responses use triggers (confirmed in CLAUDE.md)

## Lessons Learned

1. **MultiEdit Tool Quirk**: Can double language specifiers when pattern boundaries are ambiguous
2. **Path Importance**: Config paths must include /docs/ subdirectory
3. **Merge Order Matters**: Earlier items in merge take precedence
4. **Clear Language**: "Detection" vs "Selection" makes a big conceptual difference
