export function firstUpper(str: string): string {
  return [str.charAt(0).toUpperCase(), str.substring(1)].join('');
}