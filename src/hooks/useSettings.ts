import { useContext } from 'react';
import { SettingsContext } from '../components/SettingsProvider';

/**
 * 保存在AppData的config.json内的应用程序全局设置。
 */
export default function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
}
