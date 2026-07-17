# backstage-idp

The developer portal of the Internal Developer Platform demo: Backstage with a
**golden path** — one click from "I need a service" to a running, observable
deployment.

Part of a multi-repo platform (how a real platform team structures it):

| Repo | Role |
|---|---|
| **backstage-idp** (this) | The portal: catalog, TechDocs, scaffolder + the golden-path template |
| [idp-gitops](../idp-gitops) | Local kind cluster bootstrap, ArgoCD, monitoring stack, service discovery |
| [terraform-modules](../terraform-modules) | Reusable infrastructure modules (local + cloud) |
| [platform-docs](../platform-docs) | Architecture, user journey, decision records |

## The user journey (the demo)

```
developer signs in
  └─ picks "Create a Service" from the catalog
       └─ fills 4 fields, clicks Create
            ├─ GitHub repo generated (app + Dockerfile + k8s manifests + docs)
            ├─ GitHub Actions builds & pushes the image to GHCR
            ├─ ArgoCD auto-discovers the repo (topic: idp-service) and syncs
            └─ Grafana dashboard for the service appears automatically
```

No tickets. No copy-pasted boilerplate. ~3 minutes to a monitored deployment.

## Run it

Prerequisites: Node 20+, Yarn, Docker, a GitHub account with a PAT
(`repo` + `workflow` scopes), and the cluster from
[idp-gitops](../idp-gitops) running.

```bash
export GITHUB_TOKEN=<your PAT>
# optional, for live workload health in the portal:
export KUBERNETES_CLUSTER_URL=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
export KUBERNETES_SA_TOKEN=<see idp-gitops/scripts/portal-credentials.sh>

yarn install
yarn start          # portal on http://localhost:3000
```

Sign in as **Guest**, open **Create**, run the golden path.

## What's in the golden-path template

`templates/create-service/` renders a production-*shaped* (deliberately tiny)
service: an HTTP app with `/healthz` and Prometheus `/metrics`, a multi-stage
Dockerfile, CI that pushes to GHCR, Kubernetes manifests with probes and
resource limits, a ServiceMonitor, a Grafana dashboard as a labeled ConfigMap
(hot-loaded by the sidecar), TechDocs, and catalog registration. The repo is
tagged `idp-service`, which is how the gitops ApplicationSet finds it —
creating a service requires **zero** manual ArgoCD or Grafana wiring.
