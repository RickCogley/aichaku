# Improved Installer Flow

## Current Issues
1. "Installing Aichaku globally..." appears twice
2. "Global installation complete!" and "Aichaku v0.12.0 installed successfully!" are redundant
3. Next steps message differs between global install and project skip
4. Doesn't clearly state it's for Claude Code projects

## Proposed Flow

```
🪴 Aichaku Installer - Methodology Support for Claude Code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Current: v0.11.0
📦 Latest:  v0.12.0

🔄 Upgrading Aichaku CLI...
   • Clearing Deno cache...
   • Installing v0.12.0...
   • Verifying installation...
   ✓ CLI upgraded successfully

🌍 Setting up global methodologies...
   ✓ 24 methodology files ready
   ✓ User customizations preserved
   ✓ Output directories created

✅ Aichaku v0.12.0 installed!

📁 Initialize current directory as a Claude Code project?
(Y/n): n

⏭️  Skipped project initialization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Next steps:
   • Run 'aichaku init' (new) or 'aichaku upgrade' (existing) in your Claude Code projects
   • Say "let's shape a feature" or "plan our sprint"
   • Documents appear in .claude/output/

📚 Learn more: https://github.com/RickCogley/aichaku
```

## Key Changes

1. **Add subtitle**: "Methodology Support for Claude Code" - makes it clear what this is for
2. **Consolidate messages**: Remove duplicate "Installing globally" messages
3. **Streamline success**: Just one success message at the end
4. **Consistent next steps**: Same message whether global install or project skip
5. **Suppress redundant output**: Make the spawned `aichaku init --global` run in silent mode
6. **Better progress indicators**: Use checkmarks consistently

## Implementation

1. Update init.ts to:
   - Add subtitle to header
   - Run `aichaku init --global --silent` to suppress redundant messages
   - Remove "Aichaku v0.12.0 installed successfully!" (keep just the checkmark version)
   - Show methodology count from actual install

2. Update cli.ts to:
   - Change "🎯 Next:" message to match the improved version
   - Make messages more concise

3. Consider adding:
   - Brief description of what Aichaku does on first install
   - Clearer indication that it's for AI-assisted development with Claude Code