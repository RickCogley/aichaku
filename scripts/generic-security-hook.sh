#!/bin/bash
# Generic Security Pre-commit Hook
# Works with MCP HTTP bridge (if available) or falls back to direct scanners
# Can be used in any git repository

set -euo pipefail

# Configuration
MCP_BRIDGE_PORT="${MCP_BRIDGE_PORT:-7182}"
MCP_BRIDGE_HOST="${MCP_BRIDGE_HOST:-localhost}"
SEVERITY_THRESHOLD="${SEVERITY_THRESHOLD:-high}" # critical, high, medium, low
SCAN_TIMEOUT="${SCAN_TIMEOUT:-30}"

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}" >&2
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" >&2
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" >&2
}

# Function to check if MCP HTTP bridge is running
check_mcp_bridge() {
    if command -v curl >/dev/null 2>&1; then
        curl -s -f -m 2 "http://${MCP_BRIDGE_HOST}:${MCP_BRIDGE_PORT}/health" >/dev/null 2>&1
        return $?
    elif command -v wget >/dev/null 2>&1; then
        wget -q -O /dev/null --timeout=2 "http://${MCP_BRIDGE_HOST}:${MCP_BRIDGE_PORT}/health" 2>/dev/null
        return $?
    else
        return 1
    fi
}

# Function to generate session ID
generate_session_id() {
    if command -v uuidgen >/dev/null 2>&1; then
        uuidgen
    elif [ -f /proc/sys/kernel/random/uuid ]; then
        cat /proc/sys/kernel/random/uuid
    else
        echo "git-hook-$$-$(date +%s)"
    fi
}

# Function to scan via MCP bridge with proper JSON-RPC
scan_via_mcp_bridge() {
    local files="$1"
    local session_id=$(generate_session_id)
    local temp_results=$(mktemp)
    trap "rm -f $temp_results" EXIT
    
    log_info "Using MCP HTTP bridge for security scanning (session: ${session_id:0:8}...)"
    
    # Initialize MCP session
    local init_response=$(curl -s -m 5 -X POST "http://${MCP_BRIDGE_HOST}:${MCP_BRIDGE_PORT}/rpc" \
        -H "Content-Type: application/json" \
        -H "X-Session-ID: $session_id" \
        -d '{
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "0.1.0",
                "capabilities": {
                    "tools": {}
                },
                "clientInfo": {
                    "name": "git-security-hook",
                    "version": "1.0.0"
                }
            }
        }' 2>/dev/null)
    
    if [ $? -ne 0 ] || [ -z "$init_response" ]; then
        log_warn "Failed to initialize MCP session"
        return 1
    fi
    
    # Check if initialization succeeded
    if echo "$init_response" | jq -e '.error' >/dev/null 2>&1; then
        local error_msg=$(echo "$init_response" | jq -r '.error.message // "Unknown error"')
        log_warn "MCP initialization error: $error_msg"
        return 1
    fi
    
    local has_critical=0
    local has_high=0
    local has_medium=0
    local total_issues=0
    
    # Scan each file
    while IFS= read -r file; do
        [ -z "$file" ] && continue
        [ ! -f "$file" ] && continue
        
        log_info "Scanning: $file"
        
        # Get staged content
        local content=$(git show ":$file" 2>/dev/null || cat "$file" 2>/dev/null || echo "")
        [ -z "$content" ] && continue
        
        # Prepare review request
        local review_request=$(jq -n \
            --arg file "$file" \
            --arg content "$content" \
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
        
        # Send review request with timeout
        local response=$(curl -s -m "$SCAN_TIMEOUT" -X POST "http://${MCP_BRIDGE_HOST}:${MCP_BRIDGE_PORT}/rpc" \
            -H "Content-Type: application/json" \
            -H "X-Session-ID: $session_id" \
            -d "$review_request" 2>/dev/null)
        
        if [ -n "$response" ]; then
            # Extract findings from response
            local findings=$(echo "$response" | jq -r '.result.content[0].text // ""' 2>/dev/null)
            
            if [ -n "$findings" ]; then
                # Count severity levels
                local file_critical=$(echo "$findings" | grep -c "CRITICAL:" || true)
                local file_high=$(echo "$findings" | grep -c "HIGH:" || true)
                local file_medium=$(echo "$findings" | grep -c "MEDIUM:" || true)
                
                if [ $file_critical -gt 0 ]; then
                    has_critical=$((has_critical + file_critical))
                    log_error "Found $file_critical CRITICAL issue(s) in $file"
                    echo "$findings" | grep "CRITICAL:" | head -3
                fi
                
                if [ $file_high -gt 0 ]; then
                    has_high=$((has_high + file_high))
                    log_warn "Found $file_high HIGH severity issue(s) in $file"
                    echo "$findings" | grep "HIGH:" | head -2
                fi
                
                if [ $file_medium -gt 0 ]; then
                    has_medium=$((has_medium + file_medium))
                    [ "$SEVERITY_THRESHOLD" = "medium" ] || [ "$SEVERITY_THRESHOLD" = "low" ] && \
                        log_info "Found $file_medium MEDIUM severity issue(s) in $file"
                fi
                
                total_issues=$((total_issues + file_critical + file_high + file_medium))
            fi
        fi
    done <<< "$files"
    
    # Close session
    curl -s -X DELETE "http://${MCP_BRIDGE_HOST}:${MCP_BRIDGE_PORT}/session" \
        -H "X-Session-ID: $session_id" >/dev/null 2>&1
    
    # Summary
    if [ $total_issues -gt 0 ]; then
        echo -e "\n📊 Security Scan Summary:"
        [ $has_critical -gt 0 ] && echo -e "  ${RED}CRITICAL: $has_critical${NC}"
        [ $has_high -gt 0 ] && echo -e "  ${YELLOW}HIGH: $has_high${NC}"
        [ $has_medium -gt 0 ] && echo -e "  ${BLUE}MEDIUM: $has_medium${NC}"
    fi
    
    # Determine if we should block based on threshold
    case "$SEVERITY_THRESHOLD" in
        "critical")
            [ $has_critical -gt 0 ] && return 1
            ;;
        "high")
            [ $has_critical -gt 0 ] || [ $has_high -gt 0 ] && return 1
            ;;
        "medium")
            [ $has_critical -gt 0 ] || [ $has_high -gt 0 ] || [ $has_medium -gt 0 ] && return 1
            ;;
    esac
    
    return 0
}

