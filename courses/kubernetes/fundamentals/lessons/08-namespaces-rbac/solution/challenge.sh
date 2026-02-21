#!/usr/bin/env bash
set -euo pipefail

echo "🏗️  Creating namespace..."
kubectl create namespace sandbox --dry-run=client -o yaml | kubectl apply -f -

echo "👤 Creating ServiceAccount..."
kubectl create serviceaccount deployer -n sandbox --dry-run=client -o yaml | kubectl apply -f -

echo "🔐 Creating Role..."
cat <<'YAML' | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: sandbox
  name: deploy-manager
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "create", "update", "delete"]
YAML

echo "🔗 Creating RoleBinding..."
cat <<'YAML' | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: sandbox
  name: deployer-binding
subjects:
  - kind: ServiceAccount
    name: deployer
    namespace: sandbox
roleRef:
  kind: Role
  name: deploy-manager
  apiGroup: rbac.authorization.k8s.io
YAML

echo "🚀 Deploying nginx..."
kubectl create deployment web --image=nginx:1.27 --replicas=2 -n sandbox --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout status deployment/web -n sandbox --timeout=90s

echo "🔍 Checking permissions..."
kubectl auth can-i list deployments.apps \
  --as=system:serviceaccount:sandbox:deployer \
  -n sandbox > ./can-list-deployments.txt 2>&1 || true

kubectl auth can-i list secrets \
  --as=system:serviceaccount:sandbox:deployer \
  -n sandbox > ./can-list-secrets.txt 2>&1 || true

echo "✅ Done!"
