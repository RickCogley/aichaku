# Cycle Plan: YAML DRY Consolidation

## Week 1: Immediate User-Facing Fixes

### Goal

Fix visible bugs and prepare foundation for consolidation.

### Tasks

#### 1.1 Remove metadata.yaml from Standards (2 days)

- [ ] Update StandardLoader to skip metadata.yaml files ✅ (already done)
- [ ] Test all standards commands work correctly
- [ ] Remove 5 metadata.yaml files from standards directories
- [ ] Verify no "(metadata)" entries in CLI output

#### 1.2 Fix Methodologies Hardcoding (3 days)

- [ ] Create MethodologyLoader using dynamic-content-discovery
- [ ] Remove AVAILABLE_METHODOLOGIES constant
- [ ] Update methodologies command to use new loader
- [ ] Test all methodology operations (list, add, remove, search)
- [ ] Ensure backward compatibility

### Deliverables

- Clean standards list output
- Methodologies loading from YAML files
- All commands working as before

## Week 2: Build Unified YAML Interface

### Goal

Enhance dynamic-content-discovery.ts to be the single YAML service.

### Tasks

#### 2.1 Design Typed Content Interface (1 day)

- [ ] Define generic ContentItem interface
- [ ] Create type mappings for each content type
- [ ] Design consistent metadata structure

#### 2.2 Enhance dynamic-content-discovery.ts (3 days)

- [ ] Add generic loadContent<T>() function
- [ ] Implement type-safe content loading
- [ ] Add caching layer for performance
- [ ] Standardize error handling
- [ ] Create comprehensive tests

#### 2.3 Create Migration Helpers (1 day)

- [ ] Build adapter functions for existing loaders
- [ ] Document migration patterns
- [ ] Create migration guide

### Deliverables

- Enhanced dynamic-content-discovery module
- Type-safe content loading
- Migration documentation

## Week 3: Migrate and Consolidate

### Goal

Migrate all loaders to use unified approach and remove duplication.

### Tasks

#### 3.1 Migrate StandardLoader (2 days)

- [ ] Refactor to use loadContent<Standard>()
- [ ] Remove duplicate YAML parsing
- [ ] Update tests
- [ ] Verify standards command functionality

#### 3.2 Migrate PrincipleLoader (2 days)

- [ ] Refactor to use loadContent<Principle>()
- [ ] Remove duplicate file operations
- [ ] Update tests
- [ ] Verify principles command functionality

#### 3.3 Clean Up and Document (1 day)

- [ ] Remove all duplicate YAML parsing code
- [ ] Update developer documentation
- [ ] Create examples for new content types
- [ ] Performance benchmarking

### Deliverables

- All loaders using unified YAML service
- 70% reduction in YAML-related code
- Complete documentation

## Success Criteria

### Week 1 Checkpoint

- [ ] `aichaku standards --list` shows no "(metadata)" entries
- [ ] `aichaku methodologies --list` loads from YAML files
- [ ] All existing commands work unchanged

### Week 2 Checkpoint

- [ ] Generic loadContent() function tested and working
- [ ] Caching improves performance by 50%+
- [ ] Migration path documented

### Week 3 Checkpoint

- [ ] Single YAML parsing implementation
- [ ] All tests passing
- [ ] Performance benchmarks show improvement
- [ ] Developer documentation complete

## Risk Management

### Technical Risks

1. **Breaking changes**: Mitigate with comprehensive tests
2. **Performance regression**: Mitigate with caching layer
3. **Type safety issues**: Mitigate with TypeScript generics

### Schedule Risks

1. **Underestimated complexity**: Have fallback to keep some implementations
2. **Test failures**: Time-boxed to 1 day per component
3. **Integration issues**: Parallel implementation allows rollback

## Development Approach

### Principles

- **Incremental delivery**: Value each week
- **Backward compatibility**: No breaking changes
- **Test-driven**: Write tests before refactoring
- **Performance-aware**: Measure before and after

### Team Coordination

- Daily progress updates
- End-of-week demos
- Immediate escalation of blockers

## Notes

This plan delivers immediate value (Week 1) while building toward the long-term goal of DRY consolidation. The phased
approach reduces risk and allows for course correction if needed.
