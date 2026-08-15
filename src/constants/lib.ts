import { getLangs } from '../utils/lang';

export const OPEN_SOURCE_LIBRARY = [['TEST', 'https://cn.bing.com']].sort(
  (a, b) => a[0].localeCompare(b[0], getLangs()),
) as [name: string, url: string][];
