#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LESSON_DIR="$(dirname "$SCRIPT_DIR")"
COURSE_DIR="$(dirname "$(dirname "$LESSON_DIR")")"
source "$COURSE_DIR/shared/test-helpers.sh"

MODE="${1:-starter}"
WORK_DIR="${WORK_DIR:-$LESSON_DIR/$MODE}"

echo "🧪 Lesson 04: Exposing Services"
echo "   Mode: $MODE"
echo ""

kubectl delete deployment echo-deploy --ignore-not-found --wait=false 2>/dev/null || true
kubectl delete svc echo-svc --ignore-not-found 2>/dev/null || true
kubectl delete pod curl-test --ignore-not-found --force 2>/dev/null || true
sleep 3

cd "$WORK_DIR"
bash challenge.sh 2>/dev/null

# Test 1: Service exists
SVC_NAME=$(kubectl get svc echo-svc -o jsonpath='{.metadata.name}' 2>/dev/null || echo "")
assert_eq "Service echo-svc exists" "echo-svc" "$SVC_NAME"

# Test 2: Service selects app=echo
SVC_SELECTOR=$(kubectl get svc echo-svc -o jsonpath='{.spec.selector.app}' 2>/dev/null || echo "")
assert_eq "Service selects app=echo" "echo" "$SVC_SELECTOR"

# Test 3: Service port mapping
SVC_PORT=$(kubectl get svc echo-svc -o jsonpath='{.spec.ports[0].port}' 2>/dev/null || echo "")
SVC_TARGET=$(kubectl get svc echo-svc -o jsonpath='{.spec.ports[0].targetPort}' 2>/dev/null || echo "")
assert_eq "Service port is 80" "80" "$SVC_PORT"
assert_eq "Service targetPort is 5678" "5678" "$SVC_TARGET"

# Test 4: Response was captured
if [[ -f ./response.txt ]]; then
  RESPONSE=$(cat ./response.txt)
else
  RESPONSE=""
fi
assert_contains "Response from service contains expected text" "$RESPONSE" "service-works"

# Cleanup
kubectl delete deployment echo-deploy --ignore-not-found --wait=false 2>/dev/null || true
kubectl delete svc echo-svc --ignore-not-found 2>/dev/null || true
rm -f ./response.txt

print_results
