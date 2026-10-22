import {
  SubPageBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { ThemeBlueprint } from '@backstage/plugin-app-react';
import { createElement } from 'react';
import { DEFAULT_THEME_ID, buildAppTheme, themeSpecs } from './themes';
import './theme.css';

// Light by default: without a stored choice Backstage follows the OS setting. Runs at
// import, before createApp reads the 'theme' key.
try {
  const stored = window.localStorage.getItem('theme');
  if (!stored) window.localStorage.setItem('theme', DEFAULT_THEME_ID);
} catch {
  // storage unavailable: Backstage falls back to the OS colour scheme
}

const themes = themeSpecs.map(s =>
  ThemeBlueprint.make({ name: s.id, params: { theme: buildAppTheme(s) } }),
);

// Replaces the stock General settings tab (same extension id) to swap in the two-step picker.
const generalSettings = SubPageBlueprint.make({
  name: 'general',
  params: {
    path: 'general',
    title: 'General',
    loader: () => import('./SettingsGeneral').then(m => createElement(m.SettingsGeneral)),
  },
});

export const themeModule = createFrontendModule({
  pluginId: 'app',
  extensions: themes,
});

export const settingsModule = createFrontendModule({
  pluginId: 'user-settings',
  extensions: [generalSettings],
});
