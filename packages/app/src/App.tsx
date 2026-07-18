import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
// shows the Kubernetes tab on entity pages, pulls from whatever cluster
// is configured under kubernetes: in app-config.yaml
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import { navModule } from './modules/nav';
import { signInModule } from './modules/signIn';
import { scaffolderPageModule } from './modules/scaffolderPage';

export default createApp({
  features: [
    catalogPlugin,
    kubernetesPlugin,
    notificationsPlugin,
    scaffolderPlugin,
    navModule,
    signInModule,
    scaffolderPageModule,
  ],
});
