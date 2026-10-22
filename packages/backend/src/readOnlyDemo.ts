import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';

// app.readOnlyDemo is set in app-config.production.yaml only; unset = allow all.
export const readOnlyDemoPolicy = createBackendModule({
  pluginId: 'permission',
  moduleId: 'read-only-demo-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint, config: coreServices.rootConfig },
      async init({ policy, config }) {
        const readOnly = config.getOptionalBoolean('app.readOnlyDemo');
        policy.setPolicy({
          async handle(request) {
            const { name, attributes } = request.permission;
            const writes = ['create', 'update', 'delete'];
            // task.create stays allowed: the UI hides template "Choose" buttons without it.
            // The frontend never submits in demo mode, and a forced task still can't run
            // any step because scaffolder.action.execute (no action attribute) is denied.
            const scaffolderWrite =
              name.startsWith('scaffolder.') && attributes.action !== 'read';
            if (
              readOnly &&
              name !== 'scaffolder.task.create' &&
              (writes.includes(attributes.action as string) || scaffolderWrite)
            ) {
              return { result: AuthorizeResult.DENY };
            }
            return { result: AuthorizeResult.ALLOW };
          },
        });
      },
    });
  },
});

// No edit-url annotation = Backstage renders the Edit actions disabled.
export const stripEditUrl = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'strip-edit-url',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ catalog, config }) {
        if (!config.getOptionalBoolean('app.readOnlyDemo')) return;
        catalog.addProcessor({
          getProcessorName: () => 'StripEditUrl',
          async postProcessEntity(entity) {
            delete entity.metadata.annotations?.['backstage.io/edit-url'];
            return entity;
          },
        });
      },
    });
  },
});
