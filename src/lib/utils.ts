/**
 * Simple className utility function
 * Combines multiple class names and filters out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
