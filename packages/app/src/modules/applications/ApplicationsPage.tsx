import {
  Content,
  Header,
  Link,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import type { Entity } from '@backstage/catalog-model';
import { Button, Typography, makeStyles } from '@material-ui/core';
import {
  MANAGED,
  NsChip,
  Strip,
  ann,
  deployLink,
  entityLink,
  label,
  useEnvDrawer,
} from './shared';
import AppsIcon from '@material-ui/icons/Apps';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import useAsync from 'react-use/esm/useAsync';

const useStyles = makeStyles(theme => {
  const dark = theme.palette.type === 'dark';
  const indigo = dark ? '#8fa0ea' : '#5568c4';
  const chipText = dark ? '#c3ccff' : '#34408f';
  const line = theme.palette.divider;
  return {
    summary: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(3),
    },
    stat: {
      padding: theme.spacing(1, 2),
      border: `1px solid ${line}`,
      borderRadius: 8,
      background: theme.palette.background.paper,
      minWidth: 110,
    },
    sample: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      marginBottom: theme.spacing(2),
      fontSize: 13,
      color: theme.palette.text.primary,
    },
    sampleTag: {
      padding: '1px 10px',
      border: `1px solid ${dark ? '#c3ccff' : '#34408f'}`,
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      color: dark ? '#c3ccff' : '#34408f',
      whiteSpace: 'nowrap',
    },
    statNum: { fontSize: 22, fontWeight: 700, lineHeight: 1.2 },
    nsStrip: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
    chip: {
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      lineHeight: '20px',
      color: chipText,
      background: `${indigo}26`,
      whiteSpace: 'nowrap',
    },
    nsChip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      border: `1px solid ${line}`,
      borderRadius: 8,
      background: theme.palette.background.paper,
      fontSize: 13,
      fontFamily: 'monospace',
    },
    project: {
      border: `1px solid ${line}`,
      borderTop: `3px solid ${indigo}`,
      borderRadius: 12,
      background: theme.palette.background.paper,
      marginBottom: theme.spacing(3),
      overflow: 'hidden',
    },
    projectHead: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      padding: theme.spacing(2, 3),
      borderBottom: `1px solid ${line}`,
    },
    projectName: { fontSize: 18, fontWeight: 700 },
    grow: { flex: 1, minWidth: 200 },
    row: {
      display: 'grid',
      gridTemplateColumns: 'minmax(180px, 1fr) minmax(0, 2.4fr)',
      alignItems: 'center',
      gap: theme.spacing(2),
      padding: theme.spacing(2, 3),
      '&:not(:last-child)': { borderBottom: `1px solid ${line}` },
      [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
    },
    compName: { fontWeight: 600, fontSize: 15 },
    pipeline: {
      display: 'flex',
      alignItems: 'stretch',
      gap: theme.spacing(0.5),
    },
    env: {
      flex: 1,
      minWidth: 0,
      padding: theme.spacing(1, 1.5),
      border: `1px solid ${line}`,
      borderRadius: 8,
      background: dark ? 'rgba(255,255,255,0.03)' : '#fafbfc',
    },
    envName: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: theme.palette.text.secondary,
    },
    envStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      marginTop: 2,
    },
    dot: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 },
    arrow: {
      alignSelf: 'center',
      fontSize: 16,
      color: theme.palette.text.secondary,
    },
    empty: {
      textAlign: 'center',
      padding: theme.spacing(8, 2),
      border: `1px dashed ${line}`,
      borderRadius: 12,
      color: theme.palette.text.secondary,
    },
  };
});

