export function log (message: string): void {
  const date: Date = new Date();
  console.log(`[ ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} ] ${message}`);
}

export function logParts (parts: any[]): void {
  const date: Date = new Date();
  console.log(`[ ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} ]`);
  console.log(...parts);
}

export function errorParts (parts: any[]): void {
  const date: Date = new Date();
  console.error(`[ ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} ] Error:`);
  console.error(...parts);
}

export function error (message: string): void {
  const date: Date = new Date();
  console.error(`[ ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()} ] Error: ${message}`);
}
