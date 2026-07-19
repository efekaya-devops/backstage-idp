# assets

Screenshots of the platform actually running. They live in this repo because
it's public — the docs that use them are in `platform-docs` and link them by
raw URL.

| file | what it shows |
|---|---|
| `backstage-create.png` | all ten templates in the portal — one golden path, nine infra requests |
| `backstage-catalog.png` | scaffolded services registered in the catalog |
| `backstage-resources.png` | requested infrastructure on the catalog as Resources, owned by the team that asked |
| `argocd-apps.png` | every application synced and healthy, including a team's claims |
| `argocd-tree.png` | the resource tree argocd built for a service it discovered by itself |
| `argocd-crossplane.png` | crossplane claims composed into managed resources |
| `grafana-dashboard.png` | the dashboard nobody created, with real traffic in it |
| `alert-firing.png` | `ServiceDown` firing for real, annotation rendered with the service's own name |

Real runs, not mockups. To link one from anywhere:

```
https://raw.githubusercontent.com/efekaya-devops/backstage-idp/main/assets/<file>
```