export const ApplicationsPage = () => {
  const classes = useStyles();
  const [openEnv, drawer] = useEnvDrawer();
  const catalog = useApi(catalogApiRef);
  const config = useApi(configApiRef);
  const consoleUrl = config.getOptionalString('openchoreo.consoleUrl');
  const sampleData = config.getOptionalBoolean('app.readOnlyDemo');
  const { value, loading, error } = useAsync(async () => {
    const [systems, components, resources] = await Promise.all(
      ['System', 'Component', 'Resource'].map(kind =>
        catalog.getEntities({ filter: { kind, [MANAGED]: 'true' } }),
      ),
    );
    const namespaces = resources.items.filter(
      r => r.spec?.type === 'openchoreo-namespace',
    );
    const projects = new Map<string, Entity[]>();
    for (const c of components.items) {
      const p = ann(c, 'project') ?? (c.spec?.system as string) ?? 'default';
      projects.set(p, [...(projects.get(p) ?? []), c]);
    }
    return { systems: systems.items, namespaces, projects };
  }, [catalog]);

  const projects = [...(value?.projects.entries() ?? [])].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const nComponents = projects.reduce((n, [, cs]) => n + cs.length, 0);

  return (
    <Page themeId="home">
      <Header
        title="Applications"
        subtitle="Projects and components, with what is deployed to each environment"
      >
        {consoleUrl && (
          <Button
            variant="outlined"
            color="primary"
            href={consoleUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open OpenChoreo console
          </Button>
        )}
      </Header>
      <Content>
        {sampleData && (
          <div className={classes.sample}>
            <span className={classes.sampleTag}>Sample data</span>
            Illustrates how OpenChoreo applications appear in the portal
          </div>
        )}
        {loading && <Progress />}
        {error && <ResponseErrorPanel error={error} />}
        {value && projects.length === 0 && (
          <div className={classes.empty}>
            <AppsIcon fontSize="large" />
            <Typography variant="h6">No applications yet</Typography>
            <Typography variant="body2">
              Components labelled <code>openchoreo.io/managed: "true"</code>{' '}
              appear here, grouped by project. Start one from{' '}
              <Link to="/create">Create</Link>.
            </Typography>
          </div>
        )}
        {value && projects.length > 0 && (
          <>
            <div className={classes.summary}>
              <div className={classes.stat}>
                <div className={classes.statNum}>{projects.length}</div>
                <Typography variant="caption" color="textSecondary">
                  Projects
                </Typography>
              </div>
              <div className={classes.stat}>
                <div className={classes.statNum}>{nComponents}</div>
                <Typography variant="caption" color="textSecondary">
                  Components
                </Typography>
              </div>
              <div className={classes.stat}>
                <div className={classes.statNum}>{value.namespaces.length}</div>
                <Typography variant="caption" color="textSecondary">
                  Namespaces
                </Typography>
              </div>
              <div className={classes.nsStrip}>
                {value.namespaces.map(n => (
                  <NsChip key={n.metadata.name} ns={n} />
                ))}
              </div>
            </div>
            {projects.map(([name, comps]) => {
              const sys = value.systems.find(s => s.metadata.name === name);
              const ns = ann(comps[0], 'namespace');
              const nsEntity = value.namespaces.find(
                n => ann(n, 'namespace') === ns,
              );
              return (
                <section className={classes.project} key={name}>
                  <div className={classes.projectHead}>
                    <div className={classes.grow}>
                      <div className={classes.projectName}>
                        {sys ? (
                          <Link to={entityLink(sys)}>
                            {sys.metadata.title ?? name}
                            <ChevronRightIcon
                              fontSize="small"
                              style={{ verticalAlign: 'middle' }}
                            />
                          </Link>
                        ) : (
                          name
                        )}
                      </div>
                      {sys?.metadata.description && (
                        <Typography variant="body2" color="textSecondary">
                          {sys.metadata.description}
                        </Typography>
                      )}
                    </div>
                    {nsEntity && <NsChip ns={nsEntity} />}
                    <Typography variant="body2" color="textSecondary">
                      {comps.length} component{comps.length === 1 ? '' : 's'}
                    </Typography>
                  </div>
                  {comps
                    .sort((a, b) =>
                      a.metadata.name.localeCompare(b.metadata.name),
                    )
                    .map(c => (
                      <div className={classes.row} key={c.metadata.name}>
                        <div>
                          <div className={classes.compName}>
                            <Link to={deployLink(c)}>
                              {c.metadata.title ?? c.metadata.name}
                              <ChevronRightIcon
                                fontSize="small"
                                style={{ verticalAlign: 'middle' }}
                              />
                            </Link>
                          </div>
                          <span className={classes.chip}>
                            {label(
                              (ann(c, 'component-type') ?? 'component').replace(
                                /-/g,
                                ' ',
                              ),
                            )}
                          </span>
                        </div>
                        <Strip c={c} onSelect={openEnv} />
                      </div>
                    ))}
                </section>
              );
            })}
          </>
        )}
      </Content>
      {drawer}
    </Page>
  );
};