# Function to run direct scanners
run_direct_scanners() {
    local files="$1"
    local has_issues=0
    local scanner_found=0
    
    log_info "Using direct security scanners..."
    
    # Create temp directory for staged files
    local scan_dir=$(mktemp -d)
    trap "rm -rf $scan_dir" EXIT
    
    # Copy staged files preserving directory structure
    while IFS= read -r file; do
        [ -z "$file" ] && continue
        if [ -f "$file" ]; then
            mkdir -p "$scan_dir/$(dirname "$file")"
            git show ":$file" > "$scan_dir/$file" 2>/dev/null || cp "$file" "$scan_dir/$file"
        fi
    done <<< "$files"
    
    # Try Semgrep
    if command -v semgrep >/dev/null 2>&1; then
        scanner_found=1
        log_info "Running Semgrep security scan..."
        
        local semgrep_output=$(semgrep --config=auto --json --quiet "$scan_dir" 2>/dev/null || true)
        
        if [ -n "$semgrep_output" ] && echo "$semgrep_output" | jq -e '.results | length > 0' >/dev/null 2>&1; then
            local critical_count=$(echo "$semgrep_output" | jq '[.results[] | select(.extra.severity == "ERROR")] | length' 2>/dev/null || echo "0")
            local high_count=$(echo "$semgrep_output" | jq '[.results[] | select(.extra.severity == "WARNING")] | length' 2>/dev/null || echo "0")
            
            if [ "$critical_count" -gt 0 ]; then
                log_error "Semgrep found $critical_count critical issue(s)"
                echo "$semgrep_output" | jq -r '.results[] | select(.extra.severity == "ERROR") | "  [\(.extra.severity)] \(.path | sub("'"$scan_dir/"'"; "")):\(.start.line) - \(.extra.message // .check_id)"' 2>/dev/null | head -5
                [ "$SEVERITY_THRESHOLD" != "none" ] && has_issues=1
            fi
            
            if [ "$high_count" -gt 0 ]; then
                log_warn "Semgrep found $high_count high severity issue(s)"
                [ "$SEVERITY_THRESHOLD" = "high" ] || [ "$SEVERITY_THRESHOLD" = "medium" ] && has_issues=1
            fi
        else
            log_success "Semgrep: No security issues found"
        fi
    fi
    
    # Try GitLeaks
    if command -v gitleaks >/dev/null 2>&1; then
        scanner_found=1
        log_info "Running GitLeaks for secret detection..."
        
        # Run gitleaks on the temp directory
        if cd "$scan_dir" && gitleaks detect --no-git --quiet 2>/dev/null; then
            log_success "GitLeaks: No secrets found"
        else
            log_error "GitLeaks detected potential secrets!"
            cd "$scan_dir" && gitleaks detect --no-git --verbose 2>&1 | grep -E "(Secret:|File:)" | head -10
            has_issues=1
        fi
        cd - >/dev/null
    fi
    
    # Try Trivy
    if command -v trivy >/dev/null 2>&1; then
        scanner_found=1
        log_info "Running Trivy security scan..."
        
        if trivy fs --security-checks vuln,config --quiet --exit-code 1 "$scan_dir" >/dev/null 2>&1; then
            log_success "Trivy: No vulnerabilities found"
        else
            log_warn "Trivy found security issues"
            trivy fs --security-checks vuln,config --severity HIGH,CRITICAL "$scan_dir" 2>/dev/null | grep -A5 "HIGH\|CRITICAL" | head -10
            [ "$SEVERITY_THRESHOLD" != "none" ] && has_issues=1
        fi
    fi
    
    # Basic pattern matching as fallback
    if [ $scanner_found -eq 0 ]; then
        log_info "No security scanners found, using basic pattern checks..."
        
        while IFS= read -r file; do
            [ -z "$file" ] && continue
            if [ -f "$file" ] && [[ "$file" =~ \.(js|ts|py|go|java|rb|php|cs)$ ]]; then
                local content=$(git show ":$file" 2>/dev/null || cat "$file")
                
                # Check for hardcoded secrets
                if echo "$content" | grep -iE '(api[_-]?key|secret|password|token|bearer)\s*[:=]\s*["\x27][^"\x27]{8,}["\x27]' >/dev/null 2>&1; then
                    log_warn "Potential hardcoded secret in $file"
                    has_issues=1
                fi
                
                # Check for dangerous functions
                if echo "$content" | grep -E '(eval\s*\(|exec\s*\(|system\s*\(|\$_(GET|POST|REQUEST))' >/dev/null 2>&1; then
                    log_warn "Potentially dangerous function in $file"
                    has_issues=1
                fi
            fi
        done <<< "$files"
    fi
    
    return $has_issues
}

