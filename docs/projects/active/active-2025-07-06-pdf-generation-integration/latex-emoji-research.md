# LaTeX Emoji Support Research

*Source: Claude.ai research on Unicode emoji support in LaTeX*

## Key Findings for Aichaku PDF Generation

### Engine Requirements

1. **LuaLaTeX with HarfBuzz** (LuaHBTeX) - Best solution
   - Full color emoji support
   - Handles complex sequences (skin tones, ZWJ)
   - Default in TeX Live 2020+

2. **XeLaTeX** - Limited support
   - Monochrome emojis only (Symbola font)
   - Cannot render color emoji fonts
   - Simpler setup but less visual appeal

3. **pdfLaTeX** - No native support
   - Requires image conversion workarounds
   - Not recommended for emoji-heavy documents

### Font Recommendations

#### Color Fonts (LuaLaTeX only)

- **Noto Color Emoji** - Best cross-platform, open-source
- **Apple Color Emoji** - macOS only, proprietary format
- **Segoe UI Emoji** - Windows default
- **Twemoji Mozilla** - Twitter's open-source set

#### Monochrome Fonts (All engines)

- **Symbola** - Most comprehensive coverage
- **DejaVu Sans** - Good basic coverage
- **Noto Emoji** (monochrome version)

### Implementation for Aichaku

Based on this research, our PDF generator should:

1. **Auto-detect best engine**:

   ```typescript
   async detectBestEngine(): Promise<PDFEngine> {
     if (await this.hasLuaHBTeX()) return 'lualatex';
     if (await this.hasXeLaTeX()) return 'xelatex';
     if (await this.hasPDFLaTeX()) return 'pdflatex';
     return 'none';
   }
   ```

2. **Configure based on engine**:

   ```latex
   % For LuaLaTeX
   \usepackage{emoji}
   \setemojifont{Noto Color Emoji}

   % For XeLaTeX
   \usepackage{fontspec}
   \setmainfont{Latin Modern Roman}
   \newfontfamily\emojifont{Symbola}

   % For pdfLaTeX
   % Warn user about emoji limitations
   ```

3. **Provide fallback strategies**:
   - Strip emojis for pdfLaTeX
   - Convert to Unicode names: 😀 → [grinning face]
   - Use HTML output when emojis are critical

### Platform-Specific Setup

#### macOS

```bash
brew install --cask mactex  # Full TeX
# or
brew install --cask basictex  # Minimal
sudo tlmgr install emoji
```

#### Windows

- Install MiKTeX
- Segoe UI Emoji included by default
- May need: `tlmgr install emoji`

#### Linux

```bash
sudo apt-get install texlive-xetex texlive-luatex
sudo apt-get install fonts-noto-color-emoji
sudo tlmgr install emoji
```

### Practical Implications

1. **Default to LuaLaTeX** when available
2. **Graceful degradation** to XeLaTeX with monochrome
3. **Clear warnings** about emoji support level
4. **HTML as universal fallback** (preserves all emojis)

### Configuration Template

```typescript
export const LATEX_CONFIGS = {
  lualatex: {
    packages: ["emoji"],
    setup: "\\setemojifont{Noto Color Emoji}",
    emojiSupport: "full-color",
  },
  xelatex: {
    packages: ["fontspec"],
    setup: "\\newfontfamily\\emojifont{Symbola}",
    emojiSupport: "monochrome",
  },
  pdflatex: {
    packages: [],
    setup: "",
    emojiSupport: "none",
  },
};
```

## Conclusion

For Aichaku's PDF generation:

1. Prioritize LuaLaTeX for best emoji support
2. Fall back to XeLaTeX with Symbola for basic support
3. Always offer HTML as emoji-preserving alternative
4. Document limitations clearly for each engine
