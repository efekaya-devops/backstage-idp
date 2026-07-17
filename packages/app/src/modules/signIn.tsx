import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';

// Guest sign-in keeps the demo friction-free: one click and you're in the
// developer's seat. Swapping in a real IdP (GitHub OAuth, Entra ID, Okta) is a
// provider-config change, not an architecture change — the portal, catalog and
// scaffolder are identity-agnostic.
const guestSignInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => (props: any) => (
      <SignInPage {...props} providers={['guest']} />
    ),
  },
});

export const signInModule = createFrontendModule({
  pluginId: 'app',
  extensions: [guestSignInPage],
});
