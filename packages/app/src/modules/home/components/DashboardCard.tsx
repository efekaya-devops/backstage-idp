import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  // Fills the grid cell so every card in a row is the same height regardless
  // of description length.
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: theme.transitions.create(['transform', 'box-shadow'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[6],
    },
  },
  // Grows to absorb the slack so the CardActions row lines up across cards.
  content: {
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  icon: {
    display: 'flex',
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main,
  },
  actions: {
    padding: theme.spacing(2),
    paddingTop: 0,
  },
}));

export interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon?: ReactNode;
  /** Internal SPA route (react-router). */
  to?: string;
  /** External link. Used when `to` is not set. */
  href?: string;
}

/**
 * The single card primitive every dashboard section is built from. Keeping the
 * layout (equal height, hover lift, icon + title header, bottom-aligned action)
 * in one place is what lets the sections stay declarative arrays of data.
 */
export function DashboardCard({
  title,
  description,
  buttonText,
  icon,
  to,
  href,
}: DashboardCardProps) {
  const classes = useStyles();

  const buttonProps = to
    ? { component: RouterLink, to }
    : { component: 'a' as const, href, target: '_blank', rel: 'noopener' };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <div className={classes.header}>
          {icon && <span className={classes.icon}>{icon}</span>}
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </div>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions className={classes.actions}>
        <Button
          {...buttonProps}
          variant="contained"
          color="primary"
          size="small"
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
}
