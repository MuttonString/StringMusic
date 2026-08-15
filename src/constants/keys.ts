import { KeyCode } from '../types/keyCode';
import { IS_APPLE } from './os';

/**
 * 删除键，在Mac下改为Backspace
 */
export const DELETE_KEY = IS_APPLE ? KeyCode.Backspace : KeyCode.Del;

/**
 * 主修饰键，在Windows/Linux下为Ctrl，在Mac下为Cmd
 */
export const PRIMARY_MODIFIER_KEY = IS_APPLE ? KeyCode.Meta : KeyCode.Ctrl;

export const KEY_ABBR: Record<string, string> = {
  [KeyCode.Up]: '↑',
  [KeyCode.Down]: '↓',
  [KeyCode.Left]: '←',
  [KeyCode.Right]: '→',
  [KeyCode.Ctrl]: 'Ctrl',
  [KeyCode.Del]: 'Del',
  [KeyCode.Esc]: 'Esc',
  [KeyCode.PgUp]: 'PgUp',
  [KeyCode.PgDown]: 'PgDn',
} as const;

export const KEY_MAC: Record<string, string> = {
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
