#!/usr/bin/env bash
# tests/validate.sh — Tests for Lesson 01: Your First Cluster
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LESSON_DIR="$(dirname "$SCRIPT_DIR")"
COURSE_DIR="$(dirname "$(dirname "$LESSON_DIR")")"
source "$COURSE_DIR/shared/test-helpers.sh"

MODE="${1:-starter}"
WORK_DIR="${WORK_DIR:-$LESSON_DIR/$MODE}"

echo "🧪 Lesson 01: Your First Cluster"
echo "   Mode: $MODE"
echo ""

# Run the student's script
cd "$WORK_DIR"
bash challenge.sh 2>/dev/null

# Test 1: cluster-info should have succeeded (script uses set -e)
CLUSTER_INFO=$(kubectl cluster-info 2>&1 || true)
assert_contains "Cluster is reachable" "$CLUSTER_INFO" "Kubernetes"

# Test 2: node-count.txt exists and has the right count
EXPECTED_NODES=$(kubectl get nodes --no-headers | wc -l | tr -d ' ')
if [[ -f ./node-count.txt ]]; then
  ACTUAL_NODES=$(cat ./node-count.txt | tr -d '[:space:]')
else
  ACTUAL_NODES=""
fi
assert_eq "Node count is correct ($EXPECTED_NODES)" "$EXPECTED_NODES" "$ACTUAL_NODES"

# Test 3: server-version.txt exists and has a valid version
EXPECTED_VERSION=$(kubectl version -o json | jq -r '.serverVersion.gitVersion')
if [[ -f ./server-version.txt ]]; then
  ACTUAL_VERSION=$(cat ./server-version.txt | tr -d '[:space:]')
else
  ACTUAL_VERSION=""
fi
assert_eq "Server version captured ($EXPECTED_VERSION)" "$EXPECTED_VERSION" "$ACTUAL_VERSION"

# Cleanup
rm -f ./node-count.txt ./server-version.txt

print_results
