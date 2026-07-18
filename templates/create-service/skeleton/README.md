# ${{ values.name }}

${{ values.description }}

| | |
|---|---|
| **CI/CD** | GitHub Actions builds + pushes `ghcr.io/<owner>/<repo>` on every push to `main` |
| **Deploy** | ArgoCD auto-discovers this repo (it has a `k8s/` folder) and syncs it |
| **Observability** | `/metrics` scraped via ServiceMonitor; dashboard auto-appears in Grafana |
| **Docs** | `docs/` renders in the portal via TechDocs |
