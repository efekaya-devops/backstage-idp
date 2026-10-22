import { Link, Progress } from '@backstage/core-components';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/frontend-plugin-api';
import { Typography, makeStyles } from '@material-ui/core';
import { Fragment } from 'react';
import useAsync from 'react-use/esm/useAsync';
import {
  Dash,
  ENVS,
  EnvFacts,
  MANAGED,
  NsChip,
  PromoteButton,
  Strip,
  ann,
  entityLink,
  label,
  parseJson,
  useEnvDrawer,
} from './shared';

const useView = makeStyles(theme => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: theme.spacing(2),
  },
  deploy: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    [theme.breakpoints.down('md')]: { flexWrap: 'wrap' },
    gap: theme.spacing(1),
  },
  card: {
    flex: '1 1 250px',
    minWidth: 0,
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    background: theme.palette.background.paper,
  },
  promote: { display: 'flex', alignItems: 'center' },
  facts: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: theme.spacing(1, 2),
    margin: 0,
    '& dt': { color: theme.palette.text.secondary, fontSize: 13 },
    '& dd': { margin: 0, fontSize: 14, overflowWrap: 'anywhere' },
  },
  row: {
    padding: theme.spacing(1.5, 0),
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
}));

const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const v = useView();
  return (
    <section className={v.card}>
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
      {children}
    </section>
  );
};

const Facts = ({ rows }: { rows: [string, React.ReactNode][] }) => {
  const v = useView();
  return (
    <dl className={v.facts}>
      {rows.map(([k, x]) => (
        <div key={k} style={{ display: 'contents' }}>
          <dt>{k}</dt>
          <dd>{x ?? <Dash />}</dd>
        </div>
      ))}
    </dl>
  );
};

const useNamespace = (name?: string) => {
  const catalog = useApi(catalogApiRef);
  return useAsync(
    async () =>
      name
        ? (
            await catalog.getEntities({
              filter: { kind: 'Resource', [MANAGED]: 'true' },
            })
          ).items.find(
            r =>
              r.spec?.type === 'openchoreo-namespace' &&
              ann(r, 'namespace') === name,
          )
        : undefined,
    [catalog, name],
  );
};

// System page: project overview.
export const ProjectCard = () => {
  const { entity } = useEntity();
  const v = useView();
  const catalog = useApi(catalogApiRef);
  const [open, drawer] = useEnvDrawer();
  const nsName = ann(entity, 'namespace');
  const ns = useNamespace(nsName).value;
  const { value: comps, loading } = useAsync(
    async () =>
      (
        await catalog.getEntities({
          filter: {
            kind: 'Component',
            [MANAGED]: 'true',
            'spec.system': entity.metadata.name,
          },
        })
      ).items,
    [catalog, entity.metadata.name],
  );
  return (
    <Panel title="OpenChoreo project">
      <Facts
        rows={[
          ['Description', entity.metadata.description],
          [
            'Namespace',
            nsName && (ns ? <NsChip ns={ns} /> : <code>{nsName}</code>),
          ],
          ['Pipeline', ann(entity, 'pipeline')],
        ]}
      />
      <Typography variant="subtitle1" style={{ margin: '16px 0 4px' }}>
        Components
      </Typography>
      {loading && <Progress />}
      {comps?.length === 0 && <Dash />}
      {comps
        ?.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name))
        .map(c => (
          <div key={c.metadata.name} className={v.row}>
            <Typography style={{ fontWeight: 600 }}>
              <Link to={`${entityLink(c)}/deploy`}>
                {c.metadata.title ?? c.metadata.name}
              </Link>
            </Typography>
            <Strip c={c} onSelect={open} />
          </div>
        ))}
      {drawer}
    </Panel>
  );
};

// Component page: one card per environment, promote buttons between them.
export const DeployTab = () => {
  const { entity } = useEntity();
  const v = useView();
  return (
    <div className={v.deploy}>
      {ENVS.map((env, i) => (
        <Fragment key={env}>
          {i > 0 && (
            <div className={v.promote}>
              <PromoteButton next={env} />
            </div>
          )}
          <section className={v.card} aria-label={`${env} environment`}>
            <Typography variant="overline" color="textSecondary">
              Environment
            </Typography>
            <Typography variant="h6" component="h2">
              {label(env)}
            </Typography>
            <EnvFacts c={entity} env={env} />
          </section>
        </Fragment>
      ))}
    </div>
  );
};

type Guardrails = {
  environments?: { name: string; dataPlane?: string }[];
  quota?: Record<string, { cpu?: string; memory?: string; pods?: string }>;
  network?: string[];
  secretStore?: { provider?: string; name?: string };
  podSecurity?: string;
  rbac?: { owners?: string; readers?: string[] };
};

export const GuardrailsTab = () => {
  const { entity } = useEntity();
  const v = useView();
  const catalog = useApi(catalogApiRef);
  const g = parseJson<Guardrails>(ann(entity, 'guardrails')) ?? {};
  const nsName = ann(entity, 'namespace');
  const { value: projects } = useAsync(
    async () =>
      (
        await catalog.getEntities({
          filter: { kind: 'System', [MANAGED]: 'true' },
        })
      ).items.filter(s => nsName && ann(s, 'namespace') === nsName),
    [catalog, nsName],
  );
  const quota = Object.entries(g.quota ?? {});
  const envs = g.environments ?? [];
  return (
    <div className={v.grid}>
      <Panel title="Projects">
        {projects?.length ? (
          projects.map(s => (
            <div key={s.metadata.name} className={v.row}>
              <Link to={entityLink(s)}>
                {s.metadata.title ?? s.metadata.name}
              </Link>
              <Typography variant="body2" color="textSecondary">
                {s.metadata.description}
              </Typography>
            </div>
          ))
        ) : (
          <Dash />
        )}
      </Panel>
      <Panel title="Environments and data planes">
        {envs.length ? (
          <Facts rows={envs.map(e => [label(e.name), e.dataPlane])} />
        ) : (
          <Dash />
        )}
      </Panel>
      <Panel title="Quota per environment">
        {quota.length ? (
          <Facts
            rows={quota.map(([e, q]) => [
              label(e),
              `${q.cpu ?? '—'} CPU, ${q.memory ?? '—'} memory, ${
                q.pods ?? '—'
              } pods`,
            ])}
          />
        ) : (
          <Dash />
        )}
      </Panel>
      <Panel title="Network policies">
        {g.network?.length ? (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {g.network.map(n => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : (
          <Dash />
        )}
      </Panel>
      <Panel title="Secrets and pod security">
        <Facts
          rows={[
            ['Secret store', g.secretStore?.provider],
            ['Store name', g.secretStore?.name],
            ['Pod Security', g.podSecurity && label(g.podSecurity)],
          ]}
        />
      </Panel>
      <Panel title="Access (RBAC)">
        <Facts
          rows={[
            ['Owners', g.rbac?.owners],
            ['Readers', g.rbac?.readers?.join(', ')],
          ]}
        />
      </Panel>
    </div>
  );
};
