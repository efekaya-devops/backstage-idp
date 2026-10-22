import useAsync from 'react-use/lib/useAsync';
import { List, ListItem, ListItemText, makeStyles } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { WidgetCard } from './WidgetCard';

// Hide the per-kind "Manage"/"edit" helper templates the same way the /create
// browse list does, so this shows the real golden paths only.
const HIDDEN_TAGS = ['manage', 'edit'];

// Five fixed-height rows scroll inside the card and snap, so none is cut mid-row.
const ROW = 60;
const useStyles = makeStyles({
  list: {
    maxHeight: ROW * 5,
    overflowY: 'auto',
    scrollSnapType: 'y mandatory',
  },
  row: { height: ROW, scrollSnapAlign: 'start' },
});

/**
 * Templates available in the catalog. Each row deep-links into the
 * scaffolder wizard for that template so a repeat self-service action is one
 * click from the landing page.
 */
export function TemplatesWidget() {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: { kind: 'Template' },
      fields: [
        'kind',
        'metadata.name',
        'metadata.namespace',
        'metadata.title',
        'metadata.tags',
        'spec.type',
      ],
    });
    return items.filter(
      t => !(t.metadata.tags ?? []).some(tag => HIDDEN_TAGS.includes(tag)),
    );
  }, []);

  return (
    <WidgetCard
      title="Templates"
      loading={loading}
      error={error}
      empty={!loading && !error && (value?.length ?? 0) === 0}
      emptyText="No software templates registered yet."
      deepLink={{ title: 'All templates', link: '/create' }}
    >
      <List dense disablePadding className={classes.list}>
        {value?.map(t => {
          const ns = t.metadata.namespace ?? 'default';
          return (
            <ListItem
              key={`${ns}/${t.metadata.name}`}
              disableGutters
              className={classes.row}
            >
              <ListItemText
                primary={
                  <Link to={`/create/templates/${ns}/${t.metadata.name}`}>
                    {t.metadata.title ?? t.metadata.name}
                  </Link>
                }
                secondary={t.spec?.type as string | undefined}
              />
            </ListItem>
          );
        })}
      </List>
    </WidgetCard>
  );
}
