import { useContext } from 'react';
import { DetailHistoryContext } from '../components/DetailHistoryProvider';

export default function useDetailHistory() {
  const context = useContext(DetailHistoryContext);
  if (!context) {
    throw new Error(
      'useDetailHistory must be used within DetailHistoryProvider',
    );
  }

  return context;
}
