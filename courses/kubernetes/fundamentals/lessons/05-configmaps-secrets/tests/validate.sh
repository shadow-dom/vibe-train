#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LESSON_DIR="$(dirname "$SCRIPT_DIR")"
COURSE_DIR="$(dirname "$(dirname "$LESSON_DIR")")"
source "$COURSE_DIR/shared/test-helpers.sh"

MODE="${1:-starter}"
WORK_DIR="${WORK_DIR:-$LESSON_DIR/$MODE}"

echo "🧪 Lesson 05: Configuration & Secrets"
echo "   Mode: $MODE"
echo ""

kubectl delete pod config-pod --ignore-not-found --force 2>/dev/null || true
kubectl delete configmap app-config --ignore-not-found 2>/dev/null || true
kubectl delete secret app-secret --ignore-not-found 2>/dev/null || true
sleep 2

cd "$WORK_DIR"
bash challenge.sh 2>/dev/null

# Test 1: ConfigMap exists with correct keys
CM_GREETING=$(kubectl get configmap app-config -o jsonpath='{.data.APP_GREETING}' 2>/dev/null || echo "")
assert_eq "ConfigMap has APP_GREETING=Welcome" "Welcome" "$CM_GREETING"

# Test 2: Secret exists
SECRET_KEY=$(kubectl get secret app-secret -o jsonpath='{.data.API_KEY}' 2>/dev/null || echo "")
DECODED=$(echo "$SECRET_KEY" | base64 -d 2>/dev/null || echo "")
assert_eq "Secret has API_KEY=vibe-train-42" "vibe-train-42" "$DECODED"

# Test 3: Pod is running with envFrom
POD_STATUS=$(kubectl get pod config-pod -o jsonpath='{.status.phase}' 2>/dev/null || echo "")
assert_eq "config-pod is Running" "Running" "$POD_STATUS"

# Test 4: greeting.txt
if [[ -f ./greeting.txt ]]; then
  GREETING=$(cat ./greeting.txt | tr -d '[:space:]')
else
  GREETING=""
fi
assert_eq "greeting.txt contains Welcome" "Welcome" "$GREETING"

# Test 5: apikey.txt
if [[ -f ./apikey.txt ]]; then
  APIKEY=$(cat ./apikey.txt | tr -d '[:space:]')
else
  APIKEY=""
fi
assert_eq "apikey.txt contains vibe-train-42" "vibe-train-42" "$APIKEY"

# Cleanup
kubectl delete pod config-pod --ignore-not-found --force 2>/dev/null || true
kubectl delete configmap app-config --ignore-not-found 2>/dev/null || true
kubectl delete secret app-secret --ignore-not-found 2>/dev/null || true
rm -f ./greeting.txt ./apikey.txt

print_results
