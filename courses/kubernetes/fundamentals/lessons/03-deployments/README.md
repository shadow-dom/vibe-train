# Lesson 3: Deployments & Scaling

## Objectives

- Understand Deployments and why they're preferred over bare Pods
- Scale a Deployment up and down
- Observe rolling updates

## Concepts

A **Deployment** manages a set of identical Pods (a **ReplicaSet**). It gives you:

- Declarative updates (change the image → Kubernetes rolls out new pods)
- Self-healing (if a pod dies, it's automatically replaced)
- Scaling (`kubectl scale`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.27
          ports:
            - containerPort: 80
```

```bash
kubectl scale deployment web --replicas=5
kubectl rollout status deployment/web
```

## Challenge

1. Create `starter/deployment.yaml` — a Deployment named `echo-deploy` with:
   - **Replicas:** `2`
   - **Label selector:** `app: echo`
   - **Container:** name `echo`, image `hashicorp/http-echo`, args `["-text=echo-v1"]`, port `5678`

2. Write `starter/challenge.sh` that:
   - Applies the deployment
   - Waits for rollout to complete
   - Scales it to **4 replicas** and waits again
   - Writes the number of Ready replicas to `./ready-count.txt`

## Validate Your Work

```bash
make test-lesson N=3
```

## Hints

<details>
<summary>Hint 1: selector must match template labels</summary>

The `spec.selector.matchLabels` must be identical to `spec.template.metadata.labels`. If they don't match, the Deployment won't know which Pods belong to it.

</details>

<details>
<summary>Hint 2: Getting ready replica count</summary>

```bash
kubectl get deployment echo-deploy -o jsonpath='{.status.readyReplicas}'
```

</details>

## Key Takeaways

- Never run bare Pods in production — use Deployments
- `kubectl scale` changes the desired replica count; Kubernetes converges to it
- `kubectl rollout status` blocks until the rollout finishes
