#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LESSON_DIR="$(dirname "$SCRIPT_DIR")"
COURSE_DIR="$(dirname "$(dirname "$LESSON_DIR")")"
source "$COURSE_DIR/shared/test-helpers.sh"

MODE="${1:-starter}"
WORK_DIR="${WORK_DIR:-$LESSON_DIR/$MODE}"

echo "🧪 Lesson 02: Running Pods"
echo "   Mode: $MODE"
echo ""

# Cleanup from prior runs
kubectl delete pod hello-pod --ignore-not-found --wait=false 2>/dev/null || true
sleep 2

cd "$WORK_DIR"
bash challenge.sh 2>/dev/null

# Test 1: Pod exists and is Running
POD_STATUS=$(kubectl get pod hello-pod -o jsonpath='{.status.phase}' 2>/dev/null || echo "")
assert_eq "Pod hello-pod is Running" "Running" "$POD_STATUS"

# Test 2: Pod has correct label
POD_LABEL=$(kubectl get pod hello-pod -o jsonpath='{.metadata.labels.app}' 2>/dev/null || echo "")
assert_eq "Pod has label app=hello" "hello" "$POD_LABEL"

# Test 3: Container image is correct
POD_IMAGE=$(kubectl get pod hello-pod -o jsonpath='{.spec.containers[0].image}' 2>/dev/null || echo "")
assert_contains "Container uses http-echo image" "$POD_IMAGE" "hashicorp/http-echo"

# Test 4: Response was captured
if [[ -f ./response.txt ]]; then
  RESPONSE=$(cat ./response.txt)
else
  RESPONSE=""
fi
assert_contains "Response contains greeting" "$RESPONSE" "Hello from Vibe Train!"

# Cleanup
kubectl delete pod hello-pod --ignore-not-found --wait=false 2>/dev/null || true
rm -f ./response.txt

print_results
