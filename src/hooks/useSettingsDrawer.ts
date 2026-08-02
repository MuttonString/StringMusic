import { useContext } from 'react';
import { GlobalContext } from '../components/GlobalProvider';

/**
 * 提供一个函数用于弹出设置Drawer。
 */
export default function useSettingsDrawer() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useSettingsDrawer must be used within GlobalProvider');
  }

  return context.drawer.current!;
}
