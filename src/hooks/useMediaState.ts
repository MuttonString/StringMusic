import { useContext } from 'react';
import { GlobalContext } from '../components/GlobalProvider';

/**
 * 提供一个函数用于获取音乐状态。
 */
export default function useMusicState() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useMusicState must be used within GlobalProvider');
  }

  return context.musicState;
}
