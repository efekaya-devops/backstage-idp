import { ReactNode } from 'react';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  // Keeps every widget the same height in a row and scrolls long lists inside
  // the card instead of pushing the grid around.
  body: {
    minHeight: 180,
    maxHeight: 320,
    overflowY: 'auto',
  },
});

export interface WidgetCardProps {
  title: string;
  /** Optional footer link, e.g. "View all". */
  deepLink?: { title: string; link: string };
  loading?: boolean;
  error?: Error;
  /** Shown (instead of children) when there is no data and no error. */
  empty?: boolean;
  emptyText?: string;
  children: ReactNode;
}

/**
 * Shared shell for every dashboard widget. Centralises the loading / error /
 * empty states so each widget only has to describe its data and its rows, and
 * so the whole widget row stays visually consistent.
 */
export function WidgetCard({
  title,
  deepLink,
  loading,
  error,
  empty,
  emptyText = 'Nothing to show yet.',
  children,
}: WidgetCardProps) {
  const classes = useStyles();

  let body: ReactNode;
  if (loading) {
    body = <Progress />;
  } else if (error) {
    body = <ResponseErrorPanel error={error} />;
  } else if (empty) {
    body = (
      <Box py={2}>
        <Typography variant="body2" color="textSecondary">
          {emptyText}
        </Typography>
      </Box>
    );
  } else {
    body = children;
  }

  return (
    <InfoCard title={title} variant="gridItem" deepLink={deepLink}>
      <div className={classes.body}>{body}</div>
    </InfoCard>
  );
}
