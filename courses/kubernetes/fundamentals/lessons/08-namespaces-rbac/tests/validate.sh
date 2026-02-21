#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LESSON_DIR="$(dirname "$SCRIPT_DIR")"
COURSE_DIR="$(dirname "$(dirname "$LESSON_DIR")")"
source "$COURSE_DIR/shared/test-helpers.sh"

MODE="${1:-starter}"
WORK_DIR="${WORK_DIR:-$LESSON_DIR/$MODE}"

echo "🧪 Lesson 08: Namespaces & Access Control"
echo "   Mode: $MODE"
echo ""

kubectl delete namespace sandbox --ignore-not-found --wait=false 2>/dev/null || true
sleep 5

cd "$WORK_DIR"
bash challenge.sh 2>/dev/null

# Test 1: Namespace exists
NS=$(kubectl get namespace sandbox -o jsonpath='{.metadata.name}' 2>/dev/null || echo "")
assert_eq "Namespace sandbox exists" "sandbox" "$NS"

# Test 2: ServiceAccount exists
SA=$(kubectl get serviceaccount deployer -n sandbox -o jsonpath='{.metadata.name}' 2>/dev/null || echo "")
assert_eq "ServiceAccount deployer exists" "deployer" "$SA"

# Test 3: Role exists with correct permissions
ROLE_RESOURCES=$(kubectl get role deploy-manager -n sandbox -o jsonpath='{.rules[0].resources[0]}' 2>/dev/null || echo "")
assert_eq "Role grants access to deployments" "deployments" "$ROLE_RESOURCES"

# Test 4: RoleBinding exists
RB=$(kubectl get rolebinding deployer-binding -n sandbox -o jsonpath='{.metadata.name}' 2>/dev/null || echo "")
assert_eq "RoleBinding deployer-binding exists" "deployer-binding" "$RB"

# Test 5: Deployment in sandbox namespace
DEP_REPLICAS=$(kubectl get deployment web -n sandbox -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
assert_eq "Deployment web has 2 replicas" "2" "$DEP_REPLICAS"

# Test 6: deployer CAN list deployments
if [[ -f ./can-list-deployments.txt ]]; then
  CAN_LIST=$(cat ./can-list-deployments.txt | tr -d '[:space:]')
else
  CAN_LIST=""
fi
assert_eq "deployer can list deployments" "yes" "$CAN_LIST"

# Test 7: deployer CANNOT list secrets
if [[ -f ./can-list-secrets.txt ]]; then
  CAN_SECRETS=$(cat ./can-list-secrets.txt | tr -d '[:space:]')
else
  CAN_SECRETS=""
fi
assert_eq "deployer cannot list secrets" "no" "$CAN_SECRETS"

# Cleanup
kubectl delete namespace sandbox --ignore-not-found --wait=false 2>/dev/null || true
rm -f ./can-list-deployments.txt ./can-list-secrets.txt

print_results
