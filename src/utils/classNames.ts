/**
 * 组合多个className
 */
export default function classNames(
  ...className: (string | boolean | undefined | null)[]
) {
  return className.filter((v) => v).join(' ');
}
