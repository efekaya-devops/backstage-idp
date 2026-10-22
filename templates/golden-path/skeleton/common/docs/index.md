# ${{ values.name }}

${{ values.description }}

Scaffolded via the platform's golden path ({% if values.flavour == 'react-frontend' %}React frontend{% else %}Node.js API{% endif %}).
This repo composes the platform's building blocks: CI/CD, GitOps deploy, monitoring and docs.

## delivery

| Step | What happens |
|---|---|
| Push to `main` | The reusable CI workflow runs tests, a Trivy scan (fails on CRITICAL,HIGH), generates an SBOM and builds a multi-arch image tagged with the commit sha |
| Deploy PR | CI opens `deploy: ${{ values.destination.repo }} <sha>`, bumping `images[0].newTag` in `k8s/kustomization.yaml` |
| Merge the PR | ArgoCD syncs `k8s/` and rolls the new image out. No rebuild, `k8s/` is ignored by CI |
| Rollback | Revert the deploy PR. The PR history shows what ran when |

The org setting **Allow GitHub Actions to create and approve pull requests** must be on, or the deploy PR cannot be opened.

## runtime hardening

The pod runs as non-root with the default seccomp profile. The container has a read-only root
filesystem, no privilege escalation and all capabilities dropped. Readiness and liveness probes call `/healthz`.
{%- if values.flavour == 'react-frontend' %}

## why a frontend has metrics

Static files cannot report on themselves. A second container, `nginx-prometheus-exporter`, reads
nginx's request counters over localhost and republishes them for Prometheus. The ServiceMonitor
renames `nginx_http_requests_total` to `app_requests_total`, so the app gets the same
`ServiceDown` alert and dashboard shape as any backend service. Metrics live on the sidecar's
port 9113, not the app's.
{%- endif %}

## local development

```bash
npm install
{%- if values.flavour == 'react-frontend' %}
npm run dev      # http://localhost:8080
npm run build && npm run preview
{%- else %}
npm start        # http://localhost:8080
npm test
{%- endif %}
```
