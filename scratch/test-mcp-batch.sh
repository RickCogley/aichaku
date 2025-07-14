#!/bin/bash

# Test MCP server with batch requests
echo "Testing Aichaku MCP Server..."

# Create temporary file with JSON-RPC requests
cat > /tmp/mcp-test-requests.jsonl << 'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"0.1.0","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"review_file","arguments":{"file":"/Users/rcogley/dev/aichaku/test-review_test.ts","includeExternal":false}}}
EOF

# Send requests to server and capture output
echo "Sending requests to MCP server..."
(
  cat /tmp/mcp-test-requests.jsonl
  # Give server time to process
  sleep 2
  # Send EOF
) | ~/.aichaku/mcp-servers/aichaku-code-reviewer 2>&1 | while IFS= read -r line; do
  # Check if line is JSON (starts with {)
  if [[ "$line" =~ ^\{ ]]; then
    echo "=== JSON Response ==="
    echo "$line" | python3 -m json.tool 2>/dev/null || echo "$line"
  else
    # Server output (stderr)
    echo "[SERVER] $line"
  fi
done

# Clean up
rm -f /tmp/mcp-test-requests.jsonl