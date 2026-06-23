import { useContext } from 'react';
import { DetailHistoryContext } from '../components/DetailHistoryProvider';

/**
 * 包含图标、标题等信息的详细路由历史记录。请使用该hook提供的路由跳转函数，以防止历史记录错乱。
 */
export default function useDetailHistory() {
  const context = useContext(DetailHistoryContext);
  if (!context) {
    throw new Error(
      'useDetailHistory must be used within DetailHistoryProvider',
    );
  }

  return context;
}
