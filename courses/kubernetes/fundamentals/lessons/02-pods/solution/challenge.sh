#!/usr/bin/env bash
# challenge.sh — Running Pods (Solution)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Applying pod manifest..."
kubectl apply -f "$SCRIPT_DIR/pod.yaml"

echo "⏳ Waiting for pod to be ready..."
kubectl wait pod/hello-pod --for=condition=Ready --timeout=60s

echo "📡 Curling the pod..."
kubectl exec hello-pod -- wget -qO- http://localhost:5678 > ./response.txt

echo "✅ Done!"
