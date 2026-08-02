import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalProvider from './components/GlobalProvider';
import './utils/anchorElement';
import './utils/i18n';
// import './utils/log';
import router from './utils/router';
import './utils/shortcutKey';
import './utils/titlebar';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <React.StrictMode>
      <GlobalProvider>
        <RouterProvider router={router} />
      </GlobalProvider>
    </React.StrictMode>
  </ErrorBoundary>,
);
