import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from '../../app/router';
import '../../app/titleBar';
import MainProvider from '../../providers';
import './index.less';

console.info('Creating React DOM...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MainProvider>
    <RouterProvider router={router} />
  </MainProvider>,
);
