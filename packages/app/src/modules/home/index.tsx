import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { HomePage } from './HomePage';

// Owns the root route. Without this the app has no page at `/` and lands on a
// 404; registering it makes the dashboard the portal's entry point.
const homePage = PageBlueprint.make({
  name: 'home',
  params: {
    path: '/',
    noHeader: true,
    loader: async () => <HomePage />,
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [homePage],
});
