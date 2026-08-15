import { createBrowserRouter, Navigate } from 'react-router';
import Layout from '../entries/main/layout';
import AlbumCollection from '../pages/AlbumCollection';
import ArtistCollection from '../pages/ArtistCollection';
import Error from '../pages/Error';
import RouterErrorBoundary from '../pages/ErrorBoundary/router';
import Home from '../pages/Home';
import MVCollection from '../pages/MVCollection';
import MyPlaylist from '../pages/MyPlaylist';
import PlaylistCollection from '../pages/PlaylistCollection';
import Recent from '../pages/Recent';
import Recommendation from '../pages/Recommendaion';
import SongCollection from '../pages/SongCollection';

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Navigate to='home' replace />,
      },
      {
        index: true,
        path: 'home',
        element: <Home />,
      },
      {
        path: 'recommendation',
        element: <Recommendation />,
      },
      {
        path: 'recent',
        element: <Recent />,
      },
      {
        path: 'artistCollection',
        element: <ArtistCollection />,
      },
      {
        path: 'albumCollection',
        element: <AlbumCollection />,
      },
      {
        path: 'mvCollection',
        element: <MVCollection />,
      },
      {
        path: 'songCollection',
        element: <SongCollection />,
      },
      {
        path: 'playlistCollection',
        element: <PlaylistCollection />,
      },
      {
        path: 'myPlaylist',
        element: <MyPlaylist />,
      },
      {
        path: '*',
        element: <Error />,
      },
    ],
  },
]);

export default router;
