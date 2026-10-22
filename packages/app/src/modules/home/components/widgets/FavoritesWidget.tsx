import useAsync from 'react-use/lib/useAsync';
import { List, ListItem, ListItemText } from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useStarredEntities,
  EntityRefLink,
} from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { WidgetCard } from './WidgetCard';

/**
 * The signed-in user's starred catalog entities (#357). Starred refs live in
 * the StarredEntitiesApi; we resolve them to entities so each row can show a
 * proper display name and link straight to the entity page.
 */
export function FavoritesWidget() {
  const catalogApi = useApi(catalogApiRef);
  const { starredEntities } = useStarredEntities();
  const refs = [...starredEntities];

  const { value, loading, error } = useAsync(async () => {
    if (refs.length === 0) return [] as Entity[];
    const { items } = await catalogApi.getEntitiesByRefs({ entityRefs: refs });
    return items.filter((e): e is Entity => Boolean(e));
  }, [refs.join(',')]);

  return (
    <WidgetCard
      title="Favorites"
      loading={loading}
      error={error}
      empty={!loading && !error && (value?.length ?? 0) === 0}
      emptyText="Star components and resources to pin them here."
      deepLink={{ title: 'Browse catalog', link: '/catalog' }}
    >
      <List dense disablePadding>
        {value?.map(entity => (
          <ListItem
            key={`${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`}
            disableGutters
          >
            <ListItemText
              primary={<EntityRefLink entityRef={entity} />}
              secondary={entity.spec?.type as string | undefined}
            />
          </ListItem>
        ))}
      </List>
    </WidgetCard>
  );
}
