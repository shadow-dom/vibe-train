#!/usr/bin/env bash
# shared/test-helpers.sh — Reusable assertion functions for lesson tests.

PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

assert_eq() {
  local description="$1" expected="$2" actual="$3"
  TOTAL=$((TOTAL + 1))
  if [[ "$expected" == "$actual" ]]; then
    echo -e "  ${GREEN}✓${NC} ${description}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} ${description}"
    echo -e "    expected: ${YELLOW}${expected}${NC}"
    echo -e "    actual:   ${YELLOW}${actual}${NC}"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local description="$1" haystack="$2" needle="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$haystack" | grep -q "$needle"; then
    echo -e "  ${GREEN}✓${NC} ${description}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} ${description}"
    echo -e "    '${YELLOW}${needle}${NC}' not found in output"
    FAIL=$((FAIL + 1))
  fi
}

assert_not_empty() {
  local description="$1" value="$2"
  TOTAL=$((TOTAL + 1))
  if [[ -n "$value" ]]; then
    echo -e "  ${GREEN}✓${NC} ${description}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} ${description}"
    echo -e "    value was empty"
    FAIL=$((FAIL + 1))
  fi
}

assert_ge() {
  local description="$1" expected="$2" actual="$3"
  TOTAL=$((TOTAL + 1))
  if (( actual >= expected )); then
    echo -e "  ${GREEN}✓${NC} ${description}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} ${description}"
    echo -e "    expected >= ${YELLOW}${expected}${NC}, got ${YELLOW}${actual}${NC}"
    FAIL=$((FAIL + 1))
  fi
}

wait_for_rollout() {
  local resource="$1" namespace="${2:-default}" timeout="${3:-90}"
  kubectl rollout status "$resource" -n "$namespace" --timeout="${timeout}s" 2>/dev/null
}

wait_for_pod_ready() {
  local label="$1" namespace="${2:-default}" timeout="${3:-90}"
  kubectl wait pod -l "$label" -n "$namespace" --for=condition=Ready --timeout="${timeout}s" 2>/dev/null
}

print_results() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if (( FAIL == 0 )); then
    echo -e "${GREEN}All ${TOTAL} tests passed!${NC}"
  else
    echo -e "${RED}${FAIL} of ${TOTAL} tests failed.${NC}"
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  return "$FAIL"
}
