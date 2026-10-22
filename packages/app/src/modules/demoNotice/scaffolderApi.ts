import {
  ApiBlueprint,
  createFrontendModule,
  configApiRef,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import { ScaffolderClient, scaffolderApiRef } from '@backstage/plugin-scaffolder';

export const CREATE_BLOCKED_EVENT = 'demo-notice:create-blocked';
const MESSAGE =
  'Read-only demo: nothing was created. Templates can be filled in and reviewed here, but running them is switched off on this public demo.';

class DemoScaffolderClient extends ScaffolderClient {
  // ponytail: dryRun passes through (creates nothing; editor is hidden in the demo)
  async scaffold(
    ...args: Parameters<ScaffolderClient['scaffold']>
  ): ReturnType<ScaffolderClient['scaffold']> {
    window.dispatchEvent(
      new CustomEvent(CREATE_BLOCKED_EVENT, {
        detail: { template: args[0].templateRef, values: args[0].values },
      }),
    );
    throw new Error(MESSAGE);
  }
}

// replaces the scaffolder plugin's own api:scaffolder extension
const scaffolderApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: scaffolderApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        scmIntegrationsApi: scmIntegrationsApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, ...deps }) =>
        configApi.getOptionalBoolean('app.readOnlyDemo')
          ? new DemoScaffolderClient(deps)
          : new ScaffolderClient(deps),
    }),
});

export const demoScaffolderModule = createFrontendModule({
  pluginId: 'scaffolder',
  extensions: [scaffolderApi],
});
