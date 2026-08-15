import { useEffect, useState } from 'react';

/**
 * 判断窗口宽度是否不小于传入值
 */
export default function useWidthQuery(width: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(width >= ${width})`);
    setMatches(media.matches);

    const fn = () => setMatches(media.matches);
    media.addEventListener('change', fn);

    return () => media.removeEventListener('change', fn);
  }, [width]);

  return matches;
}
