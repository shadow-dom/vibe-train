#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LESSON_DIR="$(dirname "$SCRIPT_DIR")"
COURSE_DIR="$(dirname "$(dirname "$LESSON_DIR")")"
source "$COURSE_DIR/shared/test-helpers.sh"

MODE="${1:-starter}"
WORK_DIR="${WORK_DIR:-$LESSON_DIR/$MODE}"

echo "🧪 Lesson 03: Deployments & Scaling"
echo "   Mode: $MODE"
echo ""

kubectl delete deployment echo-deploy --ignore-not-found --wait=false 2>/dev/null || true
sleep 3

cd "$WORK_DIR"
bash challenge.sh 2>/dev/null

# Test 1: Deployment exists
DEP_NAME=$(kubectl get deployment echo-deploy -o jsonpath='{.metadata.name}' 2>/dev/null || echo "")
assert_eq "Deployment echo-deploy exists" "echo-deploy" "$DEP_NAME"

# Test 2: Deployment has 4 replicas (after scaling)
DESIRED=$(kubectl get deployment echo-deploy -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
assert_eq "Deployment scaled to 4 replicas" "4" "$DESIRED"

# Test 3: All 4 replicas are ready
READY=$(kubectl get deployment echo-deploy -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
assert_ge "4 replicas are ready" 4 "$READY"

# Test 4: ready-count.txt is correct
if [[ -f ./ready-count.txt ]]; then
  FILE_COUNT=$(cat ./ready-count.txt | tr -d '[:space:]')
else
  FILE_COUNT=""
fi
assert_ge "ready-count.txt shows >= 4" 4 "${FILE_COUNT:-0}"

# Cleanup
kubectl delete deployment echo-deploy --ignore-not-found --wait=false 2>/dev/null || true
rm -f ./ready-count.txt

print_results
