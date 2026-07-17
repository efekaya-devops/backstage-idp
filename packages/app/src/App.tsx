import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
// Kubernetes plugin (new frontend system): renders the "Kubernetes" tab on
// entity pages, showing the live Crossplane managed resources + their health
// for each catalogued resource. Reads from the cluster configured under the
// `kubernetes:` block in app-config. See docs/resource-visibility.md.
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import { navModule } from './modules/nav';
import { signInModule } from './modules/signIn';
import { scaffolderPageModule } from './modules/scaffolderPage';

export default createApp({
  features: [
    catalogPlugin,
    kubernetesPlugin,
    navModule,
    signInModule,
    scaffolderPageModule,
  ],
});
