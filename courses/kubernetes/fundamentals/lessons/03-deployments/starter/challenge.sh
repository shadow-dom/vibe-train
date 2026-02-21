#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Applying deployment..."
# TODO 1: Apply the deployment.yaml manifest


echo "⏳ Waiting for rollout..."
# TODO 2: Wait for the deployment rollout to complete


echo "📈 Scaling to 4 replicas..."
# TODO 3: Scale echo-deploy to 4 replicas


echo "⏳ Waiting for scale-up..."
# TODO 4: Wait for the rollout again


echo "📊 Recording ready count..."
# TODO 5: Get the number of ready replicas and write to ./ready-count.txt


echo "✅ Done!"
