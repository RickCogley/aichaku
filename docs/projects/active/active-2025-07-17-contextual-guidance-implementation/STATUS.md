# Status: Enhanced Contextual Guidance for Upgrade Commands

🪴 Aichaku: Shape Up Progress

[**Shaping**] → [Betting] → [Building] → [Cool-down] ▲

Week 1/6 ████░░░░░░░░░░░░░░░░ 16% 🌱

## Current Phase: Shaping

**Problem identified**: Users report missing location context in
`aichaku upgrade --global` output **Solution approach**: Apply existing visual
guidance framework to upgrade commands

## Current Focus

**✅ VALIDATION COMPLETE**: User tested v0.34.1 and confirmed the exact problem
identified in our pitch.

**User Feedback on v0.34.1 Global Upgrade**:

```
🌿 Updating methodology files...
✨ Methodologies ready (49 files verified/updated)
🌿 Updating standards library...
✨ Standards ready (45 files verified/updated)
```

**User Response**: "does not say WHERE the files are located. It's like a black
box, the users gets no feedback about the folder the files have been installed
in, which I think is really disconcerting."

**What's working**:

- ✅ Upgrade mechanics fixed (no more missing aichaku.json)
- ✅ Legacy cleanup working
- ✅ Problem validation confirmed by real user testing
- ✅ Clear implementation path with existing visual guidance framework

**Immediate tasks**:

- ✅ Pitch document complete with comprehensive problem analysis
- ✅ User validation confirms exact problem identified
- 🎯 **READY FOR BETTING**: Move to implementation phase
- 🚀 **Next**: Implement visual guidance in src/commands/upgrade.ts

## Blockers

None currently - proceeding with shaping phase.

## Key Decisions Made

1. **Target scope**: Focus on `aichaku upgrade --global` first (primary user
   feedback)
2. **Technical approach**: Leverage existing `src/utils/visual-guidance.ts`
   framework
3. **Output enhancement**: "What happened and where" + "What's next" guidance
4. **Visual elements**: Directory trees, file counts, spatial awareness

## Next Actions

1. **Complete pitch document** with technical implementation details
2. **Review with stakeholders** (validate approach with team)
3. **Move to betting phase** if pitch is solid
4. **Begin implementation** with focus on src/commands/upgrade.ts

## Risk Assessment

**Low risk enhancement**:

- Builds on existing infrastructure
- Only enhances output, doesn't change upgrade logic
- Addresses immediate user feedback
- Can be implemented incrementally

## Success Metrics

- Users understand exactly where files are installed
- Reduced "where did it install?" support questions
- Consistent location context across all upgrade scenarios
- Visual guidance framework proves its value

## Project Artifacts

- ✅ pitch.md (comprehensive problem/solution definition)
- ✅ STATUS.md (this file - progress tracking)
- 🔄 Technical implementation plan (in progress)
- ⏳ Testing strategy (pending)
- ⏳ User acceptance criteria (pending)

---

**Last updated**: 2025-07-17 by Claude Code **Next review**: When ready for
betting phase
