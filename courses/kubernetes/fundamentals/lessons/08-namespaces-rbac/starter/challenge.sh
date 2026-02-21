#!/usr/bin/env bash
set -euo pipefail

echo "🏗️  Creating namespace..."
# TODO 1: Create namespace "sandbox"


echo "👤 Creating ServiceAccount..."
# TODO 2: Create ServiceAccount "deployer" in namespace "sandbox"


echo "🔐 Creating Role..."
# TODO 3: Create Role "deploy-manager" in namespace "sandbox"
#   Allows: get, list, create, update, delete on deployments (apiGroup: apps)


echo "🔗 Creating RoleBinding..."
# TODO 4: Bind deploy-manager to deployer via RoleBinding "deployer-binding"


echo "🚀 Deploying nginx..."
# TODO 5: Create a Deployment named "web" with 2 replicas of nginx:1.27 in namespace "sandbox"
#   Wait for rollout


echo "🔍 Checking permissions..."
# TODO 6: Check if deployer can list deployments.apps in sandbox → ./can-list-deployments.txt
# TODO 7: Check if deployer can list secrets in sandbox → ./can-list-secrets.txt


echo "✅ Done!"
