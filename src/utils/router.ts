import { createBrowserRouter } from 'react-router';
import App from '../App';
import Error from '../pages/Error';
import Home from '../pages/Home';
import Settings from '../pages/Settings';

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      { index: true, Component: Home },
      {
        path: '/settings',
        Component: Settings,
      },
      {
        path: '*',
        Component: Error,
      },
    ],
  },
]);

export default router;
