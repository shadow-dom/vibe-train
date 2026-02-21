#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Applying manifests..."
kubectl apply -f "$SCRIPT_DIR/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/service.yaml"

echo "⏳ Waiting for deployment..."
kubectl rollout status deployment/echo-deploy --timeout=90s

echo "📡 Testing service connectivity..."
kubectl run curl-test --image=busybox --restart=Never --rm -i -- wget -qO- http://echo-svc > ./response.txt 2>/dev/null

echo "✅ Done!"
