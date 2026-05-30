import { platform } from '@tauri-apps/plugin-os';

const KEY_ABBR: { [key: string]: string } = {
  Up: '↑',
  Down: '↓',
  Left: '←',
  Right: '→',
  Windows: 'Win',
  Delete: 'Del',
  Pgup: 'PgUp',
  Pageup: 'PgUp',
  Pgdown: 'PgDn',
  Pagedown: 'PgDn',
  Pgdn: 'PgDn',
  Backspace: 'BackSpace',
};

const KEY_MAC: { [key: string]: string } = {
  Ctrl: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  Win: '⌘',
  Esc: '⎋',
  Tab: '⇥',
  BackSpace: '⌫',
  Enter: '⏎',
  '↑': '▲',
  '↓': '▼',
  '←': '◀',
  '→': '▶',
};

/**
 * 展示包含空格和括号的快捷键描述，多个键之间自动拼接加号，修饰键的描述因系统而异
 * @param text 描述性文本，如“复制”
 * @param keys 以Windows系统为准的按键名，如“'ctrl', 'c'”
 * @returns 如“复制 (Ctrl+C)”格式的文本
 */
export default function showShortcutKey(text: string, ...keys: string[]) {
  const os = platform();

  return `${text}${text ? ' ' : ''}(${keys
    .map((key) => {
      let str = key[0].toUpperCase() + key.slice(1).toLowerCase();
      str = KEY_ABBR[str] || str;

      if (os === 'windows') {
        return str;
      }

      if (['macos', 'ios'].includes(os)) {
        return KEY_MAC[str] || str;
      }

      if (str === 'Win') {
        return 'Super';
      }
      return str;
    })
    .join('+')})`;
}
