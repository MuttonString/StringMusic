import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalProvider from './components/GlobalProvider';
import MiniWindow from './pages/MiniWindow';
import './utils/i18n';
import './utils/log';
import './utils/shortcutKey';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <React.StrictMode>
      <GlobalProvider>
        <MiniWindow />
      </GlobalProvider>
    </React.StrictMode>
  </ErrorBoundary>,
);
