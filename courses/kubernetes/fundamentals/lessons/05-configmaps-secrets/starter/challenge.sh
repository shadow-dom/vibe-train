#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Applying ConfigMap, Secret, and Pod..."
# TODO 1: Apply configmap.yaml, secret.yaml, and pod.yaml


echo "⏳ Waiting for pod..."
# TODO 2: Wait for config-pod to be Ready


echo "📡 Reading environment variables..."
# TODO 3: Use kubectl exec to read APP_GREETING → ./greeting.txt
# TODO 4: Use kubectl exec to read API_KEY → ./apikey.txt


echo "✅ Done!"
