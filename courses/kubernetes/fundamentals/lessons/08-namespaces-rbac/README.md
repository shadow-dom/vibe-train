# Lesson 8: Namespaces & Access Control

## Objectives

- Use Namespaces to isolate workloads
- Create a ServiceAccount
- Use Roles and RoleBindings to grant scoped permissions
- Verify that RBAC restricts access as expected

## Concepts

**Namespaces** partition a cluster into virtual sub-clusters. Teams or environments (dev, staging, prod) each get their own namespace.

```bash
kubectl create namespace team-alpha
kubectl get pods -n team-alpha
```

**RBAC** (Role-Based Access Control) lets you define who can do what:

- **ServiceAccount** — an identity for pods or automation
- **Role** — a set of permissions within a namespace
- **RoleBinding** — grants a Role to a ServiceAccount (or user)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: team-alpha
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
```

## Challenge

1. Write `starter/challenge.sh` that:
   - Creates a namespace `sandbox`
   - Creates a ServiceAccount `deployer` in that namespace
   - Creates a Role `deploy-manager` in `sandbox` that allows `get`, `list`, `create`, `update`, `delete` on `deployments` (apiGroup `apps`)
   - Creates a RoleBinding `deployer-binding` binding the Role to the ServiceAccount
   - Deploys a simple nginx Deployment (2 replicas) into the `sandbox` namespace
   - Verifies the `deployer` ServiceAccount can list deployments (using `kubectl auth can-i`)
   - Writes "yes" or "no" to `./can-list-deployments.txt`
   - Verifies the `deployer` ServiceAccount CANNOT list secrets
   - Writes "yes" or "no" to `./can-list-secrets.txt`

You can create the resources via YAML files or inline `kubectl create` commands — your choice.

## Validate Your Work

```bash
make test-lesson N=8
```

## Hints

<details>
<summary>Hint 1: kubectl auth can-i</summary>

```bash
kubectl auth can-i list deployments.apps \
  --as=system:serviceaccount:sandbox:deployer \
  -n sandbox
```
This prints "yes" or "no".

</details>

<details>
<summary>Hint 2: Creating resources imperatively</summary>

```bash
kubectl create namespace sandbox
kubectl create serviceaccount deployer -n sandbox
kubectl create role deploy-manager -n sandbox \
  --verb=get,list,create,update,delete \
  --resource=deployments.apps
kubectl create rolebinding deployer-binding -n sandbox \
  --role=deploy-manager \
  --serviceaccount=sandbox:deployer
```

</details>

## Key Takeaways

- Namespaces provide logical isolation — same cluster, separate scopes
- RBAC follows the principle of least privilege: grant only what's needed
- `kubectl auth can-i` is invaluable for testing permissions
- Roles are namespace-scoped; ClusterRoles are cluster-wide
