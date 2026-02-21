#!/usr/bin/env bash
# challenge.sh — Your First Cluster
#
# Complete the TODOs below to pass the tests.
set -euo pipefail

echo "🔍 Checking cluster connectivity..."

# TODO 1: Verify the cluster is reachable.
#   Run `kubectl cluster-info` and ensure it succeeds.
#   (Hint: just call the command — set -e will catch failures)


echo "📊 Counting nodes..."

# TODO 2: Count the total number of nodes in the cluster.
#   Write ONLY the number (e.g. "2") to ./node-count.txt
#   Hint: kubectl get nodes --no-headers | wc -l


echo "🏷️  Getting server version..."

# TODO 3: Get the Kubernetes server gitVersion string.
#   Write it to ./server-version.txt  (e.g. "v1.31.4+k3s1")
#   Hint: kubectl version -o json | jq -r '.serverVersion.gitVersion'


echo "✅ Done!"
