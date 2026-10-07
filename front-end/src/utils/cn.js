/**
 * Class name helper utility for conditional CSS classes
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
