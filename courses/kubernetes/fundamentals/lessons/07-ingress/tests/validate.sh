#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LESSON_DIR="$(dirname "$SCRIPT_DIR")"
COURSE_DIR="$(dirname "$(dirname "$LESSON_DIR")")"
source "$COURSE_DIR/shared/test-helpers.sh"

MODE="${1:-starter}"
WORK_DIR="${WORK_DIR:-$LESSON_DIR/$MODE}"

echo "🧪 Lesson 07: Ingress & Routing"
echo "   Mode: $MODE"
echo ""

kubectl delete ingress echo-ingress --ignore-not-found 2>/dev/null || true
kubectl delete deployment echo-deploy --ignore-not-found --wait=false 2>/dev/null || true
kubectl delete svc echo-svc --ignore-not-found 2>/dev/null || true
sleep 2

cd "$WORK_DIR"
bash challenge.sh 2>/dev/null

# Test 1: Ingress resource exists
ING_NAME=$(kubectl get ingress echo-ingress -o jsonpath='{.metadata.name}' 2>/dev/null || echo "")
assert_eq "Ingress echo-ingress exists" "echo-ingress" "$ING_NAME"

# Test 2: Ingress has correct host
ING_HOST=$(kubectl get ingress echo-ingress -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "")
assert_eq "Ingress routes echo.local" "echo.local" "$ING_HOST"

# Test 3: Ingress points to echo-svc
ING_SVC=$(kubectl get ingress echo-ingress -o jsonpath='{.spec.rules[0].http.paths[0].backend.service.name}' 2>/dev/null || echo "")
assert_eq "Ingress backend is echo-svc" "echo-svc" "$ING_SVC"

# Test 4: Response was captured
if [[ -f ./ingress-response.txt ]]; then
  RESPONSE=$(cat ./ingress-response.txt)
else
  RESPONSE=""
fi
assert_contains "Ingress returned expected response" "$RESPONSE" "ingress-works"

# Cleanup
kubectl delete ingress echo-ingress --ignore-not-found 2>/dev/null || true
kubectl delete deployment echo-deploy --ignore-not-found --wait=false 2>/dev/null || true
kubectl delete svc echo-svc --ignore-not-found 2>/dev/null || true
rm -f ./ingress-response.txt

print_results
