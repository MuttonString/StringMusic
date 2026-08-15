/**
 * 比较版本号大小，a比b小返回-1，a比b大返回1，相等返回0
 */
export function compareVersion(a: string, b: string) {
  const verA = a.split('.');
  const verB = b.split('.');
  for (let i = 0; i < Math.max(verA.length, verB.length); i++) {
    const numA = Number(verA[i] || 0);
    const numB = Number(verB[i] || 0);
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}
