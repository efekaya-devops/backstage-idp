# ${{ values.name }}

${{ values.description }}

| | |
|---|---|
| **Stack** | {% if values.flavour == 'react-frontend' %}Vite + React, built to static files, served by nginx{% else %}Node.js API{% endif %} |
| **CI** | The platform's CI/CD building block: tests, Trivy scan (CRITICAL,HIGH gate), SBOM, multi-arch image pushed to `ghcr.io/${{ values.destination.owner }}/${{ values.destination.repo }}` |
| **Deploy** | GitOps: every build opens a `deploy <sha>` PR; merging it rolls out, reverting it rolls back |
| **Observability** | ServiceMonitor + Grafana dashboard, shipped in `k8s/` |
| **Docs** | `docs/` renders in the portal via TechDocs |

## how a change reaches the cluster

1. Merge to `main`. CI builds and pushes the image tagged with the commit sha.
2. CI opens a PR named `deploy: ${{ values.destination.repo }} <sha>` that sets `images[0].newTag`
   in `k8s/kustomization.yaml`.
3. Merge that PR. ArgoCD (it auto-discovers repos with a `k8s/` folder) syncs the new tag.
4. To roll back, revert the deploy PR. The git history is the record of what runs.

Merging a deploy PR does not rebuild: the workflow ignores changes under `k8s/`, `docs/` and `*.md`.

The deploy PR is opened with the workflow's own token. For that, the org (or repo) setting
**Allow GitHub Actions to create and approve pull requests** must be on
(Settings > Actions > General > Workflow permissions).

## seeing it run

The service is a ClusterIP, it has no public address, which is deliberate.
Forward a port to reach it:

```bash
kubectl port-forward -n default svc/${{ values.name }} 8080:80
```

| | |
|---|---|
| http://localhost:8080/ | the app |
| http://localhost:8080/healthz | what the liveness and readiness probes call |
{%- if values.flavour == 'react-frontend' %}

Metrics come from the exporter sidecar, on its own port:

```bash
kubectl port-forward -n default svc/${{ values.name }} 9113:9113
curl localhost:9113/metrics
```

The sidecar reads nginx's request counters over localhost. The ServiceMonitor renames
`nginx_http_requests_total` to `app_requests_total`, the metric the platform's alert rules are
written against, so the app inherits `ServiceDown` without special-casing frontends.
{%- else %}
| http://localhost:8080/metrics | what Prometheus scrapes |
{%- endif %}

Generate some traffic, then open the `${{ values.name }}` dashboard in Grafana (http://localhost:3001):

```bash
for i in $(seq 1 300); do curl -s -o /dev/null localhost:8080/; done
```

## running it locally

```bash
npm install
{%- if values.flavour == 'react-frontend' %}
npm run dev        # http://localhost:8080, hot reload
npm run build && npm run preview   # what actually ships
{%- else %}
npm start          # http://localhost:8080
npm test           # node --test
{%- endif %}
```

## where things are

```
{%- if values.flavour == 'react-frontend' %}
src/               the React app, replace this with yours
nginx.conf         SPA routing, /healthz, and the stub_status the sidecar reads
{%- else %}
server.js          the app
test/              node:test checks run by CI
{%- endif %}
Dockerfile         the image CI builds
k8s/               kustomization (image tag), deployment, service, servicemonitor, dashboard
.github/workflows/ci.yaml   calls the platform's reusable CI workflow
docs/              techdocs sources
catalog-info.yaml  what registers this in the catalog
```
