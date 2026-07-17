# ${{ values.name }}

${{ values.description }}

| | |
|---|---|
| **CI/CD** | GitHub Actions builds + pushes `ghcr.io/<owner>/${{ values.name }}` on every push to `main` |
| **Deploy** | ArgoCD auto-discovers this repo (topic `idp-service`) and syncs `k8s/` |
| **Observability** | `/metrics` scraped via ServiceMonitor; dashboard auto-appears in Grafana |
| **Docs** | `docs/` renders in the portal via TechDocs |
