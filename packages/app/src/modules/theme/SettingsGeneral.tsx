import { Content } from '@backstage/core-components';
import {
  UserSettingsIdentityCard,
  UserSettingsProfileCard,
} from '@backstage/plugin-user-settings';
import { Grid } from '@material-ui/core';
import { AppearanceCard } from './AppearanceCard';

// Same layout as the stock General tab, with our two-step theme picker in place of the
// flat list of every installed theme.
export const SettingsGeneral = () => (
  <Content>
    <Grid container direction="row" spacing={3}>
      <Grid item xs={12} md={6}>
        <UserSettingsProfileCard />
      </Grid>
      <Grid item xs={12} md={6}>
        <AppearanceCard />
      </Grid>
      <Grid item xs={12} md={6}>
        <UserSettingsIdentityCard />
      </Grid>
    </Grid>
  </Content>
);
