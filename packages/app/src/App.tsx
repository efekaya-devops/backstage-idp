import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
// shows the Kubernetes tab on entity pages, pulls from whatever cluster
// is configured under kubernetes: in app-config.yaml
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
