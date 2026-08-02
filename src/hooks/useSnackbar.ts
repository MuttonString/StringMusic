import { useContext } from 'react';
import { GlobalContext } from '../components/GlobalProvider';

/**
 * 提供一个函数用于弹出Snackbar。
 */
export default function useSnackbar() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useSnackbar must be used within GlobalProvider');
  }

  return context.snackbar.current!;
}
