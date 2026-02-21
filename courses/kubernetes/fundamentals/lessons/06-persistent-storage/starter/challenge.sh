#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Applying PVC..."
# TODO 1: Apply pvc.yaml


echo "✍️  Creating writer pod..."
# TODO 2: Create a pod named "writer" that mounts notes-pvc at /data
#   and writes "Hello Persistent World" to /data/note.txt
#   The pod should exit after writing.


echo "⏳ Waiting for writer to finish..."
# TODO 3: Wait for the writer pod to complete, then delete it


echo "📖 Creating reader pod..."
# TODO 4: Create a pod named "reader" that mounts notes-pvc at /data
#   and reads /data/note.txt. Save output to ./note-content.txt


echo "✅ Done!"
