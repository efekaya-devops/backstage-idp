import { ReactNode } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  title: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
}));

export interface DashboardSectionProps {
  title: string;
  children: ReactNode;
}

/**
 * A titled row of cards. Each child is expected to be a Grid item so the row
 * flows responsively; the container spacing is set here so every section is
 * consistent.
 */
export function DashboardSection({ title, children }: DashboardSectionProps) {
  const classes = useStyles();
  return (
    <Grid item xs={12}>
      <Typography variant="h5" component="h2" className={classes.title}>
        {title}
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        {children}
      </Grid>
    </Grid>
  );
}
