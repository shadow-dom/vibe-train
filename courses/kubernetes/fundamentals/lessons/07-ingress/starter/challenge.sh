#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔧 Installing NGINX Ingress Controller..."
# TODO 1: kubectl apply the NGINX ingress controller manifest
# TODO 2: Wait for the controller pod to be ready


echo "🚀 Deploying app..."
# TODO 3: Apply app.yaml and wait for the deployment


echo "🌐 Creating Ingress..."
# TODO 4: Apply ingress.yaml


echo "📡 Testing ingress routing..."
# TODO 5: curl localhost:8080 with Host: echo.local header
#   Save response to ./ingress-response.txt


echo "✅ Done!"
