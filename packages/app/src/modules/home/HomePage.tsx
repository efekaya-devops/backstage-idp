import { Content, Header, Page } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Grid } from '@material-ui/core';
import { Iceberg } from '../nav/Iceberg';
import { QuickActions } from './components/QuickActions';
import { DashboardSection } from './components/DashboardSection';
import { FavoritesWidget } from './components/widgets/FavoritesWidget';
import { TemplatesWidget } from './components/widgets/TemplatesWidget';

const SUBTITLE =
  'Self-service platform: create services and cloud resources from templates, run them as applications, find everything in one catalog.';

// The widget rows. Each entry is a self-contained data widget; adding another
// is one line here, which is the whole point of the modular layout.
const workspaceWidgets = [TemplatesWidget, FavoritesWidget];

/**
 * The landing page at `/`. Purely compositional: the action sections and the
 * live widget rows each own their own data and layout, so adding a future
 * widget is one more entry in the arrays above — nothing else here changes.
 */
export function HomePage() {
  const title =
    useApi(configApiRef).getOptionalString('app.title') ?? 'Platform';
  return (
    <Page themeId="home">
      <Header
        pageTitleOverride={title}
        title={
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}
          >
            <Iceberg height={44} />
            {title}
          </span>
        }
        subtitle={SUBTITLE}
      />
      <Content>
        <Grid container spacing={4}>
          <QuickActions />

          <DashboardSection title="Your workspace">
            {workspaceWidgets.map(Widget => (
              <Grid item xs={12} md={6} key={Widget.name}>
                <Widget />
              </Grid>
            ))}
          </DashboardSection>

        </Grid>
      </Content>
    </Page>
  );
}
