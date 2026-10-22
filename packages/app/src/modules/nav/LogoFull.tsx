import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { makeStyles } from '@material-ui/core';
import { Iceberg } from './Iceberg';

const useStyles = makeStyles({
  root: { display: 'flex', alignItems: 'center', gap: 10 },
  name: {
    color: '#EAF2FF',
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.2,
    whiteSpace: 'nowrap',
  },
});

// The product name comes from app.title, so a customer install rebrands by config.
export const LogoFull = () => {
  const classes = useStyles();
  // sidebar is narrow: "IDP — Internal Developer Platform" shows as "IDP"
  const title = (
    useApi(configApiRef).getOptionalString('app.title') ?? 'Platform'
  ).split(' — ')[0];

  return (
    <div className={classes.root}>
      <Iceberg height={30} />
      <span className={classes.name}>{title}</span>
    </div>
  );
};
