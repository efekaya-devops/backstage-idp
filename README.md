# backstage-idp

The portal for the IDP demo. Backstage + a golden path template - click
create, get a running service.

Part of a 4-repo setup:

| Repo | What |
|---|---|
| **backstage-idp** (here) | the portal itself |
| [idp-gitops](../idp-gitops) | kind cluster, argocd, monitoring |
| [terraform-modules](../terraform-modules) | infra modules, local + cloud |
| [platform-docs](../platform-docs) | architecture notes, journey writeup |

## what happens when you click create

```
sign in -> Create a Service -> fill in name/owner/repo -> click Create
  -> github repo gets created (app + dockerfile + k8s manifests + docs)
  -> actions builds + pushes the image
  -> argocd notices the repo (tagged idp-service) and syncs it
  -> grafana dashboard shows up on its own
```

Takes a few minutes end to end, most of it is waiting on the docker build.

## running it

Need: node 20+, yarn, docker, a github PAT (repo + workflow scopes), and
the cluster from idp-gitops up already.

```bash
export GITHUB_TOKEN=<your pat>
# optional - lets the portal show live pod health:
export KUBERNETES_CLUSTER_URL=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
export KUBERNETES_SA_TOKEN=<run idp-gitops/scripts/portal-credentials.sh>

yarn install
yarn start   # localhost:3000
```

sign in as guest, hit Create.

## the golden path template

`templates/create-service/` - small node app with /healthz and /metrics,
dockerfile, github actions ci, k8s manifests w/ probes and resource limits,
a servicemonitor, a grafana dashboard (just a labeled configmap), techdocs.
tagged `idp-service` so idp-gitops picks it up on its own - nothing to wire
up by hand.