# Main execution
main() {
    echo -e "${BLUE}🔒 Running security checks...${NC}"
    
    # Get staged files
    local staged_files=$(git diff --cached --name-only --diff-filter=ACM | \
        grep -E '\.(ts|js|jsx|tsx|py|go|java|cs|rb|rs|cpp|c|h|hpp|php|swift|kt|scala|r|m|mm)$' || true)
    
    if [ -z "$staged_files" ]; then
        log_info "No code files staged for commit"
        exit 0
    fi
    
    # Count files
    local file_count=$(echo "$staged_files" | wc -l | tr -d ' ')
    log_info "Found $file_count file(s) to scan"
    
    # Check if MCP bridge is available
    if check_mcp_bridge; then
        if scan_via_mcp_bridge "$staged_files"; then
            log_success "Security scan passed via MCP bridge"
            exit 0
        else
            log_error "Security issues detected - please fix before committing"
            echo -e "\n💡 To bypass (use with caution): git commit --no-verify"
            exit 1
        fi
    else
        # Fall back to direct scanners
        if run_direct_scanners "$staged_files"; then
            log_success "Security scan passed"
            exit 0
        else
            log_error "Security issues detected - please fix before committing"
            echo -e "\n💡 To bypass (use with caution): git commit --no-verify"
            exit 1
        fi
    fi
}

# Run main function
main "$@"