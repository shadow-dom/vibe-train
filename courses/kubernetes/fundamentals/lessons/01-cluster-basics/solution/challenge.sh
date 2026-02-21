#!/usr/bin/env bash
# challenge.sh — Your First Cluster (Solution)
set -euo pipefail

echo "🔍 Checking cluster connectivity..."
kubectl cluster-info

echo "📊 Counting nodes..."
kubectl get nodes --no-headers | wc -l | tr -d ' ' > ./node-count.txt

echo "🏷️  Getting server version..."
kubectl version -o json | jq -r '.serverVersion.gitVersion' > ./server-version.txt

echo "✅ Done!"
