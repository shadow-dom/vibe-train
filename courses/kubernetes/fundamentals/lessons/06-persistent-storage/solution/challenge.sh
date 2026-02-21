#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Applying PVC..."
kubectl apply -f "$SCRIPT_DIR/pvc.yaml"

echo "✍️  Creating writer pod..."
cat <<'YAML' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: writer
spec:
  restartPolicy: Never
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: notes-pvc
  containers:
    - name: writer
      image: busybox
      command: ["sh", "-c", "echo 'Hello Persistent World' > /data/note.txt"]
      volumeMounts:
        - name: data
          mountPath: /data
YAML

echo "⏳ Waiting for writer to finish..."
kubectl wait pod/writer --for=jsonpath='{.status.phase}'=Succeeded --timeout=60s
kubectl delete pod writer --wait=true

echo "📖 Creating reader pod..."
cat <<'YAML' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: reader
spec:
  restartPolicy: Never
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: notes-pvc
  containers:
    - name: reader
      image: busybox
      command: ["sleep", "3600"]
      volumeMounts:
        - name: data
          mountPath: /data
YAML

kubectl wait pod/reader --for=condition=Ready --timeout=60s
kubectl exec reader -- cat /data/note.txt > ./note-content.txt

echo "✅ Done!"
