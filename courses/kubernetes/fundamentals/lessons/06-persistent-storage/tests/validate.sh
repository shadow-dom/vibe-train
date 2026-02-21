#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LESSON_DIR="$(dirname "$SCRIPT_DIR")"
COURSE_DIR="$(dirname "$(dirname "$LESSON_DIR")")"
source "$COURSE_DIR/shared/test-helpers.sh"

MODE="${1:-starter}"
WORK_DIR="${WORK_DIR:-$LESSON_DIR/$MODE}"

echo "🧪 Lesson 06: Persistent Storage"
echo "   Mode: $MODE"
echo ""

kubectl delete pod writer reader --ignore-not-found --force 2>/dev/null || true
kubectl delete pvc notes-pvc --ignore-not-found 2>/dev/null || true
sleep 3

cd "$WORK_DIR"
bash challenge.sh 2>/dev/null

# Test 1: PVC exists and is Bound
PVC_STATUS=$(kubectl get pvc notes-pvc -o jsonpath='{.status.phase}' 2>/dev/null || echo "")
assert_eq "PVC notes-pvc is Bound" "Bound" "$PVC_STATUS"

# Test 2: Writer pod completed (deleted by now, so check that reader exists)
READER_STATUS=$(kubectl get pod reader -o jsonpath='{.status.phase}' 2>/dev/null || echo "")
assert_eq "Reader pod is Running" "Running" "$READER_STATUS"

# Test 3: Data persisted across pods
if [[ -f ./note-content.txt ]]; then
  CONTENT=$(cat ./note-content.txt)
else
  CONTENT=""
fi
assert_contains "Data survived pod deletion" "$CONTENT" "Hello Persistent World"

# Cleanup
kubectl delete pod reader --ignore-not-found --force 2>/dev/null || true
kubectl delete pvc notes-pvc --ignore-not-found 2>/dev/null || true
rm -f ./note-content.txt

print_results
