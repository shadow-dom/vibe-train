#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Applying ConfigMap, Secret, and Pod..."
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"
kubectl apply -f "$SCRIPT_DIR/secret.yaml"
kubectl apply -f "$SCRIPT_DIR/pod.yaml"

echo "⏳ Waiting for pod..."
kubectl wait pod/config-pod --for=condition=Ready --timeout=60s

echo "📡 Reading environment variables..."
kubectl exec config-pod -- sh -c 'echo $APP_GREETING' > ./greeting.txt
kubectl exec config-pod -- sh -c 'echo $API_KEY' > ./apikey.txt

echo "✅ Done!"
