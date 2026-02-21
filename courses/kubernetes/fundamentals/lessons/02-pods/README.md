# Lesson 2: Running Pods

## Objectives

- Understand what a Pod is and why it's the smallest deployable unit
- Write a Pod manifest in YAML
- Apply manifests and check Pod status with `kubectl`

## Concepts

A **Pod** is one or more containers that share networking and storage. In practice, most Pods run a single container.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  containers:
    - name: my-app
      image: nginx:1.27
      ports:
        - containerPort: 80
```

Key commands:

```bash
kubectl apply -f pod.yaml        # Create or update
kubectl get pods                  # List pods
kubectl describe pod my-app       # Detailed info
kubectl logs my-app               # Container logs
kubectl delete pod my-app         # Remove
```

## Challenge

Create a file `starter/pod.yaml` that defines a Pod with these requirements:

1. **Name:** `hello-pod`
2. **Label:** `app: hello`
3. **Container name:** `hello`
4. **Image:** `hashicorp/http-echo` with args `["-text=Hello from Vibe Train!"]`
5. **Container port:** `5678`

Then write `starter/challenge.sh` that:
1. Applies the Pod manifest
2. Waits for it to become Ready
3. Uses `kubectl exec` to curl `localhost:5678` inside the pod and writes the response to `./response.txt`

## Validate Your Work

```bash
make test-lesson N=2
```

## Hints

<details>
<summary>Hint 1: http-echo image</summary>

`hashicorp/http-echo` is a tiny HTTP server that returns whatever text you pass via the `-text` argument. It listens on port 5678 by default.

</details>

<details>
<summary>Hint 2: Waiting for a pod</summary>

```bash
kubectl wait pod/hello-pod --for=condition=Ready --timeout=60s
```

</details>

<details>
<summary>Hint 3: exec + curl</summary>

The http-echo image doesn't include curl. Use `wget -qO-` instead:
```bash
kubectl exec hello-pod -- wget -qO- http://localhost:5678
```

</details>

## Key Takeaways

- Pods are defined in YAML manifests and created with `kubectl apply`
- Labels are key-value pairs that let you organize and select resources
- `kubectl exec` lets you run commands inside a running container
