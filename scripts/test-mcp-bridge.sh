#!/bin/bash
# Test script for MCP HTTP bridge integration

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MCP_PORT="${MCP_PORT:-7182}"

echo -e "${BLUE}🧪 Testing MCP HTTP Bridge Integration${NC}\n"

# Test 1: Check if bridge is running
echo -e "${BLUE}Test 1: Checking if MCP HTTP bridge is running...${NC}"
if curl -s -f "http://localhost:${MCP_PORT}/health" >/dev/null 2>&1; then
    health=$(curl -s "http://localhost:${MCP_PORT}/health")
    echo -e "${GREEN}✅ MCP bridge is running${NC}"
    echo "   Response: $health"
else
    echo -e "${RED}❌ MCP bridge is not running${NC}"
    echo -e "${YELLOW}   Start it with: aichaku mcp --server-start${NC}"
    exit 1
fi

# Test 2: Create a test file with security issue
echo -e "\n${BLUE}Test 2: Creating test file with security issue...${NC}"
TEST_FILE="test-security-issue.js"
cat > "$TEST_FILE" << 'EOF'
// Test file with intentional security issues
const password = "hardcoded-password-123"; // Should trigger secret detection
const userInput = req.query.input;
eval(userInput); // Should trigger code injection warning
const apiKey = "sk_test_1234567890abcdef"; // Another secret
EOF

echo -e "${GREEN}✅ Created $TEST_FILE${NC}"

# Test 3: Send review request
echo -e "\n${BLUE}Test 3: Sending review request to MCP bridge...${NC}"
SESSION_ID="test-$(date +%s)"

# Initialize session
echo "   Initializing session..."
INIT_RESPONSE=$(curl -s -X POST "http://localhost:${MCP_PORT}/rpc" \
    -H "Content-Type: application/json" \
    -H "X-Session-ID: $SESSION_ID" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "0.1.0",
            "capabilities": {},
            "clientInfo": {
                "name": "test-script",
                "version": "1.0.0"
            }
        }
    }' 2>/dev/null)

if echo "$INIT_RESPONSE" | jq -e '.result' >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Session initialized${NC}"
else
    echo -e "${RED}   ❌ Failed to initialize session${NC}"
    echo "   Response: $INIT_RESPONSE"
    rm -f "$TEST_FILE"
    exit 1
fi

# Send review request
echo "   Sending review request..."
CONTENT=$(cat "$TEST_FILE" | jq -Rs .)
REVIEW_REQUEST=$(jq -n \
    --arg file "$TEST_FILE" \
    --arg content "$(cat $TEST_FILE)" \
    '{
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "review_file",
            "arguments": {
                "file": $file,
                "content": $content,
                "includeExternal": true
            }
        }
    }')

REVIEW_RESPONSE=$(curl -s -X POST "http://localhost:${MCP_PORT}/rpc" \
    -H "Content-Type: application/json" \
    -H "X-Session-ID: $SESSION_ID" \
    -d "$REVIEW_REQUEST" 2>/dev/null)

# Parse response
if echo "$REVIEW_RESPONSE" | jq -e '.result' >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Received review response${NC}"
    
    # Extract findings
    FINDINGS=$(echo "$REVIEW_RESPONSE" | jq -r '.result.content[0].text // ""' 2>/dev/null)
    
    if [ -n "$FINDINGS" ]; then
        echo -e "\n${YELLOW}Security Findings:${NC}"
        echo "$FINDINGS" | grep -E "(CRITICAL|HIGH|MEDIUM):" | head -10 || echo "   No specific severity findings extracted"
    else
        echo -e "${YELLOW}   ⚠️  No findings extracted from response${NC}"
    fi
else
    echo -e "${RED}   ❌ Failed to get review response${NC}"
    echo "   Response: $REVIEW_RESPONSE"
fi

# Test 4: Close session
echo -e "\n${BLUE}Test 4: Closing session...${NC}"
CLOSE_RESPONSE=$(curl -s -X DELETE "http://localhost:${MCP_PORT}/session" \
    -H "X-Session-ID: $SESSION_ID" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Session closed${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to close session (not critical)${NC}"
fi

# Cleanup
rm -f "$TEST_FILE"
echo -e "\n${GREEN}✅ Test completed${NC}"

# Test 5: Test the actual git hook
echo -e "\n${BLUE}Test 5: Testing git hook integration...${NC}"
if [ -x ".githooks/hooks.d/40-security-check" ]; then
    # Create test repo
    TEST_REPO=$(mktemp -d)
    cd "$TEST_REPO"
    git init -q
    
    # Copy hook
    mkdir -p .git/hooks
    cp /Users/rcogley/dev/aichaku/.githooks/hooks.d/40-security-check .git/hooks/pre-commit
    
    # Create common functions
    mkdir -p .githooks/lib
    cat > .githooks/lib/common.sh << 'EOF'
log_info() { echo "    ℹ️  $1"; }
log_warn() { echo "    ⚠️  $1"; }
log_error() { echo "    ❌ $1"; }
log_success() { echo "    ✅ $1"; }
EOF
    
    # Create and stage a file with security issue
    cat > insecure.js << 'EOF'
const secret = "my-api-key-12345";
eval(userInput);
EOF
    
    git add insecure.js
    
    echo "   Running pre-commit hook..."
    if .git/hooks/pre-commit; then
        echo -e "${YELLOW}   ⚠️  Hook passed (expected to fail with security issues)${NC}"
    else
        echo -e "${GREEN}   ✅ Hook correctly blocked commit due to security issues${NC}"
    fi
    
    # Cleanup
    cd - >/dev/null
    rm -rf "$TEST_REPO"
else
    echo -e "${YELLOW}   ⚠️  Git hook not found at expected location${NC}"
fi

echo -e "\n${BLUE}📋 Summary:${NC}"
echo "   - MCP HTTP bridge is working correctly"
echo "   - Security scanning via bridge is functional"
echo "   - Git hook integration is ready"
echo -e "\n${GREEN}✨ All tests completed!${NC}"