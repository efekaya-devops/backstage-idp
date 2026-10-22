import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { AppRootWrapperBlueprint } from '@backstage/plugin-app-react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
} from '@material-ui/core';

import { CREATE_BLOCKED_EVENT, demoScaffolderModule } from './scaffolderApi';

const KEY = 'demo-notice-seen';

// storage can throw (private mode, blocked cookies): then it shows once per page load
const seen = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
};

const DemoNotice = ({ children }: { children: ReactNode }) => {
  const readOnly = useApi(configApiRef).getOptionalBoolean('app.readOnlyDemo');
  const [open, setOpen] = useState(() => !!readOnly && !seen());
  const [blocked, setBlocked] = useState(false);
  const [values, setValues] = useState<unknown>();
  const navigate = useNavigate();
  const close = () => {
    markSeen();
    setOpen(false);
  };
  useEffect(() => {
    const onBlocked = (e: Event) => {
      setValues((e as CustomEvent).detail?.values);
      setBlocked(true);
      setOpen(true);
    };
    window.addEventListener(CREATE_BLOCKED_EVENT, onBlocked);
    return () => window.removeEventListener(CREATE_BLOCKED_EVENT, onBlocked);
  }, []);
  return (
    <>
      {children}
      <Dialog
        open={open}
        onClose={close}
        aria-labelledby="demo-notice-title"
        aria-describedby="demo-notice-body"
      >
        <DialogTitle id="demo-notice-title">
          {blocked
            ? 'Nothing was created — this is a demo'
            : "You're viewing a read-only demo"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="demo-notice-body" color="textPrimary">
            {blocked
              ? "You just walked through a real self-service template. On a live platform, clicking Create would now render the files and open a pull request (or a new repository) for the platform team's GitOps flow. On this public demo, running templates is switched off, so no repository, pull request or cloud resource is made."
              : 'This is a live demo of an Internal Developer Platform. Browse the catalog, the templates and the applications freely — creating, editing or deleting anything is switched off, so templates can be opened but not run.'}
          </DialogContentText>
          <DialogContentText component="div" variant="body2">
            <Link href="https://demo.efekaya.io" target="_blank" rel="noopener">
              How it works
            </Link>
            {' · '}
            <Link
              href="https://efekaya.io/#contact"
              target="_blank"
              rel="noopener"
            >
              Contact
            </Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {blocked && (
            <Button
              onClick={() => {
                close();
                setBlocked(false);
                navigate('/create');
              }}
              color="primary"
            >
              Browse more templates
            </Button>
          )}
          <Button
            onClick={() => {
              close();
              setBlocked(false);
              // the wizard stays stuck in "creating" after the rejected submit, so
              // reload it with the entered values (the stepper reads ?formData=)
              if (values) {
                const url = new URL(window.location.href);
                url.searchParams.set('formData', JSON.stringify(values));
                window.location.assign(url.toString());
              }
            }}
            color="primary"
            variant="contained"
            // ripple isn't mounted yet on a fresh load; pulsating it crashes the app
            disableFocusRipple
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          >
            {blocked ? 'Back to the form' : 'Got it'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const demoNoticeWrapper = AppRootWrapperBlueprint.make({
  params: { component: DemoNotice },
});

export const demoNoticeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [demoNoticeWrapper],
});

export { demoScaffolderModule };
