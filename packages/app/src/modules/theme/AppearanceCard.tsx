import { appThemeApiRef, useApi } from '@backstage/frontend-plugin-api';
import { InfoCard, useSidebarPinState } from '@backstage/core-components';
import {
  UserSettingsLanguageToggle,
  UserSettingsPinToggle,
} from '@backstage/plugin-user-settings';
import {
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import useObservable from 'react-use/esm/useObservable';
import { DEFAULT_THEME_ID, themeFamilies } from './themes';

type Mode = 'light' | 'dark';

const familyOf = (id?: string) =>
  themeFamilies.find(f => f.light === id || f.dark === id) ?? themeFamilies[0];

export const AppearanceCard = () => {
  const appThemeApi = useApi(appThemeApiRef);
  const { isMobile } = useSidebarPinState();
  const activeId =
    useObservable(appThemeApi.activeThemeId$(), appThemeApi.getActiveThemeId()) ??
    DEFAULT_THEME_ID;
  const family = familyOf(activeId);
  const mode: Mode = activeId === family.dark ? 'dark' : 'light';

  const select = (f: typeof family, m: Mode) => appThemeApi.setActiveThemeId(f[m]);

  return (
    <InfoCard title="Appearance" variant="gridItem">
      <List dense>
        <ListItem>
          <ListItemText primary="Theme" secondary="Colour palette of the portal" />
          <ListItemSecondaryAction>
            <ButtonGroup size="small" aria-label="Theme">
              {themeFamilies.map(f => (
                <Button
                  key={f.id}
                  color={f.id === family.id ? 'primary' : 'default'}
                  variant={f.id === family.id ? 'contained' : 'outlined'}
                  onClick={() => select(f, mode)}
                >
                  {f.title}
                </Button>
              ))}
            </ButtonGroup>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primary="Mode" secondary="Light or dark version of the theme" />
          <ListItemSecondaryAction>
            <ButtonGroup size="small" aria-label="Mode">
              {(['light', 'dark'] as const).map(m => (
                <Button
                  key={m}
                  color={m === mode ? 'primary' : 'default'}
                  variant={m === mode ? 'contained' : 'outlined'}
                  onClick={() => select(family, m)}
                >
                  {m === 'light' ? 'Light' : 'Dark'}
                </Button>
              ))}
            </ButtonGroup>
          </ListItemSecondaryAction>
        </ListItem>
        <UserSettingsLanguageToggle />
        {!isMobile && <UserSettingsPinToggle />}
      </List>
    </InfoCard>
  );
};
