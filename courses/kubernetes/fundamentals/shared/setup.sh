#!/usr/bin/env bash
# shared/setup.sh — Bootstraps the K3d environment for all lessons.
# Called by the test runner before each lesson's validate.sh.

set -euo pipefail

CLUSTER_NAME="${K3D_CLUSTER_NAME:-vibe-train}"
K3S_IMAGE="${K3S_IMAGE:-rancher/k3s:v1.31.4-k3s1}"
TIMEOUT="${CLUSTER_TIMEOUT:-120}"

# ─── Install k3d if missing ────────────────────────────────────────────────
if ! command -v k3d &>/dev/null; then
  echo "📦  Installing k3d..."
  curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
fi

# ─── Install kubectl if missing ────────────────────────────────────────────
if ! command -v kubectl &>/dev/null; then
  echo "📦  Installing kubectl..."
  curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  chmod +x kubectl && sudo mv kubectl /usr/local/bin/
fi

# ─── Cluster lifecycle helpers ──────────────────────────────────────────────
cluster_exists() {
  k3d cluster list -o json 2>/dev/null | grep -q "\"name\":\"${CLUSTER_NAME}\""
}

wait_for_cluster() {
  echo "⏳  Waiting for cluster nodes to be Ready (up to ${TIMEOUT}s)..."
  local deadline=$((SECONDS + TIMEOUT))
  until kubectl get nodes 2>/dev/null | grep -q " Ready"; do
    if (( SECONDS >= deadline )); then
      echo "❌  Timed out waiting for cluster."
      exit 1
    fi
    sleep 2
  done
  echo "✅  Cluster is ready."
}

# ─── Create or reuse cluster ───────────────────────────────────────────────
if cluster_exists; then
  echo "♻️   Reusing existing k3d cluster '${CLUSTER_NAME}'."
else
  echo "🚀  Creating k3d cluster '${CLUSTER_NAME}'..."
  k3d cluster create "${CLUSTER_NAME}" \
    --image "${K3S_IMAGE}" \
    --servers 1 \
    --agents 1 \
    --no-lb \
    --k3s-arg "--disable=traefik@server:0" \
    --wait
fi

# Merge kubeconfig into default location so kubectl just works for all processes
mkdir -p ~/.kube
k3d kubeconfig merge "${CLUSTER_NAME}" --kubeconfig-switch-context --kubeconfig-merge-default 2>/dev/null

wait_for_cluster

echo "🎉  K3d cluster '${CLUSTER_NAME}' is up. kubectl is configured."
echo "    Nodes:"
kubectl get nodes -o wide
