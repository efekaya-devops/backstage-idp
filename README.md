# backstage-idp

The portal side of the platform. Three templates: one that creates a running
service, two that request infrastructure.

Companion repos:
[idp-gitops](https://github.com/efekaya-devops/idp-gitops) (cluster, argocd, monitoring) ·
[terraform-modules](https://github.com/efekaya-devops/terraform-modules) ·
[crossplane-modules](https://github.com/efekaya-devops/crossplane-modules) ·
[platform-docs](https://github.com/efekaya-devops/platform-docs)

## the templates

| Template | Produces | Who applies it |
|---|---|---|
| `create-service` | a **new github repo** — node app, dockerfile, CI, k8s manifests, servicemonitor, grafana dashboard, techdocs | argocd, on its own |
| `request-resource-group` | a **pull request** on idp-gitops adding a Crossplane claim | argocd, once merged |
| `request-bucket` | a **pull request** on idp-gitops adding terraform | nothing — CI validates only |

The difference is deliberate. A service is yours, so the portal just makes it.
Infrastructure costs money and belongs to someone else, so the portal opens a PR
and a human merges it. One portal, two very different blast radii — and the
portal never holds cloud credentials.

## what happens when you create a service

```
Create a Service -> github repo created (app + dockerfile + k8s/ + docs)
  -> actions builds the image, pushes it to ghcr
  -> argocd spots any org repo with a k8s/ folder and deploys it
  -> grafana dashboard appears on its own
```

Discovery is by **convention, not registration**: an ApplicationSet in
idp-gitops scans the org for repos containing a `k8s/` directory. Nothing tags
or registers the service anywhere — delete the folder and it un-deploys the
same way it appeared.

Most of the wall-clock time is the docker build.

## running it

Needs node 22, yarn, docker (techdocs builds run in a container), and the
cluster from idp-gitops already up.

```bash
cp .env.example .env    # then fill it in, see below
yarn install
yarn start              # localhost:3000, sign in as guest
```

### .env

```bash
# needs repo + workflow scope. a fine-grained PAT will NOT work for the golden
# path - it can't create repositories, you get "Resource not accessible by
# personal access token". use a classic/OAuth token.
GITHUB_TOKEN=

# lets the Kubernetes tab show live pod health
KUBERNETES_CLUSTER_URL=
KUBERNETES_SA_TOKEN=
```

The cluster values come from the read-only service account idp-gitops manages
in `cluster/backstage-rbac.yaml`:

```bash
idp-gitops/scripts/portal-credentials.sh
```

`.env` is gitignored and must stay that way — this repo is public.

## things that are easy to get wrong

- **the catalog is a real sqlite file** (`.data/`), not `:memory:`. With the
  in-memory default every registered service vanishes on restart, which looks
  exactly like the catalog being broken.
- **techdocs generates in docker** (`techdocs.generator.runIn: docker`). The
  local generator needs `mkdocs` on your PATH and dies with `spawn mkdocs
  ENOENT` otherwise.
- **plugins must be registered in `App.tsx`**, not merely installed. In the new
  frontend system a plugin that's only a dependency silently does nothing, and
  you find out through a runtime `NotImplementedError` naming its API. This
  applies transitively too: techdocs pages embed a search box, so without the
  search plugin registered the whole Docs tab fails.
- **`publish:github` protects the default branch by default** — 1 required
  approval with admin enforcement, which locks a solo owner out of the repo
  they just made. The golden path sets `requiredApprovingReviewCount: 0` and
  `protectEnforceAdmins: false`.
- **GHCR packages inherit the org's visibility setting.** If it's off, images
  publish private and pods land in `ImagePullBackOff`.

## layout

```
packages/app/src/modules/   nav, sign-in, home, scaffolder page customisations
templates/create-service/   the golden path
templates/request-*/        the infra request templates
app-config.yaml             catalog locations, kubernetes, techdocs
```
