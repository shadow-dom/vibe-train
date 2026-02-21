# Lesson 6: Persistent Storage

## Objectives

- Understand PersistentVolumes (PV) and PersistentVolumeClaims (PVC)
- Mount persistent storage into a Pod
- Verify data survives pod deletion

## Concepts

Containers are ephemeral — when a Pod is deleted, its filesystem is gone. **PersistentVolumeClaims** let Pods request durable storage.

K3s ships with a **local-path provisioner** that automatically creates PersistentVolumes when you create a PVC. This means you don't need to manually create PVs.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 128Mi
```

Mount it in a Pod:
```yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-data
containers:
  - volumeMounts:
      - name: data
        mountPath: /data
```

## Challenge

1. Create `starter/pvc.yaml` — a PVC named `notes-pvc`, requesting `64Mi` with `ReadWriteOnce` access.

2. Write `starter/challenge.sh` that:
   - Applies the PVC
   - Creates a "writer" pod that mounts the PVC at `/data` and writes a message to `/data/note.txt`
   - Deletes the writer pod
   - Creates a "reader" pod that mounts the same PVC and reads `/data/note.txt`
   - Saves the content to `./note-content.txt`

This proves the data survived across pod deletions.

## Validate Your Work

```bash
make test-lesson N=6
```

## Hints

<details>
<summary>Hint 1: Writing to the volume</summary>

Use `kubectl run` with an `--overrides` flag, or create a small Pod YAML. The simplest approach:
```bash
kubectl run writer --image=busybox --restart=Never \
  --overrides='{"spec":{"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"notes-pvc"}}],"containers":[{"name":"writer","image":"busybox","command":["sh","-c","echo Hello Persistent World > /data/note.txt"],"volumeMounts":[{"name":"data","mountPath":"/data"}]}]}}'
```

</details>

<details>
<summary>Hint 2: Wait for completion</summary>

For pods with one-shot commands, wait for them to complete:
```bash
kubectl wait pod/writer --for=condition=Ready --timeout=30s || true
kubectl wait pod/writer --for=jsonpath='{.status.phase}'=Succeeded --timeout=30s
```

</details>

## Key Takeaways

- PVCs request storage; K3s's local-path provisioner fulfills them automatically
- Volume data persists across pod restarts and deletions
- `ReadWriteOnce` means only one node can mount the volume for writing at a time
