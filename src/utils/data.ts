import { decompressSync, deflateSync, strFromU8, strToU8 } from 'fflate';

/**
 * 获取长度20的只由数字和英文字母组成的随机key
 */
export function getRandomKey() {
  Array.from(
    { length: 20 },
    () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
        crypto.getRandomValues(new Uint8Array(1))[0] % 62
      ],
  ).join('');
}

/**
 * 为传入的数据生成传输安全的SHA-256哈希字符串
 */
export async function getHash(data: string) {
  const buffer = await crypto.subtle.digest('SHA-256', strToU8(data));
  return btoa(strFromU8(new Uint8Array(buffer), true))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * 将数据压缩为Base64字符串
 */
export function compress(data: {}) {
  const compressed = deflateSync(strToU8(JSON.stringify(data)), { level: 9 });
  return btoa(strFromU8(compressed, true));
}

/**
 * 将Base64字符串解压为原始数据
 */
export function decompress(base64: string) {
  const decompressed = decompressSync(strToU8(atob(base64), true));
  return JSON.parse(strFromU8(decompressed));
}
