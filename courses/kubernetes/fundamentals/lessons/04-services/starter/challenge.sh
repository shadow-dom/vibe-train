#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Applying manifests..."
# TODO 1: Apply deployment.yaml and service.yaml


echo "⏳ Waiting for deployment..."
# TODO 2: Wait for the deployment rollout


echo "📡 Testing service connectivity..."
# TODO 3: Use a temporary pod to hit http://echo-svc and save to ./response.txt
#   Hint: kubectl run curl-test --image=busybox --restart=Never --rm -i -- wget -qO- http://echo-svc


echo "✅ Done!"
