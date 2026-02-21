# Lesson 4: Exposing Services

## Objectives

- Understand why Pods need Services for stable networking
- Create a ClusterIP Service to give a Deployment a stable internal address
- Create a NodePort Service for external access
- Test connectivity from inside the cluster

## Concepts

Pods are ephemeral — they get new IPs each time they restart. A **Service** gives a set of Pods a stable DNS name and IP by selecting them via labels.

**ClusterIP** (default): reachable only from inside the cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: echo-svc
spec:
  selector:
    app: echo
  ports:
    - port: 80
      targetPort: 5678
```

**NodePort**: exposes the service on a static port on every node, making it reachable from outside the cluster.

```yaml
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: 5678
      nodePort: 30080
```

Inside a cluster, services are resolvable by name: `curl http://echo-svc`.

## Challenge

1. Create `starter/deployment.yaml` — same `echo-deploy` from Lesson 3 (2 replicas, image `hashicorp/http-echo`, args `["-text=service-works"]`, port 5678, label `app: echo`).

2. Create `starter/service.yaml` — a **ClusterIP** Service named `echo-svc` that:
   - Selects pods with `app: echo`
   - Maps port `80` → targetPort `5678`

3. Write `starter/challenge.sh` that:
   - Applies both manifests
   - Waits for the deployment
   - Runs a temporary pod to curl the service DNS name and writes the response to `./response.txt`

## Validate Your Work

```bash
make test-lesson N=4
```

## Hints

<details>
<summary>Hint 1: Curling from inside the cluster</summary>

You can run a temporary pod:
```bash
kubectl run curl-test --image=busybox --restart=Never --rm -i -- wget -qO- http://echo-svc
```

</details>

<details>
<summary>Hint 2: DNS resolution</summary>

Services in the same namespace are reachable at `<service-name>`. Cross-namespace: `<service-name>.<namespace>.svc.cluster.local`.

</details>

## Key Takeaways

- Services provide stable DNS names and load-balance across matching Pods
- ClusterIP is for internal traffic; NodePort opens a port on every node
- Use label selectors to connect Services to Pods
