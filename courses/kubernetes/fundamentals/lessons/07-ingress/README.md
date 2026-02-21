# Lesson 7: Ingress & Routing

## Objectives

- Understand why Ingress exists (HTTP routing at the edge)
- Install an Ingress controller (NGINX)
- Create an Ingress resource that routes traffic to a Service by hostname

## Concepts

While NodePort exposes a service on a raw port, **Ingress** gives you HTTP-level routing: hostname matching, path-based routing, TLS termination, and more.

An Ingress resource is just a routing rule. It requires an **Ingress Controller** (a reverse proxy) to actually implement it.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  rules:
    - host: app.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-svc
                port:
                  number: 80
```

We'll install the NGINX Ingress Controller via `kubectl apply`.

## Challenge

1. Write `starter/challenge.sh` that:
   - Installs the NGINX Ingress Controller (a single `kubectl apply` of the official manifest)
   - Deploys a Deployment + Service from the provided `starter/app.yaml`
   - Creates an Ingress resource (in `starter/ingress.yaml`) routing `echo.local` → `echo-svc` port 80
   - Waits for everything to be ready
   - Curls the ingress endpoint with a `Host: echo.local` header and writes the response to `./ingress-response.txt`

2. Complete `starter/ingress.yaml` with the routing rule.

## Validate Your Work

```bash
make test-lesson N=7
```

## Hints

<details>
<summary>Hint 1: Installing NGINX Ingress for K3d</summary>

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml
```

Wait for it:
```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

</details>

<details>
<summary>Hint 2: Curling through K3d's load balancer</summary>

K3d maps port 8080 on localhost to port 80 on the cluster's load balancer. So:
```bash
curl -s -H "Host: echo.local" http://localhost:8080
```

</details>

## Key Takeaways

- Ingress provides HTTP routing; an Ingress Controller does the actual proxying
- You can route by hostname, path, or both
- K3d's port mapping lets you reach the cluster's port 80 via localhost:8080
