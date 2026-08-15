import { invoke } from '@tauri-apps/api/core';
import { type } from '@tauri-apps/plugin-os';
import { KEY_ABBR, KEY_MAC } from '../constants/keys';
import { IS_APPLE } from '../constants/os';
import { KeyCode } from '../types/keyCode';

/**
 * 展示包含空格和括号的快捷键描述，非Mac系统的多个键之间自动拼接加号，修饰键的描述因系统而异
 * @param text 描述性文本，如“粘贴”
 * @param keys 按键名，如“KeyCode.Ctrl, 'V'”
 * @returns 如“粘贴 (Ctrl+V)”“粘贴 ⌘V”格式的文本
 */
export function showShortcutKey(text: string, ...keys: string[]) {
  if (IS_APPLE) {
    return `${text}${text ? ' ' : ''}${keys
      .map((key) => {
        return KEY_MAC[key] || key;
      })
      .join('')}`;
  }

  return `${text}${text ? ' ' : ''}(${keys
    .map((key) => {
      if (key === KeyCode.Meta) {
        return type() === 'windows' ? 'Win' : 'Super';
      }
      return KEY_ABBR[key] || key;
    })
    .join('+')})`;
}

export function listenDevKey(e: KeyboardEvent) {
  if ((e.primaryKey && e.shiftKey && e.code === 'KeyI') || e.key === 'F12') {
    invoke('open_devtools');
  } else if ((e.primaryKey && e.code === 'KeyR') || e.key === 'F5') {
    location.reload();
  }
}
