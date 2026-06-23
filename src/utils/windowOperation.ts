import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Effect } from '@tauri-apps/api/window';
import { BlurEffect } from '../types/settings';

/**
 * 更改窗口标题
 */
export async function changeTitle(title: string) {
  try {
    await getCurrentWebviewWindow().setTitle(title);
  } catch (err) {
    console.error('Setting window title failed: ' + err);
  }
}

/**
 * 更改窗口模糊效果
 */
export async function setBlurEffect(effect?: BlurEffect | null) {
  const win = getCurrentWebviewWindow();
  const body = document.body;

  try {
    if (typeof effect !== 'number') {
      body.classList.remove('transparent-bg');
      await new Promise((resolve) => setTimeout(resolve, 250));
      await win.clearEffects();
      return;
    }

    switch (effect) {
      case BlurEffect.Blur:
        await win.setEffects({
          effects: [Effect.Blur],
        });
        break;
      case BlurEffect.Acrylic:
        await win.setEffects({
          effects: [Effect.Acrylic],
        });
        break;
      case BlurEffect.Mica:
        await win.setEffects({
          effects: [Effect.Mica],
        });
        break;
      case BlurEffect.Vibrancy:
        await win.setEffects({
          effects:
            win.label === 'main'
              ? [Effect.Sidebar]
              : [Effect.UnderWindowBackground, Effect.Sidebar],
        });
    }
    body.classList.add('transparent-bg');
  } catch (err) {
    console.error('Setting window effect failed: ' + err);
  }
}
