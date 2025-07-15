#!/bin/bash
# Generate PDF from markdown change summary
# Requires: pandoc (brew install pandoc)

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "Error: pandoc is not installed."
    echo "Install with: brew install pandoc"
    exit 1
fi

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <markdown-file>"
    echo "Example: $0 change-summary.md"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="${INPUT_FILE%.md}.pdf"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File '$INPUT_FILE' not found"
    exit 1
fi

# Ensure PATH includes TeX
export PATH="/Library/TeX/texbin:$PATH"

# Generate PDF - try xelatex first for Unicode support
if command -v xelatex &> /dev/null; then
    echo "Using xelatex for Unicode support..."
    pandoc "$INPUT_FILE" \
        -o "$OUTPUT_FILE" \
        --pdf-engine=xelatex \
        --variable geometry:margin=1in \
        --variable fontsize=11pt \
        --variable linkcolor=blue \
        --variable urlcolor=blue \
        --variable colorlinks=true \
        --variable mainfont="Helvetica Neue" \
        --variable sansfont="Helvetica Neue" \
        --variable monofont="Menlo"
else
    echo "Using pdflatex (Unicode characters will be converted)..."
    # Convert Unicode to ASCII approximations
    iconv -f UTF-8 -t ASCII//TRANSLIT "$INPUT_FILE" > "${INPUT_FILE}.tmp"
    pandoc "${INPUT_FILE}.tmp" \
        -o "$OUTPUT_FILE" \
        --pdf-engine=pdflatex \
        --variable geometry:margin=1in \
        --variable fontsize=11pt \
        --variable linkcolor=blue \
        --variable urlcolor=blue \
        --variable colorlinks=true
    rm "${INPUT_FILE}.tmp"
fi

if [ $? -eq 0 ]; then
    echo "✅ PDF generated: $OUTPUT_FILE"
else
    echo "❌ PDF generation failed"
    exit 1
fi