import { Link } from '@backstage/core-components';
import type { Entity } from '@backstage/catalog-model';
import {
  Button,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CloseIcon from '@material-ui/icons/Close';
import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Contract: see examples/showcase.yaml.
export const MANAGED = 'metadata.labels.openchoreo.io/managed';
const A = 'openchoreo.io/';

export type Status = 'Ready' | 'Progressing' | 'Failed' | 'NotDeployed';
export type EnvInfo = {
  version?: string;
  status: Status;
  image?: string;
  replicas?: string;
  endpoint?: string | null;
  deployedAt?: string;
  deployedBy?: string;
  reason?: string;
  release?: string;
};

export const ENVS = ['development', 'staging', 'production'];
const DOT: Record<Status, string> = {
  Ready: '#10b981',
  Progressing: '#f59e0b',
  Failed: '#ef4444',
  NotDeployed: '#9ca3af',
};
// text-safe variants, [light, dark]
const TEXT: Record<Status, [string, string]> = {
  Ready: ['#047857', '#34d399'],
  Progressing: ['#92400e', '#fbbf24'],
  Failed: ['#b91c1c', '#f87171'],
  NotDeployed: ['#4b5563', '#a3adc2'],
};
const STATUS_LABEL: Record<Status, string> = {
  Ready: 'Ready',
  Progressing: 'Progressing',
  Failed: 'Failed',
  NotDeployed: 'Not deployed',
};

export const ann = (e: Entity, k: string) => e.metadata.annotations?.[A + k];
export const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const entityLink = (e: Entity) =>
  `/catalog/${e.metadata.namespace ?? 'default'}/${e.kind.toLowerCase()}/${
    e.metadata.name
  }`;
export const deployLink = (c: Entity) => `${entityLink(c)}/deploy`;
export const guardrailsLink = (n: Entity) => `${entityLink(n)}/guardrails`;
export const isManaged = (e: Entity) =>
  e.metadata.labels?.['openchoreo.io/managed'] === 'true';

export const parseJson = <T,>(raw?: string): T | undefined => {
  try {
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

// "development=v1.4.2:Ready,staging=v1.4.1:Ready" -> { development: {...}, ... }
export const parseDeployments = (raw?: string) => {
  const out: Record<string, EnvInfo> = {};
  for (const part of (raw ?? '').split(',')) {
    const [env, rest] = part.trim().split('=');
    if (!env || !rest) continue;
    const i = rest.lastIndexOf(':');
    const status = (i < 0 ? rest : rest.slice(i + 1)) as Status;
    out[env.trim()] = {
      version: i < 0 ? undefined : rest.slice(0, i),
      status: Object.hasOwn(DOT, status) ? status : 'NotDeployed',
    };
  }
  return out;
};

// The simple annotation gives version+status; environment-details adds the rest.
export const envInfo = (c: Entity, env: string): EnvInfo => {
  const base = parseDeployments(ann(c, 'deployments'))[env];
  const det = parseJson<Record<string, Partial<EnvInfo>>>(
    ann(c, 'environment-details'),
  )?.[env];
  const x: EnvInfo = { ...(base ?? { status: 'NotDeployed' }), ...det };
  return x;
};

export const useStyles = makeStyles(theme => {
  const dark = theme.palette.type === 'dark';
  const indigo = dark ? '#8fa0ea' : '#5568c4';
  const line = theme.palette.divider;
  const focus = {
    outline: `2px solid ${dark ? '#7FA8FF' : '#3B5BDB'}`,
    outlineOffset: 2,
  };
  return {
    chipText: { color: dark ? '#c3ccff' : '#34408f' },
    indigo: { color: indigo },
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
      color: theme.palette.text.primary,
      textDecoration: 'none',
      '&:hover': {
        borderColor: theme.palette.primary.main,
        boxShadow: theme.shadows[2],
        textDecoration: 'none',
      },
      '&:focus-visible': focus,
    },
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
      textAlign: 'left',
      font: 'inherit',
      color: theme.palette.text.primary,
      cursor: 'pointer',
      display: 'block',
      position: 'relative',
      '&:hover': {
        borderColor: theme.palette.primary.main,
        boxShadow: theme.shadows[3],
        transform: 'translateY(-1px)',
      },
      '&:focus-visible': focus,
    },
    envChevron: {
      position: 'absolute',
      right: 2,
      top: 6,
      fontSize: 18,
      color: theme.palette.text.secondary,
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
      fontSize: 13,
      marginTop: 2,
    },
    dot: {
      display: 'inline-block',
      width: 9,
      height: 9,
      borderRadius: '50%',
      flexShrink: 0,
      marginRight: 6,
    },
    arrow: {
      alignSelf: 'center',
      fontSize: 16,
      color: theme.palette.text.secondary,
    },
    drawer: { width: 420, maxWidth: '100vw', padding: theme.spacing(2, 3) },
    dl: {
      display: 'grid',
      gridTemplateColumns: '110px 1fr',
      gap: theme.spacing(1, 2),
      margin: theme.spacing(2, 0),
      '& dt': { color: theme.palette.text.secondary, fontSize: 13 },
      '& dd': { margin: 0, overflowWrap: 'anywhere', fontSize: 14 },
    },
    reason: {
      padding: theme.spacing(1, 1.5),
      borderLeft: `4px solid`,
      background: dark ? 'rgba(255,255,255,0.05)' : '#f1f4fa',
      fontSize: 13,
      margin: theme.spacing(1, 0),
    },
  };
});

const useTextColor = () => {
  const dark = useTheme().palette.type === 'dark';
  return (st: Status) => TEXT[st][dark ? 1 : 0];
};

export const Dash = () => <span aria-label="not available">—</span>;

export const StatusText = ({ s }: { s: Status }) => {
  const color = useTextColor()(s);
  return <span style={{ color, fontWeight: 600 }}>{STATUS_LABEL[s]}</span>;
};

export const Dot = ({ s }: { s: Status }) => (
  <span
    aria-hidden
    className={useStyles().dot}
    style={{ background: DOT[s] }}
  />
);

export const NsChip = ({ ns }: { ns: Entity }) => (
  <Link className={useStyles().nsChip} to={guardrailsLink(ns)}>
    {ann(ns, 'namespace') ?? ns.metadata.name}
    <ChevronRightIcon style={{ fontSize: 16 }} />
  </Link>
);

// Per-environment cells. With onSelect each cell is a button; without it,
// a link to the component's Deploy tab.
export const Strip = ({
  c,
  onSelect,
}: {
  c: Entity;
  onSelect?: (c: Entity, env: string) => void;
}) => {
  const classes = useStyles();
  const textColor = useTextColor();
  return (
    <div className={classes.pipeline}>
      {ENVS.map((env, i) => {
        const x = envInfo(c, env);
        const body = (
          <>
            <div className={classes.envName}>{env}</div>
            <div className={classes.envStatus}>
              <Dot s={x.status} />
              <strong>{x.version ?? '—'}</strong>
            </div>
            <span style={{ fontSize: 12, color: textColor(x.status) }}>
              {STATUS_LABEL[x.status]}
            </span>
            <ChevronRightIcon className={classes.envChevron} />
          </>
        );
        const name = `${c.metadata.name} ${env}: ${STATUS_LABEL[x.status]}`;
        return (
          <Fragment key={env}>
            {i > 0 && <ArrowForwardIcon className={classes.arrow} />}
            {onSelect ? (
              <button
                type="button"
                className={classes.env}
                aria-label={`${name}, show details`}
                onClick={() => onSelect(c, env)}
              >
                {body}
              </button>
            ) : (
              <Link
                className={classes.env}
                to={deployLink(c)}
                aria-label={`${name}, open Deploy tab`}
              >
                {body}
              </Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export const fmtDate = (iso?: string) => {
  const d = iso ? new Date(iso) : undefined;
  if (!d || isNaN(+d)) return undefined;
  const t = d.toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });
  return `${t} UTC`;
};

// Used by the drawer and by the Deploy tab cards.
export const EnvFacts = ({ c, env }: { c: Entity; env: string }) => {
  const classes = useStyles();
  const textColor = useTextColor();
  const x = envInfo(c, env);
  let endpoint: React.ReactNode;
  if (x.endpoint) {
    endpoint = (
      <a href={x.endpoint} target="_blank" rel="noreferrer">
        {x.endpoint}
      </a>
    );
  } else if (x.status !== 'NotDeployed') {
    endpoint = 'Internal, no public endpoint';
  }
  const rows: [string, React.ReactNode][] = [
    ['Version', x.version],
    ['Image', x.image && <code>{x.image}</code>],
    ['Replicas', x.replicas],
    ['Endpoint', endpoint],
    ['Release', x.release && <code>{x.release}</code>],
    ['Deployed at', fmtDate(x.deployedAt)],
    ['Deployed by', x.deployedBy],
  ];
  return (
    <>
      <Typography component="div">
        <Dot s={x.status} />
        <StatusText s={x.status} />
      </Typography>
      {x.reason && (
        <div
          className={classes.reason}
          style={{ borderLeftColor: textColor(x.status) }}
        >
          {x.reason}
        </div>
      )}
      <dl className={classes.dl}>
        {rows.map(([k, v]) => (
          <Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v ?? <Dash />}</dd>
          </Fragment>
        ))}
      </dl>
    </>
  );
};

// Returns [open, element]; render the element once.
export const useEnvDrawer = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [sel, setSel] = useState<{ c: Entity; env: string }>();
  const [open, setOpen] = useState(false);
  const element = (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      ModalProps={{ keepMounted: false }}
    >
      {sel && (
        <div
          className={classes.drawer}
          role="dialog"
          aria-label={`${sel.c.metadata.name} ${sel.env} details`}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Typography variant="overline" color="textSecondary">
                {label(sel.env)}
              </Typography>
              <Typography variant="h5">
                {sel.c.metadata.title ?? sel.c.metadata.name}
              </Typography>
            </div>
            <IconButton aria-label="Close" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <EnvFacts c={sel.c} env={sel.env} />
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setOpen(false);
              navigate(deployLink(sel.c));
            }}
          >
            Open Deploy tab
          </Button>
        </div>
      )}
    </Drawer>
  );
  return [
    (c: Entity, env: string) => {
      setSel({ c, env });
      setOpen(true);
    },
    element,
  ] as const;
};

export const PromoteButton = ({ next }: { next: string }) => (
  <Tooltip title="Promotion is switched off on this read-only demo">
    <span
      role="button"
      aria-disabled="true"
      tabIndex={0}
      style={{ display: 'inline-block' }}
    >
      <Button
        variant="outlined"
        size="small"
        style={{ maxWidth: 120 }}
        disabled
        endIcon={<ArrowForwardIcon />}
      >
        Promote to {next}
      </Button>
    </span>
  </Tooltip>
);
