#!/bin/bash
# Comprehensive cleanup script for all Aichaku projects
# Run from $HOME directory

echo "🧹 Aichaku Project Cleanup Script"
echo "================================="
echo ""

# Function to clean up a project
cleanup_project() {
    local project_path=$1
    local project_name=$(basename "$project_path")
    
    echo "📁 Cleaning up $project_name..."
    
    # Check if .claude directory exists
    if [ ! -d "$project_path/.claude" ]; then
        echo "  ⚠️  No .claude directory found, skipping"
        return
    fi
    
    # Migrate sessions to docs/checkpoints
    if [ -d "$project_path/.claude/sessions" ]; then
        echo "  📂 Found legacy sessions directory"
        mkdir -p "$project_path/docs/checkpoints"
        
        # Count files to migrate
        file_count=$(find "$project_path/.claude/sessions" -type f -name "*.md" | wc -l)
        if [ $file_count -gt 0 ]; then
            echo "  📋 Migrating $file_count session files to docs/checkpoints/"
            find "$project_path/.claude/sessions" -type f -name "*.md" -exec mv {} "$project_path/docs/checkpoints/" \;
        fi
        
        # Remove empty directory
        rmdir "$project_path/.claude/sessions" 2>/dev/null && echo "  ✅ Removed empty sessions directory"
    fi
    
    # Migrate output files to docs/projects/migrated
    if [ -d "$project_path/.claude/output" ]; then
        echo "  📂 Found legacy output directory"
        mkdir -p "$project_path/docs/projects/migrated"
        
        # Count files to migrate
        file_count=$(find "$project_path/.claude/output" -type f | wc -l)
        if [ $file_count -gt 0 ]; then
            echo "  📋 Migrating $file_count output files to docs/projects/migrated/"
            find "$project_path/.claude/output" -type f -exec mv {} "$project_path/docs/projects/migrated/" \;
        fi
        
        # Remove empty directory
        rmdir "$project_path/.claude/output" 2>/dev/null && echo "  ✅ Removed empty output directory"
    fi
    
    # Remove duplicate files in .claude root
    for file in ".aichaku-behavior" "RULES-REMINDER.md"; do
        if [ -f "$project_path/.claude/$file" ] && [ -f "$project_path/.claude/aichaku/$file" ]; then
            echo "  🔄 Found duplicate $file, removing from .claude root"
            rm "$project_path/.claude/$file"
        fi
    done
    
    # Remove other legacy files
    if [ -f "$project_path/.claude/METHODOLOGY-EXAMPLES.md" ]; then
        echo "  🗑️  Removing legacy METHODOLOGY-EXAMPLES.md"
        rm "$project_path/.claude/METHODOLOGY-EXAMPLES.md"
    fi
    
    # Remove .aichaku-standards.json.backup if exists
    if [ -f "$project_path/.claude/.aichaku-standards.json.backup" ]; then
        echo "  🗑️  Removing .aichaku-standards.json.backup"
        rm "$project_path/.claude/.aichaku-standards.json.backup"
    fi
    
    echo "  ✅ Cleanup complete for $project_name"
    echo ""
}

# Clean up all projects
echo "Starting cleanup for all projects..."
echo ""

# Aichaku project
cleanup_project "$HOME/dev/aichaku"

# Nagare project
cleanup_project "$HOME/dev/nagare"

# Salty project
cleanup_project "$HOME/dev/salty.esolia.pro-dd"

# Dotfiles project
cleanup_project "$HOME/.dotfiles"

echo "🎉 All projects cleaned up!"
echo ""
echo "Next steps:"
echo "1. Run 'aichaku upgrade' in each project directory"
echo "2. Commit the changes to git"
echo "3. Verify everything works correctly"