import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { ScaffolderPage, rootRouteRef } from '@backstage/plugin-scaffolder';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { Entity } from '@backstage/catalog-model';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

// hides manage/edit templates from the create page browse list (they're
// meant to be opened via a pre-filled link, not picked from the list).
// using the old ScaffolderPage here since the new one doesn't support
// filtering templates yet - page:scaffolder is turned off in app-config
// so this is the only /create route
const HIDDEN_TAGS = ['manage', 'edit'];

// spec.type values used by the templates in templates/
const GROUPS = [
  ['service', 'Golden paths'],
  ['openchoreo', 'Applications on OpenChoreo'],
  ['blueprint', 'Blueprints'],
  ['building-block', 'Building blocks'],
  ['infrastructure', 'Infrastructure'],
].map(([type, title]) => ({
  title,
  filter: (e: Entity) => e.spec?.type === type,
}));

// light-theme red is darker than palette.error.main so the heading clears 4.5:1 on the tinted paper
const useBannerStyles = makeStyles(theme => {
  const dark = theme.palette.type === 'dark';
  const red = dark ? theme.palette.error.main : '#B71C1C';
  return {
    root: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: theme.spacing(1.5),
      margin: theme.spacing(3, 3, 3, 3),
      padding: theme.spacing(2),
      borderLeft: `4px solid ${red}`,
      backgroundColor: dark ? 'rgba(244,67,54,0.08)' : 'rgba(244,67,54,0.06)',
    },
    icon: {
      color: red,
      marginTop: 2,
      flexShrink: 0,
    },
    title: {
      color: red,
      fontWeight: 600,
    },
  };
});

// The hosted demo is read-only: so pressing Create shows a notice instead of running the template. That's deliberate - the walkthrough recordings show the path actually completing.
// Only renders where it's true: app.readOnlyDemo is set in
// app-config.production.yaml, so a local `yarn start` - where the scaffolder
// really does work - shows nothing. Announcing a 403 that isn't going to happen
// would be worse than saying nothing at all.
const ReadOnlyNotice = () => {
  const classes = useBannerStyles();
  const readOnly = useApi(configApiRef).getOptionalBoolean('app.readOnlyDemo');
  if (!readOnly) return null;
  return (
    <Paper className={classes.root} elevation={0}>
      <ErrorOutlineIcon className={classes.icon} />
      <div>
        <Typography variant="subtitle2" className={classes.title}>
          Read-only demo — Create is switched off, and that is expected
        </Typography>
        <Typography variant="body2" color="textPrimary">
          The hosted demo is read-only: pressing Create shows a notice instead
          of running the template. That's deliberate - the walkthrough
          recordings show the path actually completing.
        </Typography>
      </div>
    </Paper>
  );
};

const scaffolderPage = PageBlueprint.make({
  name: 'create',
  params: {
    path: '/create',
    noHeader: true,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: async () => (
      <>
        <ReadOnlyNotice />
        <ScaffolderPage
          groups={GROUPS}
          headerOptions={{
            title: 'Create',
            subtitle:
              'Start from a template: a service, a cloud resource or a full application',
          }}
          templateFilter={entity =>
            !(entity.metadata.tags ?? []).some(t => HIDDEN_TAGS.includes(t))
          }
        />
      </>
    ),
  },
});

export const scaffolderPageModule = createFrontendModule({
  pluginId: 'app',
  extensions: [scaffolderPage],
});
