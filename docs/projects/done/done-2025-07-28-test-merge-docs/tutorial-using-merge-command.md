# Tutorial: Using the Merge Command

This tutorial shows how to use the `aichaku merge-docs` command to merge documentation from completed projects into the
central documentation structure.

## Prerequisites

- Aichaku installed and configured
- At least one completed project in `docs/projects/done/`
- Documentation files following naming conventions

## Step 1: Understanding the Merge Process

The merge command automatically:

1. Scans `docs/projects/done/` for completed projects
2. Identifies documentation files by naming patterns
3. Copies them to appropriate central locations
4. Adds metadata headers for tracking

## Step 2: Preview the Merge

Before making changes, preview what will happen:

```bash
aichaku merge-docs --dry-run
```

This shows you:

- Which files will be merged
- Where they will be placed
- Any conflicts that need resolution

## Step 3: Perform the Merge

Once you're satisfied with the plan:

```bash
aichaku merge-docs
```

Or to merge a specific project:

```bash
aichaku merge-docs --project done-2025-07-28-my-feature
```

## Step 4: Handle Conflicts

If files already exist, use the `--force` flag:

```bash
aichaku merge-docs --force
```

## File Classification

The merge command classifies files by naming pattern:

- `tutorial-*.md` → `docs/tutorials/`
- `how-to-*.md` → `docs/how-to/`
- `reference-*.md` → `docs/reference/`
- `explanation-*.md` → `docs/explanation/`

## Best Practices

1. **Use descriptive filenames** that indicate the document type
2. **Review the dry-run output** before merging
3. **Check merged files** to ensure proper formatting
4. **Update indexes** after merging new documentation

## Troubleshooting

### File Not Merged

- Check the filename follows the naming convention
- Verify the project is in `docs/projects/done/`
- Ensure the file is a `.md` file

### Permission Errors

- Verify write permissions to the docs directory
- Check that target directories exist

### Conflicts

- Use `--force` to overwrite existing files
- Review existing content before overwriting

## Next Steps

After merging documentation:

1. Update the main documentation index
2. Test links and references
3. Consider updating navigation menus
4. Review the merged content for accuracy

This completes the documentation merge tutorial!
