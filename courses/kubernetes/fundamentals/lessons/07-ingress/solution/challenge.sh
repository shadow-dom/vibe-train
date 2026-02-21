#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔧 Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml

echo "⏳ Waiting for ingress controller..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo "🚀 Deploying app..."
kubectl apply -f "$SCRIPT_DIR/app.yaml"
kubectl rollout status deployment/echo-deploy --timeout=90s

echo "🌐 Creating Ingress..."
kubectl apply -f "$SCRIPT_DIR/ingress.yaml"
sleep 5

echo "📡 Testing ingress routing..."
# Retry a few times since ingress may take a moment
for i in $(seq 1 10); do
  RESPONSE=$(curl -s -H "Host: echo.local" http://localhost:8080 2>/dev/null || true)
  if echo "$RESPONSE" | grep -q "ingress-works"; then
    echo "$RESPONSE" > ./ingress-response.txt
    break
  fi
  sleep 3
done

echo "✅ Done!"
