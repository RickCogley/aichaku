#!/bin/bash
# MCP Review Hook Script
# This script is designed to be called from Claude Code hooks
# It sends review requests to the MCP server

FILE_PATH="$1"

# Skip if no file path provided
if [ -z "$FILE_PATH" ]; then
    echo "No file path provided" >&2
    exit 0
fi

# Skip certain directories
if [[ "$FILE_PATH" =~ node_modules|\.git|dist|build|coverage|\.next|out ]]; then
    echo "Skipping review for excluded path: $FILE_PATH" >&2
    exit 0
fi

# Only review certain file types
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx|py|go|rs|java|cpp|c|h|hpp|md|json|yaml|yml|toml)$ ]]; then
    echo "🪴 Aichaku: Reviewing $FILE_PATH..." >&2
    
    # Check if MCP server is running
    if ! pgrep -f "aichaku-code-reviewer" > /dev/null; then
        echo "⚠️  MCP server not running. Starting it..." >&2
        # Start the server in background
        ~/.aichaku/mcp-servers/aichaku-code-reviewer > ~/.aichaku/mcp-server.log 2>&1 &
        sleep 2 # Give it time to start
    fi
    
    # Send review request to MCP server via JSON-RPC
    REQUEST=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "review_file",
    "arguments": {
      "file": "$FILE_PATH"
    }
  }
}
EOF
)
    
    # Send request and capture response
    RESPONSE=$(echo "$REQUEST" | ~/.aichaku/mcp-servers/aichaku-code-reviewer 2>&1)
    
    # Extract the text content from the response (basic parsing)
    if echo "$RESPONSE" | grep -q '"content"'; then
        # Parse and display the review results
        echo "$RESPONSE" | grep -A 1000 '"text"' | grep -o '"text"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"text"[[:space:]]*:[[:space:]]*"\(.*\)"/\1/' | sed 's/\\n/\n/g' | head -20
    fi
else
    echo "Skipping review for non-code file: $FILE_PATH" >&2
fi