import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';
import { ScaffolderPage, rootRouteRef } from '@backstage/plugin-scaffolder';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';

// Hide the per-kind "Manage" templates (and any "edit") from the Create page browse
// list, while keeping the catalog Edit action -> Manage form working (the wizard +
// pre-fill via ?formData still resolve). The new-frontend-system scaffolder sub-page
// exposes no template filter and always shows an "Other" group, so we render the
// legacy ScaffolderPage — which has a first-class `templateFilter` and bundles the
// full list + wizard + tasks router — as the /create page. The default
// `page:scaffolder` is disabled in app-config so this owns the route.
const HIDDEN_TAGS = ['manage', 'edit'];

const scaffolderPage = PageBlueprint.make({
  name: 'create',
  params: {
    path: '/create',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: async () => (
      <ScaffolderPage
        templateFilter={entity =>
          !(entity.metadata.tags ?? []).some(t => HIDDEN_TAGS.includes(t))
        }
      />
    ),
  },
});

export const scaffolderPageModule = createFrontendModule({
  pluginId: 'app',
  extensions: [scaffolderPage],
});
