import {
  UnifiedThemeProvider,
  createUnifiedTheme,
  genPageTheme,
  pageTheme,
  palettes,
} from '@backstage/theme';
import { createElement, type ReactNode } from 'react';

type ThemeSpec = {
  id: string;
  title: string;
  variant: 'light' | 'dark';
  background: string;
  paper: string;
  primary: string;
  link: string;
  onPrimary: string;
  border: string;
  header: [string, string];
  nav: { background: string; indicator: string; color: string; hover: string };
};

// BUI (newer components) reads --bui-* tokens; see theme.css for the matching values.
export const themeSpecs: ThemeSpec[] = [
  {
    id: 'navy-frame',
    title: 'Navy Frame',
    variant: 'light',
    background: '#F3F6FB',
    paper: '#FFFFFF',
    primary: '#3B5BDB',
    link: '#3B5BDB',
    onPrimary: '#FFFFFF',
    border: '#D8E0EE',
    header: ['#16294F', '#27407A'],
    nav: {
      background: '#0F1C38',
      indicator: '#7FA2FF',
      color: '#B6C4E4',
      hover: '#1B2D55',
    },
  },
  {
    id: 'abyssal-blue',
    title: 'Abyssal Blue',
    variant: 'dark',
    background: '#0B1324',
    paper: '#111D36',
    primary: '#4F8CFF',
    link: '#7FA8FF',
    onPrimary: '#08101F',
    border: '#1F3052',
    header: ['#0F1C38', '#1B3160'],
    nav: {
      background: '#08101F',
      indicator: '#4F8CFF',
      color: '#9DB0D3',
      hover: '#14234A',
    },
  },
];

// The picker in Settings exposes two choices: family, then light/dark.
export const themeFamilies = [
  { id: 'navy', title: 'Navy', light: 'navy-frame', dark: 'abyssal-blue' },
];
export const DEFAULT_THEME_ID = 'navy-frame';

// Header artwork: a waterline with one iceberg, light tip above it and a darker submerged
// body below. Banners scale the image with `cover`, so that one is drawn wide. Template
// cards paint it at intrinsic size, tiled, so theirs is a fixed oversized tile.
const BERG_TIP =
  "fill='#EAF2FF' fill-opacity='.3' stroke='#EAF2FF' stroke-opacity='.6'";
const BERG_BODY =
  "fill='#04091A' fill-opacity='.38' stroke='#CFE0FF' stroke-opacity='.22'";
const waterline = (id: string, x1: number, x2: number, y: number, to: number) =>
  `<defs><linearGradient id='${id}' x1='0' x2='1'><stop offset='0' stop-color='#D6E6FF' stop-opacity='.28'/>` +
  `<stop offset='1' stop-color='#D6E6FF' stop-opacity='${to}'/></linearGradient></defs>` +
  `<line x1='${x1}' y1='${y}' x2='${x2}' y2='${y}' stroke='url(#${id})' stroke-width='2.5'/>`;
const svgUrl = (svg: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const bannerShape = svgUrl(
  [
    `<svg xmlns='http://www.w3.org/2000/svg' width='2400' height='300' viewBox='0 0 2400 300'>`,
    waterline('w', 0, 2400, 150, 0.6),
    `<g stroke-width='2' stroke-linejoin='round'>`,
    `<path d='M1890 150 1985 62 2035 108 2085 86 2165 150Z' ${BERG_TIP}/>`,
    `<path d='M1890 150H2165L2110 232 2025 296 1950 226Z' ${BERG_BODY}/>`,
    `</g></svg>`,
  ].join(''),
);

const cardShape = svgUrl(
  [
    `<svg xmlns='http://www.w3.org/2000/svg' width='1368' height='400' viewBox='0 0 1368 400'>`,
    waterline('w', 120, 1368, 64, 0.55),
    `<g stroke-width='1.5' stroke-linejoin='round'>`,
    `<path d='M215 64 236 40 247 51 257 44 283 64Z' ${BERG_TIP}/>`,
    `<path d='M215 64H283L270 88 250 128 228 86Z' ${BERG_BODY}/>`,
    `</g></svg>`,
  ].join(''),
);

const buildTheme = (s: ThemeSpec) => {
  const base = palettes[s.variant];
  const banner = genPageTheme({ colors: s.header, shape: bannerShape });
  const card = genPageTheme({ colors: s.header, shape: cardShape });
  return createUnifiedTheme({
    palette: {
      ...base,
      background: { default: s.background, paper: s.paper },
      primary: { main: s.primary, contrastText: s.onPrimary },
      link: s.link,
      linkHover: s.link,
      border: s.border,
      navigation: {
        ...base.navigation,
        background: s.nav.background,
        indicator: s.nav.indicator,
        color: s.nav.color,
        navItem: { hoverBackground: s.nav.hover },
        submenu: { background: s.nav.hover },
      },
    },
    defaultPageTheme: 'home',
    pageTheme: {
      ...Object.fromEntries(Object.keys(pageTheme).map(k => [k, banner])),
      // template types in this repo; their cards use the fixed-size artwork
      'building-block': card,
      blueprint: card,
      infrastructure: card,
      openchoreo: card,
    },
  });
};

export const buildAppTheme = (s: ThemeSpec) => {
  const theme = buildTheme(s);
  return {
    id: s.id,
    title: s.title,
    variant: s.variant,
    Provider: ({ children }: { children: ReactNode }) =>
      createElement(UnifiedThemeProvider, { theme, themeName: s.id, children }),
  };
};
