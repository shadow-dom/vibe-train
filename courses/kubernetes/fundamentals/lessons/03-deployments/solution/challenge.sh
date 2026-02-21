#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Applying deployment..."
kubectl apply -f "$SCRIPT_DIR/deployment.yaml"

echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/echo-deploy --timeout=90s

echo "📈 Scaling to 4 replicas..."
kubectl scale deployment echo-deploy --replicas=4

echo "⏳ Waiting for scale-up..."
kubectl rollout status deployment/echo-deploy --timeout=90s

echo "📊 Recording ready count..."
kubectl get deployment echo-deploy -o jsonpath='{.status.readyReplicas}' > ./ready-count.txt

echo "✅ Done!"
