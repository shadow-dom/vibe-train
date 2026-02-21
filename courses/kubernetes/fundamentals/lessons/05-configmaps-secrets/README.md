# Lesson 5: Configuration & Secrets

## Objectives

- Externalize configuration with ConfigMaps
- Store sensitive data with Secrets
- Mount both as environment variables and files in Pods

## Concepts

Hardcoding config in container images is fragile. Kubernetes provides two resources:

**ConfigMap** — stores non-sensitive key-value data:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_COLOR: "blue"
  APP_MODE: "production"
```

**Secret** — stores sensitive data (base64-encoded at rest):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:          # stringData auto-encodes to base64
  DB_PASSWORD: "s3cret"
```

You can inject these as **environment variables** or **volume mounts**:
```yaml
env:
  - name: APP_COLOR
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: APP_COLOR
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: app-secret
        key: DB_PASSWORD
```

## Challenge

1. Create `starter/configmap.yaml` — a ConfigMap named `app-config` with keys: `APP_GREETING=Welcome` and `APP_VERSION=1.0`

2. Create `starter/secret.yaml` — a Secret named `app-secret` with key: `API_KEY=vibe-train-42`  (use `stringData`)

3. Create `starter/pod.yaml` — a Pod named `config-pod` (image: `busybox`, command: `["sleep", "3600"]`) that loads all four values as environment variables.

4. Write `starter/challenge.sh` that applies everything and then uses `kubectl exec` to print `$APP_GREETING` and `$API_KEY` from inside the pod, saving them to `./greeting.txt` and `./apikey.txt`.

## Validate Your Work

```bash
make test-lesson N=5
```

## Hints

<details>
<summary>Hint 1: Loading all keys from a ConfigMap</summary>

Instead of listing each key, use `envFrom`:
```yaml
envFrom:
  - configMapRef:
      name: app-config
  - secretRef:
      name: app-secret
```

</details>

<details>
<summary>Hint 2: Exec to read an env var</summary>

```bash
kubectl exec config-pod -- sh -c 'echo $APP_GREETING'
```

</details>

## Key Takeaways

- ConfigMaps and Secrets decouple configuration from images
- Secrets are base64-encoded, not encrypted — use RBAC to restrict access
- `envFrom` is the easiest way to inject all keys at once
