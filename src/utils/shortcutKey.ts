import { type } from '@tauri-apps/plugin-os';

const os = type();
const isMac = ['macos', 'ios'].includes(os);

Object.defineProperty(KeyboardEvent.prototype, 'primaryKey', {
  get(this) {
    return isMac ? this.metaKey : this.ctrlKey;
  },
});

export const enum KeyCode {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
  PgUp = 'PageUp',
  PgDown = 'PageDown',
  Home = 'Home',
  End = 'End',
  Enter = 'Enter',
  Alt = 'Alt',
  Ctrl = 'Control',
  Shift = 'Shift',
  Meta = 'Meta',
  Space = ' ',
  Tab = 'Tab',
  Esc = 'Escape',
  Del = 'Delete',
  Backspace = 'Backspace',
}

/**
 * 删除键，在Mac下改为Backspace
 */
export const DELETE_KEY = isMac ? KeyCode.Backspace : KeyCode.Del;

/**
 * 主修饰键，在Windows/Linux下为Ctrl，在Mac下为Cmd
 */
export const PRIMARY_MODIFIER_KEY = isMac ? KeyCode.Meta : KeyCode.Ctrl;

const KEY_ABBR: { [key: string]: string } = {
  [KeyCode.Up]: '↑',
  [KeyCode.Down]: '↓',
  [KeyCode.Left]: '←',
  [KeyCode.Right]: '→',
  [KeyCode.Ctrl]: 'Ctrl',
  [KeyCode.Del]: 'Del',
  [KeyCode.PgUp]: 'PgUp',
  [KeyCode.PgDown]: 'PgDn',
} as const;

const KEY_MAC: { [key: string]: string } = {
  [KeyCode.Ctrl]: '⌃',
  [KeyCode.Alt]: '⌥',
  [KeyCode.Shift]: '⇧',
  [KeyCode.Meta]: '⌘',
  [KeyCode.Esc]: '⎋',
  [KeyCode.Tab]: '⇥',
  [KeyCode.Backspace]: '⌫',
  [KeyCode.Enter]: '⏎',
  [KeyCode.Up]: '▲',
  [KeyCode.Down]: '▼',
  [KeyCode.Left]: '◀',
  [KeyCode.Right]: '▶',
} as const;

/**
 * 展示包含空格和括号的快捷键描述，非Mac系统的多个键之间自动拼接加号，修饰键的描述因系统而异
 * @param text 描述性文本，如“粘贴”
 * @param keys 按键名，如“KeyCode.Ctrl, 'V'”
 * @returns 如“粘贴 (Ctrl+V)”“粘贴 ⌘V”格式的文本
 */
export function showShortcutKey(text: string, ...keys: string[]) {
  if (isMac) {
    return `${text}${text ? ' ' : ''}${keys
      .map((key) => {
        return KEY_MAC[key] || key;
      })
      .join('')}`;
  }

  return `${text}${text ? ' ' : ''}(${keys
    .map((key) => {
      if (key === KeyCode.Meta) {
        return os === 'windows' ? 'Win' : 'Super';
      }
      return KEY_ABBR[key] || key;
    })
    .join('+')})`;
}
