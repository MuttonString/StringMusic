import { useEffect, useState } from 'react';

/**
 * 判断系统是否是深色模式
 */
export default function useDarkModeQuery(listen: boolean) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme:dark)');
    setMatches(media.matches);
    if (!listen) return;

    const fn = () => setMatches(media.matches);
    media.addEventListener('change', fn);

    return () => media.removeEventListener('change', fn);
  }, [listen]);

  return matches;
}
