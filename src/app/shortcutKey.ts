import { IS_APPLE } from '../constants/os';

// 禁用DevTools快捷键
window.addEventListener(
  'keydown',
  (e) => {
    if (e.primaryKey && e.shiftKey && e.code === 'KeyI') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  },
  true,
);

Object.defineProperty(KeyboardEvent.prototype, 'primaryKey', {
  get(this) {
    return IS_APPLE ? this.metaKey : this.ctrlKey;
  },
});
