#!/bin/bash

# Direct test of review functionality
echo "Testing Aichaku review command..."

# Create test input
cat > /tmp/test-mcp-input.jsonl << 'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"review_file","arguments":{"file":"/Users/rcogley/dev/aichaku/test-review_test.ts"}}}
EOF

# Run the MCP server (it will exit after processing)
~/.aichaku/mcp-servers/aichaku-code-reviewer < /tmp/test-mcp-input.jsonl > /tmp/test-mcp-output.jsonl 2> /tmp/test-mcp-stderr.txt &
SERVER_PID=$!

# Wait a bit for processing
sleep 3

# Kill the server
kill $SERVER_PID 2>/dev/null

echo "=== Server stderr output ==="
cat /tmp/test-mcp-stderr.txt | head -20

echo -e "\n=== JSON-RPC responses ==="
cat /tmp/test-mcp-output.jsonl

# Clean up
rm -f /tmp/test-mcp-*.jsonl /tmp/test-mcp-*.txt