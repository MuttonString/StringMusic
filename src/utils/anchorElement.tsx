import { openUrl } from '@tauri-apps/plugin-opener';

// 让所有a标签通过tauri提供的函数打开url
window.addEventListener(
  'click',
  (e) => {
    const link = (e.target as HTMLElement | null)?.closest('a');
    if (!link) return;
    const href = link.href;
    if (!href) return;

    e.preventDefault();
    openUrl(href).catch((err) => {
      console.error('Open url failed: ', err);
    });
  },
  true,
);
