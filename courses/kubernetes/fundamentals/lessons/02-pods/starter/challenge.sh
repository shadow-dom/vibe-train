#!/usr/bin/env bash
# challenge.sh — Running Pods
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Applying pod manifest..."
# TODO 1: Apply the pod.yaml manifest in this directory


echo "⏳ Waiting for pod to be ready..."
# TODO 2: Wait for hello-pod to be Ready (timeout 60s)


echo "📡 Curling the pod..."
# TODO 3: Exec into the pod and hit localhost:5678
#   Write the response body to ./response.txt
#   Hint: the image has wget but not curl


echo "✅ Done!"
