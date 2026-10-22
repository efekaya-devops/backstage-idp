import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import type { Entity } from '@backstage/catalog-model';
import {
  PageBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import AppsIcon from '@material-ui/icons/Apps';
import { ApplicationsPage } from './ApplicationsPage';

// The sidebar entry is hardcoded in nav/Sidebar.tsx.
const applicationsPage = PageBlueprint.make({
  name: 'applications',
  params: {
    path: '/applications',
    title: 'Applications',
    noHeader: true,
    icon: <AppsIcon />,
    loader: async () => <ApplicationsPage />,
  },
});

const managed = (kind: string, type?: string) => (e: Entity) =>
  e.kind === kind &&
  e.metadata.labels?.['openchoreo.io/managed'] === 'true' &&
  (!type || e.spec?.type === type);

const projectCard = EntityCardBlueprint.make({
  name: 'openchoreo-project',
  params: {
    type: 'content',
    filter: managed('System'),
    loader: async () => {
      const { ProjectCard } = await import('./EntityViews');
      return <ProjectCard />;
    },
  },
});

const deployTab = EntityContentBlueprint.make({
  name: 'openchoreo-deploy',
  params: {
    path: '/deploy',
    title: 'Deploy',
    filter: managed('Component'),
    loader: async () => {
      const { DeployTab } = await import('./EntityViews');
      return <DeployTab />;
    },
  },
});

const guardrailsTab = EntityContentBlueprint.make({
  name: 'openchoreo-guardrails',
  params: {
    path: '/guardrails',
    title: 'Guardrails',
    filter: managed('Resource', 'openchoreo-namespace'),
    loader: async () => {
      const { GuardrailsTab } = await import('./EntityViews');
      return <GuardrailsTab />;
    },
  },
});

export const applicationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [applicationsPage, projectCard, deployTab, guardrailsTab],
});
