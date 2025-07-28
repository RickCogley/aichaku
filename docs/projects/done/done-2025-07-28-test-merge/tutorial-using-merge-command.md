# Tutorial: Using the Aichaku Merge Command

This tutorial will guide you through using the `aichaku merge-docs` command to merge completed project documentation
back into the central documentation structure.

## Prerequisites

- Aichaku installed and configured
- A completed project in `docs/projects/done/`
- Documentation files following naming conventions

## Steps

### 1. Complete Your Project

First, ensure your project is marked as complete and moved to the done folder:

```bash
mv docs/projects/active/2025-07-28-my-feature docs/projects/done/done-2025-07-28-my-feature
```

### 2. Review Documentation Files

Check that your documentation files follow standard naming patterns:

- `tutorial-*.md` - Learning-oriented guides
- `how-to-*.md` - Task-oriented guides
- `reference-*.md` - Information-oriented documentation
- `explanation-*.md` - Understanding-oriented documentation

### 3. Run Merge Command

Execute the merge command:

```bash
aichaku merge-docs
```

This will:

1. Find the most recent completed project
2. Analyze documentation files
3. Show you the merge plan
4. Ask for confirmation
5. Move files to appropriate locations

### 4. Verify Results

After merging, verify that files were placed correctly:

```bash
ls docs/tutorials/
ls docs/how-to/
ls docs/reference/
ls docs/explanation/
```

## Options

- `--project-name <name>` - Specify a specific project to merge
- `--dry-run` - Preview what would be merged without making changes
- `--force` - Overwrite existing files without asking
- `--silent` - Suppress output messages

## Next Steps

After merging:

1. Review the merged documentation
2. Update any cross-references
3. Commit the changes to version control

## Troubleshooting

If files aren't detected:

- Check file naming conventions
- Ensure files are in the done project folder
- Use `--dry-run` to see what the command detects
