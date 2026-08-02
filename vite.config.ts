import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr({ svgrOptions: { svgo: false } })],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
    proxy: {
      '/_': {
        changeOrigin: true,
        target: 'https://127.0.0.1/',
        secure: false,
        rewrite: (path) => path.replace(/^\/_https?:\/\/[^/]+/, ''),
        configure: (proxy, options) => {
          // @ts-ignore
          proxy.on('proxyReq', (_, req) => {
            const target = req.originalUrl.match(/^\/_(https?:\/\/[^/]+)/)[1];
            options.target = target;
          });
        },
      },
    },
  },
});
