import { Grid } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import AppsIcon from '@material-ui/icons/Apps';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { DashboardSection } from './DashboardSection';
import { DashboardCard, DashboardCardProps } from './DashboardCard';

const actions: DashboardCardProps[] = [
  {
    title: 'Create',
    description:
      'Start from a template: a service, a cloud resource, or a full application.',
    buttonText: 'Browse templates',
    to: '/create',
    icon: <AddCircleOutlineIcon />,
  },
  {
    title: 'Catalog',
    description:
      'Every component, API, system and resource, with owners and docs.',
    buttonText: 'Open catalog',
    to: '/catalog',
    icon: <LibraryBooksIcon />,
  },
  {
    title: 'Applications',
    description:
      'Projects and components with their deployment status per environment.',
    buttonText: 'View applications',
    to: '/applications',
    icon: <AppsIcon />,
  },
  {
    title: 'Docs',
    description: 'Technical documentation published next to the code.',
    buttonText: 'Read docs',
    to: '/docs',
    icon: <MenuBookIcon />,
  },
];

export function QuickActions() {
  return (
    <DashboardSection title="Get started">
      {actions.map(action => (
        <Grid item xs={12} sm={6} md={3} key={action.title}>
          <DashboardCard {...action} />
        </Grid>
      ))}
    </DashboardSection>
  );
}
