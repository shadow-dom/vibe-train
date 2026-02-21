# Lesson 1: Your First Cluster

## Objectives

- Understand what K3d is and how it runs Kubernetes inside Docker
- Create and inspect a Kubernetes cluster
- Use `kubectl` to explore cluster resources

## Concepts

Kubernetes is a container orchestration platform. In production it runs across many machines, but for learning we use **K3d** — a tool that runs a full K3s (lightweight Kubernetes) cluster inside Docker containers on a single machine.

A Kubernetes cluster has two kinds of components:

- **Control plane (server)** — runs the API server, scheduler, and controller manager
- **Worker nodes (agents)** — run your actual workloads

Every interaction with Kubernetes goes through the **API server**, and the main CLI for that is `kubectl`.

```bash
# See what nodes exist
kubectl get nodes

# Get detailed info about a node
kubectl describe node <node-name>

# Check what's running in all namespaces
kubectl get pods --all-namespaces
```

## Challenge

Your task is to write a shell script (`starter/challenge.sh`) that:

1. Verifies the cluster is running by checking that `kubectl cluster-info` succeeds
2. Counts the total number of nodes and writes the count to `./node-count.txt`
3. Gets the Kubernetes server version (just the `gitVersion` string) and writes it to `./server-version.txt`

## Validate Your Work

```bash
make test-lesson N=1
```

Expected: all 3 tests pass — cluster reachable, node count correct, version captured.

## Hints

<details>
<summary>Hint 1: Counting nodes</summary>

`kubectl get nodes --no-headers` gives you one line per node. Pipe to `wc -l`.

</details>

<details>
<summary>Hint 2: Getting the server version</summary>

`kubectl version -o json` returns JSON. Use `jq` to extract `.serverVersion.gitVersion`.

</details>

## Key Takeaways

- K3d lets you run a real Kubernetes cluster inside Docker — no VMs needed
- `kubectl` is your primary interface to the cluster
- Every cluster has nodes, and you can inspect them with `get` and `describe`
