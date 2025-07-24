# macOS LuaLaTeX Setup Guide

*Source: [Qiita article by haru52](https://qiita.com/haru52/items/d521d7689c5a1e48a2db)*

## Quick Setup for Aichaku Users

### Option 1: Minimal Setup (Recommended)

```bash
# Install BasicTeX (smaller, faster)
brew install --cask basictex

# Add TeX to PATH
export PATH="/Library/TeX/texbin:$PATH"

# Update packages
sudo tlmgr update --self --all

# Install emoji support
sudo tlmgr install emoji collection-fontsrecommended

# Install pandoc for markdown conversion
brew install pandoc
```

### Option 2: Full Setup (Complete TeX)

```bash
# Install Ghostscript first
brew install ghostscript

# Install MacTeX (3.8GB download)
brew install --cask mactex

# Or download from: https://tug.org/mactex/
# Verify with: shasum -a 512 MacTeX.pkg

# Update everything
sudo tlmgr update --self --all

# Set paper size to A4 (optional)
sudo tlmgr paper a4
```

### Verification

```bash
# Check LuaLaTeX is installed
which lualatex

# Test PDF generation
echo "# Test\nHello 👋 emoji!" > test.md
pandoc --pdf-engine=lualatex test.md -o test.pdf

# Should create test.pdf with emoji support
```

### Font Setup for Emojis

```bash
# macOS already has Apple Color Emoji
# For cross-platform compatibility, install Noto:
brew tap homebrew/cask-fonts
brew install --cask font-noto-color-emoji
```

### Integration with Aichaku

Once installed, Aichaku will automatically:

1. Detect LuaLaTeX availability
2. Use it for PDF generation with emoji support
3. Fall back to HTML if not available

### Troubleshooting

If `tlmgr` commands fail:

```bash
# Fix permissions
sudo chown -R $(whoami) /usr/local/texlive/

# Or use sudo for all tlmgr commands
sudo tlmgr update --self --all
```

If PATH not found:

```bash
# Add to ~/.zshrc or ~/.bash_profile
echo 'export PATH="/Library/TeX/texbin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Notes

- BasicTeX (~300MB) vs MacTeX (3.8GB)
- BasicTeX sufficient for Aichaku's needs
- LuaLaTeX included in both distributions
- Recent versions include Japanese font support ("Harano Aji" fonts)
